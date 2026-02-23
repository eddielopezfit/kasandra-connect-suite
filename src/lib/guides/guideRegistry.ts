/**
 * Guide Registry - Single Source of Truth
 * 
 * All guides must be registered here with their status.
 * Only guides with status: 'live' will be suggested by Selena.
 * 
 * Tiered taxonomy:
 *   Tier 1 (Pillar) = Life-event authority guides — require video, infographic, PDF
 *   Tier 2 (Supporting) = Decision clarification — require infographic
 *   Tier 3 (Micro) = Social proof / narrative — optional infographic only
 */

export type GuideStatus = 'live' | 'draft' | 'coming_soon';
export type GuideFunnelStage = 'tofu' | 'mofu' | 'bofu';
export type GuideTier = 1 | 2 | 3;

// Strict category type - used for CTA routing and authority messaging
export type GuideCategory = 
  | 'buying' | 'selling' | 'valuation' | 'cash' | 'stories'
  | 'probate' | 'divorce' | 'distressed' | 'military' | 'senior';

// Authority theme for decision-compression messaging
export type AuthorityTheme = 
  | 'buyer_strategy' | 'seller_clarity' | 'cash_structure' 
  | 'valuation_insight' | 'story_empathy'
  | 'probate_clarity' | 'divorce_guidance' | 'distressed_support' 
  | 'military_transition' | 'senior_strategy';

// Disclaimer type for legal/financial content
export type DisclaimerType = 'legal' | 'financial' | 'general';

// Asset slot configuration — render nothing when undefined
export interface GuideAssetSlots {
  videoOverview?: string;    // URL to hosted video (required for Tier 1)
  infographic?: string;      // URL/path to infographic image (required for Tier 1-2)
  pdfGuide?: string;         // URL to downloadable PDF (required for Tier 1 only)
  disclaimer?: DisclaimerType; // Type of disclaimer needed
}

// Destination mapping — what actions each guide offers
export interface GuideDestinations {
  primaryAction: import('@/lib/actions/actionSpec').ActionSpec;
  secondaryActions: import('@/lib/actions/actionSpec').ActionSpec[];  // max 2
  relatedGuideIds: string[];  // max 4
}

export interface GuideRegistryEntry {
  id: string;
  path: string;
  titleEn: string;
  titleEs: string;
  labelEn: string;
  labelEs: string;
  category: GuideCategory;
  status: GuideStatus;
  funnelStage: GuideFunnelStage;
  keywords: string[];
  // Tier governance
  tier: GuideTier;
  lifeEvent: string; // snake_case, singular, canonical, never UI-facing
  assetSlots: GuideAssetSlots;
  // Destination mapping
  destinations: GuideDestinations;
  // Authority metadata for decision-compression guides
  authorityTheme?: AuthorityTheme;
  isCashGuide?: boolean;
  authorityBridge?: { en: string; es: string };
  marketInsight?: { en: string; es: string };
}

