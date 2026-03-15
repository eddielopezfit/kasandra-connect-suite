// Update monthly using Tucson MLS market stats.
// Last updated: March 2026

export const tucsonMarketPulse = {
  /** Display month — update each cycle */
  month: { en: "March 2026", es: "Marzo 2026" },

  /** Core metrics */
  saleToListRatio: "97.6%",
  saleToListRaw: 0.976,
  negotiationGap: 0.024,
  medianDaysOnMarket: 38,
  daysToClose: 68,
  holdingCostPerDay: 42,
  prepAvg: 4800,

  /** Insight copy — update alongside numbers each month */
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

  /** Optional source note for future use */
  sourceNote: {
    en: "Based on current Tucson MLS market trends.",
    es: "Basado en tendencias actuales del MLS de Tucson.",
  },
};
