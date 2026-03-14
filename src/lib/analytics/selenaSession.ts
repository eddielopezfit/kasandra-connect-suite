/**
 * Selena Session & Context Management
 * Captures UTM params, referrer, language, and persists session across pages
 */

const SESSION_KEY = 'selena_session_id';
const CONTEXT_KEY = 'selena_context_v2';
const GUIDES_COMPLETED_KEY = 'selena_guides_completed';

export type ToolUsed = 'tucson_alpha_calculator' | 'buyer_readiness' | 'seller_readiness' | 'cash_readiness' | 'report' | 'seller_decision' | 'instant_answer';
export type CalculatorAdvantage = 'cash' | 'traditional' | 'consult';

/**
 * Canonical Intent type
 * 'cash' is the only valid value for cash offers (legacy 'cash_offer' is normalized)
 */
export type Intent = 'buy' | 'sell' | 'cash' | 'investor' | 'explore' | 'dual';

/**
 * Normalize intent value to canonical form
 * Handles legacy 'cash_offer' → 'cash' mapping
 * Returns undefined for invalid/unknown values
 */
export function normalizeIntent(raw?: string | null): Intent | undefined {
  if (!raw) return undefined;
  
  const normalized = raw.toLowerCase().trim();
  
  // Legacy mapping: cash_offer → cash
  if (normalized === 'cash_offer') return 'cash';
  
  // Valid canonical intents
  const validIntents: Intent[] = ['buy', 'sell', 'cash', 'investor', 'explore', 'dual'];
  if (validIntents.includes(normalized as Intent)) {
    return normalized as Intent;
  }
  
  // Additional legacy mappings for form values
  if (normalized === 'buyer') return 'buy';
  if (normalized === 'seller') return 'sell';
  if (normalized === 'browsing' || normalized === 'exploring') return 'explore';
  
  return undefined;
}

