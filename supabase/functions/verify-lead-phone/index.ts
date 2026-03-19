import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";

/**
 * verify-lead-phone
 * SECURITY: Rate limited to 5 req/min per IP — prevents phone number enumeration
 * and lead UUID harvesting. [audit SEC-03]
 */

interface VerifyPhoneRequest {
  phone: string;
}

interface VerifyPhoneResponse {
  ok: boolean;
  lead_id?: string;
  error?: string;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting: 5 req/min per IP — prevents phone enumeration attacks
    const rlKey = extractRateLimitKey(req, {});
    const rl = await checkRateLimit(supabase, rlKey, 'verify-lead-phone');
    if (!rl.allowed) return rateLimitResponse(corsHeaders);

    const body = await req.json();
    const { phone }: VerifyPhoneRequest = body;

    if (!phone || typeof phone !== 'string') {
      console.error("[verify-lead-phone] Validation failed: Missing phone");
      return new Response(
        JSON.stringify({ ok: false, error: "Phone number is required" } as VerifyPhoneResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedPhone = normalizePhone(phone);

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
