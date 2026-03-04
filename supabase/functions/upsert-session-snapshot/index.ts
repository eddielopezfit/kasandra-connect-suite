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

    // ── Guard 1: UUID validation ──
    const session_id = body.session_id;
    if (!session_id || typeof session_id !== 'string' || !UUID_RE.test(session_id)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'invalid_session_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(supabase, `ip:${ip}`, 'upsert-session-snapshot');
    if (!rl.allowed) return rateLimitResponse(corsHeaders);

    // ── Guard 2: Fetch existing row for merge ──
    const { data: existing } = await supabase
      .from('session_snapshots')
      .select('tools_used, guides_read, calculator_data, context_json')
      .eq('session_id', session_id)
      .maybeSingle();

    // Build upsert payload with shallow merge (new wins)
    const incomingToolsUsed = Array.isArray(body.tools_used) && body.tools_used.length > 0
      ? body.tools_used
      : (existing?.tools_used ?? []);

    const incomingGuidesRead = Array.isArray(body.guides_read) && body.guides_read.length > 0
      ? body.guides_read
      : (existing?.guides_read ?? []);

    // Shallow merge: { ...existing, ...incoming } — new wins
    const incomingCalcData = body.calculator_data && typeof body.calculator_data === 'object' && Object.keys(body.calculator_data).length > 0
      ? { ...(existing?.calculator_data ?? {}), ...body.calculator_data }
      : (existing?.calculator_data ?? {});

    const incomingContextJson = body.context_json && typeof body.context_json === 'object' && Object.keys(body.context_json).length > 0
      ? { ...(existing?.context_json ?? {}), ...body.context_json }
      : (existing?.context_json ?? {});

    const row: Record<string, unknown> = {
      session_id,
      tools_used: incomingToolsUsed,
      guides_read: incomingGuidesRead,
      calculator_data: incomingCalcData,
      context_json: incomingContextJson,
    };

    // Optional scalar fields — only write if provided (don't null-out existing)
    if (body.intent) row.intent = body.intent;
    if (body.last_page) row.last_page = body.last_page;
    if (typeof body.readiness_score === 'number') row.readiness_score = body.readiness_score;
    if (body.primary_priority) row.primary_priority = body.primary_priority;
    if (body.lead_id && UUID_RE.test(body.lead_id)) row.lead_id = body.lead_id;

    const { error } = await supabase
      .from('session_snapshots')
      .upsert(row, { onConflict: 'session_id' });

    if (error) {
      console.error('[upsert-session-snapshot] Upsert error:', error);
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to save snapshot' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Equity Pulse: Insert saved_scenario when equity_pulse_saved ──
    let scenarioSaved = false;
    const ctxJson = incomingContextJson as Record<string, unknown>;
    if (ctxJson?.equity_pulse_saved === true) {
      const calcData = incomingCalcData as Record<string, unknown>;
      const estimatedValue = typeof calcData?.estimated_value === 'number' ? calcData.estimated_value : null;
      const mortgageBalance = typeof calcData?.mortgage_balance === 'number' ? calcData.mortgage_balance : null;
      const zipCode = typeof ctxJson?.zip_code === 'string' ? ctxJson.zip_code : null;

      // Build results_json from available calculator data
      const resultsJson: Record<string, unknown> = { ...calcData };
      if (ctxJson?.equity_pulse_recommendation) {
        resultsJson.recommendation = ctxJson.equity_pulse_recommendation;
      }
      if (ctxJson?.equity_pulse_value) {
        resultsJson.equity_pulse_value = ctxJson.equity_pulse_value;
      }

      const scenarioRow: Record<string, unknown> = {
        scenario_type: 'net_to_seller',
        results_json: resultsJson,
        is_monitoring: true,
        estimated_value: estimatedValue,
        mortgage_balance: mortgageBalance,
        zip_code: zipCode,
      };

      // Link to lead if available
      if (body.lead_id && UUID_RE.test(body.lead_id)) {
        scenarioRow.lead_id = body.lead_id;
      }

      const { error: scenarioError } = await supabase
        .from('saved_scenarios')
        .insert(scenarioRow);

      if (scenarioError) {
        console.error('[upsert-session-snapshot] saved_scenarios insert error:', scenarioError);
        // Non-fatal — snapshot was already saved successfully
      } else {
        scenarioSaved = true;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, scenario_saved: scenarioSaved }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('[upsert-session-snapshot] error:', e);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
