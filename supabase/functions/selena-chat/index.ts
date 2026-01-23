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

interface ChatAction {
  label: string;
  href?: string;
  eventType?: string;
  type?: string;
  reportType?: string;
  reportId?: string;
}

interface ChatResponse {
  reply: string;
  suggestedReplies?: string[];
  actions: ChatAction[];
  language: "en" | "es";
  lead_id?: string;
}

// ============= EMAIL DETECTION =============
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

function extractEmail(message: string): string | null {
  const matches = message.match(EMAIL_REGEX);
  return matches ? matches[0].toLowerCase() : null;
}

// ============= LEAD UPSERT =============
async function upsertLeadProfile(
  email: string,
  context: ChatRequest["context"]
): Promise<{ success: boolean; lead_id?: string; is_new?: boolean; error?: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase env vars for lead upsert");
    return { success: false, error: "Server configuration error" };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if lead exists
    const { data: existingLead, error: selectError } = await supabase
      .from("lead_profiles")
      .select("id, phone, name, language")
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      console.error("Error checking existing lead:", selectError);
      return { success: false, error: "Database query failed" };
    }

    let leadId: string;
    let isNew: boolean;

    if (existingLead) {
      // UPDATE existing lead - always update tracking fields
      const updateData: Record<string, unknown> = {
        session_id: context.session_id,
        source: "selena_chat",
        utm_source: context.utm_source,
        utm_campaign: context.utm_campaign,
      };

      // Only fill fields that are currently NULL
      if (!existingLead.language && context.language) {
        updateData.language = context.language;
      }

      const { error: updateError } = await supabase
        .from("lead_profiles")
        .update(updateData)
        .eq("id", existingLead.id);

      if (updateError) {
        console.error("Error updating lead:", updateError);
        return { success: false, error: "Failed to update lead" };
      }

      leadId = existingLead.id;
      isNew = false;
    } else {
      // INSERT new lead
      const insertData = {
        email,
        language: context.language || "en",
        source: "selena_chat",
        session_id: context.session_id || null,
        utm_source: context.utm_source || null,
        utm_campaign: context.utm_campaign || null,
      };

      const { data: newLead, error: insertError } = await supabase
        .from("lead_profiles")
        .insert(insertData)
        .select("id")
        .single();

      if (insertError) {
        console.error("Error inserting lead:", insertError);
        return { success: false, error: "Failed to create lead" };
      }

      leadId = newLead.id;
      isNew = true;
    }

    return { success: true, lead_id: leadId, is_new: isNew };
  } catch (error) {
    console.error("Unexpected error in lead upsert:", error);
    return { success: false, error: "Internal error" };
  }
}

