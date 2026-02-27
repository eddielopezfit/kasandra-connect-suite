import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Home, TrendingUp, Calculator, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import V2Layout from "@/components/v2/V2Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import {
  PersonalizedHero,
  RecommendedGuidesCarousel,
  GuideCardBadge,
  StartHereLane,
  
  
  SelenaSynthesisFooter,
  ResponsiveCategoryNav,
} from "@/components/v2/guides";
import {
  getGuidesRead,
  markGuideRead,
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
import { logEvent } from "@/lib/analytics/logEvent";
import { useCognitiveStage } from "@/hooks/useCognitiveStage";
import { useRecommendationEngine } from "@/hooks/useRecommendationEngine";
import type { StartHereIntent } from "@/components/v2/guides/StartHereLane";

import { cn } from "@/lib/utils";

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
    id: "valuation", 
    label: "Understanding Your Value", 
    labelEs: "Entendiendo Tu Valor", 
    icon: Calculator,
    desc: "Know what your home is worth",
    descEs: "Conoce cuánto vale tu casa"
  },
  { 
    id: "stories", 
    label: "Client Stories", 
    labelEs: "Historias de Clientes", 
    icon: Heart,
    desc: "Real journeys, real results",
    descEs: "Historias reales, resultados reales"
  },
  { 
    id: "probate", 
    label: "Inherited Property", 
    labelEs: "Propiedad Heredada", 
    icon: BookOpen,
    desc: "Guidance for life's most sensitive transitions",
    descEs: "Orientación para las transiciones más sensibles"
  },
];

const guides: Guide[] = [
  {
    id: "first-time-buyer-guide",
    title: "First-Time Home Buyer's Complete Guide",
    titleEs: "Guía Completa para Compradores de Primera Vivienda",
    description: "Everything you need to know about buying your first home in Tucson, from pre-approval to closing day.",
    descriptionEs: "Todo lo que necesitas saber sobre comprar tu primera casa en Tucson, desde la pre-aprobación hasta el día de cierre.",
    category: "buying",
    readTime: "12 min",
    readTimeEs: "12 min",
    isFeatured: true,
  },
  {
    id: "selling-for-top-dollar",
    title: "How to Sell Your Home for Top Dollar",
    titleEs: "Cómo Vender tu Casa al Mejor Precio",
    description: "Strategic tips and proven methods to maximize your home's value and attract qualified buyers.",
    descriptionEs: "Consejos estratégicos y métodos probados para maximizar el valor de tu casa y atraer compradores calificados.",
    category: "selling",
    readTime: "10 min",
    readTimeEs: "10 min",
  },
  {
    id: "understanding-home-valuation",
    title: "Understanding Your Home's True Value",
    titleEs: "Entendiendo el Verdadero Valor de tu Casa",
    description: "Learn what factors affect your home's market value and how to get an accurate assessment.",
    descriptionEs: "Aprende qué factores afectan el valor de mercado de tu casa y cómo obtener una evaluación precisa.",
    category: "valuation",
    readTime: "8 min",
    readTimeEs: "8 min",
  },
  {
    id: "first-time-buyer-story",
    title: "From Fear to Keys: A First-Time Buyer's Journey",
    titleEs: "Del Miedo a las Llaves: El Viaje de una Compradora Primeriza",
    description: "How one client overcame doubt and found a place to call her own—with patience and guidance every step of the way.",
    descriptionEs: "Cómo una cliente superó sus dudas y encontró un lugar para llamar suyo—con paciencia y guía en cada paso.",
    category: "stories",
    readTime: "5 min",
    readTimeEs: "5 min",
  },
  {
    id: "budget-buyer-story",
    title: "Finding Security on a Tight Budget",
    titleEs: "Encontrando Seguridad con un Presupuesto Ajustado",
    description: "A family's story of finding the right home without compromising what mattered most.",
    descriptionEs: "La historia de una familia que encontró el hogar adecuado sin comprometer lo que más importaba.",
    category: "stories",
    readTime: "5 min",
    readTimeEs: "5 min",
  },
  {
    id: "seller-stressful-market-story",
    title: "Navigating a Stressful Market: A Seller's Story",
    titleEs: "Navegando un Mercado Estresante: Historia de un Vendedor",
    description: "When the market felt uncertain, clarity and support made all the difference.",
    descriptionEs: "Cuando el mercado se sentía incierto, la claridad y el apoyo hicieron toda la diferencia.",
    category: "stories",
    readTime: "5 min",
    readTimeEs: "5 min",
  },
  {
    id: "spanish-speaking-client-story",
    title: "Truly Understood: A Spanish-Speaking Client's Experience",
    titleEs: "Verdaderamente Comprendida: La Experiencia de una Cliente Hispanohablante",
    description: "The power of being served in your own language—and feeling heard every step of the way.",
    descriptionEs: "El poder de ser atendida en tu propio idioma—y sentirse escuchada en cada paso.",
    category: "stories",
    readTime: "5 min",
    readTimeEs: "5 min",
  },
  {
    id: "inherited-probate-property",
    title: "Inherited Property in Pima County: Understanding Your Options",
    titleEs: "Propiedad Heredada en el Condado de Pima: Entendiendo Sus Opciones",
    description: "A clear, no-pressure guide to navigating probate, heirs, and property decisions after a loss.",
    descriptionEs: "Una guía clara, sin presión, para navegar la sucesión, herederos y decisiones de propiedad después de una pérdida.",
    category: "probate",
    readTime: "10 min",
    readTimeEs: "10 min",
    isFeatured: true,
  },
];

