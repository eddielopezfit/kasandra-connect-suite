/**
 * seed-market-pulse — ONE-TIME bootstrapper
 * 
 * Calls refresh-market-pulse internally (server-to-server) using the service role key.
 * Safe because: only works when market_pulse table is empty.
 * Delete this function after first successful seed.
 */

import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Safety: only allow seeding when table is empty
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { count } = await supabase
    .from("market_pulse")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    return new Response(JSON.stringify({ ok: false, error: "market_pulse already has data. Seed not needed." }), {
      status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Call refresh-market-pulse with service role key
  console.log("[seed-market-pulse] Triggering refresh-market-pulse...");
  const res = await fetch(`${supabaseUrl}/functions/v1/refresh-market-pulse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({}),
  });

  const data = await res.json();
  console.log("[seed-market-pulse] Result:", JSON.stringify(data));

  return new Response(JSON.stringify({ ok: true, pipeline_result: data }), {
    status: res.ok ? 200 : 502,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
