import { useLanguage } from "@/contexts/LanguageContext";
import { Home, DollarSign, Key, ArrowRightLeft, Search, Calendar } from "lucide-react";

type IntentCanonical = 'cash' | 'sell' | 'buy' | 'dual' | 'explore' | null;

interface IntentHeaderProps {
  intent: IntentCanonical;
}

/**
 * Dynamic header component that changes based on user intent
 * Uses formal Spanish ("Usted") per brand guidelines
 */
const IntentHeader = ({ intent }: IntentHeaderProps) => {
  const { t } = useLanguage();
  
  const getHeaderContent = () => {
    switch (intent) {
      case 'cash':
        return {
          icon: DollarSign,
          title: t('Fast-Track Property Evaluation', 'Evaluación Rápida de Propiedad'),
          subtitle: t(
            'Get a no-obligation cash offer within 24-48 hours.',
            'Obtenga una oferta en efectivo sin obligación en 24-48 horas.'
          ),
          accent: 'text-green-600',
          bgAccent: 'bg-green-50',
        };
      case 'sell':
        return {
          icon: Home,
          title: t('Seller Strategy Session', 'Sesión Estratégica para Vendedores'),
          subtitle: t(
            'Let me analyze your property and discuss the best path to maximize your net.',
            'Permítame analizar su propiedad y discutir el mejor camino para maximizar sus ganancias.'
          ),
          accent: 'text-cc-gold',
          bgAccent: 'bg-cc-gold/5',
        };
      case 'buy':
        return {
          icon: Key,
          title: t('Buyer Strategy Session', 'Sesión Estratégica para Compradores'),
          subtitle: t(
            'Let me understand your needs and create a personalized home search plan.',
            'Permítame entender sus necesidades y crear un plan personalizado de búsqueda.'
          ),
          accent: 'text-blue-600',
          bgAccent: 'bg-blue-50',
        };
      case 'dual':
        return {
          icon: ArrowRightLeft,
          title: t('Buy & Sell Coordination Session', 'Sesión de Coordinación Compra y Venta'),
          subtitle: t(
            'Selling and buying simultaneously? I specialize in coordinating seamless transitions.',
            '¿Vendiendo y comprando al mismo tiempo? Me especializo en coordinar transiciones fluidas.'
          ),
          accent: 'text-purple-600',
          bgAccent: 'bg-purple-50',
        };
      case 'explore':
      default:
        return {
          icon: Calendar,
          title: t('Book a Consultation', 'Agendar una Cita'),
          subtitle: t(
            'Ready to discuss your real estate goals? Schedule a personalized strategy session with me.',
            '¿Listo para discutir sus metas de bienes raíces? Agende una sesión de estrategia personalizada conmigo.'
          ),
          accent: 'text-cc-gold',
          bgAccent: 'bg-cc-sand',
        };
    }
  };
  
  const { icon: Icon, title, subtitle, accent, bgAccent } = getHeaderContent();
  
  return (
    <div className={`rounded-xl p-6 ${bgAccent} border border-cc-sand-dark/20`}>
      <div className="flex flex-col items-center text-center gap-4">
        <div className={`w-14 h-14 rounded-full ${bgAccent} border-2 border-current flex items-center justify-center ${accent}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-2">
            {title}
          </h2>
          <p className="text-cc-charcoal text-base max-w-lg mx-auto">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IntentHeader;