export interface SessionContext {
  session_id: string;
  language: 'en' | 'es';
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_path?: string;
  created_at: string;
  last_seen_at: string;
  intent?: Intent;
  timeline?: 'asap' | '30_days' | '60_90' | 'exploring';
  situation?: 'inherited' | 'divorce' | 'tired_landlord' | 'upgrading' | 'relocating' | 'other';
  condition?: 'move_in_ready' | 'minor_repairs' | 'distressed' | 'unknown';
  last_page?: string;
  last_guide_id?: string;
  guides_read?: number; // Cumulative count of unique guides viewed this session
  last_quiz_id?: string;
  // Tool usage memory (Phase 1 extension)
  tool_used?: ToolUsed;
  last_tool_result?: CalculatorAdvantage;
  // Calculator enrichment (decision-grade fields for Selena)
  estimated_value?: number;
  calculator_difference?: number;
  calculator_advantage?: CalculatorAdvantage;
  calculator_motivation?: string;
  calculator_run_id?: string;
  // Decision Room tracking (Phase 1)
  has_viewed_report?: boolean;
  last_report_id?: string;
  quiz_completed?: boolean;
  quiz_result_path?: 'buying' | 'selling' | 'cash' | 'exploring' | 'selling_compare';
  has_booked?: boolean;
  // Buyer Readiness scoring (Intelligence Injection)
  readiness_score?: number;
  primary_priority?: string;
  // Ad Funnel bridge (Phase 2)
  ad_funnel_source?: 'seller_landing' | 'seller_quiz';
  ad_funnel_value_range?: string;
  // Entry context persistence (Phase 2 - Selena memory)
  entry_source?: string;
  entry_guide_id?: string;
  entry_guide_title?: string;
  entry_guide_category?: string;
  last_seen_page_path?: string;
  last_seen_page_type?: 'guide' | 'tool' | 'quiz' | 'page';
  last_opened_at?: string;
  // Selena mode persistence — authoritative server signal, persisted so Mode 4 survives across turns
  current_mode?: 1 | 2 | 3 | 4;
  // Phase Governance (monotonic — never decreases within a session)
  chip_phase_floor?: number;          // 0-4, default 0 — governs chips + greeting gates
  greeting_phase_seen?: number;       // 0-4, highest phase greeting shown
  timeline_last_asked_turn?: number;  // turn count when timeline was last asked
  timeline_confidence?: 'low' | 'med' | 'high';
  turn_count?: number;                // monotonic client-side turn counter (incremented per sendMessage)
  // Neighborhood Intelligence (Phase 1)
  last_neighborhood_zip?: string;
  neighborhood_explored?: boolean;
  // Neighborhood Quiz (Phase 2)
  neighborhood_quiz_top_zip?: string | null;
  // Tool completion tracking (real-time journey awareness)
  tools_completed?: string[];           // Canonical tool IDs completed this session
  last_tool_completed?: string;         // Most recent tool finished (FIX 6: renamed from tool_used)
  // Cross-turn high-intent signal persistence
  inherited_home?: boolean;
  trust_signal_detected?: boolean;
  // Guide completion tracking (FIX 2: journey awareness)
  guides_completed?: string[];          // Guide IDs the user has completed (50%+ scroll)
  // Seller Decision Path
  seller_decision_step?: number;
  seller_decision_recommended_path?: 'cash' | 'traditional' | 'consult';
  seller_goal_priority?: 'speed' | 'price' | 'least_stress' | 'privacy' | 'not_sure';
  property_condition_raw?: 'needs_work' | 'mostly_original' | 'standard' | 'updated' | 'like_new';
  // Chip Governance: Last-Chance Recovery (Feature 3)
  booking_chips_shown_at?: string | null;  // ISO timestamp when booking chips were last shown (null = cleared)
  recovery_shown?: boolean;                // Prevents recovery greeting loop within session
  // P1.1: Session Snapshot restoration flag
  restored_from_snapshot?: boolean;        // True when context was restored from server snapshot
  // Journey State Engine (TOFU/MOFU/BOFU)
  journey_state?: 'explore' | 'evaluate' | 'decide';
  // Equity Pulse (Saved Utility)
  equity_pulse_saved?: boolean;
  equity_pulse_value?: number;
  equity_pulse_recommendation?: string;
  mortgage_balance?: number;
  // Instant Answer Machine
  estimated_budget?: number;
  // Tool-specific entry data (typed fields to eliminate `as any` casts)
  closing_cost_data?: {
    purchasePrice: number;
    loanType: string;
    downPaymentPercent: number;
    estimatedLow: number;
    estimatedHigh: number;
    totalCashNeeded: number;
  };
  seller_calc_data?: {
    estimatedValue: number;
    mortgageBalance: number;
    cashNetProceeds: number;
    traditionalNetProceeds: number;
    recommendation: string;
    netDifference: number;
    motivation: string;
    timeline: string;
  };
  readiness_entry_data?: {
    score: number;
    primaryPriority: string;
    toolType: 'buyer' | 'seller' | 'cash';
  };
  off_market_data?: {
    areas: string[];
    budgetRange: string;
    timeline: string;
    propertyType: string;
  };
  // Off-market registration
  off_market_registered?: boolean;
  // Readiness capture prompt tracking
  tool_buyer_readiness_capture_prompted?: boolean;
  tool_seller_readiness_capture_prompted?: boolean;
  neighborhood_compare_data?: {
    areasCompared: string[];
  };
  market_intel_data?: {
    daysOnMarket: number;
    saleToListRatio: string;
    holdingCostPerDay: number;
    isLive: boolean;
  };
}

/**
 * Generate a simple UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Parse UTM parameters from current URL
 */
function parseUTMParams(): Partial<SessionContext> {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const utms: Partial<SessionContext> = {};
  
  const utm_source = params.get('utm_source');
  const utm_medium = params.get('utm_medium');
  const utm_campaign = params.get('utm_campaign');
  const utm_content = params.get('utm_content');
  const utm_term = params.get('utm_term');
  
  if (utm_source) utms.utm_source = utm_source;
  if (utm_medium) utms.utm_medium = utm_medium;
  if (utm_campaign) utms.utm_campaign = utm_campaign;
  if (utm_content) utms.utm_content = utm_content;
  if (utm_term) utms.utm_term = utm_term;
  
  return utms;
}

