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
  };
  history?: ChatMessage[];
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
  if (/60|90|3\s*months|6\s*months/.test(lower)) return "60_90_days";
  if (/exploring|curious|looking|just\s*see|not\s*sure|no\s*se|pensando/.test(lower)) return "not_sure";
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

      // Only update intent/timeline if currently NULL (Safe Migration Rule)
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
  if (/buy|comprar|purchase|busco|casa|home/.test(lower)) intents.push("buy");
  if (/sell|vender|selling|list|listar/.test(lower)) intents.push("sell");
  if (/cash|efectivo|quick|rápido|urgent|herencia|inherited/.test(lower)) intents.push("cash");
  if (/ready|listo|now|ahora|asap/.test(lower)) intents.push("ready");
  if (/exploring|curious|thinking|quizás|no sé/.test(lower)) intents.push("exploring");
  if (route.includes("cash-offer") || route.includes("seller")) intents.push("sell");
  return intents.length > 0 ? intents : ["exploring"];
}

// ============= SIMILARITY MATCHING =============
/**
 * Fuzzy match check - returns true if strings have significant word overlap
 * Uses Jaccard similarity on word sets
 */
function isSimilar(str1: string, str2: string, threshold = 0.8): boolean {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return true;
  if (s1.length === 0 || s2.length === 0) return false;
  
  // Word overlap check for performance
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 2));
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  
  if (union === 0) return false;
  return (intersection / union) >= threshold;
}

// ============= PROGRESSION MAP =============
/**
 * Maps user selection to next-best-step suggestions
 * When user clicks a pill, we show the logical next action instead of repeating
 */
const PROGRESSION_MAP: Record<string, { en: string[]; es: string[] }> = {
  // Buyer path progressions
  'schedule a tour': {
    en: ["What should I prepare?", "View buyer guide", "Talk to Kasandra now"],
    es: ["¿Qué debo preparar?", "Ver guía del comprador", "Hablar con Kasandra ahora"]
  },
  'take readiness check': {
    en: ["How long does it take?", "Start now", "What does this check?"],
    es: ["¿Cuánto tiempo toma?", "Comenzar ahora", "¿Qué verifica este análisis?"]
  },
  'view first-time buyer guide': {
    en: ["Schedule a tour", "Ask about financing", "Check my readiness"],
    es: ["Programar un recorrido", "Preguntar sobre financiamiento", "Verificar mi preparación"]
  },
  // Seller path progressions
  "what's my home worth": {
    en: ["Get a detailed estimate", "Compare cash vs. listing", "Schedule a walkthrough"],
    es: ["Obtener estimación detallada", "Comparar efectivo vs. listado", "Agendar una visita"]
  },
  'compare cash vs. traditional': {
    en: ["Request my net sheet", "Talk to Kasandra", "See cash timeline"],
    es: ["Solicitar mi análisis", "Hablar con Kasandra", "Ver línea de tiempo en efectivo"]
  },
  'request a net sheet': {
    en: ["Review my estimate", "Schedule a consultation", "Ask a question"],
    es: ["Revisar mi estimación", "Agendar una consulta", "Hacer una pregunta"]
  },
  'request a cash offer': {
    en: ["How fast can I close?", "What's the process?", "Talk to Kasandra"],
    es: ["¿Qué tan rápido puedo cerrar?", "¿Cuál es el proceso?", "Hablar con Kasandra"]
  },
  // First intent declarations
  "i'm thinking about selling": {
    en: ["What's my home worth?", "Compare cash vs. traditional", "Request a net sheet"],
    es: ["¿Cuánto vale mi casa?", "Comparar efectivo vs. tradicional", "Solicitar análisis de ganancias"]
  },
  "i'm looking to buy": {
    en: ["Take readiness check", "View first-time buyer guide", "Schedule a tour"],
    es: ["Tomar evaluación de preparación", "Ver guía para compradores", "Programar un recorrido"]
  },
  'just exploring': {
    en: ["Tell me about selling", "Tell me about buying", "What are my options?"],
    es: ["Cuéntame sobre vender", "Cuéntame sobre comprar", "¿Cuáles son mis opciones?"]
  }
};

// ============= INTENT-AWARE SUGGESTION FILTERING =============
type IntentKey = 'sell' | 'cash_offer' | 'buy' | 'exploring';