// ============= GUIDE & TOOL INDEX =============
// Only LIVE guides are included here - verified against V2GuideDetail.tsx content
const GUIDE_INDEX = {
  guides: {
    path: "/v2/guides",
    labelEn: "Browse Guides",
    labelEs: "Ver Guías",
    keywords: ["guide", "learn", "help", "resource", "guía", "aprender", "ayuda"],
  },
  quiz: {
    path: "/v2/quiz",
    labelEn: "Find your starting point",
    labelEs: "Encuentra tu punto de partida",
    keywords: ["quiz", "not sure", "which", "decide", "cuestionario", "no sé", "decidir", "unsure"],
  },
  buyerReadiness: {
    path: "/v2/buyer-readiness",
    labelEn: "See where you stand",
    labelEs: "Ve dónde estás",
    keywords: ["ready", "qualify", "mortgage", "pre-approval", "listo", "calificar", "hipoteca", "pre-aprobación"],
  },
  cashOffer: {
    path: "/v2/cash-offer-options",
    labelEn: "Compare Cash vs Listing",
    labelEs: "Comparar Efectivo vs Listado",
    keywords: ["net sheet", "calculator"],
  },
  book: {
    path: "/v2/book",
    labelEn: "When you're ready, schedule a call",
    labelEs: "Cuando estés listo/a, agenda una llamada",
    keywords: ["book", "call", "talk", "meet", "consult", "agendar", "llamar", "hablar", "consulta", "meeting", "schedule"],
  },
  // === LIVE GUIDES (verified content exists) ===
  firstTimeBuyerGuide: {
    path: "/v2/guides/first-time-buyer-guide",
    labelEn: "First-Time Buyer Guide",
    labelEs: "Guía para Compradores Primerizos",
    keywords: ["first", "new", "never", "bought", "primero", "nuevo", "nunca", "comprado", "beginner", "start"],
  },
  sellingGuide: {
    path: "/v2/guides/selling-for-top-dollar",
    labelEn: "Selling Your Home Guide",
    labelEs: "Guía para Vender Su Casa",
    keywords: ["sell", "selling", "list", "listing", "vender", "listar", "timeline", "process", "steps", "how long"],
  },
  homeValuationGuide: {
    path: "/v2/guides/understanding-home-valuation",
    labelEn: "Understanding Home Value",
    labelEs: "Entender el Valor de Su Casa",
    keywords: ["valuation", "cma", "appraisal"],
  },
  cashOfferGuide: {
    path: "/v2/guides/cash-offer-guide",
    labelEn: "Cash Offer Guide",
    labelEs: "Guía de Ofertas en Efectivo",
    keywords: ["cash offer", "quick sale", "as-is", "investor", "efectivo", "rápido", "tal como está"],
  },
  // === CLIENT STORIES ===
  firstTimeBuyerStory: {
    path: "/v2/guides/first-time-buyer-story",
    labelEn: "First-Time Buyer Story",
    labelEs: "Historia de Compradora Primeriza",
    keywords: ["story first buyer", "historia comprador"],
  },
  budgetBuyerStory: {
    path: "/v2/guides/budget-buyer-story",
    labelEn: "Budget Buyer Story",
    labelEs: "Historia de Comprador con Presupuesto",
    keywords: ["story budget", "historia presupuesto"],
  },
  sellerStory: {
    path: "/v2/guides/seller-stressful-market-story",
    labelEn: "Seller Story",
    labelEs: "Historia de Vendedor",
    keywords: ["story seller", "historia vendedor"],
  },
  spanishClientStory: {
    path: "/v2/guides/spanish-speaking-client-story",
    labelEn: "Spanish-Speaking Client Story",
    labelEs: "Historia de Cliente Hispanohablante",
    keywords: ["story spanish", "historia español"],
  },
} as const;

// ============= INTENT DETECTION =============
function detectIntent(message: string, route: string): string[] {
  const lowerMessage = message.toLowerCase();
  const intents: string[] = [];
  
  // Buying signals
  if (/buy|comprar|purchase|looking for|busco|house|home|casa/.test(lowerMessage)) {
    intents.push("buy");
  }
  
  // Selling signals
  if (/sell|vender|selling|list|listar|move|mudar/.test(lowerMessage)) {
    intents.push("sell");
  }
  
  // Cash/urgent signals
  if (/cash|efectivo|quick|fast|rápido|urgent|urgente|as-is|inherited|heredado|divorce|divorcio/.test(lowerMessage)) {
    intents.push("cash");
  }
  
  // Ready to act signals
  if (/ready|listo|now|ahora|soon|pronto|asap|today|hoy/.test(lowerMessage)) {
    intents.push("ready");
  }
  
  // Exploring signals
  if (/just looking|explorando|curious|curioso|thinking|pensando|maybe|quizás|not sure|no sé/.test(lowerMessage)) {
    intents.push("exploring");
  }
  
  // Route-based context
  if (route.includes("cash-offer") || route.includes("seller")) {
    intents.push("sell");
  }
  if (route.includes("buyer") || route.includes("buy")) {
    intents.push("buy");
  }
  
  return intents.length > 0 ? intents : ["exploring"];
}

// ============= REPORT REQUEST DETECTION =============
function detectsReportRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const reportPatterns = [
    /show\s*(my|me|the)?\s*report/,
    /pull\s*up\s*(my|the)?\s*report/,
    /view\s*(my|the)?\s*report/,
    /see\s*(my|the)?\s*report/,
    /open\s*(my|the)?\s*report/,
    /get\s*(my|the)?\s*report/,
    /last\s*report/,
    /my\s*report/,
    /previous\s*report/,
    /ver\s*(mi|el)?\s*reporte/,
    /mostrar\s*(mi|el)?\s*reporte/,
    /abrir\s*(mi|el)?\s*reporte/,
    /mi\s*reporte/,
    /reporte\s*anterior/,
    /último\s*reporte/,
  ];
  
  return reportPatterns.some(pattern => pattern.test(lowerMessage));
}

