import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  success: boolean;
  lead_id?: string;
  is_new?: boolean;
  ghl_synced?: boolean;
  error?: string;
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
      return new Response(
        JSON.stringify({ success: false, error: "Name, email, and phone are required" } as ConsultationIntakeResponse),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize email
    const email = input.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" } as ConsultationIntakeResponse),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" } as ConsultationIntakeResponse),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build tags array
    const tags: string[] = [
      "source:book",
      "selena - consult intake",
      input.language === "es" ? "spanish_speaker" : "english_speaker",
      `selena - intent ${input.intent || "unknown"}`,
    ];

    if (input.timeline) {
      tags.push(`timeline:${input.timeline}`);
    }

    // Check for existing lead
    const { data: existingLead, error: selectError } = await supabase
      .from("lead_profiles")
      .select("id, phone, name, language, tags")
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      console.error("Error checking existing lead:", selectError);
      return new Response(
        JSON.stringify({ success: false, error: "Database query failed" } as ConsultationIntakeResponse),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let leadId: string;
    let isNew: boolean;

    if (existingLead) {
      // Merge tags (preserve existing, add new unique ones)
      const existingTags = existingLead.tags || [];
      const mergedTags = [...new Set([...existingTags, ...tags])];

      // Update existing lead
      const { error: updateError } = await supabase
        .from("lead_profiles")
        .update({
          name: input.name.trim(),
          phone: input.phone.trim() || existingLead.phone,
          language: input.language || existingLead.language,
          intent: input.intent || null,
          timeline: input.timeline || null,
          session_id: input.session_id || null,
          source: input.source || "consultation_intake",
          tags: mergedTags,
        })
        .eq("id", existingLead.id);

      if (updateError) {
        console.error("Error updating lead:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to update lead" } as ConsultationIntakeResponse),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      leadId = existingLead.id;
      isNew = false;
    } else {
      // Insert new lead
      const { data: newLead, error: insertError } = await supabase
        .from("lead_profiles")
        .insert({
          email,
          name: input.name.trim(),
          phone: input.phone.trim(),
          language: input.language || "en",
          intent: input.intent || null,
          timeline: input.timeline || null,
          session_id: input.session_id || null,
          source: input.source || "consultation_intake",
          tags,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error inserting lead:", insertError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to create lead" } as ConsultationIntakeResponse),
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
          '1_3_months': 'timeline_30_days',
          '3_6_months': 'timeline_flexible',
          researching: 'timeline_exploring',
        };

        // Build semantic tags
        const situationTags = input.situation 
          ? (situationTagMap[input.situation] || [`situation_${input.situation}`]) 
          : [];
        const conditionTag = input.condition 
          ? (conditionTagMap[input.condition] || `condition_${input.condition}`)
          : null;
        const timelineTag = input.timeline 
          ? (timelineTagMap[input.timeline] || `timeline_${input.timeline}`)
          : null;

        const allTags = [
          "Consultation Intake",
          "consultation_intake",
          input.language === "es" ? "spanish_speaker" : "english_speaker",
          `intent_${input.intent || "unknown"}`,
          input.source ? `source_${input.source}` : null,
          ...situationTags,
          conditionTag,
          timelineTag,
          input.quiz_completed ? "quiz_completed" : null,
          input.has_viewed_report ? "viewed_report" : null,
        ].filter(Boolean) as string[];

        const ghlPayload = {
          email,
          name: input.name.trim(),
          firstName,
          lastName,
          phone: input.phone.trim(),
          tags: allTags,
          customField: {
            // Core fields
            lead_id: leadId,
            language: input.language,
            intent: input.intent,
            timeline: input.timeline,
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
        success: true,
        lead_id: leadId,
        is_new: isNew,
        ghl_synced: ghlSynced,
      } as ConsultationIntakeResponse),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in submit-consultation-intake:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" } as ConsultationIntakeResponse),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
