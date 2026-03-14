/**
 * scrape-market-pulse
 * 
 * Automated Edge Function that uses Firecrawl to scrape Tucson market data
 * from TWO sources (Redfin primary, Realtor.com secondary) for cross-validation.
 * Also scrapes AZ mortgage rates from Bankrate.
 * 
 * Designed to run on a weekly schedule via pg_cron.
 * Falls back to existing data if both scrapes fail (3-tier resilience).
 */

import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Data sources
const REDFIN_TUCSON_URL = "https://www.redfin.com/city/18510/AZ/Tucson/housing-market";
const REALTOR_TUCSON_URL = "https://www.realtor.com/realestateandhomes-search/Tucson_AZ/overview";
const BANKRATE_AZ_RATES_URL = "https://www.bankrate.com/mortgages/mortgage-rates/arizona/";

interface ParsedMetrics {
  negotiation_gap: number | null;
  days_to_close: number | null;
  median_dom: number | null;
  median_list_price: string | null;
  active_listings: number | null;
  price_cut_pct: number | null;
  source_url: string;
  parse_log: Record<string, unknown>;
}

// ── Shared regex parser ──────────────────────────────────────────
function parseMarketMarkdown(markdown: string, sourceUrl: string): ParsedMetrics {
  const log: Record<string, unknown> = { raw_length: markdown.length };

  // Sale-to-List Ratio
  let negotiationGap: number | null = null;
  const saleToListPatterns = [
    /sale.*?list[^0-9]*(\d{2,3}(?:\.\d+)?)\s*%/i,
    /(\d{2,3}(?:\.\d+)?)\s*%\s*sale.*?list/i,
    /sale[- ]to[- ]list[^%]*?(\d{2,3}(?:\.\d+)?)%/is,
    /(\d{2,3}(?:\.\d+)?)\s*%[^.]*list\s*price/i,
    /(\d{2,3}(?:\.\d+)?)\s*%\s*(?:of\s+)?(?:list|asking)/i,
    /sale.*?list.*?(0\.\d{2,4})/i,
  ];
  for (const pattern of saleToListPatterns) {
    const match = markdown.match(pattern);
    if (match) {
      const raw = parseFloat(match[1]);
      const ratio = raw < 2 ? raw : raw / 100;
      negotiationGap = parseFloat((1 - ratio).toFixed(4));
      log.sale_to_list_raw = match[0];
      log.sale_to_list_ratio = ratio;
      log.sale_to_list_method = 'direct_ratio';
      break;
    }
  }

  // Over/Under List Price format
  if (negotiationGap === null) {
    const overMatch = markdown.match(/over\s+list\s+price[\s\S]{0,20}?(\d{1,3}(?:\.\d+)?)\s*%/i);
    const underMatch = markdown.match(/under\s+list\s+price[\s\S]{0,20}?(\d{1,3}(?:\.\d+)?)\s*%/i);
    if (overMatch) {
      const overPct = parseFloat(overMatch[1]);
      negotiationGap = parseFloat((-overPct / 100).toFixed(4));
      log.sale_to_list_raw = overMatch[0];
      log.sale_to_list_ratio = 1 + overPct / 100;
      log.sale_to_list_method = 'over_list_price';
    } else if (underMatch) {
      const underPct = parseFloat(underMatch[1]);
      negotiationGap = parseFloat((underPct / 100).toFixed(4));
      log.sale_to_list_raw = underMatch[0];
      log.sale_to_list_ratio = 1 - underPct / 100;
      log.sale_to_list_method = 'under_list_price';
    }
  }

  // Median Days on Market
  let daysOnMarket: number | null = null;
  const domPatterns = [
    /median\s+days?\s+on\s+market[^0-9]*(\d{1,3})/i,
    /days?\s+on\s+market[^0-9]*(\d{1,3})/i,
    /(\d{1,3})\s+(?:median\s+)?days?\s+on\s+market/i,
    /average\s+days?\s+on\s+market[^0-9]*(\d{1,3})/i,
    /(\d{1,3})\s+(?:average\s+)?days?\s+(?:on\s+)?(?:the\s+)?market/i,
  ];
  for (const pattern of domPatterns) {
    const match = markdown.match(pattern);
    if (match) {
      const val = parseInt(match[1], 10);
      if (val > 0 && val < 365) {
        daysOnMarket = val;
        log.days_on_market_raw = match[0];
        break;
      }
    }
  }

  const daysToClose = daysOnMarket !== null ? daysOnMarket + 30 : null;
  log.days_to_close_calculated = daysToClose;

  // Median List Price
  let medianListPrice: string | null = null;
  const pricePatterns = [
    /median\s+(?:list|sale|home|listing)\s+price[^$]*\$([\d,]+(?:K|M)?)/i,
    /\$([\d,]+(?:K|M)?)\s+median\s+(?:list|sale|home)/i,
    /(?:list|sale)\s+price\s+\$([\d,]+(?:K|M)?)/i,
    /median\s+(?:sold|closing)\s+price[^$]*\$([\d,]+(?:K|M)?)/i,
  ];
  for (const p of pricePatterns) {
    const m = markdown.match(p);
    if (m) {
      let raw = m[1].replace(/,/g, '');
      if (raw.endsWith('K')) raw = String(parseFloat(raw) * 1000);
      if (raw.endsWith('M')) raw = String(parseFloat(raw) * 1000000);
      medianListPrice = `$${Number(raw).toLocaleString()}`;
      log.median_list_price_raw = m[0];
      break;
    }
  }

  // Active Listings
  let activeListings: number | null = null;
  const listingPatterns = [
    /([\d,]+)\s+homes?\s+for\s+sale/i,
    /active\s+listings?[:\s]+([\d,]+)/i,
    /([\d,]+)\s+active\s+listings?/i,
    /([\d,]+)\s+homes?\s+(?:available|listed)/i,
    /([\d,]+)\s+properties?\s+(?:for\s+sale|available)/i,
  ];
  for (const p of listingPatterns) {
    const m = markdown.match(p);
    if (m) {
      const raw = parseInt(m[1].replace(/,/g, ''), 10);
      if (!isNaN(raw) && raw > 0 && raw < 100000) {
        activeListings = raw;
        log.active_listings_raw = m[0];
        break;
      }
    }
  }

  // Price Cut %
  let priceCutPct: number | null = null;
  const priceCutPatterns = [
    /([\d]+(?:\.\d+)?)\s*%\s+(?:of\s+homes?|of\s+listings?)\s+(?:had|with)\s+(?:a\s+)?price\s+(?:cut|drop|reduction)/i,
    /price\s+(?:cut|drop|reduction)s?[^%]*?([\d]+(?:\.\d+)?)\s*%/i,
    /([\d]+(?:\.\d+)?)\s*%\s+price\s+(?:cut|drop|reduction)/i,
    /price\s+reduced[^%]*?([\d]+(?:\.\d+)?)\s*%/i,
  ];
  for (const p of priceCutPatterns) {
    const m = markdown.match(p);
    if (m) {
      const pct = parseFloat(m[1]);
      if (pct > 0 && pct <= 100) {
        priceCutPct = parseFloat((pct / 100).toFixed(4));
        log.price_cut_raw = m[0];
        break;
      }
    }
  }

  return {
    negotiation_gap: negotiationGap,
    days_to_close: daysToClose,
    median_dom: daysOnMarket,
    median_list_price: medianListPrice,
    active_listings: activeListings,
    price_cut_pct: priceCutPct,
    source_url: sourceUrl,
    parse_log: log,
  };
}

