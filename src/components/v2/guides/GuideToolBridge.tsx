import { Link } from "react-router-dom";
import { ArrowRight, Calculator, MapPin, DollarSign, BarChart2, CheckCircle, Compass } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * GuideToolBridge
 *
 * The mid-guide conversion moment. Appears at the highest-intent section
 * of each guide — when the reader has absorbed the context and is ready to
 * act on their specific situation.
 *
 * Design principle: stops the scroll without interrupting flow.
 * Not a banner ad. Not a popup. A natural next step in the journey.
 *
 * Navy left border accent + gold icon + Kasandra-voiced copy.
 */

export interface ToolBridgeConfig {
  /** Icon variant */
  icon: 'calculator' | 'map' | 'dollar' | 'chart' | 'check' | 'compass';
  /** Gold eyebrow label */
  eyebrowEn: string;
  eyebrowEs: string;
  /** Bold headline */
  headlineEn: string;
  headlineEs: string;
  /** Supporting copy in Kasandra's voice */
  bodyEn: string;
  bodyEs: string;
  /** Primary CTA */
  ctaLabelEn: string;
  ctaLabelEs: string;
  ctaPath: string;
  /** Optional secondary CTA */
  secondaryLabelEn?: string;
  secondaryLabelEs?: string;
  secondaryPath?: string;
}

