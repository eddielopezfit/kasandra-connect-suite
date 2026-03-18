/**
 * scrape-market-pulse
 * 
 * Automated Edge Function that uses Firecrawl to scrape Tucson market data
 * (Sale-to-List ratio, Median Days on Market) from Redfin, then updates
 * the market_pulse_settings table.
 * 
 * Designed to run on a weekly schedule via pg_cron.
 * Falls back to existing data if scraping fails (3-tier resilience).
 */

import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Redfin Tucson housing market page
const REDFIN_TUCSON_URL = "https://www.redfin.com/city/18510/AZ/Tucson/housing-market";

interface MarketData {
  negotiation_gap: number | null;
  days_to_close: number | null;
  median_dom: number | null;         // raw DOM before +30 padding
  median_list_price: string | null;  // e.g. "$345,000"
  active_listings: number | null;    // e.g. 4600
  price_cut_pct: number | null;      // e.g. 0.28 (28%)
  source_url: string;
  scrape_log: Record<string, unknown>;
}

/**
 * Parse scraped markdown for Sale-to-List ratio and Median Days on Market.
 * Redfin pages typically display these as key metrics.
 */
function parseMarketData(markdown: string): MarketData {
  const log: Record<string, unknown> = { raw_length: markdown.length };

  // Sale-to-List Ratio: look for patterns like "Sale-to-List Price 98.5%" or "98.5% sale-to-list"
  let negotiationGap: number | null = null;
  const saleToListPatterns = [
    // Flexible: any text with "sale" and "list" near a percentage
    /sale.*?list[^0-9]*(\d{2,3}(?:\.\d+)?)\s*%/i,
    /(\d{2,3}(?:\.\d+)?)\s*%\s*sale.*?list/i,
    // Redfin-style: "Sale-to-List Price" header then a percentage on next line
    /sale[- ]to[- ]list[^%]*?(\d{2,3}(?:\.\d+)?)%/is,
    // Percentage followed by context about list price
    /(\d{2,3}(?:\.\d+)?)\s*%[^.]*list\s*price/i,
    // Standalone pattern: number% near "of list" or "of asking"
    /(\d{2,3}(?:\.\d+)?)\s*%\s*(?:of\s+)?(?:list|asking)/i,
    // Fallback: look for ratio as decimal (e.g., "0.985")
    /sale.*?list.*?(0\.\d{2,4})/i,
  ];
  for (const pattern of saleToListPatterns) {
    const match = markdown.match(pattern);
    if (match) {
      let ratio: number;
      const raw = parseFloat(match[1]);
      if (raw < 2) {
        ratio = raw;
      } else {
        ratio = raw / 100;
      }
      negotiationGap = parseFloat((1 - ratio).toFixed(4));
      log.sale_to_list_raw = match[0];
      log.sale_to_list_ratio = ratio;
      log.sale_to_list_method = 'direct_ratio';
      break;
    }
  }

  // Redfin "Over/Under List Price" format: the metric appears as
  // "Over List Price\n\n3%" or "Under List Price\n\n2%"
  if (negotiationGap === null) {
    const overMatch = markdown.match(/over\s+list\s+price[\s\S]{0,20}?(\d{1,3}(?:\.\d+)?)\s*%/i);
    const underMatch = markdown.match(/under\s+list\s+price[\s\S]{0,20}?(\d{1,3}(?:\.\d+)?)\s*%/i);

    if (overMatch) {
      const overPct = parseFloat(overMatch[1]);
      // "Over List Price 3%" means sale-to-list = 1.03, gap = -0.03
      negotiationGap = parseFloat((-overPct / 100).toFixed(4));
      log.sale_to_list_raw = overMatch[0];
      log.sale_to_list_ratio = 1 + overPct / 100;
      log.sale_to_list_method = 'over_list_price';
    } else if (underMatch) {
      const underPct = parseFloat(underMatch[1]);
      // "Under List Price 2%" means sale-to-list = 0.98, gap = 0.02
      negotiationGap = parseFloat((underPct / 100).toFixed(4));
      log.sale_to_list_raw = underMatch[0];
      log.sale_to_list_ratio = 1 - underPct / 100;
      log.sale_to_list_method = 'under_list_price';
    }
  }

  // Median Days on Market: look for patterns like "Median Days on Market 38" or "38 days"
  let daysOnMarket: number | null = null;
  const domPatterns = [
    /median\s+days?\s+on\s+market[^0-9]*(\d{1,3})/i,
    /days?\s+on\s+market[^0-9]*(\d{1,3})/i,
    /(\d{1,3})\s+(?:median\s+)?days?\s+on\s+market/i,
  ];
  for (const pattern of domPatterns) {
    const match = markdown.match(pattern);
    if (match) {
      daysOnMarket = parseInt(match[1], 10);
      log.days_on_market_raw = match[0];
      break;
    }
  }

  // days_to_close = DOM + ~30 days for closing process
  const daysToClose = daysOnMarket !== null ? daysOnMarket + 30 : null;
  log.days_to_close_calculated = daysToClose;

  // Median List Price: "Median List Price $345,000" or "$345K" patterns
  let medianListPrice: string | null = null;
  const pricePatterns = [
    /median\s+(?:list|sale|home|listing)\s+price[^$]*\$([\d,]+(?:K|M)?)/i,
    /\$([\d,]+(?:K|M)?)\s+median\s+(?:list|sale|home)/i,
    /(?:list|sale)\s+price\s+\$([\d,]+(?:K|M)?)/i,
  ];
  for (const p of pricePatterns) {
    const m = markdown.match(p);
    if (m) {
      // Normalize K/M shorthand
      let raw = m[1].replace(/,/g, '');
      if (raw.endsWith('K')) raw = String(parseFloat(raw) * 1000);
      if (raw.endsWith('M')) raw = String(parseFloat(raw) * 1000000);
      medianListPrice = `$${Number(raw).toLocaleString()}`;
      log.median_list_price_raw = m[0];
      break;
    }
  }

  // Active Listings: "4,600 homes for sale" or "Active listings: 4,600"
  let activeListings: number | null = null;
  const listingPatterns = [
    /([\d,]+)\s+homes?\s+for\s+sale/i,
    /active\s+listings?[:\s]+([\d,]+)/i,
    /([\d,]+)\s+active\s+listings?/i,
    /([\d,]+)\s+homes?\s+(?:available|listed)/i,
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

  // Price Cut %: "28% of homes had a price cut" or "price reductions: 28%"
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
    source_url: REDFIN_TUCSON_URL,
    scrape_log: log,
  };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // JWT auth guard — prevents unauthorized calls to cost-bearing external APIs
  const authHeader = req.headers.get('Authorization') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token || (token !== anonKey && token !== serviceKey)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
    console.log("[scrape-market-pulse] Starting Firecrawl scrape of Redfin Tucson...");

    // Step 1: Scrape via Firecrawl
    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: REDFIN_TUCSON_URL,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 3000, // Redfin renders JS-heavy content
      }),
    });

    const scrapeData = await scrapeRes.json();

    if (!scrapeRes.ok || !scrapeData.success) {
      console.error("[scrape-market-pulse] Firecrawl error:", scrapeData);
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Firecrawl scrape failed",
          detail: scrapeData.error || `Status ${scrapeRes.status}`,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";
    console.log(`[scrape-market-pulse] Scraped ${markdown.length} chars`);

    // Step 2: Parse market metrics
    const parsed = parseMarketData(markdown);
    console.log("[scrape-market-pulse] Parsed data:", JSON.stringify(parsed));

    // Step 3: Build update payload (only update fields that were successfully parsed)
    // Rich data (median_dom, median_list_price, active_listings, price_cut_pct) stored in scrape_log
    // so no DB schema changes are needed — scrape_log is jsonb.
    const updatePayload: Record<string, unknown> = {
      source_type: "firecrawl_automated",
      source_url: parsed.source_url,
      scrape_log: {
        ...parsed.scrape_log,
        scraped_at: new Date().toISOString(),
        // Extended fields — stored in scrape_log for Selena market hint enrichment
        median_dom: parsed.median_dom,
        median_list_price: parsed.median_list_price,
        active_listings: parsed.active_listings,
        price_cut_pct: parsed.price_cut_pct,
      },
      last_verified_date: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString(),
    };

    if (parsed.negotiation_gap !== null) {
      updatePayload.negotiation_gap = parsed.negotiation_gap;
    }
    if (parsed.days_to_close !== null) {
      updatePayload.days_to_close = parsed.days_to_close;
    }

    // Step 4: Upsert into market_pulse_settings
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

    const result = {
      ok: true,
      updated_fields: {
        negotiation_gap: parsed.negotiation_gap,
        days_to_close: parsed.days_to_close,
        median_dom: parsed.median_dom,
        median_list_price: parsed.median_list_price,
        active_listings: parsed.active_listings,
        price_cut_pct: parsed.price_cut_pct,
      },
      source: REDFIN_TUCSON_URL,
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
