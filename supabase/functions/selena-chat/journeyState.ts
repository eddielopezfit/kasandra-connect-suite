/**
 * Journey State Engine — Deterministic TOFU/MOFU/BOFU classifier
 * 
 * Classifies users into explore | evaluate | decide based on
 * readiness score + engagement signals. Returns bilingual chips
 * and governance hints for the system prompt.
 * 
 * Guard 2: Only uses canonical tool IDs (no text inference).
 * All chip labels are exact matches to existing CHIP_DESTINATION keys.
 */

export type JourneyState = 'explore' | 'evaluate' | 'decide';

export interface JourneyClassification {
  journey_state: JourneyState;
  governanceHint: string;
  stageChips: string[];
}

const DECIDE_TOOLS = ['tucson_alpha_calculator', 'seller_decision'];
const DECIDE_INTENTS = ['buy', 'sell', 'cash'];

export function classifyJourneyState(input: {
  readiness_score: number;
  tools_completed: string[];
  guides_read_count: number;
  intent?: string;
  language: 'en' | 'es';
}): JourneyClassification {
  const { readiness_score, tools_completed, guides_read_count, intent, language } = input;
  const isEs = language === 'es';

  // ── decide ──
  // readiness_score >= 60 AND (tools_completed includes canonical decide-tool) AND valid intent
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
      stageChips: isEs
        ? ['Hablar con Kasandra']
        : ['Talk with Kasandra'],
    };
  }

  // ── evaluate ──
  // readiness_score >= 30 OR tools_completed >= 1 OR guides_read_count >= 2
  if (
    readiness_score >= 30 ||
    tools_completed.length >= 1 ||
    guides_read_count >= 2
  ) {
    let chips: string[];
    if (intent === 'sell' || intent === 'cash') {
      chips = isEs
        ? ['Comparar efectivo vs. listado', 'Ver mis opciones de venta']
        : ['Compare cash vs. listing', 'Get my selling options'];
    } else if (intent === 'buy') {
      chips = isEs
        ? ['Tomar la evaluación de preparación', 'Explorar guías']
        : ['Take the readiness check', 'Browse guides'];
    } else {
      chips = isEs
        ? ['Explorar guías', 'Ver mis opciones de venta']
        : ['Browse guides', 'Get my selling options'];
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
    chips = isEs
      ? ['Tomar la evaluación de preparación', 'Explorar guías']
      : ['Take the readiness check', 'Browse guides'];
  } else if (intent === 'sell') {
    chips = isEs
      ? ['Ver mis opciones de venta', 'Explorar guías']
      : ['Get my selling options', 'Browse guides'];
  } else if (intent === 'cash') {
    chips = isEs
      ? ['Tomar el check de preparación en efectivo', 'Explorar guías']
      : ['Take the cash readiness check', 'Browse guides'];
  } else {
    chips = isEs
      ? ['Explorar guías']
      : ['Browse guides'];
  }

  return {
    journey_state: 'explore',
    governanceHint: isEs
      ? '\n\nESTADO DEL VIAJE: explore\n- Recomiende guías y herramientas de preparación solamente. Sin calculadoras. Sin reserva.'
      : '\n\nJOURNEY STATE: explore\n- Recommend guides and readiness tools only. No calculators. No booking.',
    stageChips: chips,
  };
}
