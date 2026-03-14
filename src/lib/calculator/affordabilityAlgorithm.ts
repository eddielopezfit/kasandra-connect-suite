/**
 * Affordability Algorithm — Tucson Defaults
 * Pure function: no side effects, no imports
 */

interface AffordabilityResult {
  maxPrice: number;
  monthlyPayment: number;
}

// Tucson-specific defaults
const PROPERTY_TAX_RATE = 0.011;
const ANNUAL_INSURANCE = 1200;
const INTEREST_RATE = 0.065;
const LOAN_TERM_YEARS = 30;

export function calculateAffordability(
  income: number,
  debts: number,
  downPercent: number
): AffordabilityResult {
  if (income <= 0) return { maxPrice: 0, monthlyPayment: 0 };

  const monthlyIncome = income / 12;

  // DTI limits: lower of 28% front-end or 36% back-end minus debts
  const frontEnd = monthlyIncome * 0.28;
  const backEnd = (monthlyIncome - debts) * 0.36;
  const maxMonthly = Math.max(0, Math.min(frontEnd, backEnd));

  if (maxMonthly <= 0) return { maxPrice: 0, monthlyPayment: 0 };

  // Amortization constants
  const r = INTEREST_RATE / 12;
  const n = LOAN_TERM_YEARS * 12;

  // Iterative solve: maxPrice depends on tax (which depends on maxPrice)
  // monthlyPI = maxMonthly - (maxPrice * taxRate / 12) - (insurance / 12)
  // loanAmount = monthlyPI * ((1 - (1+r)^-n) / r)
  // maxPrice = loanAmount / (1 - downPercent/100)
  //
  // Substitute and solve for maxPrice:
  // Let D = 1 - downPercent/100 (loan fraction)
  // Let A = ((1 - (1+r)^-n) / r) (annuity factor)
  // monthlyPI = maxMonthly - maxPrice * taxRate/12 - insurance/12
  // maxPrice * D = monthlyPI * A
  // maxPrice * D = (maxMonthly - maxPrice * taxRate/12 - insurance/12) * A
  // maxPrice * D = A * maxMonthly - A * maxPrice * taxRate/12 - A * insurance/12
  // maxPrice * (D + A * taxRate/12) = A * (maxMonthly - insurance/12)
  // maxPrice = A * (maxMonthly - insurance/12) / (D + A * taxRate/12)

  const monthlyInsurance = ANNUAL_INSURANCE / 12;
  const annuityFactor = (1 - Math.pow(1 + r, -n)) / r;
  const loanFraction = 1 - downPercent / 100;

  const numerator = annuityFactor * (maxMonthly - monthlyInsurance);
  const denominator = loanFraction + annuityFactor * PROPERTY_TAX_RATE / 12;

  if (numerator <= 0 || denominator <= 0) return { maxPrice: 0, monthlyPayment: 0 };

  const maxPrice = Math.round(numerator / denominator);
  const monthlyPayment = Math.round(maxMonthly);

  return { maxPrice, monthlyPayment };
}
