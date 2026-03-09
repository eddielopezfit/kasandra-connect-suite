/**
 * Chips Registry — OS Lock P1.3a
 * 
 * Pure data module. Contains all known chip→ActionSpec mappings.
 * No side effects, no imports from React or context.
 * 
 * Deduplication rule: only dedupe when BOTH normalized_key AND actionSpec are identical.
 * 
 * DUAL LOOKUP ARCHITECTURE:
 * 1. By semantic key (chipKey) — for deterministic routing from journeyState/chipGovernance
 * 2. By normalized text (normalized_key) — fallback for LLM hallucination detection
 */

import type { ActionSpec } from '@/lib/actions/actionSpec';
import { CHIP_KEYS, type ChipKey } from './chipKeys';

// ============= TYPES =============

export type MappedReply = string | { label: string; actionSpec?: ActionSpec };

export interface ChipRegistryEntry {
  id: string;
  label_en: string;
  label_es: string;
  normalized_key: string;
  actionSpec: ActionSpec;
  /** Optional semantic key for deterministic routing. If present, enables lookup by CHIP_KEYS. */
  chipKey?: ChipKey;
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
    chipKey: CHIP_KEYS.ESTIMATE_PROCEEDS,
  },
  {
    id: 'calc-net-proceeds-es',
    label_en: 'Estimate my net proceeds',
    label_es: 'Estimar mis ganancias netas',
    normalized_key: 'estimar mis ganancias netas',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' } },
    chipKey: CHIP_KEYS.ESTIMATE_PROCEEDS,
  },

  // --- Calculator: cash vs listing ---
  {
    id: 'calc-cash-vs-listing-en',
    label_en: 'Compare cash vs. listing',
    label_es: 'Comparar efectivo vs. listado',
    normalized_key: 'compare cash vs listing',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' } },
    chipKey: CHIP_KEYS.COMPARE_CASH_LISTING,
  },
  {
    id: 'calc-cash-vs-listing-es',
    label_en: 'Compare cash vs. listing',
    label_es: 'Comparar efectivo vs. listado',
    normalized_key: 'comparar efectivo vs listado',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' } },
    chipKey: CHIP_KEYS.COMPARE_CASH_LISTING,
  },

  // --- Booking: talk with Kasandra ---
  {
    id: 'book-talk-en',
    label_en: 'Talk with Kasandra',
    label_es: 'Hablar con Kasandra',
    normalized_key: 'talk with kasandra',
    actionSpec: { type: 'book', label: { en: 'Talk with Kasandra', es: 'Hablar con Kasandra' } },
    chipKey: CHIP_KEYS.TALK_WITH_KASANDRA,
  },
  {
    id: 'book-talk-es',
    label_en: 'Talk with Kasandra',
    label_es: 'Hablar con Kasandra',
    normalized_key: 'hablar con kasandra',
    actionSpec: { type: 'book', label: { en: 'Talk with Kasandra', es: 'Hablar con Kasandra' } },
    chipKey: CHIP_KEYS.TALK_WITH_KASANDRA,
  },

  // --- Booking: find a time ---
  {
    id: 'book-find-time-en',
    label_en: 'Find a time with Kasandra',
    label_es: 'Encontrar un horario con Kasandra',
    normalized_key: 'find a time with kasandra',
    actionSpec: { type: 'book', label: { en: 'Find a time with Kasandra', es: 'Encontrar un horario con Kasandra' } },
    chipKey: CHIP_KEYS.FIND_A_TIME,
  },
  {
    id: 'book-find-time-es',
    label_en: 'Find a time with Kasandra',
    label_es: 'Encontrar un horario con Kasandra',
    normalized_key: 'encontrar un horario con kasandra',
    actionSpec: { type: 'book', label: { en: 'Find a time with Kasandra', es: 'Encontrar un horario con Kasandra' } },
    chipKey: CHIP_KEYS.FIND_A_TIME,
  },

  // --- Tool: buyer readiness ---
  {
    id: 'tool-buyer-readiness-en',
    label_en: 'Take the readiness check',
    label_es: 'Tomar la evaluación de preparación',
    normalized_key: 'take the readiness check',
    actionSpec: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' } },
    chipKey: CHIP_KEYS.BUYER_READINESS,
  },
  {
    id: 'tool-buyer-readiness-es',
    label_en: 'Take the readiness check',
    label_es: 'Tomar la evaluación de preparación',
    normalized_key: 'tomar la evaluacion de preparacion',
    actionSpec: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' } },
    chipKey: CHIP_KEYS.BUYER_READINESS,
  },

  // --- Tool: cash readiness ---
  {
    id: 'tool-cash-readiness-en',
    label_en: 'Take the cash readiness check',
    label_es: 'Tomar el check de preparación en efectivo',
    normalized_key: 'take the cash readiness check',
    actionSpec: { type: 'open_tool', toolId: 'cash-readiness', label: { en: 'Take the cash readiness check', es: 'Tomar el check de preparación en efectivo' } },
    chipKey: CHIP_KEYS.CASH_READINESS,
  },
  {
    id: 'tool-cash-readiness-es',
    label_en: 'Take the cash readiness check',
    label_es: 'Tomar el check de preparación en efectivo',
    normalized_key: 'tomar el check de preparacion en efectivo',
    actionSpec: { type: 'open_tool', toolId: 'cash-readiness', label: { en: 'Take the cash readiness check', es: 'Tomar el check de preparación en efectivo' } },
    chipKey: CHIP_KEYS.CASH_READINESS,
  },

  // --- Navigate: seller decision ---
  {
    id: 'nav-seller-decision-en',
    label_en: 'Get my selling options',
    label_es: 'Ver mis opciones de venta',
    normalized_key: 'get my selling options',
    actionSpec: { type: 'navigate', path: '/v2/seller-decision', label: { en: 'Get my selling options', es: 'Ver mis opciones de venta' } },
    chipKey: CHIP_KEYS.GET_SELLING_OPTIONS,
  },
  {
    id: 'nav-seller-decision-es',
    label_en: 'Get my selling options',
    label_es: 'Ver mis opciones de venta',
    normalized_key: 'ver mis opciones de venta',
    actionSpec: { type: 'navigate', path: '/v2/seller-decision', label: { en: 'Get my selling options', es: 'Ver mis opciones de venta' } },
    chipKey: CHIP_KEYS.GET_SELLING_OPTIONS,
  },

  // --- Tool: seller readiness ---
  {
    id: 'tool-seller-readiness-en',
    label_en: 'Quick seller readiness check',
    label_es: 'Check rápido de preparación para vender',
    normalized_key: 'quick seller readiness check',
    actionSpec: { type: 'open_tool', toolId: 'seller-readiness', label: { en: 'Quick seller readiness check', es: 'Check rápido de preparación para vender' } },
    chipKey: CHIP_KEYS.SELLER_READINESS,
  },
  {
    id: 'tool-seller-readiness-es',
    label_en: 'Quick seller readiness check',
    label_es: 'Check rápido de preparación para vender',
    normalized_key: 'check rapido de preparacion para vender',
    actionSpec: { type: 'open_tool', toolId: 'seller-readiness', label: { en: 'Quick seller readiness check', es: 'Check rápido de preparación para vender' } },
    chipKey: CHIP_KEYS.SELLER_READINESS,
  },

  // --- Navigate: seller timeline planner ---
  {
    id: 'nav-seller-timeline-en',
    label_en: 'Build my selling timeline',
    label_es: 'Construir mi cronograma de venta',
    normalized_key: 'build my selling timeline',
    actionSpec: { type: 'navigate', path: '/v2/seller-timeline', label: { en: 'Build my selling timeline', es: 'Construir mi cronograma de venta' } },
    chipKey: CHIP_KEYS.BUILD_SELLING_TIMELINE,
  },
  {
    id: 'nav-seller-timeline-es',
    label_en: 'Build my selling timeline',
    label_es: 'Construir mi cronograma de venta',
    normalized_key: 'construir mi cronograma de venta',
    actionSpec: { type: 'navigate', path: '/v2/seller-timeline', label: { en: 'Build my selling timeline', es: 'Construir mi cronograma de venta' } },
    chipKey: CHIP_KEYS.BUILD_SELLING_TIMELINE,
  },

  // --- Navigate: guides hub ---
  {
    id: 'nav-guides-en',
    label_en: 'Browse guides',
    label_es: 'Explorar guías',
    normalized_key: 'browse guides',
    actionSpec: { type: 'navigate', path: '/v2/guides', label: { en: 'Browse guides', es: 'Explorar guías' } },
    chipKey: CHIP_KEYS.BROWSE_GUIDES,
  },
  {
    id: 'nav-guides-es',
    label_en: 'Browse guides',
    label_es: 'Explorar guías',
    normalized_key: 'explorar guias',
    actionSpec: { type: 'navigate', path: '/v2/guides', label: { en: 'Browse guides', es: 'Explorar guías' } },
    chipKey: CHIP_KEYS.BROWSE_GUIDES,
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

  // --- Guide: Cash vs. Listing Guide ---
  {
    id: 'guide-cash-vs-listing-en',
    label_en: 'Cash vs. Listing Guide',
    label_es: 'Guía Efectivo vs. Listado',
    normalized_key: 'cash vs listing guide',
    actionSpec: { type: 'open_guide', guideId: 'cash-vs-traditional-sale', label: { en: 'Cash vs. Listing Guide', es: 'Guía Efectivo vs. Listado' } },
  },
  {
    id: 'guide-cash-vs-listing-es',
    label_en: 'Cash vs. Listing Guide',
    label_es: 'Guía Efectivo vs. Listado',
    normalized_key: 'guia efectivo vs listado',
    actionSpec: { type: 'open_guide', guideId: 'cash-vs-traditional-sale', label: { en: 'Cash vs. Listing Guide', es: 'Guía Efectivo vs. Listado' } },
  },

  // --- Guide: First-Time Buyer Guide ---
  {
    id: 'guide-ftb-en',
    label_en: 'First-Time Buyer Guide',
    label_es: 'Guía para Compradores Primerizos',
    normalized_key: 'first-time buyer guide',
    actionSpec: { type: 'open_guide', guideId: 'first-time-buyer-guide', label: { en: 'First-Time Buyer Guide', es: 'Guía para Compradores Primerizos' } },
  },
  {
    id: 'guide-ftb-es',
    label_en: 'First-Time Buyer Guide',
    label_es: 'Guía para Compradores Primerizos',
    normalized_key: 'guia para compradores primerizos',
    actionSpec: { type: 'open_guide', guideId: 'first-time-buyer-guide', label: { en: 'First-Time Buyer Guide', es: 'Guía para Compradores Primerizos' } },
  },

  // --- Navigate: Selling Guides hub ---
  {
    id: 'nav-selling-guides-en',
    label_en: 'Selling Guides',
    label_es: 'Guías de Venta',
    normalized_key: 'selling guides',
    actionSpec: { type: 'navigate', path: '/v2/guides', label: { en: 'Selling Guides', es: 'Guías de Venta' } },
  },
  {
    id: 'nav-selling-guides-es',
    label_en: 'Selling Guides',
    label_es: 'Guías de Venta',
    normalized_key: 'guias de venta',
    actionSpec: { type: 'navigate', path: '/v2/guides', label: { en: 'Selling Guides', es: 'Guías de Venta' } },
  },

  // --- Calculator: Estimate Net Proceeds (semantically honest) ---
  {
    id: 'calc-estimate-net-en',
    label_en: 'Estimate Net Proceeds',
    label_es: 'Estimar Ganancias Netas',
    normalized_key: 'estimate net proceeds',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Estimate Net Proceeds', es: 'Estimar Ganancias Netas' } },
  },
  {
    id: 'calc-estimate-net-es',
    label_en: 'Estimate Net Proceeds',
    label_es: 'Estimar Ganancias Netas',
    normalized_key: 'estimar ganancias netas',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Estimate Net Proceeds', es: 'Estimar Ganancias Netas' } },
  },
  // --- Guide: Selling for Top Dollar ---
  {
    id: 'guide-selling-top-dollar-en',
    label_en: 'Selling for Top Dollar Guide',
    label_es: 'Guía para Vender al Mejor Precio',
    normalized_key: 'selling for top dollar guide',
    actionSpec: { type: 'open_guide', guideId: 'selling-for-top-dollar', label: { en: 'Selling for Top Dollar Guide', es: 'Guía para Vender al Mejor Precio' } },
  },

  // --- Tool alias: "Take readiness check" (truncated, no "the") → buyer-readiness ---
  {
    id: 'tool-buyer-readiness-short-en',
    label_en: 'Take readiness check',
    label_es: 'Tomar evaluación de preparación',
    normalized_key: 'take readiness check',
    actionSpec: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' } },
  },
  {
    id: 'tool-buyer-readiness-short-es',
    label_en: 'Take readiness check',
    label_es: 'Tomar evaluación de preparación',
    normalized_key: 'tomar evaluacion de preparacion',
    actionSpec: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' } },
  },

  // --- Tool alias: "Check my readiness" → buyer-readiness ---
  {
    id: 'tool-buyer-readiness-check-en',
    label_en: 'Check my readiness',
    label_es: 'Verificar mi preparación',
    normalized_key: 'check my readiness',
    actionSpec: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' } },
  },
  {
    id: 'tool-buyer-readiness-check-es',
    label_en: 'Check my readiness',
    label_es: 'Verificar mi preparación',
    normalized_key: 'verificar mi preparacion',
    actionSpec: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' } },
  },

  // --- Tool alias: "Start now" (shown after buyer readiness click) → buyer-readiness ---
  {
    id: 'tool-buyer-readiness-start-en',
    label_en: 'Start now',
    label_es: 'Comenzar ahora',
    normalized_key: 'start now',
    actionSpec: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' } },
  },
  {
    id: 'tool-buyer-readiness-start-es',
    label_en: 'Start now',
    label_es: 'Comenzar ahora',
    normalized_key: 'comenzar ahora',
    actionSpec: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' } },
  },

  // --- Guide: "View first-time buyer guide" → first-time-buyer-guide ---
  {
    id: 'guide-ftb-view-en',
    label_en: 'View first-time buyer guide',
    label_es: 'Ver guía para compradores',
    normalized_key: 'view first-time buyer guide',
    actionSpec: { type: 'open_guide', guideId: 'first-time-buyer-guide', label: { en: 'First-Time Buyer Guide', es: 'Guía para Compradores Primerizos' } },
  },
  {
    id: 'guide-ftb-view-es',
    label_en: 'View first-time buyer guide',
    label_es: 'Ver guía para compradores',
    normalized_key: 'ver guia para compradores',
    actionSpec: { type: 'open_guide', guideId: 'first-time-buyer-guide', label: { en: 'First-Time Buyer Guide', es: 'Guía para Compradores Primerizos' } },
  },
  // === PHASE 3 — LOCAL DOMINATION GUIDE CHIPS ===
  {
    id: 'guide-military-en',
    label_en: 'Military & VA guide',
    label_es: 'Guía militar y VA',
    normalized_key: 'military & va guide',
    actionSpec: { type: 'open_guide', guideId: 'military-pcs-guide', label: { en: 'Military & VA Guide', es: 'Guía Militar y VA' } },
  },
  {
    id: 'guide-military-es',
    label_en: 'Military & VA guide',
    label_es: 'Guía militar y VA',
    normalized_key: 'guia militar y va',
    actionSpec: { type: 'open_guide', guideId: 'military-pcs-guide', label: { en: 'Military & VA Guide', es: 'Guía Militar y VA' } },
  },
  {
    id: 'guide-divorce-en',
    label_en: 'Selling during divorce',
    label_es: 'Vender durante divorcio',
    normalized_key: 'selling during divorce',
    actionSpec: { type: 'open_guide', guideId: 'divorce-selling', label: { en: 'Selling During Divorce', es: 'Vender Durante el Divorcio' } },
  },
  {
    id: 'guide-divorce-es',
    label_en: 'Selling during divorce',
    label_es: 'Vender durante divorcio',
    normalized_key: 'vender durante divorcio',
    actionSpec: { type: 'open_guide', guideId: 'divorce-selling', label: { en: 'Selling During Divorce', es: 'Vender Durante el Divorcio' } },
  },
  {
    id: 'guide-senior-en',
    label_en: 'Downsizing guide',
    label_es: 'Guía de reducción de tamaño',
    normalized_key: 'downsizing guide',
    actionSpec: { type: 'open_guide', guideId: 'senior-downsizing', label: { en: 'Senior Downsizing Guide', es: 'Guía para Reducir Tamaño' } },
  },
  {
    id: 'guide-senior-es',
    label_en: 'Downsizing guide',
    label_es: 'Guía de reducción de tamaño',
    normalized_key: 'guia de reduccion de tamano',
    actionSpec: { type: 'open_guide', guideId: 'senior-downsizing', label: { en: 'Senior Downsizing Guide', es: 'Guía para Reducir Tamaño' } },
  },
  {
    id: 'guide-neighborhoods-en',
    label_en: 'Explore Tucson neighborhoods',
    label_es: 'Explorar vecindarios de Tucson',
    normalized_key: 'explore tucson neighborhoods',
    actionSpec: { type: 'open_guide', guideId: 'tucson-neighborhoods', label: { en: 'Tucson Neighborhoods Guide', es: 'Guía de Vecindarios de Tucson' } },
  },
  {
    id: 'guide-neighborhoods-es',
    label_en: 'Explore Tucson neighborhoods',
    label_es: 'Explorar vecindarios de Tucson',
    normalized_key: 'explorar vecindarios de tucson',
    actionSpec: { type: 'open_guide', guideId: 'tucson-neighborhoods', label: { en: 'Tucson Neighborhoods Guide', es: 'Guía de Vecindarios de Tucson' } },
  },
  {
    id: 'guide-relocation-en',
    label_en: 'Relocating to Tucson guide',
    label_es: 'Guía para mudarse a Tucson',
    normalized_key: 'relocating to tucson guide',
    actionSpec: { type: 'open_guide', guideId: 'relocating-to-tucson', label: { en: 'Relocating to Tucson', es: 'Mudarse a Tucson' } },
  },
  {
    id: 'guide-pricing-en',
    label_en: 'How to price my home',
    label_es: 'Cómo fijar el precio de mi casa',
    normalized_key: 'how to price my home',
    actionSpec: { type: 'open_guide', guideId: 'pricing-strategy', label: { en: 'Home Pricing Strategy', es: 'Estrategia de Precio' } },
  },
  {
    id: 'guide-pricing-es',
    label_en: 'How to price my home',
    label_es: 'Cómo fijar el precio de mi casa',
    normalized_key: 'como fijar el precio de mi casa',
    actionSpec: { type: 'open_guide', guideId: 'pricing-strategy', label: { en: 'Home Pricing Strategy', es: 'Estrategia de Precio' } },
  },

  // --- Off-Market Buyer Capture ---
  {
    id: 'off-market-en',
    label_en: 'Find off-market homes',
    label_es: 'Encontrar casas fuera del mercado',
    normalized_key: 'find off-market homes',
    actionSpec: { type: 'open_tool', toolId: 'off-market-buyer', label: { en: 'Find off-market homes', es: 'Encontrar casas fuera del mercado' } },
  },
  {
    id: 'off-market-es',
    label_en: 'Find off-market homes',
    label_es: 'Encontrar casas fuera del mercado',
    normalized_key: 'encontrar casas fuera del mercado',
    actionSpec: { type: 'open_tool', toolId: 'off-market-buyer', label: { en: 'Find off-market homes', es: 'Encontrar casas fuera del mercado' } },
  },
  {
    id: 'off-market-access-en',
    label_en: 'Get off-market access',
    label_es: 'Obtener acceso fuera del mercado',
    normalized_key: 'get off-market access',
    actionSpec: { type: 'open_tool', toolId: 'off-market-buyer', label: { en: 'Get off-market access', es: 'Obtener acceso fuera del mercado' } },
  },

  // --- Phase 4 AEO Guides — Seller ---
  {
    id: 'guide-cost-to-sell-en',
    label_en: 'Cost to Sell Guide',
    label_es: 'Guía de Costos de Venta',
    normalized_key: 'cost to sell guide',
    actionSpec: { type: 'open_guide', guideId: 'cost-to-sell-tucson', label: { en: 'Cost to Sell Guide', es: 'Guía de Costos de Venta' } },
  },
  {
    id: 'guide-cost-to-sell-es',
    label_en: 'Cost to Sell Guide',
    label_es: 'Guía de Costos de Venta',
    normalized_key: 'guia de costos de venta',
    actionSpec: { type: 'open_guide', guideId: 'cost-to-sell-tucson', label: { en: 'Cost to Sell Guide', es: 'Guía de Costos de Venta' } },
  },
  {
    id: 'guide-capital-gains-en',
    label_en: 'Capital Gains Guide',
    label_es: 'Guía de Ganancias de Capital',
    normalized_key: 'capital gains guide',
    actionSpec: { type: 'open_guide', guideId: 'capital-gains-home-sale-arizona', label: { en: 'Capital Gains Guide', es: 'Guía de Ganancias de Capital' } },
  },
  {
    id: 'guide-capital-gains-es',
    label_en: 'Capital Gains Guide',
    label_es: 'Guía de Ganancias de Capital',
    normalized_key: 'guia de ganancias de capital',
    actionSpec: { type: 'open_guide', guideId: 'capital-gains-home-sale-arizona', label: { en: 'Capital Gains Guide', es: 'Guía de Ganancias de Capital' } },
  },
  {
    id: 'guide-sell-or-rent-en',
    label_en: 'Sell or Rent Guide',
    label_es: 'Guía Vender o Rentar',
    normalized_key: 'sell or rent guide',
    actionSpec: { type: 'open_guide', guideId: 'sell-or-rent-tucson', label: { en: 'Sell or Rent Guide', es: 'Guía Vender o Rentar' } },
  },
  {
    id: 'guide-how-long-en',
    label_en: 'How Long to Sell Guide',
    label_es: 'Cuánto Tarda Vender',
    normalized_key: 'how long to sell guide',
    actionSpec: { type: 'open_guide', guideId: 'how-long-to-sell-tucson', label: { en: 'How Long to Sell Guide', es: 'Cuánto Tarda Vender' } },
  },
  // --- Phase 4 AEO Guides — Buyer ---
  {
    id: 'guide-first-time-programs-en',
    label_en: 'First-Time Buyer Programs',
    label_es: 'Programas para Compradores',
    normalized_key: 'first-time buyer programs',
    actionSpec: { type: 'open_guide', guideId: 'arizona-first-time-buyer-programs', label: { en: 'First-Time Buyer Programs', es: 'Programas para Compradores' } },
  },
  {
    id: 'guide-first-time-programs-es',
    label_en: 'First-Time Buyer Programs',
    label_es: 'Programas para Compradores',
    normalized_key: 'programas para compradores',
    actionSpec: { type: 'open_guide', guideId: 'arizona-first-time-buyer-programs', label: { en: 'First-Time Buyer Programs', es: 'Programas para Compradores' } },
  },
  {
    id: 'guide-suburb-comparison-en',
    label_en: 'Tucson Suburb Comparison',
    label_es: 'Comparación de Suburbios',
    normalized_key: 'tucson suburb comparison',
    actionSpec: { type: 'open_guide', guideId: 'tucson-suburb-comparison', label: { en: 'Tucson Suburb Comparison', es: 'Comparación de Suburbios' } },
  },
  {
    id: 'guide-noncitizen-en',
    label_en: 'Non-Citizen Buyer Guide',
    label_es: 'Guía para No Ciudadanos',
    normalized_key: 'non-citizen buyer guide',
    actionSpec: { type: 'open_guide', guideId: 'buying-home-noncitizen-arizona', label: { en: 'Non-Citizen Buyer Guide', es: 'Guía para No Ciudadanos' } },
  },
  {
    id: 'guide-noncitizen-es',
    label_en: 'Non-Citizen Buyer Guide',
    label_es: 'Guía para No Ciudadanos',
    normalized_key: 'guia para no ciudadanos',
    actionSpec: { type: 'open_guide', guideId: 'buying-home-noncitizen-arizona', label: { en: 'Non-Citizen Buyer Guide', es: 'Guía para No Ciudadanos' } },
  },
  {
    id: 'guide-glossary-en',
    label_en: 'AZ Real Estate Glossary',
    label_es: 'Glosario de Bienes Raíces',
    normalized_key: 'az real estate glossary',
    actionSpec: { type: 'open_guide', guideId: 'arizona-real-estate-glossary', label: { en: 'AZ Real Estate Glossary', es: 'Glosario de Bienes Raíces' } },
  },

  // --- Market Intelligence ---
  {
    id: 'tool-market-intelligence-en',
    label_en: 'Tucson Market Data',
    label_es: 'Datos del Mercado Tucson',
    normalized_key: 'tucson market data',
    actionSpec: { type: 'navigate', path: '/v2/market', label: { en: 'Tucson Market Data', es: 'Datos del Mercado Tucson' } },
  },
  {
    id: 'tool-market-intelligence-es',
    label_en: 'Tucson Market Data',
    label_es: 'Datos del Mercado Tucson',
    normalized_key: 'datos del mercado tucson',
    actionSpec: { type: 'navigate', path: '/v2/market', label: { en: 'Tucson Market Data', es: 'Datos del Mercado Tucson' } },
  },
  // --- Neighborhood Compare ---
  {
    id: 'tool-neighborhood-compare-en',
    label_en: 'Compare Neighborhoods',
    label_es: 'Comparar Vecindarios',
    normalized_key: 'compare neighborhoods',
    actionSpec: { type: 'navigate', path: '/v2/neighborhood-compare', label: { en: 'Compare Neighborhoods', es: 'Comparar Vecindarios' } },
  },
  {
    id: 'tool-neighborhood-compare-es',
    label_en: 'Compare Neighborhoods',
    label_es: 'Comparar Vecindarios',
    normalized_key: 'comparar vecindarios',
    actionSpec: { type: 'navigate', path: '/v2/neighborhood-compare', label: { en: 'Compare Neighborhoods', es: 'Comparar Vecindarios' } },
  },
  // --- Buyer Closing Costs ---
  {
    id: 'tool-closing-costs-en',
    label_en: 'Estimate Closing Costs',
    label_es: 'Estimar Costos de Cierre',
    normalized_key: 'estimate closing costs',
    actionSpec: { type: 'navigate', path: '/v2/buyer-closing-costs', label: { en: 'Estimate Closing Costs', es: 'Estimar Costos de Cierre' } },
  },
  {
    id: 'tool-closing-costs-es',
    label_en: 'Estimate Closing Costs',
    label_es: 'Estimar Costos de Cierre',
    normalized_key: 'estimar costos de cierre',
    actionSpec: { type: 'navigate', path: '/v2/buyer-closing-costs', label: { en: 'Estimate Closing Costs', es: 'Estimar Costos de Cierre' } },
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
