/**
 * AuthorityCTABlock - Decision-Compression CTA
 * 
 * High-authority CTA block for guide pages that:
 * - Displays category-specific authority bridge text
 * - Shows market insight for cash guides
 * - Provides a single calm, inevitable CTA
 * 
 * Tone: Calm, Adult, Inevitable, Earned
 * No urgency, no "free", no hype, no exclamation points
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { logEvent } from '@/lib/analytics/logEvent';
import type { GuideCategory } from '@/lib/guides/guideRegistry';
import { Calendar, Home, DollarSign, BookOpen } from 'lucide-react';

interface AuthorityCTABlockProps {
  category: GuideCategory;
  guideTitle: string;
  isCashGuide?: boolean;
  authorityBridge?: { en: string; es: string };
  marketInsight?: { en: string; es: string };
}

// Default authority bridge copy by category
const DEFAULT_AUTHORITY_BRIDGE: Record<GuideCategory, { en: string; es: string }> = {
  buying: {
    en: "This decision has nuances most people don't see until it's too late. Kasandra walks people through exactly this every day.",
    es: "Esta decisión tiene matices que la mayoría no ve hasta que es demasiado tarde. Kasandra guía a las personas a través de exactamente esto todos los días.",
  },
  selling: {
    en: "Selling is situational. What works depends on your timeline, your home's condition, and the current Tucson market. Kasandra helps you see all of it clearly.",
    es: "Vender es situacional. Lo que funciona depende de su cronograma, la condición de su casa y el mercado actual de Tucson. Kasandra le ayuda a verlo todo claramente.",
  },
  valuation: {
    en: "Understanding your home's value is the foundation of any good decision. Kasandra provides clarity, not pressure.",
    es: "Entender el valor de su casa es la base de cualquier buena decisión. Kasandra ofrece claridad, no presión.",
  },
  cash: {
    en: "Cash transactions amplify mistakes. The outcome depends on structure, timing, and who's protecting your interests, not just speed.",
    es: "Las transacciones en efectivo amplifican los errores. El resultado depende de la estructura, el momento y quién protege sus intereses, no solo la velocidad.",
  },
  stories: {
    en: "Every situation is different. What stays the same is having someone who can see the whole picture.",
    es: "Cada situación es diferente. Lo que no cambia es tener a alguien que pueda ver el panorama completo.",
  },
};

// Default market insight for cash guides (only shown when isCashGuide)
const DEFAULT_CASH_MARKET_INSIGHT = {
  en: "In Tucson, cash buyer patterns vary by neighborhood and season. Kasandra has evaluated hundreds of cash offers and rejected the ones that didn't serve her clients. She'll do the same for you.",
  es: "En Tucson, los patrones de compradores en efectivo varían por vecindario y temporada. Kasandra ha evaluado cientos de ofertas en efectivo y rechazado las que no beneficiaban a sus clientes. Hará lo mismo por usted.",
};

// CTA configuration by category
const CTA_CONFIG: Record<GuideCategory, { 
  link: string; 
  labelEn: string; 
  labelEs: string; 
  icon: typeof Calendar;
}> = {
  buying: {
    link: '/v2/book',
    labelEn: 'Book Your Buyer Strategy Session',
    labelEs: 'Reserve Su Sesión de Estrategia para Comprador',
    icon: Calendar,
  },
  selling: {
    link: '/v2/book',
    labelEn: 'Request a Home Value Review',
    labelEs: 'Solicitar Revisión de Valor de Vivienda',
    icon: Home,
  },
  valuation: {
    link: '/v2/book',
    labelEn: 'Request a Home Value Review',
    labelEs: 'Solicitar Revisión de Valor de Vivienda',
    icon: Home,
  },
  cash: {
    link: '/v2/cash-offer-options',
    labelEn: 'Schedule Your Private Cash Review',
    labelEs: 'Programe Su Revisión Privada de Efectivo',
    icon: DollarSign,
  },
  stories: {
    link: '/v2/book',
    labelEn: 'Explore Your Options with Kasandra',
    labelEs: 'Explore Sus Opciones con Kasandra',
    icon: BookOpen,
  },
};

// Subtext (same for all categories - calm, no-pressure)
const SUBTEXT = {
  en: "A calm, no-pressure conversation to understand your real options.",
  es: "Una conversación tranquila, sin presión, para entender sus opciones reales.",
};

const AuthorityCTABlock = ({
  category,
  guideTitle,
  isCashGuide = false,
  authorityBridge,
  marketInsight,
}: AuthorityCTABlockProps) => {
  const { t } = useLanguage();
  
  // Resolve authority bridge (use override or default)
  const bridge = authorityBridge ?? DEFAULT_AUTHORITY_BRIDGE[category];
  
  // Resolve market insight for cash guides
  const insight = isCashGuide 
    ? (marketInsight ?? DEFAULT_CASH_MARKET_INSIGHT)
    : null;
  
  // Get CTA config
  const cta = CTA_CONFIG[category];
  const Icon = cta.icon;

  // Log view on mount
  useEffect(() => {
    logEvent('guide_authority_cta_view', {
      category,
      guide_title: guideTitle,
      is_cash_guide: isCashGuide,
    });
  }, [category, guideTitle, isCashGuide]);

  const handleCTAClick = () => {
    logEvent('guide_authority_cta_click', {
      category,
      guide_title: guideTitle,
      destination: cta.link,
    });
  };

  return (
    <section className="bg-cc-navy py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center">
          {/* Authority Bridge */}
          <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-6">
            {t(bridge.en, bridge.es)}
          </p>
          
          {/* Market Insight (cash guides only) */}
          {insight && (
            <p className="text-white/70 text-base leading-relaxed mb-8">
              {t(insight.en, insight.es)}
            </p>
          )}
          
          {/* Single Primary CTA */}
          <Button 
            asChild 
            size="lg" 
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-10 py-6 text-base sm:text-lg shadow-gold max-w-full"
            onClick={handleCTAClick}
          >
            <Link 
              to={cta.link} 
              className="inline-flex items-center gap-2 sm:gap-3 flex-wrap justify-center"
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-center">{t(cta.labelEn, cta.labelEs)}</span>
            </Link>
          </Button>
          
          {/* Subtext */}
          <p className="text-white/50 text-sm mt-4">
            {t(SUBTEXT.en, SUBTEXT.es)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AuthorityCTABlock;
