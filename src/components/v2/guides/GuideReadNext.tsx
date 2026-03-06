import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { type GuideCategory } from "@/lib/guides/guideRegistry";

interface RelatedGuide {
  id: string;
  titleEn: string;
  titleEs: string;
  descEn: string;
  descEs: string;
  category: GuideCategory;
}

// Curated related guide map — keyed by current guide ID
// Each guide points to 2 related guides that continue the logical reading journey
const RELATED_GUIDES: Record<string, [RelatedGuide, RelatedGuide]> = {
  'cost-to-sell-tucson': [
    { id: 'home-prep-staging', titleEn: 'How to Prepare Your Home for Sale', titleEs: 'Cómo Preparar tu Casa para Vender', descEn: 'The high-ROI prep list that actually moves the needle in Tucson.', descEs: 'La lista de preparación de alto retorno que marca la diferencia en Tucson.', category: 'selling' },
    { id: 'pricing-strategy', titleEn: 'How to Price Your Home to Sell', titleEs: 'Cómo Fijar el Precio para Vender', descEn: 'Why pricing correctly from day one saves you more than any negotiation.', descEs: 'Por qué fijar el precio correcto desde el primer día te ahorra más que cualquier negociación.', category: 'selling' },
  ],
  'home-prep-staging': [
    { id: 'cost-to-sell-tucson', titleEn: 'What It Actually Costs to Sell', titleEs: 'Lo que Realmente Cuesta Vender', descEn: 'Full breakdown of commissions, closing costs, and holding costs.', descEs: 'Desglose completo de comisiones, costos de cierre y costos de tenencia.', category: 'selling' },
    { id: 'pricing-strategy', titleEn: 'How to Price Your Home to Sell', titleEs: 'Cómo Fijar el Precio para Vender', descEn: 'The data behind correct pricing and why overpricing costs more.', descEs: 'Los datos detrás del precio correcto y por qué sobrevalorar cuesta más.', category: 'selling' },
  ],
  'pricing-strategy': [
    { id: 'cost-to-sell-tucson', titleEn: 'What It Actually Costs to Sell', titleEs: 'Lo que Realmente Cuesta Vender', descEn: 'Understand every dollar before you list.', descEs: 'Entiende cada dólar antes de listar.', category: 'selling' },
    { id: 'how-long-to-sell-tucson', titleEn: 'How Long Does It Take to Sell in Tucson?', titleEs: '¿Cuánto Tiempo Tarda en Venderse en Tucson?', descEn: 'Current days on market and what affects your timeline.', descEs: 'Días actuales en el mercado y qué afecta tu plazo.', category: 'selling' },
  ],
  'first-time-buyer-guide': [
    { id: 'arizona-first-time-buyer-programs', titleEn: 'Arizona Down Payment Assistance Programs', titleEs: 'Programas de Asistencia para el Pago Inicial en Arizona', descEn: 'HOME Plus, ADOH, and other programs that help first-time buyers.', descEs: 'HOME Plus, ADOH y otros programas que ayudan a los compradores primerizos.', category: 'buying' },
    { id: 'tucson-neighborhoods', titleEn: 'Best Neighborhoods in Tucson', titleEs: 'Los Mejores Vecindarios de Tucson', descEn: 'A neighborhood-by-neighborhood breakdown for buyers.', descEs: 'Análisis vecindario por vecindario para compradores.', category: 'buying' },
  ],
  'arizona-first-time-buyer-programs': [
    { id: 'first-time-buyer-guide', titleEn: 'The First-Time Buyer Guide', titleEs: 'La Guía para Compradores Primerizos', descEn: 'The complete roadmap from pre-approval to keys in hand.', descEs: 'El mapa completo desde la preaprobación hasta las llaves en mano.', category: 'buying' },
    { id: 'buying-home-noncitizen-arizona', titleEn: 'Buying as a Non-Citizen in Arizona', titleEs: 'Comprar sin Ser Ciudadano en Arizona', descEn: 'ITIN, green card, and DACA mortgage options explained.', descEs: 'Opciones de hipoteca con ITIN, tarjeta verde y DACA explicadas.', category: 'buying' },
  ],
  'tucson-neighborhoods': [
    { id: 'tucson-suburb-comparison', titleEn: 'Marana vs Vail vs Sahuarita', titleEs: 'Marana vs Vail vs Sahuarita', descEn: 'Side-by-side comparison of Tucson\'s fastest-growing suburbs.', descEs: 'Comparación de los suburbios de más rápido crecimiento de Tucson.', category: 'buying' },
    { id: 'relocating-to-tucson', titleEn: 'Moving to Tucson in 2026', titleEs: 'Mudarse a Tucson en 2026', descEn: 'Everything to know before relocating — cost of living, climate, and more.', descEs: 'Todo lo que hay que saber antes de mudarse — costo de vida, clima y más.', category: 'buying' },
  ],
  'military-pcs-guide': [
    { id: 'tucson-neighborhoods', titleEn: 'Best Neighborhoods in Tucson', titleEs: 'Los Mejores Vecindarios de Tucson', descEn: 'Neighborhood breakdown including proximity to Davis-Monthan.', descEs: 'Análisis de vecindarios incluyendo proximidad a Davis-Monthan.', category: 'buying' },
    { id: 'first-time-buyer-guide', titleEn: 'The Complete Buyer\'s Guide', titleEs: 'La Guía Completa para Compradores', descEn: 'Everything a Tucson buyer needs from pre-approval to closing.', descEs: 'Todo lo que un comprador de Tucson necesita desde la preaprobación hasta el cierre.', category: 'buying' },
  ],
  'cash-vs-traditional-sale': [
    { id: 'cost-to-sell-tucson', titleEn: 'What It Actually Costs to Sell', titleEs: 'Lo que Realmente Cuesta Vender', descEn: 'Compare traditional sale costs against your cash offer number.', descEs: 'Compara los costos de venta tradicional con tu oferta en efectivo.', category: 'selling' },
    { id: 'sell-now-or-wait', titleEn: 'Should You Sell Now or Wait?', titleEs: '¿Deberías Vender Ahora o Esperar?', descEn: 'How Tucson market conditions affect your timing decision.', descEs: 'Cómo las condiciones del mercado de Tucson afectan tu decisión de tiempo.', category: 'selling' },
  ],
  'divorce-selling': [
    { id: 'cost-to-sell-tucson', titleEn: 'What It Actually Costs to Sell', titleEs: 'Lo que Realmente Cuesta Vender', descEn: 'Understand the full financial picture before you decide.', descEs: 'Entiende el panorama financiero completo antes de decidir.', category: 'selling' },
    { id: 'cash-vs-traditional-sale', titleEn: 'Cash Offer vs. Traditional Listing', titleEs: 'Oferta en Efectivo vs. Listado Tradicional', descEn: 'A fast cash sale can simplify divorce proceedings significantly.', descEs: 'Una venta rápida en efectivo puede simplificar significativamente el proceso de divorcio.', category: 'cash' },
  ],
  'sell-or-rent-tucson': [
    { id: 'cost-to-sell-tucson', titleEn: 'What It Actually Costs to Sell', titleEs: 'Lo que Realmente Cuesta Vender', descEn: 'Run the real numbers on your sale option.', descEs: 'Calcula los números reales de tu opción de venta.', category: 'selling' },
    { id: 'pima-county-property-taxes', titleEn: 'Pima County Property Taxes Explained', titleEs: 'Impuestos a la Propiedad en Pima Explicados', descEn: 'What you\'ll owe if you hold the property as a rental.', descEs: 'Lo que deberás si mantienes la propiedad como alquiler.', category: 'selling' },
  ],
};

