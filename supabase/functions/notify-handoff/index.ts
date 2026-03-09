import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  if (score >= 75 || context.journey_state === "decide") tags.push("selena - priority hot");
  if (context.inherited_home === true) tags.push("selena - inherited home");
  if (context.trust_signal_detected === true) tags.push("selena - trust signal");
  if (context.sms_consent === true) tags.push("selena - consent communications");
  if (context.pre_approved === true) tags.push("selena - finance ready");
  if (context.pre_approved === false) tags.push("selena - finance needed");
  if (context.viewed_report === true) tags.push("selena - viewed report");
  if ((context.budget as number) > 600000) tags.push("selena - vip prospect");
  if (!context.phone) tags.push("selena_missing_phone");
  if (context.ai_disclosure_accepted === true) tags.push("selena - consent ai disclosure");

  return tags;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { contact, context } = body;

    if (!contact?.phone && !contact?.email) {
      return new Response(
        JSON.stringify({ error: "Contact requires phone or email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!GHL_WEBHOOK_URL) {
      console.error("[notify-handoff] GHL_WEBHOOK_URL secret not set");
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

    const payload = {
      // Contact identity
      first_name: contact.firstName ?? contact.first_name ?? "",
      last_name: contact.lastName ?? contact.last_name ?? "",
      phone: contact.phone ?? "",
      email: contact.email ?? "",

      // Selena identifiers
      selena_lead_id: context.selena_lead_id ?? "",
      selena_session_id: context.session_id ?? "",

      // Intent + language
      selena_lead_intent_clean: context.intent ?? "",
      selena_intent_canonical: context.intent ?? "",
      selena_language_clean: context.language ?? "en",

      // Scores
      selena_readiness_score: context.readiness_score ?? 0,
      selena_urgency_score: context.urgency_score ?? 0,
      selena_motivation_score: context.motivation_score ?? 0,
      selena_financing_strength_score: context.financing_strength_score ?? 0,
      selena_data_quality_score: context.data_quality_score ?? 0,

      // Journey
      selena_journey_state: context.journey_state ?? "explore",
      selena_chip_phase_floor: context.chip_phase_floor ?? 0,
      selena_guide_count: guidesConsumed,
      selena_tools_completed: toolsCompleted,
      selena_cognitive_journey_stage: context.cognitive_journey_stage ?? "",
      selena_pipeline_stage: pipelineStage,
      selena_last_declared_goal: context.last_declared_goal ?? "",

      // Boolean flags
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

      // Calculator outputs
      selena_cash_offer_calc: context.cash_offer_calc ?? null,
      selena_listing_net_calc: context.listing_net_calc ?? null,
      selena_estimated_value_raw: context.estimated_value ?? "",
      selena_property_condition_raw: context.property_condition ?? "",

      // Property details
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

      // Financing
      selena_financing_status: context.financing_status ?? "",
      selena_financing_details_clean: context.financing_details ?? "",
      selena_is_pre_approved: context.pre_approved ? "yes" : "no",

      // Attribution
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

      // Guide/quiz
      selena_guide_id: context.guide_id ?? "",
      selena_guide_title: context.guide_title ?? "",
      selena_quiz_completed: context.quiz_completed ? "true" : "false",
      selena_quiz_result_path: context.quiz_result_path ?? "",

      // Consent
      selena_consent_timestamp: new Date().toISOString(),
      selena_consent_ai_disclosure: context.ai_disclosure_accepted ? "true" : "false",
      selena_consent_communications: context.sms_consent ?? false,
      selena_last_data_parse_date: new Date().toISOString(),

      // Tags array — GHL webhook accepts tags as array
      tags,
    };

    const ghlRes = await fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!ghlRes.ok) {
      const errText = await ghlRes.text();
      console.error("[notify-handoff] GHL webhook failed:", ghlRes.status, errText);
      return new Response(
        JSON.stringify({ error: "GHL webhook failed", status: ghlRes.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[notify-handoff] Handoff successful for:", contact.phone ?? contact.email);
    return new Response(
      JSON.stringify({ success: true, pipeline_stage: pipelineStage, tags }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[notify-handoff] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
