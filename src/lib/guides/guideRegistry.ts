/**
 * Guide Registry - Single Source of Truth
 * 
 * All guides must be registered here with their status.
 * Only guides with status: 'live' will be suggested by Selena.
 */

export type GuideStatus = 'live' | 'draft' | 'coming_soon';
export type GuideFunnelStage = 'tofu' | 'mofu' | 'bofu';

// Strict category type - used for CTA routing and authority messaging
export type GuideCategory = 'buying' | 'selling' | 'valuation' | 'cash' | 'stories';

// Authority theme for decision-compression messaging
export type AuthorityTheme = 'buyer_strategy' | 'seller_clarity' | 'cash_structure' | 'valuation_insight' | 'story_empathy';

export interface GuideRegistryEntry {
  id: string;
  path: string;
  titleEn: string;
  titleEs: string;
  labelEn: string; // Short label for action buttons
  labelEs: string;
  category: GuideCategory;
  status: GuideStatus;
  funnelStage: GuideFunnelStage;
  keywords: string[];
  // Authority metadata for decision-compression guides
  authorityTheme?: AuthorityTheme;
  isCashGuide?: boolean;
  authorityBridge?: { en: string; es: string };
  marketInsight?: { en: string; es: string };
}

export const GUIDE_REGISTRY: GuideRegistryEntry[] = [
  // === BUYER GUIDES ===
  {
    id: 'first-time-buyer-guide',
    path: '/v2/guides/first-time-buyer-guide',
    titleEn: "First-Time Home Buyer's Complete Guide",
    titleEs: 'Guía Completa para Compradores de Primera Vivienda',
    labelEn: 'First-Time Buyer Guide',
    labelEs: 'Guía para Compradores Primerizos',
    category: 'buying',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['first', 'new', 'never', 'bought', 'primero', 'nuevo', 'nunca', 'comprado', 'beginner', 'start'],
    authorityTheme: 'buyer_strategy',
    isCashGuide: false,
  },
  
  // === SELLER GUIDES ===
  {
    id: 'selling-for-top-dollar',
    path: '/v2/guides/selling-for-top-dollar',
    titleEn: 'Selling Your Home in Arizona: A Clear Path Forward',
    titleEs: 'Vender Su Casa en Arizona: Un Camino Claro',
    labelEn: 'Selling Your Home Guide',
    labelEs: 'Guía para Vender Su Casa',
    category: 'selling',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['sell', 'selling', 'list', 'listing', 'vender', 'listar', 'timeline', 'process', 'steps', 'how long'],
    authorityTheme: 'seller_clarity',
    isCashGuide: false,
  },
  
  // === VALUATION GUIDES ===
  {
    id: 'understanding-home-valuation',
    path: '/v2/guides/understanding-home-valuation',
    titleEn: "Understanding Your Home's Value",
    titleEs: 'Entendiendo el Valor de Su Casa',
    labelEn: "Understanding Your Home's Value",
    labelEs: 'Entender el Valor de Su Casa',
    category: 'valuation',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['value', 'valuation', 'worth', 'price', 'cma', 'valor', 'precio', 'cuánto'],
    authorityTheme: 'valuation_insight',
    isCashGuide: false,
  },
  {
    id: 'cash-offer-guide',
    path: '/v2/guides/cash-offer-guide',
    titleEn: 'Cash Offers Explained: What Homeowners Should Know',
    titleEs: 'Ofertas en Efectivo Explicadas: Lo Que Los Propietarios Deben Saber',
    labelEn: 'Cash Offer Guide',
    labelEs: 'Guía de Ofertas en Efectivo',
    category: 'cash',
    status: 'live',
    funnelStage: 'mofu',
    keywords: ['cash', 'quick', 'fast', 'as-is', 'efectivo', 'rápido', 'investor', 'inversionista'],
    authorityTheme: 'cash_structure',
    isCashGuide: true,
    authorityBridge: {
      en: "Cash offers seem simple—but they're not. The difference between a good outcome and a costly mistake often comes down to who's evaluating the offer, how it's structured, and what alternatives you're not seeing. This is exactly the kind of decision Kasandra navigates for homeowners every week.",
      es: "Las ofertas en efectivo parecen simples—pero no lo son. La diferencia entre un buen resultado y un error costoso a menudo depende de quién evalúa la oferta, cómo está estructurada, y qué alternativas no está viendo. Este es exactamente el tipo de decisión que Kasandra navega para propietarios cada semana.",
    },
    marketInsight: {
      en: "In Tucson, cash buyer activity varies significantly by neighborhood and season. An offer that looks competitive in July may be low in October. Local knowledge isn't optional—it's the difference between accepting an offer that works for you and settling for one that works for the buyer.",
      es: "En Tucson, la actividad de compradores en efectivo varía significativamente por vecindario y temporada. Una oferta que parece competitiva en julio puede ser baja en octubre. El conocimiento local no es opcional—es la diferencia entre aceptar una oferta que funciona para usted y conformarse con una que funciona para el comprador.",
    },
  },
  
  // === CLIENT STORIES ===
  {
    id: 'first-time-buyer-story',
    path: '/v2/guides/first-time-buyer-story',
    titleEn: 'A First-Time Buyer Finds Her Way',
    titleEs: 'Una Compradora Primeriza Encuentra Su Camino',
    labelEn: 'First-Time Buyer Story',
    labelEs: 'Historia de Compradora Primeriza',
    category: 'stories',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['story', 'client', 'first', 'historia', 'cliente', 'primero'],
    authorityTheme: 'story_empathy',
    isCashGuide: false,
  },
  {
    id: 'budget-buyer-story',
    path: '/v2/guides/budget-buyer-story',
    titleEn: 'Finding Security on a Budget',
    titleEs: 'Encontrando Seguridad con Presupuesto Limitado',
    labelEn: 'Budget Buyer Story',
    labelEs: 'Historia de Comprador con Presupuesto',
    category: 'stories',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['budget', 'affordable', 'presupuesto', 'asequible', 'story', 'historia'],
    authorityTheme: 'story_empathy',
    isCashGuide: false,
  },
  {
    id: 'seller-stressful-market-story',
    path: '/v2/guides/seller-stressful-market-story',
    titleEn: 'Selling in an Uncertain Market',
    titleEs: 'Vendiendo en un Mercado Incierto',
    labelEn: 'Seller Story',
    labelEs: 'Historia de Vendedor',
    category: 'stories',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['seller', 'stress', 'market', 'vendedor', 'estrés', 'mercado', 'story', 'historia'],
    authorityTheme: 'story_empathy',
    isCashGuide: false,
  },
  {
    id: 'spanish-speaking-client-story',
    path: '/v2/guides/spanish-speaking-client-story',
    titleEn: 'A Family Finds Home in Their Language',
    titleEs: 'Una Familia Encuentra Hogar en Su Idioma',
    labelEn: 'Spanish-Speaking Client Story',
    labelEs: 'Historia de Cliente Hispanohablante',
    category: 'stories',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['spanish', 'español', 'bilingual', 'bilingüe', 'story', 'historia', 'language', 'idioma'],
    authorityTheme: 'story_empathy',
    isCashGuide: false,
  },
];