// ── Cross-validation: reconcile two sources ──────────────────────
interface ReconciledData {
  negotiation_gap: number | null;
  days_to_close: number | null;
  median_dom: number | null;
  median_list_price: string | null;
  active_listings: number | null;
  price_cut_pct: number | null;
  reconciliation_log: Record<string, unknown>;
}

function reconcile(primary: ParsedMetrics | null, secondary: ParsedMetrics | null): ReconciledData {
  const log: Record<string, unknown> = {};

  // Helper: pick best value with cross-validation
  function pickNumeric(
    field: string,
    pVal: number | null | undefined,
    sVal: number | null | undefined,
    tolerancePct: number = 0.25 // 25% divergence threshold
  ): number | null {
    if (pVal != null && sVal != null) {
      const avg = (pVal + sVal) / 2;
      const divergence = avg !== 0 ? Math.abs(pVal - sVal) / Math.abs(avg) : 0;
      log[`${field}_primary`] = pVal;
      log[`${field}_secondary`] = sVal;
      log[`${field}_divergence`] = parseFloat(divergence.toFixed(4));

      if (divergence > tolerancePct) {
        log[`${field}_warning`] = `Divergence ${(divergence * 100).toFixed(1)}% exceeds ${(tolerancePct * 100)}% threshold — using primary`;
        return pVal; // Trust primary (Redfin) when sources disagree significantly
      }
      // Within tolerance: use primary (more established data source)
      return pVal;
    }
    // Fallback: whichever is available
    if (pVal != null) { log[`${field}_source`] = 'primary_only'; return pVal; }
    if (sVal != null) { log[`${field}_source`] = 'secondary_only'; return sVal; }
    log[`${field}_source`] = 'none';
    return null;
  }

  const negotiationGap = pickNumeric('negotiation_gap', primary?.negotiation_gap, secondary?.negotiation_gap, 0.5);
  const daysToClose = pickNumeric('days_to_close', primary?.days_to_close, secondary?.days_to_close);
  const medianDom = pickNumeric('median_dom', primary?.median_dom, secondary?.median_dom);
  const priceCutPct = pickNumeric('price_cut_pct', primary?.price_cut_pct, secondary?.price_cut_pct, 0.3);

  // Active listings: higher tolerance (different counting methods)
  const activeListings = pickNumeric('active_listings', primary?.active_listings, secondary?.active_listings, 0.4);

  // Median list price: use whichever is available (string, not numeric reconcile)
  const medianListPrice = primary?.median_list_price ?? secondary?.median_list_price ?? null;

  log.primary_available = primary !== null;
  log.secondary_available = secondary !== null;

  return {
    negotiation_gap: negotiationGap,
    days_to_close: daysToClose,
    median_dom: medianDom,
    median_list_price: medianListPrice,
    active_listings: activeListings,
    price_cut_pct: priceCutPct,
    reconciliation_log: log,
  };
}

