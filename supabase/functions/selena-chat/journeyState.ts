/**
 * Journey State Engine — Deterministic TOFU/MOFU/BOFU classifier
 * 
 * Classifies users into explore | evaluate | decide based on
 * readiness score + engagement signals. Returns semantic chip keys
 * and governance hints for the system prompt.
 * 
 * Guard 2: Only uses canonical tool IDs (no text inference).
 * All chip keys are semantic identifiers from CHIP_KEYS — never display strings.
 */

export type JourneyState = 'explore' | 'evaluate' | 'decide';

export interface JourneyClassification {
  journey_state: JourneyState;
  governanceHint: string;
  /** Semantic chip keys — resolved to localized labels on the client */
  stageChips: string[];
}

/**
 * Semantic chip keys — server-side mirror of src/lib/registry/chipKeys.ts
 * Used for deterministic routing. Display labels live in the client registry.
 */
const CHIP_KEYS = {
  TALK_WITH_KASANDRA: 'talk_with_kasandra',
  ESTIMATE_PROCEEDS: 'estimate_proceeds',
  COMPARE_CASH_LISTING: 'compare_cash_listing',
  GET_SELLING_OPTIONS: 'get_selling_options',
  BUYER_READINESS: 'buyer_readiness',
  CASH_READINESS: 'cash_readiness',
  BROWSE_GUIDES: 'browse_guides',
  // New tools (March 2026 — available for evaluate-state rotation)
  AFFORDABILITY_CALCULATOR: 'affordability_calculator',
  BAH_CALCULATOR: 'bah_calculator',
  HOME_VALUATION: 'home_valuation',
} as const;

const DECIDE_TOOLS = ['tucson_alpha_calculator', 'seller_decision'];
// FIX-SIM-12: 'invest' can reach decide state after tool completion
const DECIDE_INTENTS = ['buy', 'sell', 'cash', 'invest'];

