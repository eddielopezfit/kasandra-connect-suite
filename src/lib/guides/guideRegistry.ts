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

// Intent + stage types for deterministic routing
export type DecisionIntent = 'buy' | 'sell' | 'value' | 'cash' | 'life_event' | 'trust';
export type DecisionStage = 'explore' | 'compare' | 'decide';

// Mid-guide CTA prompt keys — typed union prevents drift
export type MidGuidePromptKey =
  | 'valuation_confusion'
  | 'selling_options'
  | 'cash_vs_list'
  | 'life_event_support'
  | 'first_time_confidence'
  | 'bilingual_support'
  | 'trust_story_followup';

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
  // Card metadata (single source of truth — no duplicate in V2Guides)
  descriptionEn: string;
  descriptionEs: string;
  readTime: string;
  readTimeEs: string;
  isFeatured?: boolean;
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
  // Intent + stage for deterministic Selena routing
  decisionIntent: DecisionIntent;
  decisionStage: DecisionStage;
  // Stable sort order for grid display
  sortOrder: number;
  // Mid-guide CTA slot
  midGuideCTA?: { afterSection: number; promptKey: MidGuidePromptKey };
  // Soft exit ramp under hero
  exitRampCopy?: { en: string; es: string };
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
    descriptionEn: "Everything you need to know about buying your first home in Tucson, from pre-approval to closing day.",
    descriptionEs: "Todo lo que necesitas saber sobre comprar tu primera casa en Tucson, desde la pre-aprobación hasta el día de cierre.",
    readTime: "14 min read",
    readTimeEs: "14 min de lectura",
    isFeatured: true,
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
    decisionIntent: 'buy',
    decisionStage: 'explore',
    sortOrder: 10,
    midGuideCTA: { afterSection: 1, promptKey: 'first_time_confidence' },
    exitRampCopy: {
      en: "If you'd rather talk this through than read, Selena can help.",
      es: "Si prefieres hablarlo en vez de leer, Selena puede ayudarte.",
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
    descriptionEn: "Strategic tips and proven methods to maximize your home's value and attract qualified buyers.",
    descriptionEs: "Consejos estratégicos y métodos probados para maximizar el valor de tu casa y atraer compradores calificados.",
    readTime: "10 min read",
    readTimeEs: "10 min de lectura",
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
    decisionIntent: 'sell',
    decisionStage: 'explore',
    sortOrder: 20,
    midGuideCTA: { afterSection: 1, promptKey: 'selling_options' },
    exitRampCopy: {
      en: "If you'd rather talk this through than read, Selena can help.",
      es: "Si prefieres hablarlo en vez de leer, Selena puede ayudarte.",
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
    descriptionEn: "Understand how cash offers work, when they make sense, and how to compare with a traditional sale.",
    descriptionEs: "Entienda cómo funcionan las ofertas en efectivo, cuándo tienen sentido y cómo compararlas con una venta tradicional.",
    readTime: "9 min read",
    readTimeEs: "9 min de lectura",
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
    decisionIntent: 'cash',
    decisionStage: 'compare',
    sortOrder: 30,
    midGuideCTA: { afterSection: 2, promptKey: 'cash_vs_list' },
    exitRampCopy: {
      en: "If you'd rather talk this through than read, Selena can help.",
      es: "Si prefieres hablarlo en vez de leer, Selena puede ayudarte.",
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
    descriptionEn: "A clear, no-pressure guide to navigating probate, heirs, and property decisions after a loss.",
    descriptionEs: "Una guía clara, sin presión, para navegar la sucesión, herederos y decisiones de propiedad después de una pérdida.",
    readTime: "12 min read",
    readTimeEs: "12 min de lectura",
    isFeatured: true,
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
    decisionIntent: 'life_event',
    decisionStage: 'explore',
    sortOrder: 40,
    midGuideCTA: { afterSection: 1, promptKey: 'life_event_support' },
    exitRampCopy: {
      en: "If this feels heavy, you don't have to sort it out alone.",
      es: "Si esto se siente pesado, no tienes que resolverlo solo.",
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
    descriptionEn: "Learn what factors affect your home's market value and how to get an accurate assessment.",
    descriptionEs: "Aprende qué factores afectan el valor de mercado de tu casa y cómo obtener una evaluación precisa.",
    readTime: "7 min read",
    readTimeEs: "7 min de lectura",
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
    decisionIntent: 'value',
    decisionStage: 'explore',
    sortOrder: 50,
    midGuideCTA: { afterSection: 1, promptKey: 'valuation_confusion' },
    exitRampCopy: {
      en: "If you'd rather talk this through than read, Selena can help.",
      es: "Si prefieres hablarlo en vez de leer, Selena puede ayudarte.",
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
    descriptionEn: "How one client overcame doubt and found a place to call her own—with patience and guidance every step of the way.",
    descriptionEs: "Cómo una cliente superó sus dudas y encontró un lugar para llamar suyo—con paciencia y guía en cada paso.",
    readTime: "5 min read",
    readTimeEs: "5 min de lectura",
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
    decisionIntent: 'trust',
    decisionStage: 'explore',
    sortOrder: 70,
    midGuideCTA: { afterSection: 1, promptKey: 'trust_story_followup' },
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
    descriptionEn: "A family's story of finding the right home without compromising what mattered most.",
    descriptionEs: "La historia de una familia que encontró el hogar adecuado sin comprometer lo que más importaba.",
    readTime: "5 min read",
    readTimeEs: "5 min de lectura",
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
    decisionIntent: 'trust',
    decisionStage: 'explore',
    sortOrder: 80,
    midGuideCTA: { afterSection: 1, promptKey: 'trust_story_followup' },
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
    descriptionEn: "When the market felt uncertain, clarity and support made all the difference.",
    descriptionEs: "Cuando el mercado se sentía incierto, la claridad y el apoyo hicieron toda la diferencia.",
    readTime: "5 min read",
    readTimeEs: "5 min de lectura",
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
    decisionIntent: 'trust',
    decisionStage: 'explore',
    sortOrder: 90,
    midGuideCTA: { afterSection: 1, promptKey: 'trust_story_followup' },
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
    descriptionEn: "The power of being served in your own language—and feeling heard every step of the way.",
    descriptionEs: "El poder de ser atendida en tu propio idioma—y sentirse escuchada en cada paso.",
    readTime: "5 min read",
    readTimeEs: "5 min de lectura",
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
    decisionIntent: 'trust',
    decisionStage: 'explore',
    sortOrder: 100,
    midGuideCTA: { afterSection: 1, promptKey: 'bilingual_support' },
    authorityTheme: 'story_empathy',
    isCashGuide: false,
  },
];

// ============= HELPER FUNCTIONS =============

export const getLiveGuides = (): GuideRegistryEntry[] => {
  const live = GUIDE_REGISTRY.filter(g => g.status === 'live');
  if (!import.meta.env.PROD) live.forEach(validateTierAssets);
  return live.sort((a, b) => a.sortOrder - b.sortOrder);
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
