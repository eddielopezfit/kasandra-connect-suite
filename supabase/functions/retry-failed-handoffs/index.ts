import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * retry-failed-handoffs
 * Admin-only function that retries failed GHL webhook deliveries.
 * - Queries lead_handoffs where delivery_status='failed' AND retry_count < 5
 * - Retries the webhook POST for each
 * - Updates delivery_status and retry_count
 * Protected by x-admin-secret header.
 */

const GHL_WEBHOOK_URL = Deno.env.get("GHL_WEBHOOK_URL") ?? "";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Admin auth guard (cost-bearing: retries external API calls)
  const adminSecret = req.headers.get("x-admin-secret");
  if (adminSecret !== Deno.env.get("ADMIN_SECRET")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  if (!GHL_WEBHOOK_URL) {
    return new Response(
      JSON.stringify({ error: "GHL_WEBHOOK_URL not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Fetch failed handoffs eligible for retry
    const { data: failedHandoffs, error: queryError } = await supabase
      .from("lead_handoffs")
      .select("id, lead_id, channel, priority, summary_md, convo_summary_json, retry_count")
      .eq("delivery_status", "failed")
      .lt("retry_count", 5)
      .order("created_at", { ascending: true })
      .limit(20);

    if (queryError) {
      console.error("[retry-failed-handoffs] Query error:", queryError);
      return new Response(
        JSON.stringify({ error: "Failed to query handoffs" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!failedHandoffs || failedHandoffs.length === 0) {
      console.log("[retry-failed-handoffs] No failed handoffs to retry");
      return new Response(
        JSON.stringify({ ok: true, retried: 0, message: "No failed handoffs" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[retry-failed-handoffs] Found ${failedHandoffs.length} failed handoffs to retry`);

    const results: Array<{ handoff_id: string; lead_id: string; success: boolean; error?: string }> = [];

    for (const handoff of failedHandoffs) {
      const correlationId = handoff.id;
      console.log(`[retry-failed-handoffs] [${correlationId}] Retrying for lead=${handoff.lead_id}, attempt=${handoff.retry_count + 1}`);

      // Fetch lead profile for payload reconstruction
      const { data: lead } = await supabase
        .from("lead_profiles")
        .select("email, phone, name, intent, language, session_id, lead_score, tags")
        .eq("id", handoff.lead_id)
        .maybeSingle();

      if (!lead) {
        console.warn(`[retry-failed-handoffs] [${correlationId}] Lead ${handoff.lead_id} not found, skipping`);
        await supabase.from("lead_handoffs").update({
          last_error: "Lead profile not found",
          retry_count: handoff.retry_count + 1,
        }).eq("id", handoff.id);
        results.push({ handoff_id: handoff.id, lead_id: handoff.lead_id, success: false, error: "Lead not found" });
        continue;
      }

      // Fetch session snapshot for context
      let snapshot: Record<string, unknown> | null = null;
      if (lead.session_id) {
        const { data: snap } = await supabase
          .from("session_snapshots")
          .select("*")
          .eq("session_id", lead.session_id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        snapshot = snap;
      }

      const ctxJson = (snapshot?.context_json as Record<string, unknown>) ?? {};
      const nameParts = (lead.name ?? "").trim().split(" ");

      // Reconstruct minimal GHL payload (same structure as notify-handoff)
      const retryPayload = {
        first_name: nameParts[0] ?? "",
        last_name: nameParts.slice(1).join(" ") ?? "",
        phone: lead.phone ?? "",
        email: lead.email ?? "",
        selena_lead_id: handoff.lead_id,
        selena_session_id: lead.session_id ?? "",
        selena_lead_intent_clean: lead.intent ?? "",
        selena_intent_canonical: lead.intent ?? "",
        selena_language_clean: lead.language ?? "en",
        selena_score: lead.lead_score ?? 0,
        selena_pipeline_stage: "Retry Recovery",
        selena_journey_state: ctxJson.journey_state ?? "explore",
        selena_source: "retry_failed_handoffs",
        selena_consent_timestamp: new Date().toISOString(),
        selena_last_data_parse_date: new Date().toISOString(),
        selena_intake_completed_flag: true,
        tags: lead.tags ?? ["selena_os_lead", "selena - retry recovery"],
      };

      try {
        const ghlRes = await fetch(GHL_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(retryPayload),
        });

        if (ghlRes.ok) {
          console.log(`[retry-failed-handoffs] [${correlationId}] ✅ Delivered`);
          await supabase.from("lead_handoffs").update({
            delivery_status: "delivered",
            notified_at: new Date().toISOString(),
            last_error: null,
          }).eq("id", handoff.id);
          results.push({ handoff_id: handoff.id, lead_id: handoff.lead_id, success: true });
        } else {
          const errText = await ghlRes.text();
          console.warn(`[retry-failed-handoffs] [${correlationId}] Failed: ${ghlRes.status}`);
          await supabase.from("lead_handoffs").update({
            retry_count: handoff.retry_count + 1,
            last_error: `HTTP ${ghlRes.status}: ${errText?.slice(0, 500)}`,
          }).eq("id", handoff.id);
          results.push({ handoff_id: handoff.id, lead_id: handoff.lead_id, success: false, error: `HTTP ${ghlRes.status}` });
        }
      } catch (fetchErr) {
        const errMsg = (fetchErr as Error)?.message ?? String(fetchErr);
        console.error(`[retry-failed-handoffs] [${correlationId}] Network error: ${errMsg}`);
        await supabase.from("lead_handoffs").update({
          retry_count: handoff.retry_count + 1,
          last_error: errMsg.slice(0, 500),
        }).eq("id", handoff.id);
        results.push({ handoff_id: handoff.id, lead_id: handoff.lead_id, success: false, error: errMsg });
      }

      // Log attempt to event_log
      try {
        await supabase.from("event_log").insert({
          event_type: "handoff_retry_attempt",
          session_id: lead.session_id ?? handoff.lead_id,
          event_payload: {
            correlation_id: correlationId,
            lead_id: handoff.lead_id,
            retry_count: handoff.retry_count + 1,
            success: results[results.length - 1].success,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (_) { /* best effort */ }

      // Small delay between retries to avoid hammering GHL
      if (failedHandoffs.indexOf(handoff) < failedHandoffs.length - 1) {
        await sleep(500);
      }
    }

    const delivered = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`[retry-failed-handoffs] Complete: ${delivered} delivered, ${failed} still failed`);

    return new Response(
      JSON.stringify({ ok: true, retried: results.length, delivered, failed, details: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[retry-failed-handoffs] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
