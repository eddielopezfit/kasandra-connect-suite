import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { tucsonMarketPulse } from "@/config/marketPulse";

export interface MarketPulse {
  market_name: string;
  negotiation_gap: number | null;
  days_to_close: number | null;
  holding_cost_per_day: number | null;
  market_ready_prep_avg: number | null;
  last_verified_date: string | null;
  updated_at: string;
}

/** Fallback values driven by the monthly config file */
export const MARKET_FALLBACK: MarketPulse = {
  market_name: "Tucson_Overall",
  negotiation_gap: tucsonMarketPulse.negotiationGap,
  days_to_close: tucsonMarketPulse.daysToClose,
  holding_cost_per_day: tucsonMarketPulse.holdingCostPerDay,
  market_ready_prep_avg: tucsonMarketPulse.prepAvg,
  last_verified_date: null,
  updated_at: new Date().toISOString(),
};

export interface MarketInsights {
  saleToList: string;
  daysOnMarket: string;
  holdingCost: string;
}

export interface MarketStats {
  month: string;
  daysOnMarket: number;
  saleToListRatio: string;
  saleToListRaw: number;
  holdingCostPerDay: number;
  prepAvg: number;
  verifiedDate: string | null;
  isLive: boolean;
  insights: MarketInsights;
}

function deriveStats(pulse: MarketPulse, isLive: boolean, language: 'en' | 'es' = 'en'): MarketStats {
  const daysOnMarket = pulse.days_to_close
    ? Math.max(1, Math.round(pulse.days_to_close - 30))
    : tucsonMarketPulse.medianDaysOnMarket;

  const saleToListRaw = pulse.negotiation_gap
    ? 1 - pulse.negotiation_gap
    : tucsonMarketPulse.saleToListRaw;

  const saleToListRatio = `${(saleToListRaw * 100).toFixed(1)}%`;

  const locale = language === 'es' ? 'es-US' : 'en-US';

  // When DB is live AND has a verified date, derive month from that date
  // to prevent showing config month label over stale DB numbers.
  // Otherwise, use the config month as the intentional display source.
  let month: string;
  let verifiedDate: string | null;

  if (isLive && pulse.last_verified_date) {
    const d = new Date(pulse.last_verified_date);
    month = d.toLocaleDateString(locale, { month: "long", year: "numeric" });
    verifiedDate = month; // same value — "March 2026"
  } else {
    month = tucsonMarketPulse.month[language];
    verifiedDate = null;
  }

  const insights: MarketInsights = {
    saleToList: tucsonMarketPulse.insights.saleToList[language],
    daysOnMarket: tucsonMarketPulse.insights.daysOnMarket[language],
    holdingCost: tucsonMarketPulse.insights.holdingCost[language],
  };

  return {
    month,
    daysOnMarket,
    saleToListRatio,
    saleToListRaw,
    holdingCostPerDay: pulse.holding_cost_per_day ?? tucsonMarketPulse.holdingCostPerDay,
    prepAvg: pulse.market_ready_prep_avg ?? tucsonMarketPulse.prepAvg,
    verifiedDate,
    isLive,
    insights,
  };
}

async function fetchMarketPulse(): Promise<MarketPulse> {
  const { data, error } = await supabase.functions.invoke("get-market-pulse");
  if (error || !data?.days_to_close) throw new Error("No data");

  const isSane =
    (data.negotiation_gap ?? 0) > 0.005 &&
    (data.negotiation_gap ?? 1) < 0.15 &&
    (data.holding_cost_per_day ?? 0) >= 5 &&
    (data.days_to_close ?? 0) >= 20 &&
    (data.days_to_close ?? 999) <= 200;

  if (!isSane) throw new Error("Insane data");
  return data as MarketPulse;
}

/**
 * useMarketPulse — cached via React Query (30-min staleTime).
 * Falls back to config-driven values when DB is unavailable.
 */
export function useMarketPulse(language: 'en' | 'es' = 'en') {
  const { data, isLoading } = useQuery({
    queryKey: ['market-pulse'],
    queryFn: fetchMarketPulse,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });

  const pulse = data ?? MARKET_FALLBACK;
  const isLive = !!data;

  return {
    pulse,
    stats: deriveStats(pulse, isLive, language),
    isLive,
    loading: isLoading,
  };
}