// Category color map — matches brand system
const CATEGORY_COLORS: Record<GuideCategory, string> = {
  selling: 'bg-amber-50 text-amber-800 border-amber-200',
  buying: 'bg-blue-50 text-blue-800 border-blue-200',
  cash: 'bg-green-50 text-green-800 border-green-200',
  probate: 'bg-purple-50 text-purple-800 border-purple-200',
  valuation: 'bg-orange-50 text-orange-800 border-orange-200',
  stories: 'bg-gray-50 text-gray-700 border-gray-200',
};

const CATEGORY_LABELS: Record<GuideCategory, { en: string; es: string }> = {
  selling: { en: 'Selling', es: 'Vender' },
  buying: { en: 'Buying', es: 'Comprar' },
  cash: { en: 'Cash Options', es: 'Opciones en Efectivo' },
  probate: { en: 'Probate', es: 'Sucesión' },
  valuation: { en: 'Valuation', es: 'Valuación' },
  stories: { en: 'Stories', es: 'Historias' },
};

interface GuideReadNextProps {
  currentGuideId: string;
  /** Fallback category guides if no specific mapping exists */
  currentCategory: GuideCategory;
}

export function GuideReadNext({ currentGuideId, currentCategory }: GuideReadNextProps) {
  const { t, language } = useLanguage();

  const related = RELATED_GUIDES[currentGuideId];
  if (!related) return null;

  return (
    <section className="py-12 bg-cc-navy">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-5 h-5 text-cc-gold flex-shrink-0" />
            <p className="text-cc-gold font-medium tracking-wide uppercase text-sm">
              {t('Continue Learning', 'Continúa Aprendiendo')}
            </p>
          </div>
          <h3 className="font-serif text-2xl text-white mb-8">
            {t('Related Guides for Your Situation', 'Guías Relacionadas para Tu Situación')}
          </h3>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {related.map((guide) => (
              <Link
                key={guide.id}
                to={`/v2/guides/${guide.id}`}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cc-gold/40 rounded-xl p-6 transition-all duration-200 flex flex-col gap-3"
              >
                {/* Category badge */}
                <span className={`self-start text-xs font-medium px-2 py-1 rounded-full border ${CATEGORY_COLORS[guide.category]}`}>
                  {language === 'es' ? CATEGORY_LABELS[guide.category].es : CATEGORY_LABELS[guide.category].en}
                </span>

                {/* Title */}
                <h4 className="font-serif text-white text-lg leading-snug group-hover:text-cc-gold transition-colors">
                  {language === 'es' ? guide.titleEs : guide.titleEn}
                </h4>

                {/* Description */}
                <p className="text-white/60 text-sm leading-relaxed flex-1">
                  {language === 'es' ? guide.descEs : guide.descEn}
                </p>

                {/* CTA arrow */}
                <div className="flex items-center gap-2 text-cc-gold text-sm font-medium mt-1">
                  {t('Read guide', 'Leer guía')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
