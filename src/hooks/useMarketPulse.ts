import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MarketPulse {
  market_name: string;
  negotiation_gap: number | null;
  days_to_close: number | null;
  holding_cost_per_day: number | null;
  market_ready_prep_avg: number | null;
  last_verified_date: string | null;
  updated_at: string;
}

export const MARKET_FALLBACK: MarketPulse = {
  market_name: "Tucson_Overall",
  negotiation_gap: 0.024,
  days_to_close: 68,
  holding_cost_per_day: 42,
  market_ready_prep_avg: 4800,
  last_verified_date: null,
  updated_at: new Date().toISOString(),
};

export interface MarketStats {
  daysOnMarket: number;
  saleToListRatio: string;
  saleToListRaw: number;
  holdingCostPerDay: number;
  prepAvg: number;
  verifiedDate: string | null;
  isLive: boolean;
}

function deriveStats(pulse: MarketPulse, isLive: boolean, language: 'en' | 'es' = 'en'): MarketStats {
  const daysOnMarket = pulse.days_to_close
    ? Math.max(1, Math.round(pulse.days_to_close - 30))
    : 38;

  const saleToListRaw = pulse.negotiation_gap
    ? 1 - pulse.negotiation_gap
    : 0.9764;

  const saleToListRatio = `${(saleToListRaw * 100).toFixed(1)}%`;

  const locale = language === 'es' ? 'es-US' : 'en-US';
  const verifiedDate = pulse.last_verified_date
    ? new Date(pulse.last_verified_date).toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      })
    : null;

  return {
    daysOnMarket,
    saleToListRatio,
    saleToListRaw,
    holdingCostPerDay: pulse.holding_cost_per_day ?? 42,
    prepAvg: pulse.market_ready_prep_avg ?? 4800,
    verifiedDate,
    isLive,
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
