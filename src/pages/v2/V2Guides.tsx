import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Home, TrendingUp, Calculator, ArrowRight, DollarSign } from "lucide-react";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import JsonLd from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import V2Layout from "@/components/v2/V2Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import {
  PersonalizedHero,
  RecommendedGuidesCarousel,
  GuideCardBadge,
  SelenaSynthesisFooter,
  ResponsiveCategoryNav,
  DecisionLane,
  TrustStoriesSection,
  CognitiveProgressBar,
  ContextualSelenaPrompt,
  ContinueReadingCard,
  IntentJourneyMap,
} from "@/components/v2/guides";
import type { DecisionLaneIntent } from "@/components/v2/guides/DecisionLane";
import {
  getGuidesRead,
  markGuideOpened,
  setLastGuideId,
  getLastGuideId,
  getIntent,
  isReturningVisitor,
  getRecommendedGuides,
  getGridBadge,
  trackJourneyAction,
  setIntent,
  type Guide,
} from "@/lib/guides/personalization";
import { getCategoryColor, getDecisionLabel } from "@/lib/guides/categoryColors";
import { getLiveGuides, GUIDE_REGISTRY } from "@/lib/guides/guideRegistry";
import { getGovernedMediaSlots } from "@/lib/guides/guideMediaSlots";
import { logEvent } from "@/lib/analytics/logEvent";
import { useCognitiveStage } from "@/hooks/useCognitiveStage";
import { useRecommendationEngine } from "@/hooks/useRecommendationEngine";

import { cn } from "@/lib/utils";

// Categories for filter nav — stories removed (they have their own section now)
const categories = [
  { 
    id: "all", 
    label: "All Guides", 
    labelEs: "Todas las Guías", 
    icon: BookOpen,
    desc: "Browse everything at your own pace",
    descEs: "Explora todo a tu propio ritmo"
  },
  { 
    id: "buying", 
    label: "Starting Your Buying Journey", 
    labelEs: "Comenzando Tu Proceso de Compra", 
    icon: Home,
    desc: "Most people begin here",
    descEs: "La mayoría comienza aquí"
  },
  { 
    id: "selling", 
    label: "Preparing to Sell Confidently", 
    labelEs: "Preparándote para Vender con Confianza", 
    icon: TrendingUp,
    desc: "For homeowners ready to move on",
    descEs: "Para propietarios listos para avanzar"
  },
  {
    id: "cash",
    label: "Cash Offers",
    labelEs: "Ofertas en Efectivo",
    icon: DollarSign,
    desc: "Understand your cash offer options",
    descEs: "Entiende tus opciones de oferta en efectivo"
  },
  { 
    id: "valuation", 
    label: "Understanding Your Value", 
    labelEs: "Entendiendo Tu Valor", 
    icon: Calculator,
    desc: "Know what your home is worth",
    descEs: "Conoce cuánto vale tu casa"
  },
  { 
    id: "probate", 
    label: "Inherited Property", 
    labelEs: "Propiedad Heredada", 
    icon: BookOpen,
    desc: "Guidance for life's most sensitive transitions",
    descEs: "Orientación para las transiciones más sensibles"
  },
  {
    id: "military",
    label: "Military & VA",
    labelEs: "Militares y VA",
    icon: BookOpen,
    desc: "VA loans, PCS, and Davis-Monthan resources",
    descEs: "Préstamos VA, PCS y recursos de DMAFB"
  },
  {
    id: "divorce",
    label: "Divorce & Separation",
    labelEs: "Divorcio y Separación",
    icon: BookOpen,
    desc: "Selling jointly-owned property in Arizona",
    descEs: "Vender propiedad conjunta en Arizona"
  },
  {
    id: "senior",
    label: "Senior & Downsizing",
    labelEs: "Mayores y Reducción",
    icon: BookOpen,
    desc: "55+ communities, Green Valley, right-sizing",
    descEs: "Comunidades 55+, Green Valley y ajuste de tamaño"
  },
  {
    id: "distressed",
    label: "Hardship & Foreclosure",
    labelEs: "Dificultad y Ejecución",
    icon: BookOpen,
    desc: "Options when payments are at risk",
    descEs: "Opciones cuando los pagos están en riesgo"
  },
];

