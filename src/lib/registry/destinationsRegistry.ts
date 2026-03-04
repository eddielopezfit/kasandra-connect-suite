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
  | 'private_cash_review'
  | 'thank_you'
  | 'selena_open'
  | 'external_youtube';

interface DestinationEntry {
  key: DestinationKey;
  path: string | null; // null = non-route destination (e.g. chat open, external)
  label_en: string;
  label_es: string;
}

const DESTINATIONS: readonly DestinationEntry[] = [
  { key: 'home', path: '/v2', label_en: 'Home', label_es: 'Inicio' },
  { key: 'buy', path: '/v2/buy', label_en: 'Buy', label_es: 'Comprar' },
  { key: 'sell', path: '/v2/sell', label_en: 'Sell', label_es: 'Vender' },
  { key: 'cash_offer_options', path: '/v2/cash-offer-options', label_en: 'Cash Offer Options', label_es: 'Opciones de Oferta en Efectivo' },
  { key: 'guides', path: '/v2/guides', label_en: 'Guides', label_es: 'Guías' },
  { key: 'podcast', path: '/v2/podcast', label_en: 'Podcast', label_es: 'Podcast' },
  { key: 'community', path: '/v2/community', label_en: 'Community', label_es: 'Comunidad' },
  { key: 'book', path: '/v2/book', label_en: 'Book Consultation', label_es: 'Agendar Consulta' },
  { key: 'book_confirmed', path: '/v2/book/confirmed', label_en: 'Booking Confirmed', label_es: 'Reserva Confirmada' },
  { key: 'buyer_readiness', path: '/v2/buyer-readiness', label_en: 'Buyer Readiness', label_es: 'Preparación del Comprador' },
  { key: 'seller_readiness', path: '/v2/seller-readiness', label_en: 'Seller Readiness', label_es: 'Preparación del Vendedor' },
  { key: 'cash_readiness', path: '/v2/cash-readiness', label_en: 'Cash Readiness', label_es: 'Preparación en Efectivo' },
  { key: 'seller_decision', path: '/v2/seller-decision', label_en: 'Seller Decision', label_es: 'Decisión del Vendedor' },
  { key: 'private_cash_review', path: '/v2/private-cash-review', label_en: 'Private Cash Review', label_es: 'Revisión Privada de Efectivo' },
  { key: 'thank_you', path: '/v2/thank-you', label_en: 'Thank You', label_es: 'Gracias' },
  { key: 'selena_open', path: null, label_en: 'Open Selena', label_es: 'Abrir Selena' },
  { key: 'external_youtube', path: null, label_en: 'YouTube', label_es: 'YouTube' },
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
