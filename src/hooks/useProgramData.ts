/**
 * useProgramData — Provides market-sensitive program data to guide components.
 * Combines static program data with live market pulse data.
 */

import { useMemo } from 'react';
import { PROGRAM_DATA, fmtCurrency, calculateMonthlyPayment } from '@/config/dynamicMarketData';
import { useMarketPulse } from '@/hooks/useMarketPulse';
import { useLanguage } from '@/contexts/LanguageContext';

export interface DynamicGuideData {
  // Market (live from Market Pulse)
  daysOnMarket: number;
  saleToListRatio: string;
  holdingCostPerDay: number;
  marketMonth: string;
  isLive: boolean;

  // Program (from centralized config)
  fhaLimit: string;
  fhaLimitNum: number;
  medianPrice: string;
  medianPriceNum: number;
  mortgageRate: string;
  monthlyPayment: string;    // Based on median price, 3.5% down, current rate
  monthlyPaymentNum: number;
  avgRent: string;
  buyVsRentDiff: string;     // Monthly difference: mortgage - rent
  pthsIncomeLimit: string;
  lastUpdated: string;
}

export function useProgramData(): DynamicGuideData {
  const { language } = useLanguage();
  const { stats, isLive } = useMarketPulse(language);

  return useMemo(() => {
    const loanAmount = Math.round(PROGRAM_DATA.medianSalePrice * (1 - PROGRAM_DATA.fhaMinDownPercent / 100));
    const monthlyPaymentNum = calculateMonthlyPayment(loanAmount);
    const buyVsRentDiff = monthlyPaymentNum - PROGRAM_DATA.averageRent;

    return {
      // Live market data
      daysOnMarket: stats.daysOnMarket,
      saleToListRatio: stats.saleToListRatio,
      holdingCostPerDay: stats.holdingCostPerDay,
      marketMonth: stats.month,
      isLive,

      // Program data
      fhaLimit: fmtCurrency(PROGRAM_DATA.fhaLimitSingleFamily),
      fhaLimitNum: PROGRAM_DATA.fhaLimitSingleFamily,
      medianPrice: PROGRAM_DATA.medianSalePriceFormatted,
      medianPriceNum: PROGRAM_DATA.medianSalePrice,
      mortgageRate: PROGRAM_DATA.mortgageRate30yr,
      monthlyPayment: fmtCurrency(monthlyPaymentNum),
      monthlyPaymentNum,
      avgRent: PROGRAM_DATA.averageRentFormatted,
      buyVsRentDiff: fmtCurrency(buyVsRentDiff),
      pthsIncomeLimit: PROGRAM_DATA.pthsIncomeLimitFormatted,
      lastUpdated: PROGRAM_DATA.lastUpdated,
    };
  }, [stats, isLive, language]);
}
