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

/** @deprecated Removed as part of Guide-First Restructure. Mid-guide CTAs are no longer rendered. */
export type MidGuidePromptKey = never;

// Asset slot configuration — render nothing when undefined
// Governance: fields are optional per tier. No console warnings for missing optional slots.
//   Tier 1: videoOverview, infographic, pdfGuide encouraged but not enforced at runtime
//   Tier 2: infographic encouraged
//   Tier 3: no assets expected (text-only, stripped by getGovernedMediaSlots)
export interface GuideAssetSlots {
  videoOverview?: string;    // URL to hosted video
  infographic?: string;      // URL/path to infographic image
  pdfGuide?: string;         // URL to downloadable PDF
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
  /** @deprecated Removed in Guide-First Restructure. Do not use. */
  midGuideCTA?: never;
  /** @deprecated Removed in Guide-First Restructure. Do not use. */
  exitRampCopy?: never;
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
    path: '/guides/first-time-buyer-guide',
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
    authorityTheme: 'buyer_strategy',
    isCashGuide: false,
  },
  {
    id: 'selling-for-top-dollar',
    path: '/guides/selling-for-top-dollar',
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
      relatedGuideIds: ['cash-offer-guide', 'understanding-home-valuation', 'sell-now-or-wait', 'life-change-selling'],
    },
    decisionIntent: 'sell',
    decisionStage: 'explore',
    sortOrder: 20,
    authorityTheme: 'seller_clarity',
    isCashGuide: false,
  },
  {
    id: 'cash-offer-guide',
    path: '/guides/cash-offer-guide',
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
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'cash-offer-guide', lifeEvent: 'cash_vs_traditional' }, label: { en: 'Talk through my situation', es: 'Hablar sobre mi situación' } },
      secondaryActions: [
        { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare my options', es: 'Comparar mis opciones' } },
      ],
      relatedGuideIds: ['selling-for-top-dollar', 'understanding-home-valuation', 'cash-vs-traditional-sale'],
    },
    decisionIntent: 'cash',
    decisionStage: 'compare',
    sortOrder: 30,
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
    path: '/guides/inherited-probate-property',
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
    path: '/guides/understanding-home-valuation',
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
    funnelStage: 'mofu',
    keywords: ['value', 'valuation', 'worth', 'price', 'cma', 'valor', 'precio', 'cuánto'],
    tier: 2,
    lifeEvent: 'valuation_awareness',
    assetSlots: { disclaimer: 'general' },
    destinations: {
      primaryAction: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare my options', es: 'Comparar mis opciones' } },
      secondaryActions: [
        { type: 'open_chat', payload: { source: 'guide', guideId: 'understanding-home-valuation', lifeEvent: 'valuation_awareness' }, label: { en: 'What does this mean for me?', es: '¿Qué significa esto para mí?' } },
      ],
      relatedGuideIds: ['selling-for-top-dollar', 'cash-offer-guide', 'sell-now-or-wait'],
    },
    decisionIntent: 'value',
    decisionStage: 'explore',
    sortOrder: 50,
    authorityTheme: 'valuation_insight',
    isCashGuide: false,
  },

  // === TIER 3 — MICRO GUIDES (Client Stories) ===
  {
    id: 'first-time-buyer-story',
    path: '/guides/first-time-buyer-story',
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
      relatedGuideIds: ['first-time-buyer-guide', 'arizona-first-time-buyer-programs', 'relocating-to-tucson'],
    },
    decisionIntent: 'trust',
    decisionStage: 'explore',
    sortOrder: 70,
    authorityTheme: 'story_empathy',
    isCashGuide: false,
  },
  {
    id: 'budget-buyer-story',
    path: '/guides/budget-buyer-story',
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
      relatedGuideIds: ['first-time-buyer-guide', 'arizona-first-time-buyer-programs', 'buying-home-noncitizen-arizona'],
    },
    decisionIntent: 'trust',
    decisionStage: 'explore',
    sortOrder: 80,
    authorityTheme: 'story_empathy',
    isCashGuide: false,
  },
  {
    id: 'seller-stressful-market-story',
    path: '/guides/seller-stressful-market-story',
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
      relatedGuideIds: ['selling-for-top-dollar', 'pricing-strategy', 'how-long-to-sell-tucson'],
    },
    decisionIntent: 'trust',
    decisionStage: 'explore',
    sortOrder: 90,
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
      relatedGuideIds: ['first-time-buyer-guide', 'buying-home-noncitizen-arizona', 'relocating-to-tucson'],
    },
    decisionIntent: 'trust',
    decisionStage: 'explore',
    sortOrder: 100,
    authorityTheme: 'story_empathy',
    isCashGuide: false,
  },
  
  // === PHASE 2 — DECISION COMPRESSION GUIDES ===
  {
    id: 'cash-vs-traditional-sale',
    path: '/v2/guides/cash-vs-traditional-sale',
    titleEn: 'Cash Offer vs. Listing Your Tucson Home: What to Expect',
    titleEs: 'Oferta en Efectivo vs. Listar Tu Casa en Tucson: Qué Esperar',
    labelEn: 'Cash vs. Listing',
    labelEs: 'Efectivo vs. Listar',
    descriptionEn: "Learn the trade-offs between a quick cash offer and listing your Tucson home. Calm, clear steps from local Realtor Kasandra Prieto and Selena.",
    descriptionEs: "Conoce las diferencias entre una oferta rápida en efectivo y listar tu casa en Tucson. Pasos claros y tranquilos de la Realtor local Kasandra Prieto y Selena.",
    readTime: "8 min read",
    readTimeEs: "8 min de lectura",
    isFeatured: true,
    category: 'cash',
    status: 'live',
    funnelStage: 'mofu',
    keywords: ['cash', 'traditional', 'compare', 'comparison', 'net', 'proceeds', 'efectivo', 'tradicional', 'comparar', 'comparación', 'neto', 'ganancias', 'which', 'better', 'cuál', 'mejor'],
    tier: 2,
    lifeEvent: 'cash_vs_traditional',
    assetSlots: { disclaimer: 'financial' },
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'cash-vs-traditional-sale', lifeEvent: 'cash_vs_traditional' }, label: { en: 'Help me decide', es: 'Ayúdame a decidir' } },
      secondaryActions: [
        { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Run my numbers', es: 'Calcular mis números' } },
      ],
      relatedGuideIds: ['cash-offer-guide', 'selling-for-top-dollar', 'understanding-home-valuation'],
    },
    decisionIntent: 'cash',
    decisionStage: 'compare',
    sortOrder: 35,
    authorityTheme: 'cash_structure',
    isCashGuide: true,
    authorityBridge: {
      en: "The right path depends on your timeline, your home's condition, and what matters most to you. Kasandra helps homeowners compare these options every week — with real numbers, not hypotheticals.",
      es: "El camino correcto depende de tu línea de tiempo, la condición de tu casa, y lo que más te importa. Kasandra ayuda a propietarios a comparar estas opciones cada semana — con números reales, no hipotéticos.",
    },
    marketInsight: {
      en: "In Tucson's current market, the gap between cash offers and traditional sale proceeds can range from $15,000 to $60,000+ depending on condition, location, and timing. Knowing your specific number changes the conversation entirely.",
      es: "En el mercado actual de Tucson, la diferencia entre ofertas en efectivo y las ganancias de una venta tradicional puede variar de $15,000 a $60,000+ dependiendo de la condición, ubicación y tiempo. Conocer tu número específico cambia la conversación por completo.",
    },
  },

  // --- sell-now-or-wait ---
  {
    id: 'sell-now-or-wait',
    path: '/v2/guides/sell-now-or-wait',
    titleEn: 'Sell Now or Wait? How Tucson Homeowners Decide',
    titleEs: '¿Vender Ahora o Esperar? Cómo Deciden los Propietarios en Tucson',
    labelEn: 'Sell Now or Wait?',
    labelEs: '¿Vender Ahora o Esperar?',
    descriptionEn: 'A calm, clear way to decide if you should sell now or wait—based on timeline, priorities, and certainty.',
    descriptionEs: 'Una forma tranquila y clara de decidir si vender ahora o esperar—según tu tiempo, prioridades y certeza.',
    readTime: '9 min read',
    readTimeEs: '9 min de lectura',
    isFeatured: true,
    category: 'selling',
    status: 'live',
    funnelStage: 'mofu',
    keywords: ['sell now', 'wait', 'timing', 'tucson', 'market', 'seller decision', 'vender ahora', 'esperar', 'momento'],
    tier: 2,
    lifeEvent: 'sell_timing',
    assetSlots: { disclaimer: 'financial' },
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'sell-now-or-wait', lifeEvent: 'sell_timing' }, label: { en: 'Help me decide', es: 'Ayúdame a decidir' } },
      secondaryActions: [
        { type: 'open_tool', toolId: 'seller-readiness', label: { en: 'Check my readiness', es: 'Verificar mi preparación' } },
      ],
      relatedGuideIds: ['selling-for-top-dollar', 'understanding-home-valuation', 'cash-vs-traditional-sale'],
    },
    decisionIntent: 'sell',
    decisionStage: 'compare',
    sortOrder: 32,
    authorityTheme: 'seller_clarity',
    isCashGuide: false,
  },

  // --- life-change-selling ---
  {
    id: 'life-change-selling',
    path: '/v2/guides/life-change-selling',
    titleEn: 'Selling After a Life Change (Divorce, Relocation, Downsizing)',
    titleEs: 'Vender Después de un Cambio de Vida (Divorcio, Mudanza, Reducción)',
    labelEn: 'Life Change Selling',
    labelEs: 'Venta por Cambio de Vida',
    descriptionEn: 'A calm, practical guide for selling during a major life transition—without pressure.',
    descriptionEs: 'Una guía práctica y tranquila para vender durante una transición de vida—sin presión.',
    readTime: '8 min read',
    readTimeEs: '8 min de lectura',
    category: 'selling',
    status: 'live',
    funnelStage: 'mofu',
    keywords: ['divorce', 'relocation', 'downsizing', 'sell house', 'tucson', 'life change', 'divorcio', 'mudanza', 'reducción'],
    tier: 2,
    lifeEvent: 'life_event_selling',
    assetSlots: { disclaimer: 'general' },
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'life-change-selling', lifeEvent: 'life_event_selling' }, label: { en: 'Talk it through with Selena', es: 'Hablarlo con Selena' } },
      secondaryActions: [
        { type: 'open_tool', toolId: 'seller-readiness', label: { en: 'Check my seller readiness', es: 'Verificar mi preparación para vender' } },
      ],
      relatedGuideIds: ['sell-now-or-wait', 'selling-for-top-dollar', 'cash-vs-traditional-sale'],
    },
    decisionIntent: 'life_event',
    decisionStage: 'decide',
    sortOrder: 34,
    authorityTheme: 'seller_clarity',
    isCashGuide: false,
  },

  // === PHASE 3 — LOCAL DOMINATION GUIDES ===

  // --- military-pcs-guide ---
  {
    id: 'military-pcs-guide',
    path: '/v2/guides/military-pcs-guide',
    titleEn: 'Military & PCS: Buying or Selling a Home in Tucson',
    titleEs: 'Militares y PCS: Comprar o Vender una Casa en Tucson',
    labelEn: 'Military & PCS Guide',
    labelEs: 'Guía para Militares y PCS',
    descriptionEn: 'VA loans, Davis-Monthan timelines, and buying remotely — everything military families need to navigate Tucson real estate.',
    descriptionEs: 'Préstamos VA, tiempos de DMAFB y compra a distancia — todo lo que las familias militares necesitan para navegar los bienes raíces de Tucson.',
    readTime: '11 min read',
    readTimeEs: '11 min de lectura',
    isFeatured: true,
    category: 'military',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['military', 'va loan', 'pcs', 'davis-monthan', 'dmafb', 'veteran', 'militares', 'veterano', 'bah', 'active duty'],
    tier: 1,
    lifeEvent: 'military_pcs',
    assetSlots: { disclaimer: 'financial' },
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'military-pcs-guide', lifeEvent: 'military_pcs' }, label: { en: 'Talk with Kasandra', es: 'Hablar con Kasandra' } },
      secondaryActions: [
        { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Check my readiness', es: 'Verificar mi preparación' } },
      ],
      relatedGuideIds: ['first-time-buyer-guide', 'relocating-to-tucson', 'tucson-neighborhoods'],
    },
    decisionIntent: 'buy',
    decisionStage: 'explore',
    sortOrder: 45,
    authorityTheme: 'buyer_strategy',
    isCashGuide: false,
    authorityBridge: {
      en: "Military timelines don't wait for the perfect market — and neither should your strategy. Kasandra has helped DMAFB buyers and sellers navigate the unique pressures of PCS moves, VA loan requirements, and remote purchasing.",
      es: "Los tiempos militares no esperan el mercado perfecto — y tu estrategia tampoco debería. Kasandra ha ayudado a compradores y vendedores de DMAFB a navegar las presiones únicas de los traslados PCS, requisitos de préstamo VA y compras a distancia.",
    },
  },

  // --- divorce-selling ---
  {
    id: 'divorce-selling',
    path: '/v2/guides/divorce-selling',
    titleEn: 'Selling a Home During Divorce in Arizona: A Clear Path Forward',
    titleEs: 'Vender una Casa Durante el Divorcio en Arizona: Un Camino Claro',
    labelEn: 'Selling During Divorce',
    labelEs: 'Vender Durante el Divorcio',
    descriptionEn: 'Arizona community property law, court-ordered sales, and how to coordinate a transaction when both parties must agree.',
    descriptionEs: 'Ley de propiedad comunitaria de Arizona, ventas ordenadas por el tribunal y cómo coordinar una transacción cuando ambas partes deben estar de acuerdo.',
    readTime: '10 min read',
    readTimeEs: '10 min de lectura',
    isFeatured: true,
    category: 'divorce',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['divorce', 'divorcio', 'separation', 'separación', 'community property', 'court ordered', 'split', 'jointly owned'],
    tier: 1,
    lifeEvent: 'divorce_selling',
    assetSlots: { disclaimer: 'legal' },
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'divorce-selling', lifeEvent: 'divorce_selling' }, label: { en: 'Talk it through with Selena', es: 'Hablarlo con Selena' } },
      secondaryActions: [
        { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare my options', es: 'Comparar mis opciones' } },
      ],
      relatedGuideIds: ['selling-for-top-dollar', 'cash-offer-guide', 'life-change-selling'],
    },
    decisionIntent: 'life_event',
    decisionStage: 'explore',
    sortOrder: 42,
    authorityTheme: 'divorce_guidance',
    isCashGuide: false,
    authorityBridge: {
      en: "Selling a home during a divorce involves two parties, one transaction, and a lot of pressure. Kasandra has helped divorcing sellers in Tucson navigate this with patience, neutrality, and clear guidance at every step.",
      es: "Vender una casa durante un divorcio involucra a dos partes, una transacción y mucha presión. Kasandra ha ayudado a vendedores en proceso de divorcio en Tucson a navegar esto con paciencia, neutralidad y orientación clara en cada paso.",
    },
  },

  // --- senior-downsizing ---
  {
    id: 'senior-downsizing',
    path: '/v2/guides/senior-downsizing',
    titleEn: "Downsizing in Tucson: A Senior Homeowner's Guide",
    titleEs: 'Reducción de Tamaño en Tucson: Guía para Propietarios Mayores',
    labelEn: 'Senior Downsizing Guide',
    labelEs: 'Guía para Reducir Tamaño',
    descriptionEn: "Green Valley, Oro Valley, 55+ communities, and how to make the transition on your terms — not the market's.",
    descriptionEs: "Green Valley, Oro Valley, comunidades 55+ y cómo hacer la transición en tus términos — no los del mercado.",
    readTime: '10 min read',
    readTimeEs: '10 min de lectura',
    isFeatured: true,
    category: 'senior',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['senior', 'downsizing', 'retirement', 'green valley', '55+', 'jubilación', 'mayores', 'reducción', 'oro valley', 'retire'],
    tier: 1,
    lifeEvent: 'senior_downsizing',
    assetSlots: { disclaimer: 'financial' },
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'senior-downsizing', lifeEvent: 'senior_downsizing' }, label: { en: 'What does this mean for me?', es: '¿Qué significa esto para mí?' } },
      secondaryActions: [
        { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare my options', es: 'Comparar mis opciones' } },
      ],
      relatedGuideIds: ['selling-for-top-dollar', 'tucson-neighborhoods', 'cash-offer-guide'],
    },
    decisionIntent: 'life_event',
    decisionStage: 'explore',
    sortOrder: 43,
    authorityTheme: 'senior_strategy',
    isCashGuide: false,
    authorityBridge: {
      en: "Downsizing is one of the most personal real estate decisions there is — and Tucson has more right-sized options than most markets. Kasandra helps senior homeowners make this transition without pressure, on their timeline.",
      es: "Reducir el tamaño es una de las decisiones inmobiliarias más personales que existen — y Tucson tiene más opciones del tamaño correcto que la mayoría de los mercados.",
    },
  },

  // --- distressed-preforeclosure ---
  {
    id: 'distressed-preforeclosure',
    path: '/v2/guides/distressed-preforeclosure',
    titleEn: 'Facing Financial Hardship? Your Options as a Tucson Homeowner',
    titleEs: '¿Enfrentando Dificultades Financieras? Tus Opciones como Propietario en Tucson',
    labelEn: 'Hardship & Pre-Foreclosure',
    labelEs: 'Dificultad y Pre-Ejecución Hipotecaria',
    descriptionEn: 'What to do before foreclosure — loan modification, short sale, cash exit, and free local resources for Tucson homeowners.',
    descriptionEs: 'Qué hacer antes de la ejecución hipotecaria — modificación de préstamo, venta corta, salida en efectivo y recursos locales gratuitos para propietarios de Tucson.',
    readTime: '12 min read',
    readTimeEs: '12 min de lectura',
    isFeatured: false,
    category: 'distressed',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['foreclosure', 'ejecución', 'behind on mortgage', 'atrasado', 'short sale', 'hardship', 'pre-foreclosure', 'dificultad', 'help'],
    tier: 1,
    lifeEvent: 'distressed_situation',
    assetSlots: { disclaimer: 'legal' },
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'distressed-preforeclosure', lifeEvent: 'distressed_situation' }, label: { en: 'Talk through my options', es: 'Hablar sobre mis opciones' } },
      secondaryActions: [
        { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare my options', es: 'Comparar mis opciones' } },
      ],
      relatedGuideIds: ['cash-offer-guide', 'cash-vs-traditional-sale', 'inherited-probate-property'],
    },
    decisionIntent: 'sell',
    decisionStage: 'decide',
    sortOrder: 44,
    authorityTheme: 'distressed_support',
    isCashGuide: false,
    authorityBridge: {
      en: "When time is short and options feel limited, the most important thing is to start the conversation early. Kasandra handles distressed situations with confidentiality and no pressure — your best outcome is the only goal.",
      es: "Cuando el tiempo es corto y las opciones parecen limitadas, lo más importante es comenzar la conversación temprano. Kasandra maneja situaciones de dificultad con confidencialidad y sin presión.",
    },
  },

  // --- move-up-buyer ---
  {
    id: 'move-up-buyer',
    path: '/v2/guides/move-up-buyer',
    titleEn: 'Move-Up Buying in Tucson: How to Buy and Sell at the Same Time',
    titleEs: 'Comprar para Avanzar en Tucson: Cómo Comprar y Vender al Mismo Tiempo',
    labelEn: 'Move-Up Buyer Guide',
    labelEs: 'Guía para Compradores que Avanzan',
    descriptionEn: "Sell first or buy first? Bridge loans, contingency offers, and how to sequence Tucson's most complex transaction.",
    descriptionEs: '¿Vender primero o comprar primero? Préstamos puente, ofertas de contingencia y cómo secuenciar la transacción más compleja de Tucson.',
    readTime: '10 min read',
    readTimeEs: '10 min de lectura',
    category: 'buying',
    status: 'live',
    funnelStage: 'mofu',
    keywords: ['move up', 'upsize', 'upgrade home', 'sell and buy', 'bridge loan', 'contingency', 'already own', 'upgrading', 'equity'],
    tier: 2,
    lifeEvent: 'move_up_buying',
    assetSlots: { disclaimer: 'financial' },
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'move-up-buyer', lifeEvent: 'move_up_buying' }, label: { en: 'Help me plan my move', es: 'Ayúdame a planear mi mudanza' } },
      secondaryActions: [
        { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'See my equity options', es: 'Ver mis opciones de capital' } },
      ],
      relatedGuideIds: ['selling-for-top-dollar', 'sell-now-or-wait', 'pricing-strategy'],
    },
    decisionIntent: 'sell',
    decisionStage: 'compare',
    sortOrder: 36,
    authorityTheme: 'seller_clarity',
    isCashGuide: false,
  },

  // --- relocating-to-tucson ---
  {
    id: 'relocating-to-tucson',
    path: '/v2/guides/relocating-to-tucson',
    titleEn: 'Relocating to Tucson: What Every Incoming Buyer Should Know',
    titleEs: 'Mudarse a Tucson: Lo Que Todo Comprador Entrante Debe Saber',
    labelEn: 'Relocating to Tucson',
    labelEs: 'Mudarse a Tucson',
    descriptionEn: 'Neighborhoods, remote buying, property tax surprises, monsoon season — everything out-of-state buyers wish they knew first.',
    descriptionEs: 'Vecindarios, compra remota, sorpresas de impuestos de propiedad, temporada de monzones — todo lo que los compradores de fuera del estado desearían haber sabido primero.',
    readTime: '12 min read',
    readTimeEs: '12 min de lectura',
    isFeatured: true,
    category: 'buying',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['relocation', 'relocate', 'move to tucson', 'moving to arizona', 'out of state', 'remote buying', 'mudarse', 'reubicación', 'california', 'texas'],
    tier: 1,
    lifeEvent: 'relocation_buying',
    assetSlots: { disclaimer: 'financial' },
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'relocating-to-tucson', lifeEvent: 'relocation_buying' }, label: { en: 'Ask Selena about Tucson', es: 'Preguntarle a Selena sobre Tucson' } },
      secondaryActions: [
        { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Check my readiness', es: 'Verificar mi preparación' } },
      ],
      relatedGuideIds: ['tucson-neighborhoods', 'first-time-buyer-guide', 'pima-county-property-taxes'],
    },
    decisionIntent: 'buy',
    decisionStage: 'explore',
    sortOrder: 12,
    authorityTheme: 'buyer_strategy',
    isCashGuide: false,
    authorityBridge: {
      en: "Relocating buyers face a specific challenge: making a major financial decision about a city they may not know well. Kasandra has helped dozens of incoming buyers navigate Tucson's neighborhoods, climate quirks, and remote purchase process.",
      es: "Los compradores de reubicación enfrentan un desafío específico: tomar una decisión financiera importante sobre una ciudad que quizás no conocen bien.",
    },
  },

  // --- home-prep-staging ---
  {
    id: 'home-prep-staging',
    path: '/v2/guides/home-prep-staging',
    titleEn: 'How to Prepare Your Tucson Home for Sale',
    titleEs: 'Cómo Preparar Tu Casa en Tucson para la Venta',
    labelEn: 'Home Prep & Staging',
    labelEs: 'Preparación y Presentación',
    descriptionEn: 'The high-ROI prep list for Tucson sellers — what to fix, what to skip, and desert-specific items most sellers miss.',
    descriptionEs: 'La lista de preparación de alto ROI para vendedores de Tucson — qué arreglar, qué omitir y elementos específicos del desierto que la mayoría de los vendedores pasan por alto.',
    readTime: '9 min read',
    readTimeEs: '9 min de lectura',
    category: 'selling',
    status: 'live',
    funnelStage: 'mofu',
    keywords: ['staging', 'prep', 'prepare', 'fix up', 'repairs', 'before listing', 'improve', 'presentación', 'preparar', 'reparaciones'],
    tier: 2,
    lifeEvent: 'general_selling',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_tool', toolId: 'seller-readiness', label: { en: 'Check my seller readiness', es: 'Verificar mi preparación para vender' } },
      secondaryActions: [
        { type: 'open_chat', payload: { source: 'guide', guideId: 'home-prep-staging', lifeEvent: 'general_selling' }, label: { en: 'Get prep advice from Selena', es: 'Obtener consejos de preparación de Selena' } },
      ],
      relatedGuideIds: ['selling-for-top-dollar', 'pricing-strategy', 'sell-now-or-wait'],
    },
    decisionIntent: 'sell',
    decisionStage: 'compare',
    sortOrder: 22,
    authorityTheme: 'seller_clarity',
    isCashGuide: false,
  },

  // --- pricing-strategy ---
  {
    id: 'pricing-strategy',
    path: '/v2/guides/pricing-strategy',
    titleEn: "How to Price Your Tucson Home: A Seller's Strategy Guide",
    titleEs: 'Cómo Fijar el Precio de Tu Casa en Tucson: Guía de Estrategia para Vendedores',
    labelEn: 'Home Pricing Strategy',
    labelEs: 'Estrategia de Precio',
    descriptionEn: 'What comps actually mean, the real cost of overpricing, and how to read a CMA in Tucson\'s balanced market.',
    descriptionEs: 'Lo que realmente significan los comps, el costo real de sobrevalorar y cómo leer un CMA en el mercado equilibrado de Tucson.',
    readTime: '10 min read',
    readTimeEs: '10 min de lectura',
    isFeatured: true,
    category: 'selling',
    status: 'live',
    funnelStage: 'mofu',
    keywords: ['pricing', 'price', 'cma', 'comps', 'how much', 'worth', 'list price', 'precio', 'cuánto vale', 'valoración', 'market value'],
    tier: 2,
    lifeEvent: 'general_selling',
    assetSlots: { disclaimer: 'financial' },
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'pricing-strategy', lifeEvent: 'general_selling' }, label: { en: 'Get a CMA for my home', es: 'Obtener un CMA para mi casa' } },
      secondaryActions: [
        { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare my options', es: 'Comparar mis opciones' } },
      ],
      relatedGuideIds: ['selling-for-top-dollar', 'home-prep-staging', 'sell-now-or-wait'],
    },
    decisionIntent: 'sell',
    decisionStage: 'compare',
    sortOrder: 21,
    authorityTheme: 'seller_clarity',
    isCashGuide: false,
    marketInsight: {
      en: "In January 2026, Tucson homes sold at 97.64% of list price with a median of 38 days on market. Homes that required price reductions averaged 2–3x longer on market — and netted less after carrying costs.",
      es: "En enero de 2026, las casas en Tucson se vendieron al 97.64% del precio de lista con una mediana de 38 días en mercado. Las casas que requirieron reducciones de precio promediaron 2–3 veces más tiempo en mercado.",
    },
  },

  // --- tucson-neighborhoods ---
  {
    id: 'tucson-neighborhoods',
    path: '/v2/guides/tucson-neighborhoods',
    titleEn: "Tucson Neighborhoods: A Buyer's Area Guide",
    titleEs: 'Vecindarios de Tucson: Guía de Áreas para Compradores',
    labelEn: 'Tucson Neighborhoods Guide',
    labelEs: 'Guía de Vecindarios de Tucson',
    descriptionEn: "Midtown, Foothills, Northwest, Vail, Oro Valley, Green Valley — what each area costs, who lives there, and which fits your life.",
    descriptionEs: "Midtown, Foothills, Noroeste, Vail, Oro Valley, Green Valley — lo que cuesta cada área, quién vive allí y cuál se adapta a tu vida.",
    readTime: '11 min read',
    readTimeEs: '11 min de lectura',
    isFeatured: true,
    category: 'buying',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['neighborhood', 'vecindario', 'area', 'where to live', 'best neighborhoods', 'midtown', 'foothills', 'northwest', 'vail', 'oro valley', 'green valley', 'marana'],
    tier: 1,
    lifeEvent: 'neighborhood_search',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'tucson-neighborhoods', lifeEvent: 'neighborhood_search' }, label: { en: 'Find my neighborhood', es: 'Encontrar mi vecindario' } },
      secondaryActions: [
        { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Check my readiness', es: 'Verificar mi preparación' } },
      ],
      relatedGuideIds: ['relocating-to-tucson', 'first-time-buyer-guide', 'pima-county-property-taxes'],
    },
    decisionIntent: 'buy',
    decisionStage: 'explore',
    sortOrder: 11,
    authorityTheme: 'buyer_strategy',
    isCashGuide: false,
    authorityBridge: {
      en: "Tucson has 8+ distinct residential markets within the metro area. The right one depends on your commute, your budget, your family situation, and what kind of community matters to you. Kasandra knows all of them from direct transaction experience.",
      es: "Tucson tiene 8+ mercados residenciales distintos dentro del área metropolitana. El correcto depende de tu viaje al trabajo, tu presupuesto, tu situación familiar y qué tipo de comunidad te importa.",
    },
  },

  // --- pima-county-property-taxes ---
  {
    id: 'pima-county-property-taxes',
    path: '/v2/guides/pima-county-property-taxes',
    titleEn: 'Pima County Property Taxes: What Tucson Homeowners Should Know',
    titleEs: 'Impuestos de Propiedad del Condado de Pima: Lo Que Deben Saber los Propietarios de Tucson',
    labelEn: 'Pima County Property Taxes',
    labelEs: 'Impuestos de Propiedad del Condado de Pima',
    descriptionEn: "How Arizona's two-value system works, 55+ freeze programs, the LPV reset after purchase, and how to appeal your assessment.",
    descriptionEs: "Cómo funciona el sistema de dos valores de Arizona, programas de congelamiento 55+, el restablecimiento LPV después de la compra y cómo apelar tu tasación.",
    readTime: '10 min read',
    readTimeEs: '10 min de lectura',
    category: 'buying',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['property tax', 'pima county', 'tax rate', 'assessment', 'impuesto', 'property taxes tucson', 'how much tax', 'cuánto impuesto', 'tax appeal', 'senior exemption'],
    tier: 2,
    lifeEvent: 'valuation_awareness',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'pima-county-property-taxes', lifeEvent: 'valuation_awareness' }, label: { en: 'What does this mean for me?', es: '¿Qué significa esto para mí?' } },
      secondaryActions: [
        { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Check my readiness', es: 'Verificar mi preparación' } },
      ],
      relatedGuideIds: ['first-time-buyer-guide', 'relocating-to-tucson', 'senior-downsizing'],
    },
    decisionIntent: 'buy',
    decisionStage: 'explore',
    sortOrder: 55,
    authorityTheme: 'valuation_insight',
    isCashGuide: false,
  },
  // ─── Phase 4: AEO Content Gap Guides ────────────────────────────────────

  {
    id: 'cost-to-sell-tucson',
    path: '/v2/guides/cost-to-sell-tucson',
    titleEn: 'What Does It Actually Cost to Sell a House in Tucson?',
    titleEs: '¿Cuánto Cuesta Realmente Vender una Casa en Tucson?',
    labelEn: 'Cost to Sell in Tucson',
    labelEs: 'Costo de Vender en Tucson',
    descriptionEn: 'The full breakdown — commission, closing costs, prep, holding costs, and what you actually walk away with.',
    descriptionEs: 'El desglose completo — comisión, costos de cierre, preparación, costos de tenencia y lo que realmente te llevas.',
    readTime: '9 min read',
    readTimeEs: '9 min de lectura',
    isFeatured: true,
    category: 'selling',
    status: 'live',
    funnelStage: 'mofu',
    keywords: ['cost to sell', 'how much does it cost', 'closing costs', 'commission', 'net proceeds', 'what do I walk away with', 'cuánto cuesta vender', 'costos de venta', 'closing costs seller', 'commission tucson', 'cuánto cuesta vender casa tucson'],
    tier: 1,
    lifeEvent: 'general_selling',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'cost-to-sell-tucson', lifeEvent: 'general_selling' }, label: { en: 'Run my net sheet', es: 'Calcular mi hoja de neto' } },
      secondaryActions: [
        { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Run the comparison', es: 'Ejecutar la comparación' } },
      ],
      relatedGuideIds: ['selling-for-top-dollar', 'cash-vs-traditional-sale'],
    },
    decisionIntent: 'sell',
    decisionStage: 'compare',
    sortOrder: 31,
    authorityTheme: 'seller_clarity',
    isCashGuide: false,
  },

  {
    id: 'arizona-real-estate-glossary',
    path: '/v2/guides/arizona-real-estate-glossary',
    titleEn: 'Arizona Real Estate Glossary — Tucson Edition',
    titleEs: 'Glosario de Bienes Raíces de Arizona — Edición Tucson',
    labelEn: 'Real Estate Glossary',
    labelEs: 'Glosario de Bienes Raíces',
    descriptionEn: "Every term you'll encounter — SPDS, BINSR, earnest money, deed of trust, contingency — explained in plain English.",
    descriptionEs: "Cada término que encontrarás — SPDS, BINSR, dinero en serio, escritura de fideicomiso, contingencia — explicado en español claro.",
    readTime: '12 min read',
    readTimeEs: '12 min de lectura',
    isFeatured: false,
    category: 'buying',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['glossary', 'terms', 'SPDS', 'BINSR', 'earnest money', 'escrow', 'contingency', 'deed of trust', 'glosario', 'términos', 'dinero en serio', 'fideicomiso', 'real estate glossary arizona', 'what is SPDS arizona', 'what is BINSR', 'earnest money arizona'],
    tier: 2,
    lifeEvent: 'first_time_buyer',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'arizona-real-estate-glossary', lifeEvent: 'first_time_buyer' }, label: { en: 'Ask Selena a question', es: 'Preguntarle a Selena' } },
      secondaryActions: [],
      relatedGuideIds: ['first-time-buyer-guide'],
    },
    decisionIntent: 'buy',
    decisionStage: 'explore',
    sortOrder: 56,
    authorityTheme: 'buyer_strategy',
    isCashGuide: false,
  },

  {
    id: 'tucson-suburb-comparison',
    path: '/v2/guides/tucson-suburb-comparison',
    titleEn: 'Marana vs. Oro Valley vs. Sahuarita vs. Vail',
    titleEs: 'Marana vs. Oro Valley vs. Sahuarita vs. Vail',
    labelEn: 'Suburb Comparison',
    labelEs: 'Comparación de Suburbios',
    descriptionEn: 'The honest side-by-side: schools, prices, commutes, and who each suburb is actually right for.',
    descriptionEs: 'La comparación honesta lado a lado: escuelas, precios, trayectos y para quién es realmente correcto cada suburbio.',
    readTime: '10 min read',
    readTimeEs: '10 min de lectura',
    isFeatured: true,
    category: 'buying',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['marana', 'oro valley', 'sahuarita', 'vail', 'rita ranch', 'tucson suburbs', 'best suburb', 'compare neighborhoods', 'suburbios de tucson', 'marana vs oro valley', 'tucson suburb comparison', 'sahuarita vs vail', 'where to live tucson'],
    tier: 1,
    lifeEvent: 'relocation_buying',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'tucson-suburb-comparison', lifeEvent: 'relocation_buying' }, label: { en: 'Which suburb fits me?', es: '¿Qué suburbio me conviene?' } },
      secondaryActions: [],
      relatedGuideIds: ['relocating-to-tucson', 'tucson-neighborhoods'],
    },
    decisionIntent: 'buy',
    decisionStage: 'explore',
    sortOrder: 13,
    authorityTheme: 'buyer_strategy',
    isCashGuide: false,
  },

  {
    id: 'arizona-first-time-buyer-programs',
    path: '/v2/guides/arizona-first-time-buyer-programs',
    titleEn: 'First-Time Home Buyer Programs in Arizona — 2025 & 2026',
    titleEs: 'Programas para Compradores Primerizos en Arizona — 2025 y 2026',
    labelEn: 'First-Time Buyer Programs',
    labelEs: 'Programas para Compradores Primerizos',
    descriptionEn: "HOME Plus, Pathway to Purchase, Pima Tucson Homebuyer's Solution, FHA, VA, USDA — what's available and who qualifies.",
    descriptionEs: 'HOME Plus, Pathway to Purchase, Solución para Compradores de Pima Tucson, FHA, VA, USDA — qué está disponible y quién califica.',
    readTime: '11 min read',
    readTimeEs: '11 min de lectura',
    isFeatured: true,
    category: 'buying',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['first time buyer programs', 'down payment assistance', 'HOME Plus', 'FHA loan', 'USDA loan', 'buyer assistance arizona', 'programas compradores primerizos', 'asistencia pago inicial', 'first time home buyer programs arizona 2025', 'down payment assistance tucson', 'pima county buyer assistance'],
    tier: 1,
    lifeEvent: 'first_time_buyer',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'arizona-first-time-buyer-programs', lifeEvent: 'first_time_buyer' }, label: { en: 'Find out what I qualify for', es: 'Averiguar para qué califico' } },
      secondaryActions: [],
      relatedGuideIds: ['first-time-buyer-guide', 'first-time-buyer-story'],
    },
    decisionIntent: 'buy',
    decisionStage: 'explore',
    sortOrder: 14,
    authorityTheme: 'buyer_strategy',
    isCashGuide: false,
  },

  {
    id: 'capital-gains-home-sale-arizona',
    path: '/v2/guides/capital-gains-home-sale-arizona',
    titleEn: 'Capital Gains Tax When Selling Your Home in Arizona',
    titleEs: 'Impuesto a las Ganancias de Capital al Vender Tu Casa en Arizona',
    labelEn: 'Capital Gains Tax Guide',
    labelEs: 'Guía de Impuesto a Ganancias de Capital',
    descriptionEn: "The $250K/$500K exclusion, Arizona's flat tax, cost basis, and when you actually owe — explained clearly.",
    descriptionEs: "La exclusión de $250K/$500K, el impuesto plano de Arizona, base de costo y cuándo realmente debes — explicado claramente.",
    readTime: '10 min read',
    readTimeEs: '10 min de lectura',
    isFeatured: false,
    category: 'selling',
    status: 'live',
    funnelStage: 'mofu',
    keywords: ['capital gains', 'capital gains tax', 'tax when selling home', 'section 121', 'exclusion', 'arizona home sale tax', 'ganancias de capital', 'impuesto venta casa', 'capital gains tax home sale arizona', 'do I pay capital gains selling my house', 'section 121 exclusion arizona'],
    tier: 2,
    lifeEvent: 'general_selling',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'capital-gains-home-sale-arizona', lifeEvent: 'general_selling' }, label: { en: 'Talk through my tax situation', es: 'Hablar sobre mi situación fiscal' } },
      secondaryActions: [],
      relatedGuideIds: ['cost-to-sell-tucson', 'selling-for-top-dollar'],
    },
    decisionIntent: 'sell',
    decisionStage: 'compare',
    sortOrder: 57,
    authorityTheme: 'seller_clarity',
    isCashGuide: false,
  },

  {
    id: 'sell-or-rent-tucson',
    path: '/v2/guides/sell-or-rent-tucson',
    titleEn: 'Should I Sell or Rent My Tucson Home?',
    titleEs: '¿Debo Vender o Alquilar Mi Casa en Tucson?',
    labelEn: 'Sell or Rent?',
    labelEs: '¿Vender o Alquilar?',
    descriptionEn: 'The cash flow framework, the capital gains window, and how to make the right call for your specific situation.',
    descriptionEs: 'El marco de flujo de efectivo, la ventana de ganancias de capital y cómo tomar la decisión correcta para tu situación específica.',
    readTime: '10 min read',
    readTimeEs: '10 min de lectura',
    isFeatured: false,
    category: 'selling',
    status: 'live',
    funnelStage: 'mofu',
    keywords: ['sell or rent', 'rent vs sell', 'should I rent my house', 'landlord', 'cash flow', 'vender o alquilar', 'arrendar mi casa', 'flujo de efectivo', 'sell or rent tucson', 'should I rent out my house tucson', 'tucson rental market 2025'],
    tier: 2,
    lifeEvent: 'general_selling',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'sell-or-rent-tucson', lifeEvent: 'general_selling' }, label: { en: 'Run the numbers with me', es: 'Calcular los números conmigo' } },
      secondaryActions: [],
      relatedGuideIds: ['sell-now-or-wait', 'capital-gains-home-sale-arizona'],
    },
    decisionIntent: 'sell',
    decisionStage: 'compare',
    sortOrder: 58,
    authorityTheme: 'seller_clarity',
    isCashGuide: false,
  },

  {
    id: 'how-long-to-sell-tucson',
    path: '/v2/guides/how-long-to-sell-tucson',
    titleEn: 'How Long Does It Take to Sell a House in Tucson?',
    titleEs: '¿Cuánto Tiempo Tarda Vender una Casa en Tucson?',
    labelEn: 'How Long to Sell?',
    labelEs: '¿Cuánto Tiempo para Vender?',
    descriptionEn: 'Current Tucson timeline data, what speeds it up, what slows it down — by price range and season.',
    descriptionEs: 'Datos actuales del cronograma de Tucson, qué lo acelera, qué lo ralentiza — por rango de precios y temporada.',
    readTime: '8 min read',
    readTimeEs: '8 min de lectura',
    isFeatured: false,
    category: 'selling',
    status: 'live',
    funnelStage: 'mofu',
    keywords: ['how long to sell', 'days on market', 'timeline selling', 'how fast', 'cuánto tiempo vender', 'días en el mercado', 'cronograma venta', 'how long does it take to sell a house in tucson', 'tucson days on market 2025', 'best time to sell house tucson'],
    tier: 2,
    lifeEvent: 'general_selling',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'how-long-to-sell-tucson', lifeEvent: 'general_selling' }, label: { en: 'Get a timeline for my home', es: 'Obtener un cronograma para mi casa' } },
      secondaryActions: [],
      relatedGuideIds: ['selling-for-top-dollar', 'cost-to-sell-tucson'],
    },
    decisionIntent: 'sell',
    decisionStage: 'explore',
    sortOrder: 59,
    authorityTheme: 'seller_clarity',
    isCashGuide: false,
  },

  {
    id: 'buying-home-noncitizen-arizona',
    path: '/v2/guides/buying-home-noncitizen-arizona',
    titleEn: 'Buying a Home in Arizona as a Non-Citizen or DACA Recipient',
    titleEs: 'Comprar una Casa en Arizona como No Ciudadano o Beneficiario de DACA',
    labelEn: 'Non-Citizen Home Buying',
    labelEs: 'Comprar Casa como No Ciudadano',
    descriptionEn: "What's available by immigration status — green card, visa, DACA, and ITIN loans. The honest guide.",
    descriptionEs: "Lo que está disponible según el estatus migratorio — tarjeta verde, visa, DACA y préstamos ITIN. La guía honesta.",
    readTime: '11 min read',
    readTimeEs: '11 min de lectura',
    isFeatured: true,
    category: 'buying',
    status: 'live',
    funnelStage: 'tofu',
    keywords: ['non citizen', 'DACA', 'ITIN loan', 'green card', 'visa', 'undocumented', 'immigrant homebuyer', 'no ciudadano', 'comprar casa sin ciudadanía', 'préstamo ITIN', 'can DACA recipients buy a house arizona', 'ITIN loan tucson', 'non citizen home buyer arizona'],
    tier: 1,
    lifeEvent: 'first_time_buyer',
    assetSlots: {},
    destinations: {
      primaryAction: { type: 'open_chat', payload: { source: 'guide', guideId: 'buying-home-noncitizen-arizona', lifeEvent: 'first_time_buyer' }, label: { en: 'Talk through my options', es: 'Hablar sobre mis opciones' } },
      secondaryActions: [],
      relatedGuideIds: ['first-time-buyer-guide', 'arizona-first-time-buyer-programs'],
    },
    decisionIntent: 'buy',
    decisionStage: 'explore',
    sortOrder: 15,
    authorityTheme: 'buyer_strategy',
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
 * Dev-only: Warn if a Tier 1/2 guide is missing required orientation media slot.
 * videoOverview, infographic, pdfGuide are optional-by-tier — never warned.
 */
const _validatedIds = new Set<string>();
export const validateTierAssets = (entry: GuideRegistryEntry): void => {
  if (import.meta.env.PROD || _validatedIds.has(entry.id)) return;
  _validatedIds.add(entry.id);
  // No warnings for optional asset slots (videoOverview, infographic, pdfGuide)
  // Orientation media slot validation is handled by guideMediaSlots.ts validateMediaSlots()
};
