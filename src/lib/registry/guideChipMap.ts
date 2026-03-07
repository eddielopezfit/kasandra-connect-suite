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
  intentCategory: 'sell' | 'buy' | 'neutral';
}

export type GuideChipMapType = Record<string, GuideChipEntry[]>;

export const GUIDE_CHIP_MAP: GuideChipMapType = {
  // --- Seller Situation Guides ---
  'divorce-selling': [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta', intentCategory: 'sell' },
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado', intentCategory: 'sell' },
  ],
  'inherited-probate-property': [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta', intentCategory: 'sell' },
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado', intentCategory: 'sell' },
  ],
  'distressed-preforeclosure': [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta', intentCategory: 'sell' },
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado', intentCategory: 'sell' },
  ],
  'life-change-selling': [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta', intentCategory: 'sell' },
    { en: 'Build my selling timeline', es: 'Construir mi cronograma de venta', intentCategory: 'sell' },
  ],
  'senior-downsizing': [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta', intentCategory: 'sell' },
    { en: 'Talk with Kasandra', es: 'Hablar con Kasandra', intentCategory: 'sell' },
  ],

  // --- Seller Strategy Guides ---
  'cash-vs-traditional-sale': [
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado', intentCategory: 'sell' },
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas', intentCategory: 'sell' },
  ],
  'selling-for-top-dollar': [
    { en: 'How to price my home', es: 'Cómo fijar el precio de mi casa', intentCategory: 'sell' },
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas', intentCategory: 'sell' },
  ],
  'pricing-strategy': [
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas', intentCategory: 'sell' },
    { en: 'Get my selling options', es: 'Ver mis opciones de venta', intentCategory: 'sell' },
  ],
  'cost-to-sell-tucson': [
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas', intentCategory: 'sell' },
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado', intentCategory: 'sell' },
  ],
  'how-long-to-sell-tucson': [
    { en: 'Build my selling timeline', es: 'Construir mi cronograma de venta', intentCategory: 'sell' },
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas', intentCategory: 'sell' },
  ],
  'sell-now-or-wait': [
    { en: 'Tucson Market Data', es: 'Datos del Mercado Tucson', intentCategory: 'sell' },
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas', intentCategory: 'sell' },
  ],
  'sell-or-rent-tucson': [
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas', intentCategory: 'sell' },
    { en: 'Get my selling options', es: 'Ver mis opciones de venta', intentCategory: 'sell' },
  ],
  'home-prep-staging': [
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas', intentCategory: 'sell' },
    { en: 'Build my selling timeline', es: 'Construir mi cronograma de venta', intentCategory: 'sell' },
  ],
  'capital-gains-home-sale-arizona': [
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas', intentCategory: 'sell' },
    { en: 'Talk with Kasandra', es: 'Hablar con Kasandra', intentCategory: 'sell' },
  ],
  'cash-offer-guide': [
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado', intentCategory: 'sell' },
    { en: 'Get my selling options', es: 'Ver mis opciones de venta', intentCategory: 'sell' },
  ],
  'understanding-home-valuation': [
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas', intentCategory: 'sell' },
    { en: 'Get my selling options', es: 'Ver mis opciones de venta', intentCategory: 'sell' },
  ],

  // --- Military ---
  'military-pcs-guide': [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta', intentCategory: 'sell' },
    { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado', intentCategory: 'sell' },
  ],

  // --- Buyer Guides ---
  'first-time-buyer-guide': [
    { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación', intentCategory: 'buy' },
    { en: 'First-Time Buyer Programs', es: 'Programas para Compradores', intentCategory: 'buy' },
  ],
  'arizona-first-time-buyer-programs': [
    { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación', intentCategory: 'buy' },
    { en: 'Estimate Closing Costs', es: 'Estimar Costos de Cierre', intentCategory: 'buy' },
  ],
  'buying-home-noncitizen-arizona': [
    { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación', intentCategory: 'buy' },
    { en: 'Talk with Kasandra', es: 'Hablar con Kasandra', intentCategory: 'buy' },
  ],
  'move-up-buyer': [
    { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación', intentCategory: 'buy' },
    { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas', intentCategory: 'buy' },
  ],
  'pima-county-property-taxes': [
    { en: 'Estimate Closing Costs', es: 'Estimar Costos de Cierre', intentCategory: 'buy' },
    { en: 'Browse guides', es: 'Explorar guías', intentCategory: 'buy' },
  ],

  // --- Location Guides ---
  'relocating-to-tucson': [
    { en: 'Explore Tucson neighborhoods', es: 'Explorar vecindarios de Tucson', intentCategory: 'neutral' },
    { en: 'Compare Neighborhoods', es: 'Comparar Vecindarios', intentCategory: 'neutral' },
  ],
  'tucson-neighborhoods': [
    { en: 'Compare Neighborhoods', es: 'Comparar Vecindarios', intentCategory: 'neutral' },
    { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación', intentCategory: 'neutral' },
  ],
  'tucson-suburb-comparison': [
    { en: 'Compare Neighborhoods', es: 'Comparar Vecindarios', intentCategory: 'neutral' },
    { en: 'Explore Tucson neighborhoods', es: 'Explorar vecindarios de Tucson', intentCategory: 'neutral' },
  ],

  // --- Reference Guides ---
  'arizona-real-estate-glossary': [
    { en: 'Browse guides', es: 'Explorar guías', intentCategory: 'neutral' },
  ],
};

/**
 * Get guide-contextual chips for a given guide ID, language, and optional current intent.
 * When intent is provided, filters out chips whose intentCategory conflicts with it.
 * 'neutral' chips always pass. Returns empty array if no mapping exists.
 */
export function getGuideChips(
  guideId: string,
  language: 'en' | 'es',
  currentIntent?: string,
): string[] {
  const entries = GUIDE_CHIP_MAP[guideId];
  if (!entries) return [];
  const filtered = currentIntent
    ? entries.filter(e =>
        e.intentCategory === 'neutral' ||
        e.intentCategory === currentIntent ||
        (currentIntent === 'dual') // dual = both sell+buy OK
      )
    : entries;
  return filtered.map(e => language === 'es' ? e.es : e.en);
}