// Curated tool bridge configs per guide — written in Kasandra's voice
export const TOOL_BRIDGES: Record<string, ToolBridgeConfig> = {
  'cost-to-sell-tucson': {
    icon: 'calculator',
    eyebrowEn: 'Run Your Numbers',
    eyebrowEs: 'Calcula tus Números',
    headlineEn: 'What Would You Actually Walk Away With?',
    headlineEs: '¿Con Qué Te Quedarías Realmente?',
    bodyEn: 'The numbers above are averages. Your home, your mortgage payoff, your situation — run the real calculation in under 2 minutes.',
    bodyEs: 'Los números de arriba son promedios. Tu casa, tu saldo hipotecario, tu situación — calcula el número real en menos de 2 minutos.',
    ctaLabelEn: 'Open Seller Net Calculator',
    ctaLabelEs: 'Abrir Calculadora de Neto',
    ctaPath: '/v2/cash-offer-options',
    secondaryLabelEn: 'Compare neighborhoods instead',
    secondaryLabelEs: 'Comparar vecindarios mejor',
    secondaryPath: '/v2/neighborhood-compare',
  },
  'home-prep-staging': {
    icon: 'check',
    eyebrowEn: 'Know Where You Stand',
    eyebrowEs: 'Sabe Dónde Estás',
    headlineEn: 'Are You Actually Ready to List?',
    headlineEs: '¿Estás Realmente Listo para Listar?',
    bodyEn: 'Prep strategy depends on your timeline, condition, and goals. The Seller Readiness quiz gives you a prioritized action list — not a generic checklist.',
    bodyEs: 'La estrategia de preparación depende de tu cronograma, condición y objetivos. El cuestionario de Preparación del Vendedor te da una lista de acciones prioritarias — no una lista genérica.',
    ctaLabelEn: 'Check My Seller Readiness',
    ctaLabelEs: 'Verificar Mi Preparación para Vender',
    ctaPath: '/v2/seller-readiness',
    secondaryLabelEn: 'See what it costs to sell',
    secondaryLabelEs: 'Ver cuánto cuesta vender',
    secondaryPath: '/v2/guides/cost-to-sell-tucson',
  },
  'pricing-strategy': {
    icon: 'chart',
    eyebrowEn: 'See Live Market Data',
    eyebrowEs: 'Ver Datos del Mercado en Vivo',
    headlineEn: 'What\'s the Market Saying Right Now?',
    headlineEs: '¿Qué Dice el Mercado Ahora Mismo?',
    bodyEn: 'Days on market, sale-to-list ratio, and holding cost data — updated from Pima County MLS. Context that changes what a "good price" actually means today.',
    bodyEs: 'Días en el mercado, proporción precio de venta vs. lista y datos de costos de tenencia — actualizados del MLS del Condado de Pima. Contexto que cambia lo que un "buen precio" significa hoy.',
    ctaLabelEn: 'View Tucson Market Intelligence',
    ctaLabelEs: 'Ver Inteligencia del Mercado de Tucson',
    ctaPath: '/v2/market',
    secondaryLabelEn: 'Run my seller net sheet',
    secondaryLabelEs: 'Calcular mi hoja de neto',
    secondaryPath: '/v2/cash-offer-options',
  },
  'how-long-to-sell-tucson': {
    icon: 'chart',
    eyebrowEn: 'Live Tucson Market Data',
    eyebrowEs: 'Datos en Vivo del Mercado de Tucson',
    headlineEn: 'Current Days on Market — Not Last Month\'s Number',
    headlineEs: 'Días Actuales en el Mercado — No el Número del Mes Pasado',
    bodyEn: 'Median DOM, sale-to-list ratio, and holding cost per day — refreshed from Pima County MLS. Know whether the market is moving faster or slower than average right now.',
    bodyEs: 'DOM promedio, proporción precio de venta vs. lista y costo de tenencia por día — actualizados del MLS del Condado de Pima. Sabe si el mercado se mueve más rápido o lento que el promedio ahora mismo.',
    ctaLabelEn: 'View Market Intelligence Report',
    ctaLabelEs: 'Ver Informe de Inteligencia del Mercado',
    ctaPath: '/v2/market',
    secondaryLabelEn: 'Estimate my closing costs',
    secondaryLabelEs: 'Estimar mis costos de cierre',
    secondaryPath: '/v2/buyer-closing-costs',
  },
  'first-time-buyer-guide': {
    icon: 'compass',
    eyebrowEn: 'Find Your Starting Point',
    eyebrowEs: 'Encuentra Tu Punto de Partida',
    headlineEn: 'Where Are You in the Buying Process?',
    headlineEs: '¿Dónde Estás en el Proceso de Compra?',
    bodyEn: 'Pre-approval, down payment, timeline — the Buyer Readiness Navigator gives you a personalized next step based on where you actually are, not where you think you should be.',
    bodyEs: 'Preaprobación, pago inicial, cronograma — el Navegador de Preparación del Comprador te da un próximo paso personalizado basado en dónde realmente estás, no donde crees que deberías estar.',
    ctaLabelEn: 'Check My Buyer Readiness',
    ctaLabelEs: 'Verificar Mi Preparación como Comprador',
    ctaPath: '/v2/buyer-readiness',
    secondaryLabelEn: 'Estimate my closing costs',
    secondaryLabelEs: 'Estimar mis costos de cierre',
    secondaryPath: '/v2/buyer-closing-costs',
  },
  'tucson-neighborhoods': {
    icon: 'map',
    eyebrowEn: 'Compare Side by Side',
    eyebrowEs: 'Compara Lado a Lado',
    headlineEn: 'Which Tucson ZIP Code Fits Your Life?',
    headlineEs: '¿Qué Código Postal de Tucson Se Adapta a Tu Vida?',
    bodyEn: 'Stop reading descriptions. Enter 2–3 ZIP codes and get a real side-by-side comparison — lifestyle, schools, commute, and what Kasandra knows about each area firsthand.',
    bodyEs: 'Deja de leer descripciones. Ingresa 2–3 códigos postales y obtén una comparación real lado a lado — estilo de vida, escuelas, viaje al trabajo y lo que Kasandra sabe de primera mano.',
    ctaLabelEn: 'Compare Neighborhoods Now',
    ctaLabelEs: 'Comparar Vecindarios Ahora',
    ctaPath: '/v2/neighborhood-compare',
    secondaryLabelEn: 'Check my buyer readiness',
    secondaryLabelEs: 'Verificar mi preparación como comprador',
    secondaryPath: '/v2/buyer-readiness',
  },
  'military-pcs-guide': {
    icon: 'compass',
    eyebrowEn: 'Start Your Tucson Search',
    eyebrowEs: 'Comienza Tu Búsqueda en Tucson',
    headlineEn: 'Compare Davis-Monthan Proximity by ZIP Code',
    headlineEs: 'Compara Proximidad a Davis-Monthan por Código Postal',
    bodyEn: 'See Foothills, Vail, and Marana side by side — commute to DM, school ratings, and what military families say about each area.',
    bodyEs: 'Ve Foothills, Vail y Marana lado a lado — viaje a DM, calificaciones escolares y lo que las familias militares dicen de cada área.',
    ctaLabelEn: 'Compare Tucson Neighborhoods',
    ctaLabelEs: 'Comparar Vecindarios de Tucson',
    ctaPath: '/v2/neighborhood-compare',
    secondaryLabelEn: 'Check my VA loan readiness',
    secondaryLabelEs: 'Verificar mi preparación para préstamo VA',
    secondaryPath: '/v2/buyer-readiness',
  },
  'relocating-to-tucson': {
    icon: 'map',
    eyebrowEn: 'Find Your Tucson Neighborhood',
    eyebrowEs: 'Encuentra Tu Vecindario en Tucson',
    headlineEn: 'Not Sure Where in Tucson to Land?',
    headlineEs: '¿No Sabes Dónde Asentarte en Tucson?',
    bodyEn: 'Compare any 2–3 ZIP codes in Tucson side by side. Lifestyle, buyer fit, market framing, and what makes each area different — in plain language.',
    bodyEs: 'Compara cualquier 2–3 códigos postales en Tucson lado a lado. Estilo de vida, compatibilidad del comprador, contexto del mercado y qué hace diferente cada área — en lenguaje sencillo.',
    ctaLabelEn: 'Compare Tucson Neighborhoods',
    ctaLabelEs: 'Comparar Vecindarios de Tucson',
    ctaPath: '/v2/neighborhood-compare',
    secondaryLabelEn: 'Check my buyer readiness',
    secondaryLabelEs: 'Verificar mi preparación como comprador',
    secondaryPath: '/v2/buyer-readiness',
  },
  'cash-vs-traditional-sale': {
    icon: 'dollar',
    eyebrowEn: 'Run the Real Comparison',
    eyebrowEs: 'Haz la Comparación Real',
    headlineEn: 'Cash Offer vs. Listing — What\'s the Difference for Your Home?',
    headlineEs: 'Oferta en Efectivo vs. Listar — ¿Cuál Es la Diferencia para Tu Casa?',
    bodyEn: 'The right answer depends on your mortgage payoff, your timeline, and what the market is doing right now. The calculator runs both scenarios with real numbers.',
    bodyEs: 'La respuesta correcta depende de tu saldo hipotecario, tu cronograma y lo que está haciendo el mercado ahora mismo. La calculadora ejecuta ambos escenarios con números reales.',
    ctaLabelEn: 'Compare My Options',
    ctaLabelEs: 'Comparar Mis Opciones',
    ctaPath: '/v2/cash-offer-options',
  },
  'divorce-selling': {
    icon: 'calculator',
    eyebrowEn: 'Understand the Numbers First',
    eyebrowEs: 'Entiende los Números Primero',
    headlineEn: 'What Does Each Path Actually Net You?',
    headlineEs: '¿Cuánto Te Neta Realmente Cada Camino?',
    bodyEn: 'Before any decisions are made, both parties need to see the real numbers — cash vs. listing, net proceeds, timeline. No pressure. Just clarity.',
    bodyEs: 'Antes de tomar decisiones, ambas partes necesitan ver los números reales — efectivo vs. listado, ganancias netas, cronograma. Sin presión. Solo claridad.',
    ctaLabelEn: 'Run My Net Sheet',
    ctaLabelEs: 'Calcular Mi Hoja de Neto',
    ctaPath: '/v2/cash-offer-options',
  },
  'arizona-first-time-buyer-programs': {
    icon: 'dollar',
    eyebrowEn: 'See What You Qualify For',
    eyebrowEs: 'Ve Para Qué Calificas',
    headlineEn: 'How Much Cash Do You Actually Need at Closing?',
    headlineEs: '¿Cuánto Efectivo Necesitas Realmente en el Cierre?',
    bodyEn: 'Down payment assistance changes the equation significantly. The closing cost estimator shows exactly what you\'d need — conventional, FHA, or VA — before and after assistance.',
    bodyEs: 'La asistencia para el pago inicial cambia significativamente la ecuación. El estimador de costos de cierre muestra exactamente lo que necesitarías — convencional, FHA o VA — antes y después de la asistencia.',
    ctaLabelEn: 'Estimate My Closing Costs',
    ctaLabelEs: 'Estimar Mis Costos de Cierre',
    ctaPath: '/v2/buyer-closing-costs',
    secondaryLabelEn: 'Check my buyer readiness',
    secondaryLabelEs: 'Verificar mi preparación como comprador',
    secondaryPath: '/v2/buyer-readiness',
  },
  'selling-for-top-dollar': {
    icon: 'calculator',
    eyebrowEn: 'Know Your Number Before You Decide',
    eyebrowEs: 'Conoce Tu Número Antes de Decidir',
    headlineEn: 'What Would You Actually Walk Away With?',
    headlineEs: '¿Con Qué Te Quedarías Realmente?',
    bodyEn: 'Strategy means nothing without the real number. Your mortgage payoff, estimated value, and closing costs — calculated in under 2 minutes. See cash vs. traditional side by side.',
    bodyEs: 'La estrategia no significa nada sin el número real. Tu saldo hipotecario, valor estimado y costos de cierre — calculado en menos de 2 minutos. Ve efectivo vs. tradicional lado a lado.',
    ctaLabelEn: 'Run My Seller Net Sheet',
    ctaLabelEs: 'Calcular Mi Hoja de Neto',
    ctaPath: '/v2/cash-offer-options',
    secondaryLabelEn: 'Check where I am in the process',
    secondaryLabelEs: 'Ver dónde estoy en el proceso',
    secondaryPath: '/v2/seller-decision',
  },
  'cash-offer-guide': {
    icon: 'dollar',
    eyebrowEn: 'Run the Real Comparison',
    eyebrowEs: 'Haz la Comparación Real',
    headlineEn: 'Cash Offer vs. Listing — Which Nets You More?',
    headlineEs: 'Oferta en Efectivo vs. Listar — ¿Cuál Te Neta Más?',
    bodyEn: 'The right answer depends on your mortgage payoff, your timeline, and what buyers are doing right now in Tucson. Enter your numbers — the calculator runs both scenarios.',
    bodyEs: 'La respuesta correcta depende de tu saldo hipotecario, tu cronograma y lo que los compradores están haciendo ahora en Tucson. Ingresa tus números — la calculadora ejecuta ambos escenarios.',
    ctaLabelEn: 'Compare My Options',
    ctaLabelEs: 'Comparar Mis Opciones',
    ctaPath: '/v2/cash-offer-options',
    secondaryLabelEn: 'Take the cash readiness quiz',
    secondaryLabelEs: 'Tomar el cuestionario de preparación de efectivo',
    secondaryPath: '/v2/cash-readiness',
  },
  'sell-now-or-wait': {
    icon: 'chart',
    eyebrowEn: 'Get a Diagnosis, Not a Guess',
    eyebrowEs: 'Obtén un Diagnóstico, No una Suposición',
    headlineEn: 'Where Are You in the Selling Decision?',
    headlineEs: '¿Dónde Estás en la Decisión de Vender?',
    bodyEn: 'Timeline pressure, financial readiness, market timing — the Seller Decision Wizard maps your situation in 5 questions and tells you what makes sense next.',
    bodyEs: 'Presión de tiempo, preparación financiera, momento del mercado — el Asistente de Decisión del Vendedor mapea tu situación en 5 preguntas y te dice qué tiene sentido a continuación.',
    ctaLabelEn: 'Start the Decision Wizard',
    ctaLabelEs: 'Iniciar el Asistente de Decisión',
    ctaPath: '/v2/seller-decision',
    secondaryLabelEn: 'See live Tucson market data',
    secondaryLabelEs: 'Ver datos del mercado de Tucson en vivo',
    secondaryPath: '/v2/market',
  },
  'distressed-preforeclosure': {
    icon: 'compass',
    eyebrowEn: 'You Have More Options Than You Think',
    eyebrowEs: 'Tienes Más Opciones de las que Crees',
    headlineEn: 'Let's Figure Out What Makes Sense for Your Situation',
    headlineEs: 'Descubramos Qué Tiene Sentido para Tu Situación',
    bodyEn: 'No forms. No judgment. Selena can walk through your timeline, what you owe, and what exit paths are still open — before you have to talk to anyone.',
    bodyEs: 'Sin formularios. Sin juicios. Selena puede revisar tu cronograma, lo que debes y qué opciones de salida siguen abiertas — antes de que tengas que hablar con nadie.',
    ctaLabelEn: 'Talk Through My Options',
    ctaLabelEs: 'Hablar Sobre Mis Opciones',
    ctaPath: '/v2/sell',
    secondaryLabelEn: 'See what a cash offer would net me',
    secondaryLabelEs: 'Ver cuánto me neta una oferta en efectivo',
    secondaryPath: '/v2/cash-offer-options',
  },
  'inherited-probate-property': {
    icon: 'compass',
    eyebrowEn: 'Understand Your Path First',
    eyebrowEs: 'Entiende Tu Camino Primero',
    headlineEn: 'Is This Property More Likely a Cash Sale or a Listed Sale?',
    headlineEs: '¿Es Esta Propiedad Más Probable una Venta en Efectivo o una Venta Listada?',
    bodyEn: 'Inherited properties often sell as-is — condition, probate status, and heir timeline all affect which path makes more sense. The cash readiness quiz helps you see where you stand.',
    bodyEs: 'Las propiedades heredadas a menudo se venden tal como están — la condición, el estado de sucesión y el cronograma de los herederos afectan qué camino tiene más sentido. El cuestionario de preparación te ayuda a ver dónde estás.',
    ctaLabelEn: 'Take the Cash Readiness Quiz',
    ctaLabelEs: 'Tomar el Cuestionario de Preparación de Efectivo',
    ctaPath: '/v2/cash-readiness',
    secondaryLabelEn: 'Run a seller net estimate',
    secondaryLabelEs: 'Calcular una estimación neta del vendedor',
    secondaryPath: '/v2/cash-offer-options',
  },
};

};

