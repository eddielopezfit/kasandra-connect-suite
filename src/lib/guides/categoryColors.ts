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
  | 'tips'
  | 'probate'
  | 'divorce'
  | 'distressed'
  | 'military'
  | 'senior';

export interface CategoryColorConfig {
  strong: string;
  subtle: string;
  accent: string;
  icon: string;
  emotionalIntent: string;
}

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
  probate: {
    strong: 'bg-indigo-700 text-white',
    subtle: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    accent: 'border-l-4 border-l-indigo-600',
    icon: 'text-indigo-700',
    emotionalIntent: 'Gravity, respect, careful guidance',
  },
  divorce: {
    strong: 'bg-purple-600 text-white',
    subtle: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    accent: 'border-l-4 border-l-purple-500',
    icon: 'text-purple-600',
    emotionalIntent: 'Sensitivity, fairness, fresh start',
  },
  distressed: {
    strong: 'bg-orange-600 text-white',
    subtle: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    accent: 'border-l-4 border-l-orange-500',
    icon: 'text-orange-600',
    emotionalIntent: 'Urgency with compassion, practical resolution',
  },
  military: {
    strong: 'bg-teal-700 text-white',
    subtle: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
    accent: 'border-l-4 border-l-teal-600',
    icon: 'text-teal-700',
    emotionalIntent: 'Service, structure, honor',
  },
  senior: {
    strong: 'bg-sky-600 text-white',
    subtle: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
    accent: 'border-l-4 border-l-sky-500',
    icon: 'text-sky-600',
    emotionalIntent: 'Warmth, dignity, next chapter',
  },
};

export function getCategoryColor(category: string): CategoryColorConfig {
  const key = category as GuideColorCategory;
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.all;
}

/**
 * Decision Path Labels — only for guides that exist in registry
 */
export const DECISION_PATH_LABELS: Record<string, { en: string; es: string }> = {
  'first-time-buyer-guide': {
    en: 'Decision: Start Buying',
    es: 'Decisión: Comenzar a Comprar',
  },
  'selling-for-top-dollar': {
    en: 'Decision: Sell vs Wait',
    es: 'Decisión: Vender o Esperar',
  },
  'understanding-home-valuation': {
    en: 'Decision: Know Your Position',
    es: 'Decisión: Conocer Tu Posición',
  },
  'cash-offer-guide': {
    en: 'Decision: Speed vs Price',
    es: 'Decisión: Rapidez vs Precio',
  },
  'inherited-probate-property': {
    en: 'Decision: Inherited Property Options',
    es: 'Decisión: Opciones de Propiedad Heredada',
  },
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
  'cash-vs-traditional-sale': {
    en: 'Decision: Cash vs Traditional',
    es: 'Decisión: Efectivo vs Tradicional',
  },
  'sell-now-or-wait': {
    en: 'Decision: Timing',
    es: 'Decisión: Momento',
  },
  'life-change-selling': {
    en: 'Decision: Life Change',
    es: 'Decisión: Cambio de Vida',
  },
};

export function getDecisionLabel(guideId: string): { en: string; es: string } | null {
  return DECISION_PATH_LABELS[guideId] || null;
}
