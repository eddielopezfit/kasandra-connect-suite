/**
 * enrich-booking-context
 * 
 * Selena OS V2 — Priority 1: Booking Dossier Bridge
 * 
 * Called from /book page BEFORE the GHL calendar renders.
 * Gathers session context, enriches lead_profiles, and returns
 * a structured dossier that gets synced to GHL before the booking.
 * 
 * This closes the #1 continuity gap: Kasandra now knows who she's
 * meeting before every call.
 * 
 * Input: session context + any available lead identity
 * Output: lead_id + GHL custom field map + dossier summary
 */

import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";

interface BookingDossierInput {
  session_id: string;
  lead_id?: string;
  // Session context fields
  intent?: string;
  situation?: string;
  timeline?: string;
  language?: string;
  readiness_score?: number;
  readiness_type?: string; // 'buyer' | 'seller' | 'cash'
  primary_priority?: string;
  tools_completed?: string[];
  guides_read?: string[];
  guides_read_count?: number;
  calculator_advantage?: string;
  calculator_difference?: number;
  estimated_value?: number;
  estimated_budget?: number;
  decision_receipt_id?: string;
  seller_decision_path?: string;
  seller_goal_priority?: string;
  property_condition_raw?: string;
  journey_state?: string;
  chip_phase_floor?: number;
  inherited_home?: boolean;
  trust_signal_detected?: boolean;
  military_flag?: boolean;
  neighborhood_zip?: string;
  last_guide_id?: string;
  last_guide_title?: string;
  selena_mode_reached?: number;
  session_duration_minutes?: number;
  utm_source?: string;
  utm_campaign?: string;
  source?: string;
}

interface DossierResult {
  ok: boolean;
  lead_id?: string;
  ghl_contact_id?: string;
  dossier_summary?: string;
  ghl_fields?: Record<string, string | number | boolean | null>;
  enrichment_applied?: boolean;
  error?: string;
}

const GHL_WEBHOOK_URL = Deno.env.get("GHL_WEBHOOK_URL") ?? "";
const GHL_API_KEY = Deno.env.get("GHL_PRIVATE_KEY") ?? Deno.env.get("GHL_API_KEY") ?? "";
const LOCATION_ID = "kGfxAFqz1M7sxRFm52L1";

// GHL Custom Field IDs for dossier fields
// Updated: March 22, 2026 — Selena OS V2
const GHL_FIELD_MAP: Record<string, string> = {
  // Existing fields (pre-V2)
  selena_readiness_score:       "NqG82B0164rele7tbEuN",
  selena_tools_completed:       "eKMst8aUcORUR4RugvN1",
  selena_lead_score:            "sSva6S7jKLjoCmFrtUin",
  selena_lead_grade:            "w1P7U1RuMg5VchusMiKo",
  selena_inherited_home:        "9VEre2DWrGfMg83NScrr",
  selena_va_loan_flag:          "ShnuRzNGIDW34HJOLlHY",
  selena_journey_state:         "3BjSjUnXWFr5ts73NeBz",
  selena_intent_canonical:      "AcVCNvG3T1LLf2Oa4LPZ",
  selena_language_clean:        "4AhVaJRCBwVmDwwGjtYd",
  selena_chip_phase_floor:      "zvctcQqIyAHWe6mXNiE8",
  selena_quiz_result_path:      "D2VJXlUZdKnK78YQXvhZ",
  selena_primary_priority:      "ktCzJ259EizemTccTpea",
  selena_session_id:            "tvtc3objtLZNcwsje8g5",
  selena_guide_count:           "qnOHcGc2b5YCXW1iuY3W",
  selena_trust_signal_detected: "0KYO9c6TcmOK8z73lQJg",
  selena_booked_flag:           "axmzzHRg5EH4T6mSDXzD",
  selena_property_address:      "dcynoVYrEobAGJeqSJon",
  selena_cash_offer_calc:       "6gr2eEk9fli6qkwJiEPW",
  selena_listing_net_calc:      "R7iaG1OalaXqd3SKemqo",
  selena_budget_max:            "nS60EDld6TcOeCOEH4Y4",
  // New V2 fields (created March 22, 2026)
  selena_guides_read_count:     "Sm67hm1RmsvdvmQ6S8Qy",
  selena_decision_receipt_id:   "7biLTsqwUxNAZyT9lBTY",
  selena_calculator_advantage:  "VXoQ25k3IVfWGoBtPBtf",
  selena_booking_dossier:       "cz93nVyY8iHqB1grk5xq",
  selena_estimated_budget:      "uszDtv1ZIz2jpVwBctWJ",
  selena_estimated_value:       "K9l9v4RXSJEbaCGkKZL5",
  selena_seller_decision_path:  "U7Y8E8AK4OsWuY6y6c3C",
  selena_property_context:      "OnNOasv6cDbMPXMIlFLz",
  selena_session_duration_min:  "yB6hOY4LPPENEHaspZ7U",
  selena_voice_call_summary:    "032asfBmNkyb5WpeQClA",
};