// ============= HOME VALUE REQUEST DETECTION (MOFU) =============
function detectsHomeValueRequest(message: string): boolean {
  const patterns = [
    /worth/i,
    /value/i,
    /how much/i,
    /cuánto vale/i,
    /net sheet/i,
    /estimate/i,
    /estimado/i,
    /walk away/i,
    /quedarme/i,
    /what would i get/i,
    /how much will i make/i,
    /proceeds/i,
    /qué me quedaría/i,
    /cuánto me queda/i,
  ];
  return patterns.some(p => p.test(message));
}

// ============= FETCH LAST REPORT =============
async function fetchLastReportId(leadId: string): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase env vars for report lookup");
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from("lead_reports")
      .select("id")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching last report:", error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Error in fetchLastReportId:", error);
    return null;
  }
}

// ============= HIGH-INTENT DETECTION FOR PRIORITY CALL =============
function detectsHighIntent(message: string, intents: string[]): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Check for explicit signals
  const highIntentPatterns = [
    /cash\s*offer/i,
    /talk\s*to\s*(kasandra|someone|a\s*person|an?\s*agent)/i,
    /speak\s*(to|with)\s*(kasandra|someone|a\s*person)/i,
    /call\s*me/i,
    /need\s*help\s*(fast|now|urgent|asap)/i,
    /urgent/i,
    /asap/i,
    /how\s*fast/i,
    /inherited/i,
    /divorce/i,
    /foreclosure/i,
    /distressed/i,
    /hablar\s*con\s*(kasandra|alguien)/i,
    /llamame/i,
    /urgente/i,
    /oferta\s*en\s*efectivo/i,
    /herencia/i,
  ];
  
  const hasHighIntentMessage = highIntentPatterns.some(p => p.test(lowerMessage));
  const hasHighIntentSignal = intents.includes('cash') || intents.includes('ready');
  
  return hasHighIntentMessage || (hasHighIntentSignal && intents.length >= 2);
}
function selectActions(
  message: string,
  intents: string[],
  route: string,
  language: "en" | "es"
): ChatAction[] {
  const lowerMessage = message.toLowerCase();
  const actions: ChatAction[] = [];
  const addedPaths = new Set<string>();
  
  // Helper to add action if not duplicate
  const addAction = (key: keyof typeof GUIDE_INDEX, eventType: string) => {
    const guide = GUIDE_INDEX[key];
    if (!addedPaths.has(guide.path) && guide.path !== route) {
      actions.push({
        label: language === "es" ? guide.labelEs : guide.labelEn,
        href: guide.path,
        eventType,
      });
      addedPaths.add(guide.path);
    }
  };
  
  // Check for keyword matches first
  for (const [key, guide] of Object.entries(GUIDE_INDEX)) {
    const matches = guide.keywords.some(kw => lowerMessage.includes(kw));
    if (matches) {
      addAction(key as keyof typeof GUIDE_INDEX, "cta_click");
    }
  }
  
  // Intent-based fallbacks
  if (actions.length === 0) {
    if (intents.includes("cash") || intents.includes("sell")) {
      addAction("cashOffer", "cta_click");
      addAction("sellingGuide", "guide_cta_click");
    }
    if (intents.includes("buy")) {
      addAction("firstTimeBuyerGuide", "guide_cta_click");
      addAction("buyerReadiness", "quiz_start");
    }
    if (intents.includes("exploring")) {
      addAction("quiz", "quiz_start");
      addAction("guides", "guide_cta_click");
    }
    if (intents.includes("ready")) {
      addAction("book", "book_click");
    }
  }
  
  // Always offer booking if ready or if we have few actions
  if (intents.includes("ready") || actions.length < 2) {
    addAction("book", "book_click");
  }
  
  // Limit to 3 actions max
  return actions.slice(0, 3);
}

