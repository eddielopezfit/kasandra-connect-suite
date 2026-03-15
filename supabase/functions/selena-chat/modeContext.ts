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
- The user has signaled readiness. Acknowledge calmly in one sentence.
- Do NOT persuade, add urgency, or use social proof like "most people find it helpful."
- Do NOT ask follow-up questions. The action buttons handle the next step.
- Keep the response to one sentence of calm acknowledgment. Then stop.

STALL RECOVERY (Mode 3.5):
If user has 5+ turns without forward motion or repeats "just curious/exploring":
"Would it be helpful if I summarized where you are and what usually helps people move forward from here — or would you rather keep exploring on your own?"

POST-BOOKING REASSURANCE:
After booking confirmation: "You've already done the hard part — thinking this through carefully. Kasandra will personally review your situation before your call."

CALM AUTHORITY FRAMING:
- Kasandra personally handles every client — no team, no handoffs
- "Kasandra personally reviews each situation before speaking with a client."
- "She'll review your situation before your call." (reassurance, not urgency)
- Never compare to other agents — Kasandra is the only option

CALCULATOR RESULT INTERPRETATION (Modes 2-3):
- If seller_calc_data is present: Reference the actual cashNetProceeds vs traditionalNetProceeds numbers. If recommendation === 'cash', validate their interest in speed/certainty. If 'traditional', affirm that full market value is worth pursuing.
- If closing_cost_data is present: Reference totalCashNeeded as the buyer's 'cash to close' number. Help them understand what to prepare for.
- If readiness_entry_data is present: Acknowledge their score (score/10) and primaryPriority. If score >= 7, treat as high-intent buyer/seller.
- NEVER repeat calculator numbers back verbatim — interpret what they mean for the user's decision.
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
- Comenzar con Reflexión: "Basándome en lo que has explorado — especialmente [acción/guía] — parece que estás buscando [objetivo]."
- Referenciar lo que el usuario ha hecho (guías leídas, herramientas usadas)
- Sugerir 2-3 próximos pasos claros
- Aún sin menciones de reserva

MODO 3 - CONFIANZA Y SÍNTESIS (Engagement Profundo):
- Liderar con reflexión: "Ya has hecho lo difícil — pensar esto cuidadosamente."
- Resumir su progreso e insights
- Posicionar a Kasandra sutilmente como calmada, experimentada, personalmente involucrada
- Aún sin CTA de reserva fuerte

MODO 4 - TRANSICIÓN (Listo):
- El usuario ha señalado su disposición. Reconoce con calma en una oración.
- NO persuadas, NO agregues urgencia, NO uses prueba social como "la mayoría encuentra útil."
- NO hagas preguntas de seguimiento. Los botones de acción manejan el siguiente paso.
- Mantén la respuesta a una oración de reconocimiento tranquilo. Luego detente.

RECUPERACIÓN DE ESTANCAMIENTO (Modo 3.5):
Si el usuario tiene 5+ turnos sin avance o repite "solo curiosidad/explorando":
"¿Te ayudaría si resumo dónde estás y qué suele ayudar a las personas a avanzar — o prefieres seguir explorando por tu cuenta?"

REASSURANCE POST-RESERVA:
Después de confirmación de reserva: "Ya has hecho lo difícil — pensar esto cuidadosamente. Kasandra revisará personalmente tu situación antes de tu llamada."

ENCUADRE DE AUTORIDAD TRANQUILA:
- Kasandra maneja personalmente cada cliente — sin equipo, sin transferencias
- "Kasandra revisa personalmente cada situación antes de hablar contigo."
- "Ella revisará tu situación antes de tu llamada." (tranquilidad, no urgencia)
- Nunca comparar con otros agentes — Kasandra es la única opción

INTERPRETACIÓN DE RESULTADOS DE CALCULADORA (Modos 2-3):
- Si seller_calc_data está presente: Referencia los números reales de cashNetProceeds vs traditionalNetProceeds. Si recommendation === 'cash', valida su interés en rapidez/certeza. Si 'traditional', afirma que buscar el valor completo del mercado vale la pena.
- Si closing_cost_data está presente: Referencia totalCashNeeded como el número de 'efectivo para el cierre' del comprador. Ayúdales a entender qué preparar.
- Si readiness_entry_data está presente: Reconoce su puntaje (score/10) y primaryPriority. Si score >= 7, trátalo como comprador/vendedor de alta intención.
- NUNCA repitas los números de la calculadora textualmente — interpreta lo que significan para la decisión del usuario.
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
      return `Basándome en lo que has explorado — especialmente la guía sobre \"${lastGuide}\" — parece que estás buscando claridad sobre tus opciones.`;
    }
    if (toolUsed) {
      return `Veo que has usado ${toolUsed}. Eso es un gran paso para entender tu situación.`;
    }
    if (guidesRead >= 2) {
      return `Has leído ${guidesRead} guías hasta ahora. Estás construyendo una imagen clara.`;
    }
    if (intent === 'sell') {
      return `Parece que estás considerando vender. Es una decisión importante.`;
    }
    if (intent === 'buy') {
      return `Parece que estás explorando la compra. Hay mucho que considerar.`;
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
        ? ["Take the readiness check", "Browse guides", "What should I prepare?"]
        : intent === 'sell' || intent === 'cash'
        ? ["Quick seller readiness check", "Get my selling options", "Compare cash vs. listing"]
        : ["Get my selling options", "Take the readiness check", "Browse guides"],
      es: intent === 'buy'
        ? ["Tomar la evaluación de preparación", "Explorar guías", "¿Qué debo preparar?"]
        : intent === 'sell' || intent === 'cash'
        ? ["Check rápido de preparación para vender", "Ver mis opciones de venta", "Comparar efectivo vs. listado"]
        : ["Ver mis opciones de venta", "Tomar la evaluación de preparación", "Explorar guías"],
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
    // MODE 4: Booking + another question (must match HANDOFF reply text exactly)
    4: {
      en: [
        "Find a time with Kasandra",
        "I have another question",
      ],
      es: [
        "Encontrar un horario con Kasandra",
        "Tengo otra pregunta",
      ],
    },
  };

  return replies[mode][language];
}
