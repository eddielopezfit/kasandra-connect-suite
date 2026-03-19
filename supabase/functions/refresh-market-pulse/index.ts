/**
 * refresh-market-pulse
 *
 * Automated pipeline: Firecrawl JSON extraction → Perplexity verification → Supabase insert.
 * Runs monthly via pg_cron (0 3 1 * *).
 * Protected by x-admin-secret OR service-role Authorization header.
 */

import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------
const SOURCES = [
  { name: "Redfin", url: "https://www.redfin.com/city/18510/AZ/Tucson/housing-market" },
  { name: "Realtor.com", url: "https://www.realtor.com/realestateandhomes-search/Tucson_AZ/overview" },
  { name: "Zillow", url: "https://www.zillow.com/tucson-az/home-values/" },
];

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    median_sale_price: { type: "number", description: "Median home sale price in USD" },
    median_days_on_market: { type: "number", description: "Median days on market (DOM)" },
    sale_to_list_ratio: { type: "number", description: "Sale-to-list price ratio as a decimal (e.g. 0.976) or percentage (e.g. 97.6)" },
    month_year: { type: "string", description: "The month and year this data is for (e.g. 'March 2026')" },
  },
  required: ["median_days_on_market"],
};

interface ExtractedMetrics {
  median_sale_price: number | null;
  median_days_on_market: number | null;
  sale_to_list_ratio: number | null;
  month_year: string | null;
  source: string;
  raw_snippet: string;
}

// ---------------------------------------------------------------------------
// Scrape via Firecrawl JSON extraction
// ---------------------------------------------------------------------------
async function scrapeSource(
  firecrawlKey: string,
  source: { name: string; url: string },
): Promise<ExtractedMetrics> {
  console.log(`[refresh-market-pulse] Scraping ${source.name} via JSON extraction...`);

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: source.url,
      formats: [
        "markdown",
        {
          type: "json",
          schema: EXTRACTION_SCHEMA,
          prompt: "Extract the current Tucson AZ housing market statistics from this page. For sale_to_list_ratio, return as a decimal like 0.976 (not a percentage). For median_days_on_market, return the integer number of days.",
        },
      ],
      onlyMainContent: true,
      waitFor: 5000,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    console.warn(`[refresh-market-pulse] ${source.name} scrape failed:`, data.error);
    return {
      median_sale_price: null,
      median_days_on_market: null,
      sale_to_list_ratio: null,
      month_year: null,
      source: source.name,
      raw_snippet: `FAILED: ${data.error || res.status}`,
    };
  }

  // Firecrawl nests under data.data or data directly
  const json = data.data?.json ?? data.json ?? {};
  const markdown = (data.data?.markdown ?? data.markdown ?? "").substring(0, 500);

  console.log(`[refresh-market-pulse] ${source.name} extracted:`, JSON.stringify(json));

  // Normalize sale_to_list_ratio — might come as 97.6 instead of 0.976
  let stl = typeof json.sale_to_list_ratio === "number" ? json.sale_to_list_ratio : null;
  if (stl !== null && stl > 2) {
    stl = stl / 100; // Convert percentage to decimal
  }

  return {
    median_sale_price: typeof json.median_sale_price === "number" ? json.median_sale_price : null,
    median_days_on_market: typeof json.median_days_on_market === "number" ? Math.round(json.median_days_on_market) : null,
    sale_to_list_ratio: stl,
    month_year: json.month_year ?? null,
    source: source.name,
    raw_snippet: markdown,
  };
}

// ---------------------------------------------------------------------------
// Reconcile scraped data (2-of-3 agreement)
// ---------------------------------------------------------------------------
interface Reconciled {
  sale_to_list_ratio: number | null;
  median_days_on_market: number | null;
  median_sale_price: number | null;
  agreement_count: number;
}

