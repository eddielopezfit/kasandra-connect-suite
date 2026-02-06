import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    lastEvents?: string[];
    lead_id?: string;
    // Stable fields that exist in SessionContext
    tool_used?: string;
    last_tool_result?: string;
    quiz_completed?: boolean;
  };
  history?: ChatMessage[];
}

// ============= CANONICAL VALUES =============
// Canonical intent values: buy | sell | cash | dual | explore
// Canonical timeline values: asap | 30_days | 60_90 | exploring

/**
 * Normalizes detected intent to canonical values
 */
function normalizeIntent(raw: string): string {
  switch (raw) {
    case 'cash_offer': return 'cash';
    case 'exploring': return 'explore';
    case 'ready': return null as unknown as string; // 'ready' is urgency, not intent
    default: return raw;
  }
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
 */
function detectTimeline(message: string): string | null {
  const lower = message.toLowerCase();
  if (/asap|now|today|pronto|ahora|hoy|inmediata/.test(lower)) return "asap";
  if (/month|30\s*days|mes|30\s*dias/.test(lower)) return "30_days";
  if (/60|90|3\s*months|6\s*months/.test(lower)) return "60_90";
  if (/exploring|curious|looking|just\s*see|not\s*sure|no\s*se|pensando/.test(lower)) return "exploring";
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
  
  if (/buy|comprar|purchase|busco casa|looking for a home/.test(lower)) intents.push("buy");
  if (/sell|vender|selling|list|listar/.test(lower)) intents.push("sell");
  if (/cash|efectivo|quick sale|rápido|urgent|herencia|inherited/.test(lower)) intents.push("cash");
  if (/exploring|curious|thinking|quizás|no sé|just looking/.test(lower)) intents.push("explore");
  if (route.includes("cash-offer") || route.includes("seller")) intents.push("sell");
  
  // Normalize and dedupe
  return intents.length > 0 ? [...new Set(intents.map(normalizeIntent).filter(Boolean))] : ["explore"];
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

// ============= BOOKING KEYWORDS =============
const BOOKING_KEYWORDS = /book|schedule|call|talk|meet|appointment|consulta|cita|llamar|hablar|agendar/i;

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
 * Based on: explicit ask, tool completion, or 2+ user turns
 */
function hasEarnedBookingAccess(
  context: ChatRequest["context"], 
  history: Array<{ role: string }>,
  message: string
): boolean {
  // 1. User explicitly asked to book/call
  if (userAskedToBook(message)) return true;
  
  // 2. Tool completion flags (stable fields from SessionContext)
  if (context.tool_used) return true;
  if (context.last_tool_result) return true;
  if (context.quiz_completed) return true;
  
  // 3. Earned after 2 user turns (means they engaged meaningfully)
  if (userTurnCount(history) >= 2) return true;
  
  return false;
}

/**
 * Filters suggestions to remove booking-related language if not earned
 */
function filterSuggestionsForEarnedAccess(suggestions: string[], hasEarned: boolean): string[] {
  if (hasEarned) return suggestions;
  
  // Strip any suggestion containing booking keywords
  return suggestions.filter(s => !BOOKING_KEYWORDS.test(s));
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
  // First intent declarations
  "i'm thinking about selling": {
    en: ["What's my home worth?", "Compare cash vs. traditional", "Request a net sheet"],
    es: ["¿Cuánto vale mi casa?", "Comparar efectivo vs. tradicional", "Solicitar análisis de ganancias"]
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

// ============= SYSTEM PROMPTS (HARDENED) =============
const SYSTEM_PROMPT_EN = `You are Selena, Kasandra Prieto's digital real estate concierge. 
Kasandra is a high-touch solo practitioner in Tucson. 

VOICE RULES:
- NEVER say "our team", "we", or "someone from the office".
- ALWAYS say "Kasandra will personally reach out" or "Kasandra will guide you personally".
- Keep responses to 2-3 sentences.
- Be calm, professional, and supportive. No pressure. 
- Mirror the user's language.

CONCIERGE PHILOSOPHY:
- Educate before qualifying. Offer value (guides, calculators, insights) before asking for personal details.
- Never push booking. Let the user signal readiness.
- If the user seems interested in selling, suggest exploring their options (calculator, guides) before asking for property address.

When a user provides their email or exhibits high intent, reassure them that Kasandra herself will review their details.`;

const SYSTEM_PROMPT_ES = `Eres Selena, la concierge digital de bienes raíces de Kasandra Prieto. 
Kasandra es una profesional independiente de alto nivel en Tucson.

REGLAS DE VOZ:
- Use SIEMPRE "Usted" (formal). Nunca tutee al cliente.
- NUNCA diga "nuestro equipo", "nosotros" o "alguien de la oficina".
- DIGA SIEMPRE "Kasandra se comunicará personalmente con usted" o "Kasandra le guiará personalmente".
- Mantenga las respuestas a 2-3 oraciones.
- Sea profesional, calmada y brinde apoyo sin presión.

FILOSOFÍA DE CONCIERGE:
- Educar antes de calificar. Ofrezca valor (guías, calculadoras, información) antes de solicitar datos personales.
- Nunca presione para agendar. Deje que el usuario señale su disposición.
- Si el usuario parece interesado en vender, sugiera explorar sus opciones antes de pedir la dirección de la propiedad.

Cuando el cliente proporcione su correo o muestre gran interés, asegúrele que la misma Kasandra revisará sus detalles.`;

// ============= MAIN HANDLER =============
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, context, history = [] }: ChatRequest = await req.json();
    const language = context.language || "en";
    let leadId = context.lead_id;

    const intents = detectIntent(message, context.route);
    const timeline = detectTimeline(message);

    // Primary intent (canonical)
    const primaryIntent = intents.includes("cash") ? "cash" : intents[0];

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
    // NOTE: Removed unsafe background update that overwrote intent/timeline
    // Lead profile updates only happen via upsertLeadProfile with write-once guards

    // Build system prompt
    const systemPrompt = language === "es" ? SYSTEM_PROMPT_ES : SYSTEM_PROMPT_EN;
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...history.slice(-5), { role: "user", content: message }],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm here to help. How can I guide you today?";

    // Check if booking access is earned
    const hasEarned = hasEarnedBookingAccess(context, history, message);

    // Get intent-aware suggested replies, then filter for earned access
    let suggestedReplies = getSuggestedReplies(effectiveIntent, language, message);
    suggestedReplies = filterSuggestionsForEarnedAccess(suggestedReplies, hasEarned);

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
