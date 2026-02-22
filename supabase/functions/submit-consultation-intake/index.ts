import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeIntent, normalizeTimeline, createStructuredError } from "../_shared/normalizeLead.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ConsultationIntakeInput {
  name: string;
  email: string;
  phone: string;
  language: string;
  intent: string;
  timeline: string;
  // New fields for GHL workflow routing
  property_address?: string;
  target_neighborhoods?: string;
  price_range?: string;
  pre_approved?: string;
  notes?: string;
  session_id?: string;
  source?: string;
  page_path?: string;
  guide_id?: string;
  guide_title?: string;
  // Consent fields (TCPA compliance)
  consent_communications?: boolean;
  consent_ai?: boolean;
  // Submission timestamp
  submitted_at?: string;
  // Full Session Dossier fields
  situation?: string;
  condition?: string;
  tool_used?: string;
  last_tool_result?: string;
  readiness_score?: number;
  primary_priority?: string;
  quiz_completed?: boolean;
  quiz_result_path?: string;
  has_viewed_report?: boolean;
  last_report_id?: string;
  has_booked?: boolean;
  session_source?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_content?: string;
  referrer?: string;
  ad_funnel_source?: string;
  ad_funnel_value_range?: string;
}

// ── Lead Scoring ─────────────────────────────────────────────────────────────
interface LeadScoreResult {
  lead_score: number;
  lead_score_bucket: "hot" | "warm" | "cold";
  score_reasons: string;
}

