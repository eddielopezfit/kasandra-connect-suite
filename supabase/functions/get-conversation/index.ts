/**
 * get-conversation
 * Selena OS V2 — Priority 3: Cross-Device Memory Foundation
 * 
 * Fetches stored conversation by session_id or lead_id.
 * Used on session restore to merge server-side history with localStorage.
 */
import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { session_id, lead_id } = body;

    const hasValidSessionId = session_id && UUID_RE.test(session_id);
    const hasValidLeadId = lead_id && UUID_RE.test(lead_id);

    if (!hasValidSessionId && !hasValidLeadId) {
      return new Response(
        JSON.stringify({ ok: false, error: "Valid session_id or lead_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rlKey = session_id || lead_id;
    const rl = await checkRateLimit(supabase, rlKey, "get-conversation");
    if (!rl.allowed) return rateLimitResponse(corsHeaders);

    let query = supabase.from("conversations").select("*");

    if (hasValidSessionId) {
      query = query.eq("session_id", session_id);
    } else if (hasValidLeadId) {
      query = query.eq("lead_id", lead_id).order("updated_at", { ascending: false }).limit(1);
    }

    const { data, error } = hasValidSessionId
      ? await query.maybeSingle()
      : await query.maybeSingle();

    if (error) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        conversation: data || null,
        messages: data?.messages || [],
        turn_count: data?.turn_count || 0,
        last_message_at: data?.last_message_at || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
