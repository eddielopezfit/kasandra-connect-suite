import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const session_id = body.session_id;
    const lead_id = body.lead_id;

    // Validate at least one lookup key
    if ((!session_id || !UUID_RE.test(session_id)) && (!lead_id || !UUID_RE.test(lead_id))) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Valid session_id or lead_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(supabase, `ip:${ip}`, 'get-session-snapshot');
    if (!rl.allowed) return rateLimitResponse(corsHeaders);

    // Try session_id first, then lead_id fallback
    let data = null;

    if (session_id && UUID_RE.test(session_id)) {
      const result = await supabase
        .from('session_snapshots')
        .select('*')
        .eq('session_id', session_id)
        .maybeSingle();
      data = result.data;
    }

    if (!data && lead_id && UUID_RE.test(lead_id)) {
      const result = await supabase
        .from('session_snapshots')
        .select('*')
        .eq('lead_id', lead_id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      data = result.data;
    }

    return new Response(
      JSON.stringify({ ok: true, snapshot: data || null }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('[get-session-snapshot] error:', e);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
