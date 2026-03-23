/**
 * upsert-conversation
 * Selena OS V2 — Priority 3: Cross-Device Memory Foundation
 * 
 * Persists Selena chat messages server-side when lead_id is known.
 * Enables conversation continuity across devices and sessions.
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
    const { session_id, lead_id, messages, turn_count, language } = body;

    if (!session_id || !UUID_RE.test(session_id)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Valid session_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ ok: false, error: "messages must be an array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rl = await checkRateLimit(supabase, `session:${session_id}`, "upsert-conversation");
    if (!rl.allowed) return rateLimitResponse(corsHeaders);

    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    const lastMessageAt = lastMsg?.timestamp || new Date().toISOString();

    const { error } = await supabase
      .from("conversations")
      .upsert({
        session_id,
        lead_id: lead_id && UUID_RE.test(lead_id) ? lead_id : null,
        messages,
        turn_count: turn_count || messages.filter((m: { role: string }) => m.role === "user").length,
        language: language || "en",
        last_message_at: lastMessageAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: "session_id" });

    if (error) {
      console.error("[upsert-conversation] DB error:", error);
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