/**
 * Build human-readable dossier summary for Kasandra
 */
function buildDossierSummary(input: BookingDossierInput): string {
  const lines: string[] = ["=== SELENA OS V2 BOOKING DOSSIER ===\n"];
  
  const intentLabel: Record<string, string> = {
    buy: "BUYER", sell: "SELLER", cash: "CASH OFFER SELLER",
    dual: "BUYER + SELLER", explore: "EXPLORING",
  };
  lines.push(`INTENT: ${intentLabel[input.intent || 'explore'] || (input.intent || 'unknown').toUpperCase()}`);
  
  if (input.situation && input.situation !== 'none') {
    const situLabels: Record<string, string> = {
      inherited: "Inherited Property", divorce: "Divorce/Life Change",
      tired_landlord: "Tired Landlord", relocating: "Relocating", other: "Other",
    };
    lines.push(`SITUATION: ${situLabels[input.situation] || input.situation}`);
  }
  if (input.timeline) {
    const tlLabels: Record<string, string> = {
      asap: "URGENT — ASAP", "30_days": "30 Days", "60_90": "60-90 Days", exploring: "Exploring / Flexible",
    };
    lines.push(`TIMELINE: ${tlLabels[input.timeline] || input.timeline}`);
  }
  if (input.language) {
    lines.push(`LANGUAGE: ${input.language === 'es' ? 'Spanish (ES)' : 'English (EN)'}`);
  }
  
  lines.push("");
  lines.push("--- QUALIFICATION ---");
  if (input.readiness_score && input.readiness_score > 0) {
    const band = input.readiness_score >= 75 ? "READY" : input.readiness_score >= 50 ? "NEARLY READY" : "BUILDING";
    lines.push(`READINESS: ${input.readiness_score}/100 (${band}) — ${input.readiness_type || 'unknown'} readiness`);
  }
  if (input.primary_priority) lines.push(`PRIORITY: ${input.primary_priority}`);
  if (input.journey_state) lines.push(`JOURNEY STATE: ${input.journey_state.toUpperCase()}`);
  if (input.selena_mode_reached) lines.push(`SELENA MODE REACHED: Mode ${input.selena_mode_reached}`);
  
  lines.push("");
  lines.push("--- TOOLS USED ---");
  if (input.tools_completed && input.tools_completed.length > 0) {
    lines.push(`TOOLS COMPLETED: ${input.tools_completed.join(', ')}`);
  } else {
    lines.push("No tools completed");
  }
  if (input.guides_read_count && input.guides_read_count > 0) {
    lines.push(`GUIDES READ: ${input.guides_read_count}`);
    if (input.last_guide_title) lines.push(`LAST GUIDE: ${input.last_guide_title}`);
  }
  
  lines.push("");
  lines.push("--- CALCULATOR RESULTS ---");
  if (input.estimated_value && input.estimated_value > 0) {
    lines.push(`PROPERTY VALUE: $${input.estimated_value.toLocaleString()}`);
  }
  if (input.estimated_budget && input.estimated_budget > 0) {
    lines.push(`BUYER BUDGET (MAX): $${input.estimated_budget.toLocaleString()}`);
  }
  if (input.calculator_advantage) {
    const diff = input.calculator_difference 
      ? ` (+$${Math.round(input.calculator_difference).toLocaleString()} with ${input.calculator_advantage})`
      : "";
    lines.push(`CALCULATOR: ${input.calculator_advantage.toUpperCase()} path recommended${diff}`);
  }
  
  if (input.seller_decision_path || input.seller_goal_priority) {
    lines.push("");
    lines.push("--- SELLER DECISION ---");
    if (input.seller_decision_path) lines.push(`RECOMMENDED PATH: ${input.seller_decision_path.toUpperCase()}`);
    if (input.seller_goal_priority) lines.push(`SELLER GOAL: ${input.seller_goal_priority}`);
    if (input.property_condition_raw) lines.push(`CONDITION: ${input.property_condition_raw}`);
    if (input.decision_receipt_id) lines.push(`RECEIPT ID: ${input.decision_receipt_id}`);
  }
  
  lines.push("");
  lines.push("--- FLAGS ---");
  if (input.inherited_home) lines.push("FLAG: Inherited Property");
  if (input.military_flag) lines.push("FLAG: Military / VA Buyer");
  if (input.trust_signal_detected) lines.push("FLAG: Trust Signal Detected");
  if (input.neighborhood_zip) lines.push(`NEIGHBORHOOD: ZIP ${input.neighborhood_zip}`);
  
  if (input.utm_source || input.utm_campaign) {
    lines.push("");
    lines.push("--- SOURCE ---");
    if (input.utm_source) lines.push(`SOURCE: ${input.utm_source}`);
    if (input.utm_campaign) lines.push(`CAMPAIGN: ${input.utm_campaign}`);
  }
  
  lines.push("\n=== END DOSSIER ===");
  return lines.join("\n");
}

