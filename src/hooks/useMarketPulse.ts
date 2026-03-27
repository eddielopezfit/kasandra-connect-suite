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
  // New fields from automated pipeline
  source?: string;
  month?: string;
  sale_to_list_ratio?: number;
  median_days_on_market?: number;
  median_sale_price?: number | null;
  source_links?: unknown;
  verified_at?: string;
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
  sourceLinks?: unknown;
  medianSalePrice: number | null;
}

function deriveStats(pulse: MarketPulse, isLive: boolean, language: 'en' | 'es' = 'en'): MarketStats {
  // If data comes from new market_pulse table, use direct fields
  const isNewPipeline = pulse.source === "market_pulse";

  let daysOnMarket: number;
  let saleToListRaw: number;

  if (isNewPipeline && pulse.median_days_on_market != null && pulse.sale_to_list_ratio != null) {
    daysOnMarket = pulse.median_days_on_market;
    saleToListRaw = Number(pulse.sale_to_list_ratio);
  } else {
    daysOnMarket = pulse.days_to_close
      ? Math.max(1, Math.round(pulse.days_to_close - 30))
      : tucsonMarketPulse.medianDaysOnMarket;
    saleToListRaw = pulse.negotiation_gap
      ? 1 - pulse.negotiation_gap
      : tucsonMarketPulse.saleToListRaw;
  }

  const saleToListRatio = `${(saleToListRaw * 100).toFixed(1)}%`;
  const locale = language === 'es' ? 'es-US' : 'en-US';

  // Month label: prefer DB month field, then derive from verified date, then config
  let month: string;
  let verifiedDate: string | null;

  if (isNewPipeline && pulse.month) {
    // New pipeline provides month directly (e.g. "March 2026")
    if (language === 'es') {
      // Translate month to Spanish
      const d = new Date(pulse.month + " 1, 12:00:00");
      month = d.toLocaleDateString('es-US', { month: 'long', year: 'numeric' });
    } else {
      month = pulse.month;
    }
    verifiedDate = pulse.verified_at ? new Date(pulse.verified_at).toLocaleDateString(locale, { month: 'long', year: 'numeric' }) : month;
  } else if (isLive && pulse.last_verified_date) {
    const d = new Date(pulse.last_verified_date + "T12:00:00");
    month = d.toLocaleDateString(locale, { month: "long", year: "numeric" });
    verifiedDate = month;
  } else {
    month = tucsonMarketPulse.month[language];
    verifiedDate = null;
  }

  // Generate dynamic insights based on actual data
  const insights: MarketInsights = generateInsights(saleToListRaw, daysOnMarket, pulse.holding_cost_per_day ?? tucsonMarketPulse.holdingCostPerDay, language);

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
    sourceLinks: isNewPipeline ? pulse.source_links : undefined,
    medianSalePrice: pulse.median_sale_price ?? null,
  };
}

/**
 * Generate insight copy dynamically based on actual market data values
 */
function generateInsights(stl: number, dom: number, holdingCost: number, language: 'en' | 'es'): MarketInsights {
  const monthlyHolding = Math.round(holdingCost * 30);

  if (language === 'es') {
    return {
      saleToList: stl >= 1.0
        ? "Las casas se están vendiendo por encima del precio pedido."
        : stl >= 0.98
          ? "Los compradores tienen poco margen de negociación."
          : "Los compradores aún tienen algo de margen.",
      daysOnMarket: dom <= 21
        ? "Las casas con buen precio se venden en unas 3 semanas."
        : dom <= 35
          ? "Las casas con buen precio se venden en unas 4-5 semanas."
          : `Las casas con buen precio se venden en unas ${Math.round(dom / 7)} semanas.`,
      holdingCost: `Cada mes sin vender cuesta ~$${monthlyHolding.toLocaleString()} al vendedor.`,
    };
  }

  return {
    saleToList: stl >= 1.0
      ? "Homes are selling above asking price."
      : stl >= 0.98
        ? "Buyers have little negotiating room."
        : "Buyers still have slight negotiating room.",
    daysOnMarket: dom <= 21
      ? "Homes priced correctly are selling in about 3 weeks."
      : dom <= 35
        ? "Homes priced correctly are selling in about 4-5 weeks."
        : `Homes priced correctly are selling in about ${Math.round(dom / 7)} weeks.`,
    holdingCost: `Every month unsold costs sellers about $${monthlyHolding.toLocaleString()}.`,
  };
}

async function fetchMarketPulse(): Promise<MarketPulse> {
  const { data, error } = await supabase.functions.invoke("get-market-pulse");
  if (error || !data) throw new Error("No data");

  // Support both new pipeline and legacy format
  const daysToClose = data.days_to_close ?? (data.median_days_on_market ? data.median_days_on_market + 30 : null);
  if (!daysToClose) throw new Error("No data");

  const negotiationGap = data.negotiation_gap ?? (data.sale_to_list_ratio ? 1 - Number(data.sale_to_list_ratio) : null);

  const isSane =
    (negotiationGap ?? 0) > -0.05 && // Allow up to 5% over asking (hot markets)
    (negotiationGap ?? 1) < 0.15 &&
    (data.holding_cost_per_day ?? 0) >= 5 &&
    daysToClose >= 20 &&
    daysToClose <= 200;

  if (!isSane) throw new Error("Insane data");
  return data as MarketPulse;
}

/**
 * useMarketPulse — cached via React Query (30-min staleTime).
 * Reads from automated pipeline (market_pulse table) with fallback to config.
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
