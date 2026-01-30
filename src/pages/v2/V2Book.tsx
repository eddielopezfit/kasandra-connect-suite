import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import V2Layout from "@/components/v2/V2Layout";
import ConsultationIntakeForm from "@/components/v2/ConsultationIntakeForm";
import { funnelTestimonials } from "@/data/testimonials";
import { Calendar, Phone, Mail, Clock, Quote } from "lucide-react";
import { updateSessionContext, getSessionContext } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";

const V2BookContent = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent") || "general"; // buyer, seller, or general
  
  // Get session context for ad funnel detection
  const session = getSessionContext();
  
  // Detect if user came from ad funnel with net sheet data
  const isAdFunnelVisitor = session?.ad_funnel_source && session?.intent === 'cash_offer';
  
  // Get stored difference from localStorage (set by SellerResult.tsx)
  const storedDifference = typeof window !== 'undefined' 
    ? localStorage.getItem('cc_net_sheet_difference')
    : null;
  const formattedDifference = storedDifference 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(storedDifference))
    : null;
  
  // Dynamic headline based on ad funnel context
  const getHeadline = () => {
    if (isAdFunnelVisitor && formattedDifference) {
      return t(
        `Let's Review Your ${formattedDifference} Net Sheet Analysis`,
        `Revisemos su Análisis de Ganancias Netas de ${formattedDifference}`
      );
    }
    return t("Book a Consultation", "Agendar una Cita");
  };
  
  // Dynamic subheadline for ad funnel visitors
  const getSubheadline = () => {
    if (isAdFunnelVisitor) {
      return t(
        "Kasandra will personally walk you through your options and answer any questions.",
        "Kasandra le explicará personalmente sus opciones y responderá todas sus preguntas."
      );
    }
    return t(
      "Ready to discuss your real estate goals? Schedule a free, no-obligation consultation with me.",
      "¿Listo para discutir sus metas de bienes raíces? Agende una consulta gratuita, sin obligación, conmigo."
    );
  };

  // Get the appropriate testimonial based on intent
  const testimonialData = funnelTestimonials[intent as keyof typeof funnelTestimonials] || funnelTestimonials.general;
  const currentTestimonial = {
    quote: testimonialData.content[language],
    attribution: testimonialData.role[language],
    source: testimonialData.source,
  };

  const handleFormSuccess = (leadId: string) => {
    console.log("Consultation intake submitted, lead_id:", leadId);
    
    // Track booking commitment (Stage 6 signal)
    updateSessionContext({ has_booked: true });
    logEvent('consultation_booked', { 
      lead_id: leadId,
      intent: searchParams.get("intent") || "general" 
    });
    
    // Persist journey action for cognitive stage calculation
    const actions = JSON.parse(localStorage.getItem('cc_journey_actions') || '[]');
    if (!actions.includes('book')) {
      actions.push('book');
      localStorage.setItem('cc_journey_actions', JSON.stringify(actions));
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-cc-navy pt-32 pb-16 w-full max-w-full overflow-hidden">
        <div className="container mx-auto px-4 w-full max-w-full">
          <div className="max-w-3xl mx-auto text-center">
            <Calendar className="w-12 h-12 text-cc-gold mx-auto mb-6" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
              {getHeadline()}
            </h1>
            <p className="text-lg text-white/90 mb-8">
              {getSubheadline()}
            </p>
            
            {/* Funnel-Aligned Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-xl mx-auto">
              <Quote className="w-6 h-6 text-cc-gold/50 mx-auto mb-3" />
              <p className="text-white/90 italic text-sm mb-3">
                "{currentTestimonial.quote}"
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-cc-gold text-xs font-medium">— {currentTestimonial.attribution}</span>
                <span className="text-white/40 text-[10px]">({currentTestimonial.source})</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 lg:py-20 bg-cc-ivory w-full max-w-full overflow-hidden">
        <div className="container mx-auto px-4 w-full max-w-full">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-8 shadow-elevated border border-cc-sand-dark/30">
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-6">
                {t("Get in Touch", "Póngase en Contacto")}
              </h2>
              <p className="text-cc-charcoal mb-8">
                {t(
                  "Prefer to reach out directly? I'm here to help and happy to answer any questions you have.",
                  "¿Prefiere comunicarse directamente? Estoy aquí para ayudar y feliz de responder cualquier pregunta que tenga."
                )}
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-cc-gold" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-cc-navy">{t("Phone", "Teléfono")}</h4>
                    <a href="tel:520-349-3248" className="text-cc-charcoal hover:text-cc-gold transition-colors">
                      520-349-3248
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-cc-gold" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-cc-navy">Email</h4>
                    <a href="mailto:kasandra@prietorealestategroup.com" className="text-cc-charcoal hover:text-cc-gold transition-colors">
                      kasandra@prietorealestategroup.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-cc-gold" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-cc-navy">{t("Availability", "Disponibilidad")}</h4>
                    <p className="text-cc-charcoal">
                      {t("Monday - Saturday, 9 AM - 6 PM", "Lunes - Sábado, 9 AM - 6 PM")}
                    </p>
                    <p className="text-sm text-cc-slate mt-1">
                      {t("Selena AI available 24/7", "Selena IA disponible 24/7")}
                    </p>
                  </div>
                </div>
              </div>

              {/* What to Expect */}
              <div className="mt-8 bg-cc-sand rounded-xl p-6 border border-cc-sand-dark/30">
                <h3 className="font-serif text-lg font-bold text-cc-navy mb-4">
                  {t("What to Expect", "Qué Esperar")}
                </h3>
                <ul className="space-y-3 text-sm text-cc-charcoal">
                  <li className="flex items-start gap-2">
                    <span className="text-cc-gold font-bold">•</span>
                    {t("A friendly, no-pressure conversation", "Una conversación amigable, sin presión")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cc-gold font-bold">•</span>
                    {t("Understanding of your goals and timeline", "Comprensión de sus metas y cronograma")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cc-gold font-bold">•</span>
                    {t("Clear explanation of the process", "Explicación clara del proceso")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cc-gold font-bold">•</span>
                    {t("Answers to all your questions", "Respuestas a todas sus preguntas")}
                  </li>
                </ul>
              </div>
            </div>

            {/* Native Consultation Intake Form */}
            <div className="bg-white rounded-2xl shadow-elevated border border-cc-sand-dark/30 overflow-hidden w-full max-w-full">
              <div className="p-4 sm:p-6 pb-0">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-cc-navy mb-2 text-center">
                  {t("Consultation Intake Form", "Formulario de Consulta")}
                </h3>
                <p className="text-xs sm:text-sm text-cc-charcoal text-center mb-4">
                  {t(
                    "Complete this form to request your free consultation.",
                    "Complete este formulario para solicitar su consulta gratuita."
                  )}
                </p>
              </div>
              
              <ConsultationIntakeForm onSuccess={handleFormSuccess} />
            </div>
          </div>
        </div>
      </section>

      {/* Language Note */}
      <section className="py-10 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/90">
            {t(
              "Bilingual service available in English and Spanish. / Servicio bilingüe disponible en inglés y español.",
              "Servicio bilingüe disponible en inglés y español. / Bilingual service available in English and Spanish."
            )}
          </p>
        </div>
      </section>
    </>
  );
};

const V2Book = () => (
  <V2Layout>
    <V2BookContent />
  </V2Layout>
);

export default V2Book;
