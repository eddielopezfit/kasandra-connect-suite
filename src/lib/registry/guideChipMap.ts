/**
 * Guide Chip Map — P2: Guide-Contextual Chips
 * 
 * Maps guide IDs to 1-2 contextual chip labels that should appear when
 * `last_guide_id` is set in the session context. All labels MUST match
 * existing CHIPS_REGISTRY entries for deterministic routing.
 * 
 * Rules:
 * - Max 2 chips per guide (1 guide-specific + 1 next-step)
 * - Labels must match CHIPS_REGISTRY normalized_key exactly
 * - The first chip is prepended to the existing chip array
 * - The second chip (if present) replaces a generic chip
 */

export interface GuideChipEntry {
  en: string;
  es: string;
}

export type GuideChipMapType = Record<string, GuideChipEntry[]>;

export const GUIDE_CHIP_MAP: GuideChipMapType = {
  // --- Seller Situation Guides ---
  'divorce-selling': [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta' },
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' },
  ],
  'inherited-probate-property': [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta' },
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' },
  ],
  'distressed-preforeclosure': [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta' },
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' },
  ],
  'life-change-selling': [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta' },
    { en: 'Build my selling timeline', es: 'Construir mi cronograma de venta' },
  ],
  'senior-downsizing': [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta' },
    { en: 'Talk with Kasandra', es: 'Hablar con Kasandra' },
  ],

  // --- Seller Strategy Guides ---
  'cash-vs-traditional-sale': [
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' },
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
  ],
  'selling-for-top-dollar': [
    { en: 'How to price my home', es: 'Cómo fijar el precio de mi casa' },
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
  ],
  'pricing-strategy': [
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
    { en: 'Get my selling options', es: 'Ver mis opciones de venta' },
  ],
  'cost-to-sell-tucson': [
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' },
  ],
  'how-long-to-sell-tucson': [
    { en: 'Build my selling timeline', es: 'Construir mi cronograma de venta' },
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
  ],
  'sell-now-or-wait': [
    { en: 'Tucson Market Data', es: 'Datos del Mercado Tucson' },
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
  ],
  'sell-or-rent-tucson': [
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
    { en: 'Get my selling options', es: 'Ver mis opciones de venta' },
  ],
  'home-prep-staging': [
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
    { en: 'Build my selling timeline', es: 'Construir mi cronograma de venta' },
  ],
  'capital-gains-home-sale-arizona': [
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
    { en: 'Talk with Kasandra', es: 'Hablar con Kasandra' },
  ],
  'cash-offer-guide': [
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' },
    { en: 'Get my selling options', es: 'Ver mis opciones de venta' },
  ],
  'understanding-home-valuation': [
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
    { en: 'Get my selling options', es: 'Ver mis opciones de venta' },
  ],

  // --- Military ---
  'military-pcs-guide': [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta' },
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' },
  ],

  // --- Buyer Guides ---
  'first-time-buyer-guide': [
    { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' },
    { en: 'First-Time Buyer Programs', es: 'Programas para Compradores' },
  ],
  'arizona-first-time-buyer-programs': [
    { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' },
    { en: 'Estimate Closing Costs', es: 'Estimar Costos de Cierre' },
  ],
  'buying-home-noncitizen-arizona': [
    { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' },
    { en: 'Talk with Kasandra', es: 'Hablar con Kasandra' },
  ],
  'move-up-buyer': [
    { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' },
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
  ],
  'pima-county-property-taxes': [
    { en: 'Estimate Closing Costs', es: 'Estimar Costos de Cierre' },
    { en: 'Browse guides', es: 'Explorar guías' },
  ],

  // --- Location Guides ---
  'relocating-to-tucson': [
    { en: 'Explore Tucson neighborhoods', es: 'Explorar vecindarios de Tucson' },
    { en: 'Compare Neighborhoods', es: 'Comparar Vecindarios' },
  ],
  'tucson-neighborhoods': [
    { en: 'Compare Neighborhoods', es: 'Comparar Vecindarios' },
    { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' },
  ],
  'tucson-suburb-comparison': [
    { en: 'Compare Neighborhoods', es: 'Comparar Vecindarios' },
    { en: 'Explore Tucson neighborhoods', es: 'Explorar vecindarios de Tucson' },
  ],

  // --- Reference Guides ---
  'arizona-real-estate-glossary': [
    { en: 'Browse guides', es: 'Explorar guías' },
  ],
};

/**
 * Get guide-contextual chips for a given guide ID and language.
 * Returns empty array if no mapping exists.
 */
export function getGuideChips(guideId: string, language: 'en' | 'es'): string[] {
  const entries = GUIDE_CHIP_MAP[guideId];
  if (!entries) return [];
  return entries.map(e => language === 'es' ? e.es : e.en);
}