// Inner component that uses Selena context (rendered inside V2Layout which provides SelenaChatProvider)
function GuidesContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { openChat, sendMessage } = useSelenaChat();
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Personalization state - refreshed on mount
  const [guidesRead, setGuidesReadState] = useState<string[]>([]);
  const [lastGuideId, setLastGuideIdState] = useState<string | null>(null);
  
  // Cognitive stage hook
  const { stage, stageId, shouldShowProgressBar, guidesReadCount, isFirstVisit } = useCognitiveStage();
  
  // Recommendation engine
  const { hasEngaged } = useRecommendationEngine(guides);
  
  useEffect(() => {
    // Initialize personalization state
    setGuidesReadState(getGuidesRead());
    setLastGuideIdState(getLastGuideId());
    
    // Log page view
    logEvent('guides_page_view', { returning: isReturningVisitor() });
  }, []);
  
  const isReturning = guidesRead.length > 0 || lastGuideId !== null;
  const currentIntent = getIntent();
  const recommendedItems = useMemo(() => getRecommendedGuides(guides), [guidesRead, lastGuideId]);

  const filteredGuides = activeCategory === "all" 
    ? guides 
    : guides.filter(guide => guide.category === activeCategory);

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
    markGuideRead(guideId);
    logEvent('guide_opened', { guideId, source: 'grid' });
  }, []);
  
  const handleRecommendedGuideClick = useCallback((guideId: string) => {
    const item = recommendedItems.find(r => r.guide.id === guideId);
    logEvent('guide_opened', { guideId, source: 'recommended', badgeType: item?.badgeType });
    handleGuideClick(guideId);
  }, [recommendedItems, handleGuideClick]);
  
  const handleBookConsultation = useCallback(() => {
    logEvent('consultation_cta_clicked', { stage: stageId, source: 'footer' });
    trackJourneyAction('book');
    openChat({ source: 'hero', intent: 'explore' });
  }, [openChat, stageId]);
  
  const handleAskSelena = useCallback((prefillMessage?: string) => {
    logEvent('ask_selena_clicked', { 
      source: 'prompt', 
      stage: stageId, 
      hasPrefill: !!prefillMessage 
    });
    // Pass synthesis context for context-aware greeting
    openChat({
      source: 'synthesis',
      guidesReadCount,
    });
    if (prefillMessage) {
      setTimeout(() => sendMessage(prefillMessage), 500);
    }
  }, [openChat, sendMessage, stageId, guidesReadCount]);
  
  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    logEvent('guide_category_selected', { category: categoryId });
  }, []);
  
  const handleStartHereIntent = useCallback((intentType: StartHereIntent) => {
    logEvent('start_here_intent_selected', { intent: intentType });
    // Store intent for personalization
    setIntent(intentType === 'explore' ? 'explore' : intentType);
    
    // Navigate to appropriate category or open Selena
    switch (intentType) {
      case 'buy':
        setActiveCategory('buying');
        break;
      case 'sell':
        setActiveCategory('selling');
        break;
      case 'cash':
        setActiveCategory('valuation');
        break;
      case 'explore':
        openChat({ source: 'hero' });
        sendMessage(t(
          "I'm just exploring my options. Can you help me understand what's possible?",
          "Solo estoy explorando mis opciones. ¿Puedes ayudarme a entender qué es posible?"
        ));
        return;
    }
    document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' });
  }, [openChat, sendMessage, t]);
  
  
  // Progress bar is now pure context - no CTA handler needed
  
  const handleRequestSummary = useCallback(() => {
    logEvent('personalized_summary_offered', { 
      guidesReadCount,
      stage: stageId 
    });
  }, [guidesReadCount, stageId]);
  
  // Log journey checkpoint when stage changes
  useEffect(() => {
    if (shouldShowProgressBar) {
      logEvent('journey_checkpoint_shown', { stage: stageId, level: stage.level });
    }
  }, [shouldShowProgressBar, stageId, stage.level]);

  return (
    <>
      {/* Layer 1: Personalized Hero */}
      <PersonalizedHero
        isReturning={isReturning}
        intent={currentIntent}
        journeyStage={stage.level as 1 | 2 | 3 | 4 | 5}
        onStartSelena={handleStartSelena}
        onContinue={handleContinue}
        onBrowse={handleBrowse}
      />
      
      {/* Layer 2: Start Here Lane - Only for first-time visitors without intent */}
      {isFirstVisit && !currentIntent && (
        <StartHereLane onIntentSelect={handleStartHereIntent} />
      )}
      
      
      {/* Layer 4: Recommended For You Carousel */}
      {recommendedItems.length > 0 && hasEngaged && (
        <RecommendedGuidesCarousel
          items={recommendedItems}
          onGuideClick={handleRecommendedGuideClick}
        />
      )}
      

      {/* Category Filter with Color-Coding - Responsive Nav */}
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
          
          {/* Micro-copy for selected category */}
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

      {/* Guides Grid with Color-Coded Accents - Extra bottom padding on mobile for chat bubble */}
      <section className="bg-cc-ivory py-16 pb-24 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => {
              const gridBadge = getGridBadge(guide.id, guide.category);
              const colors = getCategoryColor(guide.category);
              const decisionLabel = getDecisionLabel(guide.id);
              
              return (
                <Link
                  key={guide.id}
                  to={`/v2/guides/${guide.id}`}
                  onClick={() => handleGuideClick(guide.id)}
                  className={cn(
                    "group bg-white rounded-xl p-6 shadow-soft hover:shadow-elevated transition-all duration-300 border border-cc-sand-dark/50 hover:border-cc-gold/30",
                    colors.accent // Left-edge color accent
                  )}
                >
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {/* Category pill with subtle color */}
                    <span className={cn("px-3 py-1 rounded-full text-xs font-medium border", colors.subtle)}>
                      {getCategoryLabel(guide.category)}
                    </span>
                    {/* Badge from personalization */}
                    {gridBadge && gridBadge !== 'read' && (
                      <GuideCardBadge badgeType={gridBadge} />
                    )}
                    {/* Subtle read indicator */}
                    {gridBadge === 'read' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title={t("Read", "Leído")} />
                    )}
                  </div>
                  
                  {/* Decision Path Label */}
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
                  <div className="flex items-center text-cc-gold font-medium text-sm group-hover:gap-2 transition-all">
                    {t("Read Guide", "Leer Guía")}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Post-Grid Selena Synthesis Footer */}
          <div className="mt-12 max-w-3xl mx-auto">
            <SelenaSynthesisFooter
              guidesReadCount={guidesReadCount}
              onAskSelena={handleAskSelena}
              onRequestSummary={handleRequestSummary}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              logEvent('consultation_cta_clicked', { source: 'footer', stage: stageId });
              handleBookConsultation();
            }}
            size="lg" 
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-8 shadow-gold max-w-full"
          >
            {t("Book a Consultation", "Agendar una Cita")}
          </Button>
        </div>
      </section>
    </>
  );
}

// Main component - wraps content in V2Layout which provides SelenaChatProvider
const V2Guides = () => {
  return (
    <V2Layout>
      <GuidesContent />
    </V2Layout>
  );
};

export default V2Guides;
