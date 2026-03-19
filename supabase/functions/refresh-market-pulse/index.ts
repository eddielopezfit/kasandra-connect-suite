/**
 * refresh-market-pulse
 * 
 * Automated pipeline: Firecrawl scrape → Perplexity verification → Supabase insert.
 * Runs monthly via pg_cron (0 3 1 * *).
 * Protected by x-admin-secret (cost-bearing: Firecrawl + Perplexity API calls).
 */

import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SOURCES = [
  { name: "Redfin", url: "https://www.redfin.com/city/18510/AZ/Tucson/housing-market" },
  { name: "Realtor.com", url: "https://www.realtor.com/realestateandhomes-search/Tucson_AZ/overview" },
  { name: "Zillow", url: "https://www.zillow.com/tucson-az/home-values/" },
];

interface ScrapedMetrics {
  sale_to_list_ratio: number | null;
  median_days_on_market: number | null;
  median_sale_price: number | null;
  source: string;
  raw_snippet: string;
}

/**
 * Parse scraped markdown for key housing metrics
 */
function parseMetrics(markdown: string, sourceName: string): ScrapedMetrics {
  let saleToList: number | null = null;
  let dom: number | null = null;
  let medianPrice: number | null = null;

  // Sale-to-List ratio patterns
  const stlPatterns = [
    /sale.*?list[^0-9]*(\d{2,3}(?:\.\d+)?)\s*%/i,
    /(\d{2,3}(?:\.\d+)?)\s*%\s*sale.*?list/i,
    /sale[- ]to[- ]list[^%]*?(\d{2,3}(?:\.\d+)?)%/is,
    /(\d{2,3}(?:\.\d+)?)\s*%[^.]*list\s*price/i,
  ];
  // Over/Under list price (Redfin format)
  const overMatch = markdown.match(/over\s+list\s+price[\s\S]{0,20}?(\d{1,3}(?:\.\d+)?)\s*%/i);
  const underMatch = markdown.match(/under\s+list\s+price[\s\S]{0,20}?(\d{1,3}(?:\.\d+)?)\s*%/i);

  for (const p of stlPatterns) {
    const m = markdown.match(p);
    if (m) {
      const raw = parseFloat(m[1]);
      saleToList = raw < 2 ? raw : raw / 100;
      break;
    }
  }
  if (saleToList === null && overMatch) {
    saleToList = 1 + parseFloat(overMatch[1]) / 100;
  } else if (saleToList === null && underMatch) {
    saleToList = 1 - parseFloat(underMatch[1]) / 100;
  }

  // Days on Market
  const domPatterns = [
    /median\s+days?\s+on\s+market[^0-9]*(\d{1,3})/i,
    /days?\s+on\s+market[^0-9]*(\d{1,3})/i,
    /(\d{1,3})\s+(?:median\s+)?days?\s+on\s+market/i,
  ];
  for (const p of domPatterns) {
    const m = markdown.match(p);
    if (m) {
      dom = parseInt(m[1], 10);
      break;
    }
  }

  // Median Sale/List Price
  const pricePatterns = [
    /median\s+(?:sale|list|home|listing)\s+price[^$]*\$([\d,]+)/i,
    /\$([\d,]+)\s+median/i,
  ];
  for (const p of pricePatterns) {
    const m = markdown.match(p);
    if (m) {
      medianPrice = parseInt(m[1].replace(/,/g, ''), 10);
      break;
    }
  }

  // Capture a snippet for audit trail
  const snippet = markdown.substring(0, 500);

  return {
    sale_to_list_ratio: saleToList,
    median_days_on_market: dom,
    median_sale_price: medianPrice,
    source: sourceName,
    raw_snippet: snippet,
  };
}

/**
 * Scrape a single source via Firecrawl
 */
