import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_RECEIPT_TYPES = ['seller_decision'] as const;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const session_id = body.session_id;
    const receipt_type = body.receipt_type || 'seller_decision';

    // Validate session_id
    if (!session_id || typeof session_id !== 'string' || session_id.length > 100) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Valid session_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate receipt_type
    if (!VALID_RECEIPT_TYPES.includes(receipt_type)) {
      return new Response(
        JSON.stringify({ ok: false, error: `Invalid receipt_type` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting (looser for reads: 30/hr)
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(supabase, `ip:${ip}`, 'get-decision-receipt');
    if (!rl.allowed) return rateLimitResponse(corsHeaders);

    const { data, error } = await supabase
      .from('decision_receipts')
      .select('id, session_id, receipt_type, receipt_data, lead_id, language, created_at, updated_at')
      .eq('session_id', session_id)
      .eq('receipt_type', receipt_type)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Receipt not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, receipt: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('[get-decision-receipt] error:', e);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