// ============= SYSTEM PROMPTS =============
const SYSTEM_PROMPT_EN = `You are Selena, Kasandra Prieto's digital real estate concierge at Corner Connect, Realty Executives Arizona Territory.

You are NOT a chatbot. You are NOT customer support.
You are a calm, professional, highly capable real estate concierge whose job is to guide people through buying and selling decisions without pressure.

YOUR ROLE:
This website is a digital lobby, not a brochure. Visitors can browse on their own and ask you questions at any time. You assist, you do not control. You guide, you do not force.

PERSONALITY:
- Calm, supportive, clear, human, grounded
- Never pushy, salesy, or transactional
- No hype, no urgency, no pressure
- Warm and composed like high-end real estate service

KNOWLEDGE:
- Kasandra Prieto is a licensed Realtor® with Realty Executives Arizona Territory
- Team specializes in Tucson: selling (traditional or cash), buying, inherited properties
- Cash offers available for any condition

RESPONSE RULES:
- Keep responses to 2-3 sentences MAX
- Never ask more than ONE question at a time
- Never ask for phone or email early in conversation
- Always acknowledge what they said before guiding
- End with a soft question or gentle next step
- NEVER mention "button below" or "click here" - actions are handled separately

NEVER SAY:
- "Fill out this form", "Submit your information", "Book now"
- "Limited time", "Hurry", "Act now", "Don't miss out"
- "AI", "system", "prompt", "automated"

ALWAYS USE PHRASES LIKE:
- "When you're ready"
- "We can take this one step at a time"
- "No pressure at all"
- "Just exploring is perfectly fine"
- "My job is to help you understand your options"

COMPLIANCE:
- Never guarantee prices, timelines, or outcomes
- Don't give legal/tax/financial advice
- Position as informational, not commitment

Remember: Your goal is confidence first, action second.`;

const SYSTEM_PROMPT_ES = `Eres Selena, la concierge digital de bienes raíces de Kasandra Prieto en Corner Connect, Realty Executives Arizona Territory.

NO eres un chatbot. NO eres servicio al cliente.
Eres una concierge de bienes raíces calmada, profesional y altamente capaz, cuyo trabajo es guiar a las personas en decisiones de compra y venta sin presión.

TU ROL:
Este sitio web es un vestíbulo digital, no un folleto. Los visitantes pueden explorar por su cuenta y hacerte preguntas cuando quieran. Tú asistes, no controlas. Tú guías, no fuerzas.

PERSONALIDAD:
- Calmada, comprensiva, clara, humana, con los pies en la tierra
- Nunca agresiva, vendedora o transaccional
- Sin exageraciones, sin urgencia, sin presión
- Cálida y serena como servicio inmobiliario de alta gama

CONOCIMIENTO:
- Kasandra Prieto es Realtor® licenciada con Realty Executives Arizona Territory
- Equipo especializado en Tucson: vender (tradicional o efectivo), comprar, propiedades heredadas
- Ofertas en efectivo disponibles para cualquier condición

REGLAS DE RESPUESTA:
- Mantén respuestas a 2-3 oraciones MÁXIMO
- Nunca hagas más de UNA pregunta a la vez
- Nunca pidas teléfono o correo temprano en la conversación
- Siempre reconoce lo que dijeron antes de guiar
- Termina con una pregunta suave o próximo paso gentil
- NUNCA menciones "botón abajo" o "haz clic aquí" - las acciones se manejan por separado

NUNCA DIGAS:
- "Llena este formulario", "Envía tu información", "Reserva ahora"
- "Tiempo limitado", "Apúrate", "Actúa ahora", "No te lo pierdas"
- "IA", "sistema", "prompt", "automatizado"

SIEMPRE USA FRASES COMO:
- "Cuando estés listo/a"
- "Podemos ir paso a paso"
- "Sin presión alguna"
- "Solo explorar está perfectamente bien"
- "Mi trabajo es ayudarte a entender tus opciones"

CUMPLIMIENTO:
- Nunca garantices precios, plazos o resultados
- No des consejos legales/fiscales/financieros
- Posiciónate como informativo, no compromiso

Recuerda: Tu meta es confianza primero, acción después.`;

