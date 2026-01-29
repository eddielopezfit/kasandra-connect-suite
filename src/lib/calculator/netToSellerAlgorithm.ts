/**
 * Net-to-Seller Algorithm for Tucson Real Estate
 * Pure calculation functions - no React, no side effects
 * 
 * Tucson Market Specific Constants:
 * - 4.2% annual appreciation rate
 * - $25/day holding cost average
 */

// ============= Market Constants =============

export const TUCSON_MARKET = {
  /** Annual appreciation rate for Tucson market */
  appreciationRate: 0.042,
  /** Daily holding cost (utilities, insurance, taxes, maintenance avg) */
  holdingCostPerDay: 25,
  /** Traditional listing commission rate */
  traditionalCommission: 0.06,
  /** Traditional closing costs (title, escrow, etc.) */
  traditionalClosingCosts: 0.02,
  /** Cash offer discount from market value */
  cashDiscountRate: 0.12,
  /** Typical cash closing timeline (days) */
  cashClosingDays: 10,
  /** Typical traditional closing timeline (days) */
  traditionalClosingDays: 45,
} as const;

// ============= Type Definitions =============

export type Motivation = 'speed' | 'maximize' | 'uncertain';
export type Timeline = 'asap' | '30days' | '60days' | 'flexible';

export interface CalculatorInputs {
  /** Estimated market value of the property */
  estimatedValue: number;
  /** Optional: remaining mortgage balance */
  mortgageBalance?: number;
  /** User's primary motivation for selling */
  motivation: Motivation;
  /** Desired timeline to sell */
  timeline: Timeline;
  /** Optional: estimated repair costs needed */
  repairEstimate?: number;
}

export interface PathBreakdown {
  /** Starting market value or offer */
  grossAmount: number;
  /** Commission fees (traditional only) */
  commission: number;
  /** Closing costs */
  closingCosts: number;
  /** Holding costs during the sale period */
  holdingCost: number;
  /** Total net proceeds after all deductions */
  netProceeds: number;
  /** Days until closing */
  daysToClose: number;
  /** Equity after mortgage (if provided) */
  equityAfterMortgage?: number;
}

export interface CostOfTime {
  /** Net difference between traditional and cash */
  netDifference: number;
  /** Days saved by choosing cash */
  daysSaved: number;
  /** Dollar value per day of choosing speed */
  dailyValueOfSpeed: number;
  /** Is the "cost" actually a gain (cash nets more)? */
  cashNetsMore: boolean;
}

export interface CalculatorResults {
  /** Traditional listing path breakdown */
  traditional: PathBreakdown;
  /** Cash offer path breakdown */
  cash: PathBreakdown;
  /** Cost of time analysis */
  costOfTime: CostOfTime;
  /** Recommended path based on inputs */
  recommendation: 'cash' | 'traditional' | 'consult';
  /** Should this trigger a priority handoff? */
  shouldTriggerHandoff: boolean;
  /** Human-readable recommendation reason */
  recommendationReason: {
    en: string;
    es: string;
  };
}

// ============= Core Calculation Functions =============

/**
 * Calculate net proceeds for a traditional listing
 */
export function calculateTraditionalNet(
  estimatedValue: number,
  mortgageBalance: number = 0,
  repairEstimate: number = 0,
  daysOnMarket: number = TUCSON_MARKET.traditionalClosingDays
): PathBreakdown {
  const grossAmount = estimatedValue;
  const commission = estimatedValue * TUCSON_MARKET.traditionalCommission;
  const closingCosts = estimatedValue * TUCSON_MARKET.traditionalClosingCosts;
  const holdingCost = daysOnMarket * TUCSON_MARKET.holdingCostPerDay;
  
  const netProceeds = grossAmount - commission - closingCosts - holdingCost - repairEstimate;
  const equityAfterMortgage = mortgageBalance > 0 
    ? netProceeds - mortgageBalance 
    : undefined;

  return {
    grossAmount,
    commission,
    closingCosts,
    holdingCost,
    netProceeds,
    daysToClose: daysOnMarket,
    equityAfterMortgage,
  };
}

/**
 * Calculate net proceeds for a cash offer
 */
export function calculateCashNet(
  estimatedValue: number,
  mortgageBalance: number = 0
): PathBreakdown {
  // Cash offers typically come at a discount
  const grossAmount = estimatedValue * (1 - TUCSON_MARKET.cashDiscountRate);
  const commission = 0; // No agent commission in direct cash sale
  const closingCosts = 0; // Cash buyers typically pay closing costs
  const holdingCost = TUCSON_MARKET.cashClosingDays * TUCSON_MARKET.holdingCostPerDay;
  
  const netProceeds = grossAmount - holdingCost;
  const equityAfterMortgage = mortgageBalance > 0 
    ? netProceeds - mortgageBalance 
    : undefined;

  return {
    grossAmount,
    commission,
    closingCosts,
    holdingCost,
    netProceeds,
    daysToClose: TUCSON_MARKET.cashClosingDays,
    equityAfterMortgage,
  };
}

/**
 * Calculate the "Cost of Time" - the daily value of speed
 */
export function calculateCostOfTime(
  traditionalNet: number,
  cashNet: number,
  traditionalDays: number,
  cashDays: number
): CostOfTime {
  const netDifference = traditionalNet - cashNet;
  const daysSaved = traditionalDays - cashDays;
  
  // Daily value of speed: what you "pay" per day for faster closing
  // If positive: traditional nets more, so each day saved "costs" this amount
  // If negative: cash actually nets more (rare edge case)
  const dailyValueOfSpeed = daysSaved > 0 ? netDifference / daysSaved : 0;
  const cashNetsMore = netDifference < 0;

  return {
    netDifference: Math.abs(netDifference),
    daysSaved,
    dailyValueOfSpeed: Math.abs(dailyValueOfSpeed),
    cashNetsMore,
  };
}

