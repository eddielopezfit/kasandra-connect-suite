/**
 * Affordability Algorithm — Tucson Defaults
 * Pure function: no side effects, no imports
 *
 * Expanded: PMI logic, credit score tiers, payment breakdown
 */

export type CreditTier = 'excellent' | 'good' | 'fair' | 'below';

export interface AffordabilityBreakdown {
  principalInterest: number;
  propertyTax: number;
  insurance: number;
  pmi: number;
}

export interface AffordabilityResult {
  maxPrice: number;
  monthlyPayment: number;
  breakdown: AffordabilityBreakdown;
  dtiUsed: 'front' | 'back';
  effectiveRate: number;
  downPaymentAmount: number;
  loanAmount: number;
}

// Tucson-specific defaults
const PROPERTY_TAX_RATE = 0.011;
const ANNUAL_INSURANCE = 1200;
const BASE_INTEREST_RATE = 0.0625; // Updated March 2026: Freddie Mac avg 6.11%, Bankrate 6.35% — using 6.25% midpoint
const LOAN_TERM_YEARS = 30;
const PMI_ANNUAL_RATE = 0.005; // 0.5% of loan amount per year when <20% down
const TUCSON_MEDIAN = 370000;

/**
 * Credit-tier rate adjustments relative to base rate
 */
const CREDIT_TIER_ADJUSTMENTS: Record<CreditTier, number> = {
  excellent: -0.005,  // −0.50%
  good: 0,            //  base
  fair: 0.0075,       // +0.75%
  below: 0.015,       // +1.50%
};

export function calculateAffordability(
  income: number,
  debts: number,
  downPercent: number,
  creditTier: CreditTier = 'good',
  rateOverride?: number
): AffordabilityResult {
  const empty: AffordabilityResult = {
    maxPrice: 0,
    monthlyPayment: 0,
    breakdown: { principalInterest: 0, propertyTax: 0, insurance: 0, pmi: 0 },
    dtiUsed: 'front',
    effectiveRate: BASE_INTEREST_RATE + CREDIT_TIER_ADJUSTMENTS[creditTier],
    downPaymentAmount: 0,
    loanAmount: 0,
  };

  if (income <= 0) return empty;

  const effectiveRate = Math.max(0.01, BASE_INTEREST_RATE + CREDIT_TIER_ADJUSTMENTS[creditTier]);
  const monthlyIncome = income / 12;

  // DTI limits: lower of 28% front-end or 36% back-end minus debts
  const frontEnd = monthlyIncome * 0.28;
  const backEnd = (monthlyIncome * 0.36) - debts;
  const maxMonthly = Math.max(0, Math.min(frontEnd, backEnd));
  const dtiUsed: 'front' | 'back' = frontEnd <= backEnd ? 'front' : 'back';

  if (maxMonthly <= 0) return { ...empty, dtiUsed, effectiveRate };

  // Amortization constants
  const r = effectiveRate / 12;
  const n = LOAN_TERM_YEARS * 12;

  const monthlyInsurance = ANNUAL_INSURANCE / 12;
  const annuityFactor = (1 - Math.pow(1 + r, -n)) / r;
  const loanFraction = 1 - downPercent / 100;
  const hasPMI = downPercent < 20;
  const monthlyPMIRate = hasPMI ? PMI_ANNUAL_RATE / 12 : 0;

  // Solve for maxPrice:
  // PITI+PMI = PI + tax + insurance + PMI
  // PI = loanAmount / annuityFactor ... but loanAmount = maxPrice * loanFraction
  // tax = maxPrice * taxRate / 12
  // PMI = maxPrice * loanFraction * pmiRate / 12
  //
  // maxMonthly = maxPrice * loanFraction / annuityFactor + maxPrice * taxRate/12 + insurance/12 + maxPrice * loanFraction * pmiRate
  // maxMonthly - insurance/12 = maxPrice * (loanFraction/annuityFactor + taxRate/12 + loanFraction * pmiRate)
  // maxPrice = (maxMonthly - insurance/12) / (loanFraction/annuityFactor + taxRate/12 + loanFraction * pmiRate)

  const denominator =
    loanFraction / annuityFactor +
    PROPERTY_TAX_RATE / 12 +
    loanFraction * monthlyPMIRate;

  const numerator = maxMonthly - monthlyInsurance;

  if (numerator <= 0 || denominator <= 0) return { ...empty, dtiUsed, effectiveRate };

  const maxPrice = Math.round(numerator / denominator);
  const loanAmount = Math.round(maxPrice * loanFraction);
  const downPaymentAmount = maxPrice - loanAmount;

  const principalInterest = Math.round(loanAmount / annuityFactor);
  const propertyTax = Math.round(maxPrice * PROPERTY_TAX_RATE / 12);
  const insurance = Math.round(monthlyInsurance);
  const pmi = hasPMI ? Math.round(loanAmount * monthlyPMIRate) : 0;
  const monthlyPayment = principalInterest + propertyTax + insurance + pmi;

  return {
    maxPrice,
    monthlyPayment,
    breakdown: { principalInterest, propertyTax, insurance, pmi },
    dtiUsed,
    effectiveRate,
    downPaymentAmount,
    loanAmount,
  };
}

/** Tucson median for comparison display */
export const TUCSON_MEDIAN_PRICE = TUCSON_MEDIAN;
