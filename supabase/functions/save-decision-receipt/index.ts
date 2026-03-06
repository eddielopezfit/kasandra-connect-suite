import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";

/** Allowed receipt types (allowlist) */
const VALID_RECEIPT_TYPES = ['seller_decision'] as const;
type ReceiptType = typeof VALID_RECEIPT_TYPES[number];

/** Minimum required keys in receipt_data for seller_decision (after normalization) */
const REQUIRED_RECEIPT_KEYS: Record<ReceiptType, string[]> = {
  seller_decision: ['situation', 'timeline', 'recommended_path'],
};

/** Valid condition tiers */
const VALID_CONDITIONS = new Set([
  'needs_work', 'mostly_original', 'standard', 'updated', 'like_new',
]);

/**
 * Normalize receipt_data.condition ↔ property_condition_raw
 * Accepts either key, validates against allowlist, writes both.
 * Rejects invalid/missing values — no "banana" passes.
 */
function normalizeReceiptData(data: Record<string, unknown>): { ok: true } | { ok: false; error: string } {
  const raw = (data?.property_condition_raw ?? data?.condition ?? null) as string | null;

  if (typeof raw !== 'string' || !VALID_CONDITIONS.has(raw)) {
    return { ok: false, error: 'receipt_data.condition is required (or property_condition_raw) and must be valid' };
  }

  data.condition = raw;
  data.property_condition_raw = raw;
  return { ok: true };
}

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

function isAttachPayload(body: any): body is AttachPayload {
  return typeof body.receipt_id === 'string' && typeof body.lead_id === 'string';
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
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
    const bodyBytes = new TextEncoder().encode(rawBody).length;
    if (bodyBytes > MAX_PAYLOAD_BYTES) {
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
      return await handleAttach(supabase, body as AttachPayload, corsHeaders);
    } else {
      return await handleCreate(supabase, body as unknown as CreatePayload, corsHeaders);
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
  supabase: any,
  payload: CreatePayload,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // Default receipt_type to 'seller_decision' if omitted
  const receiptType = payload.receipt_type || 'seller_decision';

  // Validate receipt_type
  if (!VALID_RECEIPT_TYPES.includes(receiptType as ReceiptType)) {
    return new Response(
      JSON.stringify({ ok: false, error: `Invalid receipt_type. Must be one of: ${VALID_RECEIPT_TYPES.join(', ')}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate language — default to 'en' if missing
  const language = payload.language || 'en';
  if (!['en', 'es'].includes(language)) {
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

  // Normalize aliased keys (condition ↔ property_condition_raw)
  const normResult = normalizeReceiptData(payload.receipt_data as Record<string, unknown>);
  if (!normResult.ok) {
    return new Response(
      JSON.stringify({ ok: false, error: normResult.error }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check remaining required keys (condition already guaranteed by normalizer)
  const requiredKeys = REQUIRED_RECEIPT_KEYS[receiptType as ReceiptType] || [];
  const missingKeys = requiredKeys.filter(k => !(k in payload.receipt_data));
  if (missingKeys.length > 0) {
    return new Response(
      JSON.stringify({ ok: false, error: `receipt_data missing required keys: ${missingKeys.join(', ')}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('[save-decision-receipt] Creating receipt:', {
    session_id: payload.session_id,
    receipt_type: receiptType,
    language,
  });

  // UPSERT: one receipt per (session_id, receipt_type) — handles Step 5 refreshes
  const { data, error } = await supabase
    .from('decision_receipts')
    .upsert(
      {
        session_id: payload.session_id,
        receipt_type: receiptType,
        receipt_data: payload.receipt_data,
        language,
      },
      { onConflict: 'session_id,receipt_type' }
    )
    .select('id, lead_id')
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
  supabase: any,
  payload: AttachPayload,
  corsHeaders: Record<string, string>
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

  // Two-step attach for deterministic correctness (Option A)
  // Step 1: Find the receipt and check ownership + lead_id state
  const { data: existing, error: fetchErr } = await supabase
    .from('decision_receipts')
    .select('id, lead_id')
    .eq('id', payload.receipt_id)
    .eq('session_id', payload.session_id)
    .single();

  if (fetchErr || !existing) {
    console.error('[save-decision-receipt] Receipt not found or session mismatch');
    return new Response(
      JSON.stringify({ ok: false, error: 'Receipt not found or session mismatch' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Step 2: Guard — only attach if lead_id is null or already matches
  if (existing.lead_id !== null && existing.lead_id !== payload.lead_id) {
    console.error('[save-decision-receipt] lead_id already set to different value');
    return new Response(
      JSON.stringify({ ok: false, error: 'Receipt already attached to a different lead' }),
      { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Step 3: Update
  const { data, error } = await supabase
    .from('decision_receipts')
    .update({ lead_id: payload.lead_id })
    .eq('id', payload.receipt_id)
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