/**
 * Get the stored session ID or create a new one
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  // DEV + localhost only: Allow QA session override for deterministic test runs
  if (import.meta.env.DEV && typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    const qa = localStorage.getItem('selena_qa_session_id');
    if (qa) return qa;
  }
  
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Initialize or retrieve session context
 * Captures UTMs on first visit, preserves them across navigation
 */
export function initSessionContext(language: 'en' | 'es' = 'en'): SessionContext {
  if (typeof window === 'undefined') {
    return {
      session_id: '',
      language,
      created_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    };
  }

  const sessionId = getOrCreateSessionId();
  const now = new Date().toISOString();
  
  // Try to load existing context
  let existingContext: Partial<SessionContext> = {};
  try {
    const stored = localStorage.getItem(CONTEXT_KEY);
    if (stored) {
      existingContext = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[Selena] Failed to parse stored context:', e);
  }

  // If this is a new session, capture UTMs and referrer
  const isNewSession = !existingContext.session_id || existingContext.session_id !== sessionId;
  
  const utmParams = parseUTMParams();
  const hasNewUTMs = Object.keys(utmParams).length > 0;

  const context: SessionContext = {
    session_id: sessionId,
    language,
    created_at: existingContext.created_at || now,
    last_seen_at: now,
    // Preserve existing UTMs unless new ones are provided
    utm_source: hasNewUTMs ? utmParams.utm_source : existingContext.utm_source,
    utm_medium: hasNewUTMs ? utmParams.utm_medium : existingContext.utm_medium,
    utm_campaign: hasNewUTMs ? utmParams.utm_campaign : existingContext.utm_campaign,
    utm_content: hasNewUTMs ? utmParams.utm_content : existingContext.utm_content,
    utm_term: hasNewUTMs ? utmParams.utm_term : existingContext.utm_term,
    // Only set landing info on new session
    referrer: isNewSession ? document.referrer || undefined : existingContext.referrer,
    landing_path: isNewSession ? window.location.pathname : existingContext.landing_path,
    // Preserve intent data
    intent: existingContext.intent,
    timeline: existingContext.timeline,
    situation: existingContext.situation,
    condition: existingContext.condition,
    last_page: existingContext.last_page,
    last_guide_id: existingContext.last_guide_id,
    last_quiz_id: existingContext.last_quiz_id,
  };

  // Save updated context
  try {
    localStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
  } catch (e) {
    console.warn('[Selena] Failed to save context:', e);
  }

  return context;
}

/**
 * Get the current session context
 * Normalizes intent on read to handle legacy 'cash_offer' values
 */
export function getSessionContext(): SessionContext | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONTEXT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Normalize intent on read (handles legacy 'cash_offer' stored values)
      if (parsed.intent) {
        parsed.intent = normalizeIntent(parsed.intent);
      }
      return parsed;
    }
  } catch (e) {
    console.warn('[Selena] Failed to read context:', e);
  }
  return null;
}

/**
 * Update session context with partial data
 * Normalizes intent on write to ensure canonical values are stored
 */