/**
 * Get days on market based on timeline selection
 */
function getTimelineDays(timeline: Timeline): number {
  switch (timeline) {
    case 'asap':
      return 30; // Aggressive pricing for fast sale
    case '30days':
      return 45; // Standard timeline
    case '60days':
      return 60; // More relaxed
    case 'flexible':
      return 90; // No rush, maximize exposure
    default:
      return 45;
  }
}

/**
 * Determine recommendation based on inputs and results
 */
function determineRecommendation(
  inputs: CalculatorInputs,
  costOfTime: CostOfTime
): { 
  recommendation: 'cash' | 'traditional' | 'consult';
  reason: { en: string; es: string };
} {
  const { motivation, timeline } = inputs;
  const { netDifference, dailyValueOfSpeed, cashNetsMore } = costOfTime;

  // If cash actually nets more, it's an easy choice
  if (cashNetsMore) {
    return {
      recommendation: 'cash',
      reason: {
        en: 'In your situation, a cash offer could actually net you more while closing faster.',
        es: 'En tu situación, una oferta en efectivo podría darte más dinero y cerrar más rápido.',
      },
    };
  }

  // Speed motivation + urgent timeline = cash recommended
  if (motivation === 'speed' && (timeline === 'asap' || timeline === '30days')) {
    return {
      recommendation: 'cash',
      reason: {
        en: 'Based on your need for speed, a cash offer may align better with your goals.',
        es: 'Basado en tu necesidad de rapidez, una oferta en efectivo puede alinearse mejor con tus metas.',
      },
    };
  }

  // Maximize motivation = traditional recommended
  if (motivation === 'maximize') {
    return {
      recommendation: 'traditional',
      reason: {
        en: 'If maximizing your proceeds is the priority, a traditional listing typically yields the highest net.',
        es: 'Si maximizar tus ganancias es la prioridad, una venta tradicional típicamente produce el mejor resultado neto.',
      },
    };
  }

  // Small difference (<$5k) = consult, could go either way
  if (netDifference < 5000) {
    return {
      recommendation: 'consult',
      reason: {
        en: 'The difference is close enough that your personal situation matters most. Let\'s talk through it.',
        es: 'La diferencia es lo suficientemente cercana que tu situación personal importa más. Hablemos sobre esto.',
      },
    };
  }

  // Uncertain motivation = consult
  if (motivation === 'uncertain') {
    return {
      recommendation: 'consult',
      reason: {
        en: 'There\'s no wrong answer here. Let\'s discuss what matters most to you.',
        es: 'No hay una respuesta incorrecta aquí. Hablemos sobre lo que más te importa.',
      },
    };
  }

  // Default: depends on cost of time vs perceived value
  if (dailyValueOfSpeed < 50) {
    // Low daily cost of speed - cash is reasonable
    return {
      recommendation: 'consult',
      reason: {
        en: 'The cost of choosing speed is modest. It depends on how valuable your time is.',
        es: 'El costo de elegir rapidez es modesto. Depende de cuánto valoras tu tiempo.',
      },
    };
  }

  return {
    recommendation: 'traditional',
    reason: {
      en: 'The traditional route may net you significantly more, but let\'s review your full situation.',
      es: 'La ruta tradicional puede darte significativamente más, pero revisemos tu situación completa.',
    },
  };
}

/**
 * Determine if this lead should trigger a priority handoff
 */
export function shouldTriggerPriorityHandoff(
  inputs: CalculatorInputs,
  results: CalculatorResults
): boolean {
  const { estimatedValue, motivation, timeline } = inputs;
  const { costOfTime } = results;

  // High-value property (>$500k)
  if (estimatedValue >= 500000) {
    return true;
  }

  // High urgency: speed motivation + ASAP timeline
  if (motivation === 'speed' && timeline === 'asap') {
    return true;
  }

  // Cash nearly as good as traditional (<$5k difference)
  if (costOfTime.netDifference < 5000) {
    return true;
  }

  return false;
}

// ============= Main Calculator Function =============

/**
 * Calculate full comparison between traditional and cash paths
 */
export function calculateNetToSellerComparison(inputs: CalculatorInputs): CalculatorResults {
  const { estimatedValue, mortgageBalance = 0, timeline, repairEstimate = 0 } = inputs;
  
  // Get days on market based on timeline
  const daysOnMarket = getTimelineDays(timeline);

  // Calculate both paths
  const traditional = calculateTraditionalNet(
    estimatedValue,
    mortgageBalance,
    repairEstimate,
    daysOnMarket
  );
  
  const cash = calculateCashNet(estimatedValue, mortgageBalance);

  // Calculate cost of time
  const costOfTime = calculateCostOfTime(
    traditional.netProceeds,
    cash.netProceeds,
    traditional.daysToClose,
    cash.daysToClose
  );

  // Determine recommendation
  const { recommendation, reason } = determineRecommendation(inputs, costOfTime);

  const results: CalculatorResults = {
    traditional,
    cash,
    costOfTime,
    recommendation,
    recommendationReason: reason,
    shouldTriggerHandoff: false, // Will be set below
  };

  // Check for priority handoff
  results.shouldTriggerHandoff = shouldTriggerPriorityHandoff(inputs, results);

  return results;
}

// ============= Utility Functions =============

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency for bilingual display
 */
export function formatCurrencyBilingual(amount: number, language: 'en' | 'es'): string {
  return new Intl.NumberFormat(language === 'es' ? 'es-US' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
