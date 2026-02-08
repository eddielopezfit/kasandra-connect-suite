/**
 * Category Color System
 * 
 * Color-coded taxonomy for visual wayfinding across the Guides hub.
 * Used in: category chips, guide card accents, badges, and Selena context.
 * 
 * Design principle: Colors as "accents" not a rainbow UI.
 * Strong = active/primary state, Subtle = hover/secondary state
 */

export type GuideColorCategory = 
  | 'all' 
  | 'buying' 
  | 'selling' 
  | 'valuation' 
  | 'cash' 
  | 'financial' 
  | 'neighborhoods' 
  | 'stories' 
  | 'tips';

export interface CategoryColorConfig {
  /** Strong color for active chip, primary badge */
  strong: string;
  /** Subtle color for hover, secondary contexts */
  subtle: string;
  /** Left-edge accent bar for guide cards */
  accent: string;
  /** Icon color in chips and badges */
  icon: string;
  /** Emotional intent behind this color choice */
  emotionalIntent: string;
}

/**
 * Category → Color → Intent Mapping
 * 
 * Design rationale for each:
 * - Buying (Blue): Calm, trust, stability - "your future home"
 * - Selling (Emerald): Growth, progress, moving forward
 * - Valuation (Amber): Insight, clarity, knowledge
 * - Cash (Amber-Dark): Urgency, certainty, resolution
 * - Financial (Navy): Security, planning, guidance
 * - Neighborhoods (Violet): Discovery, lifestyle, belonging
 * - Stories (Rose): Connection, empathy, warmth
 * - Tips (Slate): Practical, helpful, universal
 */
export const CATEGORY_COLORS: Record<GuideColorCategory, CategoryColorConfig> = {
  all: {
    strong: 'bg-cc-navy text-white',
    subtle: 'bg-white text-cc-charcoal border-cc-sand-dark/50 hover:bg-cc-gold/10 hover:text-cc-gold',
    accent: 'border-l-4 border-l-cc-gold',
    icon: 'text-cc-gold',
    emotionalIntent: 'Default/neutral - browse everything',
  },
  buying: {
    strong: 'bg-blue-600 text-white',
    subtle: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    accent: 'border-l-4 border-l-blue-500',
    icon: 'text-blue-600',
    emotionalIntent: 'Trust, stability, safety - your future home',
  },
  selling: {
    strong: 'bg-emerald-600 text-white',
    subtle: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    accent: 'border-l-4 border-l-emerald-500',
    icon: 'text-emerald-600',
    emotionalIntent: 'Growth, progress, moving forward',
  },
  valuation: {
    strong: 'bg-amber-600 text-white',
    subtle: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    accent: 'border-l-4 border-l-amber-500',
    icon: 'text-amber-600',
    emotionalIntent: 'Insight, clarity, knowledge',
  },
  cash: {
    strong: 'bg-amber-700 text-white',
    subtle: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200',
    accent: 'border-l-4 border-l-amber-600',
    icon: 'text-amber-700',
    emotionalIntent: 'Speed, certainty, resolution',
  },
  financial: {
    strong: 'bg-cc-navy text-white',
    subtle: 'bg-cc-navy/10 text-cc-navy border-cc-navy/20 hover:bg-cc-navy/15',
    accent: 'border-l-4 border-l-cc-navy',
    icon: 'text-cc-navy',
    emotionalIntent: 'Security, planning, guidance',
  },
  neighborhoods: {
    strong: 'bg-violet-600 text-white',
    subtle: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
    accent: 'border-l-4 border-l-violet-500',
    icon: 'text-violet-600',
    emotionalIntent: 'Discovery, lifestyle, belonging',
  },
  stories: {
    strong: 'bg-rose-500 text-white',
    subtle: 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100',
    accent: 'border-l-4 border-l-rose-400',
    icon: 'text-rose-500',
    emotionalIntent: 'Connection, empathy, warmth',
  },
  tips: {
    strong: 'bg-slate-600 text-white',
    subtle: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
    accent: 'border-l-4 border-l-slate-400',
    icon: 'text-slate-600',
    emotionalIntent: 'Practical, helpful, universal',
  },
};

/**
 * Get color config for a category
 */
export function getCategoryColor(category: string): CategoryColorConfig {
  const key = category as GuideColorCategory;
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.all;
}

/**
 * Decision Path Labels
 * Maps guides to their primary decision-compression purpose.
 * Displayed on guide cards to align with "Decision Room" philosophy.
 */
export const DECISION_PATH_LABELS: Record<string, { en: string; es: string }> = {
  // Buying guides
  'first-time-buyer-guide': {
    en: 'Decision: Start Buying',
    es: 'Decisión: Comenzar a Comprar',
  },
  'mortgage-options-explained': {
    en: 'Decision: Choose Loan Type',
    es: 'Decisión: Elegir Tipo de Préstamo',
  },
  'closing-costs-breakdown': {
    en: 'Decision: Budget Preparation',
    es: 'Decisión: Preparar Presupuesto',
  },
  
  // Selling guides
  'selling-for-top-dollar': {
    en: 'Decision: Sell vs Wait',
    es: 'Decisión: Vender o Esperar',
  },
  'home-staging-secrets': {
    en: 'Decision: Prepare to List',
    es: 'Decisión: Preparar para Vender',
  },
  
  // Valuation guides
  'understanding-home-valuation': {
    en: 'Decision: Know Your Position',
    es: 'Decisión: Conocer Tu Posición',
  },
  'cash-offer-guide': {
    en: 'Decision: Speed vs Price',
    es: 'Decisión: Rapidez vs Precio',
  },
  
  // Neighborhood guides
  'tucson-neighborhood-guide': {
    en: 'Decision: Where to Live',
    es: 'Decisión: Dónde Vivir',
  },
  'oro-valley-vs-marana': {
    en: 'Decision: Compare Areas',
    es: 'Decisión: Comparar Zonas',
  },
  
  // Tips
  'negotiation-strategies': {
    en: 'Skill: Negotiate Better',
    es: 'Habilidad: Negociar Mejor',
  },
  
  // Stories (trust-building, not decision-focused)
  'first-time-buyer-story': {
    en: 'Story: First-Time Success',
    es: 'Historia: Éxito Primerizo',
  },
  'budget-buyer-story': {
    en: 'Story: Budget Success',
    es: 'Historia: Éxito con Presupuesto',
  },
  'seller-stressful-market-story': {
    en: 'Story: Seller Confidence',
    es: 'Historia: Confianza del Vendedor',
  },
  'spanish-speaking-client-story': {
    en: 'Story: Bilingual Support',
    es: 'Historia: Apoyo Bilingüe',
  },
};

/**
 * Get decision path label for a guide
 */
export function getDecisionLabel(guideId: string): { en: string; es: string } | null {
  return DECISION_PATH_LABELS[guideId] || null;
}
