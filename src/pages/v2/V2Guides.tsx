import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Home, DollarSign, TrendingUp, MapPin, Calculator, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import V2Layout from "@/components/v2/V2Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import {
  PersonalizedHero,
  RecommendedGuidesCarousel,
  JourneyProgressIndicator,
  SelenaAnchorPrompt,
  GuideCardBadge,
} from "@/components/v2/guides";
import {
  getGuidesRead,
  markGuideRead,
  setLastGuideId,
  getLastGuideId,
  getIntent,
  getJourneyStage,
  isReturningVisitor,
  getRecommendedGuides,
  getGridBadge,
  trackJourneyAction,
  type Guide,
} from "@/lib/guides/personalization";
import { logEvent } from "@/lib/analytics/logEvent";

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
    id: "tips", 
    label: "Practical Tips", 
    labelEs: "Consejos Prácticos", 
    icon: ArrowRight,
    desc: "Helpful for any stage",
    descEs: "Útil para cualquier etapa"
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
    id: "financial", 
    label: "Financial Guidance", 
    labelEs: "Guía Financiera", 
    icon: DollarSign,
    desc: "For those exploring affordability",
    descEs: "Para quienes exploran su presupuesto"
  },
  { 
    id: "neighborhoods", 
    label: "Tucson Neighborhoods", 
    labelEs: "Vecindarios de Tucson", 
    icon: MapPin,
    desc: "Find the right community",
    descEs: "Encuentra la comunidad ideal"
  },
  { 
    id: "stories", 
    label: "Client Stories", 
    labelEs: "Historias de Clientes", 
    icon: Heart,
    desc: "Real journeys, real results",
    descEs: "Historias reales, resultados reales"
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
    id: "mortgage-options-explained",
    title: "Mortgage Options Explained Simply",
    titleEs: "Opciones de Hipoteca Explicadas de Forma Simple",
    description: "A clear breakdown of FHA, conventional, VA, and other loan types to help you choose wisely.",
    descriptionEs: "Un desglose claro de préstamos FHA, convencionales, VA y otros tipos para ayudarte a elegir sabiamente.",
    category: "financial",
    readTime: "9 min",
    readTimeEs: "9 min",
  },
  {
    id: "tucson-neighborhood-guide",
    title: "Tucson Neighborhood Comparison Guide",
    titleEs: "Guía Comparativa de Vecindarios de Tucson",
    description: "Explore the unique character, amenities, and lifestyle of Tucson's most popular neighborhoods.",
    descriptionEs: "Explora el carácter único, amenidades y estilo de vida de los vecindarios más populares de Tucson.",
    category: "neighborhoods",
    readTime: "15 min",
    readTimeEs: "15 min",
  },
  {
    id: "home-staging-secrets",
    title: "Home Staging Secrets That Sell",
    titleEs: "Secretos de Home Staging que Venden",
    description: "Professional staging tips that create emotional connections and drive faster sales.",
    descriptionEs: "Consejos profesionales de staging que crean conexiones emocionales e impulsan ventas más rápidas.",
    category: "selling",
    readTime: "7 min",
    readTimeEs: "7 min",
  },
  {
    id: "negotiation-strategies",
    title: "Negotiation Strategies for Buyers & Sellers",
    titleEs: "Estrategias de Negociación para Compradores y Vendedores",
    description: "Master the art of real estate negotiation with tactics used by top agents.",
    descriptionEs: "Domina el arte de la negociación inmobiliaria con tácticas usadas por los mejores agentes.",
    category: "tips",
    readTime: "11 min",
    readTimeEs: "11 min",
  },
  {
    id: "closing-costs-breakdown",
    title: "Complete Closing Costs Breakdown",
    titleEs: "Desglose Completo de Costos de Cierre",
    description: "Understand every fee involved in closing so there are no surprises on closing day.",
    descriptionEs: "Entiende cada tarifa involucrada en el cierre para que no haya sorpresas el día del cierre.",
    category: "financial",
    readTime: "8 min",
    readTimeEs: "8 min",
  },
  {
    id: "oro-valley-vs-marana",
    title: "Oro Valley vs. Marana: Which Is Right for You?",
    titleEs: "Oro Valley vs. Marana: ¿Cuál es el Adecuado para Ti?",
    description: "A detailed comparison of two popular Tucson suburbs to help you decide where to call home.",
    descriptionEs: "Una comparación detallada de dos suburbios populares de Tucson para ayudarte a decidir dónde vivir.",
    category: "neighborhoods",
    readTime: "10 min",
    readTimeEs: "10 min",
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
];