// ── Firecrawl scrape helper ──────────────────────────────────────
async function scrapePage(url: string, apiKey: string, label: string): Promise<string | null> {
  try {
    console.log(`[scrape-market-pulse] Scraping ${label}...`);
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error(`[scrape-market-pulse] ${label} scrape failed:`, data.error || res.status);
      return null;
    }

    const md = data.data?.markdown || data.markdown || "";
    console.log(`[scrape-market-pulse] ${label}: ${md.length} chars`);
    return md;
  } catch (err) {
    console.error(`[scrape-market-pulse] ${label} error (non-fatal):`, err);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Admin-only: require x-admin-secret header
  const authHeader = req.headers.get('x-admin-secret');
  if (authHeader !== Deno.env.get('ADMIN_SECRET')) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

  if (!firecrawlKey) {
    console.error("[scrape-market-pulse] FIRECRAWL_API_KEY not configured");
    return new Response(
      JSON.stringify({ ok: false, error: "Firecrawl not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // ── Step 1: Scrape both sources in parallel ──────────────────
    console.log("[scrape-market-pulse] Starting dual-source scrape...");
    const [redfinMd, realtorMd] = await Promise.all([
      scrapePage(REDFIN_TUCSON_URL, firecrawlKey, "Redfin"),
      scrapePage(REALTOR_TUCSON_URL, firecrawlKey, "Realtor.com"),
    ]);

    if (!redfinMd && !realtorMd) {
      return new Response(
        JSON.stringify({ ok: false, error: "Both Redfin and Realtor.com scrapes failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 2: Parse both sources ───────────────────────────────
    const redfinParsed = redfinMd ? parseMarketMarkdown(redfinMd, REDFIN_TUCSON_URL) : null;
    const realtorParsed = realtorMd ? parseMarketMarkdown(realtorMd, REALTOR_TUCSON_URL) : null;

    if (redfinParsed) console.log("[scrape-market-pulse] Redfin parsed:", JSON.stringify(redfinParsed.parse_log));
    if (realtorParsed) console.log("[scrape-market-pulse] Realtor parsed:", JSON.stringify(realtorParsed.parse_log));

    // ── Step 3: Cross-validate and reconcile ─────────────────────
    const reconciled = reconcile(redfinParsed, realtorParsed);
    console.log("[scrape-market-pulse] Reconciliation:", JSON.stringify(reconciled.reconciliation_log));

    // ── Step 4: Build update payload ─────────────────────────────
    const updatePayload: Record<string, unknown> = {
      source_type: "firecrawl_dual_source",
      source_url: REDFIN_TUCSON_URL,
      scrape_log: {
        scraped_at: new Date().toISOString(),
        sources: {
          redfin: redfinParsed ? { available: true, ...redfinParsed.parse_log } : { available: false },
          realtor: realtorParsed ? { available: true, ...realtorParsed.parse_log } : { available: false },
        },
        reconciliation: reconciled.reconciliation_log,
        median_dom: reconciled.median_dom,
        median_list_price: reconciled.median_list_price,
        active_listings: reconciled.active_listings,
        price_cut_pct: reconciled.price_cut_pct,
      },
      last_verified_date: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    };

    if (reconciled.negotiation_gap !== null) {
      updatePayload.negotiation_gap = reconciled.negotiation_gap;
    }
    if (reconciled.days_to_close !== null) {
      updatePayload.days_to_close = reconciled.days_to_close;
    }

    // ── Step 5: Write to DB ──────────────────────────────────────
    const { error: upsertError } = await supabase
      .from("market_pulse_settings")
      .update(updatePayload)
      .eq("market_name", "Tucson_Overall");

    if (upsertError) {
      console.error("[scrape-market-pulse] DB update error:", upsertError);
      return new Response(
        JSON.stringify({ ok: false, error: "Database update failed", detail: upsertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 6: Scrape mortgage rates from Bankrate ──────────────
    let mortgageRate30yr: number | null = null;
    try {
      const rateMd = await scrapePage(BANKRATE_AZ_RATES_URL, firecrawlKey, "Bankrate");
      if (rateMd) {
        const ratePatterns = [
          /30[\s-]*year\s+fixed[^0-9]*?(\d\.\d{1,3})\s*%/i,
          /(\d\.\d{1,3})\s*%\s*[^\n]*30[\s-]*year\s+fixed/i,
          /30[\s-]*yr[^0-9]*?(\d\.\d{1,3})\s*%/i,
          /(\d\.\d{1,3})\s*%\s*[^\n]*30[\s-]*yr/i,
          /current\s+(?:mortgage\s+)?rate[^0-9]*?(\d\.\d{1,3})\s*%/i,
        ];
        for (const p of ratePatterns) {
          const m = rateMd.match(p);
          if (m) {
            const rate = parseFloat(m[1]);
            if (rate >= 3 && rate <= 12) {
              mortgageRate30yr = rate;
              console.log(`[scrape-market-pulse] Parsed 30yr rate: ${rate}%`);
              break;
            }
          }
        }
      }
    } catch (rateErr) {
      console.error("[scrape-market-pulse] Mortgage rate scrape failed (non-fatal):", rateErr);
    }

    // ── Step 7: Merge mortgage rate into scrape_log ──────────────
    if (mortgageRate30yr !== null) {
      const { data: currentRow } = await supabase
        .from("market_pulse_settings")
        .select("scrape_log")
        .eq("market_name", "Tucson_Overall")
        .single();

      const existingLog = (currentRow?.scrape_log as Record<string, unknown>) ?? {};
      await supabase
        .from("market_pulse_settings")
        .update({
          scrape_log: {
            ...existingLog,
            mortgage_rate_30yr: mortgageRate30yr,
            mortgage_rate_source: BANKRATE_AZ_RATES_URL,
            mortgage_rate_scraped_at: new Date().toISOString(),
          },
        })
        .eq("market_name", "Tucson_Overall");
    }

    // ── Response ─────────────────────────────────────────────────
    const result = {
      ok: true,
      sources: {
        redfin: !!redfinParsed,
        realtor: !!realtorParsed,
        bankrate: mortgageRate30yr !== null,
      },
      updated_fields: {
        negotiation_gap: reconciled.negotiation_gap,
        days_to_close: reconciled.days_to_close,
        median_dom: reconciled.median_dom,
        median_list_price: reconciled.median_list_price,
        active_listings: reconciled.active_listings,
        price_cut_pct: reconciled.price_cut_pct,
        mortgage_rate_30yr: mortgageRate30yr,
      },
      reconciliation: reconciled.reconciliation_log,
      scraped_at: new Date().toISOString(),
    };

    console.log("[scrape-market-pulse] Success:", JSON.stringify(result));
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[scrape-market-pulse] Unexpected error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
