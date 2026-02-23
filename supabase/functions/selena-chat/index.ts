/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SELENA CHAT - AI Concierge Edge Function (Decision Certainty Engine)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * CONTRACT (v2 - UPDATED 2026-02-08):
 * 
 * CANONICAL INTENTS: buy | sell | cash | dual | explore
 * CANONICAL TIMELINES: asap | 30_days | 60_90
 * 
 * INTENT PRIORITY ORDER: cash > dual > sell > buy > explore
 *   - When multiple intents are detected, the highest priority wins as primaryIntent
 * 
 * 4-MODE ARCHITECTURE (Decision Certainty):
 *   MODE 1: ORIENTATION - First contact, reduce anxiety, ONE question only
 *   MODE 2: CLARITY BUILDING - Reference journey, suggest tools/guides
 *   MODE 3: CONFIDENCE & SYNTHESIS - Reflect progress, position Kasandra subtly
 *   MODE 4: HANDOFF - Booking as continuation of clarity (earned access)
 * 
 * EARNED ACCESS GATE:
 *   Booking CTAs (actions array) are ONLY shown when user has "earned" access:
 *   
 *   1. EXPLICIT ASK: User message contains booking keywords (book, schedule, call, etc.)
 *   2. TOOL COMPLETION: context.tool_used OR context.last_tool_result OR context.quiz_completed
 *   3. EMAIL PROVIDED: extractedEmail from message (commitment signal)
 *   4. ENGAGED TURNS: 2+ user turns AND intent is NOT "explore"
 *   
 *   If none of these are true → actions: [] (no CTA shown)
 * 
 * REFLECTION SENTENCE FORMULA (Modes 2 & 3):
 *   "From what you've explored so far — especially [guide/tool/action] — 
 *    it sounds like you're trying to [goal]."
 * 
 * STALL RECOVERY (Mode 3.5):
 *   After 5+ turns without forward motion, offer summary or exit option
 * 
 * POST-BOOKING IDENTITY REINFORCEMENT:
 *   "You've already done the hard part — thinking this through carefully."
 * 
 * CTA LABEL: "Review Strategy with Kasandra" (never "Free Consultation")
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  detectMode, 
  getModeSuggestedReplies, 
  MODE_INSTRUCTIONS_EN, 
  MODE_INSTRUCTIONS_ES,
  type ConversationMode,
  type ConversationState,
} from "./modeContext.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  context: {
    session_id: string;
    route: string;
    language: "en" | "es";
    utm_source?: string;
    utm_campaign?: string;
    utm_medium?: string;
    intent?: string;
    situation?: string;
    last_guide_id?: string;
    last_guide_title?: string;
    lastEvents?: string[];
    lead_id?: string;
    // Mode detection signals
    tool_used?: string;
    last_tool_result?: string;
    quiz_completed?: boolean;
    guides_read?: number;
    // Entry context
    entry_source?: string;
    calculator_advantage?: string;
    calculator_difference?: number;
    // Mode persistence — client sends back the server's last reported mode
    current_mode?: 1 | 2 | 3 | 4;
    timeline?: string;
    // Phase governance fields (monotonic)
    chip_phase_floor?: number;
    greeting_phase_seen?: number;
    timeline_last_asked_turn?: number;
    turn_count?: number;
  };
  history?: ChatMessage[];
}

// ============= CANONICAL VALUES =============
// Canonical intent values: buy | sell | cash | dual | explore
// Canonical timeline values: asap | 30_days | 60_90

/**
 * Priority order for intent routing: cash > dual > sell > buy > explore
 * Ensures deterministic primary intent selection
 */
const INTENT_PRIORITY: Record<string, number> = {
  cash: 1,
  dual: 2,
  sell: 3,
  buy: 4,
  explore: 5,
};

type CanonicalIntent = "buy" | "sell" | "cash" | "dual" | "explore";

/**
 * Picks the highest-priority intent from detected intents
 */
function pickPrimaryIntent(intents: string[]): CanonicalIntent {
  const sorted = [...new Set(intents)].sort(
    (a, b) => (INTENT_PRIORITY[a] ?? 99) - (INTENT_PRIORITY[b] ?? 99)
  );
  return (sorted[0] as CanonicalIntent) || "explore";
}

/**
 * Normalizes detected intent to canonical values
 * Returns null for invalid/unknown values
 */
function normalizeIntent(raw: string): CanonicalIntent | null {
  if (!raw) return null;
  const v = raw.toLowerCase().trim();
  if (v === "cash_offer") return "cash";
  if (v === "exploring") return "explore";
  if (v === "ready") return null; // 'ready' is urgency/timeline, not intent
  if (v === "buy" || v === "sell" || v === "cash" || v === "dual" || v === "explore") return v;
  return null;
}

// ============= PROTOCOL HELPERS =============

/**
 * Ensures tags are unique and formatted correctly per protocol
 */
function applyTags(existingTags: string[] = [], newTags: string[] = []): string[] {
  const combined = [...existingTags, ...newTags];
  return [...new Set(combined.filter((t) => !!t))];
}

/**
 * Detects timeline/urgency from message
 * Returns canonical timeline values only: asap | 30_days | 60_90 | null
 * NOTE: "exploring" is NOT a valid timeline - return null for exploratory language
 */
function detectTimeline(message: string): "asap" | "30_days" | "60_90" | null {
  const lower = message.toLowerCase();
  if (/\b(asap|now|today|pronto|ahora|hoy|inmediata|urgent)\b/.test(lower)) return "asap";
  if (/\b(month|30\s*days|mes|30\s*dias)\b/.test(lower)) return "30_days";
  // Word boundaries to avoid matching "60" in prices/zip codes like "$600,000" or "85760"
  if (/\b(60|90)\b|\b(3|6)\s*months?\b|\b1[-_]?3\s*months?\b/.test(lower)) return "60_90";
  // Exploratory language = no timeline commitment, return null
  return null;
}

// ============= EMAIL DETECTION =============
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

function extractEmail(message: string): string | null {
  const matches = message.match(EMAIL_REGEX);
  return matches ? matches[0].toLowerCase() : null;
}

// ============= ANALYTICS LOGGING =============
async function logDataCapture(sessionId: string, eventType: string, payload: Record<string, unknown>) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) return;

  try {
    await fetch(`${supabaseUrl}/functions/v1/selena-log-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseKey}` },
      body: JSON.stringify({ sessionId, eventType, payload }),
    });
  } catch (e) {
    console.error("Log capture failed", e);
  }
}