async function scrapeSource(
  firecrawlKey: string,
  source: { name: string; url: string }
): Promise<ScrapedMetrics> {
  console.log(`[refresh-market-pulse] Scraping ${source.name}...`);

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: source.url,
      formats: ["markdown"],
      onlyMainContent: true,
      waitFor: 3000,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    console.warn(`[refresh-market-pulse] ${source.name} scrape failed:`, data.error);
    return {
      sale_to_list_ratio: null,
      median_days_on_market: null,
      median_sale_price: null,
      source: source.name,
      raw_snippet: `FAILED: ${data.error || res.status}`,
    };
  }

  const markdown = data.data?.markdown || data.markdown || "";
  console.log(`[refresh-market-pulse] ${source.name}: ${markdown.length} chars`);
  return parseMetrics(markdown, source.name);
}

/**
 * Cross-verify scraped data using Perplexity
 */
async function verifyWithPerplexity(
  perplexityKey: string,
  scrapedData: ScrapedMetrics[]
): Promise<{
  verified_sale_to_list: number | null;
  verified_dom: number | null;
  perplexity_response: string;
  consensus: boolean;
}> {
  const scrapedSummary = scrapedData
    .map(s => `${s.source}: STL=${s.sale_to_list_ratio}, DOM=${s.median_days_on_market}`)
    .join("\n");

  const prompt = `Verify Tucson, Arizona housing market statistics for the current month.

I scraped these values:
${scrapedSummary}

Cross-reference Redfin, Realtor.com, and Zillow market reports for Tucson AZ.
Return the consensus sale-to-list ratio (as a decimal like 0.976) and median days on market (integer).
Provide sources.

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
  console.log(`[refresh-market-pulse] Perplexity response:`, responseText);

  // Parse JSON from response
  let parsed: Record<string, unknown> = {};
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    }
  } catch (_e) {
    console.warn("[refresh-market-pulse] Failed to parse Perplexity JSON");
  }

  const verifiedSTL = typeof parsed.sale_to_list_ratio === 'number' ? parsed.sale_to_list_ratio : null;
  const verifiedDOM = typeof parsed.median_days_on_market === 'number' ? parsed.median_days_on_market : null;

  // Check consensus: compare scraped vs Perplexity (10% deviation threshold)
  let consensus = true;
  const scrapedSTLValues = scrapedData.map(s => s.sale_to_list_ratio).filter(v => v !== null) as number[];
  const avgScrapedSTL = scrapedSTLValues.length > 0
    ? scrapedSTLValues.reduce((a, b) => a + b, 0) / scrapedSTLValues.length
    : null;

  if (verifiedSTL && avgScrapedSTL) {
    const deviation = Math.abs(verifiedSTL - avgScrapedSTL) / avgScrapedSTL;
    if (deviation > 0.10) {
      consensus = false;
      console.warn(`[refresh-market-pulse] STL deviation ${(deviation * 100).toFixed(1)}% exceeds 10% threshold`);
    }
  }

  const scrapedDOMValues = scrapedData.map(s => s.median_days_on_market).filter(v => v !== null) as number[];
  const avgScrapedDOM = scrapedDOMValues.length > 0
    ? Math.round(scrapedDOMValues.reduce((a, b) => a + b, 0) / scrapedDOMValues.length)
    : null;

  if (verifiedDOM && avgScrapedDOM) {
    const deviation = Math.abs(verifiedDOM - avgScrapedDOM) / avgScrapedDOM;
    if (deviation > 0.10) {
      consensus = false;
      console.warn(`[refresh-market-pulse] DOM deviation ${(deviation * 100).toFixed(1)}% exceeds 10% threshold`);
    }
  }

  return {
    verified_sale_to_list: verifiedSTL,
    verified_dom: verifiedDOM,
    perplexity_response: responseText,
    consensus,
  };
}

/**
 * Derive the current month label (e.g. "March 2026")
 */
function getCurrentMonth(): string {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Admin-only gate: x-admin-secret OR service-role Authorization header
  const adminSecret = req.headers.get("x-admin-secret");
  const authHeader = req.headers.get("authorization") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const isAdminSecretValid = adminSecret === Deno.env.get("ADMIN_SECRET");
  const isServiceRole = serviceRoleKey && authHeader === `Bearer ${serviceRoleKey}`;

  if (!isAdminSecretValid && !isServiceRole) {
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
    // STEP 1: Scrape all sources in parallel
    const scrapeResults = await Promise.allSettled(
      SOURCES.map(s => scrapeSource(firecrawlKey, s))
    );

    const scrapedData: ScrapedMetrics[] = scrapeResults
      .filter((r): r is PromiseFulfilledResult<ScrapedMetrics> => r.status === "fulfilled")
      .map(r => r.value);

    console.log(`[refresh-market-pulse] Scraped ${scrapedData.length}/${SOURCES.length} sources`);

    if (scrapedData.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "All scrapes failed" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STEP 2: Perplexity verification
    const verification = await verifyWithPerplexity(perplexityKey, scrapedData);
    console.log(`[refresh-market-pulse] Consensus: ${verification.consensus}`);

    // STEP 3: Determine final values (prefer Perplexity-verified, fallback to scraped average)
    const scrapedSTLValues = scrapedData.map(s => s.sale_to_list_ratio).filter(v => v !== null) as number[];
    const scrapedDOMValues = scrapedData.map(s => s.median_days_on_market).filter(v => v !== null) as number[];

    const finalSTL = verification.verified_sale_to_list
      ?? (scrapedSTLValues.length > 0
        ? scrapedSTLValues.reduce((a, b) => a + b, 0) / scrapedSTLValues.length
        : null);

    const finalDOM = verification.verified_dom
      ?? (scrapedDOMValues.length > 0
        ? Math.round(scrapedDOMValues.reduce((a, b) => a + b, 0) / scrapedDOMValues.length)
        : null);

    if (finalSTL === null || finalDOM === null) {
      return new Response(JSON.stringify({
        ok: false,
        error: "Could not determine market metrics from any source",
        scraped: scrapedData,
        verification,
      }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate holding cost: median price * (mortgage rate + tax + insurance) / 365
    // Using simplified formula from config defaults
    const holdingCostPerDay = 42; // Will be refined when median price data improves

    const month = getCurrentMonth();

    const sourceLinks = scrapedData.map(s => ({
      source: s.source,
      url: SOURCES.find(src => src.name === s.source)?.url,
      sale_to_list_ratio: s.sale_to_list_ratio,
      median_days_on_market: s.median_days_on_market,
    }));

    // STEP 4: Insert into market_pulse table
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error: insertError } = await supabase
      .from("market_pulse")
      .insert({
        month,
        sale_to_list_ratio: Math.round(finalSTL * 10000) / 10000, // e.g. 0.976
        median_days_on_market: finalDOM,
        holding_cost_per_day: holdingCostPerDay,
        prep_avg: 4800,
        source_links: {
          scraped: sourceLinks,
          perplexity: {
            response: verification.perplexity_response,
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

    // STEP 5: Also update legacy market_pulse_settings for backward compatibility
    const negotiationGap = parseFloat((1 - finalSTL).toFixed(4));
    const daysToClose = finalDOM + 30;

    await supabase
      .from("market_pulse_settings")
      .update({
        negotiation_gap: negotiationGap,
        days_to_close: daysToClose,
        holding_cost_per_day: holdingCostPerDay,
        last_verified_date: new Date().toISOString().split("T")[0],
        source_type: "automated_pipeline",
        scrape_log: {
          pipeline: "refresh-market-pulse",
          ran_at: new Date().toISOString(),
          consensus: verification.consensus,
          median_dom: finalDOM,
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
      flagged: !verification.consensus,
      sources_scraped: scrapedData.length,
    };

    console.log("[refresh-market-pulse] Success:", JSON.stringify(result));
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[refresh-market-pulse] Error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
