import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * get-market-pulse
 * PERF: Returns cached market data with 1-hour Cache-Control header.
 * Data changes at most weekly — no need to hit DB on every page load. [audit PERF-02]
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

    const { data, error } = await supabase
      .from("market_pulse_settings")
      .select("market_name, negotiation_gap, days_to_close, holding_cost_per_day, market_ready_prep_avg, last_verified_date, updated_at")
      .eq("market_name", "Tucson_Overall")
      .single();

    if (error) throw error;

    // Cache for 1 hour on CDN / client — data updates at most weekly
    // s-maxage=86400 allows Vercel/Cloudflare edge to cache for 24h
    return new Response(JSON.stringify(data), {
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