// ============= HELPER FUNCTIONS =============

/**
 * Get all guides with status: 'live'
 */
export const getLiveGuides = (): GuideRegistryEntry[] => 
  GUIDE_REGISTRY.filter(g => g.status === 'live');

/**
 * Get a specific guide by ID
 */
export const getGuideById = (id: string): GuideRegistryEntry | undefined => 
  GUIDE_REGISTRY.find(g => g.id === id);

/**
 * Check if a guide exists and is live
 */
export const isGuideLive = (id: string): boolean => {
  const guide = getGuideById(id);
  return guide !== undefined && guide.status === 'live';
};

/**
 * Get all live guide IDs as a Set (for fast lookup)
 */
export const getLiveGuideIds = (): Set<string> => 
  new Set(getLiveGuides().map(g => g.id));

/**
 * Find matching guides by keyword
 */
export const findGuidesByKeyword = (keyword: string): GuideRegistryEntry[] => {
  const lower = keyword.toLowerCase();
  return getLiveGuides().filter(g => 
    g.keywords.some(kw => lower.includes(kw) || kw.includes(lower))
  );
};

/**
 * Get guides by category
 */
export const getGuidesByCategory = (category: GuideRegistryEntry['category']): GuideRegistryEntry[] =>
  getLiveGuides().filter(g => g.category === category);

/**
 * Get guides by funnel stage
 */
export const getGuidesByFunnelStage = (stage: GuideFunnelStage): GuideRegistryEntry[] =>
  getLiveGuides().filter(g => g.funnelStage === stage);