// ============= LEAD UPSERT & PROGRESSIVE PROFILING =============
async function upsertLeadProfile(
  email: string,
  context: ChatRequest["context"],
  detectedIntent?: string,
  detectedTimeline?: string,
): Promise<{ success: boolean; lead_id?: string; is_new?: boolean; error?: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) return { success: false, error: "Config error" };
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: existingLead } = await supabase.from("lead_profiles").select("*").eq("email", email).maybeSingle();

    const protocolTags = [];
    if (!existingLead) protocolTags.push("selena_chat_started");
    if (context.language) protocolTags.push(`language_${context.language}`);
    if (detectedIntent) protocolTags.push(`intent_${detectedIntent}`);
    if (detectedTimeline) protocolTags.push(`timeline_${detectedTimeline}`);

    if (existingLead) {
      const updateData: Record<string, unknown> = {
        session_id: context.session_id,
        utm_source: context.utm_source,
        utm_campaign: context.utm_campaign,
        tags: applyTags((existingLead.tags as string[]) || [], protocolTags),
      };

      // WRITE-ONCE RULE: Only update intent/timeline if currently NULL
      if (!existingLead.intent && detectedIntent) updateData.intent = detectedIntent;
      if (!existingLead.timeline && detectedTimeline) updateData.timeline = detectedTimeline;
      if (!existingLead.language) updateData.language = context.language;

      await supabase.from("lead_profiles").update(updateData).eq("id", existingLead.id);
      return { success: true, lead_id: existingLead.id, is_new: false };
    } else {
      const { data: newLead, error: insErr } = await supabase
        .from("lead_profiles")
        .insert({
          email,
          language: context.language || "en",
          source: "selena_chat",
          session_id: context.session_id,
          intent: detectedIntent || null,
          timeline: detectedTimeline || null,
          tags: protocolTags,
        })
        .select("id")
        .single();

      if (insErr) throw insErr;
      return { success: true, lead_id: newLead.id, is_new: true };
    }
  } catch (error) {
    console.error("Upsert failed", error);
    return { success: false, error: "Internal error" };
  }
}

// ============= INTENT DETECTION =============
function detectIntent(message: string, route: string): string[] {
  const lower = message.toLowerCase();
  const intents: string[] = [];
  
  // Check for dual intent (buy + sell combination) - but don't suppress other intents
  if (/buy.*sell|sell.*buy|comprar.*vender|vender.*comprar|buy\s*first|sell\s*first/.test(lower)) {
    intents.push("dual");
  }
  
  // Always detect cash (even with dual - "sell and buy quickly" + inherited = dual + cash)
  if (/cash|efectivo|quick sale|herencia|inherited/.test(lower)) {
    intents.push("cash");
  }
  
  // Single intent detection (only if no dual detected)
  if (!intents.includes("dual")) {
    if (/buy|comprar|purchase|busco casa|looking for a home/.test(lower)) intents.push("buy");
    if (/sell|vender|selling|list|listar/.test(lower)) intents.push("sell");
    if (/exploring|curious|thinking|quizás|no sé|just looking/.test(lower)) intents.push("explore");
    if (route.includes("cash-offer") || route.includes("seller")) intents.push("sell");
  }
  
  // Normalize and dedupe, filter out nulls
  const normalized = intents.map(normalizeIntent).filter((i): i is string => i !== null);
  
  // Priority order for primaryIntent: cash > dual > sell > buy > explore
  // This ensures Router decisions are consistent
  return normalized.length > 0 ? [...new Set(normalized)] : ["explore"];
}

