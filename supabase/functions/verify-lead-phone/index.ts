import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPhoneRequest {
  phone: string;
}

interface VerifyPhoneResponse {
  ok: boolean;
  lead_id?: string;
  error?: string;
}

// Normalize phone number for consistent matching
function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 1 and is 11 digits, remove leading 1 (US country code)
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  
  return digits;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone }: VerifyPhoneRequest = await req.json();

    // Validate phone input
    if (!phone || typeof phone !== 'string') {
      console.error("[verify-lead-phone] Validation failed: Missing phone");
      return new Response(
        JSON.stringify({ ok: false, error: "Phone number is required" } as VerifyPhoneResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    // Require at least 10 digits for a valid US phone number
    if (normalizedPhone.length < 10) {
      console.error("[verify-lead-phone] Validation failed: Invalid phone format");
      return new Response(
        JSON.stringify({ ok: false, error: "Please enter a valid 10-digit phone number" } as VerifyPhoneResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("[verify-lead-phone] Looking up lead by phone:", {
      inputLength: phone.length,
      normalizedLength: normalizedPhone.length,
    });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query lead_profiles for matching phone
    // Try multiple formats since phone storage may vary
    const { data: lead, error: queryError } = await supabase
      .from('lead_profiles')
      .select('id, name, email')
      .or(`phone.eq.${normalizedPhone},phone.eq.+1${normalizedPhone},phone.eq.${phone}`)
      .limit(1)
      .maybeSingle();

    if (queryError) {
      console.error("[verify-lead-phone] Database query error:", queryError);
      return new Response(
        JSON.stringify({ ok: false, error: "Unable to verify phone number" } as VerifyPhoneResponse),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lead) {
      console.log("[verify-lead-phone] No lead found for phone");
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: "No record found. Please contact us directly or start a new consultation." 
        } as VerifyPhoneResponse),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("[verify-lead-phone] Lead found:", { 
      lead_id: lead.id,
      hasName: !!lead.name,
    });

    // Log successful verification event
    await supabase.from('event_log').insert({
      event_type: 'phone_verification_success',
      session_id: lead.id,
      event_payload: {
        lead_id: lead.id,
        verification_method: 'phone',
        timestamp: new Date().toISOString(),
      }
    });

    return new Response(
      JSON.stringify({ 
        ok: true, 
        lead_id: lead.id,
      } as VerifyPhoneResponse),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[verify-lead-phone] Unexpected error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" } as VerifyPhoneResponse),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
