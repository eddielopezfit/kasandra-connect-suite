import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * notify-handoff
 * Sends lead handoff payload to GHL webhook with retry logic.
 * - 3 attempts with exponential backoff (1s → 3s → 9s)
 * - Updates lead_handoffs.delivery_status on success/failure
 * - P11: Generates bilingual (EN+ES) summary for Spanish-language leads
 * - Structured logging with lead_id, session_id, correlation_id
 */
const GHL_WEBHOOK_URL = Deno.env.get("GHL_WEBHOOK_URL") ?? "";

function derivePipelineStage(context: Record<string, unknown>): string {
  if (context.inherited_home === true && context.timeline === "asap") {
    return "Urgent / Distress Case (AI Escalated)";
  }
  if (context.journey_state === "decide") return "AI Qualified";
  const score = Number(context.readiness_score ?? 0);
  if (score >= 75) return "AI Qualified";
  if (score >= 50) return "AI Engaged (Qualifying)";
  return "New Lead / Inquiry";
}

function deriveTags(context: Record<string, unknown>): string[] {
  const tags: string[] = ["selena - intake completed", "selena - website lead", "selena_os_lead"];

  const intent = context.intent as string ?? "";
  if (intent === "buy") tags.push("selena - intent buyer");
  else if (intent === "sell") tags.push("selena - intent seller");
  else if (intent === "cash") tags.push("selena - intent cash");
  else if (intent === "dual") tags.push("selena - intent buy sell");
  else tags.push("selena - intent explore");

  const lang = context.language as string ?? "en";
  if (lang === "es") {
    tags.push("selena - language spanish");
    tags.push("selena_language_es");
  } else {
    tags.push("selena - language english");
    tags.push("selena_language_en");
  }

  const score = Number(context.readiness_score ?? 0);
  const leadScore = Number(context.lead_score ?? context.readiness_score ?? 0);

  if (leadScore >= 75 || score >= 75 || context.journey_state === "decide") {
    tags.push("score_hot");
    tags.push("selena - priority hot");
  } else if (leadScore >= 45 || score >= 45) {
    tags.push("score_warm");
  } else {
    tags.push("score_cold");
  }
  if (context.inherited_home === true) tags.push("selena - inherited home");
  if (context.trust_signal_detected === true) tags.push("selena - trust signal");
  if (context.sms_consent === true) tags.push("selena - consent communications");
  if (context.pre_approved === true) tags.push("selena - finance ready");
  if (context.pre_approved === false) tags.push("selena - finance needed");
  if (context.viewed_report === true) tags.push("selena - viewed report");
  if ((context.budget as number) > 600000) tags.push("selena - vip prospect");
  if (!context.phone) tags.push("selena_missing_phone");
  if (context.ai_disclosure_accepted === true) tags.push("selena - consent ai disclosure");

  // Agent Studio behavioral tags
  const toolsStr = Array.isArray(context.tools_completed)
    ? context.tools_completed.join(",")
    : (context.tools_completed as string ?? "");
  if (toolsStr) tags.push("selena_tools_used");
  const gcCount = Array.isArray(context.guides_consumed)
    ? context.guides_consumed.length
    : Number(context.guide_count ?? 0);
  if (gcCount >= 3) tags.push("selena_guide_reader");
  if (context.booking_intent_detected === true) tags.push("selena_booking_intent");
  if (context.va_loan === true) tags.push("selena_military");
  if (context.returning_visitor === true) tags.push("selena_returning_visitor");

  return tags;
}

/** Sleep helper for backoff */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * P11: Generate Spanish translation of conversation summary for ES leads.
 * Uses Lovable AI Gateway (Gemini Flash) for fast, cost-effective translation.
 * Falls back to a header-only Spanish label if translation fails.
 */