// Inner component that uses Selena context (rendered inside V2Layout which provides SelenaChatProvider)
function GuidesContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { openChat, sendMessage } = useSelenaChat();
  const [activeCategory, setActiveCategory] = useState("all");
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);
  
  // Personalization state - refreshed on mount
  const [guidesRead, setGuidesReadState] = useState<string[]>([]);
  const [lastGuideId, setLastGuideIdState] = useState<string | null>(null);
  
  useEffect(() => {
    // Initialize personalization state
    setGuidesReadState(getGuidesRead());
    setLastGuideIdState(getLastGuideId());
    
    // Log page view
    logEvent('guides_page_view', { returning: isReturningVisitor() });
    
    // Show idle prompt after 10 seconds if user hasn't clicked a guide
    const timer = setTimeout(() => {
      if (getGuidesRead().length === 0) {
        setShowIdlePrompt(true);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const isReturning = guidesRead.length > 0 || lastGuideId !== null;
  const intent = getIntent();
  const journeyStage = getJourneyStage();
  const recommendedItems = useMemo(() => getRecommendedGuides(guides), [guidesRead, lastGuideId]);

  const filteredGuides = activeCategory === "all" 
    ? guides 
    : guides.filter(guide => guide.category === activeCategory);

  const getCategoryLabel = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? t(category.label, category.labelEs) : categoryId;
  };
  
  // Handlers
  const handleStartSelena = () => {
    logEvent('hero_cta_click', { type: 'start_selena' });
    openChat();
  };
  
  const handleContinue = () => {
    logEvent('hero_cta_click', { type: 'continue' });
    if (lastGuideId) {
      navigate(`/v2/guides/${lastGuideId}`);
    } else {
      document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleBrowse = () => {
    logEvent('hero_cta_click', { type: 'browse' });
    document.getElementById('guides-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleGuideClick = (guideId: string) => {
    setLastGuideId(guideId);
    markGuideRead(guideId);
    setShowIdlePrompt(false);
  };
  
  const handleRecommendedGuideClick = (guideId: string) => {
    const item = recommendedItems.find(r => r.guide.id === guideId);
    logEvent('recommended_guide_click', { guideId, badgeType: item?.badgeType });
    handleGuideClick(guideId);
  };
  
  const handleBookConsultation = () => {
    logEvent('hero_cta_click', { type: 'book_consultation' });
    trackJourneyAction('book');
    navigate('/v2/book');
  };
  
  const handleAskSelena = (prefillMessage?: string) => {
    logEvent('selena_prompt_click', { variant: 'floating', prefill: !!prefillMessage });
    openChat();
    if (prefillMessage) {
      setTimeout(() => sendMessage(prefillMessage), 500);
    }
  };
  
  // Log journey checkpoint when stage changes
  useEffect(() => {
    if (journeyStage >= 2) {
      logEvent('journey_checkpoint_shown', { stage: journeyStage });
    }
  }, [journeyStage]);

  return (
    <>
      {/* Layer 1: Personalized Hero */}
      <PersonalizedHero
        isReturning={isReturning}
        intent={intent}
        journeyStage={journeyStage}
        onStartSelena={handleStartSelena}
        onContinue={handleContinue}
        onBrowse={handleBrowse}
      />
      
      {/* Layer 2: Recommended For You Carousel */}
      {recommendedItems.length > 0 && (
        <RecommendedGuidesCarousel
          items={recommendedItems}
          onGuideClick={handleRecommendedGuideClick}
        />
      )}
      
      {/* Layer 3: Journey Progress Indicator */}
      <JourneyProgressIndicator
        stage={journeyStage}
        onBookConsultation={handleBookConsultation}
      />
      
      {/* Layer 4: Selena Anchor Prompt (floating) */}
      <section className="bg-cc-ivory py-6">
        <div className="container mx-auto px-4">
          <SelenaAnchorPrompt
            variant="floating"
            onAskSelena={handleAskSelena}
          />
        </div>
      </section>

      {/* Category Filter */}
      <section id="guides-section" className="bg-cc-sand py-8 border-b border-cc-sand-dark sticky top-16 z-40 w-full max-w-full overflow-hidden">
        <div className="container mx-auto px-4 w-full max-w-full">
          <div className="flex gap-2 sm:gap-3 mb-3 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:justify-center md:overflow-visible">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                    activeCategory === category.id
                      ? "bg-cc-navy text-white shadow-md"
                      : "bg-white text-cc-charcoal hover:bg-cc-gold/10 hover:text-cc-gold border border-cc-sand-dark/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {t(category.label, category.labelEs)}
                </button>
              );
            })}
          </div>
          {/* Micro-copy for selected category */}
          {activeCategory !== "all" && (
            <p className="text-center text-sm text-cc-slate">
              {t(
                categories.find(c => c.id === activeCategory)?.desc || "",
                categories.find(c => c.id === activeCategory)?.descEs || ""
              )}
            </p>
          )}
        </div>
      </section>

      {/* Guides Grid */}
      <section className="bg-cc-ivory py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => {
              const gridBadge = getGridBadge(guide.id, guide.category);
              
              return (
                <Link
                  key={guide.id}
                  to={`/v2/guides/${guide.id}`}
                  onClick={() => handleGuideClick(guide.id)}
                  className="group bg-white rounded-xl p-6 shadow-soft hover:shadow-elevated transition-all duration-300 border border-cc-sand-dark/50 hover:border-cc-gold/30"
                >
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="px-3 py-1 bg-cc-navy/10 text-cc-navy rounded-full text-xs font-medium">
                      {getCategoryLabel(guide.category)}
                    </span>
                    <span className="text-cc-slate text-xs">
                      {t(guide.readTime, guide.readTimeEs)}
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
          
          {/* Idle Selena Prompt - shows after browsing */}
          {showIdlePrompt && (
            <div className="mt-12 max-w-2xl mx-auto animate-fade-up">
              <SelenaAnchorPrompt
                variant="grid_idle"
                onAskSelena={handleAskSelena}
              />
            </div>
          )}
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
              "If you'd like to talk through your situation, you're welcome to book a consultation.",
              "Si deseas hablar sobre tu situación, con gusto puedes agendar una consulta."
            )}
          </p>
          <Button 
            onClick={handleBookConsultation}
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
