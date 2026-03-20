/**
 * Booking Gate Logic: earned access, stall detection, conversation state
 * Extracted from selena-chat/index.ts
 */

import type { ChatMessage, ChatRequest, CanonicalIntent } from "./types.ts";
import { EMAIL_REGEX } from "./leadCapture.ts";
import type { ConversationState } from "./modeContext.ts";

// ============= BOOKING GATE PATTERNS =============
export const BOOKING_KEYWORDS = /book|schedule|call|talk|meet|appointment|consulta|cita|llamar|hablar|agendar/i;
export const BOOKING_PHRASES = /(talk to kasandra|priority call|strategy call|consultation|consult|review strategy|revisar estrategia|verify.*kasandra|verificar.*kasandra)/i;

/**
 * Checks if user explicitly asked to book/call
 */
export function userAskedToBook(message: string): boolean {
  return BOOKING_KEYWORDS.test(message);
}

/**
 * Count user turns only
 */
export function userTurnCount(history: Array<{ role: string }>): number {
  return history.filter(m => m.role === 'user').length;
}

/**
 * Determines if the user has earned access to booking CTA
 */
export function hasEarnedBookingAccess(
  context: ChatRequest["context"], 
  history: Array<{ role: string }>,
  message: string,
  extractedEmail?: string | null
): boolean {
  if (userAskedToBook(message)) return true;
  if (context.last_tool_completed) return true;
  if (context.last_tool_result) return true;
  if (context.quiz_completed) return true;
  if (extractedEmail) return true;
  return false;
}

/**
 * Filters suggestions to remove booking-related language if not earned
 */
export function filterSuggestionsForEarnedAccess(suggestions: string[], hasEarned: boolean): string[] {
  if (hasEarned) return suggestions;
  return suggestions.filter(s => 
    !BOOKING_KEYWORDS.test(s) && !BOOKING_PHRASES.test(s)
  );
}

/**
 * Builds conversation state for mode detection
 */
export function buildConversationState(
  context: ChatRequest["context"],
  history: ChatMessage[],
  message: string,
  extractedEmail: string | null,
  primaryIntent: CanonicalIntent
): ConversationState {
  const userTurns = history.filter(m => m.role === 'user').length;
  
  const emailInHistory = history
    .filter(m => m.role === 'user')
    .some(m => EMAIL_REGEX.test(m.content));
  EMAIL_REGEX.lastIndex = 0;

  return {
    userTurns,
    hasIntent: !!primaryIntent && primaryIntent !== 'explore',
    intent: primaryIntent,
    guidesRead: context.guides_read ?? 0,
    toolUsed: !!context.last_tool_completed,
    quizCompleted: !!context.quiz_completed,
    hasToolResult: !!context.last_tool_result,
    hasEmail: !!extractedEmail || emailInHistory,
    explicitBookingAsk: userAskedToBook(message),
  };
}

// ============= STALL DETECTION =============
const STALL_PATTERNS = /just curious|solo curiosidad|just looking|solo mirando|i don't know|no sé|not sure|no estoy segur/i;

export function isStalled(history: ChatMessage[], message: string): boolean {
  const userMessages = history.filter(m => m.role === 'user');
  if (userMessages.length < 5) return false;
  const recentMessages = userMessages.slice(-3);
  const stallCount = recentMessages.filter(m => STALL_PATTERNS.test(m.content)).length;
  return stallCount >= 2 || STALL_PATTERNS.test(message);
}

// ============= SIMILARITY MATCHING =============
export function isSimilar(str1: string, str2: string, threshold = 0.8): boolean {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return true;
  if (s1.length === 0 || s2.length === 0) return false;
  
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 2));
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  
  if (union === 0) return false;
  return (intersection / union) >= threshold;
}

// ============= BRACKET CTA SANITIZER =============
const BRACKET_CTA_ALLOWLIST = new Set([
  'estimate my net proceeds', 'talk with kasandra', 'compare my options',
  'check my readiness', 'compare cash vs. listing', 'find a time with kasandra',
  'i have another question', 'review strategy with kasandra',
  'take the readiness check', 'take readiness check', 'browse guides',
  'find off-market homes', 'explore off-market homes', 'get off-market access',
  'first-time buyer guide', 'new construction vs resale', 'buyer readiness check',
  'explore neighborhoods', 'take the buyer readiness check', 'see buyer guides',
  'estimar mis ganancias netas', 'hablar con kasandra', 'comparar mis opciones',
  'verificar mi preparación', 'comparar efectivo vs. listado',
  'encontrar un horario con kasandra', 'tengo otra pregunta',
  'revisar estrategia con kasandra', 'tomar la evaluación de preparación',
  'tomar evaluación de preparación', 'explorar guías',
  'encontrar casas fuera del mercado', 'obtener acceso fuera del mercado',
  'evaluación de preparación para compradores', 'explorar vecindarios',
]);

const BRACKET_CTA_PATTERNS = /^\s*(book|schedule|call|talk|find a time|speak|connect|reserve|take|browse|explore|get off|tomar|explorar|encontrar|obtener|reservar|agendar|hablar|llamar|programar|conectar)/i;

export function sanitizeBracketCTAs(text: string): string {
  return text
    .replace(/\[([^\]]{5,80})\]/g, (_match, inner: string) => {
      const normalized = inner.toLowerCase().trim();
      if (BRACKET_CTA_ALLOWLIST.has(normalized)) return '';
      if (BRACKET_CTA_PATTERNS.test(normalized)) return '';
      return '';
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ============= IN-MEMORY EDGE CACHE =============
const _dbCache = new Map<string, { data: unknown; expires: number }>();

export function getCached<T>(key: string): T | null {
  const entry = _dbCache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data as T;
  if (entry) _dbCache.delete(key);
  return null;
}

export function setCache(key: string, data: unknown, ttlMs = 3600000): void {
  _dbCache.set(key, { data, expires: Date.now() + ttlMs });
}
