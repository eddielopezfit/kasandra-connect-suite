/**
 * Destinations Registry — OS Lock P1.2
 * 
 * Single source of truth for all navigable destinations in the platform.
 * Routes are centralized here so chips, ActionSpecs, and navigation
 * never hardcode paths outside this module.
 */

export type DestinationKey =
  | 'home'
  | 'buy'
  | 'sell'
  | 'cash_offer_options'
  | 'guides'
  | 'podcast'
  | 'community'
  | 'book'
  | 'book_confirmed'
  | 'buyer_readiness'
  | 'seller_readiness'
  | 'cash_readiness'
  | 'seller_decision'
  | 'seller_timeline'
  | 'neighborhood_compare'
  | 'buyer_closing_costs'
  | 'off_market'
  | 'market_intelligence'
  | 'private_cash_review'
  | 'thank_you'
  | 'selena_open'
  | 'external_youtube'
  | 'neighborhoods'
  | 'neighborhood_detail'
  | 'trusted_network'
  | 'tucson_living';

interface DestinationEntry {
  key: DestinationKey;
  path: string | null; // null = non-route destination (e.g. chat open, external)
  label_en: string;
  label_es: string;
}

const DESTINATIONS: readonly DestinationEntry[] = [
  { key: 'home', path: '/', label_en: 'Home', label_es: 'Inicio' },
  { key: 'buy', path: '/buy', label_en: 'Buy', label_es: 'Comprar' },
  { key: 'sell', path: '/sell', label_en: 'Sell', label_es: 'Vender' },
  { key: 'cash_offer_options', path: '/cash-offer-options', label_en: 'Cash Offer Options', label_es: 'Opciones de Oferta en Efectivo' },
  { key: 'guides', path: '/guides', label_en: 'Guides', label_es: 'Guías' },
  { key: 'podcast', path: '/podcast', label_en: 'Podcast', label_es: 'Podcast' },
  { key: 'community', path: '/community', label_en: 'Community', label_es: 'Comunidad' },
  { key: 'book', path: '/book', label_en: 'Book Consultation', label_es: 'Agendar Consulta' },
  { key: 'book_confirmed', path: '/book/confirmed', label_en: 'Booking Confirmed', label_es: 'Reserva Confirmada' },
  { key: 'buyer_readiness', path: '/buyer-readiness', label_en: 'Buyer Readiness', label_es: 'Preparación del Comprador' },
  { key: 'seller_readiness', path: '/seller-readiness', label_en: 'Seller Readiness', label_es: 'Preparación del Vendedor' },
  { key: 'cash_readiness', path: '/cash-readiness', label_en: 'Cash Readiness', label_es: 'Preparación en Efectivo' },
  { key: 'seller_decision', path: '/seller-decision', label_en: 'Seller Decision', label_es: 'Decisión del Vendedor' },
  { key: 'seller_timeline', path: '/seller-timeline', label_en: 'Seller Timeline', label_es: 'Cronograma del Vendedor' },
  { key: 'neighborhood_compare', path: '/neighborhood-compare', label_en: 'Neighborhood Compare', label_es: 'Comparar Vecindarios' },
  { key: 'buyer_closing_costs', path: '/buyer-closing-costs', label_en: 'Buyer Closing Costs', label_es: 'Costos de Cierre del Comprador' },
  { key: 'off_market', path: '/off-market', label_en: 'Off-Market Buyer', label_es: 'Comprador Fuera del Mercado' },
  { key: 'market_intelligence', path: '/market', label_en: 'Market Intelligence', label_es: 'Inteligencia de Mercado' },
  { key: 'private_cash_review', path: '/cash-offer-options', label_en: 'Cash Offer Options', label_es: 'Opciones de Oferta en Efectivo' },
  { key: 'thank_you', path: '/thank-you', label_en: 'Thank You', label_es: 'Gracias' },
  { key: 'selena_open', path: null, label_en: 'Open Selena', label_es: 'Abrir Selena' },
  { key: 'external_youtube', path: null, label_en: 'YouTube', label_es: 'YouTube' },
  { key: 'neighborhoods', path: '/neighborhoods', label_en: 'Neighborhoods', label_es: 'Vecindarios' },
  { key: 'neighborhood_detail', path: '/neighborhoods/:slug', label_en: 'Neighborhood', label_es: 'Vecindario' },
] as const;

// Lookup map for O(1) access
const destinationMap = new Map<DestinationKey, DestinationEntry>(
  DESTINATIONS.map(d => [d.key, d])
);

/**
 * Resolve a destination key to its path (or null for non-route destinations).
 */
export function resolveDestination(key: DestinationKey): string | null {
  return destinationMap.get(key)?.path ?? null;
}

/**
 * Check if a given path is a valid registered destination.
 */
export function isValidDestination(path: string): boolean {
  return DESTINATIONS.some(d => d.path === path);
}

/**
 * DEV-ONLY: Assert a path exists in the registry. Logs warning if not found.
 */
export function assertValidDestinationPath(path: string): void {
  if (import.meta.env.DEV && !isValidDestination(path)) {
    console.warn(`[DestinationsRegistry] Unregistered path: ${path}`);
  }
}

export { DESTINATIONS };
export type { DestinationEntry };