export function classifyJourneyState(input: {
  readiness_score: number;
  tools_completed: string[];
  guides_read_count: number;
  intent?: string;
  language: 'en' | 'es';
  isInheritedHome?: boolean;
  timeline?: string;
  hasTrustSignal?: boolean;
  // FIX-SIM-09: user turn count for turn-based evaluate advancement
  user_turn_count?: number;
}): JourneyClassification {
  const { readiness_score, tools_completed, guides_read_count, intent, language, isInheritedHome, timeline, hasTrustSignal, user_turn_count } = input;
  const isEs = language === 'es';

  // ── HIGHEST PRIORITY: Inherited home + ASAP = immediate decide ──
  if (isInheritedHome && timeline === 'asap') {
    return {
      journey_state: 'decide',
      governanceHint: isEs
        ? '\n\nPRIORIDAD MÁXIMA — HERENCIA + URGENTE:\nEste usuario heredó una propiedad y quiere actuar en 0-30 días. NO ofrezca guías ni herramientas. Reconozca la situación con una oración empática, luego entregue una invitación directa a reservar.\n"Kasandra ha guiado a familias en exactamente esta situación — propiedades heredadas donde el plazo importa y la confianza es todo. Una llamada de 20 minutos le daría claridad sobre ambos caminos — efectivo y tradicional — sin presión."\nPrimera y única respuesta sugerida: "Hablar con Kasandra".'
        : '\n\nHIGHEST PRIORITY — INHERITED HOME + ASAP TIMELINE:\nThis user inherited a property and wants to move in 0-30 days. Do NOT offer guides or tools. Acknowledge their situation with one empathetic sentence, then deliver a direct booking invitation.\n"Kasandra has guided families through exactly this situation — inherited properties where the timeline matters and trust is everything. A 20-minute call with her would give you clarity on both paths — cash and traditional — with no pressure and no commitment."\nFirst and only suggested reply: "Talk with Kasandra".',
      stageChips: [CHIP_KEYS.TALK_WITH_KASANDRA],
    };
  }

  // ── Inherited home alone (any timeline) = decide ──
  if (isInheritedHome) {
    return {
      journey_state: 'decide',
      governanceHint: isEs
        ? '\n\nHERENCIA DETECTADA:\nEste vendedor heredó la propiedad. Situación de alta sensibilidad y alto interés.\n- Reconozca el peso emocional brevemente, sin exagerar\n- Preocupaciones clave: ser aprovechado, entender el valor real, tomar la decisión correcta para la familia\n- "Kasandra ha ayudado a familias a navegar propiedades heredadas — entiende la complejidad emocional y práctica."\n- Siempre incluya "Hablar con Kasandra" como respuesta sugerida\n- NO recomiende más guías después de detectar esta señal'
        : '\n\nINHERITED HOME DETECTED:\nThis seller inherited the property. High-sensitivity, high-intent situation.\n- Acknowledge the emotional weight once, briefly, without overdoing it\n- Key concerns: being taken advantage of, understanding true value, making the right decision for the family\n- "Kasandra has helped families navigate inherited properties — she understands the emotional and practical complexity."\n- Always include "Talk with Kasandra" as suggested reply\n- Do NOT recommend more guides after this pattern is detected',
      stageChips: [CHIP_KEYS.TALK_WITH_KASANDRA],
    };
  }

  // ── Trust signal + high-intent = decide ──
  if (hasTrustSignal && intent && DECIDE_INTENTS.includes(intent)) {
    return {
      journey_state: 'decide',
      governanceHint: isEs
        ? '\n\nSEÑAL DE CONFIANZA DETECTADA:\nEl usuario ha expresado confianza explícita en Kasandra. Valide su instinto e invite a reservar.\n"Su instinto sobre Kasandra es correcto — ha construido su reputación exactamente en este tipo de situaciones."'
        : '\n\nTRUST SIGNAL DETECTED:\nUser has explicitly expressed trust in Kasandra. Validate their instinct and invite booking.\n"Your instinct about Kasandra is right — she\'s built her reputation on exactly the kind of situations you\'re describing."',
      stageChips: [CHIP_KEYS.TALK_WITH_KASANDRA],
    };
  }

  // ── HIGH INTENT OVERRIDE: guides alone can trigger decide ──
  if (guides_read_count >= 5 && intent && DECIDE_INTENTS.includes(intent)) {
    return {
      journey_state: 'decide',
      governanceHint: isEs
        ? '\n\nINTENTO ALTO DETECTADO — PIVOTE DE RESERVA OBLIGATORIO:\nEste usuario pasó la fase de investigación. NO recomiende más guías.\nRespuesta: un dato que valide su preparación + invitación directa a reservar.\nSiempre incluya "Hablar con Kasandra" como primera respuesta sugerida.'
        : '\n\nHIGH INTENT DETECTED — BOOKING PIVOT REQUIRED:\nThis user is past the research phase. Do NOT recommend more guides.\nResponse: one insight validating readiness + direct booking invitation.\nAlways include "Talk with Kasandra" as first suggested reply.',
      stageChips: [CHIP_KEYS.TALK_WITH_KASANDRA],
    };
  }

  // ── decide ──
  if (
    readiness_score >= 60 &&
    tools_completed.some(t => DECIDE_TOOLS.includes(t)) &&
    intent && DECIDE_INTENTS.includes(intent)
  ) {
    return {
      journey_state: 'decide',
      governanceHint: isEs
        ? '\n\nESTADO DEL VIAJE: decide\n- Rute hacia reserva. Reconocimiento breve + chip de reserva solamente.'
        : '\n\nJOURNEY STATE: decide\n- Route to booking. Brief acknowledgment + booking chip only.',
      stageChips: [CHIP_KEYS.TALK_WITH_KASANDRA],
    };
  }

  // ── evaluate ──
  // FIX-SIM-09: 3+ user turns with known intent = evaluate (no tool required)
  // Prevents "explore forever" dead-end for engaged users who haven't clicked a tool.
  const turnBasedEvaluate = (user_turn_count ?? 0) >= 3 && !!intent && intent !== 'explore';

  if (
    readiness_score >= 30 ||
    tools_completed.length >= 1 ||
    guides_read_count >= 2 ||
    turnBasedEvaluate
  ) {
    let chips: string[];
    if (intent === 'sell' || intent === 'cash') {
      chips = [CHIP_KEYS.COMPARE_CASH_LISTING, CHIP_KEYS.GET_SELLING_OPTIONS];
    } else if (intent === 'buy') {
      chips = [CHIP_KEYS.BUYER_READINESS, CHIP_KEYS.BROWSE_GUIDES];
    } else if (intent === 'invest') {
      // FIX-SIM-12: investor evaluate chips
      chips = [CHIP_KEYS.BROWSE_GUIDES, CHIP_KEYS.GET_SELLING_OPTIONS];
    } else {
      chips = [CHIP_KEYS.BROWSE_GUIDES, CHIP_KEYS.GET_SELLING_OPTIONS];
    }

    return {
      journey_state: 'evaluate',
      governanceHint: isEs
        ? '\n\nESTADO DEL VIAJE: evaluate\n- Recomiende herramientas de comparación, calculadoras, guías de decisión. Sin reserva.'
        : '\n\nJOURNEY STATE: evaluate\n- Recommend comparison tools, calculators, decision guides. No booking.',
      stageChips: chips,
    };
  }

  // ── explore ──
  let chips: string[];
  if (intent === 'buy') {
    chips = [CHIP_KEYS.BUYER_READINESS, CHIP_KEYS.BROWSE_GUIDES];
  } else if (intent === 'sell') {
    chips = [CHIP_KEYS.GET_SELLING_OPTIONS, CHIP_KEYS.BROWSE_GUIDES];
  } else if (intent === 'cash') {
    chips = [CHIP_KEYS.CASH_READINESS, CHIP_KEYS.BROWSE_GUIDES];
  } else if (intent === 'invest') {
    // FIX-SIM-12: investor explore chips — sell-or-rent guide + market data
    chips = [CHIP_KEYS.GET_SELLING_OPTIONS, CHIP_KEYS.BROWSE_GUIDES];
  } else {
    chips = [CHIP_KEYS.BROWSE_GUIDES];
  }

  return {
    journey_state: 'explore',
    governanceHint: isEs
      ? '\n\nESTADO DEL VIAJE: explore\n- Recomiende guías y herramientas de preparación solamente. Sin calculadoras. Sin reserva.'
      : '\n\nJOURNEY STATE: explore\n- Recommend guides and readiness tools only. No calculators. No booking.',
    stageChips: chips,
  };
}