// Derive guide cards from registry — single source of truth
function getGuideCards(): Guide[] {
  return getLiveGuides().map(entry => ({
    id: entry.id,
    title: entry.titleEn,
    titleEs: entry.titleEs,
    description: entry.descriptionEn,
    descriptionEs: entry.descriptionEs,
    category: entry.category,
    isFeatured: entry.isFeatured,
    tier: entry.tier,
    readTime: entry.readTime,
    readTimeEs: entry.readTimeEs,
  }));
}

/** Get orientation thumbnail src for a guide (Tier 1/2 only) */
function getGuideThumbnail(guideId: string): string | null {
  const slots = getGovernedMediaSlots(guideId);
  const orientation = slots.find(s => s.variant === 'orientation' && s.src);
  return orientation?.src ?? null;
}

/** Get guide tier from registry for visual hierarchy */
function getGuideTier(guideId: string): number {
  return GUIDE_REGISTRY.find(g => g.id === guideId)?.tier ?? 2;
}

// Intent-aware CTA labels
function getBookingCTA(intent: DecisionLaneIntent | null, t: (en: string, es: string) => string) {
  switch (intent) {
    case 'sell':
    case 'cash':
      return t("Book a Seller Consult", "Agendar Consulta de Vendedor");
    case 'buy':
      return t("Book a Buyer Consult", "Agendar Consulta de Comprador");
    default:
      return t("Book a Consultation", "Agendar una Cita");
  }
}

