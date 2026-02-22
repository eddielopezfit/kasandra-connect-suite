/**
 * Intent normalization map - includes new buy_and_sell and browsing intents
 */
const INTENT_MAP: Record<string, { canonical: string; raw: string }> = {
  // Buyer intents
  buyer: { canonical: 'buy', raw: 'buyer' },
  buy: { canonical: 'buy', raw: 'buyer' },
  buying: { canonical: 'buy', raw: 'buyer' },
  // Seller intents
  seller: { canonical: 'sell', raw: 'seller' },
  sell: { canonical: 'sell', raw: 'seller' },
  selling: { canonical: 'sell', raw: 'seller' },
  // Cash offer intents
  cash_offer: { canonical: 'cash', raw: 'cash_offer' },
  cash: { canonical: 'cash', raw: 'cash_offer' },
  // Dual intent (maps to sell for DB constraint)
  buy_and_sell: { canonical: 'sell', raw: 'buy_and_sell' },
  dual: { canonical: 'sell', raw: 'buy_and_sell' },
  // Nurture/browsing intents
  browsing: { canonical: 'explore', raw: 'browsing' },
  unknown: { canonical: 'explore', raw: 'browsing' },
  exploring: { canonical: 'explore', raw: 'browsing' },
  explore: { canonical: 'explore', raw: 'browsing' },
};

/**
 * Centralized lead value normalization for database constraints
 * Used by submit-consultation-intake and upsert-lead-profile
 * 
 * Returns both canonical (DB-safe) and raw (original) values for GHL sync
 */

export interface NormalizedIntent {
  canonical: 'buy' | 'sell' | 'cash' | 'explore' | null;
  raw: string | null;
}

export interface NormalizedTimeline {
  canonical: 'asap' | '30_days' | '60_90' | 'exploring' | null;
  raw: string | null;
}

/**
 * Normalize intent value to DB-valid canonical form
 * 
 * Mapping:
 * - buyer / buy → buy
 * - seller / sell → sell  
 * - cash_offer / cash → cash
 * - buy_and_sell / dual → dual
 * - browsing / exploring / explore / unknown → explore
 * - anything else → null
 */
export function normalizeIntent(raw: string | undefined | null): NormalizedIntent {
  if (!raw) {
    return { canonical: null, raw: null };
  }

  const intentMap: Record<string, 'buy' | 'sell' | 'cash' | 'explore'> = {
    buyer: 'buy',
    buy: 'buy',
    buying: 'buy',
    seller: 'sell',
    sell: 'sell',
    selling: 'sell',
    cash_offer: 'cash',
    cash: 'cash',
    buy_and_sell: 'sell', // DB constraint doesn't allow 'dual'; map to primary action
    dual: 'sell',
    browsing: 'explore',
    unknown: 'explore',
    exploring: 'explore',
    explore: 'explore',
  };

  const canonical = intentMap[raw.toLowerCase()] || null;
  return { canonical, raw };
}

/**
 * Normalize timeline value to DB-valid canonical form
 * 
 * Mapping:
 * - immediately / asap → asap
 * - 30_days → 30_days
 * - 1_3_months → 60_90 (closest semantic match)
 * - 3_6_months / 6_plus_months / researching / exploring → exploring
 * - anything else → null
 */
export function normalizeTimeline(raw: string | undefined | null): NormalizedTimeline {
  if (!raw) {
    return { canonical: null, raw: null };
  }

  const timelineMap: Record<string, 'asap' | '30_days' | '60_90' | 'exploring'> = {
    immediately: 'asap',
    asap: 'asap',
    '30_days': '30_days',
    '1_3_months': '60_90',
    '60_90': '60_90',
    '3_6_months': 'exploring',
    '6_plus_months': 'exploring',
    researching: 'exploring',
    exploring: 'exploring',
  };

  const canonical = timelineMap[raw.toLowerCase()] || null;
  return { canonical, raw };
}

// ── DB-safe value normalizers ────────────────────────────────────────────────

/**
 * Normalize condition to DB-valid values: move_in_ready | minor_repairs | distressed | null
 * Maps ad funnel values (excellent/good/fair/poor/needs_work) to DB constraint values
 */
export function normalizeCondition(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const map: Record<string, string> = {
    excellent: 'move_in_ready',
    good: 'move_in_ready',
    move_in_ready: 'move_in_ready',
    fair: 'minor_repairs',
    needs_work: 'minor_repairs',
    minor_repairs: 'minor_repairs',
    poor: 'distressed',
    distressed: 'distressed',
  };
  return map[raw.toLowerCase()] || null;
}

/**
 * Normalize situation to DB-valid values: inherited | divorce | tired_landlord | none | null
 */
export function normalizeSituation(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const map: Record<string, string> = {
    inherited: 'inherited',
    divorce: 'divorce',
    tired_landlord: 'tired_landlord',
    none: 'none',
    relocating: 'none',
    downsizing: 'none',
    other: 'none',
  };
  return map[raw.toLowerCase()] || 'none';
}