function reconcile(data: ExtractedMetrics[]): Reconciled {
  const stlValues = data.map(d => d.sale_to_list_ratio).filter((v): v is number => v !== null && v > 0.8 && v < 1.15);
  const domValues = data.map(d => d.median_days_on_market).filter((v): v is number => v !== null && v > 0 && v < 200);
  const priceValues = data.map(d => d.median_sale_price).filter((v): v is number => v !== null && v > 50000);

  return {
    sale_to_list_ratio: median(stlValues),
    median_days_on_market: domValues.length > 0 ? Math.round(median(domValues)!) : null,
    median_sale_price: priceValues.length > 0 ? Math.round(median(priceValues)!) : null,
    agreement_count: Math.max(stlValues.length, domValues.length),
  };
}

function median(arr: number[]): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ---------------------------------------------------------------------------
// Perplexity verification (tiebreaker / cross-check)
// ---------------------------------------------------------------------------
async function verifyWithPerplexity(
  perplexityKey: string,
  scraped: Reconciled,
): Promise<{
  verified_stl: number | null;
  verified_dom: number | null;
  response_text: string;
  consensus: boolean;
}> {
  const prompt = `What are the current Tucson, Arizona housing market statistics?

I need:
1. Sale-to-list price ratio (as a decimal like 0.976)
2. Median days on market (integer)

My scraped data shows: STL=${scraped.sale_to_list_ratio}, DOM=${scraped.median_days_on_market}

Cross-reference Redfin, Realtor.com, and Zillow for Tucson AZ.
Respond in this exact JSON format:
{
  "sale_to_list_ratio": 0.976,
  "median_days_on_market": 38,
  "sources": ["url1", "url2"],
  "notes": "brief explanation"
}`;

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${perplexityKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: "You are a real estate market data analyst. Return only valid JSON." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
    }),
  });

  const data = await res.json();
  const responseText = data.choices?.[0]?.message?.content || "";
  console.log(`[refresh-market-pulse] Perplexity:`, responseText);

  let parsed: Record<string, unknown> = {};
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch (_e) {
    console.warn("[refresh-market-pulse] Failed to parse Perplexity JSON");
  }

  const pStl = typeof parsed.sale_to_list_ratio === "number" ? parsed.sale_to_list_ratio : null;
  const pDom = typeof parsed.median_days_on_market === "number" ? parsed.median_days_on_market : null;

  // Consensus: check if Perplexity agrees with scraped within 15%
  let consensus = true;
  if (pStl && scraped.sale_to_list_ratio) {
    const dev = Math.abs(pStl - scraped.sale_to_list_ratio) / scraped.sale_to_list_ratio;
    if (dev > 0.15) {
      consensus = false;
      console.warn(`[refresh-market-pulse] STL deviation ${(dev * 100).toFixed(1)}%`);
    }
  }
  if (pDom && scraped.median_days_on_market) {
    const dev = Math.abs(pDom - scraped.median_days_on_market) / scraped.median_days_on_market;
    if (dev > 0.15) {
      consensus = false;
      console.warn(`[refresh-market-pulse] DOM deviation ${(dev * 100).toFixed(1)}%`);
    }
  }

  return {
    verified_stl: pStl,
    verified_dom: pDom,
    response_text: responseText,
    consensus,
  };
}

