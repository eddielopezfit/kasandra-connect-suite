import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeIntent, createStructuredError, computeLeadScore, shouldSkipScoreLog } from "../_shared/normalizeLead.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpsertLeadInput {
  email: string;
  phone?: string;
  name?: string;
  language?: string;
  source?: string;
  session_id?: string;
  utm_source?: string;
  utm_campaign?: string;
  intent?: string;
  property_address?: string;
  existing_lead_id?: string;
  page_path?: string;
  // Scoring context fields (Phase E)
  tool_used?: string;
  readiness_score?: number;
  quiz_completed?: boolean;
  has_viewed_report?: boolean;
  consent_communications?: boolean; // Guardrail 3: default false, only true when explicitly collected
  timeline?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ghlWebhookUrl = Deno.env.get("GHL_WEBHOOK_URL");
  console.log("[upsert-lead-profile] Integration status:", {
    hasGhlWebhookUrl: !!ghlWebhookUrl && ghlWebhookUrl.length > 10,
    timestamp: new Date().toISOString(),
  });

  try {
    const input: UpsertLeadInput = await req.json();

    // Validate email
    if (!input.email || typeof input.email !== "string") {
      return new Response(
        JSON.stringify(createStructuredError('VALIDATION', 'Email is required', 'email')),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email = input.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify(createStructuredError('VALIDATION', 'Invalid email format', 'email')),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedIntent = normalizeIntent(input.intent);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify(createStructuredError('SERVER_ERROR', 'Server configuration error')),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if lead exists
    const { data: existingLead, error: selectError } = await supabase
      .from("lead_profiles")
      .select("id, phone, name, language, intent, lead_score")
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      console.error("Error checking existing lead:", selectError);
      return new Response(
        JSON.stringify(createStructuredError('SERVER_ERROR', 'Database query failed')),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let leadId: string;
    let isNew: boolean;

    if (existingLead) {
      const updateData: Record<string, unknown> = {
        session_id: input.session_id || existingLead.id,
        source: input.source,
        utm_source: input.utm_source,
        utm_campaign: input.utm_campaign,
      };

      if (!existingLead.phone && input.phone) updateData.phone = input.phone.trim();
      if (!existingLead.name && input.name) updateData.name = input.name.trim();
      if (!existingLead.language && input.language) updateData.language = input.language;
      if (!existingLead.intent && normalizedIntent.canonical) updateData.intent = normalizedIntent.canonical;

      const { error: updateError } = await supabase
        .from("lead_profiles")
        .update(updateData)
        .eq("id", existingLead.id);

      if (updateError) {
        console.error("Error updating lead:", updateError);
        return new Response(
          JSON.stringify(createStructuredError('DB_CONSTRAINT', `Failed to update lead: ${updateError.message}`)),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      leadId = existingLead.id;
      isNew = false;
    } else {
      const insertData = {
        email,
        phone: input.phone?.trim() || null,
        name: input.name?.trim() || null,
        language: input.language || "en",
        intent: normalizedIntent.canonical,
        source: input.source || null,
        session_id: input.session_id || null,
        utm_source: input.utm_source || null,
        utm_campaign: input.utm_campaign || null,
      };

      const { data: newLead, error: insertError } = await supabase
        .from("lead_profiles")
        .insert(insertData)
        .select("id")
        .single();

      if (insertError) {
        console.error("Error inserting lead:", insertError);
        return new Response(
          JSON.stringify(createStructuredError('DB_CONSTRAINT', `Failed to create lead: ${insertError.message}`)),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      leadId = newLead.id;
      isNew = true;
    }

    // ── Lead Scoring (Phase E) ──
    const scoreResult = computeLeadScore({
      intent_canonical: normalizedIntent.canonical,
      timeline_canonical: input.timeline || null, // pass raw — will match or default
      quiz_completed: input.quiz_completed,
      phone: input.phone,
      property_address: input.property_address,
      tool_used: input.tool_used,
      readiness_score: input.readiness_score,
      consent_communications: input.consent_communications === true, // Guardrail 3
      has_viewed_report: input.has_viewed_report,
    });

    console.log("[upsert-lead-profile] Lead score computed:", scoreResult);

    // Persist score + grade
    await supabase
      .from("lead_profiles")
      .update({ lead_score: scoreResult.lead_score, lead_grade: scoreResult.lead_grade })
      .eq("id", leadId);

    // Deduped event log (Guardrail 4)
    const skipLog = await shouldSkipScoreLog(supabase, leadId, scoreResult.lead_score);
    if (!skipLog) {
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
    }

    // ── GHL Webhook Sync ──
    let ghlSynced = false;

    if (ghlWebhookUrl) {
      try {
        const nameParts = (input.name?.trim() || "").split(" ");
        const firstName = nameParts[0] || input.name?.trim() || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const tags = [
          "Lead Capture Modal",
          "selena_identity_gate",
          input.language === "es" ? "spanish_speaker" : "english_speaker",
          input.source ? `source_${input.source}` : "source_lead_capture_modal",
          normalizedIntent.canonical ? `intent_${normalizedIntent.canonical}` : null,
          isNew ? "new_lead" : "returning_lead",
        ].filter(Boolean) as string[];

        const ghlPayload = {
          email,
          name: input.name?.trim() || null,
          firstName,
          lastName,
          phone: input.phone?.trim() || null,
          tags,
          
          // STANDARDIZED selena_* top-level keys
          selena_lead_id: leadId,
          selena_session_id: input.session_id || null,
          selena_intent_canonical: normalizedIntent.canonical,
          selena_language_raw: input.language || "en",
          selena_source: input.source || "lead_capture_modal",
          selena_lead_score: scoreResult.lead_score,
          
          // Legacy fields
          lead_id: leadId,
          session_id: input.session_id || null,
          source: input.source || "lead_capture_modal",
          page_path: input.page_path || "/",
          language: input.language || "en",
          intent_canonical: normalizedIntent.canonical,
          intent_raw: normalizedIntent.raw,
          is_new_lead: isNew,
          utm_source: input.utm_source || null,
          utm_campaign: input.utm_campaign || null,
          
          customField: {
            lead_id: leadId,
            session_id: input.session_id || null,
            language: input.language || "en",
            intent_canonical: normalizedIntent.canonical,
            source: input.source || "lead_capture_modal",
            page_path: input.page_path || "/",
            is_new_lead: isNew,
            // Phase E scoring fields
            lead_score: scoreResult.lead_score,
            lead_score_bucket: scoreResult.lead_score_bucket,
            lead_score_reasons: scoreResult.score_reasons,
          },
        };

        console.log("[upsert-lead-profile] Sending GHL webhook:", {
          leadId, isNew, source: input.source, hasIntent: !!normalizedIntent.canonical,
          lead_score: scoreResult.lead_score,
        });

        const ghlResponse = await fetch(ghlWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ghlPayload),
        });

        if (ghlResponse.ok) {
          ghlSynced = true;
          console.log("[upsert-lead-profile] GHL sync successful for lead:", leadId);
          await supabase
            .from("lead_profiles")
            .update({ ghl_synced_at: new Date().toISOString() })
            .eq("id", leadId);
        } else {
          const errorText = await ghlResponse.text();
          console.error("[upsert-lead-profile] GHL webhook failed:", { status: ghlResponse.status, error: errorText });
        }
      } catch (ghlError) {
        console.error("[upsert-lead-profile] GHL sync error:", ghlError);
      }
    } else {
      console.log("[upsert-lead-profile] GHL_WEBHOOK_URL not configured, skipping sync");
    }

    return new Response(
      JSON.stringify({ ok: true, lead_id: leadId, is_new: isNew, ghl_synced: ghlSynced, lead_score: scoreResult.lead_score }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in upsert-lead-profile:", error);
    return new Response(
      JSON.stringify(createStructuredError('SERVER_ERROR', 'Internal server error')),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
