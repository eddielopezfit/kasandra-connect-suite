import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

/**
 * sync-vip-to-crm
 * Lightweight GHL sync triggered on key VIP state changes:
 *   - Tool completion
 *   - Readiness threshold crossed
 *   - Returning user re-engagement
 * 
 * NOT a full handoff — just behavioral tag + field updates.
 * Requires lead_id (identified user) to fire.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SyncPayload {
  lead_id: string;
  session_id?: string;
  // VIP-derived fields
  intent?: string;
  timeline?: string;
  readiness_score?: number;
  tools_completed?: string[];
  guides_read_count?: number;
  estimated_value?: number;
  estimated_budget?: number;
  seller_decision_path?: string;
  primary_priority?: string;
  language?: string;
  journey_depth?: string;
  booking_readiness?: string;
  friction_score?: number;
  has_booked?: boolean;
  // Trigger context
  trigger: 'tool_completion' | 'readiness_threshold' | 'returning_user' | 'context_update';
  trigger_detail?: string;
}

function deriveBehaviorTags(p: SyncPayload): string[] {
  const tags: string[] = ["selena_os_lead"];

  // Intent tags
  if (p.intent === "buy") tags.push("selena_buyer_lead");
  else if (p.intent === "sell") tags.push("selena_seller_lead");
  else if (p.intent === "cash") tags.push("selena_cash_lead");
  else if (p.intent === "dual") tags.push("selena_dual_lead");

  // Readiness-based tags
  const score = p.readiness_score ?? 0;
  if (score >= 75) tags.push("selena_high_intent", "score_hot");
  else if (score >= 45) tags.push("score_warm");

  // Behavioral tags
  if ((p.tools_completed?.length ?? 0) >= 2) tags.push("selena_multi_tool_user");
  if ((p.guides_read_count ?? 0) >= 5) tags.push("selena_guide_reader");
  if (p.friction_score && p.friction_score >= 50) tags.push("selena_high_friction");
  if (p.booking_readiness === "overdue") tags.push("selena_booking_overdue");
  if (p.booking_readiness === "ready") tags.push("selena_booking_ready");
  if (p.has_booked) tags.push("selena_booked");
  if (p.seller_decision_path) tags.push(`selena_path_${p.seller_decision_path}`);

  // Journey depth
  if (p.journey_depth === "ready") tags.push("selena_journey_ready");
  else if (p.journey_depth === "engaged") tags.push("selena_journey_engaged");

  // Language
  if (p.language === "es") tags.push("selena_language_es");

  // Trigger-specific
  if (p.trigger === "returning_user") tags.push("selena_returning_visitor");
  if (p.trigger === "tool_completion" && p.trigger_detail) {
    tags.push(`selena_tool_${p.trigger_detail}`);
  }

  return tags;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: SyncPayload = await req.json();

    // Guard: must have lead_id
    if (!body.lead_id || !UUID_RE.test(body.lead_id)) {
      return new Response(
        JSON.stringify({ ok: false, error: "lead_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Rate limit: max 6 syncs per lead per 15-min window
    const rl = await checkRateLimit(supabase, `crm:${body.lead_id}`, "sync-vip-to-crm", 6, 15);
    if (!rl.allowed) return rateLimitResponse(corsHeaders);

    const ghlWebhookUrl = Deno.env.get("GHL_WEBHOOK_URL");
    if (!ghlWebhookUrl) {
      console.warn("[sync-vip-to-crm] GHL_WEBHOOK_URL not configured");
      return new Response(
        JSON.stringify({ ok: false, error: "webhook_not_configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch lead profile for contact info
    const { data: lead } = await supabase
      .from("lead_profiles")
      .select("email, name, phone, ghl_contact_id")
      .eq("id", body.lead_id)
      .maybeSingle();

    if (!lead?.email) {
      return new Response(
        JSON.stringify({ ok: false, error: "lead_not_found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build tags
    const tags = deriveBehaviorTags(body);

    // Build lightweight GHL payload (behavioral update, not full handoff)
    const toolsStr = (body.tools_completed ?? []).join(",");
    const nameParts = (lead.name ?? "").split(" ");

    const ghlPayload: Record<string, unknown> = {
      email: lead.email,
      phone: lead.phone ?? "",
      firstName: nameParts[0] ?? "",
      lastName: nameParts.slice(1).join(" ") ?? "",
      tags,
      // Selena behavioral fields
      selena_lead_id: body.lead_id,
      selena_session_id: body.session_id ?? "",
      selena_intent_canonical: body.intent ?? "",
      selena_score: body.readiness_score ?? 0,
      selena_readiness_score: body.readiness_score ?? 0,
      selena_journey_state: body.journey_depth ?? "",
      selena_tools_completed: toolsStr,
      selena_guide_count: body.guides_read_count ?? 0,
      selena_timeframe_clean: body.timeline ?? "",
      selena_estimated_value_raw: body.estimated_value ?? "",
      selena_budget_clean: body.estimated_budget ?? null,
      selena_language_clean: body.language ?? "en",
      // VIP orchestration fields (new)
      selena_booking_readiness: body.booking_readiness ?? "",
      selena_friction_score: body.friction_score ?? 0,
      selena_journey_depth: body.journey_depth ?? "new",
      selena_primary_priority: body.primary_priority ?? "",
      selena_seller_path: body.seller_decision_path ?? "",
      // Sync metadata
      selena_last_sync_trigger: body.trigger,
      selena_last_sync_detail: body.trigger_detail ?? "",
      selena_last_data_parse_date: new Date().toISOString(),
    };

    // Fire webhook (fire-and-forget style, single attempt for behavioral sync)
    const ghlRes = await fetch(ghlWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ghlPayload),
    });

    const synced = ghlRes.ok;

    if (!synced) {
      const errText = await ghlRes.text().catch(() => "unknown");
      console.error(`[sync-vip-to-crm] GHL failed: ${ghlRes.status} — ${errText.slice(0, 300)}`);
      // Log failure but don't block
      await supabase.from("event_log").insert({
        event_type: "crm_sync_failed",
        session_id: body.session_id ?? body.lead_id,
        event_payload: {
          lead_id: body.lead_id,
          trigger: body.trigger,
          status: ghlRes.status,
          error: errText.slice(0, 500),
        },
      }).catch(() => {});
    } else {
      console.log(`[sync-vip-to-crm] ✅ Synced lead=${body.lead_id} trigger=${body.trigger}`);
      // Update ghl_synced_at
      await supabase
        .from("lead_profiles")
        .update({ ghl_synced_at: new Date().toISOString() })
        .eq("id", body.lead_id)
        .catch(() => {});
    }

    return new Response(
      JSON.stringify({ ok: true, synced, tags_count: tags.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[sync-vip-to-crm] error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
