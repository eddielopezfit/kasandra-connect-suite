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
}

interface UpsertLeadResponse {
  ok: boolean;
  lead_id?: string;
  is_new?: boolean;
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

    return new Response(
      JSON.stringify({ ok: true, lead_id: leadId, is_new: isNew } as UpsertLeadResponse),
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
