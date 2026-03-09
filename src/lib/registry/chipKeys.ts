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
} as const;

export type ChipKey = typeof CHIP_KEYS[keyof typeof CHIP_KEYS];

/**
 * Mapping from semantic chip key to destination path.
 * Used for validation in both client and server.
 */
export const CHIP_KEY_TO_DESTINATION: Record<ChipKey, string> = {
  [CHIP_KEYS.TALK_WITH_KASANDRA]: '/v2/book',
  [CHIP_KEYS.FIND_A_TIME]: '/v2/book',
  [CHIP_KEYS.ESTIMATE_PROCEEDS]: '/v2/cash-offer-options',
  [CHIP_KEYS.COMPARE_CASH_LISTING]: '/v2/cash-offer-options',
  [CHIP_KEYS.GET_SELLING_OPTIONS]: '/v2/seller-decision',

  [CHIP_KEYS.BUYER_READINESS]: '/v2/buyer-readiness',
  [CHIP_KEYS.BUYER_READINESS_SHORT]: '/v2/buyer-readiness',
  [CHIP_KEYS.BUYER_READINESS_CHECK]: '/v2/buyer-readiness',
  [CHIP_KEYS.START_NOW]: '/v2/buyer-readiness',
  [CHIP_KEYS.CASH_READINESS]: '/v2/cash-readiness',
  [CHIP_KEYS.SELLER_READINESS]: '/v2/seller-readiness',

  [CHIP_KEYS.BROWSE_GUIDES]: '/v2/guides',
  [CHIP_KEYS.BROWSE_BUYER_GUIDES]: '/v2/guides',
  [CHIP_KEYS.SELLING_GUIDES]: '/v2/guides',
  [CHIP_KEYS.BUILD_SELLING_TIMELINE]: '/v2/seller-timeline',
  [CHIP_KEYS.FIND_OFF_MARKET]: '/v2/off-market',
  [CHIP_KEYS.GET_OFF_MARKET_ACCESS]: '/v2/off-market',
  [CHIP_KEYS.COMPARE_NEIGHBORHOODS]: '/v2/neighborhood-compare',
  [CHIP_KEYS.ESTIMATE_CLOSING_COSTS]: '/v2/buyer-closing-costs',
  [CHIP_KEYS.TUCSON_MARKET_DATA]: '/v2/market',
  [CHIP_KEYS.EXPLORE_NEIGHBORHOODS]: '/v2/buy',

  // Conversational chips don't have destinations (text-only)
  [CHIP_KEYS.WHAT_ARE_MY_OPTIONS]: '',
  [CHIP_KEYS.I_HAVE_A_QUESTION]: '',
  [CHIP_KEYS.THINKING_ABOUT_SELLING]: '',
  [CHIP_KEYS.LOOKING_TO_BUY]: '',
  [CHIP_KEYS.JUST_EXPLORING]: '',

  // Guides
  [CHIP_KEYS.GUIDE_CASH_VS_LISTING]: '/v2/guides/cash-vs-traditional-sale',
  [CHIP_KEYS.GUIDE_FTB]: '/v2/guides/first-time-buyer-guide',
  [CHIP_KEYS.GUIDE_FTB_VIEW]: '/v2/guides/first-time-buyer-guide',
  [CHIP_KEYS.GUIDE_SELLING_TOP_DOLLAR]: '/v2/guides/selling-for-top-dollar',
  [CHIP_KEYS.GUIDE_MILITARY]: '/v2/guides/military-pcs-guide',
  [CHIP_KEYS.GUIDE_DIVORCE]: '/v2/guides/divorce-selling',
  [CHIP_KEYS.GUIDE_SENIOR]: '/v2/guides/senior-downsizing',
  [CHIP_KEYS.GUIDE_NEIGHBORHOODS]: '/v2/guides/tucson-neighborhoods',
  [CHIP_KEYS.GUIDE_RELOCATION]: '/v2/guides/relocating-to-tucson',
  [CHIP_KEYS.GUIDE_PRICING]: '/v2/guides/pricing-strategy',
  [CHIP_KEYS.GUIDE_COST_TO_SELL]: '/v2/guides/cost-to-sell-tucson',
  [CHIP_KEYS.GUIDE_CAPITAL_GAINS]: '/v2/guides/capital-gains-home-sale-arizona',
  [CHIP_KEYS.GUIDE_SELL_OR_RENT]: '/v2/guides/sell-or-rent-tucson',
  [CHIP_KEYS.GUIDE_HOW_LONG]: '/v2/guides/how-long-to-sell-tucson',
  [CHIP_KEYS.GUIDE_FTB_PROGRAMS]: '/v2/guides/arizona-first-time-buyer-programs',
  [CHIP_KEYS.GUIDE_SUBURB_COMPARE]: '/v2/guides/tucson-suburb-comparison',
  [CHIP_KEYS.GUIDE_NONCITIZEN]: '/v2/guides/buying-home-noncitizen-arizona',
  [CHIP_KEYS.GUIDE_GLOSSARY]: '/v2/guides/arizona-real-estate-glossary',

  // Legacy
  [CHIP_KEYS.LEGACY_HOME_WORTH]: '/v2/seller-decision',
  [CHIP_KEYS.LEGACY_CASH_VS_TRADITIONAL]: '/v2/cash-offer-options',
  [CHIP_KEYS.LEGACY_CASH_VS_VENTA_TRADICIONAL]: '/v2/cash-offer-options',
  [CHIP_KEYS.ESTIMATE_NET_PROCEEDS_CAPS]: '/v2/cash-offer-options',
};
