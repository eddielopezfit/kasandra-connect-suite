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

  return {
    negotiation_gap: negotiationGap,
    days_to_close: daysToClose,
    source_url: REDFIN_TUCSON_URL,
    scrape_log: log,
  };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
    const updatePayload: Record<string, unknown> = {
      source_type: "firecrawl_automated",
      source_url: parsed.source_url,
      scrape_log: {
        ...parsed.scrape_log,
        scraped_at: new Date().toISOString(),
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
