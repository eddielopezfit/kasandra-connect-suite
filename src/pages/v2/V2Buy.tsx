import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import V2Layout from "@/components/v2/V2Layout";
import TestimonialCard from "@/components/v2/TestimonialCard";
import { buyerTestimonials } from "@/data/testimonials";
import { Home, Search, DollarSign, FileCheck, CheckCircle, ArrowRight } from "lucide-react";
import { updateSessionContext } from "@/lib/analytics/selenaSession";

const V2BuyContent = () => {
  const { t } = useLanguage();

  // Auto-set intent when entering Buyer Decision Room
  useEffect(() => {
    updateSessionContext({ intent: 'buy' });
  }, []);

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
      <section className="bg-cc-navy pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
              {t("For Buyers", "Para Compradores")}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mt-2 mb-6 text-white">
              {t("Find Your Perfect Home in Tucson", "Encuentre Su Casa Perfecta en Tucson")}
            </h1>
            <p className="text-lg text-white/90 mb-8">
              {t(
                "Buying a home is one of the biggest decisions you'll make. With bilingual guidance and step-by-step support, I'll help you navigate the process with confidence.",
                "Comprar una casa es una de las decisiones más grandes que tomará. Con orientación bilingüe y apoyo paso a paso, le ayudaré a navegar el proceso con confianza."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-8 shadow-gold text-sm sm:text-base">
                <Link to="/v2/book">{t("Start Your Search", "Comience Su Búsqueda")}</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-6 sm:px-8 text-sm sm:text-base">
                <Link to="/v2/buyer-readiness">{t("Take Readiness Check", "Evalúe Su Preparación")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="bg-cc-navy rounded-xl p-6 md:p-8 mb-10 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
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

      {/* Benefits */}
      <section className="py-16 lg:py-20 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-cc-sand-dark/30">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mb-6">
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
            <div className="bg-white p-8 rounded-2xl shadow-elevated border border-cc-sand-dark/30">
              <h3 className="font-serif text-xl font-bold text-cc-navy mb-4">
                {t("Ready to Start?", "¿Listo para Comenzar?")}
              </h3>
              <p className="text-cc-charcoal mb-6">
                {t(
                  "Let's discuss your home buying goals and create a plan that works for you.",
                  "Hablemos sobre sus metas de compra de casa y creemos un plan que funcione para usted."
                )}
              </p>
              <Button asChild className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full shadow-gold">
                <Link to="/v2/book">{t("Book a Consultation", "Agendar una Cita")}</Link>
              </Button>
            </div>
          </div>
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
