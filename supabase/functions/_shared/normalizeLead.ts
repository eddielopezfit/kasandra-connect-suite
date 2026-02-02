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
  // Dual intent (VIP)
  buy_and_sell: { canonical: 'dual', raw: 'buy_and_sell' },
  dual: { canonical: 'dual', raw: 'buy_and_sell' },
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
  canonical: 'buy' | 'sell' | 'cash' | 'dual' | 'explore' | null;
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

  const intentMap: Record<string, 'buy' | 'sell' | 'cash' | 'dual' | 'explore'> = {
    buyer: 'buy',
    buy: 'buy',
    buying: 'buy',
    seller: 'sell',
    sell: 'sell',
    selling: 'sell',
    cash_offer: 'cash',
    cash: 'cash',
    buy_and_sell: 'dual',
    dual: 'dual',
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