const ICONS = {
  calculator: Calculator,
  map: MapPin,
  dollar: DollarSign,
  chart: BarChart2,
  check: CheckCircle,
  compass: Compass,
};

interface GuideToolBridgeProps {
  guideId: string;
}

export function GuideToolBridge({ guideId }: GuideToolBridgeProps) {
  const { t, language } = useLanguage();
  const config = TOOL_BRIDGES[guideId];

  if (!config) return null;

  const Icon = ICONS[config.icon];
  const eyebrow = language === 'es' ? config.eyebrowEs : config.eyebrowEn;
  const headline = language === 'es' ? config.headlineEs : config.headlineEn;
  const body = language === 'es' ? config.bodyEs : config.bodyEn;
  const ctaLabel = language === 'es' ? config.ctaLabelEs : config.ctaLabelEn;
  const secondaryLabel = language === 'es' ? config.secondaryLabelEs : config.secondaryLabelEn;

  return (
    <div className="my-10 relative">
      {/* Left accent border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cc-gold rounded-full" />

      <div className="ml-6 bg-cc-navy rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 sm:p-8">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-3">
            <Icon className="w-4 h-4 text-cc-gold flex-shrink-0" />
            <span className="text-cc-gold text-xs font-semibold tracking-widest uppercase">
              {eyebrow}
            </span>
          </div>

          {/* Headline */}
          <h3 className="font-serif text-xl sm:text-2xl text-white mb-3 leading-snug">
            {headline}
          </h3>

          {/* Body */}
          <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6">
            {body}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={config.ctaPath}
              className="inline-flex items-center justify-center gap-2 bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold text-sm px-5 py-3 rounded-lg transition-colors group"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {config.secondaryPath && secondaryLabel && (
              <Link
                to={config.secondaryPath}
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white/70 hover:text-white text-sm px-5 py-3 rounded-lg transition-colors"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