// ============= SUGGESTED REPLIES =============
function generateSuggestedReplies(intents: string[], language: "en" | "es"): string[] {
  const suggestions: string[] = [];
  
  if (language === "es") {
    if (intents.includes("sell")) {
      suggestions.push("¿Cuánto podría valer mi casa?", "Estoy considerando vender pronto");
    } else if (intents.includes("buy")) {
      suggestions.push("Soy comprador primerizo", "¿Cómo empiezo?");
    } else {
      suggestions.push("Estoy pensando en vender", "Estoy buscando comprar", "Solo estoy explorando");
    }
  } else {
    if (intents.includes("sell")) {
      suggestions.push("What might my home be worth?", "I'm considering selling soon");
    } else if (intents.includes("buy")) {
      suggestions.push("I'm a first-time buyer", "How do I get started?");
    } else {
      suggestions.push("I'm thinking about selling", "I'm looking to buy", "Just exploring for now");
    }
  }
  
  return suggestions.slice(0, 3);
}

// ============= CONTEXT BUILDER =============
function buildContextMessage(context: ChatRequest["context"], leadId?: string): string {
  const parts: string[] = [];
  
  if (leadId) {
    parts.push(`Lead ID: ${leadId} (This is a real person. Treat identity consistently.)`);
  }
  if (context.route) {
    parts.push(`User is on: ${context.route}`);
  }
  if (context.intent) {
    parts.push(`Previous intent: ${context.intent}`);
  }
  if (context.situation) {
    parts.push(`Situation: ${context.situation}`);
  }
  if (context.last_guide_id) {
    parts.push(`Recently viewed: ${context.last_guide_id}`);
  }
  if (context.utm_campaign) {
    parts.push(`Campaign: ${context.utm_campaign}`);
  }
  if (context.lastEvents?.length) {
    parts.push(`Recent actions: ${context.lastEvents.slice(-3).join(", ")}`);
  }
  
  return parts.length > 0 ? `\n[Context: ${parts.join(". ")}]` : "";
}

