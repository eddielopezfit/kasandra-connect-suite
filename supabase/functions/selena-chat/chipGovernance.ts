/**
 * Chip Governance + Session State + Journey Awareness
 * Extracted from selena-chat/index.ts
 */

import type { ChatMessage, ChatRequest } from "./types.ts";
import { isSimilar } from "./bookingLogic.ts";

// ============= CHIP GOVERNANCE + SESSION STATE =============

/**
 * Inferred session state from conversation history.
 * Tracks engagement flags without requiring explicit frontend context.
 */
export interface SessionEngagementState {
  hasAskedProceeds: boolean;     // User asked about net/walk-away/proceeds
  hasAskedValue: boolean;        // User asked about home value
  hasComparedOptions: number;    // How many times user asked to compare options
  hasReadSellerGuide: boolean;   // User has opened/read a seller guide
  hasUsedCalculator: boolean;    // User has used any calculator tool
  chipHistory: string[];         // Last 5 user messages normalized (for loop detection)
}

// Proceeds-intent signals: any of these trigger the net proceeds override
export const PROCEEDS_PATTERNS = /walk away|net|after fees|what would i get|what do i keep|what.*pocket|proceeds|ganancias|lo que me queda|despues de.*costos|cuánto.*recibir/i;

// Seller guide indicators
const SELLER_GUIDE_PATTERNS = /view seller guide|read.*guide|seller guide|guía del vendedor|ver.*guía/i;

// Compare options indicators
const COMPARE_PATTERNS = /compare|cash vs|efectivo vs|comparison|comparar|my options|mis opciones/i;

// Value inquiry indicators
const VALUE_PATTERNS = /home worth|what.*worth|value|valuation|cuánto vale|valor.*casa/i;

// Calculator usage
const CALCULATOR_PATTERNS = /calculator|net proceeds|estimate.*net|cash offer|calculadora|calcular/i;

// Inherited home / estate detection
/**
 * Infers session engagement state from conversation history
 */
export function inferSessionState(
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
    hasUsedCalculator: CALCULATOR_PATTERNS.test(combined) || !!context.last_tool_completed,
    chipHistory: userMessages.slice(-5).map(m => m.toLowerCase().trim()),
  };
}

/**
 * Detects if the user is looping (clicked effectively the same chip 2+ times)
 */