// ── Lead Scoring (Phase E — Shared) ─────────────────────────────────────────

export interface LeadScoreInput {
  intent_canonical?: string | null;
  timeline_canonical?: string | null;
  quiz_completed?: boolean;
  phone?: string | null;
  property_address?: string | null;
  tool_used?: string | null;
  readiness_score?: number | null;
  consent_communications?: boolean;
  has_viewed_report?: boolean;
}

export interface LeadScoreResult {
  lead_score: number;
  lead_score_bucket: 'hot' | 'warm' | 'cold';
  lead_grade: 'A' | 'B' | 'C' | 'D';
  score_reasons: string;
}

/**
 * Unified lead scoring function used by all lead-entry edge functions.
 *
 * Rubric (max 100):
 *   Intent:       0-25 (cash=25, sell/dual=20, buy=15, explore=5)
 *   Timeline:     0-25 (asap=25, 30_days=20, 60_90=15, exploring=5)
 *   Quiz:          10  (only when genuinely completed — caller validates)
 *   Phone:         10  (length >= 10)
 *   Address:       10
 *   Tool used:      5
 *   Readiness>=60:  5
 *   Consent:        5  (only when explicitly true)
 *   Viewed report:  5
 *
 * Buckets: >=75 hot, >=45 warm, else cold
 */
export function computeLeadScore(input: LeadScoreInput): LeadScoreResult {
  let score = 0;
  const reasons: string[] = [];

  // Intent (+25 max)
  const intentScores: Record<string, number> = { cash: 25, sell: 20, dual: 20, buy: 15, explore: 5 };
  const intentPts = intentScores[input.intent_canonical || 'explore'] || 5;
  score += intentPts;
  reasons.push(`intent:${input.intent_canonical || 'explore'}(+${intentPts})`);

  // Timeline (+25 max)
  const timelineScores: Record<string, number> = { asap: 25, '30_days': 20, '60_90': 15, exploring: 5 };
  const timelinePts = timelineScores[input.timeline_canonical || 'exploring'] || 5;
  score += timelinePts;
  reasons.push(`timeline:${input.timeline_canonical || 'exploring'}(+${timelinePts})`);

  // Quiz completed (+10) — Guardrail 2: caller must validate before setting true
  if (input.quiz_completed) {
    score += 10;
    reasons.push('quiz_completed(+10)');
  }

  // Phone (+10)
  if (input.phone && input.phone.trim().length >= 10) {
    score += 10;
    reasons.push('phone_provided(+10)');
  }

  // Property address (+10)
  if (input.property_address && input.property_address.trim()) {
    score += 10;
    reasons.push('property_address(+10)');
  }

  // Tool used (+5)
  if (input.tool_used) {
    score += 5;
    reasons.push(`tool_used:${input.tool_used}(+5)`);
  }

  // Readiness score >= 60 (+5)
  if (input.readiness_score && input.readiness_score >= 60) {
    score += 5;
    reasons.push(`readiness_score:${input.readiness_score}(+5)`);
  }

  // Consent given (+5) — Guardrail 3: only when explicitly true
  if (input.consent_communications === true) {
    score += 5;
    reasons.push('consent_given(+5)');
  }

  // Has viewed report (+5)
  if (input.has_viewed_report) {
    score += 5;
    reasons.push('has_viewed_report(+5)');
  }

  score = Math.min(score, 100);

  const lead_score_bucket: 'hot' | 'warm' | 'cold' =
    score >= 75 ? 'hot' : score >= 45 ? 'warm' : 'cold';

  // Map to DB-compatible grade (lead_profiles_lead_grade_check: A/B/C/D)
  const lead_grade: 'A' | 'B' | 'C' | 'D' =
    score >= 75 ? 'A' : score >= 45 ? 'B' : score >= 25 ? 'C' : 'D';

  return {
    lead_score: score,
    lead_score_bucket,
    lead_grade,
    score_reasons: reasons.join('|'),
  };
}

/**
 * Light dedupe check for scoring event_log writes.
 * Returns true if we should skip logging (score unchanged AND last log < 10 min ago).
 * Guardrail 4: prevents event_log spam from repeated upsert-lead-profile calls.
 */
export async function shouldSkipScoreLog(
  supabase: any,
  leadId: string,
  newScore: number
): Promise<boolean> {
  try {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('event_log')
      .select('event_payload')
      .eq('event_type', 'lead_score_computed')
      .eq('session_id', leadId)
      .gte('created_at', tenMinAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.event_payload?.lead_score === newScore) {
      return true; // same score within 10 min — skip
    }
  } catch {
    // On error, don't skip — let the log through
  }
  return false;
}

/**
 * Structured error response for frontend assertions
 */
export interface StructuredError {
  ok: false;
  code: 'DB_CONSTRAINT' | 'VALIDATION' | 'SERVER_ERROR';
  field?: string;
  message: string;
}

export function createStructuredError(
  code: StructuredError['code'],
  message: string,
  field?: string
): StructuredError {
  return { ok: false, code, field, message };
}
