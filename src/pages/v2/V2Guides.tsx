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
  type RecommendedGuide,
} from "@/lib/guides/personalization";
import { getCategoryColor, getDecisionLabel } from "@/lib/guides/categoryColors";
import { getLiveGuides, getGuideById, type GuideRegistryEntry } from "@/lib/guides/guideRegistry";
import { logEvent } from "@/lib/analytics/logEvent";
import { useCognitiveStage } from "@/hooks/useCognitiveStage";
import { useRecommendationEngine } from "@/hooks/useRecommendationEngine";

import { cn } from "@/lib/utils";

// ─── Thumbnail resolution ────────────────────────────────────────────
const SUPABASE_PUBLIC = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public`;

/** Returns a thumbnail URL for Tier 1–2 guides, null for Tier 3. */
function resolveGuideThumbnailSrc(entry: GuideRegistryEntry | undefined): string | null {
  if (!entry || entry.tier === 3) return null;
  if (entry.assetSlots?.thumbnail) return entry.assetSlots.thumbnail;
  return `${SUPABASE_PUBLIC}/guide-assets/guides/${entry.id}/hero.webp`;
}

// ─── Categories ──────────────────────────────────────────────────────
const categories = [
  { id: "all", label: "All Guides", labelEs: "Todas las Guías", icon: BookOpen, desc: "Browse everything at your own pace", descEs: "Explora todo a tu propio ritmo" },
  { id: "buying", label: "Starting Your Buying Journey", labelEs: "Comenzando Tu Proceso de Compra", icon: Home, desc: "Most people begin here", descEs: "La mayoría comienza aquí" },
  { id: "selling", label: "Preparing to Sell Confidently", labelEs: "Preparándote para Vender con Confianza", icon: TrendingUp, desc: "For homeowners ready to move on", descEs: "Para propietarios listos para avanzar" },
  { id: "cash", label: "Cash Offers", labelEs: "Ofertas en Efectivo", icon: DollarSign, desc: "Understand your cash offer options", descEs: "Entiende tus opciones de oferta en efectivo" },
  { id: "valuation", label: "Understanding Your Value", labelEs: "Entendiendo Tu Valor", icon: Calculator, desc: "Know what your home is worth", descEs: "Conoce cuánto vale tu casa" },
  { id: "probate", label: "Inherited Property", labelEs: "Propiedad Heredada", icon: BookOpen, desc: "Guidance for life's most sensitive transitions", descEs: "Orientación para las transiciones más sensibles" },
];

// Derive guide cards from registry
function getGuideCards(): Guide[] {
  return getLiveGuides().map(entry => ({
    id: entry.id,
    title: entry.titleEn,
    titleEs: entry.titleEs,
    description: entry.descriptionEn,
    descriptionEs: entry.descriptionEs,
    category: entry.category,
    isFeatured: entry.isFeatured,
  }));
}

// Intent-aware CTA labels
function getBookingCTA(intent: DecisionLaneIntent | null, t: (en: string, es: string) => string) {
  switch (intent) {
    case 'sell': case 'cash': return t("Book a Seller Consult", "Agendar Consulta de Vendedor");
    case 'buy': return t("Book a Buyer Consult", "Agendar Consulta de Comprador");
    default: return t("Book a Consultation", "Agendar una Cita");
  }
}

// ─── Stable-sort related guides to top of recommendations ────────────
function boostRelatedGuides(items: RecommendedGuide[], relatedIds: string[]): RecommendedGuide[] {
  if (relatedIds.length === 0) return items;
  const relatedSet = new Set(relatedIds);
  const related = items.filter(i => relatedSet.has(i.guide.id));
  const rest = items.filter(i => !relatedSet.has(i.guide.id));
  return [...related, ...rest];
}

// Inner component rendered inside V2Layout
function GuidesContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { openChat, sendMessage } = useSelenaChat();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeIntent, setActiveIntent] = useState<DecisionLaneIntent | null>(null);

  const allGuides = useMemo(() => getGuideCards(), []);
  const educationalGuides = useMemo(() => allGuides.filter(g => g.category !== 'stories'), [allGuides]);
  const storyGuides = useMemo(() => allGuides.filter(g => g.category === 'stories'), [allGuides]);

  useDocumentHead({
    titleEn: "Real Estate Guides | Tucson Home Buying & Selling Education",
    titleEs: "Guías de Bienes Raíces | Educación de Compra y Venta en Tucson",
    descriptionEn: "Free bilingual guides on buying, selling, cash offers, and inherited property in Tucson. Learn at your own pace.",
    descriptionEs: "Guías bilingües gratuitas sobre compra, venta, ofertas en efectivo y propiedad heredada en Tucson.",
  });

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

  // ─── Related guides context ───────────────────────────────────────
  const lastGuideEntry = lastGuideId ? getGuideById(lastGuideId) : undefined;
  const relatedGuideIds = lastGuideEntry?.destinations?.relatedGuideIds ?? [];
  const showContextBridge = !!lastGuideEntry && lastGuideEntry.tier !== 3 && relatedGuideIds.length > 0;

  // Recommendations with related-guide boost
  const recommendedItems = useMemo(() => {
    const base = getRecommendedGuides(allGuides);
    return boostRelatedGuides(base, relatedGuideIds);
  }, [guidesRead, lastGuideId, allGuides, relatedGuideIds]);

  // ─── Continue row: only for Tier 1-2 ──────────────────────────────
  const showContinueRow = !!lastGuideEntry && lastGuideEntry.tier !== 3;
  const continueThumbnailSrc = resolveGuideThumbnailSrc(lastGuideEntry);

  const filteredGuides = activeCategory === "all"
    ? educationalGuides
    : educationalGuides.filter(guide => guide.category === activeCategory);

  const getCategoryLabel = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? t(category.label, category.labelEs) : categoryId;
  };

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleStartSelena = useCallback(() => {
    logEvent('ask_selena_clicked', { source: 'hero', stage: stageId });
    openChat({ source: 'hero' });
  }, [openChat, stageId]);

  const handleContinue = useCallback(() => {
    logEvent('hero_cta_click', { type: 'continue' });
    if (lastGuideId) navigate(`/v2/guides/${lastGuideId}`);
    else document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' });
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
    if (prefillMessage) setTimeout(() => sendMessage(prefillMessage), 500);
  }, [openChat, sendMessage, stageId, guidesReadCount]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    logEvent('guide_category_selected', { category: categoryId });
  }, []);

  const handleDecisionLaneIntent = useCallback((intent: DecisionLaneIntent) => {
    logEvent('decision_lane_selected', { intent });
    setActiveIntent(intent);
    setIntent(intent === 'buy' ? 'buy' : intent === 'cash' ? 'cash' : 'sell');
    switch (intent) {
      case 'buy': setActiveCategory('buying'); break;
      case 'sell': setActiveCategory('selling'); break;
      case 'cash': setActiveCategory('cash'); break;
    }
    document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleRequestSummary = useCallback(() => {
    logEvent('personalized_summary_offered', { guidesReadCount, stage: stageId });
  }, [guidesReadCount, stageId]);

  useEffect(() => {
    if (shouldShowProgressBar) logEvent('journey_checkpoint_shown', { stage: stageId, level: stage.level });
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

      {/* Layer 2: Decision Lane */}
      <DecisionLane activeIntent={activeIntent} onIntentSelect={handleDecisionLaneIntent} />

      {/* Layer 3: "Pick up where you left off" — single item, Tier 1–2 only */}
      {showContinueRow && lastGuideEntry && (
        <section className="bg-cc-sand/60 py-8 w-full">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-xl md:text-2xl text-cc-navy mb-4">
              {t("Pick up where you left off", "Continúe donde lo dejó")}
            </h2>
            <Link
              to={`/v2/guides/${lastGuideEntry.id}`}
              onClick={() => handleGuideClick(lastGuideEntry.id)}
              className="group flex flex-col sm:flex-row bg-white rounded-xl border border-cc-sand-dark/50 hover:border-cc-gold/50 hover:shadow-elevated transition-all duration-300 overflow-hidden max-w-2xl"
            >
              {continueThumbnailSrc && (
                <div className="sm:w-56 sm:shrink-0 aspect-video sm:aspect-auto overflow-hidden">
                  <img
                    src={continueThumbnailSrc}
                    alt={t(lastGuideEntry.titleEn, lastGuideEntry.titleEs)}
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5 flex flex-col justify-center">
                <div className="mb-2">
                  <GuideCardBadge badgeType="continue" />
                </div>
                <h3 className="font-serif text-lg text-cc-charcoal mb-1 group-hover:text-cc-navy transition-colors">
                  {t(lastGuideEntry.titleEn, lastGuideEntry.titleEs)}
                </h3>
                <p className="text-cc-slate text-sm line-clamp-2">
                  {t(lastGuideEntry.descriptionEn, lastGuideEntry.descriptionEs)}
                </p>
                <span className="flex items-center text-cc-gold font-medium text-sm mt-3 group-hover:gap-2 transition-all">
                  {t("Continue Reading", "Continuar Leyendo")}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Layer 4: "Because you read X…" contextual bridge + Recommended Carousel */}
      {recommendedItems.length > 0 && (
        <div>
          {showContextBridge && lastGuideEntry && (
            <div className="bg-cc-sand pt-8 pb-2">
              <div className="container mx-auto px-4">
                <p className="text-cc-slate text-sm italic">
                  {t(
                    `Because you read "${lastGuideEntry.titleEn}", these may help next:`,
                    `Como leyó "${lastGuideEntry.titleEs}", esto podría ayudarle después:`
                  )}
                </p>
              </div>
            </div>
          )}
          <RecommendedGuidesCarousel
            items={recommendedItems}
            onGuideClick={handleRecommendedGuideClick}
            headingEn={hasEngaged ? "Recommended For You" : "Start With These"}
            headingEs={hasEngaged ? "Recomendado Para Ti" : "Comienza Con Estas"}
          />
        </div>
      )}

      {/* Category Filter */}
      <section
        id="guides-section"
        className="bg-cc-sand py-6 md:py-8 border-b border-cc-sand-dark sticky top-16 z-40 w-full"
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

      {/* Educational Guides Grid — with thumbnails for Tier 1–2 */}
      <section className="bg-cc-ivory py-16 pb-24 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => {
              const registryEntry = getGuideById(guide.id);
              const thumbnailSrc = resolveGuideThumbnailSrc(registryEntry);
              const gridBadge = getGridBadge(guide.id, guide.category);
              const colors = getCategoryColor(guide.category);
              const decisionLabel = getDecisionLabel(guide.id);

              return (
                <Link
                  key={guide.id}
                  to={`/v2/guides/${guide.id}`}
                  onClick={() => handleGuideClick(guide.id)}
                  className={cn(
                    "group bg-white rounded-xl shadow-soft hover:shadow-elevated transition-all duration-300 border border-cc-sand-dark/50 hover:border-cc-gold/30 overflow-hidden flex flex-col",
                    colors.accent
                  )}
                >
                  {/* Thumbnail — Tier 1–2 only */}
                  {thumbnailSrc && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={thumbnailSrc}
                        alt={t(guide.title, guide.titleEs)}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
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
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title={t("Read", "Leído")} />
                      )}
                    </div>

                    {decisionLabel && (
                      <span className="text-xs text-cc-slate/70 font-medium mb-2 block">
                        {t(decisionLabel.en, decisionLabel.es)}
                      </span>
                    )}

                    <h3 className="font-serif text-xl text-cc-charcoal mb-3 group-hover:text-cc-navy transition-colors">
                      {t(guide.title, guide.titleEs)}
                    </h3>
                    <p className="text-cc-slate text-sm leading-relaxed mb-4">
                      {t(guide.description, guide.descriptionEs)}
                    </p>
                    <div className="flex items-center text-cc-gold font-medium text-sm group-hover:gap-2 transition-all mt-auto">
                      {t("Get Clarity", "Obtener Claridad")}
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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

      {/* Trust Stories — unchanged, text-only */}
      <TrustStoriesSection stories={storyGuides} onStoryClick={handleGuideClick} />

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

const V2Guides = () => (
  <V2Layout>
    <GuidesContent />
  </V2Layout>
);

export default V2Guides;
