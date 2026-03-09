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
} as const;

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
  if (
    readiness_score >= 30 ||
    tools_completed.length >= 1 ||
    guides_read_count >= 2
  ) {
    let chips: string[];
    if (intent === 'sell' || intent === 'cash') {
      chips = [CHIP_KEYS.COMPARE_CASH_LISTING, CHIP_KEYS.GET_SELLING_OPTIONS];
    } else if (intent === 'buy') {
      chips = [CHIP_KEYS.BUYER_READINESS, CHIP_KEYS.BROWSE_GUIDES];
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
