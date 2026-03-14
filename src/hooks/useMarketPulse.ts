import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MarketPulse {
  market_name: string;
  negotiation_gap: number | null;       // e.g. 0.024 → 97.6% sale-to-list
  days_to_close: number | null;         // escrow days (subtract ~30 for DOM)
  holding_cost_per_day: number | null;  // $ per day on market
  market_ready_prep_avg: number | null; // avg pre-sale prep spend
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

/**
 * Derived human-readable stats from raw MarketPulse data.
 * These are the values guides and tools display to end users.
 */
export interface MarketStats {
  /** Median days on market (days_to_close minus ~30 escrow days) */
  daysOnMarket: number;
  /** e.g. "97.6%" */
  saleToListRatio: string;
  /** Raw number e.g. 0.976 */
  saleToListRaw: number;
  /** $ per day holding cost */
  holdingCostPerDay: number;
  /** Average pre-sale prep spend */
  prepAvg: number;
  /** Current 30-year fixed mortgage rate as decimal (e.g. 0.068) */
  mortgageRate30yr: number;
  /** Human-readable verified date e.g. "January 2026" / "enero de 2026" */
  verifiedDate: string | null;
  /** Whether data came from live DB or fallback */
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

  // Mortgage rate: from API response or fallback 6.5%
  const rawRate = (pulse as Record<string, unknown>).mortgage_rate_30yr;
  const parsedRate = typeof rawRate === 'number' && rawRate >= 3 && rawRate <= 12
    ? rawRate / 100
    : 0.065;

  return {
    daysOnMarket,
    saleToListRatio,
    saleToListRaw,
    holdingCostPerDay: pulse.holding_cost_per_day ?? 42,
    prepAvg: pulse.market_ready_prep_avg ?? 4800,
    mortgageRate30yr: parsedRate,
    verifiedDate,
    isLive,
  };
}

/**
 * useMarketPulse
 *
 * Shared hook for live Tucson market stats.
 * Used by guides, tools, and any component needing current market data.
 *
 * Accepts optional language param for locale-aware date formatting.
 * Returns derived human-readable stats + raw pulse + loading state.
 * Falls back gracefully if the edge function is unavailable.
 */
export function useMarketPulse(language: 'en' | 'es' = 'en') {
  const [pulse, setPulse] = useState<MarketPulse>(MARKET_FALLBACK);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.functions.invoke("get-market-pulse").then(({ data, error }) => {
      if (!error && data?.days_to_close) {
        // Sanity checks — reject obviously corrupted scrape data
        const isSane =
          (data.negotiation_gap ?? 0) > 0.005 &&
          (data.negotiation_gap ?? 1) < 0.15 &&
          (data.holding_cost_per_day ?? 0) >= 5 &&
          (data.days_to_close ?? 0) >= 20 &&
          (data.days_to_close ?? 999) <= 200;

        if (isSane) {
          setPulse(data as MarketPulse);
          setIsLive(true);
        }
      }
      setLoading(false);
    });
  }, []);

  return {
    pulse,
    stats: deriveStats(pulse, isLive, language),
    isLive,
    loading,
  };
}
