import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { Calculator, ClipboardCheck, Scale, Sparkles, BarChart3, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import AreaMotionWrapper from './AreaMotionWrapper';

interface AreaDecisionToolsProps {
  slug: string;
}

interface ToolCard {
  icon: typeof Calculator;
  labelEn: string;
  labelEs: string;
  descEn: string;
  descEs: string;
  path: string;
  toolId: string;
}

const buyerTools: ToolCard[] = [
  {
    icon: Calculator,
    labelEn: 'Affordability Calculator',
    labelEs: 'Calculadora de Asequibilidad',
    descEn: 'See what you can comfortably afford in this area.',
    descEs: 'Mira lo que puedes pagar cómodamente en esta área.',
    path: '/affordability-calculator',
    toolId: 'affordability_calculator',
  },
  {
    icon: ClipboardCheck,
    labelEn: 'Buyer Readiness Check',
    labelEs: 'Verificación de Preparación',
    descEn: 'Understand where you stand before making an offer.',
    descEs: 'Entiende dónde estás antes de hacer una oferta.',
    path: '/buyer-readiness',
    toolId: 'buyer_readiness',
  },
];

const sellerTools: ToolCard[] = [
  {
    icon: Scale,
    labelEn: 'Net-to-Seller Calculator',
    labelEs: 'Calculadora Neto al Vendedor',
    descEn: 'Know your real take-home before listing.',
    descEs: 'Conoce tu ganancia real antes de listar.',
    path: '/net-to-seller',
    toolId: 'net_to_seller',
  },
  {
    icon: Sparkles,
    labelEn: 'Seller Decision Engine',
    labelEs: 'Motor de Decisión del Vendedor',
    descEn: 'Find your best path — cash, list, or hold.',
    descEs: 'Encuentra tu mejor camino — efectivo, listar o retener.',
    path: '/seller-decision',
    toolId: 'seller_decision',
  },
];

const cashTools: ToolCard[] = [
  {
    icon: Scale,
    labelEn: 'Cash vs. Traditional',
    labelEs: 'Efectivo vs. Tradicional',
    descEn: 'Compare what you\'d keep under each option.',
    descEs: 'Compara lo que conservarías con cada opción.',
    path: '/cash-offer-options',
    toolId: 'cash_comparison',
  },
  {
    icon: ClipboardCheck,
    labelEn: 'Cash Readiness Check',
    labelEs: 'Verificación de Efectivo',
    descEn: 'See if a cash offer makes sense for your situation.',
    descEs: 'Mira si una oferta en efectivo tiene sentido para tu situación.',
    path: '/cash-readiness',
    toolId: 'cash_readiness',
  },
];

const explorerTools: ToolCard[] = [
  {
    icon: BarChart3,
    labelEn: 'Market Intelligence',
    labelEs: 'Inteligencia de Mercado',
    descEn: 'Get a data-driven view of the Tucson market.',
    descEs: 'Obtén una vista basada en datos del mercado de Tucson.',
    path: '/market',
    toolId: 'market_intelligence',
  },
  {
    icon: MapPin,
    labelEn: 'Neighborhood Quiz',
    labelEs: 'Quiz de Vecindarios',
    descEn: 'Find areas that match your lifestyle preferences.',
    descEs: 'Encuentra áreas que coincidan con tu estilo de vida.',
    path: '/neighborhoods',
    toolId: 'neighborhood_quiz',
  },
];

const AreaDecisionTools = ({ slug }: AreaDecisionToolsProps) => {
  const { t, language } = useLanguage();
  const { intent, toolsCompleted } = useJourneyProgress();

  let tools: ToolCard[];
  switch (intent) {
    case 'buy': tools = buyerTools; break;
    case 'sell': tools = sellerTools; break;
    case 'cash': tools = cashTools; break;
    default: tools = explorerTools;
  }

  // Filter out completed tools
  const available = tools.filter(tc => !toolsCompleted.includes(tc.toolId));
  if (available.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <AreaMotionWrapper className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mb-3">
              {t('Your Decision Tools', 'Tus Herramientas de Decisión')}
            </h2>
            <p className="text-cc-text-muted">
              {t(
                'Clarity before commitment — use these to guide your next step.',
                'Claridad antes del compromiso — usa estas para guiar tu próximo paso.'
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {available.map((tool, i) => (
              <motion.div
                key={tool.toolId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link
                  to={`${tool.path}?neighborhood=${slug}`}
                  className="group block bg-cc-ivory hover:bg-white rounded-2xl p-8 border border-cc-sand-dark/10 hover:border-cc-gold/30 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cc-navy/5 group-hover:bg-cc-gold/10 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                      <tool.icon className="w-6 h-6 text-cc-navy group-hover:text-cc-gold transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-cc-navy mb-2 group-hover:text-cc-gold transition-colors">
                        {language === 'es' ? tool.labelEs : tool.labelEn}
                      </h3>
                      <p className="text-cc-text-muted text-sm">
                        {language === 'es' ? tool.descEs : tool.descEn}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Continuity nudge */}
          <div className="text-center mt-8">
            <p className="text-cc-text-muted text-sm italic">
              {t(
                'Not sure which tool to start with? Selena can help you decide.',
                '¿No estás seguro/a por dónde empezar? Selena puede ayudarte a decidir.'
              )}
            </p>
          </div>
        </AreaMotionWrapper>
      </div>
    </section>
  );
};

export default AreaDecisionTools;