// Inner component that uses Selena context (rendered inside V2Layout which provides SelenaChatProvider)
function GuidesContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { openChat, sendMessage } = useSelenaChat();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeIntent, setActiveIntent] = useState<DecisionLaneIntent | null>(null);
  
  // Derive guides from registry
  const allGuides = useMemo(() => getGuideCards(), []);
  
  // Separate stories from educational guides
  const educationalGuides = useMemo(() => allGuides.filter(g => g.category !== 'stories'), [allGuides]);
  const storyGuides = useMemo(() => allGuides.filter(g => g.category === 'stories'), [allGuides]);
  
  useDocumentHead({
    titleEn: "Real Estate Guides | Tucson Home Buying & Selling Education",
    titleEs: "Guías de Bienes Raíces | Educación de Compra y Venta en Tucson",
    descriptionEn: "Free bilingual guides on buying, selling, cash offers, and inherited property in Tucson. Learn at your own pace.",
    descriptionEs: "Guías bilingües gratuitas sobre compra, venta, ofertas en efectivo y propiedad heredada en Tucson.",
  });
  
  // Personalization state
  const [guidesRead, setGuidesReadState] = useState<string[]>([]);
  const [lastGuideId, setLastGuideIdState] = useState<string | null>(null);
  
  const { stage, stageId, shouldShowProgressBar, guidesReadCount } = useCognitiveStage();
  const { hasEngaged } = useRecommendationEngine(allGuides);
  
  useEffect(() => {
    setGuidesReadState(getGuidesRead());
    setLastGuideIdState(getLastGuideId());
    logEvent('guides_page_view', { returning: isReturningVisitor() });
  }, []);
  
  const isReturning = guidesRead.length > 0 || lastGuideId !== null;
  const currentIntent = getIntent();
  const recommendedItems = useMemo(() => getRecommendedGuides(allGuides), [guidesRead, lastGuideId, allGuides]);

  // Filter educational guides by active category
  const filteredGuides = activeCategory === "all" 
    ? educationalGuides 
    : educationalGuides.filter(guide => guide.category === activeCategory);

  const getCategoryLabel = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? t(category.label, category.labelEs) : categoryId;
  };
  
  // Handlers
  const handleStartSelena = useCallback(() => {
    logEvent('ask_selena_clicked', { source: 'hero', stage: stageId });
    openChat({ source: 'hero' });
  }, [openChat, stageId]);
  
  const handleContinue = useCallback(() => {
    logEvent('hero_cta_click', { type: 'continue' });
    if (lastGuideId) {
      navigate(`/v2/guides/${lastGuideId}`);
    } else {
      document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lastGuideId, navigate]);
  
  const handleBrowse = useCallback(() => {
    logEvent('hero_cta_click', { type: 'browse' });
    document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  const handleGuideClick = useCallback((guideId: string) => {
    setLastGuideId(guideId);
    markGuideOpened(guideId);
    logEvent('guide_opened', { guideId, source: 'grid' });
  }, []);
  
  const handleRecommendedGuideClick = useCallback((guideId: string) => {
    const item = recommendedItems.find(r => r.guide.id === guideId);
    logEvent('guide_opened', { guideId, source: 'recommended', badgeType: item?.badgeType });
    handleGuideClick(guideId);
  }, [recommendedItems, handleGuideClick]);
  
  const handleBookConsultation = useCallback(() => {
    logEvent('consultation_cta_clicked', { stage: stageId, source: 'footer', intent: activeIntent });
    trackJourneyAction('book');
    const intentPayload = activeIntent === 'buy' ? 'buy' : activeIntent === 'cash' ? 'cash' : 'sell';
    openChat({ source: 'hero', intent: intentPayload });
  }, [openChat, stageId, activeIntent]);
  
  const handleAskSelena = useCallback((prefillMessage?: string) => {
    logEvent('ask_selena_clicked', { source: 'prompt', stage: stageId, hasPrefill: !!prefillMessage });
    openChat({ source: 'synthesis', guidesReadCount });
    if (prefillMessage) {
      setTimeout(() => sendMessage(prefillMessage), 500);
    }
  }, [openChat, sendMessage, stageId, guidesReadCount]);
  
  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    logEvent('guide_category_selected', { category: categoryId });
  }, []);
  
  // Decision Lane handler — sets intent, maps to category, scrolls to grid
  const handleDecisionLaneIntent = useCallback((intent: DecisionLaneIntent) => {
    logEvent('decision_lane_selected', { intent });
    setActiveIntent(intent);
    setIntent(intent === 'buy' ? 'buy' : intent === 'cash' ? 'cash' : 'sell');
    
    switch (intent) {
      case 'buy':
        setActiveCategory('buying');
        break;
      case 'sell':
        setActiveCategory('selling');
        break;
      case 'cash':
        setActiveCategory('cash');
        break;
    }
    document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  const handleRequestSummary = useCallback(() => {
    logEvent('personalized_summary_offered', { guidesReadCount, stage: stageId });
  }, [guidesReadCount, stageId]);
  
  useEffect(() => {
    if (shouldShowProgressBar) {
      logEvent('journey_checkpoint_shown', { stage: stageId, level: stage.level });
    }
  }, [shouldShowProgressBar, stageId, stage.level]);

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "How do I buy my first home in Tucson?", acceptedAnswer: { "@type": "Answer", text: "Start with pre-approval, explore down payment assistance programs, and work with a bilingual REALTOR® who knows the Tucson market." } },
          { "@type": "Question", name: "Should I accept a cash offer on my house?", acceptedAnswer: { "@type": "Answer", text: "Cash offers trade speed and certainty for a lower price. Compare net proceeds using a calculator and consult a local agent." } },
          { "@type": "Question", name: "What is my Tucson home worth?", acceptedAnswer: { "@type": "Answer", text: "Home values depend on location, condition, and market trends. A Comparative Market Analysis (CMA) gives the most accurate picture." } },
          { "@type": "Question", name: "How do I sell an inherited property in Pima County?", acceptedAnswer: { "@type": "Answer", text: "Inherited property may require probate. Understanding your options—keep, sell, or rent—starts with knowing the property's current value and legal status." } },
        ],
      }} />

      {/* Layer 1: Personalized Hero */}
      <PersonalizedHero
        isReturning={isReturning}
        intent={currentIntent}
        journeyStage={stage.level as 1 | 2 | 3 | 4 | 5}
        onStartSelena={handleStartSelena}
        onContinue={handleContinue}
        onBrowse={handleBrowse}
      />

      {/* BLUE OCEAN — Feature 1: Cognitive Progress Bar */}
      {/* Shows stage label + affirmation only after first guide read. No CTA — pure context. */}
      <CognitiveProgressBar
        stage={stage}
        isVisible={shouldShowProgressBar}
      />
      
      {/* Layer 2: Decision Lane — enriched with guide counts + top guide preview */}
      <DecisionLane
        activeIntent={activeIntent}
        onIntentSelect={handleDecisionLaneIntent}
      />

      {/* BLUE OCEAN — Feature 6: Intent Journey Map */}
      {/* Appears only when intent is set. Visual 4-step path with guide + tool previews. */}
      {activeIntent && (
        <IntentJourneyMap
          intent={activeIntent}
          currentStep={Math.min(4, Math.max(1, stage.level - 1)) as 1 | 2 | 3 | 4}
        />
      )}

      {/* BLUE OCEAN — Feature 4: Contextual Selena Prompt */}
      {/* Stage-aware message between Decision Lane and grid. Uses getSelenaPromptForStage(). */}
      <div className="bg-cc-ivory pt-2 pb-4 border-b border-cc-sand-dark/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <ContextualSelenaPrompt
            stageId={stageId}
            guidesReadCount={guidesReadCount}
            onAskSelena={handleAskSelena}
            onRequestSummary={handleRequestSummary}
            variant="compact"
          />
        </div>
      </div>

      {/* BLUE OCEAN — Feature 3: Continue Reading Card */}
      {/* Netflix-style prominent card when user has a guide in progress */}
      {lastGuideId && (
        <ContinueReadingCard
          guideId={lastGuideId}
          onClick={handleGuideClick}
        />
      )}
      
      {/* Layer 3: Recommended For You Carousel */}
      {recommendedItems.length > 0 && (
        <RecommendedGuidesCarousel
          items={recommendedItems}
          onGuideClick={handleRecommendedGuideClick}
          headingEn={hasEngaged ? "Recommended For You" : "Start With These"}
          headingEs={hasEngaged ? "Recomendado Para Ti" : "Comienza Con Estas"}
        />
      )}

      {/* Category Filter — Responsive Nav (stories removed from filter) */}
      {/* top-14 (56px) matches the scrolled nav height (py-3 + content).        */}
      {/* The guides section is always below the fold so the nav is always        */}
      {/* in scrolled state when this bar becomes sticky — no overlap.            */}
      <section 
        id="guides-section" 
        className="bg-cc-sand py-6 md:py-8 border-b border-cc-sand-dark sticky top-14 z-40 w-full"
      >
        <div className="container mx-auto px-4">
          <ResponsiveCategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onCategorySelect={handleCategoryChange}
          />
          
          {activeCategory !== "all" && (
            <p className="text-center text-sm text-cc-slate mt-3">
              {t(
                categories.find(c => c.id === activeCategory)?.desc || "",
                categories.find(c => c.id === activeCategory)?.descEs || ""
              )}
            </p>
          )}
        </div>
      </section>

      {/* Educational Guides Grid — stories excluded */}
      <section className="bg-cc-ivory py-16 pb-24 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filteredGuides.map((guide) => {
              const gridBadge = getGridBadge(guide.id, guide.category);
              const colors = getCategoryColor(guide.category);
              const decisionLabel = getDecisionLabel(guide.id);
              const tier = guide.tier ?? 2;
              const thumbnail = tier < 3 ? getGuideThumbnail(guide.id) : null;
              const isTier1 = tier === 1;
              
              return (
                <Link
                  key={guide.id}
                  to={`/v2/guides/${guide.id}`}
                  onClick={() => handleGuideClick(guide.id)}
                  className={cn(
                    "group bg-white rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 border border-cc-sand-dark/50 hover:border-cc-gold/30 flex flex-col",
                    colors.accent,
                    isTier1 && "ring-1 ring-cc-navy/8",
                    isTier1 && guide.isFeatured && "md:col-span-2 lg:col-span-1"
                  )}
                >
                  {/* Tier 1 + Tier 2: hero thumbnail image strip */}
                  {thumbnail && tier <= 2 && (
                    <div className={cn("relative overflow-hidden bg-cc-sand flex-shrink-0", isTier1 ? "h-36" : "h-24")}>
                      <img
                        src={thumbnail}
                        alt={t(guide.title, guide.titleEs)}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {/* Pillar badge — Tier 1 only */}
                      {isTier1 && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-cc-navy/90 text-white text-[10px] font-semibold uppercase tracking-wider rounded-full">
                          {t("Pillar Guide", "Guía Principal")}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", colors.subtle)}>
                        {getCategoryLabel(guide.category)}
                      </span>
                      {gridBadge && gridBadge !== 'read' && (
                        <GuideCardBadge badgeType={gridBadge} />
                      )}
                      {gridBadge === 'read' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title={t("Read", "Leído")} />
                      )}
                    </div>
                    
                    {decisionLabel && (
                      <span className="text-xs text-cc-slate/70 font-medium mb-2 block">
                        {t(decisionLabel.en, decisionLabel.es)}
                      </span>
                    )}
                    
                    <h3 className={cn(
                      "font-serif text-cc-charcoal mb-3 group-hover:text-cc-navy transition-colors",
                      isTier1 ? "text-xl leading-snug" : "text-lg"
                    )}>
                      {t(guide.title, guide.titleEs)}
                    </h3>
                    <p className="text-cc-slate text-sm leading-relaxed mb-4 flex-1">
                      {t(guide.description, guide.descriptionEs)}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center text-cc-gold font-medium text-sm group-hover:gap-2 transition-all">
                        {t("Get Clarity", "Obtener Claridad")}
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                      {guide.readTime && (
                        <span className="text-xs text-cc-slate/50 flex-shrink-0 ml-3">
                          {t(guide.readTime, guide.readTimeEs ?? guide.readTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-12 max-w-3xl mx-auto">
            <SelenaSynthesisFooter
              guidesReadCount={guidesReadCount}
              onAskSelena={handleAskSelena}
              onRequestSummary={handleRequestSummary}
            />
          </div>
        </div>
      </section>

      {/* Trust Stories Section — separated from main grid */}
      <TrustStoriesSection
        stories={storyGuides}
        onStoryClick={handleGuideClick}
      />

      {/* Intent-Aware CTA Section */}
      <section className="bg-cc-navy py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
            {t("Have Questions? Let's Talk.", "¿Tienes Preguntas? Hablemos.")}
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            {t(
              "If you'd like to talk through your situation, you're welcome to book a consultation. Kasandra will personally reach out.",
              "Si deseas hablar sobre tu situación, con gusto puedes agendar una consulta. Kasandra se comunicará personalmente."
            )}
          </p>
          <Button 
            onClick={() => {
              logEvent('consultation_cta_clicked', { source: 'footer', stage: stageId, intent: activeIntent });
              handleBookConsultation();
            }}
            size="lg" 
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-8 shadow-gold max-w-full"
          >
            {getBookingCTA(activeIntent, t)}
          </Button>
        </div>
      </section>
    </>
  );
}

// Main component
const V2Guides = () => {
  return (
    <V2Layout>
      <GuidesContent />
    </V2Layout>
  );
};

export default V2Guides;
