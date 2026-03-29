import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, isPreflightRequest } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (isPreflightRequest(req)) {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the most recent scraped month's events
    const { data, error } = await supabase
      .from("tucson_events")
      .select("*")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);

    // Determine the scraped month from the most recent entry
    const scrapedMonth = data?.[0]?.scraped_month ?? null;

    return new Response(
      JSON.stringify({ events: data ?? [], scraped_month: scrapedMonth }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("get-tucson-events error:", error);
    return new Response(
      JSON.stringify({ error: error.message, events: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
