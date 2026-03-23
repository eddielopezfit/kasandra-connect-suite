/**
 * marketPulse.ts — FALLBACK CONFIG ONLY
 *
 * ⚠️  This file is a COLD-START FALLBACK only.
 * ⚠️  Live market data is owned by the market_pulse Supabase table.
 * ⚠️  Updated monthly by the refresh-market-pulse edge function via pg_cron (1st of each month, 3 AM UTC).
 * ⚠️  Pipeline: Firecrawl (Redfin + Realtor.com + Zillow) → Perplexity verification → Supabase insert.
 *
 * This config is ONLY used when:
 *   1. The market_pulse table has no rows yet (first deploy / cold start)
 *   2. The get-market-pulse edge function returns an error
 *
 * To manually refresh live data at any time, call:
 *   POST /functions/v1/refresh-market-pulse  with header  x-admin-secret: <ADMIN_SECRET>
 *
 * Last verified: March 2026 (Perplexity cross-ref Zillow Feb 2026 data)
 */

export const tucsonMarketPulse = {
  /** Display month — updated by cron pipeline, this value is fallback only */
  month: { en: "March 2026", es: "Marzo 2026" },

  /** Core metrics — Tucson market as of Feb/March 2026 (Zillow + Perplexity verified) */
  saleToListRatio: "98.6%",
  saleToListRaw: 0.986,
  negotiationGap: 0.014,
  medianDaysOnMarket: 42,
  daysToClose: 72,
  holdingCostPerDay: 42,
  prepAvg: 4800,

  /** Insight copy — generated dynamically in useMarketPulse.ts based on actual values */
  insights: {
    saleToList: {
      en: "Buyers have little negotiating room.",
      es: "Los compradores tienen poco margen de negociación.",
    },
    daysOnMarket: {
      en: "Homes priced correctly are selling in about 6 weeks.",
      es: "Las casas con buen precio se venden en unas 6 semanas.",
    },
    holdingCost: {
      en: "Every month unsold costs sellers about $1,260.",
      es: "Cada mes sin vender cuesta ~$1,260 al vendedor.",
    },
  },

  sourceNote: {
    en: "Based on current Tucson MLS market trends. Updated monthly.",
    es: "Basado en tendencias actuales del MLS de Tucson. Actualizado mensualmente.",
  },
};