/**
 * Progressive suggested replies with deduplication
 * @param intent - Current user intent (sell, buy, exploring, etc.)
 * @param language - 'en' or 'es'
 * @param lastUserMessage - The user's most recent message (for deduplication + progression)
 */
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
    cash_offer: {
      en: ["What's my home worth?", "How fast can I close?", "Request a cash offer"],
      es: ["¿Cuánto vale mi casa?", "¿Qué tan rápido puedo cerrar?", "Solicitar oferta en efectivo"]
    },
    buy: {
      en: ["Take readiness check", "View first-time buyer guide", "Schedule a tour"],
      es: ["Tomar evaluación de preparación", "Ver guía para compradores", "Programar un recorrido"]
    },
    exploring: {
      en: ["I'm thinking about selling", "I'm looking to buy", "What are my options?"],
      es: ["Estoy pensando en vender", "Estoy buscando comprar", "¿Cuáles son mis opciones?"]
    }
  };
  
  const intentKey: IntentKey = intent === 'cash_offer' ? 'cash_offer'
                             : intent === 'sell' ? 'sell'
                             : intent === 'buy' ? 'buy'
                             : 'exploring';
  
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

When a user provides their email or exhibits high intent, reassure them that Kasandra herself will review their details.`;

const SYSTEM_PROMPT_ES = `Eres Selena, la concierge digital de bienes raíces de Kasandra Prieto. 
Kasandra es una profesional independiente de alto nivel en Tucson.

REGLAS DE VOZ:
- Use SIEMPRE "Usted" (formal). Nunca tutee al cliente.
- NUNCA diga "nuestro equipo", "nosotros" o "alguien de la oficina".
- DIGA SIEMPRE "Kasandra se comunicará personalmente con usted" o "Kasandra le guiará personalmente".
- Mantenga las respuestas a 2-3 oraciones.
- Sea profesional, calmada y brinde apoyo sin presión.

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

    // Deduplicate intent for DB (primary only)
    const primaryIntent = intents.includes("cash") ? "cash_offer" : intents[0];

    // Determine the effective intent (detected now OR previously stored in context)
    const effectiveIntent = primaryIntent !== 'exploring' ? primaryIntent : (context.intent || 'exploring');

    // Check if this is the FIRST sell declaration (for address collection)
    const isFirstSellDeclaration = 
      (intents.includes('sell') || intents.includes('cash')) && 
      !context.intent; // No prior intent stored in session

    // Identity Upgrade & Persistence
    const extractedEmail = extractEmail(message);
    if (extractedEmail) {
      const upsert = await upsertLeadProfile(extractedEmail, context, primaryIntent, timeline || undefined);
      if (upsert.success) {
        leadId = upsert.lead_id;
        await logDataCapture(context.session_id, "selena_data_email_captured", { lead_id: leadId });
      }
    } else if (leadId && (primaryIntent || timeline)) {
      // Background update if lead already known
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const updateObj: Record<string, unknown> = {};
      if (primaryIntent) updateObj.intent = primaryIntent;
      if (timeline) updateObj.timeline = timeline;
      await supabase.from("lead_profiles").update(updateObj).eq("id", leadId);
    }

    // Build system prompt with optional address collection directive
    let additionalInstruction = '';
    if (isFirstSellDeclaration) {
      additionalInstruction = language === 'es'
        ? `\n\nEl usuario acaba de indicar que quiere vender. Tu respuesta DEBE terminar preguntando la dirección de la propiedad.
Ejemplo: "¡Ese es un paso emocionante! Para darle el análisis de mercado más preciso, ¿cuál es la dirección de la propiedad que está pensando en vender?"`
        : `\n\nThe user just indicated they want to sell. Your response MUST end with asking for the property address.
Example: "That's an exciting next step! To give you the most accurate market analysis, what is the address of the property you're thinking about selling?"`;
    }

    const systemPrompt = (language === "es" ? SYSTEM_PROMPT_ES : SYSTEM_PROMPT_EN) + additionalInstruction;
    
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

    // Get intent-aware suggested replies
    // Get intent-aware suggested replies with deduplication
    const suggestedReplies = getSuggestedReplies(effectiveIntent, language, message);

    return new Response(
      JSON.stringify({
        reply,
        suggestedReplies,
        actions: [
          {
            label: language === "es" ? "Agenda con Kasandra" : "Schedule with Kasandra",
            href: "/v2/book",
            eventType: "book_click",
          },
        ],
        language,
        lead_id: leadId,
        // Return detected intent so frontend can update SessionContext
        detected_intent: primaryIntent !== 'exploring' ? primaryIntent : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error", error);
    return new Response(JSON.stringify({ reply: "I'm having a moment - please try again." }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});