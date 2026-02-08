/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SELENA MODE CONTEXT - Decision Certainty Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This module defines the 4-mode psychological architecture for Selena's
 * conversation flow. Each mode represents a stage in the user's trust-building
 * journey toward booking.
 * 
 * MODES:
 * 1. ORIENTATION - First contact, reduce anxiety
 * 2. CLARITY BUILDING - Learning, tool engagement
 * 3. CONFIDENCE & SYNTHESIS - Informed, ready for reflection
 * 4. HANDOFF - Ready to book (earned access)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type ConversationMode = 1 | 2 | 3 | 4;

export interface ModeContext {
  mode: ConversationMode;
  modeName: string;
  allowBookingCTA: boolean;
  reflectionRequired: boolean;
}

export interface ConversationState {
  userTurns: number;
  hasIntent: boolean;
  intent: string | null;
  guidesRead: number;
  toolUsed: boolean;
  quizCompleted: boolean;
  hasToolResult: boolean;
  hasEmail: boolean;
  explicitBookingAsk: boolean;
}

/**
 * Determines the current conversation mode based on engagement signals
 */
export function detectMode(state: ConversationState): ModeContext {
  const {
    userTurns,
    hasIntent,
    intent,
    guidesRead,
    toolUsed,
    quizCompleted,
    hasToolResult,
    hasEmail,
    explicitBookingAsk,
  } = state;

  // MODE 4: HANDOFF - Earned access gate passed
  if (explicitBookingAsk || hasEmail || (toolUsed && userTurns >= 2)) {
    return {
      mode: 4,
      modeName: 'HANDOFF',
      allowBookingCTA: true,
      reflectionRequired: false,
    };
  }

  // MODE 3: CONFIDENCE & SYNTHESIS - Deep engagement
  if (guidesRead >= 3 || hasToolResult || quizCompleted) {
    return {
      mode: 3,
      modeName: 'CONFIDENCE',
      allowBookingCTA: false,
      reflectionRequired: true,
    };
  }

  // MODE 2: CLARITY BUILDING - Intent declared or engaged
  if (hasIntent || guidesRead >= 1 || toolUsed || userTurns >= 2) {
    return {
      mode: 2,
      modeName: 'CLARITY',
      allowBookingCTA: false,
      reflectionRequired: true,
    };
  }

  // MODE 1: ORIENTATION - First contact
  return {
    mode: 1,
    modeName: 'ORIENTATION',
    allowBookingCTA: false,
    reflectionRequired: false,
  };
}

/**
 * Mode-specific system prompt additions (EN)
 */
export const MODE_INSTRUCTIONS_EN = `
CONVERSATION MODES (detect and adapt dynamically):

MODE 1 - ORIENTATION (First Contact):
- Acknowledge uncertainty: "That's a lot to navigate. Let's take it one step at a time."
- Ask ONE gentle framing question only
- NEVER mention booking, calls, or scheduling
- Goal: Reduce anxiety, establish calm authority

MODE 2 - CLARITY BUILDING (Engaged):
- Open with a Reflection Sentence: "From what you've explored so far — especially [action/guide] — it sounds like you're trying to [goal]."
- Reference what the user has done (guides read, tools used)
- Suggest 2-3 clear next steps (tools, guides, or specific questions)
- Still no booking mentions

MODE 3 - CONFIDENCE & SYNTHESIS (Deep Engagement):
- Lead with reflection: "You've already done the hard work — thinking this through carefully."
- Summarize their progress and insights
- Position Kasandra subtly as calm, experienced, personally involved
- Still no hard booking CTA — let user signal readiness

MODE 4 - HANDOFF (Ready):
- User has earned access (explicit ask, email provided, or tool completion)
- Frame booking as continuation of clarity: "At this point, most people find it helpful to talk with Kasandra directly so nothing gets missed."
- ALWAYS offer "keep chatting" as an alternative
- Booking is "a quick clarity conversation," never a sales pitch

STALL RECOVERY (Mode 3.5):
If user has 5+ turns without forward motion or repeats "just curious/exploring":
"Would it be helpful if I summarized where you are and what usually helps people move forward from here — or would you rather keep exploring on your own?"

POST-BOOKING REASSURANCE:
After booking confirmation: "You've already done the hard part — thinking this through carefully. Kasandra will personally review your situation before your call."

BUSY PROFESSIONAL FRAMING:
- Kasandra personally handles every client — no team, no handoffs
- "Kasandra's schedule fills up, but I can help you find a time"
- "She'll review your situation before your call" (preparation)
- Never compare to other agents — Kasandra is the only option
`;

/**
 * Mode-specific system prompt additions (ES) - Formal Usted
 */
