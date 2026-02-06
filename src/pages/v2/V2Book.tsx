import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import V2Layout from "@/components/v2/V2Layout";
import ConsultationIntakeForm from "@/components/v2/ConsultationIntakeForm";
import { IntentHeader } from "@/components/v2/booking";
import { funnelTestimonials } from "@/data/testimonials";
import { Calendar, Phone, Mail, Clock, Quote } from "lucide-react";
import { updateSessionContext, getSessionContext } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";

type IntentCanonical = 'cash' | 'sell' | 'buy' | 'dual' | 'explore' | null;

/**
 * Map URL intent param to canonical intent
 */
const mapIntentParam = (param: string | null): IntentCanonical => {
  if (!param) return null;
  const map: Record<string, IntentCanonical> = {
    buyer: 'buy',
    buy: 'buy',
    seller: 'sell',
    sell: 'sell',
    cash: 'cash',
    cash_offer: 'cash',
    dual: 'dual',
    buy_and_sell: 'dual',
    general: null,
    explore: 'explore',
  };
  return map[param.toLowerCase()] || null;
};

const V2BookContent = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get intent from URL or session
  const urlIntent = searchParams.get("intent");
  const session = getSessionContext();
  const canonicalIntent = mapIntentParam(urlIntent) || (session?.intent as IntentCanonical) || null;
  
  // Detect if user came from ad funnel with net sheet data
  const isAdFunnelVisitor = session?.ad_funnel_source && session?.intent === 'cash';
  
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

  // Get the appropriate testimonial based on intent
  const testimonialKey = canonicalIntent === 'buy' ? 'buyer' : canonicalIntent === 'sell' ? 'seller' : 'general';
  const testimonialData = funnelTestimonials[testimonialKey as keyof typeof funnelTestimonials] || funnelTestimonials.general;
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
      intent: canonicalIntent || "general" 
    });
    
    // Persist journey action for cognitive stage calculation
    const actions = JSON.parse(localStorage.getItem('cc_journey_actions') || '[]');
    if (!actions.includes('book')) {
      actions.push('book');
      localStorage.setItem('cc_journey_actions', JSON.stringify(actions));
    }
    
    // Redirect to thank you page with context
    const userName = localStorage.getItem('cc_user_name') || '';
    navigate(`/v2/thank-you?intent=${canonicalIntent || 'explore'}&name=${encodeURIComponent(userName)}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-cc-navy pt-32 pb-12 w-full max-w-full overflow-hidden">
        <div className="container mx-auto px-4 w-full max-w-full">
          <div className="max-w-3xl mx-auto text-center">
            <Calendar className="w-12 h-12 text-cc-gold mx-auto mb-6" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
              {getHeadline()}
            </h1>
            
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

      {/* Booking Form Section */}
      <section className="py-8 md:py-12 lg:py-16 bg-cc-ivory w-full max-w-full overflow-hidden">
        <div className="container mx-auto px-4 w-full max-w-full">
          <div className="max-w-2xl mx-auto">
            {/* Intent-Based Header */}
            <div className="mb-8">
              <IntentHeader intent={canonicalIntent} />
            </div>
            
            {/* Native Form */}
            <div 
              className="bg-white rounded-2xl shadow-elevated border border-cc-sand-dark/30 overflow-hidden w-full"
            >
              <ConsultationIntakeForm onSuccess={handleFormSuccess} />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-12 lg:py-16 bg-white w-full max-w-full overflow-hidden">
        <div className="container mx-auto px-4 w-full max-w-full">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-4">
                {t("Prefer to Reach Out Directly?", "¿Prefiere Comunicarse Directamente?")}
              </h2>
              <p className="text-cc-charcoal">
                {t(
                  "I'm here to help and happy to answer any questions you have.",
                  "Estoy aquí para ayudar y feliz de responder cualquier pregunta que tenga."
                )}
              </p>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5 text-cc-gold" />
                </div>
                <h4 className="font-semibold text-cc-navy mb-1">{t("Phone", "Teléfono")}</h4>
                <a href="tel:520-349-3248" className="text-cc-charcoal hover:text-cc-gold transition-colors text-sm">
                  520-349-3248
                </a>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-cc-gold" />
                </div>
                <h4 className="font-semibold text-cc-navy mb-1">Email</h4>
                <a href="mailto:kasandra@prietorealestategroup.com" className="text-cc-charcoal hover:text-cc-gold transition-colors text-sm break-all">
                  kasandra@prietorealestategroup.com
                </a>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-cc-gold" />
                </div>
                <h4 className="font-semibold text-cc-navy mb-1">{t("Availability", "Disponibilidad")}</h4>
                <p className="text-cc-charcoal text-sm">
                  {t("Mon - Sat, 9 AM - 6 PM", "Lun - Sáb, 9 AM - 6 PM")}
                </p>
                <p className="text-xs text-cc-slate mt-1">
                  {t("Selena AI 24/7", "Selena IA 24/7")}
                </p>
              </div>
            </div>

            {/* What to Expect */}
            <div className="mt-8 bg-cc-sand rounded-xl p-6 border border-cc-sand-dark/30">
              <h3 className="font-serif text-lg font-bold text-cc-navy mb-4 text-center">
                {t("What to Expect", "Qué Esperar")}
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3 text-sm text-cc-charcoal">
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
