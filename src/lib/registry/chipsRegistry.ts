/**
 * Chips Registry — OS Lock P1.3a
 * 
 * Pure data module. Contains all known chip→ActionSpec mappings.
 * No side effects, no imports from React or context.
 * 
 * Deduplication rule: only dedupe when BOTH normalized_key AND actionSpec are identical.
 */

import type { ActionSpec } from '@/lib/actions/actionSpec';

// ============= TYPES =============

export type MappedReply = string | { label: string; actionSpec?: ActionSpec };

export interface ChipRegistryEntry {
  id: string;
  label_en: string;
  label_es: string;
  normalized_key: string;
  actionSpec: ActionSpec;
}

// ============= NORMALIZATION =============

/**
 * Normalizes a chip label for deterministic matching.
 * NFD → strip diacritics → lowercase → trim → strip punctuation → collapse whitespace
 */
export function normalizeChipLabel(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[.,!?¿¡]/g, '')
    .replace(/\s+/g, ' ');
}

// ============= REGISTRY =============

export const CHIPS_REGISTRY: readonly ChipRegistryEntry[] = [
  // --- Calculator: net proceeds ---
  {
    id: 'calc-net-proceeds-en',
    label_en: 'Estimate my net proceeds',
    label_es: 'Estimar mis ganancias netas',
    normalized_key: 'estimate my net proceeds',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' } },
  },
  {
    id: 'calc-net-proceeds-es',
    label_en: 'Estimate my net proceeds',
    label_es: 'Estimar mis ganancias netas',
    normalized_key: 'estimar mis ganancias netas',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' } },
  },

  // --- Calculator: cash vs listing ---
  {
    id: 'calc-cash-vs-listing-en',
    label_en: 'Compare cash vs. listing',
    label_es: 'Comparar efectivo vs. listado',
    normalized_key: 'compare cash vs listing',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' } },
  },
  {
    id: 'calc-cash-vs-listing-es',
    label_en: 'Compare cash vs. listing',
    label_es: 'Comparar efectivo vs. listado',
    normalized_key: 'comparar efectivo vs listado',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' } },
  },

  // --- Booking: talk with Kasandra ---
  {
    id: 'book-talk-en',
    label_en: 'Talk with Kasandra',
    label_es: 'Hablar con Kasandra',
    normalized_key: 'talk with kasandra',
    actionSpec: { type: 'book', label: { en: 'Talk with Kasandra', es: 'Hablar con Kasandra' } },
  },
  {
    id: 'book-talk-es',
    label_en: 'Talk with Kasandra',
    label_es: 'Hablar con Kasandra',
    normalized_key: 'hablar con kasandra',
    actionSpec: { type: 'book', label: { en: 'Talk with Kasandra', es: 'Hablar con Kasandra' } },
  },

  // --- Booking: find a time ---
  {
    id: 'book-find-time-en',
    label_en: 'Find a time with Kasandra',
    label_es: 'Encontrar un horario con Kasandra',
    normalized_key: 'find a time with kasandra',
    actionSpec: { type: 'book', label: { en: 'Find a time with Kasandra', es: 'Encontrar un horario con Kasandra' } },
  },
  {
    id: 'book-find-time-es',
    label_en: 'Find a time with Kasandra',
    label_es: 'Encontrar un horario con Kasandra',
    normalized_key: 'encontrar un horario con kasandra',
    actionSpec: { type: 'book', label: { en: 'Find a time with Kasandra', es: 'Encontrar un horario con Kasandra' } },
  },

  // --- Tool: buyer readiness ---
  {
    id: 'tool-buyer-readiness-en',
    label_en: 'Take the readiness check',
    label_es: 'Tomar la evaluación de preparación',
    normalized_key: 'take the readiness check',
    actionSpec: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' } },
  },
  {
    id: 'tool-buyer-readiness-es',
    label_en: 'Take the readiness check',
    label_es: 'Tomar la evaluación de preparación',
    normalized_key: 'tomar la evaluacion de preparacion',
    actionSpec: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' } },
  },

  // --- Tool: cash readiness ---
  {
    id: 'tool-cash-readiness-en',
    label_en: 'Take the cash readiness check',
    label_es: 'Tomar el check de preparación en efectivo',
    normalized_key: 'take the cash readiness check',
    actionSpec: { type: 'open_tool', toolId: 'cash-readiness', label: { en: 'Take the cash readiness check', es: 'Tomar el check de preparación en efectivo' } },
  },
  {
    id: 'tool-cash-readiness-es',
    label_en: 'Take the cash readiness check',
    label_es: 'Tomar el check de preparación en efectivo',
    normalized_key: 'tomar el check de preparacion en efectivo',
    actionSpec: { type: 'open_tool', toolId: 'cash-readiness', label: { en: 'Take the cash readiness check', es: 'Tomar el check de preparación en efectivo' } },
  },

  // --- Navigate: seller decision ---
  {
    id: 'nav-seller-decision-en',
    label_en: 'Get my selling options',
    label_es: 'Ver mis opciones de venta',
    normalized_key: 'get my selling options',
    actionSpec: { type: 'navigate', path: '/v2/seller-decision', label: { en: 'Get my selling options', es: 'Ver mis opciones de venta' } },
  },
  {
    id: 'nav-seller-decision-es',
    label_en: 'Get my selling options',
    label_es: 'Ver mis opciones de venta',
    normalized_key: 'ver mis opciones de venta',
    actionSpec: { type: 'navigate', path: '/v2/seller-decision', label: { en: 'Get my selling options', es: 'Ver mis opciones de venta' } },
  },

  // --- Tool: seller readiness ---
  {
    id: 'tool-seller-readiness-en',
    label_en: 'Quick seller readiness check',
    label_es: 'Check rápido de preparación para vender',
    normalized_key: 'quick seller readiness check',
    actionSpec: { type: 'open_tool', toolId: 'seller-readiness', label: { en: 'Quick seller readiness check', es: 'Check rápido de preparación para vender' } },
  },
  {
    id: 'tool-seller-readiness-es',
    label_en: 'Quick seller readiness check',
    label_es: 'Check rápido de preparación para vender',
    normalized_key: 'check rapido de preparacion para vender',
    actionSpec: { type: 'open_tool', toolId: 'seller-readiness', label: { en: 'Quick seller readiness check', es: 'Check rápido de preparación para vender' } },
  },

  // --- Navigate: guides hub ---
  {
    id: 'nav-guides-en',
    label_en: 'Browse guides',
    label_es: 'Explorar guías',
    normalized_key: 'browse guides',
    actionSpec: { type: 'navigate', path: '/v2/guides', label: { en: 'Browse guides', es: 'Explorar guías' } },
  },
  {
    id: 'nav-guides-es',
    label_en: 'Browse guides',
    label_es: 'Explorar guías',
    normalized_key: 'explorar guias',
    actionSpec: { type: 'navigate', path: '/v2/guides', label: { en: 'Browse guides', es: 'Explorar guías' } },
  },

  // --- Legacy: browse buyer guides → guides hub ---
  {
    id: 'nav-buyer-guides-en',
    label_en: 'Browse buyer guides',
    label_es: 'Explorar guías del comprador',
    normalized_key: 'browse buyer guides',
    actionSpec: { type: 'navigate', path: '/v2/guides', label: { en: 'Browse guides', es: 'Explorar guías' } },
  },
  {
    id: 'nav-buyer-guides-es',
    label_en: 'Browse buyer guides',
    label_es: 'Explorar guías del comprador',
    normalized_key: 'explorar guias del comprador',
    actionSpec: { type: 'navigate', path: '/v2/guides', label: { en: 'Browse guides', es: 'Explorar guías' } },
  },

  // --- Legacy safety net: "What's my home worth?" → seller-decision ---
  {
    id: 'legacy-home-worth-en',
    label_en: "What's my home worth?",
    label_es: '¿Cuánto vale mi casa?',
    normalized_key: "what's my home worth",
    actionSpec: { type: 'navigate', path: '/v2/seller-decision', label: { en: 'Get my selling options', es: 'Ver mis opciones de venta' } },
  },
  {
    id: 'legacy-home-worth-es',
    label_en: "What's my home worth?",
    label_es: '¿Cuánto vale mi casa?',
    normalized_key: 'cuanto vale mi casa',
    actionSpec: { type: 'navigate', path: '/v2/seller-decision', label: { en: 'Get my selling options', es: 'Ver mis opciones de venta' } },
  },

  // --- Legacy safety net: "Compare cash vs. traditional" → cash-comparison ---
  {
    id: 'legacy-cash-vs-traditional-en',
    label_en: 'Compare cash vs. traditional',
    label_es: 'Comparar efectivo vs. tradicional',
    normalized_key: 'compare cash vs traditional',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' } },
  },
  {
    id: 'legacy-cash-vs-traditional-es',
    label_en: 'Compare cash vs. traditional',
    label_es: 'Comparar efectivo vs. tradicional',
    normalized_key: 'comparar efectivo vs tradicional',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' } },
  },

  // --- Legacy: "Comparar efectivo vs. venta tradicional" ---
  {
    id: 'legacy-cash-vs-venta-tradicional-es',
    label_en: 'Compare cash vs. traditional sale',
    label_es: 'Comparar efectivo vs. venta tradicional',
    normalized_key: 'comparar efectivo vs venta tradicional',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' } },
  },
] as const;

// ============= LOOKUP =============

// Pre-build lookup map for O(1) matching
const chipLookup = new Map<string, ChipRegistryEntry>(
  CHIPS_REGISTRY.map(entry => [entry.normalized_key, entry])
);

/**
 * Find a chip registry entry by normalizing the input label and matching against normalized_key.
 * Returns undefined if no match (drift detected).
 */
export function findChipByNormalizedKey(label: string): ChipRegistryEntry | undefined {
  const normalized = normalizeChipLabel(label);
  return chipLookup.get(normalized);
}