// ============= SIMILARITY MATCHING =============
function isSimilar(str1: string, str2: string, threshold = 0.8): boolean {
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

// ============= CHIP GOVERNANCE + SESSION STATE =============

/**
 * Inferred session state from conversation history.
 * Tracks engagement flags without requiring explicit frontend context.
 */
interface SessionEngagementState {
  hasAskedProceeds: boolean;     // User asked about net/walk-away/proceeds
  hasAskedValue: boolean;        // User asked about home value
  hasComparedOptions: number;    // How many times user asked to compare options
  hasReadSellerGuide: boolean;   // User has opened/read a seller guide
  hasUsedCalculator: boolean;    // User has used any calculator tool
  chipHistory: string[];         // Last 5 user messages normalized (for loop detection)
}

// Proceeds-intent signals: any of these trigger the net proceeds override
const PROCEEDS_PATTERNS = /walk away|net|after fees|what would i get|what do i keep|what.*pocket|proceeds|ganancias|lo que me queda|despues de.*costos|cuánto.*recibir/i;

// Seller guide indicators
const SELLER_GUIDE_PATTERNS = /view seller guide|read.*guide|seller guide|guía del vendedor|ver.*guía/i;

// Compare options indicators
const COMPARE_PATTERNS = /compare|cash vs|efectivo vs|comparison|comparar|my options|mis opciones/i;

// Value inquiry indicators
const VALUE_PATTERNS = /home worth|what.*worth|value|valuation|cuánto vale|valor.*casa/i;

// Calculator usage
const CALCULATOR_PATTERNS = /calculator|net proceeds|estimate.*net|cash offer|calculadora|calcular/i;

/**
 * Infers session engagement state from conversation history
 */
function inferSessionState(
  history: ChatMessage[],
  context: ChatRequest["context"],
  currentMessage: string
): SessionEngagementState {
  const allMessages = [
    ...history.map(m => m.content),
    currentMessage
  ];
  const userMessages = history
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .concat(currentMessage);

  const combined = allMessages.join(' ');
  const userCombined = userMessages.join(' ');

  return {
    hasAskedProceeds: PROCEEDS_PATTERNS.test(userCombined),
    hasAskedValue: VALUE_PATTERNS.test(userCombined),
    hasComparedOptions: (userCombined.match(new RegExp(COMPARE_PATTERNS.source, 'gi')) || []).length,
    hasReadSellerGuide: SELLER_GUIDE_PATTERNS.test(combined) || !!context.last_guide_id,
    hasUsedCalculator: CALCULATOR_PATTERNS.test(combined) || !!context.tool_used,
    chipHistory: userMessages.slice(-5).map(m => m.toLowerCase().trim()),
  };
}

/**
 * Detects if the user is looping (clicked effectively the same chip 2+ times)
 */
function detectLoop(chipHistory: string[]): boolean {
  if (chipHistory.length < 3) return false;
  const recent = chipHistory.slice(-4);
  // Check if any single concept appears 2+ times in last 4 turns
  const loopPatterns = [
    /compare|comparar|cash vs|efectivo vs/i,
    /guide|guía|seller guide/i,
    /worth|value|valor|cuánto/i,
    /options|opciones/i,
  ];
  return loopPatterns.some(pattern => {
    const matches = recent.filter(m => pattern.test(m));
    return matches.length >= 2;
  });
}

/**
 * Determines the conversation phase and returns the correct chip set
 * 
 * PHASE 1: Intent unknown → 3 chips (buy / sell / explore)
 * PHASE 2: Intent known, no proceeds request → MAX 2 chips (value + compare)
 * PHASE 3: Proceeds OR compare×2 OR ASAP → NET PROCEEDS path (MAX 2)
 * LOOP:    Repeated same chip → escalate to Phase 3 chips
 */
function getGovernedChips(
  intent: string | undefined,
  timeline: string | null,
  engagement: SessionEngagementState,
  language: 'en' | 'es',
): { chips: string[]; phase: 1 | 2 | 3; escalated: boolean } {
  const hasIntent = !!intent && intent !== 'explore';
  const isAsap = timeline === 'asap';
  const isLooping = detectLoop(engagement.chipHistory);

  // PHASE 3 triggers: proceeds asked, compared 2+ times, ASAP timeline, or looping
  const enterPhase3 =
    engagement.hasAskedProceeds ||
    engagement.hasComparedOptions >= 2 ||
    isAsap ||
    (isLooping && hasIntent);

  if (enterPhase3) {
    const chips = language === 'es'
      ? ["Estimar mis ganancias netas", "Hablar con Kasandra"]
      : ["Estimate my net proceeds", "Talk with Kasandra"];
    return { chips, phase: 3, escalated: isLooping || engagement.hasComparedOptions >= 2 };
  }

  // PHASE 2: Intent known — MAX 2 chips, no guides unless first time
  if (hasIntent) {
    if (intent === 'sell' || intent === 'cash') {
      // If user already asked value → offer compare next
      if (engagement.hasAskedValue) {
        const chips = language === 'es'
          ? ["Comparar efectivo vs. listado", "Estimar mis ganancias netas"]
          : ["Compare cash vs. listing", "Estimate my net proceeds"];
        return { chips, phase: 2, escalated: false };
      }
      // Default seller Phase 2
      const chips = language === 'es'
        ? ["¿Cuánto vale mi casa?", "Comparar efectivo vs. listado"]
        : ["What's my home worth?", "Compare cash vs. listing"];
      return { chips, phase: 2, escalated: false };
    }
    if (intent === 'buy') {
      const chips = language === 'es'
        ? ["Tomar la evaluación de preparación", "Explorar guías del comprador"]
        : ["Take the readiness check", "Browse buyer guides"];
      return { chips, phase: 2, escalated: false };
    }
  }

  // PHASE 1: Intent unknown
  const chips = language === 'es'
    ? ["Estoy pensando en vender", "Estoy buscando comprar", "Solo estoy explorando"]
    : ["I'm thinking about selling", "I'm looking to buy", "Just exploring"];
  return { chips, phase: 1, escalated: false };
}

// ============= BOOKING GATE PATTERNS =============
// Keywords: explicit booking actions
const BOOKING_KEYWORDS = /book|schedule|call|talk|meet|appointment|consulta|cita|llamar|hablar|agendar/i;

// Phrases: implicit booking suggestions (stricter filter for earned access)
// NOTE: "kasandra" removed to avoid over-filtering educational mentions of the agent
const BOOKING_PHRASES = /(talk to kasandra|priority call|strategy call|consultation|consult|review strategy|revisar estrategia|verify.*kasandra|verificar.*kasandra)/i;

/**
 * Checks if user explicitly asked to book/call
 */
function userAskedToBook(message: string): boolean {
  return BOOKING_KEYWORDS.test(message);
}

/**
 * Count user turns only (not total messages)
 */
function userTurnCount(history: Array<{ role: string }>): number {
  return history.filter(m => m.role === 'user').length;
}

/**
 * Determines if the user has earned access to booking CTA
 * Based on: explicit ask, tool completion, email provided, or 2+ engaged user turns
 * 
 * NOTE: "2 user turns" only unlocks if intent is NOT explore (keeps explorers in education mode)
 */
function hasEarnedBookingAccess(
  context: ChatRequest["context"], 
  history: Array<{ role: string }>,
  message: string,
  extractedEmail?: string | null
): boolean {
  // 1. User explicitly asked to book/call → immediate unlock
  if (userAskedToBook(message)) return true;
  
  // 2. Tool completion flags (stable fields from SessionContext)
  if (context.tool_used) return true;
  if (context.last_tool_result) return true;
  if (context.quiz_completed) return true;
  
  // 3. Email provided = commitment signal (soft gate)
  if (extractedEmail) return true;
  
  // 4. REMOVED: Turn-count gate removed per governance review.
  // Simple turn count is insufficient per earned access rules.
  // Only explicit booking keywords, tool completion, or email unlock booking.
  
  return false;
}

/**
 * Filters suggestions to remove booking-related language if not earned
 * Uses both explicit keywords AND implicit booking phrases for stricter gating
 */
function filterSuggestionsForEarnedAccess(suggestions: string[], hasEarned: boolean): string[] {
  if (hasEarned) return suggestions;
  
  // Strip any suggestion containing booking keywords OR booking phrases
  return suggestions.filter(s => 
    !BOOKING_KEYWORDS.test(s) && !BOOKING_PHRASES.test(s)
  );
}

// ============= PROGRESSION MAP =============
// Maps user selection to next-best-step suggestions
// Now cleaned of premature booking language for early stages
const PROGRESSION_MAP: Record<string, { en: string[]; es: string[] }> = {
    // Buyer path progressions
    'take readiness check': {
      en: ["How long does it take?", "Start now", "What does this check?"],
      es: ["¿Cuánto tiempo toma?", "Comenzar ahora", "¿Qué verifica este análisis?"]
    },
    'view first-time buyer guide': {
      en: ["What should I prepare?", "Ask about financing", "Check my readiness"],
      es: ["¿Qué debo preparar?", "Preguntar sobre financiamiento", "Verificar mi preparación"]
    },
    // Seller path progressions
    "what's my home worth": {
      en: ["Get a detailed estimate", "Compare cash vs. listing", "What factors affect value?"],
      es: ["Obtener estimación detallada", "Comparar efectivo vs. listado", "¿Qué factores afectan el valor?"]
    },
    'compare cash vs. traditional': {
      en: ["Request my net sheet", "See cash timeline", "What are the trade-offs?"],
      es: ["Solicitar mi análisis", "Ver línea de tiempo en efectivo", "¿Cuáles son las ventajas?"]
    },
    'request a net sheet': {
      en: ["Review my estimate", "What costs are included?", "Ask a question"],
      es: ["Revisar mi estimación", "¿Qué costos están incluidos?", "Hacer una pregunta"]
    },
    'request a cash offer': {
      en: ["How fast can I close?", "What's the process?", "Any hidden fees?"],
      es: ["¿Qué tan rápido puedo cerrar?", "¿Cuál es el proceso?", "¿Hay costos ocultos?"]
    },
    // First intent declarations — seller now uses timeline prequalification bubbles
    "i'm thinking about selling": {
      en: ["ASAP (0–30 days)", "1–3 months", "3–6 months", "Just exploring"],
      es: ["Lo antes posible (0–30 días)", "1–3 meses", "3–6 meses", "Solo explorando"]
    },
    "estoy pensando en vender": {
      en: ["ASAP (0–30 days)", "1–3 months", "3–6 months", "Just exploring"],
      es: ["Lo antes posible (0–30 días)", "1–3 meses", "3–6 meses", "Solo explorando"]
    },
  "i'm looking to buy": {
    en: ["Take readiness check", "View first-time buyer guide", "What should I prepare?"],
    es: ["Tomar evaluación de preparación", "Ver guía para compradores", "¿Qué debo preparar?"]
  },
  'just exploring': {
    en: ["Tell me about selling", "Tell me about buying", "What are my options?"],
    es: ["Cuéntame sobre vender", "Cuéntame sobre comprar", "¿Cuáles son mis opciones?"]
  }
};

// ============= INTENT-AWARE SUGGESTION FILTERING =============
type IntentKey = 'sell' | 'cash' | 'buy' | 'explore';

function getSuggestedReplies(
  intent: string | undefined, 
  language: 'en' | 'es',
  lastUserMessage?: string
): string[] {
  // Step 1: Check progression map for specific next steps
  if (lastUserMessage) {
    const normalized = lastUserMessage.toLowerCase().trim();
    
    for (const [trigger, responses] of Object.entries(PROGRESSION_MAP)) {
      if (isSimilar(normalized, trigger, 0.6) || normalized.includes(trigger)) {
        return responses[language];
      }
    }
  }
  
  // Step 2: Fall back to intent-based static replies
  const staticReplies: Record<IntentKey, { en: string[]; es: string[] }> = {
    sell: {
      en: ["What's my home worth?", "Compare cash vs. traditional", "Request a net sheet"],
      es: ["¿Cuánto vale mi casa?", "Comparar efectivo vs. tradicional", "Solicitar análisis de ganancias"]
    },
    cash: {
      en: ["What's my home worth?", "How fast can I close?", "Request a cash offer"],
      es: ["¿Cuánto vale mi casa?", "¿Qué tan rápido puedo cerrar?", "Solicitar oferta en efectivo"]
    },
    buy: {
      en: ["Take readiness check", "View first-time buyer guide", "What should I prepare?"],
      es: ["Tomar evaluación de preparación", "Ver guía para compradores", "¿Qué debo preparar?"]
    },
    explore: {
      en: ["I'm thinking about selling", "I'm looking to buy", "What are my options?"],
      es: ["Estoy pensando en vender", "Estoy buscando comprar", "¿Cuáles son mis opciones?"]
    }
  };
  
  // Normalize intent to canonical key
  const intentKey: IntentKey = intent === 'cash' ? 'cash'
                             : intent === 'sell' ? 'sell'
                             : intent === 'buy' ? 'buy'
                             : 'explore';
  
  let suggestions = [...staticReplies[intentKey][language]];
  
  // Step 3: Filter out any suggestion similar to user's last message
  if (lastUserMessage) {
    suggestions = suggestions.filter(s => !isSimilar(s, lastUserMessage, 0.7));
  }
  
  return suggestions;
}

// ============= SYSTEM PROMPTS (HARDENED + MODE CONTEXT) =============
const SYSTEM_PROMPT_EN = `You are Selena, Kasandra Prieto's digital real estate concierge. 
Kasandra is a high-touch solo practitioner in Tucson. 

VOICE RULES:
- NEVER say "our team", "we", or "someone from the office".
- ALWAYS say "Kasandra will personally reach out" or "Kasandra will guide you personally".
- Keep responses to 2-3 sentences.
- Be calm, professional, and supportive. No pressure. 
- Mirror the user's language.
- NO exclamation points. NO emojis. No over-enthusiasm.
- Never compare Kasandra to other agents — she is the only option.
- NEVER include bracket-wrapped CTAs like [Action Label] in your response text. Actionable buttons are handled separately by the system. Your text should describe direction, not render buttons.

LANGUAGE RULE: Always respond in the same language the user writes in. Generate natively — never translate.

CONCIERGE PHILOSOPHY:
- Educate before qualifying. Offer value (guides, calculators, insights) before asking for personal details.
- Never push booking. Let the user signal readiness.
- If the user seems interested in selling, suggest exploring their options (calculator, guides) before asking for property address.
- One question at a time. Never overwhelm.

KASANDRA FRAMING (Calm Authority):
- "Kasandra personally handles every client — no handoffs."
- "Kasandra personally reviews each situation before speaking with a client."
- "She'll review your situation before your call."

GEOGRAPHIC AWARENESS (orientation only — never rank, compare, or recommend):
- Tucson: Central hub, historic downtown, Catalina Foothills, Sam Hughes, Grant area
- Marana: Northwest of Tucson, newer planned developments, family-oriented
- Sahuarita: South of Tucson (~30 min), mountain views, residential growth
- Vail: Southeast of Tucson, newer communities, ongoing development
- Green Valley: Retirement-oriented, long-established residential patterns

COMMUNITY CONTEXT:
- Kasandra is deeply rooted in Tucson ("Somos de aqui") — not an outside or speculative practitioner.
- Active in local philanthropy: Arizona Diaper Bank, Rumbo al Exito.
- Brand identity: "Your Best Friend in Real Estate."

LOCATION ADVISORY BOUNDARY (strict):
You must NEVER provide rankings, opinions, investment guidance, "best neighborhood" recommendations, safety comparisons, school district evaluations, or market speculation.
If a user asks for evaluative or advisory location guidance, respond with:
"I can share general location context, but for specific advice about safety, schools, or investment considerations, I defer to Kasandra Prieto so you receive accurate, professional guidance."
No follow-up analysis or speculation after this deferral.

PROCESS EDUCATION — SELLER (general orientation only, never advisory):
Selling typically flows through these stages:
1. Initial Conversation & Goal Clarity — understanding priorities (speed, convenience, exposure). No decisions required.
2. Property Review & Path Selection — gathering property details, choosing a general direction (speed-focused or market-exposure).
3. Preparation or Direct Path — if market-exposure: cleaning, repairs, staging. If direct: no public marketing.
4. Offer Review & Agreement — evaluating interest, reviewing written terms.
5. Contract-to-Close — inspections, title work, documentation. Length depends on complexity.
6. Closing & Transition — formal transfer of ownership.

PROCESS EDUCATION — BUYER (general orientation only, never advisory):
Buying typically flows through these stages:
1. Goal Definition & Readiness — clarifying criteria and budget awareness.
2. Inventory Exploration — reviewing resale, new construction, and pre-market options; touring properties.
3. Offer Expression — formally expressing interest. All negotiations handled by licensed professionals.
4. Contract-to-Close — inspections, appraisals, financing coordination.
5. Move-In Transition — walkthrough and key transfer.

TYPICAL TIMELINES (non-binding, educational only):
- Direct/Cash: Often several weeks to about a month (title processing, document coordination).
- Financed/Market: Often several months from listing to closing; varies significantly.
- Variability factors: financing vs. non-financing, inspection findings, appraisal requirements, title coordination, personal readiness.

PROCESS EDUCATION BOUNDARY (strict):
This process knowledge is for general educational orientation ONLY.
You must NEVER use it to provide strategy, pricing, valuation, guarantees, or advice.
You must ALWAYS pair process explanations with deferral language.
All specific recommendations, negotiations, timelines, and professional decisions must be deferred to Kasandra Prieto.
Standard deferral: "Every situation is different — Kasandra can walk you through what applies to yours."
This knowledge base does NOT override Distress & Human Escalation rules or Location Advisory boundaries.

${MODE_INSTRUCTIONS_EN}

When a user provides their email or exhibits high intent, reassure them that Kasandra herself will review their details.`;

const SYSTEM_PROMPT_ES = `Eres Selena, la concierge digital de bienes raíces de Kasandra Prieto. 
Kasandra es una profesional independiente de alto nivel en Tucson.

REGLAS DE VOZ:
- Usa SIEMPRE "tú" (cercano, relacional). Refleja la voz de "Tu Mejor Amiga en Bienes Raíces".
- NUNCA digas "nuestro equipo", "nosotros" o "alguien de la oficina".
- DI SIEMPRE "Kasandra se comunicará personalmente contigo" o "Kasandra te guiará personalmente".
- Mantén las respuestas a 2-3 oraciones.
- Sé profesional, calmada y brinda apoyo sin presión.
- SIN signos de exclamación. SIN emojis. Sin exceso de entusiasmo.
- Nunca compares a Kasandra con otros agentes — ella es la única opción.
- NUNCA incluyas CTAs entre corchetes como [Etiqueta de Acción] en el texto de tu respuesta. Los botones de acción se manejan por separado por el sistema.

REGLA DE IDIOMA: Responde siempre en el mismo idioma en que escribe el usuario. Genera de forma nativa — nunca traduzcas.

FILOSOFÍA DE CONCIERGE:
- Educar antes de calificar. Ofrece valor (guías, calculadoras, información) antes de solicitar datos personales.
- Nunca presiones para agendar. Deja que el usuario señale su disposición.
- Si el usuario parece interesado en vender, sugiere explorar sus opciones antes de pedir la dirección de la propiedad.
- Una pregunta a la vez. Nunca abrumes.

ENCUADRE DE KASANDRA (Autoridad Tranquila):
- "Kasandra maneja personalmente cada cliente — sin transferencias."
- "Kasandra revisa personalmente cada situación antes de hablar contigo."
- "Ella revisará tu situación antes de tu llamada."

CONCIENCIA GEOGRÁFICA (solo orientación — nunca clasificar, comparar o recomendar):
- Tucson: Centro principal, centro histórico, Catalina Foothills, Sam Hughes, área de Grant
- Marana: Noroeste de Tucson, desarrollos planificados, orientado a familias
- Sahuarita: Sur de Tucson (~30 min), vistas a las montañas, crecimiento residencial
- Vail: Sureste de Tucson, comunidades nuevas, desarrollo en curso
- Green Valley: Orientado a jubilados, patrones residenciales establecidos

CONTEXTO COMUNITARIO:
- Kasandra tiene raíces profundas en Tucson ("Somos de aquí") — no es una agente externa ni especulativa.
- Activa en filantropía local: Arizona Diaper Bank, Rumbo al Éxito.
- Identidad de marca: "Tu Mejor Amiga en Bienes Raíces."

LÍMITE DE ASESORÍA DE UBICACIÓN (estricto):
NUNCA proporciones clasificaciones, opiniones, orientación de inversión, recomendaciones de "mejor vecindario", comparaciones de seguridad, evaluaciones de distritos escolares ni especulación de mercado.
Si un usuario solicita orientación evaluativa sobre ubicación, responde con:
"Puedo compartir contexto general sobre la zona, pero para orientación específica sobre seguridad, escuelas o consideraciones de inversión, te refiero a Kasandra Prieto para que recibas orientación profesional y precisa."
Sin análisis ni especulación después de esta referencia.

EDUCACION DE PROCESO — VENDEDOR (solo orientacion general, nunca asesoramiento):
La venta generalmente sigue estas etapas:
1. Conversacion Inicial y Claridad de Objetivos — entender prioridades (rapidez, conveniencia, exposicion). Sin decisiones requeridas.
2. Revision de Propiedad y Seleccion de Camino — recopilar detalles, elegir una direccion general.
3. Preparacion o Camino Directo — si exposicion al mercado: limpieza, reparaciones. Si directo: sin marketing publico.
4. Revision de Ofertas y Acuerdo — evaluar interes, revisar terminos escritos.
5. Contrato a Cierre — inspecciones, trabajo de titulo, documentacion.
6. Cierre y Transicion — transferencia formal de propiedad.

EDUCACION DE PROCESO — COMPRADOR (solo orientacion general, nunca asesoramiento):
La compra generalmente sigue estas etapas:
1. Definicion de Objetivos y Preparacion — clarificar criterios y conciencia de presupuesto.
2. Exploracion de Inventario — revisar opciones de reventa, nueva construccion y pre-mercado; recorrer propiedades.
3. Expresion de Oferta — expresar interes formalmente. Todas las negociaciones las manejan profesionales licenciados.
4. Contrato a Cierre — inspecciones, avaluos, coordinacion de financiamiento.
5. Transicion de Mudanza — recorrido final y entrega de llaves.

PLAZOS TIPICOS (no vinculantes, solo educativos):
- Directo/Efectivo: Generalmente varias semanas a un mes (procesamiento de titulo, coordinacion de documentos).
- Financiado/Mercado: Generalmente varios meses desde listado hasta cierre; varia significativamente.
- Factores de variabilidad: financiamiento vs. no financiamiento, hallazgos de inspeccion, requisitos de avaluo, coordinacion de titulo, preparacion personal.

LIMITE DE EDUCACION DE PROCESO (estricto):
Este conocimiento de proceso es SOLO para orientacion educativa general.
NUNCA lo uses para dar estrategia, precios, valuaciones, garantias o consejos.
SIEMPRE acompana las explicaciones de proceso con lenguaje de deferencia.
Todas las recomendaciones especificas, negociaciones, plazos y decisiones profesionales se refieren a Kasandra Prieto.
Deferencia estandar: "Cada situacion es diferente — Kasandra puede guiarte en lo que aplica a la tuya."
Este conocimiento NO anula las reglas de Escalacion Humana ni los limites de Asesoria de Ubicacion.

${MODE_INSTRUCTIONS_ES}

Cuando el cliente proporcione su correo o muestre gran interés, asegúrale que la misma Kasandra revisará sus detalles.`;

// ============= MODE DETECTION HELPER =============
function buildConversationState(
  context: ChatRequest["context"],
  history: ChatMessage[],
  message: string,
  extractedEmail: string | null,
  primaryIntent: CanonicalIntent
): ConversationState {
  const userTurns = history.filter(m => m.role === 'user').length;
  
  // Scan history for previously-provided email — so mode 4 persists across turns
  const emailInHistory = history
    .filter(m => m.role === 'user')
    .some(m => EMAIL_REGEX.test(m.content));
  // Reset regex lastIndex since it's global
  EMAIL_REGEX.lastIndex = 0;

  return {
    userTurns,
    hasIntent: !!primaryIntent && primaryIntent !== 'explore',
    intent: primaryIntent,
    guidesRead: context.guides_read ?? 0,
    toolUsed: !!context.tool_used,
    quizCompleted: !!context.quiz_completed,
    hasToolResult: !!context.last_tool_result,
    hasEmail: !!extractedEmail || emailInHistory,
    explicitBookingAsk: userAskedToBook(message),
  };
}

// ============= STALL DETECTION =============
const STALL_PATTERNS = /just curious|solo curiosidad|just looking|solo mirando|i don't know|no sé|not sure|no estoy segur/i;

function isStalled(history: ChatMessage[], message: string): boolean {
  const userMessages = history.filter(m => m.role === 'user');
  if (userMessages.length < 5) return false;
  
  // Check if recent messages are low-intent
  const recentMessages = userMessages.slice(-3);
  const stallCount = recentMessages.filter(m => STALL_PATTERNS.test(m.content)).length;
  
  return stallCount >= 2 || STALL_PATTERNS.test(message);
}

// ============= BRACKET CTA SANITIZER (ALLOWLIST-BASED) =============
// Safety net: strips bracket-wrapped CTAs that match exact known chip labels.
// Prevention is in the prompt; this catches any AI leakage.
const BRACKET_CTA_ALLOWLIST = new Set([
  // EN labels
  'estimate my net proceeds',
  'talk with kasandra',
  'compare my options',
  'check my readiness',
  'compare cash vs. listing',
  'find a time with kasandra',
  'keep chatting with selena',
  'review strategy with kasandra',
  // ES labels
  'estimar mis ganancias netas',
  'hablar con kasandra',
  'comparar mis opciones',
  'verificar mi preparación',
  'comparar efectivo vs. listado',
  'encontrar un horario con kasandra',
  'seguir conversando con selena',
  'revisar estrategia con kasandra',
]);

function sanitizeBracketCTAs(text: string): string {
  return text
    .replace(/\[([^\]]{5,80})\]/g, (_match, inner: string) => {
      const normalized = inner.toLowerCase().trim();
      if (BRACKET_CTA_ALLOWLIST.has(normalized)) return '';
      return _match; // preserve non-CTA brackets (e.g., "[optional]")
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ============= MAIN HANDLER =============
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, context, history = [] }: ChatRequest = await req.json();
    const language = context.language || "en";
    let leadId = context.lead_id;

    const detectedIntents = detectIntent(message, context.route);
    const timeline = detectTimeline(message);

    // Primary intent (canonical) - uses priority order: cash > dual > sell > buy > explore
    const primaryIntent = pickPrimaryIntent(detectedIntents);

    // Determine effective intent (detected now OR previously stored)
    const effectiveIntent = primaryIntent !== 'explore' ? primaryIntent : (context.intent || 'explore');

    // Identity Upgrade & Persistence (only on email capture)
    const extractedEmail = extractEmail(message);
    if (extractedEmail) {
      const upsert = await upsertLeadProfile(extractedEmail, context, primaryIntent, timeline || undefined);
      if (upsert.success) {
        leadId = upsert.lead_id;
        await logDataCapture(context.session_id, "selena_data_email_captured", { lead_id: leadId });
      }
    }

    // ============= CHIP GOVERNANCE: INFER SESSION STATE =============
    const engagement = inferSessionState(history, context, message);
    
    // PROCEEDS OVERRIDE: immediate — supersedes all phase logic
    const proceedsOverride = engagement.hasAskedProceeds || PROCEEDS_PATTERNS.test(message);
    
    // ASAP OVERRIDE: immediate — reduce education, route to action
    const asapTimeline = timeline === 'asap' || context.intent === 'asap';

    // Build conversation state for mode detection
    const conversationState = buildConversationState(context, history, message, extractedEmail, primaryIntent);
    const detectedModeContext = detectMode(conversationState);

    // UNIVERSAL MONOTONIC MODE FLOOR: Mode must never decrease within a session.
    const clientMode = (context.current_mode ?? 0) as number;
    const detectedMode = detectedModeContext.mode;
    const effectiveMode = Math.max(clientMode, detectedMode) as ConversationMode;
    
    // Select the correct modeContext for the effective mode
    const modeContext = effectiveMode !== detectedMode
      ? (() => {
          // Re-derive context for the floored mode
          if (effectiveMode === 4) return { mode: 4 as ConversationMode, modeName: 'HANDOFF', allowBookingCTA: true, reflectionRequired: false };
          if (effectiveMode === 3) return { mode: 3 as ConversationMode, modeName: 'CONFIDENCE', allowBookingCTA: false, reflectionRequired: true };
          if (effectiveMode === 2) return { mode: 2 as ConversationMode, modeName: 'CLARITY', allowBookingCTA: false, reflectionRequired: true };
          return detectedModeContext;
        })()
      : detectedModeContext;
    const currentMode: ConversationMode = modeContext.mode;
    
    // Log mode transition for analytics (fire-and-forget — FM-11)
    logDataCapture(context.session_id, "selena_mode_transition", { 
      mode: currentMode, 
      mode_name: modeContext.modeName,
      user_turns: conversationState.userTurns,
      chip_phase: getGovernedChips(effectiveIntent, timeline, engagement, language).phase,
      chip_escalated: getGovernedChips(effectiveIntent, timeline, engagement, language).escalated ?? false,
    }).catch(() => {});

    // Check for stall condition (Mode 3.5 behavior)
    const stalled = isStalled(history, message);

    // Build system prompt with mode context
    const systemPrompt = language === "es" ? SYSTEM_PROMPT_ES : SYSTEM_PROMPT_EN;
    
    // Add reflection context for Modes 2 & 3
    let reflectionHint = "";
    if (modeContext.reflectionRequired) {
      const guideTitle = context.last_guide_title;
      const toolUsed = context.tool_used;
      const guidesRead = context.guides_read || 0;
      
      if (language === "es") {
        if (guideTitle) {
          reflectionHint = `\n\nCONTEXTO: El usuario ha leído la guía "${guideTitle}". Usa la Fórmula de Reflexión.`;
        } else if (toolUsed) {
          reflectionHint = `\n\nCONTEXTO: El usuario ha usado ${toolUsed}. Reconoce este progreso.`;
        } else if (guidesRead >= 2) {
          reflectionHint = `\n\nCONTEXTO: El usuario ha leído ${guidesRead} guías. Refleja su progreso.`;
        }
      } else {
        if (guideTitle) {
          reflectionHint = `\n\nCONTEXT: User has read the guide "${guideTitle}". Use the Reflection Sentence Formula.`;
        } else if (toolUsed) {
          reflectionHint = `\n\nCONTEXT: User has used the ${toolUsed}. Acknowledge this progress.`;
        } else if (guidesRead >= 2) {
          reflectionHint = `\n\nCONTEXT: User has read ${guidesRead} guides. Reflect their progress.`;
        }
      }
    }
    
    // ============= CHIP GOVERNANCE: AI PROMPT INJECTION =============
    // Tell the AI what phase we're in so response text matches chip direction
    const rawGoverned = getGovernedChips(effectiveIntent, timeline, engagement, language);
    
    // ============= CHIP PHASE FLOOR ENFORCEMENT (monotonic) =============
    const clientChipFloor = context.chip_phase_floor ?? 0;
    const effectiveChipPhase = Math.max(clientChipFloor, rawGoverned.phase) as 1 | 2 | 3;
    
    // Re-derive chips if floor pushed us past what getGovernedChips returned
    let chips: string[];
    let phase: 1 | 2 | 3;
    let escalated: boolean;
    
    if (effectiveChipPhase > rawGoverned.phase) {
      // Floor is higher — re-derive chips for the effective phase
      // Phase-biased: allow pulling down by 1 band for Phase-2 intents, never to Phase 1
      const PHASE2_PATTERNS = /worth|value|valor|cuánto vale|preparation|prepare|preparar|how does.*work|cómo funciona|process|proceso/i;
      const isPhase2Question = PHASE2_PATTERNS.test(message);
      
      if (effectiveChipPhase >= 3 && isPhase2Question && effectiveChipPhase - 1 >= 2) {
        // Allow Phase 2 chips for Phase-2-type questions even at floor 3
        const phase2Chips = effectiveIntent === 'buy'
          ? (language === 'es' ? ["Tomar la evaluación de preparación", "Explorar guías del comprador"] : ["Take the readiness check", "Browse buyer guides"])
          : (language === 'es' ? ["¿Cuánto vale mi casa?", "Comparar efectivo vs. listado"] : ["What's my home worth?", "Compare cash vs. listing"]);
        chips = phase2Chips;
        phase = 2;
        escalated = false;
      } else if (effectiveChipPhase >= 3) {
        chips = language === 'es' ? ["Estimar mis ganancias netas", "Hablar con Kasandra"] : ["Estimate my net proceeds", "Talk with Kasandra"];
        phase = 3;
        escalated = rawGoverned.escalated;
      } else {
        // effectiveChipPhase is 2 but governed returned 1 — use Phase 2 chips
        if (effectiveIntent === 'sell' || effectiveIntent === 'cash') {
          chips = language === 'es' ? ["¿Cuánto vale mi casa?", "Comparar efectivo vs. listado"] : ["What's my home worth?", "Compare cash vs. listing"];
        } else if (effectiveIntent === 'buy') {
          chips = language === 'es' ? ["Tomar la evaluación de preparación", "Explorar guías del comprador"] : ["Take the readiness check", "Browse buyer guides"];
        } else {
          chips = rawGoverned.chips; // fallback
        }
        phase = 2;
        escalated = false;
      }
    } else {
      chips = rawGoverned.chips;
      phase = rawGoverned.phase;
      escalated = rawGoverned.escalated;
    }
    
    let governanceHint = "";
    if (proceedsOverride || asapTimeline) {
      governanceHint = language === 'es'
        ? `\n\nGOBERNANZA: El usuario quiere saber sus ganancias netas (o tiene urgencia ASAP). Recomiende DIRECTAMENTE la herramienta de estimación de ganancias netas. NO ofrezca guías. Respuesta = 1 reconocimiento + 1 recomendación directa. Las opciones de acción se muestran automáticamente como botones.`
        : `\n\nGOVERNANCE: User is asking about net proceeds (or has ASAP urgency). Recommend the net proceeds estimator DIRECTLY. Do NOT offer guides. Response = 1 acknowledgment + 1 direct recommendation. Action buttons are shown automatically by the system.`;
    } else if (escalated) {
      governanceHint = language === 'es'
        ? `\n\nGOBERNANZA ANTI-LOOP: El usuario ha pedido la misma cosa 2 veces. NO repita la misma respuesta. Diga: "Ya que ha explorado eso, el paso más claro ahora es estimar sus números." Los botones de acción se muestran automáticamente.`
        : `\n\nGOVERNANCE ANTI-LOOP: User has repeated the same request 2 times. Do NOT offer the same response. Say: "Since you've already explored that, the clearest next step is estimating your numbers." Action buttons are shown automatically by the system.`;
    } else if (phase === 2) {
      governanceHint = language === 'es'
        ? `\n\nGOBERNANZA FASE 2: La intención está clara. Sea decisivo — recomiende UN paso concreto. No pregunte "¿preferiría una herramienta o una guía?". Máximo 2 opciones. Los botones se muestran automáticamente.`
        : `\n\nGOVERNANCE PHASE 2: Intent is known. Be decisive — recommend ONE concrete next step. Do NOT ask "would you prefer a tool or a guide?". Max 2 options. Action buttons are shown automatically by the system.`;
    }

    // ============= STOP TALKING RULE (Phase 3 / Mode 4) =============
    // When action buttons are present (calculator, booking, tools), the AI must
    // end its turn immediately. No follow-up questions. No persuasion.
    if (currentMode === 4 || phase === 3 || proceedsOverride || asapTimeline) {
      governanceHint += language === 'es'
        ? `\n\nREGLA DURA: Botones de acción están adjuntos a esta respuesta. Su texto DEBE ser 1-2 oraciones máximo — un reconocimiento breve y una recomendación directa. NO haga preguntas de seguimiento. NO agregue "¿le gustaría...?" ni "la mayoría encuentra útil...". Termine su turno.`
        : `\n\nHARD RULE: Action buttons are attached to this response. Your text MUST be 1-2 sentences max — one brief acknowledgment and one direct recommendation. Do NOT ask follow-up questions. Do NOT add "would you like to..." or "most people find it helpful...". End your turn.`;
    }
    
    // Add stall recovery hint if needed
    if (stalled) {
      reflectionHint += language === "es"
        ? `\n\nDETECTADO: El usuario parece estancado. Ofrece resumir o preguntar si prefiere seguir explorando.`
        : `\n\nDETECTED: User appears stalled. Offer to summarize or ask if they'd prefer to keep exploring.`;
    }
    
    // Add mode hint
    let guideModeHint = "";
    if (context.entry_source === 'guide' || context.entry_source === 'guide_handoff') {
      const guideTitle = context.last_guide_title || 'a guide';
      guideModeHint = language === 'es'
        ? `\n\nMODO GUÍA: El usuario abrió el chat desde la guía "${guideTitle}". Restringe las sugerencias a: entender la guía, usar herramientas relacionadas, o hacer preguntas. NO sugieras guías o herramientas no relacionadas. NO hagas ventas cruzadas ni introduzcas urgencia.`
        : `\n\nGUIDE MODE: User opened chat from guide "${guideTitle}". Restrict suggestions to: understanding the guide, using related tools, or asking questions. Do NOT suggest unrelated guides or tools. Do NOT cross-sell or introduce urgency.`;
    }

    const modeHint = language === "es"
      ? `\n\nMODO ACTUAL: ${currentMode} (${modeContext.modeName}). Ajusta el tono y las sugerencias según este modo.`
      : `\n\nCURRENT MODE: ${currentMode} (${modeContext.modeName}). Adjust tone and suggestions for this mode.`;

    // ============= FIRST SELLER TURN INTERCEPT =============
    // If user just declared selling intent on their first turn, short-circuit
    // with a calm prequalification response + timeline bubbles.
    // 
    // GUARD: Do NOT re-fire if the current message IS a timeline response chip.
    // This prevents the intercept from looping when the route always injects 'sell'.
    const TIMELINE_REPLY_PATTERNS = /^(asap|lo antes posible|\d[\d\s\-–]+\s*(month|mes|day|día)|1.?3\s*(month|mes)|3.?6\s*(month|mes)|just exploring|solo explorando|months?|meses?|\d+.?\d+\s*(days?|días?))/i;
    const isTimelineReply = TIMELINE_REPLY_PATTERNS.test(message.trim());
    
    // Timeline re-ask guard: skip first-seller intercept if timeline was recently asked
    const turnCount = context.turn_count ?? 0;
    const timelineRecentlyAsked = context.timeline_last_asked_turn !== undefined && 
      context.timeline_last_asked_turn !== null &&
      (turnCount - context.timeline_last_asked_turn) < 10;
    
    const isFirstSellerTurn = conversationState.userTurns <= 1
      && (primaryIntent === 'sell' || primaryIntent === 'cash')
      && !context.tool_used
      && !context.quiz_completed
      && !isTimelineReply    // Never re-fire on timeline chip responses
      && !proceedsOverride   // PROCEEDS override takes absolute priority over first-turn intercept
      && !asapTimeline       // ASAP override also bypasses first-turn intercept
      && !context.timeline   // Don't re-ask if timeline already known
      && !timelineRecentlyAsked; // Don't spam timeline question

    if (isFirstSellerTurn) {
      const sellerFirstReply = language === 'es'
        ? 'Entendido — vender es una decisión importante, y lo vamos a tomar un paso tranquilo a la vez. ¿Con qué tipo de plazo está trabajando?'
        : "Got it — selling is a big decision, and we'll take it one calm step at a time. What kind of timeline are you working with?";

      const sellerTimelineBubbles = language === 'es'
        ? ["Lo antes posible (0–30 días)", "1–3 meses", "3–6 meses", "Solo explorando"]
        : ["ASAP (0–30 days)", "1–3 months", "3–6 months", "Just exploring"];

      return new Response(
        JSON.stringify({
          ok: true,
          reply: sellerFirstReply,
          suggestedReplies: sellerTimelineBubbles,
          actions: [],
          language,
          lead_id: leadId,
          detected_intent: primaryIntent,
          booking_cta_shown: false,
          current_mode: currentMode,
          mode_name: modeContext.modeName,
          chip_phase_floor: Math.max(effectiveChipPhase, 2), // Intent declared → floor at least 2
          timeline_last_asked_turn: turnCount,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt + reflectionHint + governanceHint + guideModeHint + modeHint }, 
          ...history.slice(-6), // Extended to -6 to support loop detection context
          { role: "user", content: message }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const rawReply = data.choices?.[0]?.message?.content || "I'm here to help. How can I guide you today?";
    let reply = sanitizeBracketCTAs(rawReply);

    // ============= SERVER-SIDE ONBOARDING HARD BLOCK =============
    // Safety backstop: if intent exists or chip_phase_floor >= 2, the AI must never
    // output literal onboarding prompt variants. Replace with neutral "welcome back".
    const ONBOARDING_BLOCK_PATTERNS = /are you looking to buy.*sell.*explore|just explore what's possible|what brings you here today|what brings you here|qué le trae por aquí|está pensando en comprar.*vender.*explorar|está buscando comprar.*vender.*explorar/i;
    
    if ((context.intent || effectiveChipPhase >= 2) && ONBOARDING_BLOCK_PATTERNS.test(reply)) {
      reply = language === 'es'
        ? 'Bienvenido/a de vuelta — podemos continuar donde lo dejamos.'
        : 'Welcome back — we can pick up where you left off.';
    }

    // Check if booking access is earned (from mode detection)
    const hasEarned = modeContext.allowBookingCTA;

    // ============= CHIP GOVERNANCE: FINAL CHIP SELECTION =============
    // Priority hierarchy:
    // 1. Stall recovery (highest override)
    // 2. Proceeds / ASAP override → Phase 3 chips
    // 3. Governed phase chips (Phase 1, 2, or 3)
    // 4. Mode-based replies (fallback)
    let suggestedReplies: string[];
    
    if (currentMode === 4) {
      // HANDOFF mode: bypass all chip governance — chips must align with reply text
      suggestedReplies = language === "es"
        ? ["Encontrar un horario con Kasandra", "Seguir conversando con Selena"]
        : ["Find a time with Kasandra", "Keep chatting with Selena"];
    } else if (stalled) {
      // Stall recovery — 3 options to re-anchor
      suggestedReplies = language === "es"
        ? ["Sí, resume dónde estoy", "Prefiero seguir explorando", "Tengo una pregunta específica"]
        : ["Yes, summarize where I am", "I'd rather keep exploring", "I have a specific question"];
    } else if (proceedsOverride || asapTimeline) {
      // PROCEEDS / ASAP override — hard lock to Phase 3 chips
      suggestedReplies = language === 'es'
        ? ["Estimar mis ganancias netas", "Hablar con Kasandra"]
        : ["Estimate my net proceeds", "Talk with Kasandra"];
    } else {
      // Use governed phase chips
      suggestedReplies = chips;
    }

    // Apply earned-access filter (strips booking language if not earned)
    // EXCEPTION: Phase 3 chips always include "Talk with Kasandra" — the escalation IS the earned signal.
    const isPhase3 = phase === 3 || proceedsOverride || asapTimeline;
    suggestedReplies = filterSuggestionsForEarnedAccess(suggestedReplies, hasEarned || isPhase3);

    // EMAIL-ASKING SUPPRESSION: If Selena is actively collecting email, clear chips
    // so users can't click stale Phase 3 chips instead of typing their address.
    const replyAsksForEmail = /email\s*(address)?.*\?|what.*email|your email|correo\s*(electr[oó]nico)?.*\?/i.test(reply);
    if (replyAsksForEmail && !extractedEmail && currentMode !== 4) {
      suggestedReplies = language === "es"
        ? ["Prefiero omitir esto por ahora"]
        : ["Skip for now"];
    }

    // Build actions array conditionally
    const actions: Array<{ label: string; href: string; eventType: string }> = [];
    
    if (hasEarned) {
      actions.push({
        label: language === "es" ? "Revisar Estrategia con Kasandra" : "Review Strategy with Kasandra",
        href: "/v2/book",
        eventType: "book_click",
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        reply,
        suggestedReplies,
        actions,
        language,
        lead_id: leadId,
        // Return CANONICAL detected intent only
        detected_intent: primaryIntent !== 'explore' ? primaryIntent : null,
        booking_cta_shown: hasEarned,
        // Mode telemetry
        current_mode: currentMode,
        mode_name: modeContext.modeName,
        // Chip governance telemetry + monotonic floor
        chip_phase: phase,
        chip_phase_floor: effectiveChipPhase,
        chip_escalated: escalated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error", error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        reply: "I'm having a moment - please try again.",
        message: "Internal server error",
      }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