function computeLeadScore(input: ConsultationIntakeInput, normalizedIntent: { canonical: string | null }, normalizedTimeline: { canonical: string | null }): LeadScoreResult {
  let score = 0;
  const reasons: string[] = [];

  // Intent specificity (+25 max)
  const intentScores: Record<string, number> = { cash: 25, sell: 20, dual: 20, buy: 15, explore: 5 };
  const intentPts = intentScores[normalizedIntent.canonical || "explore"] || 5;
  score += intentPts;
  reasons.push(`intent:${normalizedIntent.canonical || "explore"}(+${intentPts})`);

  // Timeline urgency (+25 max)
  const timelineScores: Record<string, number> = { asap: 25, "30_days": 20, "60_90": 15, exploring: 5 };
  const timelinePts = timelineScores[normalizedTimeline.canonical || "exploring"] || 5;
  score += timelinePts;
  reasons.push(`timeline:${normalizedTimeline.canonical || "exploring"}(+${timelinePts})`);

  // Quiz completed (+10)
  if (input.quiz_completed) {
    score += 10;
    reasons.push("quiz_completed(+10)");
  }

  // Phone provided (+10)
  if (input.phone && input.phone.trim().length >= 10) {
    score += 10;
    reasons.push("phone_provided(+10)");
  }

  // Property address — check multiple field name variants (Edit #6)
  const hasAddress = !!(
    (input.property_address && input.property_address.trim()) ||
    (input as any).propertyAddress?.trim() ||
    (input as any).selena_property_address?.trim()
  );
  if (hasAddress) {
    score += 10;
    reasons.push("property_address(+10)");
  }

  // Tool used (+5)
  if (input.tool_used) {
    score += 5;
    reasons.push(`tool_used:${input.tool_used}(+5)`);
  }

  // Readiness score (+5 if >= 60)
  if (input.readiness_score && input.readiness_score >= 60) {
    score += 5;
    reasons.push(`readiness_score:${input.readiness_score}(+5)`);
  }

  // Consent given (+5)
  if (input.consent_communications) {
    score += 5;
    reasons.push("consent_given(+5)");
  }

  // Has viewed report (+5)
  if (input.has_viewed_report) {
    score += 5;
    reasons.push("has_viewed_report(+5)");
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Bucket thresholds (Edit #5)
  const lead_score_bucket: "hot" | "warm" | "cold" =
    score >= 75 ? "hot" : score >= 45 ? "warm" : "cold";

  return {
    lead_score: score,
    lead_score_bucket,
    score_reasons: reasons.join("|"),
  };
}

interface ConsultationIntakeResponse {
  ok: boolean;
  lead_id?: string;
  is_new?: boolean;
  ghl_synced?: boolean;
  priority_handoff_triggered?: boolean;
  lead_score?: number;
  error?: string;
  code?: string;
  field?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Integration status logging (boolean only - never log actual secrets)
  const ghlWebhookUrl = Deno.env.get("GHL_WEBHOOK_URL");
  const ghlApiKey = Deno.env.get("GHL_API_KEY");
  console.log("[submit-consultation-intake] Integration status:", {
    hasGhlWebhookUrl: !!ghlWebhookUrl && ghlWebhookUrl.length > 10,
    hasGhlApiKey: !!ghlApiKey && ghlApiKey.length > 10,
    timestamp: new Date().toISOString(),
  });

  try {
    const input: ConsultationIntakeInput = await req.json();

    // Validate required fields
    if (!input.email || !input.name || !input.phone) {
      const error = createStructuredError('VALIDATION', 'Name, email, and phone are required');
      return new Response(
        JSON.stringify(error),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize email
    const email = input.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error = createStructuredError('VALIDATION', 'Invalid email format', 'email');
      return new Response(
        JSON.stringify(error),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize intent and timeline using shared helper
    const normalizedIntent = normalizeIntent(input.intent);
    const normalizedTimeline = normalizeTimeline(input.timeline);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      const error = createStructuredError('SERVER_ERROR', 'Server configuration error');
      return new Response(
        JSON.stringify(error),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build tags array
    const tags: string[] = [
      "source:book",
      "selena - consult intake",
      input.language === "es" ? "spanish_speaker" : "english_speaker",
      `selena - intent ${normalizedIntent.raw || "unknown"}`,
    ];

    if (normalizedTimeline.raw) {
      tags.push(`timeline:${normalizedTimeline.raw}`);
    }

    // Check for existing lead
    const { data: existingLead, error: selectError } = await supabase
      .from("lead_profiles")
      .select("id, phone, name, language, tags")
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      console.error("Error checking existing lead:", selectError);
      const error = createStructuredError('SERVER_ERROR', 'Database query failed');
      return new Response(
        JSON.stringify(error),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let leadId: string;
    let isNew: boolean;

    if (existingLead) {
      // Merge tags (preserve existing, add new unique ones)
      const existingTags = existingLead.tags || [];
      const mergedTags = [...new Set([...existingTags, ...tags])];

      // Update existing lead with CANONICAL values for DB
      const { error: updateError } = await supabase
        .from("lead_profiles")
        .update({
          name: input.name.trim(),
          phone: input.phone.trim() || existingLead.phone,
          language: input.language || existingLead.language,
          intent: normalizedIntent.canonical,
          timeline: normalizedTimeline.canonical,
          session_id: input.session_id || null,
          source: input.source || "lovable_native_form",
          tags: mergedTags,
        })
        .eq("id", existingLead.id);

      if (updateError) {
        console.error("Error updating lead:", updateError);
        const error = createStructuredError('DB_CONSTRAINT', `Failed to update lead: ${updateError.message}`, updateError.details?.includes('intent') ? 'intent' : updateError.details?.includes('timeline') ? 'timeline' : undefined);
        return new Response(
          JSON.stringify(error),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      leadId = existingLead.id;
      isNew = false;
    } else {
      // Insert new lead with CANONICAL values for DB
      const { data: newLead, error: insertError } = await supabase
        .from("lead_profiles")
        .insert({
          email,
          name: input.name.trim(),
          phone: input.phone.trim(),
          language: input.language || "en",
          intent: normalizedIntent.canonical,
          timeline: normalizedTimeline.canonical,
          session_id: input.session_id || null,
          source: input.source || "lovable_native_form",
          tags,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error inserting lead:", insertError);
        const field = insertError.message?.includes('intent') ? 'intent' : insertError.message?.includes('timeline') ? 'timeline' : undefined;
        const error = createStructuredError('DB_CONSTRAINT', `Failed to create lead: ${insertError.message}`, field);
        return new Response(
          JSON.stringify(error),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      leadId = newLead.id;
      isNew = true;
    }

    // =====================================================
    // PRIORITY HANDOFF TRIGGER
    // If timeline === 'asap' AND intent === 'cash', trigger immediate alert
    // =====================================================
    let priorityHandoffTriggered = false;
    const isUrgentCashLead = 
      (normalizedTimeline.canonical === 'asap' || normalizedTimeline.raw === 'immediately') && 
      (normalizedIntent.canonical === 'cash' || normalizedIntent.raw === 'cash_offer');
    
    if (isUrgentCashLead) {
      console.log("[submit-consultation-intake] PRIORITY HANDOFF: Urgent cash lead detected");
      
      try {
        // Create handoff record
        const handoffSummary = `
**Urgent Cash Offer Request**

- **Name:** ${input.name}
- **Phone:** ${input.phone}
- **Email:** ${email}
- **Language:** ${input.language === 'es' ? 'Spanish' : 'English'}
- **Timeline:** Immediate (ASAP)
- **Property Address:** ${input.property_address || 'Not provided'}
- **Situation:** ${input.situation || 'Not specified'}
- **Condition:** ${input.condition || 'Not specified'}
${input.notes ? `- **Notes:** ${input.notes}` : ''}

**Source:** Consultation Intake Form
**Priority:** HOT - Immediate Follow-up Required
        `.trim();

        const { data: handoffData, error: handoffError } = await supabase
          .from("lead_handoffs")
          .insert({
            lead_id: leadId,
            channel: 'call',
            priority: 'hot',
            status: 'pending',
            summary_md: handoffSummary,
            reason: 'Urgent cash offer request with immediate timeline',
            recommended_next_step: 'Call within 15 minutes to discuss cash offer',
            booking_url: `/v2/book?lead_id=${leadId}&priority=hot`,
            convo_summary_json: {
              intent: normalizedIntent.canonical,
              timeline: normalizedTimeline.canonical,
              property_address: input.property_address,
              situation: input.situation,
              condition: input.condition,
            },
          })
          .select("id")
          .single();

        if (handoffError) {
          console.error("[submit-consultation-intake] Failed to create handoff:", handoffError);
        } else if (handoffData) {
          // Trigger notify-handoff function
          console.log("[submit-consultation-intake] Created handoff, triggering notification:", handoffData.id);
          
          // Fire and forget - don't await to avoid blocking response
          fetch(`${supabaseUrl}/functions/v1/notify-handoff`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              lead_id: leadId,
              handoff_id: handoffData.id,
            }),
          }).catch(err => {
            console.error("[submit-consultation-intake] notify-handoff call failed:", err);
          });
          
          priorityHandoffTriggered = true;
        }
      } catch (handoffErr) {
        console.error("[submit-consultation-intake] Priority handoff error:", handoffErr);
        // Don't fail the main request if handoff fails
      }
    }

    // =====================================================
    // LEAD SCORING (A3)
    // =====================================================
    const scoreResult = computeLeadScore(input, normalizedIntent, normalizedTimeline);
    console.log("[submit-consultation-intake] Lead score computed:", scoreResult);

    // Log score to event_log
    await supabase.from("event_log").insert({
      event_type: "lead_score_computed",
      session_id: leadId,
      event_payload: {
        lead_id: leadId,
        session_id: input.session_id || null,
        lead_score: scoreResult.lead_score,
        lead_score_bucket: scoreResult.lead_score_bucket,
        score_reasons: scoreResult.score_reasons,
      },
    });

    // Persist score to lead_profiles
    await supabase
      .from("lead_profiles")
      .update({ lead_score: scoreResult.lead_score })
      .eq("id", leadId);

    // Sync to GoHighLevel
    let ghlSynced = false;

    if (ghlWebhookUrl) {
      try {
        // Split name for GHL
        const nameParts = input.name.trim().split(" ");
        const firstName = nameParts[0] || input.name.trim();
        const lastName = nameParts.slice(1).join(" ") || "";

        // Build semantic tags based on session context
        const situationTagMap: Record<string, string[]> = {
          inherited: ['Legacy Property Seller', 'situation_inherited'],
          relocating: ['Relocation Seller', 'situation_relocating'],
          downsizing: ['Downsizing Seller', 'situation_downsizing'],
          divorce: ['Divorce Situation', 'situation_divorce'],
          tired_landlord: ['Tired Landlord', 'situation_tired_landlord'],
          upgrading: ['Upgrader', 'situation_upgrading'],
          other: ['situation_other'],
        };

        const conditionTagMap: Record<string, string> = {
          move_in_ready: 'condition_move_in_ready',
          minor_repairs: 'condition_minor_repairs',
          distressed: 'condition_distressed',
          unknown: 'condition_unknown',
        };

        const timelineTagMap: Record<string, string> = {
          immediately: 'timeline_urgent',
          asap: 'timeline_urgent',
          '30_days': 'timeline_30_days',
          '1_3_months': 'timeline_60_90',
          '60_90': 'timeline_60_90',
          '3_6_months': 'timeline_flexible',
          '6_plus_months': 'timeline_flexible',
          researching: 'timeline_exploring',
          exploring: 'timeline_exploring',
        };

        // Build semantic tags using RAW values for CRM clarity
        const situationTags = input.situation 
          ? (situationTagMap[input.situation] || [`situation_${input.situation}`]) 
          : [];
        const conditionTag = input.condition 
          ? (conditionTagMap[input.condition] || `condition_${input.condition}`)
          : null;
        const timelineTag = normalizedTimeline.raw 
          ? (timelineTagMap[normalizedTimeline.raw] || `timeline_${normalizedTimeline.raw}`)
          : null;

        const allTags = [
          "Consultation Intake",
          "consultation_intake",
          input.language === "es" ? "spanish_speaker" : "english_speaker",
          `intent_${normalizedIntent.raw || "unknown"}`,
          input.source ? `source_${input.source}` : null,
          ...situationTags,
          conditionTag,
          timelineTag,
          input.quiz_completed ? "quiz_completed" : null,
          input.has_viewed_report ? "viewed_report" : null,
          priorityHandoffTriggered ? "priority_hot" : null,
          // Consent tags for compliance audit
          input.consent_communications ? "consent_communications" : null,
          input.consent_ai ? "consent_ai_disclosure" : null,
        ].filter(Boolean) as string[];

        // Pipeline stage helper using CANONICAL intent
        const getPipelineStage = (intent: string | null): string => {
          switch (intent) {
            case 'sell':
              return 'Seller Lead';
            case 'cash':
              return 'Cash Offer Lead';
            case 'buy':
              return 'Buyer Lead';
            case 'dual':
              return 'Dual Lead (Buy & Sell)';
            default:
              return 'Exploring';
          }
        };

        // Goal label helper using RAW intent for human-readable labels
        const getGoalLabel = (intentRaw: string | null, lang: string): string => {
          const labels: Record<string, { en: string; es: string }> = {
            seller: { en: 'Thinking about selling', es: 'Pensando en vender' },
            sell: { en: 'Thinking about selling', es: 'Pensando en vender' },
            buyer: { en: 'Looking to buy', es: 'Buscando comprar' },
            buy: { en: 'Looking to buy', es: 'Buscando comprar' },
            cash_offer: { en: 'Interested in cash offer', es: 'Interesado en oferta en efectivo' },
            cash: { en: 'Interested in cash offer', es: 'Interesado en oferta en efectivo' },
            buy_and_sell: { en: 'Buy and sell simultaneously', es: 'Comprar y vender simultáneamente' },
            dual: { en: 'Buy and sell simultaneously', es: 'Comprar y vender simultáneamente' },
            exploring: { en: 'Just exploring', es: 'Solo explorando' },
            explore: { en: 'Just exploring', es: 'Solo explorando' },
          };
          const langKey = lang === 'es' ? 'es' : 'en';
          return labels[intentRaw || 'explore']?.[langKey] || labels.explore[langKey];
        };

        const ghlPayload = {
          // Standard contact fields
          email,
          name: input.name.trim(),
          firstName,
          lastName,
          phone: input.phone.trim(),
          tags: allTags,
          
          // STANDARDIZED selena_* top-level keys for GHL workflow mapping
          selena_lead_id: leadId,
          selena_session_id: input.session_id || null,
          selena_intent_canonical: normalizedIntent.canonical,
          selena_language_raw: input.language,
          selena_timeline_raw: normalizedTimeline.raw,
          selena_budget_raw: input.price_range || null,
          selena_target_neighborhoods: input.target_neighborhoods || null,
          selena_property_address: input.property_address || null,
          selena_is_pre_approved: input.pre_approved === 'yes' ? 'Yes' : 'No',
          selena_motivation_raw: input.notes || null,
          selena_priority_handoff: priorityHandoffTriggered ? 'hot' : null,
          selena_lead_score: scoreResult.lead_score,
          // Legacy top-level fields for backward compatibility
          intent_canonical: normalizedIntent.canonical,
          intent_raw: normalizedIntent.raw,
          timeline_canonical: normalizedTimeline.canonical,
          timeline_raw: normalizedTimeline.raw,
          source: "lovable_native_form",
          lead_id: leadId,
          language: input.language,
          page_path: input.page_path || "/v2/book",
          session_id: input.session_id || null,
          property_address: input.property_address || null,
          target_neighborhoods: input.target_neighborhoods || null,
          pre_approved: input.pre_approved || null,
          
          // Custom fields for GHL workflow (backward compatibility)
          customField: {
            // Core fields - send BOTH canonical and raw
            lead_id: leadId,
            language: input.language,
            intent_canonical: normalizedIntent.canonical,
            intent_raw: normalizedIntent.raw,
            timeline_canonical: normalizedTimeline.canonical,
            timeline_raw: normalizedTimeline.raw,
            // Property address for seller SMS personalization
            property_address: input.property_address || null,
            // Target neighborhoods for buyer nurture emails
            target_neighborhoods: input.target_neighborhoods || null,
            price_range: input.price_range || null,
            pre_approved: input.pre_approved || null,
            notes: input.notes || null,
            page_path: input.page_path || "/v2/book",
            // Property context
            situation: input.situation || null,
            condition: input.condition || null,
            // Tool usage (calculator results)
            tool_used: input.tool_used || null,
            last_tool_result: input.last_tool_result || null,
            // Buyer readiness
            readiness_score: input.readiness_score || null,
            primary_priority: input.primary_priority || null,
            // Quiz completion
            quiz_completed: input.quiz_completed || false,
            quiz_result_path: input.quiz_result_path || null,
            // Decision room engagement
            has_viewed_report: input.has_viewed_report || false,
            last_report_id: input.last_report_id || null,
            has_booked: input.has_booked || false,
            // Attribution
            session_source: input.session_source || null,
            utm_source: input.utm_source || null,
            utm_campaign: input.utm_campaign || null,
            utm_medium: input.utm_medium || null,
            utm_content: input.utm_content || null,
            referrer: input.referrer || null,
            // Ad funnel bridge
            ad_funnel_source: input.ad_funnel_source || null,
            ad_funnel_value_range: input.ad_funnel_value_range || null,
            // Guide context
            guide_id: input.guide_id || null,
            guide_title: input.guide_title || null,
            // Semantic intent fields for pipeline routing (using CANONICAL)
            intent_seller: normalizedIntent.canonical === 'sell' || normalizedIntent.canonical === 'cash' || normalizedIntent.raw === 'buy_and_sell',
            intent_buyer: normalizedIntent.canonical === 'buy' || normalizedIntent.raw === 'buy_and_sell',
            intent_cash: normalizedIntent.canonical === 'cash',
            intent_dual: normalizedIntent.raw === 'buy_and_sell' || normalizedIntent.canonical === 'dual',
            pipeline_stage: getPipelineStage(normalizedIntent.canonical),
            last_declared_goal: getGoalLabel(normalizedIntent.raw, input.language),
            // Pre-approval flag for finance-ready routing
            is_pre_approved: input.pre_approved === 'yes',
            // Priority handoff indicator
            priority_handoff: priorityHandoffTriggered,
            // Lead scoring
            lead_score: scoreResult.lead_score,
            lead_score_bucket: scoreResult.lead_score_bucket,
            lead_score_reasons: scoreResult.score_reasons,
            // Consent fields (TCPA compliance audit trail)
            selena_consent_communications: input.consent_communications || false,
            selena_consent_ai_disclosure: input.consent_ai || false,
            selena_consent_timestamp: input.submitted_at || new Date().toISOString(),
          },
        };

        const ghlResponse = await fetch(ghlWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ghlPayload),
        });

        if (ghlResponse.ok) {
          ghlSynced = true;
          console.log("[submit-consultation-intake] GHL webhook success:", {
            status: ghlResponse.status,
          });
        } else {
          console.error("[submit-consultation-intake] GHL webhook failed:", {
            status: ghlResponse.status,
            statusText: ghlResponse.statusText,
          });

          // Log failure to event_log
          await supabase.from("event_log").insert({
            event_type: "ghl_sync_failed",
            session_id: leadId,
            event_payload: {
              lead_id: leadId,
              email,
              error: `HTTP ${ghlResponse.status}`,
              funnel: "consultation_intake",
              page_path: input.page_path,
            },
          });
        }
      } catch (ghlError) {
        console.error("[submit-consultation-intake] GHL webhook error:", ghlError);

        // Log failure to event_log
        await supabase.from("event_log").insert({
          event_type: "ghl_sync_failed",
          session_id: leadId,
          event_payload: {
            lead_id: leadId,
            email,
            error: String(ghlError),
            funnel: "consultation_intake",
            page_path: input.page_path,
          },
        });
      }
    } else {
      console.warn("[submit-consultation-intake] GHL_WEBHOOK_URL not configured - skipping CRM sync");
    }

    return new Response(
      JSON.stringify({
        ok: true,
        lead_id: leadId,
        is_new: isNew,
        ghl_synced: ghlSynced,
        priority_handoff_triggered: priorityHandoffTriggered,
        lead_score: scoreResult.lead_score,
      } as ConsultationIntakeResponse),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in submit-consultation-intake:", error);
    const structuredError = createStructuredError('SERVER_ERROR', 'Internal server error');
    return new Response(
      JSON.stringify(structuredError),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
