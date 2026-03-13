import { useEffect, useState, useCallback } from "react";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import TestimonialCard from "@/components/v2/TestimonialCard";
import { buyerTestimonials } from "@/data/testimonials";
import { Home, Search, DollarSign, FileCheck, CheckCircle, MessageCircle } from "lucide-react";
import { setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import FeaturedGuideCard from "@/components/v2/shared/FeaturedGuideCard";
import { NeighborhoodExplorer, NeighborhoodQuiz } from "@/components/v2/neighborhood";
import heroImage from "@/assets/hero-neighborhood-road.png";
import { getStoredUserName } from "@/lib/analytics/bridgeLeadIdToV2";
import GlassmorphismHero from "@/components/v2/hero/GlassmorphismHero";

const PAGE_PATH = '/buy';
const PAGE_INTENT = 'buy' as const;

const V2BuyContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const [leadName, setLeadName] = useState<string | null>(null);
  const [quizExploreZip, setQuizExploreZip] = useState<string | null>(null);

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

  const steps = [
    {
      icon: DollarSign,
      title: t("Get Pre-Approved", "Obtenga Pre-Aprobación"),
      description: t(
        "I'll connect you with trusted lenders and help you understand financing options, including down payment assistance programs.",
        "Le conectaré con prestamistas de confianza y le ayudaré a entender las opciones de financiamiento, incluyendo programas de asistencia para pago inicial."
      ),
    },
    {
      icon: Search,
      title: t("Find Your Home", "Encuentre Su Casa"),
      description: t(
        "We'll search for properties that match your needs, budget, and lifestyle. I'll guide you through each showing.",
        "Buscaremos propiedades que coincidan con sus necesidades, presupuesto y estilo de vida. Le guiaré a través de cada visita."
      ),
    },
    {
      icon: FileCheck,
      title: t("Make an Offer", "Haga una Oferta"),
      description: t(
        "I'll help you craft a competitive offer and negotiate on your behalf, always keeping your best interests in mind.",
        "Le ayudaré a crear una oferta competitiva y negociaré en su nombre, siempre teniendo en cuenta sus mejores intereses."
      ),
    },
    {
      icon: Home,
      title: t("Close & Move In", "Cierre y Múdese"),
      description: t(
        "From inspections to closing, I'll be there every step of the way until you have the keys in hand.",
        "Desde las inspecciones hasta el cierre, estaré allí en cada paso hasta que tenga las llaves en mano."
      ),
    },
  ];

  return (
    <>
      {/* Hero */}
      <GlassmorphismHero
        badge={t("For Buyers", "Para Compradores")}
        headline={t("Find Your Tucson Home with Confidence.", "Encuentra tu hogar en Tucson con confianza.")}
        subtext={t(
          "Kasandra guides buyers through every step — from first search to closed door — with honesty, expertise, and an AI concierge built for you.",
          "Kasandra guía a compradores en cada paso — desde la primera búsqueda hasta el cierre — con honestidad, experiencia y un asistente de IA diseñado para ti."
        )}
        primaryLabel={t("Talk to Selena", "Habla con Selena")}
        secondaryLabel={t("Buyer Readiness Quiz", "Quiz de Preparación")}
        secondaryLink="/buyer-readiness"
        intent="buy"
        entrySource="buy_hero"
        pagePath="/buy"
        backgroundImage={heroImage}
      />

      {/* Sub-Hero Tools Strip — Closing Costs + Neighborhoods (demoted from hero) */}
      <section className="bg-white border-b border-cc-sand-dark/20 py-6">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-xs font-semibold text-cc-navy/50 uppercase tracking-wider text-center mb-4">
            {t("Buyer Planning Tools", "Herramientas de Planificación")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/buyer-closing-costs"
              onClick={() => handleCTAClick('sub_hero_closing_costs', '/buyer-closing-costs')}
              className="flex items-center gap-3 bg-cc-ivory hover:bg-cc-sand rounded-xl border border-cc-sand-dark/30 hover:border-cc-navy/20 px-4 py-3.5 transition-all group"
            >
              <DollarSign className="w-5 h-5 text-cc-gold flex-shrink-0" />
              <span className="text-sm font-semibold text-cc-navy leading-tight">
                {t("Estimate Closing Costs", "Estimar Costos de Cierre")}
              </span>
            </Link>
            <Link
              to="/neighborhood-compare"
              onClick={() => handleCTAClick('sub_hero_neighborhood_compare', '/neighborhood-compare')}
              className="flex items-center gap-3 bg-cc-ivory hover:bg-cc-sand rounded-xl border border-cc-sand-dark/30 hover:border-cc-navy/20 px-4 py-3.5 transition-all group"
            >
              <Search className="w-5 h-5 text-cc-gold flex-shrink-0" />
              <span className="text-sm font-semibold text-cc-navy leading-tight">
                {t("Compare Neighborhoods", "Comparar Vecindarios")}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="bg-cc-navy rounded-xl p-6 md:p-8 mb-10 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
              {t("The Buying Process", "El Proceso de Compra")}
            </h2>
            <p className="text-white/80 mt-3 max-w-2xl mx-auto">
              {t(
                "A clear, step-by-step approach to help you feel confident every step of the way.",
                "Un enfoque claro, paso a paso, para ayudarle a sentirse seguro en cada etapa."
              )}
            </p>
          </div>

          {/* Cards Container */}
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-elevated">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-cc-sand p-6 rounded-xl h-full border border-cc-sand-dark/30">
                    <div className="w-12 h-12 bg-cc-navy text-white rounded-full flex items-center justify-center font-bold mb-4">
                      {index + 1}
                    </div>
                    <step.icon className="w-8 h-8 text-cc-gold mb-4" />
                    <h3 className="font-serif text-lg font-bold text-cc-navy mb-3">{step.title}</h3>
                    <p className="text-sm text-cc-charcoal">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhood Quiz */}
      <NeighborhoodQuiz onExploreZip={handleQuizExplore} />

      {/* Neighborhood Intelligence */}
      <NeighborhoodExplorer externalZip={quizExploreZip} />

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
                    <p className="text-sm text-cc-charcoal">
                      {t(
                        "Communicate comfortably in English or Spanish throughout your entire journey.",
                        "Comuníquese cómodamente en inglés o español durante todo su viaje."
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-cc-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-cc-navy">{t("Financing Guidance", "Orientación de Financiamiento")}</h4>
                    <p className="text-sm text-cc-charcoal">
                      {t(
                        "I'll help you understand your options, including down payment assistance programs.",
                        "Le ayudaré a entender sus opciones, incluyendo programas de asistencia para pago inicial."
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-cc-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-cc-navy">{t("Local Expertise", "Experiencia Local")}</h4>
                    <p className="text-sm text-cc-charcoal">
                      {t(
                        "Over two decades in Tucson means I know this community inside and out.",
                        "Más de dos décadas en Tucson significa que conozco esta comunidad de adentro hacia afuera."
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-cc-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-cc-navy">{t("24/7 AI Concierge", "Asistente IA 24/7")}</h4>
                    <p className="text-sm text-cc-charcoal">
                      {t(
                        "Selena AI is available around the clock to answer questions and schedule appointments.",
                        "Selena AI está disponible las 24 horas para responder preguntas y programar citas."
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
            {t("Ready to Get Started?", "¿Listo para Comenzar?")}
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            {t(
              "Let's discuss your home buying goals and create a plan that works for you.",
              "Hablemos sobre sus metas de compra de casa y creemos un plan que funcione para usted."
            )}
          </p>
          <Button 
            onClick={handleSelenaRoute}
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 py-3 text-sm sm:px-10 sm:py-6 sm:text-lg shadow-gold"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="sm:hidden">{t("Ask Selena", "Pregúntale a Selena")}</span>
            <span className="hidden sm:inline">{t("Ask Selena to Help Me Get Started", "Pídale a Selena que me Ayude a Empezar")}</span>
          </Button>
          <p className="text-white/60 text-sm mt-4 max-w-md mx-auto">
            {t(
              "Selena will ask a few quick questions so Kasandra is prepared.",
              "Selena hará unas preguntas rápidas para que Kasandra esté preparada."
            )}
          </p>
        </div>
      </section>
    </>
  );
};

const V2Buy = () => (
  <V2Layout>
    <V2BuyContent />
  </V2Layout>
);

export default V2Buy;