async function translateSummaryToSpanish(
  summaryMd: string,
  correlationId: string,
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY || !summaryMd) return "";

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You are a professional bilingual translator for a real estate CRM. Translate the following lead conversation summary from English to Spanish. Keep formatting (markdown), proper nouns, and dollar amounts unchanged. Output ONLY the Spanish translation, no preamble.",
          },
          { role: "user", content: summaryMd },
        ],
      }),
    });

    if (!res.ok) {
      console.warn(`[notify-handoff] [${correlationId}] P11 translation failed: ${res.status}`);
      return "";
    }

    const data = await res.json();
    const translated = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (translated) {
      console.log(`[notify-handoff] [${correlationId}] P11 Spanish summary generated (${translated.length} chars)`);
    }
    return translated;
  } catch (err) {
    console.warn(`[notify-handoff] [${correlationId}] P11 translation error:`, (err as Error).message);
    return "";
  }
}

/** Retry GHL webhook with exponential backoff: 1s → 3s → 9s */
async function sendWithRetry(
  payload: Record<string, unknown>,
  maxAttempts = 3,
  correlationId: string,
): Promise<{ ok: boolean; attempt: number; status?: number; error?: string }> {
  const backoffMs = [1000, 3000, 9000];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[notify-handoff] [${correlationId}] Attempt ${attempt}/${maxAttempts}`);

      const ghlRes = await fetch(GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (ghlRes.ok) {
        console.log(`[notify-handoff] [${correlationId}] ✅ Delivered on attempt ${attempt}`);
        return { ok: true, attempt, status: ghlRes.status };
      }

      const errText = await ghlRes.text();
      console.warn(`[notify-handoff] [${correlationId}] Attempt ${attempt} failed: ${ghlRes.status} — ${errText?.slice(0, 300)}`);

      if (attempt < maxAttempts) {
        const waitMs = backoffMs[attempt - 1] ?? 9000;
        console.log(`[notify-handoff] [${correlationId}] Backing off ${waitMs}ms`);
        await sleep(waitMs);
      } else {
        return { ok: false, attempt, status: ghlRes.status, error: errText?.slice(0, 500) };
      }
    } catch (fetchErr) {
      const errMsg = (fetchErr as Error)?.message ?? String(fetchErr);
      console.error(`[notify-handoff] [${correlationId}] Attempt ${attempt} network error: ${errMsg}`);

      if (attempt < maxAttempts) {
        const waitMs = backoffMs[attempt - 1] ?? 9000;
        await sleep(waitMs);
      } else {
        return { ok: false, attempt, error: errMsg };
      }
    }
  }

  return { ok: false, attempt: maxAttempts, error: "Exhausted all retry attempts" };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Internal-caller guard: only callable with service role key
  const authHeader = req.headers.get('Authorization') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!authHeader.startsWith('Bearer ') || authHeader.slice(7) !== serviceKey) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Init Supabase client for DB updates
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json();
    const { contact, context } = body;
    const handoffId = context?.handoff_id ?? null;
    const correlationId = handoffId ?? `anon_${Date.now()}`;

    console.log(`[notify-handoff] [${correlationId}] Starting for lead=${context?.selena_lead_id}, session=${context?.session_id}`);

    if (!contact?.phone && !contact?.email) {
      return new Response(
        JSON.stringify({ error: "Contact requires phone or email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!GHL_WEBHOOK_URL) {
      console.error(`[notify-handoff] [${correlationId}] GHL_WEBHOOK_URL secret not set`);
      if (handoffId) {
        await supabase.from("lead_handoffs").update({
          delivery_status: "failed",
          last_error: "GHL_WEBHOOK_URL not configured",
        }).eq("id", handoffId);
      }
      return new Response(
        JSON.stringify({ error: "Webhook not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const toolsCompleted = Array.isArray(context.tools_completed)
      ? context.tools_completed.join(",")
      : (context.tools_completed ?? "");

    const guidesConsumed = Array.isArray(context.guides_consumed)
      ? context.guides_consumed.length
      : Number(context.guide_count ?? 0);

    const pipelineStage = derivePipelineStage(context);
    const tags = deriveTags({ ...context, phone: contact.phone });

    // Build GHL payload — UNCHANGED from original
    const payload: Record<string, unknown> = {
      first_name: contact.firstName ?? contact.first_name ?? "",
      last_name: contact.lastName ?? contact.last_name ?? "",
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      selena_lead_id: context.selena_lead_id ?? "",
      selena_session_id: context.session_id ?? "",
      selena_lead_intent_clean: context.intent ?? "",
      selena_intent_canonical: context.intent ?? "",
      selena_language_clean: context.language ?? "en",
      selena_score: context.lead_score ?? context.readiness_score ?? 0,
      selena_readiness_score: context.readiness_score ?? 0,
      lead_temperature: (() => {
        const s = Number(context.lead_score ?? context.readiness_score ?? 0);
        return s >= 75 ? "hot" : s >= 45 ? "warm" : "cold";
      })(),
      selena_urgency_score: context.urgency_score ?? 0,
      selena_motivation_score: context.motivation_score ?? 0,
      selena_financing_strength_score: context.financing_strength_score ?? 0,
      selena_data_quality_score: context.data_quality_score ?? 0,
      selena_journey_state: context.journey_state ?? "explore",
      selena_chip_phase_floor: context.chip_phase_floor ?? 0,
      selena_guide_count: guidesConsumed,
      selena_tools_completed: toolsCompleted,
      selena_cognitive_journey_stage: context.cognitive_journey_stage ?? "",
      selena_pipeline_stage: pipelineStage,
      selena_last_declared_goal: context.last_declared_goal ?? "",
      selena_inherited_home: context.inherited_home ?? false,
      selena_trust_signal_detected: context.trust_signal_detected ?? false,
      selena_va_loan_flag: context.va_loan ?? false,
      selena_cash_flag: context.cash_buyer ?? false,
      selena_pre_approved_flag: context.pre_approved ?? false,
      selena_buying_and_selling_flag: context.intent === "dual",
      selena_seller_motivation_flag: context.seller_motivation ?? false,
      selena_luxury_flag: Number(context.budget ?? 0) > 600000,
      selena_buyer_intent_flag: context.intent === "buy" || context.intent === "dual",
      selena_booked_flag: context.booked ?? false,
      selena_intake_completed_flag: true,
      selena_lender_connected_flag: context.lender_connected ?? false,
      selena_cash_offer_calc: context.cash_offer_calc ?? null,
      selena_listing_net_calc: context.listing_net_calc ?? null,
      selena_estimated_value_raw: context.estimated_value ?? "",
      selena_property_condition_raw: context.property_condition ?? "",
      selena_property_address: context.property_address ?? "",
      selena_inquiry_address: context.property_address ?? "",
      selena_neighborhood_clean: context.last_neighborhood ?? "",
      selena_target_neighborhoods: context.target_neighborhoods ?? "",
      selena_budget_clean: context.budget ?? null,
      selena_budget_max: context.budget_max ?? null,
      selena_bedrooms_clean: context.bedrooms ?? null,
      selena_bathrooms_clean: context.bathrooms ?? null,
      selena_property_type: context.property_type ?? "",
      selena_timeframe_clean: context.timeline ?? "",
      selena_timeline_raw: context.timeline_raw ?? "",
      selena_move_in_date_raw: context.move_in_date ?? null,
      selena_amenities_clean: context.amenities ?? "",
      selena_financing_status: context.financing_status ?? "",
      selena_financing_details_clean: context.financing_details ?? "",
      selena_is_preapproved: context.pre_approved ? "yes" : "no",
      selena_source: context.entry_source ?? "selena_chat",
      selena_page_path: context.page_path ?? "",
      selena_session_source: context.session_source ?? "",
      selena_referrer: context.referrer ?? "",
      selena_utm_source: context.utm_source ?? "",
      selena_utm_campaign: context.utm_campaign ?? "",
      selena_utm_medium: context.utm_medium ?? "",
      selena_utm_content: context.utm_content ?? "",
      selena_utm_term: context.utm_term ?? "",
      selena_ad_funnel_source: context.ad_funnel_source ?? "",
      selena_guide_id: context.guide_id ?? "",
      selena_guide_title: context.guide_title ?? "",
      selena_quiz_completed: context.quiz_completed ? "true" : "false",
      selena_quiz_result_path: context.quiz_result_path ?? "",
      selena_consent_timestamp: new Date().toISOString(),
      selena_consent_ai_disclosure: context.ai_disclosure_accepted ? "true" : "false",
      selena_consent_communications: context.sms_consent ?? false,
      selena_last_data_parse_date: new Date().toISOString(),
      selena_convo_summary: context.convo_summary ?? "",
      tags,
      // Agent Studio structured dossier — single parseable JSON field
      selena_dossier_json: JSON.stringify({
        intent: context.intent ?? "explore",
        timeline: context.timeline ?? null,
        budget: context.budget ?? null,
        budget_max: context.budget_max ?? null,
        readiness_score: context.readiness_score ?? 0,
        lead_score: context.lead_score ?? 0,
        tools_completed: toolsCompleted ? toolsCompleted.split(",") : [],
        guides_read: Array.isArray(context.guides_consumed) ? context.guides_consumed : [],
        guide_count: guidesConsumed,
        neighborhood_interest: context.target_neighborhoods ?? context.last_neighborhood ?? null,
        language: context.language ?? "en",
        pain_points: context.pain_points ?? [],
        recommended_next_step: context.recommended_next_step ?? null,
        last_tool_result: context.last_tool_result ?? null,
        source: context.entry_source ?? "selena_chat",
        property_address: context.property_address ?? null,
        property_condition: context.property_condition ?? null,
        financing_status: context.financing_status ?? null,
        va_loan: context.va_loan ?? false,
        inherited: context.inherited_home ?? false,
        journey_state: context.journey_state ?? "explore",
        convo_summary: context.convo_summary ?? null,
      }),
    };

    // ============= P11: BILINGUAL SUMMARY FOR ES LEADS =============
    const language = (context.language as string ?? "en").toLowerCase();
    const summaryMd = (context.summary_md as string) ?? "";
    if (language === "es" && summaryMd) {
      const spanishSummary = await translateSummaryToSpanish(summaryMd, correlationId);
      if (spanishSummary) {
        // Add Spanish summary as separate field for GHL
        payload.selena_summary_es = spanishSummary;
        // Also create a bilingual combined summary
        payload.selena_summary_bilingual = `--- ENGLISH ---\n${summaryMd}\n\n--- ESPAÑOL ---\n${spanishSummary}`;
      }
    }

    // Send with retry (3 attempts, exponential backoff)
    const result = await sendWithRetry(payload, 3, correlationId);

    // Update handoff record with delivery status
    if (handoffId) {
      if (result.ok) {
        await supabase.from("lead_handoffs").update({
          delivery_status: "delivered",
          notified_at: new Date().toISOString(),
          notification_provider: "leadconnector",
        }).eq("id", handoffId);
      } else {
        // Increment retry_count and mark failed
        const { data: current } = await supabase
          .from("lead_handoffs")
          .select("retry_count")
          .eq("id", handoffId)
          .maybeSingle();

        await supabase.from("lead_handoffs").update({
          delivery_status: "failed",
          retry_count: (current?.retry_count ?? 0) + result.attempt,
          last_error: result.error?.slice(0, 1000) ?? "Unknown error",
        }).eq("id", handoffId);
      }
    }

    if (!result.ok) {
      // Log failure to event_log for observability
      try {
        await supabase.from("event_log").insert({
          event_type: "handoff_notify_failed",
          session_id: context?.session_id || contact?.email || "unknown",
          event_payload: {
            correlation_id: correlationId,
            lead_id: context?.selena_lead_id,
            contact_phone: contact?.phone || null,
            contact_email: contact?.email || null,
            ghl_status: result.status,
            ghl_error: result.error?.slice(0, 500) || "unknown",
            pipeline_stage: pipelineStage,
            attempts: result.attempt,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (logErr) {
        console.error(`[notify-handoff] [${correlationId}] Failed to log failure:`, logErr);
      }

      return new Response(
        JSON.stringify({ error: "GHL webhook failed after retries", status: result.status, attempts: result.attempt }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[notify-handoff] [${correlationId}] ✅ Handoff delivered for: ${contact.phone ?? contact.email}`);
    return new Response(
      JSON.stringify({ success: true, pipeline_stage: pipelineStage, tags, attempts: result.attempt }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[notify-handoff] Unexpected error:", err);
    try {
      await supabase.from("event_log").insert({
        event_type: "handoff_notify_failed",
        session_id: "unknown",
        event_payload: {
          error: String((err as Error)?.message ?? err),
          type: "unexpected_error",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (_) { /* best effort */ }
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
