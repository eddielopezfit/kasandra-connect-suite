/**
 * Selena Session & Context Management
 * Captures UTM params, referrer, language, and persists session across pages
 */

const SESSION_KEY = 'selena_session_id';
const CONTEXT_KEY = 'selena_context_v2';

export type ToolUsed = 'tucson_alpha_calculator' | 'buyer_readiness' | 'report';
export type CalculatorAdvantage = 'cash' | 'traditional' | 'consult';

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
  intent?: 'cash_offer' | 'sell' | 'buy' | 'investor' | 'explore';
  timeline?: 'asap' | '30_days' | '60_90' | 'exploring';
  situation?: 'inherited' | 'divorce' | 'tired_landlord' | 'upgrading' | 'relocating' | 'other';
  condition?: 'move_in_ready' | 'minor_repairs' | 'distressed' | 'unknown';
  last_page?: string;
  last_guide_id?: string;
  last_quiz_id?: string;
  // Tool usage memory (Phase 1 extension)
  tool_used?: ToolUsed;
  last_tool_result?: CalculatorAdvantage;
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
 */
export function getSessionContext(): SessionContext | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONTEXT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[Selena] Failed to read context:', e);
  }
  return null;
}

/**
 * Update session context with partial data
 */
export function updateSessionContext(updates: Partial<SessionContext>): SessionContext | null {
  if (typeof window === 'undefined') return null;
  
  const current = getSessionContext();
  if (!current) return null;
  
  const updated: SessionContext = {
    ...current,
    ...updates,
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
 * Clear session data (for testing/reset)
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CONTEXT_KEY);
}