/**
 * Build GHL custom field payload from dossier input
 */
function buildGHLFields(input: BookingDossierInput): Record<string, string | number | boolean | null> {
  const fields: Record<string, string | number | boolean | null> = {};
  
  if (input.readiness_score != null) fields[GHL_FIELD_MAP.selena_readiness_score] = input.readiness_score;
  if (input.tools_completed?.length) fields[GHL_FIELD_MAP.selena_tools_completed] = input.tools_completed.join(",");
  if (input.intent) fields[GHL_FIELD_MAP.selena_intent_canonical] = input.intent;
  if (input.language) fields[GHL_FIELD_MAP.selena_language_clean] = input.language;
  if (input.journey_state) fields[GHL_FIELD_MAP.selena_journey_state] = input.journey_state;
  if (input.chip_phase_floor != null) fields[GHL_FIELD_MAP.selena_chip_phase_floor] = input.chip_phase_floor;
  if (input.primary_priority) fields[GHL_FIELD_MAP.selena_primary_priority] = input.primary_priority;
  if (input.session_id) fields[GHL_FIELD_MAP.selena_session_id] = input.session_id;
  if (input.guides_read_count != null) fields[GHL_FIELD_MAP.selena_guide_count] = input.guides_read_count;
  if (input.selena_mode_reached != null) fields["Selena AI Mode"] = String(input.selena_mode_reached);
  if (input.inherited_home != null) fields[GHL_FIELD_MAP.selena_inherited_home] = input.inherited_home;
  if (input.military_flag != null) fields[GHL_FIELD_MAP.selena_va_loan_flag] = input.military_flag ? "yes" : "no";
  if (input.trust_signal_detected != null) fields[GHL_FIELD_MAP.selena_trust_signal_detected] = !!input.trust_signal_detected;
  if (input.estimated_value && input.estimated_value > 0) fields[GHL_FIELD_MAP.selena_cash_offer_calc] = input.estimated_value;
  if (input.estimated_budget && input.estimated_budget > 0) fields[GHL_FIELD_MAP.selena_budget_max] = input.estimated_budget;
  // New V2 fields
  if (input.guides_read_count != null) fields[GHL_FIELD_MAP.selena_guides_read_count] = input.guides_read_count;
  if (input.decision_receipt_id) fields[GHL_FIELD_MAP.selena_decision_receipt_id] = input.decision_receipt_id;
  if (input.calculator_advantage) fields[GHL_FIELD_MAP.selena_calculator_advantage] = input.calculator_advantage;
  if (input.seller_decision_path) fields[GHL_FIELD_MAP.selena_seller_decision_path] = input.seller_decision_path;
  if (input.estimated_budget && input.estimated_budget > 0) fields[GHL_FIELD_MAP.selena_estimated_budget] = input.estimated_budget;
  if (input.estimated_value && input.estimated_value > 0) fields[GHL_FIELD_MAP.selena_estimated_value] = input.estimated_value;
  if (input.session_duration_minutes != null) fields[GHL_FIELD_MAP.selena_session_duration_min] = input.session_duration_minutes;
  // Mark as booked
  fields[GHL_FIELD_MAP.selena_booked_flag] = true;
  
  return fields;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: BookingDossierInput = await req.json();
    
    if (!body.session_id) {
      return new Response(
        JSON.stringify({ ok: false, error: "session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit
    const rlKey = extractRateLimitKey(req, body as unknown as Record<string, unknown>);
    const rl = await checkRateLimit(supabase, rlKey, "enrich-booking-context");
    if (!rl.allowed) return rateLimitResponse(corsHeaders);

    // ── Server-side enrichment: pull session_snapshots + guides + decision receipts ──
    let serverEnriched = { ...body };

    if (body.session_id) {
      // 1. Pull latest session_snapshot for this session
      const { data: snap } = await supabase
        .from("session_snapshots")
        .select("*")
        .eq("session_id", body.session_id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (snap) {
        // Merge server data where client didn't provide it
        if (!serverEnriched.lead_id && snap.lead_id) serverEnriched.lead_id = snap.lead_id;
        if (!serverEnriched.intent && snap.intent) serverEnriched.intent = snap.intent;
        if (!serverEnriched.readiness_score && snap.readiness_score) serverEnriched.readiness_score = snap.readiness_score;
        if (!serverEnriched.primary_priority && snap.primary_priority) serverEnriched.primary_priority = snap.primary_priority;
        if (!serverEnriched.tools_completed?.length && snap.tools_used?.length) serverEnriched.tools_completed = snap.tools_used;
        if (!serverEnriched.guides_read?.length && snap.guides_read?.length) serverEnriched.guides_read = snap.guides_read;
        if (!serverEnriched.guides_read_count && snap.guides_read?.length) serverEnriched.guides_read_count = snap.guides_read.length;

        // Extract calculator data from context_json
        const ctx = snap.context_json as Record<string, unknown> | null;
        if (ctx) {
          if (!serverEnriched.situation && ctx.situation) serverEnriched.situation = ctx.situation as string;
          if (!serverEnriched.timeline && ctx.timeline) serverEnriched.timeline = ctx.timeline as string;
          if (!serverEnriched.journey_state && ctx.journey_state) serverEnriched.journey_state = ctx.journey_state as string;
          if (!serverEnriched.seller_decision_path && ctx.seller_decision_recommended_path) serverEnriched.seller_decision_path = ctx.seller_decision_recommended_path as string;
          if (!serverEnriched.seller_goal_priority && ctx.seller_goal_priority) serverEnriched.seller_goal_priority = ctx.seller_goal_priority as string;
          if (!serverEnriched.property_condition_raw && ctx.property_condition_raw) serverEnriched.property_condition_raw = ctx.property_condition_raw as string;
          if (!serverEnriched.neighborhood_zip && ctx.last_neighborhood_zip) serverEnriched.neighborhood_zip = ctx.last_neighborhood_zip as string;
          if (ctx.inherited_home) serverEnriched.inherited_home = true;
          if (ctx.military_flag) serverEnriched.military_flag = true;
        }

        // Extract calculator results
        const calc = snap.calculator_data as Record<string, unknown> | null;
        if (calc) {
          if (!serverEnriched.estimated_value && calc.estimated_value) serverEnriched.estimated_value = calc.estimated_value as number;
          if (!serverEnriched.estimated_budget && calc.estimated_budget) serverEnriched.estimated_budget = calc.estimated_budget as number;
          if (!serverEnriched.calculator_advantage && calc.calculator_advantage) serverEnriched.calculator_advantage = calc.calculator_advantage as string;
          if (!serverEnriched.calculator_difference && calc.calculator_difference) serverEnriched.calculator_difference = calc.calculator_difference as number;
        }
      }

      // 2. Pull latest decision receipt for this session (if not already provided)
      if (!serverEnriched.decision_receipt_id) {
        const { data: receipt } = await supabase
          .from("decision_receipts")
          .select("id, receipt_type, receipt_data")
          .eq("session_id", body.session_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (receipt) {
          serverEnriched.decision_receipt_id = receipt.id;
          const rd = receipt.receipt_data as Record<string, unknown> | null;
          if (rd && !serverEnriched.seller_decision_path && rd.recommended_path) {
            serverEnriched.seller_decision_path = rd.recommended_path as string;
          }
        }
      }

      // 3. Pull last 3 guide titles from guides_read array
      if (serverEnriched.guides_read?.length && !serverEnriched.last_guide_title) {
        const lastGuideId = serverEnriched.guides_read[serverEnriched.guides_read.length - 1];
        serverEnriched.last_guide_id = lastGuideId;
        // Guide title will be included from client context if available
      }
    }

    // Build dossier with server-enriched data
    const dossierSummary = buildDossierSummary(serverEnriched);
    const ghlFields = buildGHLFields(serverEnriched);

    // Find or use lead_id from session
    let leadId = serverEnriched.lead_id || null;
    let ghlContactId: string | null = null;

    if (!leadId && body.session_id) {
      const { data: snap } = await supabase
        .from("session_snapshots")
        .select("lead_id")
        .eq("session_id", body.session_id)
        .maybeSingle();
      if (snap?.lead_id) leadId = snap.lead_id;
    }

    // Enrich lead_profiles if we have a lead_id
    if (leadId) {
      const enrichmentUpdate: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (serverEnriched.readiness_score != null) enrichmentUpdate.readiness_score = serverEnriched.readiness_score;
      if (serverEnriched.tools_completed?.length) enrichmentUpdate.tools_completed = serverEnriched.tools_completed;
      if (serverEnriched.guides_read_count != null) enrichmentUpdate.guides_read_count = serverEnriched.guides_read_count;
      enrichmentUpdate.booking_intent_shown_at = new Date().toISOString();
      if (serverEnriched.military_flag) enrichmentUpdate.is_military = serverEnriched.military_flag;
      if (serverEnriched.estimated_budget && serverEnriched.estimated_budget > 0) enrichmentUpdate.estimated_budget = serverEnriched.estimated_budget;
      if (serverEnriched.estimated_value && serverEnriched.estimated_value > 0) enrichmentUpdate.estimated_value = serverEnriched.estimated_value;
      if (serverEnriched.decision_receipt_id) enrichmentUpdate.decision_receipt_id = serverEnriched.decision_receipt_id;
      if (serverEnriched.seller_decision_path) enrichmentUpdate.seller_decision_path = serverEnriched.seller_decision_path;
      
      const { data: lead } = await supabase
        .from("lead_profiles")
        .update(enrichmentUpdate)
        .eq("id", leadId)
        .select("ghl_contact_id")
        .single();
      
      if (lead?.ghl_contact_id) ghlContactId = lead.ghl_contact_id;
      
      // Log dossier to event_log for audit trail
      await supabase.from("event_log").insert({
        session_id: body.session_id,
        event_type: "booking_dossier_created",
        event_payload: {
          lead_id: leadId,
          intent: serverEnriched.intent,
          readiness_score: serverEnriched.readiness_score,
          tools_completed: serverEnriched.tools_completed,
          guides_read_count: serverEnriched.guides_read_count,
          journey_state: serverEnriched.journey_state,
          military_flag: serverEnriched.military_flag,
          inherited_home: serverEnriched.inherited_home,
          decision_receipt_id: serverEnriched.decision_receipt_id,
          seller_decision_path: serverEnriched.seller_decision_path,
          server_enriched: true,
          dossier_summary_length: dossierSummary.length,
        },
      });
    }

    // Push enrichment to GHL via webhook if possible
    if (GHL_WEBHOOK_URL && (leadId || body.session_id)) {
      const ghlPayload = {
        type: "booking_dossier_v2",
        session_id: body.session_id,
        lead_id: leadId,
        intent: serverEnriched.intent,
        language: serverEnriched.language || "en",
        readiness_score: serverEnriched.readiness_score,
        tools_completed: serverEnriched.tools_completed?.join(",") || "",
        guides_read_count: serverEnriched.guides_read_count || 0,
        journey_state: serverEnriched.journey_state || "explore",
        military_flag: serverEnriched.military_flag || false,
        inherited_home: serverEnriched.inherited_home || false,
        estimated_value: serverEnriched.estimated_value || 0,
        estimated_budget: serverEnriched.estimated_budget || 0,
        calculator_advantage: serverEnriched.calculator_advantage || "",
        seller_decision_path: serverEnriched.seller_decision_path || "",
        seller_goal_priority: serverEnriched.seller_goal_priority || "",
        property_condition: serverEnriched.property_condition_raw || "",
        decision_receipt_id: serverEnriched.decision_receipt_id || "",
        dossier_summary: dossierSummary,
        custom_fields: ghlFields,
        tags: [
          "booking_started",
          serverEnriched.military_flag ? "military_buyer" : null,
          serverEnriched.inherited_home ? "inherited_property" : null,
          serverEnriched.language === "es" ? "language_es" : null,
          serverEnriched.readiness_score && serverEnriched.readiness_score >= 75 ? "high_readiness" : null,
          serverEnriched.seller_decision_path ? "seller_decision_complete" : null,
        ].filter(Boolean),
      };

      fetch(GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ghlPayload),
      }).catch(e => console.warn("[enrich-booking-context] GHL webhook failed:", e.message));
    }

    const result: DossierResult = {
      ok: true,
      lead_id: leadId || undefined,
      ghl_contact_id: ghlContactId || undefined,
      dossier_summary: dossierSummary,
      ghl_fields: ghlFields,
      enrichment_applied: !!leadId,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[enrich-booking-context] Error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
