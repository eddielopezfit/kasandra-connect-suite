import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Allowed receipt types (allowlist) */
const VALID_RECEIPT_TYPES = ['seller_decision'] as const;
type ReceiptType = typeof VALID_RECEIPT_TYPES[number];

/** Minimum required keys in receipt_data for seller_decision */
const REQUIRED_RECEIPT_KEYS: Record<ReceiptType, string[]> = {
  seller_decision: ['situation', 'timeline', 'condition', 'recommended_path'],
};

const MAX_PAYLOAD_BYTES = 50 * 1024; // 50KB

interface CreatePayload {
  session_id: string;
  language: 'en' | 'es';
  receipt_type: ReceiptType;
  receipt_data: Record<string, unknown>;
}

interface AttachPayload {
  session_id: string;
  receipt_id: string;
  lead_id: string;
}

function isAttachPayload(body: Record<string, unknown>): body is AttachPayload {
  return typeof body.receipt_id === 'string' && typeof body.lead_id === 'string';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Payload size check ──
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Payload too large (max 50KB)' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawBody = await req.text();
    if (rawBody.length > MAX_PAYLOAD_BYTES) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Payload too large (max 50KB)' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = JSON.parse(rawBody) as Record<string, unknown>;

    // ── session_id required always ──
    if (!body.session_id || typeof body.session_id !== 'string' || body.session_id.length > 100) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Valid session_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Rate limiting (IP-based for bot resistance + session as fallback context) ──
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const rlKey = `ip:${ip}`;
    const rl = await checkRateLimit(supabase, rlKey, 'save-decision-receipt');
    if (!rl.allowed) return rateLimitResponse(corsHeaders);

    // ── Branch: Attach (receipt_id + lead_id) vs Create ──
    if (isAttachPayload(body)) {
      return await handleAttach(supabase, body as AttachPayload);
    } else {
      return await handleCreate(supabase, body as unknown as CreatePayload);
    }
  } catch (error) {
    console.error('[save-decision-receipt] Unexpected error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/** INSERT or UPSERT a new decision receipt */
async function handleCreate(
  supabase: ReturnType<typeof createClient>,
  payload: CreatePayload
): Promise<Response> {
  // Validate receipt_type
  if (!VALID_RECEIPT_TYPES.includes(payload.receipt_type as ReceiptType)) {
    return new Response(
      JSON.stringify({ ok: false, error: `Invalid receipt_type. Must be one of: ${VALID_RECEIPT_TYPES.join(', ')}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate language
  if (!['en', 'es'].includes(payload.language)) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Language must be "en" or "es"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate receipt_data has required keys
  if (!payload.receipt_data || typeof payload.receipt_data !== 'object') {
    return new Response(
      JSON.stringify({ ok: false, error: 'receipt_data must be a JSON object' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const requiredKeys = REQUIRED_RECEIPT_KEYS[payload.receipt_type as ReceiptType] || [];
  const missingKeys = requiredKeys.filter(k => !(k in payload.receipt_data));
  if (missingKeys.length > 0) {
    return new Response(
      JSON.stringify({ ok: false, error: `receipt_data missing required keys: ${missingKeys.join(', ')}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('[save-decision-receipt] Creating receipt:', {
    session_id: payload.session_id,
    receipt_type: payload.receipt_type,
    language: payload.language,
  });

  // UPSERT: one receipt per (session_id, receipt_type) — handles Step 5 refreshes
  const { data, error } = await supabase
    .from('decision_receipts')
    .upsert(
      {
        session_id: payload.session_id,
        receipt_type: payload.receipt_type,
        receipt_data: payload.receipt_data,
        language: payload.language,
      },
      { onConflict: 'session_id,receipt_type' }
    )
    .select('id')
    .single();

  if (error) {
    console.error('[save-decision-receipt] Upsert error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Failed to save receipt' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('[save-decision-receipt] Receipt saved:', data.id);

  return new Response(
    JSON.stringify({ ok: true, receipt_id: data.id }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/** Attach a lead_id to an existing receipt (anti-hijack: session_id must match) */
async function handleAttach(
  supabase: ReturnType<typeof createClient>,
  payload: AttachPayload
): Promise<Response> {
  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(payload.receipt_id) || !uuidRegex.test(payload.lead_id)) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Invalid receipt_id or lead_id format' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('[save-decision-receipt] Attaching lead:', {
    receipt_id: payload.receipt_id,
    session_id: payload.session_id,
  });

  // Anti-hijack: match both id AND session_id
  // Guard: only attach if lead_id IS NULL or already matches (prevents overwrite)
  const { data, error } = await supabase
    .from('decision_receipts')
    .update({ lead_id: payload.lead_id })
    .eq('id', payload.receipt_id)
    .eq('session_id', payload.session_id)
    .or(`lead_id.is.null,lead_id.eq.${payload.lead_id}`)
    .select('id')
    .single();

  if (error || !data) {
    console.error('[save-decision-receipt] Attach failed:', error?.message || 'No matching receipt');
    return new Response(
      JSON.stringify({ ok: false, error: 'Receipt not found, session mismatch, or lead_id already set' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('[save-decision-receipt] Lead attached to receipt:', data.id);

  return new Response(
    JSON.stringify({ ok: true, receipt_id: data.id, attached: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
