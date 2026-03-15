/**
 * Chip Keys — Single Source of Truth for Semantic Routing
 * 
 * These keys are used for deterministic routing across:
 * - Client-side chipGovernance.ts (blocked tools, phase-aware chips)
 * - Server-side journeyState.ts (journey state chips)
 * - Server-side index.ts (CHIP_DESTINATION validation)
 * 
 * Display labels (EN/ES) live in chipsRegistry.ts — this file contains ONLY semantic identifiers.
 */

export const CHIP_KEYS = {
  // === Core Journey Actions ===
  TALK_WITH_KASANDRA: 'talk_with_kasandra',
  FIND_A_TIME: 'find_a_time',
  ESTIMATE_PROCEEDS: 'estimate_proceeds',
  COMPARE_CASH_LISTING: 'compare_cash_listing',
  GET_SELLING_OPTIONS: 'get_selling_options',

  // === Readiness Tools ===
  BUYER_READINESS: 'buyer_readiness',
  BUYER_READINESS_SHORT: 'buyer_readiness_short',
  BUYER_READINESS_CHECK: 'buyer_readiness_check',
  START_NOW: 'start_now',
  CASH_READINESS: 'cash_readiness',
  SELLER_READINESS: 'seller_readiness',

  // === Navigation ===
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

  // === Conversational / Exploratory ===
  WHAT_ARE_MY_OPTIONS: 'what_are_my_options',
  I_HAVE_A_QUESTION: 'i_have_a_question',
  THINKING_ABOUT_SELLING: 'thinking_about_selling',
  LOOKING_TO_BUY: 'looking_to_buy',
  JUST_EXPLORING: 'just_exploring',

  // === Specific Guides ===
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

  // === Legacy / Fallbacks (for hallucination safety net) ===
  LEGACY_HOME_WORTH: 'legacy_home_worth',
  LEGACY_CASH_VS_TRADITIONAL: 'legacy_cash_vs_traditional',
  LEGACY_CASH_VS_VENTA_TRADICIONAL: 'legacy_cash_vs_venta_tradicional',
  ESTIMATE_NET_PROCEEDS_CAPS: 'estimate_net_proceeds_caps',

  // === Phase 1 Intent Declaration ===
  INTENT_SELL: 'intent_sell',
  INTENT_BUY: 'intent_buy',
  INTENT_EXPLORE: 'intent_explore',

  // === New Tools (Cleanup Pass) ===
  AFFORDABILITY_CALCULATOR: 'affordability_calculator',
  BAH_CALCULATOR: 'bah_calculator',
  HOME_VALUATION: 'home_valuation',
} as const;

export type ChipKey = typeof CHIP_KEYS[keyof typeof CHIP_KEYS];

/**
 * Mapping from semantic chip key to destination path.
 * Used for validation in both client and server.
 */
export const CHIP_KEY_TO_DESTINATION: Record<ChipKey, string> = {
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

  // Conversational chips don't have destinations (text-only)
  [CHIP_KEYS.WHAT_ARE_MY_OPTIONS]: '',
  [CHIP_KEYS.I_HAVE_A_QUESTION]: '',
  [CHIP_KEYS.THINKING_ABOUT_SELLING]: '',
  [CHIP_KEYS.LOOKING_TO_BUY]: '',
  [CHIP_KEYS.JUST_EXPLORING]: '',

  // Guides
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

  // Legacy
  [CHIP_KEYS.LEGACY_HOME_WORTH]: '/seller-decision',
  [CHIP_KEYS.LEGACY_CASH_VS_TRADITIONAL]: '/cash-offer-options',
  [CHIP_KEYS.LEGACY_CASH_VS_VENTA_TRADICIONAL]: '/cash-offer-options',
  [CHIP_KEYS.ESTIMATE_NET_PROCEEDS_CAPS]: '/cash-offer-options',

  // Phase 1 Intent Declaration
  [CHIP_KEYS.INTENT_SELL]: '/seller-decision',
  [CHIP_KEYS.INTENT_BUY]: '/buyer-readiness',
  [CHIP_KEYS.INTENT_EXPLORE]: '/guides',
};
