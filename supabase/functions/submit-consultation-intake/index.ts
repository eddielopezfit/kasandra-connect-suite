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
  price_range?: string;
  pre_approved?: string;
  notes?: string;
  session_id?: string;
  source?: string;
  guide_id?: string;
  guide_title?: string;
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

interface ConsultationIntakeResponse {
  ok: boolean;
  lead_id?: string;
  is_new?: boolean;
  ghl_synced?: boolean;
  error?: string;
  code?: string;
  field?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
          source: input.source || "consultation_intake",
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
          source: input.source || "consultation_intake",
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

    // Sync to GoHighLevel
    let ghlSynced = false;
    const ghlWebhookUrl = Deno.env.get("GHL_WEBHOOK_URL");

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
            exploring: { en: 'Just exploring', es: 'Solo explorando' },
            explore: { en: 'Just exploring', es: 'Solo explorando' },
          };
          const langKey = lang === 'es' ? 'es' : 'en';
          return labels[intentRaw || 'explore']?.[langKey] || labels.explore[langKey];
        };

        const ghlPayload = {
          email,
          name: input.name.trim(),
          firstName,
          lastName,
          phone: input.phone.trim(),
          tags: allTags,
          customField: {
            // Core fields - send BOTH canonical and raw
            lead_id: leadId,
            language: input.language,
            intent_canonical: normalizedIntent.canonical,
            intent_raw: normalizedIntent.raw,
            timeline_canonical: normalizedTimeline.canonical,
            timeline_raw: normalizedTimeline.raw,
            price_range: input.price_range || null,
            pre_approved: input.pre_approved || null,
            notes: input.notes || null,
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
            intent_seller: normalizedIntent.canonical === 'sell' || normalizedIntent.canonical === 'cash',
            intent_buyer: normalizedIntent.canonical === 'buy',
            intent_cash: normalizedIntent.canonical === 'cash',
            pipeline_stage: getPipelineStage(normalizedIntent.canonical),
            last_declared_goal: getGoalLabel(normalizedIntent.raw, input.language),
          },
          source: "Consultation Intake - Lovable " + (input.source || "/v2/book"),
        };

        const ghlResponse = await fetch(ghlWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ghlPayload),
        });

        if (ghlResponse.ok) {
          ghlSynced = true;
          console.log("GHL webhook success for consultation intake");
        } else {
          console.error("GHL webhook failed:", ghlResponse.status);

          // Log failure to event_log
          await supabase.from("event_log").insert({
            event_type: "ghl_sync_failed",
            session_id: leadId,
            event_payload: {
              lead_id: leadId,
              email,
              error: `HTTP ${ghlResponse.status}`,
              funnel: "consultation_intake",
            },
          });
        }
      } catch (ghlError) {
        console.error("GHL webhook error:", ghlError);

        // Log failure to event_log
        await supabase.from("event_log").insert({
          event_type: "ghl_sync_failed",
          session_id: leadId,
          event_payload: {
            lead_id: leadId,
            email,
            error: String(ghlError),
            funnel: "consultation_intake",
          },
        });
      }
    } else {
      console.warn("GHL_WEBHOOK_URL not configured");
    }

    return new Response(
      JSON.stringify({
        ok: true,
        lead_id: leadId,
        is_new: isNew,
        ghl_synced: ghlSynced,
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
