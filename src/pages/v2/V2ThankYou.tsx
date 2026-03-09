import { useSearchParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import V2Layout from "@/components/v2/V2Layout";
import { CheckCircle2, Clock, FileText, Home, Phone, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import { logEvent } from "@/lib/analytics/logEvent";

type IntentType = 'cash' | 'sell' | 'buy' | 'dual' | 'explore';

const PAGE_PATH = '/thank-you';

const V2ThankYouContent = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const { openChat } = useSelenaChat();
  
  const intent = (searchParams.get("intent") || "explore") as IntentType;
  const slotTime = searchParams.get("slot_time") || null;
  const leadName = searchParams.get("name")?.split(" ")[0] || "";

  // Log booking_completed on mount for GHL redirect tracking
  useEffect(() => {
    const intentParam = searchParams.get("intent") || "direct";
    const name = searchParams.get("name") || undefined;
    const utm_source = searchParams.get("utm_source");
    const utm_campaign = searchParams.get("utm_campaign");
    const utm_medium = searchParams.get("utm_medium");
    const utm_content = searchParams.get("utm_content");
    const utm_term = searchParams.get("utm_term");

    logEvent('booking_completed', {
      intent: intentParam,
      source: 'ghl_calendar_redirect',
      ...(name && { name }),
      ...(utm_source && { utm_source }),
      ...(utm_campaign && { utm_campaign }),
      ...(utm_medium && { utm_medium }),
      ...(utm_content && { utm_content }),
      ...(utm_term && { utm_term }),
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Handle CTA clicks with tracking
  const handleCTAClick = (ctaName: string, destination: string) => {
    logCTAClick({
      cta_name: ctaName,
      destination,
      page_path: PAGE_PATH,
      intent,
    });
  };

  // Handle Selena prompt click - with post-booking context for identity reinforcement
  const handleSelenaClick = () => {
    logCTAClick({
      cta_name: CTA_NAMES.THANK_YOU_SELENA_PROMPT,
      destination: 'selena_chat',
      page_path: PAGE_PATH,
      intent,
    });
    // Pass post-booking context so Selena seals the decision
    openChat({
      source: 'post_booking',
      intent,
      userName: leadName,
    });
  };
  
  // Intent-specific content using formal Spanish
  const getIntentContent = () => {
    switch (intent) {
      case 'cash':
        return {
          headline: t(
            `${leadName ? `${leadName}, ` : ''}Your Cash Offer Evaluation is Confirmed!`,
            `${leadName ? `${leadName}, ` : ''}¡Su Evaluación de Oferta en Efectivo está Confirmada!`
          ),
          subtitle: t(
            "Here's what happens next:",
            "Esto es lo que sigue:"
          ),
          steps: [
            {
              icon: Clock,
              title: t('Within 24-48 Hours', 'Dentro de 24-48 Horas'),
              description: t(
                'I will personally review your property details and prepare a competitive cash offer.',
                'Revisaré personalmente los detalles de su propiedad y prepararé una oferta competitiva en efectivo.'
              ),
            },
            {
              icon: Phone,
              title: t('During Our Call', 'Durante Nuestra Llamada'),
              description: t(
                'I\'ll walk you through the cash offer, answer all your questions, and discuss your options—no pressure.',
                'Le explicaré la oferta en efectivo, responderé todas sus preguntas y discutiremos sus opciones—sin presión.'
              ),
            },
            {
              icon: FileText,
              title: t('If You Accept', 'Si Usted Acepta'),
              description: t(
                'We can close in as little as 7-14 days. You choose the timeline that works for you.',
                'Podemos cerrar en tan solo 7-14 días. Usted elige el plazo que le funcione.'
              ),
            },
          ],
          cta: {
            label: t('Explore Your Cash Offer Options', 'Explorar Sus Opciones de Oferta en Efectivo'),
            href: '/cash-offer-options',
            icon: FileText,
          },
          resource: {
            title: t('Tucson Cash Offer Guide', 'Guía de Ofertas en Efectivo de Tucson'),
            description: t(
              'Learn how cash offers work and what to expect.',
              'Aprenda cómo funcionan las ofertas en efectivo y qué esperar.'
            ),
            href: '/guides/cash-offer-guide',
          },
        };
      
      case 'buy':
        return {
          headline: t(
            `${leadName ? `${leadName}, ` : ''}Your Buyer Strategy Session is Confirmed!`,
            `${leadName ? `${leadName}, ` : ''}¡Su Sesión Estratégica de Comprador está Confirmada!`
          ),
          subtitle: t(
            "Here's how to prepare:",
            "Así puede prepararse:"
          ),
          steps: [
            {
              icon: FileText,
              title: t('Before Our Call', 'Antes de Nuestra Llamada'),
              description: t(
                'Review the Tucson Buyer\'s Guide I\'ve prepared—it covers neighborhoods, pricing trends, and the buying process.',
                'Revise la Guía del Comprador de Tucson que he preparado—cubre vecindarios, tendencias de precios y el proceso de compra.'
              ),
            },
            {
              icon: Home,
              title: t('During Our Session', 'Durante Nuestra Sesión'),
              description: t(
                'We\'ll discuss your must-haves, timeline, and create a personalized search strategy.',
                'Discutiremos sus requisitos esenciales, cronograma y crearemos una estrategia de búsqueda personalizada.'
              ),
            },
            {
              icon: Clock,
              title: t('After the Call', 'Después de la Llamada'),
              description: t(
                'I\'ll set you up with custom property alerts tailored to your criteria.',
                'Le configuraré alertas de propiedades personalizadas según sus criterios.'
              ),
            },
          ],
          cta: {
            label: t('Read: First-Time Buyer Guide', 'Leer: Guía para Compradores Primerizos'),
            href: '/v2/guides/first-time-buyer-guide',
            icon: FileText,
          },
          resource: {
            title: t('First-Time Buyer Roadmap', 'Guía para Compradores Primerizos'),
            description: t(
              'Step-by-step guide for first-time homebuyers.',
              'Guía paso a paso para compradores de vivienda por primera vez.'
            ),
            href: '/v2/guides/first-time-buyer-guide',
          },
        };
      
      case 'sell':
        return {
          headline: t(
            `${leadName ? `${leadName}, ` : ''}Your Seller Strategy Session is Confirmed!`,
            `${leadName ? `${leadName}, ` : ''}¡Su Sesión Estratégica de Vendedor está Confirmada!`
          ),
          subtitle: t(
            "I'll be preparing your personalized analysis:",
            "Estaré preparando su análisis personalizado:"
          ),
          steps: [
            {
              icon: Home,
              title: t('Property Research', 'Investigación de Propiedad'),
              description: t(
                'I\'ll run comparable sales analysis (comps) for your property and neighborhood.',
                'Realizaré un análisis de ventas comparables (comps) para su propiedad y vecindario.'
              ),
            },
            {
              icon: FileText,
              title: t('Net Sheet Preview', 'Vista Previa de Ganancias Netas'),
              description: t(
                'I\'ll prepare a detailed breakdown of what you can expect to walk away with.',
                'Prepararé un desglose detallado de lo que puede esperar llevarse.'
              ),
            },
            {
              icon: Clock,
              title: t('During Our Call', 'Durante Nuestra Llamada'),
              description: t(
                'We\'ll review your options: traditional listing, cash offer, or a hybrid approach.',
                'Revisaremos sus opciones: listado tradicional, oferta en efectivo o un enfoque híbrido.'
              ),
            },
          ],
          cta: {
            label: t('Calculate: Your Net Proceeds', 'Calcular: Sus Ganancias Netas'),
            href: '/v2/cash-offer-options',
            icon: FileText,
          },
          resource: {
            title: t('Selling for Top Dollar Guide', 'Guía para Vender al Mejor Precio'),
            description: t(
              'Learn strategies to maximize your home\'s value.',
              'Aprenda estrategias para maximizar el valor de su casa.'
            ),
            href: '/v2/guides/selling-for-top-dollar',
          },
        };
      
      case 'dual':
        return {
          headline: t(
            `${leadName ? `${leadName}, ` : ''}Your Buy & Sell Coordination Session is Confirmed!`,
            `${leadName ? `${leadName}, ` : ''}¡Su Sesión de Coordinación Compra y Venta está Confirmada!`
          ),
          subtitle: t(
            "Here's how I'll help you navigate this:",
            "Así le ayudaré a navegar esto:"
          ),
          steps: [
            {
              icon: Clock,
              title: t('Timeline Alignment', 'Alineación de Cronograma'),
              description: t(
                'We\'ll map out the timing to minimize overlap stress and maximize your negotiating power.',
                'Planificaremos los tiempos para minimizar el estrés de superposición y maximizar su poder de negociación.'
              ),
            },
            {
              icon: Home,
              title: t('Dual Strategy', 'Estrategia Dual'),
              description: t(
                'I\'ll analyze both sides—your current home\'s value and your new home search criteria.',
                'Analizaré ambos lados—el valor de su casa actual y los criterios de búsqueda de su nueva casa.'
              ),
            },
            {
              icon: FileText,
              title: t('Bridge Options', 'Opciones de Transición'),
              description: t(
                'We\'ll discuss bridge financing, contingent offers, and backup plans.',
                'Discutiremos financiamiento puente, ofertas contingentes y planes alternativos.'
              ),
            },
          ],
          cta: null, // No broken guide link - direct to consultation
          resource: {
            title: t('Selling for Top Dollar Guide', 'Guía para Vender al Mejor Precio'),
            description: t(
              'Helpful strategies for your selling side of the equation.',
              'Estrategias útiles para el lado de venta de la ecuación.'
            ),
            href: '/v2/guides/selling-for-top-dollar',
          },
        };
      
      default:
        return {
          headline: t(
            `${leadName ? `${leadName}, ` : ''}Your Consultation is Confirmed!`,
            `${leadName ? `${leadName}, ` : ''}¡Su Consulta está Confirmada!`
          ),
          subtitle: t(
            "I look forward to speaking with you!",
            "¡Espero con gusto hablar con usted!"
          ),
          steps: [
            {
              icon: Clock,
              title: t('What to Expect', 'Qué Esperar'),
              description: t(
                'A friendly, no-pressure conversation about your real estate goals.',
                'Una conversación amigable, sin presión, sobre sus metas de bienes raíces.'
              ),
            },
            {
              icon: Phone,
              title: t('How to Reach Me', 'Cómo Contactarme'),
              description: t(
                'If you need to reschedule, call or text me at 520-349-3248.',
                'Si necesita reprogramar, llámeme o envíeme un mensaje de texto al 520-349-3248.'
              ),
            },
          ],
          cta: null,
          resource: {
            title: t('First-Time Buyer Guide', 'Guía para Compradores Primerizos'),
            description: t(
              'Helpful information for anyone exploring the market.',
              'Información útil para cualquier persona explorando el mercado.'
            ),
            href: '/v2/guides/first-time-buyer-guide',
          },
        };
    }
  };
  
  const content = getIntentContent();
  
  return (
    <>
      {/* Hero */}
      <section className="bg-cc-navy pt-32 pb-16 w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-white">
              {content.headline}
            </h1>
            
            {slotTime && (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Clock className="w-4 h-4 text-cc-gold" />
                <span className="text-white font-medium">{slotTime}</span>
              </div>
            )}
            
            <p className="text-lg text-white/90">
              {content.subtitle}
            </p>
          </div>
        </div>
      </section>
      
      {/* What Happens Next */}
      <section className="py-12 lg:py-16 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {content.steps.map((step, idx) => (
                <div 
                  key={idx}
                  className="flex gap-4 bg-white rounded-xl p-5 shadow-sm border border-cc-sand-dark/20"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-cc-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cc-navy text-lg mb-1">
                      {step.title}
                    </h3>
                    <p className="text-cc-charcoal">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Primary CTA */}
            {content.cta && (
              <div className="mt-8 text-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold px-8 py-6 text-lg"
                  onClick={() => handleCTAClick(`${CTA_NAMES.THANK_YOU_PRIMARY}_${intent}`, content.cta!.href)}
                >
                  <Link to={content.cta.href}>
                    <content.cta.icon className="w-5 h-5 mr-2" />
                    {content.cta.label}
                  </Link>
                </Button>
              </div>
            )}
            
            {/* Secondary Resource */}
            {content.resource && (
              <div className="mt-8 bg-cc-sand rounded-xl p-6 border border-cc-sand-dark/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-cc-navy mb-1">
                      {content.resource.title}
                    </h4>
                    <p className="text-sm text-cc-charcoal">
                      {content.resource.description}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-shrink-0 border-cc-gold text-cc-navy hover:bg-cc-gold/10"
                    onClick={() => handleCTAClick(`${CTA_NAMES.THANK_YOU_RESOURCE}_${intent}`, content.resource!.href)}
                  >
                    <Link to={content.resource.href}>
                      {t('Read', 'Leer')}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Selena Prompt - Soft, no-pressure */}
      <section className="py-10 bg-white border-t border-b border-cc-sand-dark/20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleSelenaClick}
              className="w-full p-5 rounded-xl bg-cc-sand hover:bg-cc-sand-dark/30 border border-cc-sand-dark/30 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cc-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-cc-gold" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-cc-navy mb-1">
                    {t("While you wait, I can help", "Mientras espera, puedo ayudarle")}
                  </h4>
                  <p className="text-sm text-cc-charcoal">
                    {t(
                      "Have questions before your call? I'm Selena, and I'm here to help you feel prepared.",
                      "¿Tiene preguntas antes de su llamada? Soy Selena, y estoy aquí para ayudarle a sentirse preparado/a."
                    )}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-cc-slate group-hover:text-cc-navy transition-colors flex-shrink-0" />
              </div>
            </button>
          </div>
        </div>
      </section>
      
      {/* Contact Backup */}
      <section className="py-10 bg-cc-ivory">
        <div className="container mx-auto px-4 text-center">
          <p className="text-cc-charcoal mb-2">
            {t(
              'Need to reschedule? Reach me directly:',
              '¿Necesita reprogramar? Contácteme directamente:'
            )}
          </p>
          <a 
            href="tel:520-349-3248" 
            className="text-cc-gold font-semibold text-lg hover:underline"
            onClick={() => handleCTAClick(CTA_NAMES.THANK_YOU_PHONE, 'tel:520-349-3248')}
          >
            520-349-3248
          </a>
        </div>
      </section>
    </>
  );
};

const V2ThankYou = () => (
  <V2Layout>
    <V2ThankYouContent />
  </V2Layout>
);

export default V2ThankYou;