export function detectLoop(chipHistory: string[]): boolean {
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
export function getGovernedChips(
  intent: string | undefined,
  timeline: string | null,
  engagement: SessionEngagementState,
  _language: 'en' | 'es',
  opts?: { guidesReadCount?: number },
): { chips: string[]; phase: 1 | 2 | 3; escalated: boolean } {
  const hasIntent = !!intent && intent !== 'explore';
  const isAsap = timeline === 'asap';
  const isLooping = detectLoop(engagement.chipHistory);

  // FIX-SIM-03: Turn count for chip rotation (prevents CHIP_REPETITION)
  // Count how many Phase 2 turns user has seen to rotate chips over time
  const phase2TurnCount = engagement.chipHistory.filter(
    m => !/^(intent_sell|intent_buy|intent_explore|i'm thinking|just looking|exploring)/.test(m)
  ).length;

  // PHASE 3 triggers: proceeds asked, compared 2+ times, ASAP timeline, or looping
  const enterPhase3 =
    engagement.hasAskedProceeds ||
    engagement.hasComparedOptions >= 2 ||
    isAsap ||
    (isLooping && hasIntent);

  // FIX 4: High-guide-count suppression — user has read 10+ guides, past education phase
  const guidesRead = opts?.guidesReadCount ?? 0;
  const suppressBrowseGuides = guidesRead >= 10;

  if (enterPhase3) {
    // FIX 1: Intent-aware Phase 3 — buyers get buying power chips, not seller chips
    const chips = intent === 'buy'
      ? [CHIP_KEYS.AFFORDABILITY_CALCULATOR, CHIP_KEYS.TALK_WITH_KASANDRA]
      : [CHIP_KEYS.ESTIMATE_PROCEEDS, CHIP_KEYS.TALK_WITH_KASANDRA];
    return { chips, phase: 3, escalated: isLooping || engagement.hasComparedOptions >= 2 };
  }

  // PHASE 2: Intent known — rotate chips to prevent repetition
  if (hasIntent) {
    // FIX-SIM-04: Investor / landlord / flip path — dedicated chip sequence
    if (intent === 'invest') {
      if (phase2TurnCount <= 1) {
        return { chips: [CHIP_KEYS.GUIDE_SELL_OR_RENT, CHIP_KEYS.TUCSON_MARKET_DATA], phase: 2, escalated: false };
      }
      if (phase2TurnCount === 2) {
        return { chips: [CHIP_KEYS.COMPARE_CASH_LISTING, suppressBrowseGuides ? CHIP_KEYS.TALK_WITH_KASANDRA : CHIP_KEYS.BROWSE_GUIDES], phase: 2, escalated: false };
      }
      // After 3+ turns escalate to booking
      return { chips: [CHIP_KEYS.ESTIMATE_PROCEEDS, CHIP_KEYS.TALK_WITH_KASANDRA], phase: 3, escalated: true };
    }

    // FIX-SIM-11: Dual intent (sell + buy simultaneously) — dedicated chip path
    if (intent === 'dual') {
      if (phase2TurnCount <= 1) {
        return { chips: [CHIP_KEYS.GET_SELLING_OPTIONS, CHIP_KEYS.BUYER_READINESS, CHIP_KEYS.COMPARE_CASH_LISTING], phase: 2, escalated: false };
      }
      if (phase2TurnCount === 2) {
        return { chips: [CHIP_KEYS.ESTIMATE_PROCEEDS, CHIP_KEYS.BUYER_READINESS], phase: 2, escalated: false };
      }
      // Turn 3+: they need a live conversation — escalate to booking
      return { chips: [CHIP_KEYS.ESTIMATE_PROCEEDS, CHIP_KEYS.TALK_WITH_KASANDRA], phase: 3, escalated: true };
    }

    if (intent === 'sell' || intent === 'cash') {
      // FIX-SIM-05: Rotate sell chips based on turn count (prevents static repetition)
      if (engagement.hasAskedValue || phase2TurnCount >= 3) {
        // Turn 3+: shift to proceeds path
        return { chips: [CHIP_KEYS.ESTIMATE_PROCEEDS, CHIP_KEYS.TALK_WITH_KASANDRA], phase: 3, escalated: true };
      }
      if (phase2TurnCount >= 2 && engagement.hasComparedOptions >= 1) {
        // Turn 2 + already compared: show readiness path
        const chips = intent === 'cash'
          ? [CHIP_KEYS.CASH_READINESS, CHIP_KEYS.ESTIMATE_PROCEEDS]
          : [CHIP_KEYS.SELLER_READINESS, CHIP_KEYS.ESTIMATE_PROCEEDS];
        return { chips, phase: 2, escalated: false };
      }
      // Turn 1-2: show initial sell chips (HOME_VALUATION replaces COMPARE_CASH_LISTING as early seller entry)
      const chips = intent === 'cash'
        ? [CHIP_KEYS.CASH_READINESS, CHIP_KEYS.COMPARE_CASH_LISTING]
        : [CHIP_KEYS.GET_SELLING_OPTIONS, CHIP_KEYS.HOME_VALUATION];
      return { chips, phase: 2, escalated: false };
    }

    if (intent === 'buy') {
      // FIX 5: Buyer Phase 2 — surface affordability FIRST, then readiness
      if (phase2TurnCount <= 1) {
        return { chips: [CHIP_KEYS.AFFORDABILITY_CALCULATOR, CHIP_KEYS.BUYER_READINESS, suppressBrowseGuides ? CHIP_KEYS.TALK_WITH_KASANDRA : CHIP_KEYS.BROWSE_GUIDES], phase: 2, escalated: false };
      }
      if (phase2TurnCount === 2) {
        // Turn 2: neighborhood tools + off-market
        return { chips: [CHIP_KEYS.COMPARE_NEIGHBORHOODS, CHIP_KEYS.FIND_OFF_MARKET, CHIP_KEYS.ESTIMATE_CLOSING_COSTS], phase: 2, escalated: false };
      }
      // Turn 3+: progress toward decision
      return { chips: [CHIP_KEYS.BUYER_READINESS_CHECK, CHIP_KEYS.FIND_OFF_MARKET, CHIP_KEYS.TALK_WITH_KASANDRA], phase: 2, escalated: false };
    }
  }

  // PHASE 1: Intent unknown — semantic keys for deterministic routing
  const chips = [CHIP_KEYS.INTENT_SELL, CHIP_KEYS.INTENT_BUY, CHIP_KEYS.INTENT_EXPLORE];
  return { chips, phase: 1, escalated: false };
}

/**
 * Semantic chip keys — server-side mirror of src/lib/registry/chipKeys.ts
 * Used for deterministic chip→destination resolution.
 */
export const CHIP_KEYS = {
  TALK_WITH_KASANDRA: 'talk_with_kasandra',
  FIND_A_TIME: 'find_a_time',
  ESTIMATE_PROCEEDS: 'estimate_proceeds',
  COMPARE_CASH_LISTING: 'compare_cash_listing',
  GET_SELLING_OPTIONS: 'get_selling_options',
  BUYER_READINESS: 'buyer_readiness',
  BUYER_READINESS_SHORT: 'buyer_readiness_short',
  BUYER_READINESS_CHECK: 'buyer_readiness_check',
  START_NOW: 'start_now',
  CASH_READINESS: 'cash_readiness',
  SELLER_READINESS: 'seller_readiness',
  BROWSE_GUIDES: 'browse_guides',
  BROWSE_BUYER_GUIDES: 'browse_buyer_guides',
  SELLING_GUIDES: 'selling_guides',
  BUILD_SELLING_TIMELINE: 'build_selling_timeline',
  FIND_OFF_MARKET: 'find_off_market',
  GET_OFF_MARKET_ACCESS: 'get_off_market_access',
  COMPARE_NEIGHBORHOODS: 'compare_neighborhoods',
  ESTIMATE_CLOSING_COSTS: 'estimate_closing_costs',
  TUCSON_MARKET_DATA: 'tucson_market_data',
  EXPLORE_NEIGHBORHOODS: 'explore_neighborhoods',
  GUIDE_CASH_VS_LISTING: 'guide_cash_vs_listing',
  GUIDE_FTB: 'guide_ftb',
  GUIDE_FTB_VIEW: 'guide_ftb_view',
  GUIDE_SELLING_TOP_DOLLAR: 'guide_selling_top_dollar',
  GUIDE_MILITARY: 'guide_military',
  GUIDE_DIVORCE: 'guide_divorce',
  GUIDE_SENIOR: 'guide_senior',
  GUIDE_NEIGHBORHOODS: 'guide_neighborhoods',
  GUIDE_RELOCATION: 'guide_relocation',
  GUIDE_PRICING: 'guide_pricing',
  GUIDE_COST_TO_SELL: 'guide_cost_to_sell',
  GUIDE_CAPITAL_GAINS: 'guide_capital_gains',
  GUIDE_SELL_OR_RENT: 'guide_sell_or_rent',
  GUIDE_HOW_LONG: 'guide_how_long',
  GUIDE_FTB_PROGRAMS: 'guide_ftb_programs',
  GUIDE_SUBURB_COMPARE: 'guide_suburb_compare',
  GUIDE_NONCITIZEN: 'guide_noncitizen',
  GUIDE_GLOSSARY: 'guide_glossary',
  LEGACY_HOME_WORTH: 'legacy_home_worth',
  LEGACY_CASH_VS_TRADITIONAL: 'legacy_cash_vs_traditional',
  LEGACY_CASH_VS_VENTA_TRADICIONAL: 'legacy_cash_vs_venta_tradicional',
  ESTIMATE_NET_PROCEEDS_CAPS: 'estimate_net_proceeds_caps',
  // Phase 1 intent declaration chips
  INTENT_SELL: 'intent_sell',
  INTENT_BUY: 'intent_buy',
  INTENT_EXPLORE: 'intent_explore',
  // New tools (March 2026 connection pass)
  AFFORDABILITY_CALCULATOR: 'affordability_calculator',
  BAH_CALCULATOR: 'bah_calculator',
  HOME_VALUATION: 'home_valuation',
} as const;

/** Semantic chip key → destination path */
export const CHIP_KEY_DESTINATION: Record<string, string> = {
  [CHIP_KEYS.TALK_WITH_KASANDRA]: '/book',
  [CHIP_KEYS.FIND_A_TIME]: '/book',
  [CHIP_KEYS.ESTIMATE_PROCEEDS]: '/cash-offer-options',
  [CHIP_KEYS.COMPARE_CASH_LISTING]: '/cash-offer-options',
  [CHIP_KEYS.GET_SELLING_OPTIONS]: '/seller-decision',
  [CHIP_KEYS.BUYER_READINESS]: '/buyer-readiness',
  [CHIP_KEYS.BUYER_READINESS_SHORT]: '/buyer-readiness',
  [CHIP_KEYS.BUYER_READINESS_CHECK]: '/buyer-readiness',
  [CHIP_KEYS.START_NOW]: '/buyer-readiness',
  [CHIP_KEYS.CASH_READINESS]: '/cash-readiness',
  [CHIP_KEYS.SELLER_READINESS]: '/seller-readiness',
  [CHIP_KEYS.BROWSE_GUIDES]: '/guides',
  [CHIP_KEYS.BROWSE_BUYER_GUIDES]: '/guides',
  [CHIP_KEYS.SELLING_GUIDES]: '/guides',
  [CHIP_KEYS.BUILD_SELLING_TIMELINE]: '/seller-timeline',
  [CHIP_KEYS.FIND_OFF_MARKET]: '/off-market',
  [CHIP_KEYS.GET_OFF_MARKET_ACCESS]: '/off-market',
  [CHIP_KEYS.COMPARE_NEIGHBORHOODS]: '/neighborhood-compare',
  [CHIP_KEYS.ESTIMATE_CLOSING_COSTS]: '/buyer-closing-costs',
  [CHIP_KEYS.TUCSON_MARKET_DATA]: '/market',
  [CHIP_KEYS.EXPLORE_NEIGHBORHOODS]: '/buy',
  [CHIP_KEYS.GUIDE_CASH_VS_LISTING]: '/guides/cash-vs-traditional-sale',
  [CHIP_KEYS.GUIDE_FTB]: '/guides/first-time-buyer-guide',
  [CHIP_KEYS.GUIDE_FTB_VIEW]: '/guides/first-time-buyer-guide',
  [CHIP_KEYS.GUIDE_SELLING_TOP_DOLLAR]: '/guides/selling-for-top-dollar',
  [CHIP_KEYS.GUIDE_MILITARY]: '/guides/military-pcs-guide',
  [CHIP_KEYS.GUIDE_DIVORCE]: '/guides/divorce-selling',
  [CHIP_KEYS.GUIDE_SENIOR]: '/guides/senior-downsizing',
  [CHIP_KEYS.GUIDE_NEIGHBORHOODS]: '/guides/tucson-neighborhoods',
  [CHIP_KEYS.GUIDE_RELOCATION]: '/guides/relocating-to-tucson',
  [CHIP_KEYS.GUIDE_PRICING]: '/guides/pricing-strategy',
  [CHIP_KEYS.GUIDE_COST_TO_SELL]: '/guides/cost-to-sell-tucson',
  [CHIP_KEYS.GUIDE_CAPITAL_GAINS]: '/guides/capital-gains-home-sale-arizona',
  [CHIP_KEYS.GUIDE_SELL_OR_RENT]: '/guides/sell-or-rent-tucson',
  [CHIP_KEYS.GUIDE_HOW_LONG]: '/guides/how-long-to-sell-tucson',
  [CHIP_KEYS.GUIDE_FTB_PROGRAMS]: '/guides/arizona-first-time-buyer-programs',
  [CHIP_KEYS.GUIDE_SUBURB_COMPARE]: '/guides/tucson-suburb-comparison',
  [CHIP_KEYS.GUIDE_NONCITIZEN]: '/guides/buying-home-noncitizen-arizona',
  [CHIP_KEYS.GUIDE_GLOSSARY]: '/guides/arizona-real-estate-glossary',
  [CHIP_KEYS.LEGACY_HOME_WORTH]: '/seller-decision',
  [CHIP_KEYS.LEGACY_CASH_VS_TRADITIONAL]: '/cash-offer-options',
  [CHIP_KEYS.LEGACY_CASH_VS_VENTA_TRADICIONAL]: '/cash-offer-options',
  [CHIP_KEYS.ESTIMATE_NET_PROCEEDS_CAPS]: '/cash-offer-options',
  // Phase 1 intent declaration chips
  [CHIP_KEYS.INTENT_SELL]: '/seller-decision',
  [CHIP_KEYS.INTENT_BUY]: '/buyer-readiness',
  [CHIP_KEYS.INTENT_EXPLORE]: '/guides',
  // New tools (March 2026 connection pass)
  [CHIP_KEYS.AFFORDABILITY_CALCULATOR]: '/affordability-calculator',
  [CHIP_KEYS.BAH_CALCULATOR]: '/bah-calculator',
  [CHIP_KEYS.HOME_VALUATION]: '/home-valuation',
};

/**
 * Legacy display-string → destination map.
 * Kept for backward compatibility: when the LLM emits a display string instead of a semantic key,
 * this map resolves it. The client-side dual lookup handles the same via normalized text.
 */
export const CHIP_DESTINATION: Record<string, string> = {
  // EN chips — core actions
  'Take the readiness check': '/buyer-readiness',
  'Take the buyer readiness check': '/buyer-readiness',
  'Take the seller readiness check': '/seller-readiness',
  'Browse guides': '/guides',
  'Take the cash readiness check': '/cash-readiness',
  'Compare cash vs. listing': '/cash-offer-options',
  'Compare cash vs listing': '/cash-offer-options',
  'Get my selling options': '/seller-decision',
  'Quick seller readiness check': '/seller-readiness',
  'Estimate my net proceeds': '/cash-offer-options',
  'Find off-market homes': '/off-market',
  'Get off-market access': '/off-market',
  'Browse buyer guides': '/guides',
  'Selling Guides': '/guides',
  'Explore neighborhoods': '/buy',
  'View market intelligence': '/market',
  // EN chips — guides
  'First-Time Buyer Guide': '/guides/first-time-buyer-guide',
  'View first-time buyer guide': '/guides/first-time-buyer-guide',
  'Cash vs. Listing Guide': '/guides/cash-vs-traditional-sale',
  'Selling for Top Dollar Guide': '/guides/selling-for-top-dollar',
  'Military & VA guide': '/guides/military-pcs-guide',
  'Selling during divorce': '/guides/divorce-selling',
  'Downsizing guide': '/guides/senior-downsizing',
  'Relocating to Tucson guide': '/guides/relocating-to-tucson',
  'How to price my home': '/guides/pricing-strategy',
  'Explore Tucson neighborhoods': '/buy',
  'Estimate Net Proceeds': '/cash-offer-options',
  'Compare cash vs. traditional': '/cash-offer-options',
  'Compare cash vs. traditional sale': '/cash-offer-options',
  'Cost to Sell Guide': '/guides/cost-to-sell-tucson',
  'AZ Real Estate Glossary': '/guides/arizona-real-estate-glossary',
  'Tucson Suburb Comparison': '/guides/tucson-suburb-comparison',
  'First-Time Buyer Programs': '/guides/arizona-first-time-buyer-programs',
  'Capital Gains Guide': '/guides/capital-gains-home-sale-arizona',
  'Sell or Rent Guide': '/guides/sell-or-rent-tucson',
  'How Long to Sell Guide': '/guides/how-long-to-sell-tucson',
  'Non-Citizen Buyers': '/guides/buying-home-noncitizen-arizona',
  'Check my readiness': '/buyer-readiness',
  'Take readiness check': '/buyer-readiness',
  'Start now': '/buyer-readiness',
  'Find a time with Kasandra': '/book',
  'Tucson Market Data': '/market',
  'Compare Neighborhoods': '/neighborhood-compare',
  'Estimate Closing Costs': '/buyer-closing-costs',
  'Talk with Kasandra': '/book',

  // EN fuzzy aliases — common LLM variations
  'Take a readiness check': '/buyer-readiness',
  'Use the seller net calculator': '/cash-offer-options',
  'Use the net proceeds estimator': '/cash-offer-options',
  'Open the calculator': '/cash-offer-options',
  'See the calculator': '/cash-offer-options',
  'Run the numbers': '/cash-offer-options',
  'Talk to Kasandra': '/book',
  'Speak with Kasandra': '/book',
  'Schedule with Kasandra': '/book',
  'Book a call': '/book',
  'Book a consultation': '/book',

  // ES chips — core actions (parity with EN)
  'Tomar la evaluación de preparación': '/buyer-readiness',
  'Evaluación de preparación del comprador': '/buyer-readiness',
  'Evaluación de preparación del vendedor': '/seller-readiness',
  'Explorar guías': '/guides',
  'Tomar el check de preparación en efectivo': '/cash-readiness',
  'Encontrar casas fuera del mercado': '/off-market',
  'Obtener acceso fuera del mercado': '/off-market',
  'Comparar efectivo vs. listado': '/cash-offer-options',
  'Comparar efectivo vs listado': '/cash-offer-options',
  'Ver mis opciones de venta': '/seller-decision',
  'Check rápido de preparación para vender': '/seller-readiness',
  'Estimar mis ganancias netas': '/cash-offer-options',
  'Explorar vecindarios': '/buy',
  'Ver inteligencia del mercado': '/market',
  'Hablar con Kasandra': '/book',
  'Encontrar un horario con Kasandra': '/book',
  // ES chips — guides
  'Guía de Costos de Venta': '/guides/cost-to-sell-tucson',
  'Glosario de Bienes Raíces': '/guides/arizona-real-estate-glossary',
  'Comparación de Suburbios': '/guides/tucson-suburb-comparison',
  'Programas para Compradores': '/guides/arizona-first-time-buyer-programs',
  'Guía de Ganancias de Capital': '/guides/capital-gains-home-sale-arizona',
  'Guía Vender o Rentar': '/guides/sell-or-rent-tucson',
  'Cuánto Tarda Vender': '/guides/how-long-to-sell-tucson',
  'Guía para No Ciudadanos': '/guides/buying-home-noncitizen-arizona',
  'Datos del Mercado Tucson': '/market',
  'Comparar Vecindarios': '/neighborhood-compare',
  'Estimar Costos de Cierre': '/buyer-closing-costs',
  // ES fuzzy aliases
  'Agendar con Kasandra': '/book',
  'Reservar una consulta': '/book',
  'Abrir la calculadora': '/cash-offer-options',
  'Ver la calculadora': '/cash-offer-options',

  // New tools — EN (March 2026 connection pass)
  'Check my buying power': '/affordability-calculator',
  'Check buying power': '/affordability-calculator',
  'Affordability calculator': '/affordability-calculator',
  'BAH buying power': '/bah-calculator',
  'Calculate BAH buying power': '/bah-calculator',
  'BAH calculator': '/bah-calculator',
  'Get my market analysis': '/home-valuation',
  'Home valuation': '/home-valuation',
  "What's my home worth?": '/home-valuation',
  'How much is my home worth?': '/home-valuation',

  // New tools — ES (March 2026 connection pass)
  'Verificar poder de compra': '/affordability-calculator',
  'Calculadora de asequibilidad': '/affordability-calculator',
  'Poder de compra BAH': '/bah-calculator',
  'Calculadora BAH': '/bah-calculator',
  'Obtener mi análisis': '/home-valuation',
  'Valuación de mi casa': '/home-valuation',
  '¿Cuánto vale mi casa?': '/home-valuation',
};

// Tool ID → destination paths it blocks (the routes the tool lives on)
export const TOOL_BLOCKED_DESTINATIONS: Record<string, string[]> = {
  'buyer_readiness': ['/buyer-readiness'],
  'seller_readiness': ['/seller-readiness'],
  'cash_readiness': ['/cash-readiness'],
  'tucson_alpha_calculator': ['/cash-offer-options'],
  'seller_decision': ['/seller-decision'],
  'off_market_buyer': ['/off-market'],
  // Tool name aliases → same as tucson_alpha_calculator
  'Seller Net Calculator': ['/cash-offer-options'],
  'Net Proceeds Estimator': ['/cash-offer-options'],
  'Use the calculator': ['/cash-offer-options'],
  'Run the calculator': ['/cash-offer-options'],
};

// Replacement destinations when a tool is completed — ordered by progression
const TOOL_REPLACEMENT_DESTINATION: Record<string, string> = {
  'buyer_readiness': '/guides',
  'seller_readiness': '/cash-offer-options',
  'cash_readiness': '/cash-offer-options',
  'tucson_alpha_calculator': '/book',
  'seller_decision': '/book',
  'off_market_buyer': '/guides',
};

// Reverse lookup: destination → semantic chip key
export const DESTINATION_TO_CHIP_KEY: Record<string, string> = {
  '/guides': CHIP_KEYS.BROWSE_GUIDES,
  '/buyer-readiness': CHIP_KEYS.BUYER_READINESS,
  '/seller-readiness': CHIP_KEYS.SELLER_READINESS,
  '/cash-readiness': CHIP_KEYS.CASH_READINESS,
  '/off-market': CHIP_KEYS.FIND_OFF_MARKET,
  '/cash-offer-options': CHIP_KEYS.ESTIMATE_PROCEEDS,
  '/book': CHIP_KEYS.TALK_WITH_KASANDRA,
  '/seller-decision': CHIP_KEYS.GET_SELLING_OPTIONS,
  // New tools (March 2026 connection pass)
  '/affordability-calculator': CHIP_KEYS.AFFORDABILITY_CALCULATOR,
  '/bah-calculator': CHIP_KEYS.BAH_CALCULATOR,
  '/home-valuation': CHIP_KEYS.HOME_VALUATION,
};

// Legacy reverse lookup (kept for display-string resolution in filterChipsForCompletedTools)
export const DESTINATION_TO_CHIP: Record<string, { en: string; es: string }> = {
  '/guides': { en: 'Browse guides', es: 'Explorar guías' },
  '/buyer-readiness': { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' },
  '/seller-readiness': { en: 'Quick seller readiness check', es: 'Check rápido de preparación para vender' },
  '/cash-readiness': { en: 'Take the cash readiness check', es: 'Tomar el check de preparación en efectivo' },
  '/off-market': { en: 'Find off-market homes', es: 'Encontrar casas fuera del mercado' },
  '/cash-offer-options': { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
  '/book': { en: 'Talk with Kasandra', es: 'Hablar con Kasandra' },
  '/seller-decision': { en: 'Get my selling options', es: 'Ver mis opciones de venta' },
  // New tools (March 2026 connection pass)
  '/affordability-calculator': { en: 'Check my buying power', es: 'Verificar poder de compra' },
  '/bah-calculator': { en: 'BAH buying power', es: 'Poder de compra BAH' },
  '/home-valuation': { en: 'Get my market analysis', es: 'Obtener mi análisis' },
};

export const GUIDE_DELIVERY_AFFIRMATIVE = /^(yes|sure|yeah|yep|ok|okay|please|show me|tell me more|sí|si|claro|por favor|muéstrame|muestrame)$/i;
export const GUIDE_MENTION_PATTERN = /\b(guide|guides|guía|guia|guías|guias)\b/i;

const GUIDE_ID_TO_CHIP_KEY: Record<string, string> = {
  'first-time-buyer-guide': CHIP_KEYS.GUIDE_FTB,
  'cash-vs-traditional-sale': CHIP_KEYS.GUIDE_CASH_VS_LISTING,
  'selling-for-top-dollar': CHIP_KEYS.GUIDE_SELLING_TOP_DOLLAR,
  'military-pcs-guide': CHIP_KEYS.GUIDE_MILITARY,
  'divorce-selling': CHIP_KEYS.GUIDE_DIVORCE,
  'senior-downsizing': CHIP_KEYS.GUIDE_SENIOR,
  'tucson-neighborhoods': CHIP_KEYS.GUIDE_NEIGHBORHOODS,
  'relocating-to-tucson': CHIP_KEYS.GUIDE_RELOCATION,
  'pricing-strategy': CHIP_KEYS.GUIDE_PRICING,
  'cost-to-sell-tucson': CHIP_KEYS.GUIDE_COST_TO_SELL,
  'capital-gains-home-sale-arizona': CHIP_KEYS.GUIDE_CAPITAL_GAINS,
  'sell-or-rent-tucson': CHIP_KEYS.GUIDE_SELL_OR_RENT,
  'how-long-to-sell-tucson': CHIP_KEYS.GUIDE_HOW_LONG,
  'arizona-first-time-buyer-programs': CHIP_KEYS.GUIDE_FTB_PROGRAMS,
  'tucson-suburb-comparison': CHIP_KEYS.GUIDE_SUBURB_COMPARE,
  'buying-home-noncitizen-arizona': CHIP_KEYS.GUIDE_NONCITIZEN,
  'arizona-real-estate-glossary': CHIP_KEYS.GUIDE_GLOSSARY,
};

export function detectGuideChipForDelivery(lastAssistantMessage: string, context: ChatRequest["context"]): string {
  const lastGuideId = context.last_guide_id;
  if (lastGuideId && GUIDE_ID_TO_CHIP_KEY[lastGuideId]) {
    return GUIDE_ID_TO_CHIP_KEY[lastGuideId];
  }

  const lower = lastAssistantMessage.toLowerCase();
  if (/first.?time buyer|primer.*comprador/.test(lower)) return CHIP_KEYS.GUIDE_FTB;
  if (/cash\s*vs|efectivo\s*vs/.test(lower)) return CHIP_KEYS.GUIDE_CASH_VS_LISTING;
  if (/top dollar|mejor precio/.test(lower)) return CHIP_KEYS.GUIDE_SELLING_TOP_DOLLAR;
  if (/military|va|militar/.test(lower)) return CHIP_KEYS.GUIDE_MILITARY;
  if (/divorce|divorcio/.test(lower)) return CHIP_KEYS.GUIDE_DIVORCE;
  if (/downsizing|jubil|adulto mayor/.test(lower)) return CHIP_KEYS.GUIDE_SENIOR;
  if (/non.?citizen|no ciudadano/.test(lower)) return CHIP_KEYS.GUIDE_NONCITIZEN;
  if (/capital gains|ganancias de capital/.test(lower)) return CHIP_KEYS.GUIDE_CAPITAL_GAINS;

  return CHIP_KEYS.BROWSE_GUIDES;
}

export interface ChipSuppressionEvent {
  tool_id: string;
  chip_label: string;
  destination: string;
  reason: 'completed';
}

export function filterChipsForCompletedTools(
  chips: string[],
  toolsCompleted: string[],
  language: 'en' | 'es',
  hasEarnedBooking: boolean,
): { filtered: string[]; suppressions: ChipSuppressionEvent[] } {
  if (!toolsCompleted?.length) return { filtered: chips, suppressions: [] };

  // Build set of blocked destinations from completed tools
  const blockedDests = new Set<string>();
  for (const toolId of toolsCompleted) {
    const dests = TOOL_BLOCKED_DESTINATIONS[toolId];
    if (dests) dests.forEach(d => blockedDests.add(d));
  }

  const suppressions: ChipSuppressionEvent[] = [];
  const filtered: string[] = [];

  for (const chip of chips) {
    // Dual lookup: try semantic key first, then display string
    const dest = CHIP_KEY_DESTINATION[chip] || CHIP_DESTINATION[chip];
    if (dest && blockedDests.has(dest)) {
      const blockingTool = toolsCompleted.find(tid =>
        TOOL_BLOCKED_DESTINATIONS[tid]?.includes(dest)
      );
      suppressions.push({
        tool_id: blockingTool || 'unknown',
        chip_label: chip,
        destination: dest,
        reason: 'completed',
      });
      continue;
    }
    filtered.push(chip);
  }

  // Add replacement chips for suppressed tools — emit semantic keys
  const existingDests = new Set(filtered.map(c => CHIP_KEY_DESTINATION[c] || CHIP_DESTINATION[c]).filter(Boolean));
  for (const toolId of toolsCompleted) {
    const replacementDest = TOOL_REPLACEMENT_DESTINATION[toolId];
    if (!replacementDest) continue;
    if (blockedDests.has(replacementDest)) continue;
    if (existingDests.has(replacementDest)) continue;
    if (filtered.length >= 3) break;

    // Emit semantic key for replacement chip
    const replacementKey = DESTINATION_TO_CHIP_KEY[replacementDest];
    if (!replacementKey) continue;

    // Booking chips require earned access
    if (replacementDest === '/book' && !hasEarnedBooking) continue;

    filtered.push(replacementKey);
    existingDests.add(replacementDest);
  }

  // Fallback: emit semantic key
  if (filtered.length === 0) {
    filtered.push(CHIP_KEYS.BROWSE_GUIDES);
  }

  return { filtered, suppressions };
}

// ============= PROGRESSION MAP =============
// Maps user selection to next-best-step suggestions
// Now cleaned of premature booking language for early stages
export const PROGRESSION_MAP: Record<string, { en: string[]; es: string[] }> = {
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
    "get my selling options": {
      en: ["Compare cash vs. listing", "Quick seller readiness check", "Talk with Kasandra"],
      es: ["Comparar efectivo vs. listado", "Check rápido de preparación para vender", "Hablar con Kasandra"]
    },
    'compare cash vs. listing': {
      en: ["Estimate my net proceeds", "Quick seller readiness check", "Talk with Kasandra"],
      es: ["Estimar mis ganancias netas", "Check rápido de preparación para vender", "Hablar con Kasandra"]
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
    en: ["Check my buying power", "Take readiness check", "View first-time buyer guide"],
    es: ["Verificar poder de compra", "Tomar evaluación de preparación", "Ver guía para compradores"]
  },
  'just exploring': {
    en: ["Tell me about selling", "Tell me about buying", "What are my options?"],
    es: ["Cuéntame sobre vender", "Cuéntame sobre comprar", "¿Cuáles son mis opciones?"]
  },
  // FIX-SIM-07: Investor / landlord / flip path progressions
  "i'm an investor": {
    en: ["Sell or keep as rental?", "View Tucson market data", "Talk with Kasandra"],
    es: ["¿Vender o mantener como renta?", "Ver datos del mercado en Tucson", "Hablar con Kasandra"]
  },
  "i'm looking at investment properties": {
    en: ["Analyze rental yield", "Compare neighborhoods", "Get off-market access"],
    es: ["Analizar rendimiento de renta", "Comparar vecindarios", "Acceder a propiedades fuera del mercado"]
  },
  "rental property": {
    en: ["Sell or keep as rental?", "Estimate cash flow", "Talk with Kasandra"],
    es: ["¿Vender o mantener como renta?", "Estimar flujo de caja", "Hablar con Kasandra"]
  },
  "flip": {
    en: ["View Tucson market data", "Get off-market access", "Talk with Kasandra"],
    es: ["Ver datos del mercado en Tucson", "Acceder a propiedades fuera del mercado", "Hablar con Kasandra"]
  },
  "cap rate": {
    en: ["Talk with Kasandra", "View market data", "Get off-market access"],
    es: ["Hablar con Kasandra", "Ver datos del mercado", "Acceder a propiedades fuera del mercado"]
  },
  "sell or rent": {
    en: ["View sell-or-rent guide", "Estimate net proceeds", "Talk with Kasandra"],
    es: ["Ver guía vender o rentar", "Estimar ganancias netas", "Hablar con Kasandra"]
  },
  // New tool progressions (March 2026 connection pass)
  "how much can i afford": {
    en: ["Check my buying power", "Take readiness check", "Browse guides"],
    es: ["Verificar poder de compra", "Tomar evaluación de preparación", "Explorar guías"]
  },
  "how much house can i afford": {
    en: ["Check my buying power", "Take readiness check", "Browse guides"],
    es: ["Verificar poder de compra", "Tomar evaluación de preparación", "Explorar guías"]
  },
  "can i afford": {
    en: ["Check my buying power", "Take readiness check", "Browse guides"],
    es: ["Verificar poder de compra", "Tomar evaluación de preparación", "Explorar guías"]
  },
  "cuanto puedo pagar": {
    en: ["Check my buying power", "Take readiness check", "Browse guides"],
    es: ["Verificar poder de compra", "Tomar evaluación de preparación", "Explorar guías"]
  },
  "what is my home worth": {
    en: ["Get my market analysis", "Get my selling options", "Compare cash vs. listing"],
    es: ["Obtener mi análisis", "Ver mis opciones de venta", "Comparar efectivo vs. listado"]
  },
  "what's my home worth": {
    en: ["Get my market analysis", "Get my selling options", "Compare cash vs. listing"],
    es: ["Obtener mi análisis", "Ver mis opciones de venta", "Comparar efectivo vs. listado"]
  },
  "home value before i sell": {
    en: ["Get my market analysis", "Get my selling options", "Compare cash vs. listing"],
    es: ["Obtener mi análisis", "Ver mis opciones de venta", "Comparar efectivo vs. listado"]
  },
  "cuanto vale mi casa": {
    en: ["Get my market analysis", "Get my selling options", "Compare cash vs. listing"],
    es: ["Obtener mi análisis", "Ver mis opciones de venta", "Comparar efectivo vs. listado"]
  },
  "bah": {
    en: ["BAH buying power", "Military & VA guide", "Take readiness check"],
    es: ["Poder de compra BAH", "Guía militar y VA", "Tomar evaluación de preparación"]
  },
  "pcs": {
    en: ["BAH buying power", "Military & VA guide", "Browse guides"],
    es: ["Poder de compra BAH", "Guía militar y VA", "Explorar guías"]
  },
  "davis-monthan": {
    en: ["BAH buying power", "Military & VA guide", "Explore neighborhoods"],
    es: ["Poder de compra BAH", "Guía militar y VA", "Explorar vecindarios"]
  },
  "affordability": {
    en: ["Check my buying power", "Take readiness check", "Browse buyer guides"],
    es: ["Verificar poder de compra", "Tomar evaluación de preparación", "Explorar guías"]
  },
  "home value": {
    en: ["Get my market analysis", "Get my selling options", "Talk with Kasandra"],
    es: ["Obtener mi análisis", "Ver mis opciones de venta", "Hablar con Kasandra"]
  }
};

// ============= INTENT-AWARE SUGGESTION FILTERING =============
type IntentKey = 'sell' | 'cash' | 'buy' | 'explore' | 'invest';

export function getSuggestedReplies(
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
      en: ["Get my selling options", "Compare cash vs. listing", "Quick seller readiness check"],
      es: ["Ver mis opciones de venta", "Comparar efectivo vs. listado", "Check rápido de preparación para vender"]
    },
    cash: {
      en: ["Compare cash vs. listing", "Quick seller readiness check", "Estimate my net proceeds"],
      es: ["Comparar efectivo vs. listado", "Check rápido de preparación para vender", "Estimar mis ganancias netas"]
    },
    buy: {
      en: ["Take readiness check", "View first-time buyer guide", "What should I prepare?"],
      es: ["Tomar evaluación de preparación", "Ver guía para compradores", "¿Qué debo preparar?"]
    },
    // FIX-SIM-08: Investor reply suggestions
    invest: {
      en: ["Sell or keep as rental?", "View Tucson market data", "Talk with Kasandra"],
      es: ["¿Vender o mantener como renta?", "Ver datos del mercado en Tucson", "Hablar con Kasandra"]
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
                             : intent === 'invest' ? 'invest'
                             : 'explore';
  
  let suggestions = [...staticReplies[intentKey][language]];
  
  // Step 3: Filter out any suggestion similar to user's last message
  if (lastUserMessage) {
    suggestions = suggestions.filter(s => !isSimilar(s, lastUserMessage, 0.7));
  }
  
  return suggestions;
}
