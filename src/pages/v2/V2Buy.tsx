import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import JsonLd from "@/components/seo/JsonLd";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import TestimonialCard from "@/components/v2/TestimonialCard";
import { buyerTestimonials } from "@/data/testimonials";
import { Search, DollarSign, CheckCircle, Calendar, Calculator, Shield, MessageCircle, CheckCircle2 } from "lucide-react";
import { setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import FeaturedGuideCard from "@/components/v2/shared/FeaturedGuideCard";
const NeighborhoodExplorer = lazy(() =>
  import("@/components/v2/neighborhood").then(m => ({ default: m.NeighborhoodExplorer }))
);
const NeighborhoodQuiz = lazy(() =>
  import("@/components/v2/neighborhood").then(m => ({ default: m.NeighborhoodQuiz }))
);
import heroImage from "@/assets/hero-neighborhood-road.png";
import { getStoredUserName } from "@/lib/analytics/bridgeLeadIdToV2";
import GlassmorphismHero from "@/components/v2/hero/GlassmorphismHero";
import BuyingTimeline from "@/components/v2/BuyingTimeline";
import JourneyBreadcrumb from "@/components/v2/JourneyBreadcrumb";
import StickyMobileBookingBar from "@/components/v2/StickyMobileBookingBar";


const PAGE_PATH = '/buy';
const PAGE_INTENT = 'buy' as const;

const V2BuyContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const [leadName, setLeadName] = useState<string | null>(null);
  const [quizExploreZip, setQuizExploreZip] = useState<string | null>(null);
  const journey = useJourneyProgress();

  const handleQuizExplore = useCallback((zip: string) => {
    setQuizExploreZip(zip);
  }, []);
  useDocumentHead({
    titleEn: "Buy a Home in Tucson | First-Time Buyer & Relocation Guide",
    titleEs: "Compre una Casa en Tucson | Guía para Compradores Primerizos y Reubicación",
    descriptionEn: "Step-by-step home buying guidance in Tucson. Bilingual support, down payment assistance programs, and 24/7 AI concierge.",
    descriptionEs: "Guía paso a paso para comprar casa en Tucson. Apoyo bilingüe, programas de asistencia y asistente IA 24/7.",
  });

  useEffect(() => {
    setFieldIfEmpty('intent', 'buy');
    const stored = getStoredUserName();
    if (stored) setLeadName(stored.split(' ')[0]);
  }, []);

  // Handle CTA clicks with tracking (uses constants from CTA_NAMES)
  const handleCTAClick = (cta_name: string, destination: string) => {
    logCTAClick({ cta_name, destination, page_path: PAGE_PATH, intent: PAGE_INTENT });
  };

  // Handle Selena routing CTA
  const handleSelenaRoute = () => {
    handleCTAClick(CTA_NAMES.SELENA_ROUTE_CALL, 'selena_chat');
    openChat({ source: 'hero', intent: 'buy' });
  };

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Tucson Home Buying Services",
        "description": "Step-by-step home buying guidance in Tucson — down payment assistance, bilingual support, neighborhood intelligence, and AI readiness tools.",
        "provider": {
          "@type": "RealEstateAgent",
          "name": "Kasandra Prieto, REALTOR®",
          "url": "https://kasandraprietorealtor.com",
          "telephone": "+15203493248",
          "areaServed": ["Tucson, AZ", "Pima County, AZ"],
          "knowsLanguage": ["en", "es"]
        },
        "areaServed": {
          "@type": "Place",
          "name": "Tucson, AZ and Pima County"
        },
        "serviceType": "Buyer Representation and Home Search Services"
      }} />
      {/* Hero */}
      <GlassmorphismHero
        badge={t("For Buyers", "Para Compradores")}
        headline={t("Buying a Home in Tucson? I'll Walk You Through Every Step.", "¿Comprando Casa en Tucson? Te Acompaño en Cada Paso.")}
        subtext={t(
          "I guide buyers through every step — from first search to closed door — with honesty, local expertise, and an AI concierge built just for you.",
          "Te guío en cada paso — desde la primera búsqueda hasta el cierre — con honestidad, experiencia local y un asistente de IA diseñado para ti."
        )}
        primaryLabel={t("Book a Strategy Call", "Agenda una Llamada de Estrategia")}
        secondaryLabel={t("Buyer Readiness Quiz", "Quiz de Preparación")}
        secondaryLink="/buyer-readiness"
        intent="buy"
        entrySource="buy_hero"
        pagePath="/buy"
        backgroundImage={heroImage}
      />

      {/* Journey Progress — visible only to returning users */}
      <section className="py-4">
        <div className="container mx-auto px-4 max-w-3xl">
          <JourneyBreadcrumb />
        </div>
      </section>

      {/* Dynamic Buyer Tools Strip */}
      {journey.journeyDepth !== 'ready' && (() => {
        const allTools = [
          {
            id: 'buyer_readiness',
            icon: CheckCircle,
            labelEn: 'Buyer Readiness Check',
            labelEs: 'Check de Preparación',
            completedEn: '✓ Readiness Checked',
            completedEs: '✓ Preparación Evaluada',
            to: '/buyer-readiness',
            ctaName: 'sub_hero_buyer_readiness',
            military: false,
          },
          {
            id: 'bah_calculator',
            icon: Shield,
            labelEn: 'BAH Calculator (Military)',
            labelEs: 'Calculadora BAH (Militar)',
            completedEn: '✓ BAH Calculated',
            completedEs: '✓ BAH Calculado',
            to: '/bah-calculator',
            ctaName: 'sub_hero_bah',
            military: true,
          },
          {
            id: 'affordability',
            icon: Calculator,
            labelEn: 'Check Buying Power',
            labelEs: 'Verificar Poder de Compra',
            completedEn: '✓ Buying Power Checked',
            completedEs: '✓ Poder de Compra Verificado',
            to: '/affordability-calculator',
            ctaName: 'sub_hero_affordability',
            military: false,
          },
          {
            id: 'buyer_closing_costs',
            icon: DollarSign,
            labelEn: 'Estimate Closing Costs',
            labelEs: 'Estimar Costos de Cierre',
            completedEn: '✓ Costs Estimated',
            completedEs: '✓ Costos Estimados',
            to: '/buyer-closing-costs',
            ctaName: 'sub_hero_closing_costs',
            military: false,
          },
          {
            id: 'neighborhood_compare',
            icon: Search,
            labelEn: 'Compare Neighborhoods',
            labelEs: 'Comparar Vecindarios',
            completedEn: '✓ Neighborhoods Compared',
            completedEs: '✓ Vecindarios Comparados',
            to: '/neighborhood-compare',
            ctaName: 'sub_hero_neighborhood_compare',
            military: false,
          },
        ];

        // Filter: hide military tools for non-military users
        const filtered = allTools.filter(tool => !tool.military || journey.isMilitary);

        // Sort: incomplete first, completed last
        const sorted = [...filtered].sort((a, b) => {
          const aCompleted = journey.toolsCompleted.includes(a.id);
          const bCompleted = journey.toolsCompleted.includes(b.id);
          if (aCompleted && !bCompleted) return 1;
          if (!aCompleted && bCompleted) return -1;
          return 0;
        });

        // Show max 4
        const visible = sorted.slice(0, 4);

        const headerEn = journey.journeyDepth === 'new'
          ? "Start here — your buyer toolkit"
          : journey.journeyDepth === 'exploring'
          ? "Pick up where you left off"
          : "You're making progress";
        const headerEs = journey.journeyDepth === 'new'
          ? "Empieza aquí — tu kit de comprador"
          : journey.journeyDepth === 'exploring'
          ? "Continúa donde te quedaste"
          : "Vas avanzando";

        return (
          <section className="bg-white border-b border-cc-sand-dark/20 py-6">
            <div className="container mx-auto px-4 max-w-3xl">
              <p className="text-xs font-semibold text-cc-navy/50 uppercase tracking-wider text-center mb-4">
                {t(headerEn, headerEs)}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {visible.map(tool => {
                  const isCompleted = journey.toolsCompleted.includes(tool.id);
                  const Icon = isCompleted ? CheckCircle2 : tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      to={tool.to}
                      onClick={() => handleCTAClick(tool.ctaName, tool.to)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all group ${
                        isCompleted
                          ? 'bg-cc-sand/50 border-cc-sand-dark/20 opacity-60'
                          : 'bg-cc-ivory hover:bg-cc-sand border-cc-sand-dark/30 hover:border-cc-navy/20'
                      }`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isCompleted ? 'text-green-600' : 'text-cc-gold'}`} />
                      <span className="text-sm font-semibold text-cc-navy leading-tight">
                        {isCompleted
                          ? t(tool.completedEn, tool.completedEs)
                          : t(tool.labelEn, tool.labelEs)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Buying Process Timeline */}
      <BuyingTimeline />

      {/* Neighborhood Quiz */}
      <Suspense fallback={null}><NeighborhoodQuiz onExploreZip={handleQuizExplore} /></Suspense>

      {/* Neighborhood Intelligence */}
      <Suspense fallback={null}><NeighborhoodExplorer externalZip={quizExploreZip} /></Suspense>

      {/* Buyer Testimonials */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Primary Testimonial */}
            <div className="bg-cc-sand rounded-2xl p-2 border border-cc-sand-dark/30">
              <TestimonialCard testimonial={buyerTestimonials[0]} variant="primary" />
            </div>
            
            {/* Secondary Testimonial */}
            <TestimonialCard testimonial={buyerTestimonials[1]} variant="secondary" />
          </div>
        </div>
      </section>

      {/* Benefits + Featured Guide */}
      <section className="py-16 lg:py-20 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-cc-sand-dark/30">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mb-6">
                {t("Why Work With Me?", "¿Por Qué Trabajar Conmigo?")}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-cc-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-cc-navy">{t("Bilingual Support", "Apoyo Bilingüe")}</h4>
                    <p className="text-sm md:text-base text-cc-charcoal">
                      {t(
                        "I speak your language — literally. English or Spanish, you'll always feel at home.",
                        "Hablo tu idioma — literalmente. Inglés o español, siempre te sentirás en casa."
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-cc-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-cc-navy">{t("Financing Guidance", "Orientación de Financiamiento")}</h4>
                    <p className="text-sm md:text-base text-cc-charcoal">
                      {t(
                        "Down payment programs, closing cost grants, VA benefits — I'll make sure you know every dollar available to you.",
                        "Programas de pago inicial, subsidios de cierre, beneficios VA — me aseguraré de que conozcas cada dólar disponible para ti."
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-cc-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-cc-navy">{t("Local Expertise", "Experiencia Local")}</h4>
                    <p className="text-sm md:text-base text-cc-charcoal">
                      {t(
                        "20+ years in Tucson. I don't just know the neighborhoods — I know which streets flood, which schools are rising, and where the best tamales are.",
                        "20+ años en Tucson. No solo conozco los vecindarios — sé qué calles se inundan, qué escuelas van en ascenso y dónde están los mejores tamales."
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-cc-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-cc-navy">{t("24/7 AI Concierge", "Asistente IA 24/7")}</h4>
                    <p className="text-sm md:text-base text-cc-charcoal">
                      {t(
                        "Can't sleep because you're thinking about your offer? Selena's up too. She'll answer your questions at 2 AM so you wake up clear-headed.",
                        "¿No puedes dormir porque estás pensando en tu oferta? Selena también está despierta. Te responderá a las 2 AM para que amanezcas con claridad."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Featured Guide: Understanding Home Valuation */}
              <FeaturedGuideCard
                guideId="first-time-buyer-guide"
                titleEn="First-Time Home Buyer's Complete Guide"
                titleEs="Guía Completa para Compradores de Primera Vivienda"
                descriptionEn="Everything you need to know about buying your first home in Tucson—from pre-approval to closing day, with clarity at every step."
                descriptionEs="Todo lo que necesita saber sobre comprar su primera casa en Tucson—desde la pre-aprobación hasta el día de cierre, con claridad en cada paso."
                readTimeEn=""
                readTimeEs=""
                ctaSource="v2_buy_featured"
              />
              
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 lg:py-20 pb-24 sm:pb-16 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
            {t("Let's find your place in Tucson.", "Encontremos tu lugar en Tucson.")}
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            {t(
              "I'll sit down with you, understand what you're really looking for, and build a game plan that fits your life — not just your budget.",
              "Me sentaré contigo, entenderé lo que realmente buscas, y armaremos un plan que se adapte a tu vida — no solo a tu presupuesto."
            )}
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button 
              asChild
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 py-3 text-sm sm:px-10 sm:py-6 sm:text-lg shadow-gold"
            >
              <Link
                to="/book?intent=buy&source=buy_hub_bottom"
                onClick={() => logCTAClick({ cta_name: 'buy_hub_book_call', destination: '/book', page_path: '/buy', intent: 'buy' })}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t("Book a Strategy Call", "Agenda una Llamada de Estrategia")}
              </Link>
            </Button>
            <button
              onClick={handleSelenaRoute}
              className="inline-flex items-center gap-2 text-cc-gold hover:text-cc-gold/80 text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t("Still exploring? Let Selena help you get your bearings", "¿Todavía explorando? Deja que Selena te oriente")}
            </button>
          </div>
        </div>
      </section>
      <StickyMobileBookingBar intent="buy" source="buy_hub_sticky" />
      
    </>
  );
};

const V2Buy = () => (
  <V2Layout>
    <V2BuyContent />
  </V2Layout>
);

export default V2Buy;
