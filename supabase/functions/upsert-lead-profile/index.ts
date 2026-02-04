import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeIntent, createStructuredError } from "../_shared/normalizeLead.ts";

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
  // Intent & property context
  intent?: string;
  property_address?: string;
  existing_lead_id?: string;
  // Page context for GHL sync
  page_path?: string;
}

interface UpsertLeadResponse {
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

  // Integration status logging (boolean only - never log actual secrets)
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

    // Normalize intent using shared helper
    const normalizedIntent = normalizeIntent(input.intent);

    // Initialize Supabase with service role (required for bypassing RLS)
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
      .select("id, phone, name, language, intent")
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
      // UPDATE existing lead - only fill NULL fields, always update tracking fields
      const updateData: Record<string, unknown> = {
        // Always update tracking fields
        session_id: input.session_id || existingLead.id,
        source: input.source,
        utm_source: input.utm_source,
        utm_campaign: input.utm_campaign,
      };

      // Only fill fields that are currently NULL
      if (!existingLead.phone && input.phone) {
        updateData.phone = input.phone.trim();
      }
      if (!existingLead.name && input.name) {
        updateData.name = input.name.trim();
      }
      if (!existingLead.language && input.language) {
        updateData.language = input.language;
      }
      // Only update intent if current is null and new value provided
      if (!existingLead.intent && normalizedIntent.canonical) {
        updateData.intent = normalizedIntent.canonical;
      }

      const { error: updateError } = await supabase
        .from("lead_profiles")
        .update(updateData)
        .eq("id", existingLead.id);

      if (updateError) {
        console.error("Error updating lead:", updateError);
        return new Response(
          JSON.stringify(createStructuredError('DB_CONSTRAINT', `Failed to update lead: ${updateError.message}`, updateError.message?.includes('intent') ? 'intent' : undefined)),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      leadId = existingLead.id;
      isNew = false;
    } else {
      // INSERT new lead with CANONICAL intent
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
          JSON.stringify(createStructuredError('DB_CONSTRAINT', `Failed to create lead: ${insertError.message}`, insertError.message?.includes('intent') ? 'intent' : undefined)),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      leadId = newLead.id;
      isNew = true;
    }

    // =====================================================
    // GHL WEBHOOK SYNC (CM-002 - GAP-02 Remediation)
    // Sync lead to GoHighLevel for CRM continuity
    // =====================================================
    let ghlSynced = false;

    if (ghlWebhookUrl) {
      try {
        // Split name for GHL (if available)
        const nameParts = (input.name?.trim() || "").split(" ");
        const firstName = nameParts[0] || input.name?.trim() || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Build minimal tags for lead capture
        const tags = [
          "Lead Capture Modal",
          "selena_identity_gate",
          input.language === "es" ? "spanish_speaker" : "english_speaker",
          input.source ? `source_${input.source}` : "source_lead_capture_modal",
          normalizedIntent.canonical ? `intent_${normalizedIntent.canonical}` : null,
          isNew ? "new_lead" : "returning_lead",
        ].filter(Boolean) as string[];

        const ghlPayload = {
          // Standard contact fields
          email,
          name: input.name?.trim() || null,
          firstName,
          lastName,
          phone: input.phone?.trim() || null,
          tags,
          
          // STANDARDIZED selena_* top-level keys for GHL workflow mapping
          selena_lead_id: leadId,
          selena_session_id: input.session_id || null,
          selena_intent_canonical: normalizedIntent.canonical,
          selena_language_raw: input.language || "en",
          selena_source: input.source || "lead_capture_modal",
          
          // Legacy compatibility fields
          lead_id: leadId,
          session_id: input.session_id || null,
          source: input.source || "lead_capture_modal",
          page_path: input.page_path || "/",
          language: input.language || "en",
          intent_canonical: normalizedIntent.canonical,
          intent_raw: normalizedIntent.raw,
          is_new_lead: isNew,
          
          // Attribution
          utm_source: input.utm_source || null,
          utm_campaign: input.utm_campaign || null,
          
          // Custom fields for GHL workflow
          customField: {
            lead_id: leadId,
            session_id: input.session_id || null,
            language: input.language || "en",
            intent_canonical: normalizedIntent.canonical,
            source: input.source || "lead_capture_modal",
            page_path: input.page_path || "/",
            is_new_lead: isNew,
          },
        };

        console.log("[upsert-lead-profile] Sending GHL webhook:", {
          leadId,
          isNew,
          source: input.source,
          hasIntent: !!normalizedIntent.canonical,
        });

        const ghlResponse = await fetch(ghlWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ghlPayload),
        });

        if (ghlResponse.ok) {
          ghlSynced = true;
          console.log("[upsert-lead-profile] GHL sync successful for lead:", leadId);

          // Update ghl_synced_at timestamp
          await supabase
            .from("lead_profiles")
            .update({ ghl_synced_at: new Date().toISOString() })
            .eq("id", leadId);
        } else {
          const errorText = await ghlResponse.text();
          console.error("[upsert-lead-profile] GHL webhook failed:", {
            status: ghlResponse.status,
            error: errorText,
          });
        }
      } catch (ghlError) {
        console.error("[upsert-lead-profile] GHL sync error:", ghlError);
        // Don't fail the main request if GHL sync fails
      }
    } else {
      console.log("[upsert-lead-profile] GHL_WEBHOOK_URL not configured, skipping sync");
    }

    return new Response(
      JSON.stringify({ ok: true, lead_id: leadId, is_new: isNew, ghl_synced: ghlSynced } as UpsertLeadResponse),
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
