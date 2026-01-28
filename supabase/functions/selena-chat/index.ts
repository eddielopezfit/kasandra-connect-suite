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

    return new Response(
      JSON.stringify({
        reply,
        suggestedReplies:
          language === "es"
            ? ["¿Cuánto vale mi casa?", "Busco comprar", "Solo exploro"]
            : ["What's my home worth?", "Looking to buy", "Just exploring"],
        actions: [
          {
            label: language === "es" ? "Agenda con Kasandra" : "Schedule with Kasandra",
            href: "/v2/book",
            eventType: "book_click",
          },
        ],
        language,
        lead_id: leadId,
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