export function updateSessionContext(updates: Partial<SessionContext>): SessionContext | null {
  if (typeof window === 'undefined') return null;
  
  const current = getSessionContext();
  if (!current) return null;
  
  // Normalize intent if provided
  const normalizedUpdates = { ...updates };
  if (updates.intent) {
    normalizedUpdates.intent = normalizeIntent(updates.intent as string);
  }
  
  const updated: SessionContext = {
    ...current,
    ...normalizedUpdates,
    last_seen_at: new Date().toISOString(),
  };
  
  try {
    localStorage.setItem(CONTEXT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[Selena] Failed to update context:', e);
  }
  
  return updated;
}

/**
 * Empty = null | undefined | '' | []
 * NOT empty = 0 (valid number), false (valid boolean), any non-empty value
 */
function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * Dev-only logging that avoids PII leakage
 * Only logs keys, never values
 */
function devLog(msg: string, data?: unknown) {
  if (import.meta.env.DEV) {
    console.log(msg, data ?? '');
  }
}

/**
 * Set a session context field only if it's currently empty
 * Prevents mount-time auto-writes from overwriting user-declared values
 * 
 * @param key - The SessionContext field to set
 * @param value - The value to set if field is empty
 * @returns true if the field was set, false if it was skipped
 */
export function setFieldIfEmpty<K extends keyof SessionContext>(
  key: K,
  value: SessionContext[K]
): boolean {
  const current = getSessionContext();
  if (!current) return false;

  const currentValue = current[key];
  if (!isEmptyValue(currentValue)) {
    devLog(`[Selena] setFieldIfEmpty skipped`, { key: String(key) });
    return false;
  }

  // If the new value is undefined/null/empty string/empty array, don't apply.
  if (isEmptyValue(value)) {
    devLog(`[Selena] setFieldIfEmpty skipped (new value empty)`, { key: String(key) });
    return false;
  }

  updateSessionContext({ [key]: value } as Partial<SessionContext>);
  devLog(`[Selena] setFieldIfEmpty applied`, { key: String(key) });
  return true;
}

/**
 * Set multiple session context fields, but only those that are currently empty
 * Uses a single updateSessionContext call for efficiency
 * 
 * @param updates - Partial SessionContext with fields to potentially set
 * @returns Object with arrays of applied and skipped field keys
 */
export function setFieldsIfEmpty(
  updates: Partial<SessionContext>
): { applied: (keyof SessionContext)[]; skipped: (keyof SessionContext)[] } {
  const current = getSessionContext();
  const result = {
    applied: [] as (keyof SessionContext)[],
    skipped: [] as (keyof SessionContext)[],
  };

  if (!current) return result;

  const toApply: Partial<SessionContext> = {};

  for (const key of Object.keys(updates) as (keyof SessionContext)[]) {
    const newValue = updates[key];

    // If update value is empty/undefined, treat as no-op
    if (isEmptyValue(newValue)) {
      result.skipped.push(key);
      continue;
    }

    const currentValue = current[key];
    if (isEmptyValue(currentValue)) {
      // Use type-safe assignment via Record cast
      (toApply as Record<keyof SessionContext, unknown>)[key] = newValue;
      result.applied.push(key);
    } else {
      result.skipped.push(key);
    }
  }

  if (Object.keys(toApply).length > 0) {
    updateSessionContext(toApply);
  }

  if (result.applied.length || result.skipped.length) {
    devLog(`[Selena] setFieldsIfEmpty`, { applied: result.applied, skipped: result.skipped });
  }

  return result;
}

/**
 * @deprecated Use setFieldIfEmpty('intent', value) instead
 */
export function setIntentIfEmpty(intent: SessionContext['intent']): boolean {
  return setFieldIfEmpty('intent', intent);
}

/**
 * Clear session data (for testing/reset)
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CONTEXT_KEY);
  localStorage.removeItem(GUIDES_COMPLETED_KEY);
}

// ============= FIX 2: GUIDE COMPLETION TRACKING =============

/**
 * Get the list of completed guide IDs from sessionStorage
 */
export function getGuidesCompleted(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = sessionStorage.getItem(GUIDES_COMPLETED_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as string[];
  } catch {
    return [];
  }
}

/**
 * Mark a guide as completed (user scrolled 50%+ or spent 30s+)
 * Appends to the array without duplicates
 */
export function markGuideCompleted(guideId: string): void {
  if (typeof window === 'undefined') return;
  if (!guideId) return;
  
  try {
    const current = getGuidesCompleted();
    if (current.includes(guideId)) return; // Already tracked
    
    const updated = [...current, guideId];
    sessionStorage.setItem(GUIDES_COMPLETED_KEY, JSON.stringify(updated));
    
    // Also update SessionContext for payload inclusion
    updateSessionContext({ guides_completed: updated });
  } catch {
    // Silent fail — guide tracking is non-critical
  }
}

/**
 * Check if a specific guide has been completed
 */
export function isGuideCompleted(guideId: string): boolean {
  return getGuidesCompleted().includes(guideId);
}
