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
 * Last manual sync: March 2026 (Pima County MLS / Redfin Tucson)
 */

export const tucsonMarketPulse = {
  /** Display month — updated by cron pipeline, this value is fallback only */
  month: { en: "March 2026", es: "Marzo 2026" },

  /** Core metrics — Tucson market as of March 2026 (Redfin + Pima County MLS) */
  saleToListRatio: "97.6%",
  saleToListRaw: 0.976,
  negotiationGap: 0.024,
  medianDaysOnMarket: 38,
  daysToClose: 68,
  holdingCostPerDay: 42,
  prepAvg: 4800,

  /** Insight copy — generated dynamically in useMarketPulse.ts based on actual values */
  insights: {
    saleToList: {
      en: "Buyers still have slight negotiating room.",
      es: "Los compradores aún tienen algo de margen.",
    },
    daysOnMarket: {
      en: "Homes priced correctly are selling in about 5 weeks.",
      es: "Las casas con buen precio se venden en unas 5 semanas.",
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