// ---------------------------------------------------------------------------
// Month label
// ---------------------------------------------------------------------------
function getCurrentMonth(): string {
  return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: x-admin-secret OR service-role Bearer
  const adminSecret = req.headers.get("x-admin-secret");
  const authHeader = req.headers.get("authorization") ?? "";
  const srvKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (adminSecret !== Deno.env.get("ADMIN_SECRET") && !(srvKey && authHeader === `Bearer ${srvKey}`)) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
  const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!firecrawlKey) {
    return new Response(JSON.stringify({ ok: false, error: "FIRECRAWL_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!perplexityKey) {
    return new Response(JSON.stringify({ ok: false, error: "PERPLEXITY_API_KEY not configured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // STEP 1: Scrape all sources in parallel via JSON extraction
    const scrapeResults = await Promise.allSettled(
      SOURCES.map(s => scrapeSource(firecrawlKey, s)),
    );

    const scrapedData: ExtractedMetrics[] = scrapeResults
      .filter((r): r is PromiseFulfilledResult<ExtractedMetrics> => r.status === "fulfilled")
      .map(r => r.value);

    console.log(`[refresh-market-pulse] Scraped ${scrapedData.length}/${SOURCES.length} sources`);

    if (scrapedData.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "All scrapes failed" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STEP 2: Reconcile scraped data (median of valid values)
    const reconciled = reconcile(scrapedData);
    console.log(`[refresh-market-pulse] Reconciled:`, JSON.stringify(reconciled));

    // STEP 3: Perplexity verification
    const verification = await verifyWithPerplexity(perplexityKey, reconciled);

    // STEP 4: Determine final values
    // If 2+ sources agree, use scraped median. If only 1 source, prefer Perplexity.
    const finalSTL = reconciled.agreement_count >= 2
      ? reconciled.sale_to_list_ratio
      : (verification.verified_stl ?? reconciled.sale_to_list_ratio);

    const finalDOM = reconciled.agreement_count >= 2
      ? reconciled.median_days_on_market
      : (verification.verified_dom ?? reconciled.median_days_on_market);

    if (finalSTL === null || finalDOM === null) {
      return new Response(JSON.stringify({
        ok: false,
        error: "Could not determine market metrics",
        scraped: scrapedData,
        reconciled,
        verification: { consensus: verification.consensus },
      }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const holdingCostPerDay = 42;
    const month = getCurrentMonth();

    // STEP 5: Insert into market_pulse
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const sourceLinks = scrapedData.map(s => ({
      source: s.source,
      url: SOURCES.find(src => src.name === s.source)?.url,
      sale_to_list_ratio: s.sale_to_list_ratio,
      median_days_on_market: s.median_days_on_market,
      median_sale_price: s.median_sale_price,
    }));

    const { error: insertError } = await supabase.from("market_pulse").insert({
      month,
      sale_to_list_ratio: Math.round(finalSTL * 10000) / 10000,
      median_days_on_market: finalDOM,
      holding_cost_per_day: holdingCostPerDay,
      prep_avg: 4800,
      source_links: {
        scraped: sourceLinks,
        perplexity: {
          response: verification.response_text,
          consensus: verification.consensus,
        },
      },
      verified_at: verification.consensus ? new Date().toISOString() : null,
    });

    if (insertError) {
      console.error("[refresh-market-pulse] DB insert error:", insertError);
      return new Response(JSON.stringify({ ok: false, error: "Database insert failed", detail: insertError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STEP 6: Update legacy market_pulse_settings
    const negotiationGap = parseFloat((1 - finalSTL).toFixed(4));
    await supabase
      .from("market_pulse_settings")
      .update({
        negotiation_gap: negotiationGap,
        days_to_close: finalDOM + 30,
        holding_cost_per_day: holdingCostPerDay,
        last_verified_date: new Date().toISOString().split("T")[0],
        source_type: "automated_pipeline",
        scrape_log: {
          pipeline: "refresh-market-pulse",
          ran_at: new Date().toISOString(),
          consensus: verification.consensus,
          median_dom: finalDOM,
          method: "firecrawl_json_extraction",
        },
        updated_at: new Date().toISOString(),
      })
      .eq("market_name", "Tucson_Overall");

    const result = {
      ok: true,
      month,
      sale_to_list_ratio: finalSTL,
      median_days_on_market: finalDOM,
      holding_cost_per_day: holdingCostPerDay,
      consensus: verification.consensus,
      sources_scraped: scrapedData.length,
      agreement_count: reconciled.agreement_count,
    };

    console.log("[refresh-market-pulse] Success:", JSON.stringify(result));
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[refresh-market-pulse] Error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
