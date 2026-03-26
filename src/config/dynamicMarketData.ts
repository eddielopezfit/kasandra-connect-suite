/**
 * dynamicMarketData.ts — Single Source of Truth for Market-Sensitive Guide Data
 * 
 * PURPOSE: Guides reference these values instead of hardcoding numbers.
 * This means updating ONE file refreshes data across all 38 guides.
 * 
 * TWO DATA CATEGORIES:
 * 1. MARKET DATA — Auto-refreshed via Market Pulse pipeline (monthly)
 *    → useMarketPulse() already handles this
 * 
 * 2. PROGRAM DATA — Updated manually when programs change (quarterly)
 *    → FHA limits, DPA income limits, mortgage rates, tax rates
 *    → Centralized here so ONE edit propagates everywhere
 * 
 * LAST UPDATED: 2026-03-25
 */

export interface ProgramData {
  // FHA Limits (updated annually by HUD — usually November for next year)
  fhaLimitSingleFamily: number;
  fhaLimitDuplex: number;
  fhaLimitTriplex: number;
  fhaLimitFourplex: number;
  fhaNationalFloor: number;
  fhaMinDownPercent: number;
  fhaMinScore: number;
  fhaMinScoreLowDown: number;

  // Conventional Loan
  conventionalMinScore: number;
  conformingLoanLimit: number;

  // Mortgage Rates (approximate — update quarterly)
  mortgageRate30yr: string;       // Display string: "approximately 6.5%"
  mortgageRate30yrNum: number;    // Numeric for calculations: 0.065

  // Tucson Market Snapshot
  medianSalePrice: number;
  medianSalePriceFormatted: string;
  averageRent: number;
  averageRentFormatted: string;

  // DPA Programs (Pima County specific)
  pthsMaxPercent: number;
  pthsIncomeLimit: number;
  pthsIncomeLimitFormatted: string;
  homeProgMaxPercent: number;
  lighthouseRate: string;
  lighthouseIncomeCouple: number;
  lighthouseIncomeFamily: number;

  // Property Tax
  pimaCountyTaxRate: string;

  // Timestamps
  lastUpdated: string;
  fhaLimitYear: number;
}

export const PROGRAM_DATA: ProgramData = {
  // FHA Limits 2026 — Source: HUD via fha.com/lending_limits_state
  fhaLimitSingleFamily: 524225,
  fhaLimitDuplex: 671200,
  fhaLimitTriplex: 811275,
  fhaLimitFourplex: 1008300,
  fhaNationalFloor: 524225,
  fhaMinDownPercent: 3.5,
  fhaMinScore: 580,
  fhaMinScoreLowDown: 500,

  // Conventional
  conventionalMinScore: 620,
  conformingLoanLimit: 832750,

  // Rates — Q1 2026
  mortgageRate30yr: "approximately 6.5%",
  mortgageRate30yrNum: 0.065,

  // Tucson Market — March 2026
  medianSalePrice: 365000,
  medianSalePriceFormatted: "$365,000",
  averageRent: 1463,
  averageRentFormatted: "$1,463",

  // DPA — Current program limits
  pthsMaxPercent: 5,
  pthsIncomeLimit: 146503,
  pthsIncomeLimitFormatted: "$146,503",
  homeProgMaxPercent: 20,
  lighthouseRate: "5.84%",
  lighthouseIncomeCouple: 113000,
  lighthouseIncomeFamily: 131000,

  // Tax
  pimaCountyTaxRate: "approximately 1.1%",

  // Meta
  lastUpdated: "2026-03-25",
  fhaLimitYear: 2026,
};

/**
 * Helper: Format currency for display
 */
export function fmtCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Helper: Calculate monthly mortgage payment
 * Standard amortization formula: M = P[r(1+r)^n] / [(1+r)^n – 1]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number = PROGRAM_DATA.mortgageRate30yrNum,
  years: number = 30
): number {
  const r = annualRate / 12;
  const n = years * 12;
  return Math.round(principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}
