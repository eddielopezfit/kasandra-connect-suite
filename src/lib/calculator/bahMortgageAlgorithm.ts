/**
 * BAH-to-Mortgage Calculator — VA Loan Buying Power
 * For military families at Davis-Monthan AFB and surrounding Tucson area
 *
 * Pure function: no side effects, no imports
 */

export interface BAHInput {
  bahMonthly: number;
  otherIncome: number;       // monthly non-BAH income
  monthlyDebts: number;
  downPercent: number;        // VA allows 0%
  isFirstUse: boolean;        // first-time VA loan use
  isDisabilityExempt: boolean; // 10%+ disability = no funding fee
}

export interface BAHBreakdownItem {
  label: string;
  labelEs: string;
  value: number;
}

export interface BAHResult {
  maxPrice: number;
  monthlyPayment: number;
  vaFundingFee: number;
  vaFundingFeePercent: number;
  totalQualifyingIncome: number;
  breakdown: BAHBreakdownItem[];
}

// VA-specific constants
const VA_FUNDING_FEE_FIRST_ZERO_DOWN = 0.0215;   // 2.15% first use, 0% down
const VA_FUNDING_FEE_FIRST_5_DOWN = 0.015;        // 1.5% first use, 5%+ down
const VA_FUNDING_FEE_FIRST_10_DOWN = 0.0125;      // 1.25% first use, 10%+ down
const VA_FUNDING_FEE_SUBSEQUENT_ZERO_DOWN = 0.033; // 3.3% subsequent use, 0% down
const VA_FUNDING_FEE_SUBSEQUENT_5_DOWN = 0.015;    // 1.5% subsequent, 5%+ down
const VA_FUNDING_FEE_SUBSEQUENT_10_DOWN = 0.0125;  // 1.25% subsequent, 10%+ down

const VA_INTEREST_RATE = 0.06;      // Typically slightly lower than conventional
const LOAN_TERM_YEARS = 30;
const PROPERTY_TAX_RATE = 0.011;    // Tucson/Pima County
const ANNUAL_INSURANCE = 1200;

function getFundingFeeRate(downPercent: number, isFirstUse: boolean): number {
  if (downPercent >= 10) return isFirstUse ? VA_FUNDING_FEE_FIRST_10_DOWN : VA_FUNDING_FEE_SUBSEQUENT_10_DOWN;
  if (downPercent >= 5) return isFirstUse ? VA_FUNDING_FEE_FIRST_5_DOWN : VA_FUNDING_FEE_SUBSEQUENT_5_DOWN;
  return isFirstUse ? VA_FUNDING_FEE_FIRST_ZERO_DOWN : VA_FUNDING_FEE_SUBSEQUENT_ZERO_DOWN;
}

export function calculateBAHMortgage(input: BAHInput): BAHResult {
  const empty: BAHResult = {
    maxPrice: 0,
    monthlyPayment: 0,
    vaFundingFee: 0,
    vaFundingFeePercent: 0,
    totalQualifyingIncome: 0,
    breakdown: [],
  };

  const totalMonthlyIncome = input.bahMonthly + input.otherIncome;
  if (totalMonthlyIncome <= 0) return empty;

  // VA uses 41% DTI back-end ratio (more generous than conventional 36%)
  const maxMonthlyPITI = (totalMonthlyIncome * 0.41) - input.monthlyDebts;
  if (maxMonthlyPITI <= 0) return empty;

  // Amortization
  const r = VA_INTEREST_RATE / 12;
  const n = LOAN_TERM_YEARS * 12;
  const annuityFactor = (1 - Math.pow(1 + r, -n)) / r;
  const monthlyInsurance = ANNUAL_INSURANCE / 12;
  const loanFraction = 1 - input.downPercent / 100;

  // VA has NO PMI — that's a key benefit
  // maxPITI = PI + tax + insurance
  // PI = loanAmount / annuityFactor = maxPrice * loanFraction / annuityFactor
  // tax = maxPrice * taxRate / 12
  // maxPITI - insurance = maxPrice * (loanFraction / annuityFactor + taxRate / 12)

  const denominator = loanFraction / annuityFactor + PROPERTY_TAX_RATE / 12;
  const numerator = maxMonthlyPITI - monthlyInsurance;

  if (numerator <= 0 || denominator <= 0) return empty;

  const maxPrice = Math.round(numerator / denominator);
  const loanAmount = Math.round(maxPrice * loanFraction);

  // VA Funding Fee (can be rolled into loan but doesn't affect monthly calc here)
  const fundingFeeRate = input.isDisabilityExempt ? 0 : getFundingFeeRate(input.downPercent, input.isFirstUse);
  const vaFundingFee = Math.round(loanAmount * fundingFeeRate);

  const principalInterest = Math.round(loanAmount / annuityFactor);
  const propertyTax = Math.round(maxPrice * PROPERTY_TAX_RATE / 12);
  const insurance = Math.round(monthlyInsurance);
  const monthlyPayment = principalInterest + propertyTax + insurance;

  const breakdown: BAHBreakdownItem[] = [
    { label: "Principal & Interest", labelEs: "Capital e Interés", value: principalInterest },
    { label: "Property Tax", labelEs: "Impuesto Predial", value: propertyTax },
    { label: "Homeowner's Insurance", labelEs: "Seguro de Propietario", value: insurance },
  ];

  return {
    maxPrice,
    monthlyPayment,
    vaFundingFee,
    vaFundingFeePercent: fundingFeeRate * 100,
    totalQualifyingIncome: totalMonthlyIncome,
    breakdown,
  };
}