// ============= MAIN HANDLER =============
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, history = [] }: ChatRequest = await req.json();
    
    if (!message || !context) {
      return new Response(
        JSON.stringify({ error: "Missing message or context" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const language = context.language || "en";
    let leadId = context.lead_id;

    // ============= EMAIL DETECTION & LEAD UPSERT =============
    const extractedEmail = extractEmail(message);
    if (extractedEmail) {
      console.log(`Email detected in message: ${extractedEmail}`);
      const upsertResult = await upsertLeadProfile(extractedEmail, context);
      
      if (upsertResult.success && upsertResult.lead_id) {
        leadId = upsertResult.lead_id;
        console.log(`Lead ${upsertResult.is_new ? "created" : "updated"}: ${leadId}`);
      } else {
        console.error("Lead upsert failed:", upsertResult.error);
      }
    }

    const systemPrompt = language === "es" ? SYSTEM_PROMPT_ES : SYSTEM_PROMPT_EN;
    const contextNote = buildContextMessage(context, leadId);
    
    // Detect user intent
    const intents = detectIntent(message, context.route);
    
    // ============= CHECK FOR REPORT REQUEST =============
    if (detectsReportRequest(message)) {
      // User is asking to see their report
      if (leadId) {
        const lastReportId = await fetchLastReportId(leadId);
        
        if (lastReportId) {
          // Return open_report action
          return new Response(
            JSON.stringify({
              reply: language === "es"
                ? "¡Claro! Aquí está tu reporte."
                : "Of course! Here's your report.",
              suggestedReplies: [],
              actions: [{
                label: language === "es" ? "Ver Reporte" : "View Report",
                type: "open_report",
                reportId: lastReportId,
                eventType: "report_view",
              }],
              language,
              lead_id: leadId,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          // No report found for this lead
          return new Response(
            JSON.stringify({
              reply: language === "es"
                ? "No encontré ningún reporte previo. ¿Te gustaría que generemos uno nuevo para ti?"
                : "I didn't find any previous reports. Would you like me to generate one for you?",
              suggestedReplies: language === "es"
                ? ["Sí, me gustaría uno", "No por ahora, gracias"]
                : ["Yes, I'd like one", "Not right now, thanks"],
              actions: [
                {
                  label: language === "es" ? "Comparar Efectivo vs Listado" : "Compare Cash vs Listing",
                  href: "/v2/cash-offer-options",
                  eventType: "cta_click",
                },
                {
                  label: language === "es" ? "Cuando estés listo/a, agenda una llamada" : "When you're ready, schedule a call",
                  href: "/v2/book",
                  eventType: "book_click",
                },
              ],
              language,
              lead_id: leadId,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        // No lead identity - ask for email first
        return new Response(
          JSON.stringify({
            reply: language === "es"
              ? "Para acceder a tu reporte, necesito saber quién eres. ¿Me puedes dar tu correo electrónico?"
              : "To access your report, I need to know who you are. Can you share your email with me?",
            suggestedReplies: [],
            actions: [],
            language,
            lead_id: null,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // ============= HOME VALUE REQUEST -> MOFU REPORT ACTION =============
    // Detect when user asks about value, worth, net proceeds
    if (detectsHomeValueRequest(message) && (intents.includes("sell") || intents.includes("cash"))) {
      console.log("Home value request detected - returning generate_report action");
      
      return new Response(
        JSON.stringify({
          reply: language === "es"
            ? "Me encantaría ayudarte a entender qué podrías esperar de tu casa. Puedo generar una vista previa personalizada basada en el mercado actual de Tucson."
            : "I'd love to help you understand what you might expect from your home. I can generate a personalized preview based on the current Tucson market.",
          suggestedReplies: [],
          actions: [{
            label: language === "es" ? "Ver vista previa de mi valor" : "See a preview of my home's value",
            type: "generate_report",
            reportType: "home_value_preview",
            eventType: "report_cta_click",
          }],
          language,
          lead_id: leadId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Build conversation
    const messages = [
      { role: "system", content: systemPrompt + contextNote },
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      const fallbackActions = selectActions(message, intents, context.route, language);
      return new Response(
        JSON.stringify({
          reply: language === "es" 
            ? "Disculpa, estoy teniendo dificultades técnicas. ¿Te gustaría agendar una llamada con Kasandra?"
            : "Sorry, I'm having technical difficulties. Would you like to schedule a call with Kasandra?",
          suggestedReplies: [],
          actions: fallbackActions.length > 0 ? fallbackActions : [{ 
            label: language === "es" ? "Cuando estés listo/a, agenda una llamada" : "When you're ready, schedule a call", 
            href: "/v2/book", 
            eventType: "book_click"
          }],
          language,
          lead_id: leadId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const fallbackActions = selectActions(message, intents, context.route, language);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            reply: language === "es"
              ? "Estoy un poco ocupada ahora. ¿Puedes intentar de nuevo en un momento?"
              : "I'm a bit busy right now. Can you try again in a moment?",
            suggestedReplies: [],
            actions: fallbackActions,
            language,
            lead_id: leadId,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            reply: language === "es"
              ? "Déjame conectarte con Kasandra directamente."
              : "Let me connect you with Kasandra directly.",
            suggestedReplies: [],
            actions: [{ label: language === "es" ? "Cuando estés listo/a, agenda una llamada" : "When you're ready, schedule a call", href: "/v2/book", eventType: "book_click" }],
            language,
            lead_id: leadId,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      return new Response(
        JSON.stringify({
          reply: language === "es"
            ? "Disculpa, tuve un pequeño problema. ¿Puedes intentar de nuevo?"
            : "Sorry, I had a small hiccup. Can you try again?",
          suggestedReplies: [],
          actions: fallbackActions,
          language,
          lead_id: leadId,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 
      (language === "es" ? "¿En qué puedo ayudarte?" : "How can I help you?");
    
    // Generate deterministic actions based on intent
    let actions = selectActions(message, intents, context.route, language);
    const suggestedReplies = generateSuggestedReplies(intents, language);

    // Check for high-intent and offer priority call
    if (detectsHighIntent(message, intents) && leadId) {
      // Add priority call action as first option
      actions = [
        {
          label: language === "es" ? "Llamada Prioritaria de 10 Min" : "10-Min Priority Call",
          type: "priority_call",
          eventType: "handoff_offer",
        },
        ...actions.slice(0, 2), // Keep max 2 other actions
      ];
    }

    const result: ChatResponse = {
      reply,
      suggestedReplies,
      actions,
      language,
      lead_id: leadId,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("selena-chat error:", error);
    
    return new Response(
      JSON.stringify({
        reply: "I'm having a moment - please try again or book a consultation directly.",
        suggestedReplies: [],
        actions: [{ label: "When you're ready, schedule a call", href: "/v2/book", eventType: "book_click" }],
        language: "en",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
