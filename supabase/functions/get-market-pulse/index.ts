import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * get-market-pulse
 * 
 * Returns the latest market_pulse row (new automated pipeline table).
 * Falls back to legacy market_pulse_settings if no rows exist yet.
 * 
 * PERF: 1-hour Cache-Control. Data changes at most monthly.
 */
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try new market_pulse table first (latest row by created_at)
    const { data: pulseData, error: pulseError } = await supabase
      .from("market_pulse")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pulseData && !pulseError) {
      // Extract median_sale_price from scraped source_links (prefer Zillow)
      let medianSalePrice: number | null = null;
      try {
        const links = pulseData.source_links as any;
        const scraped = links?.scraped;
        if (Array.isArray(scraped)) {
          // Prefer Zillow, then any source with a valid median
          const zillow = scraped.find((s: any) => s.source === "Zillow" && s.median_sale_price > 50000);
          const anyValid = scraped.find((s: any) => s.median_sale_price > 50000);
          medianSalePrice = zillow?.median_sale_price ?? anyValid?.median_sale_price ?? null;
        }
      } catch { /* ignore parse errors */ }

      // Return in a normalized format the UI hook expects
      const response = {
        source: "market_pulse",
        month: pulseData.month,
        sale_to_list_ratio: pulseData.sale_to_list_ratio,
        median_days_on_market: pulseData.median_days_on_market,
        holding_cost_per_day: pulseData.holding_cost_per_day,
        prep_avg: pulseData.prep_avg,
        source_links: pulseData.source_links,
        verified_at: pulseData.verified_at,
        created_at: pulseData.created_at,
        median_sale_price: medianSalePrice,
        // Legacy compat fields for existing hook
        market_name: "Tucson_Overall",
        negotiation_gap: parseFloat((1 - Number(pulseData.sale_to_list_ratio)).toFixed(4)),
        days_to_close: pulseData.median_days_on_market + 30,
        market_ready_prep_avg: pulseData.prep_avg,
        last_verified_date: pulseData.verified_at
          ? new Date(pulseData.verified_at).toISOString().split("T")[0]
          : null,
        updated_at: pulseData.created_at,
      };

      return new Response(JSON.stringify(response), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600",
        },
      });
    }

    // Fallback: legacy market_pulse_settings table
    console.log("[get-market-pulse] No market_pulse rows, falling back to market_pulse_settings");
    const { data, error } = await supabase
      .from("market_pulse_settings")
      .select("market_name, negotiation_gap, days_to_close, holding_cost_per_day, market_ready_prep_avg, last_verified_date, updated_at")
      .eq("market_name", "Tucson_Overall")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ...data, source: "market_pulse_settings" }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
