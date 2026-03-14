import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      .select("market_name, negotiation_gap, days_to_close, holding_cost_per_day, market_ready_prep_avg, last_verified_date, updated_at, scrape_log")
      .eq("market_name", "Tucson_Overall")
      .single();

    if (error) throw error;

    // Extract mortgage rate from scrape_log for consumers
    const scrapeLog = (data.scrape_log as Record<string, unknown>) ?? {};
    const response = {
      ...data,
      mortgage_rate_30yr: scrapeLog.mortgage_rate_30yr ?? null,
    };
    delete (response as Record<string, unknown>).scrape_log;

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