export const GUIDE_REGISTRY: GuideRegistryEntry[] = [
  // === TIER 1 — PILLAR GUIDES ===
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
    tier: 1,
    lifeEvent: 'first_time_buying',
    assetSlots: { disclaimer: 'financial' },
    destinations: {
      primaryAction: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Check my readiness', es: 'Verificar mi preparación' } },
      secondaryActions: [
        { type: 'open_chat', payload: { source: 'guide', guideId: 'first-time-buyer-guide', lifeEvent: 'first_time_buying' }, label: { en: 'What does this mean for me?', es: '¿Qué significa esto para mí?' } },
      ],
      relatedGuideIds: ['selling-for-top-dollar', 'cash-offer-guide', 'first-time-buyer-story'],
    },
    authorityTheme: 'buyer_strategy',
    isCashGuide: false,
  },
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
    tier: 1,
    lifeEvent: 'general_selling',
    assetSlots: { disclaimer: 'financial' },
    destinations: {
      primaryAction: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare my options', es: 'Comparar mis opciones' } },
      secondaryActions: [
        { type: 'open_chat', payload: { source: 'guide', guideId: 'selling-for-top-dollar', lifeEvent: 'general_selling' }, label: { en: 'What does this mean for me?', es: '¿Qué significa esto para mí?' } },
      ],
      relatedGuideIds: ['cash-offer-guide', 'understanding-home-valuation', 'seller-stressful-market-story'],
    },
    authorityTheme: 'seller_clarity',
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
    tier: 1,
    lifeEvent: 'cash_vs_traditional',
    assetSlots: { disclaimer: 'financial' },
    destinations: {
      primaryAction: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare my options', es: 'Comparar mis opciones' } },
      secondaryActions: [
        { type: 'open_chat', payload: { source: 'guide', guideId: 'cash-offer-guide', lifeEvent: 'cash_vs_traditional' }, label: { en: 'What does this mean for me?', es: '¿Qué significa esto para mí?' } },
      ],
      relatedGuideIds: ['selling-for-top-dollar', 'understanding-home-valuation'],
    },
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
  {
    id: 'inherited-probate-property',
    path: '/v2/guides/inherited-probate-property',
    titleEn: 'Inherited Property in Pima County: Understanding Your Options',
    titleEs: 'Propiedad Heredada en el Condado de Pima: Entendiendo Sus Opciones',
    labelEn: 'Inherited Property Guide',
    labelEs: 'Guía de Propiedad Heredada',
    category: 'probate',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['inherited', 'probate', 'estate', 'heir', 'heredado', 'herencia', 'sucesion', 'testamento', 'beneficiary', 'beneficiario', 'deceased', 'fallecido', 'passed', 'death', 'will'],
    tier: 1,
    lifeEvent: 'inherited_property',
    assetSlots: { disclaimer: 'legal' },
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'inherited-probate-property', lifeEvent: 'inherited_property' }, label: { en: 'What does this mean for me?', es: '¿Qué significa esto para mí?' } },
      secondaryActions: [
        { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare my options', es: 'Comparar mis opciones' } },
      ],
      relatedGuideIds: ['cash-offer-guide', 'selling-for-top-dollar'],
    },
    authorityTheme: 'probate_clarity',
    isCashGuide: false,
    authorityBridge: {
      en: "Inherited property decisions are rarely just about real estate—they involve family, grief, and legal complexity. Kasandra has guided families through exactly this, with patience and clarity at every step.",
      es: "Las decisiones sobre propiedades heredadas rara vez se tratan solo de bienes raíces—involucran familia, duelo y complejidad legal. Kasandra ha guiado a familias a través de exactamente esto, con paciencia y claridad en cada paso.",
    },
  },

  // === TIER 2 — SUPPORTING GUIDES ===
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
    tier: 2,
    lifeEvent: 'valuation_awareness',
    assetSlots: { disclaimer: 'general' },
    destinations: {
      primaryAction: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare my options', es: 'Comparar mis opciones' } },
      secondaryActions: [
        { type: 'open_chat', payload: { source: 'guide', guideId: 'understanding-home-valuation', lifeEvent: 'valuation_awareness' }, label: { en: 'What does this mean for me?', es: '¿Qué significa esto para mí?' } },
      ],
      relatedGuideIds: ['selling-for-top-dollar', 'cash-offer-guide'],
    },
    authorityTheme: 'valuation_insight',
    isCashGuide: false,
  },

  // === TIER 3 — MICRO GUIDES (Client Stories) ===
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
    tier: 3,
    lifeEvent: 'first_time_buying',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'first-time-buyer-story', lifeEvent: 'first_time_buying' }, label: { en: 'Continue the conversation', es: 'Continuar la conversación' } },
      secondaryActions: [],
      relatedGuideIds: [],
    },
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
    tier: 3,
    lifeEvent: 'budget_buying',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'budget-buyer-story', lifeEvent: 'budget_buying' }, label: { en: 'Continue the conversation', es: 'Continuar la conversación' } },
      secondaryActions: [],
      relatedGuideIds: [],
    },
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
    tier: 3,
    lifeEvent: 'general_selling',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'seller-stressful-market-story', lifeEvent: 'general_selling' }, label: { en: 'Continue the conversation', es: 'Continuar la conversación' } },
      secondaryActions: [],
      relatedGuideIds: [],
    },
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
    tier: 3,
    lifeEvent: 'bilingual_service',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'spanish-speaking-client-story', lifeEvent: 'bilingual_service' }, label: { en: 'Continue the conversation', es: 'Continuar la conversación' } },
      secondaryActions: [],
      relatedGuideIds: [],
    },
    authorityTheme: 'story_empathy',
    isCashGuide: false,
  },
];

// ============= HELPER FUNCTIONS =============

export const getLiveGuides = (): GuideRegistryEntry[] => {
  const live = GUIDE_REGISTRY.filter(g => g.status === 'live');
  if (!import.meta.env.PROD) live.forEach(validateTierAssets);
  return live;
};

export const getGuideById = (id: string): GuideRegistryEntry | undefined => 
  GUIDE_REGISTRY.find(g => g.id === id);

export const isGuideLive = (id: string): boolean => {
  const guide = getGuideById(id);
  return guide !== undefined && guide.status === 'live';
};

export const getLiveGuideIds = (): Set<string> => 
  new Set(getLiveGuides().map(g => g.id));

export const findGuidesByKeyword = (keyword: string): GuideRegistryEntry[] => {
  const lower = keyword.toLowerCase();
  return getLiveGuides().filter(g => 
    g.keywords.some(kw => lower.includes(kw) || kw.includes(lower))
  );
};

export const getGuidesByCategory = (category: GuideRegistryEntry['category']): GuideRegistryEntry[] =>
  getLiveGuides().filter(g => g.category === category);

export const getGuidesByFunnelStage = (stage: GuideFunnelStage): GuideRegistryEntry[] =>
  getLiveGuides().filter(g => g.funnelStage === stage);

export const getGuidesByTier = (tier: GuideTier): GuideRegistryEntry[] =>
  getLiveGuides().filter(g => g.tier === tier);

export const getGuidesByLifeEvent = (lifeEvent: string): GuideRegistryEntry[] =>
  getLiveGuides().filter(g => g.lifeEvent === lifeEvent);

export const getGuideDestinations = (guideId: string): GuideDestinations | undefined => {
  const guide = getGuideById(guideId);
  return guide?.destinations;
};

/**
 * Dev-only: Warn if a Tier 1 guide is missing required asset slots
 */
export const validateTierAssets = (entry: GuideRegistryEntry): void => {
  if (import.meta.env.PROD) return;
  if (entry.tier === 1) {
    const missing: string[] = [];
    if (!entry.assetSlots.videoOverview) missing.push('videoOverview');
    if (!entry.assetSlots.infographic) missing.push('infographic');
    if (!entry.assetSlots.pdfGuide) missing.push('pdfGuide');
    if (missing.length > 0) {
      console.warn(`[GuideRegistry] Tier 1 guide "${entry.id}" missing asset slots: ${missing.join(', ')}`);
    }
  }
  if (entry.tier === 2 && !entry.assetSlots.infographic) {
    console.warn(`[GuideRegistry] Tier 2 guide "${entry.id}" missing required infographic asset slot`);
  }
};