export const MODE_INSTRUCTIONS_ES = `
MODOS DE CONVERSACIÓN (detectar y adaptar dinámicamente):

MODO 1 - ORIENTACIÓN (Primer Contacto):
- Reconocer incertidumbre: "Es mucho que considerar. Vamos paso a paso."
- Hacer SOLO UNA pregunta de orientación
- NUNCA mencionar reservas, llamadas o citas
- Objetivo: Reducir ansiedad, establecer autoridad tranquila

MODO 2 - CONSTRUCCIÓN DE CLARIDAD (Comprometido):
- Comenzar con Reflexión: "Basándome en lo que ha explorado — especialmente [acción/guía] — parece que está buscando [objetivo]."
- Referenciar lo que el usuario ha hecho (guías leídas, herramientas usadas)
- Sugerir 2-3 próximos pasos claros
- Aún sin menciones de reserva

MODO 3 - CONFIANZA Y SÍNTESIS (Engagement Profundo):
- Liderar con reflexión: "Usted ya ha hecho lo difícil — pensar esto cuidadosamente."
- Resumir su progreso e insights
- Posicionar a Kasandra sutilmente como calmada, experimentada, personalmente involucrada
- Aún sin CTA de reserva fuerte

MODO 4 - TRANSICIÓN (Listo):
- El usuario ha ganado acceso (solicitud explícita, correo proporcionado, o herramienta completada)
- Enmarcar la reserva como continuación de claridad: "En este punto, la mayoría encuentra útil hablar directamente con Kasandra para que nada se pierda."
- SIEMPRE ofrecer "seguir conversando" como alternativa
- La reserva es "una conversación de claridad," nunca una venta

RECUPERACIÓN DE ESTANCAMIENTO (Modo 3.5):
Si el usuario tiene 5+ turnos sin avance o repite "solo curiosidad/explorando":
"¿Le ayudaría si resumo dónde está usted y qué suele ayudar a las personas a avanzar — o prefiere seguir explorando por su cuenta?"

REASSURANCE POST-RESERVA:
Después de confirmación de reserva: "Usted ya ha hecho lo difícil — pensar esto cuidadosamente. Kasandra revisará personalmente su situación antes de su llamada."

ENCUADRE DE PROFESIONAL OCUPADA:
- Kasandra maneja personalmente cada cliente — sin equipo, sin transferencias
- "La agenda de Kasandra se llena, pero puedo ayudarle a encontrar un horario"
- "Ella revisará su situación antes de su llamada" (preparación)
- Nunca comparar con otros agentes — Kasandra es la única opción
`;

/**
 * Generates a context-aware reflection sentence based on user's journey
 */
export function generateReflectionSentence(
  language: 'en' | 'es',
  context: {
    lastGuide?: string;
    toolUsed?: string;
    guidesRead?: number;
    intent?: string;
  }
): string {
  const { lastGuide, toolUsed, guidesRead = 0, intent } = context;

  if (language === 'es') {
    if (lastGuide) {
      return `Basándome en lo que ha explorado — especialmente la guía sobre \"${lastGuide}\" — parece que está buscando claridad sobre sus opciones.`;
    }
    if (toolUsed) {
      return `Veo que ha usado ${toolUsed}. Eso es un gran paso para entender su situación.`;
    }
    if (guidesRead >= 2) {
      return `Ha leído ${guidesRead} guías hasta ahora. Está construyendo una imagen clara.`;
    }
    if (intent === 'sell') {
      return `Parece que está considerando vender. Es una decisión importante.`;
    }
    if (intent === 'buy') {
      return `Parece que está explorando la compra. Hay mucho que considerar.`;
    }
    return ``;
  }

  // English
  if (lastGuide) {
    return `From what you've explored — especially the guide on \"${lastGuide}\" — it sounds like you're looking for clarity on your options.`;
  }
  if (toolUsed) {
    return `I see you've used the ${toolUsed}. That's a great step toward understanding your situation.`;
  }
  if (guidesRead >= 2) {
    return `You've read ${guidesRead} guides so far. You're building a clear picture.`;
  }
  if (intent === 'sell') {
    return `It sounds like you're considering selling. That's an important decision.`;
  }
  if (intent === 'buy') {
    return `It sounds like you're exploring buying. There's a lot to consider.`;
  }
  return ``;
}

/**
 * Mode-specific suggested replies (behavioral rails)
 */
export function getModeSuggestedReplies(
  mode: ConversationMode,
  language: 'en' | 'es',
  intent?: string
): string[] {
  const replies: Record<ConversationMode, { en: string[]; es: string[] }> = {
    // MODE 1: Intent declarations only
    1: {
      en: [
        "I'm thinking about selling",
        "I'm looking to buy",
        "Just exploring for now",
      ],
      es: [
        "Estoy pensando en vender",
        "Estoy buscando comprar",
        "Solo estoy explorando",
      ],
    },
    // MODE 2: Tools + guides
    2: {
      en: intent === 'buy' 
        ? ["Take the readiness check", "View buyer guide", "What should I prepare?"]
        : intent === 'sell' || intent === 'cash'
        ? ["What's my home worth?", "Compare my options", "View seller guide"]
        : ["Explore selling options", "Explore buying options", "Show me guides"],
      es: intent === 'buy'
        ? ["Hacer la evaluación de preparación", "Ver guía del comprador", "¿Qué debo preparar?"]
        : intent === 'sell' || intent === 'cash'
        ? ["¿Cuánto vale mi casa?", "Comparar mis opciones", "Ver guía del vendedor"]
        : ["Explorar opciones de venta", "Explorar opciones de compra", "Mostrar guías"],
    },
    // MODE 3: Synthesis + prep
    3: {
      en: [
        "Summarize what I've learned",
        "What should I prepare?",
        "What's my next step?",
      ],
      es: [
        "Resumir lo que he aprendido",
        "¿Qué debo preparar?",
        "¿Cuál es mi siguiente paso?",
      ],
    },
    // MODE 4: Booking + keep chatting
    4: {
      en: [
        "Review strategy with Kasandra",
        "I have more questions first",
        "What happens on the call?",
      ],
      es: [
        "Revisar estrategia con Kasandra",
        "Tengo más preguntas primero",
        "¿Qué pasa en la llamada?",
      ],
    },
  };

  return replies[mode][language];
}
