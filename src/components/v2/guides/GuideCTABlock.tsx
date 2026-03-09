import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import { DollarSign, BookOpen, MessageCircle } from "lucide-react";
import type { GuideCategory } from "@/lib/guides/guideRegistry";

interface GuideCTABlockProps {
  category: GuideCategory;
}

// Life-event categories that always route through Selena
const SELENA_ROUTED_CATEGORIES: Set<GuideCategory> = new Set([
  'selling', 'valuation', 'probate', 'divorce', 'distressed', 'military', 'senior',
]);

// Category-specific CTA routing - strict key matching, no string.includes()
const getCTAConfig = (category: GuideCategory) => {
  if (category === 'buying') {
    return {
      link: "/buyer-readiness",
      textEn: "Start Buyer Readiness Check",
      textEs: "Iniciar Evaluación de Preparación",
      subtextEn: "A quick self-assessment to understand where you stand",
      subtextEs: "Una autoevaluación rápida para entender dónde está",
      icon: BookOpen,
      routeThruSelena: false,
      intent: 'buy' as const,
    };
  }

  if (category === 'cash') {
    return {
      link: "/v2/cash-offer-options",
      textEn: "Explore Cash Offer Options",
      textEs: "Explorar Opciones de Oferta en Efectivo",
      subtextEn: "See if a cash offer makes sense for your situation",
      subtextEs: "Vea si una oferta en efectivo tiene sentido para su situación",
      icon: DollarSign,
      routeThruSelena: false,
      intent: 'cash' as const,
    };
  }

  if (SELENA_ROUTED_CATEGORIES.has(category)) {
    // Map category to appropriate CTA copy
    const copyMap: Partial<Record<GuideCategory, { textEn: string; textEs: string; subtextEn: string; subtextEs: string }>> = {
      selling: {
        textEn: "Request a Home Value Review",
        textEs: "Solicitar Revisión de Valor",
        subtextEn: "Understand what your home might be worth today",
        subtextEs: "Entienda cuánto podría valer su casa hoy",
      },
      valuation: {
        textEn: "Request a Home Value Review",
        textEs: "Solicitar Revisión de Valor",
        subtextEn: "Understand what your home might be worth today",
        subtextEs: "Entienda cuánto podría valer su casa hoy",
      },
      probate: {
        textEn: "Discuss Your Inherited Property Options",
        textEs: "Converse Sobre Sus Opciones de Propiedad Heredada",
        subtextEn: "A calm conversation to understand your options",
        subtextEs: "Una conversación tranquila para entender sus opciones",
      },
      divorce: {
        textEn: "Talk Through Your Situation",
        textEs: "Converse Sobre Su Situación",
        subtextEn: "Sensitive guidance for a difficult transition",
        subtextEs: "Orientación sensible para una transición difícil",
      },
      distressed: {
        textEn: "Explore Your Property Options",
        textEs: "Explore Sus Opciones de Propiedad",
        subtextEn: "Understand what's possible for your situation",
        subtextEs: "Entienda lo que es posible para su situación",
      },
      military: {
        textEn: "Explore Your Transition Options",
        textEs: "Explore Sus Opciones de Transición",
        subtextEn: "Programs and paths available to you",
        subtextEs: "Programas y caminos disponibles para usted",
      },
      senior: {
        textEn: "Discuss Your Next Chapter",
        textEs: "Converse Sobre Su Próximo Capítulo",
        subtextEn: "Planning at your pace, on your terms",
        subtextEs: "Planificación a su ritmo, en sus términos",
      },
    };
    const copy = copyMap[category] ?? copyMap.selling!;
    return {
      link: "selena_chat",
      ...copy,
      icon: MessageCircle,
      routeThruSelena: true,
      intent: 'sell' as const,
    };
  }

  // Default for stories, tips, etc.
  return {
    link: "/v2/guides",
    textEn: "Explore More Resources",
    textEs: "Explorar Más Recursos",
    subtextEn: "Continue learning at your own pace",
    subtextEs: "Continúe aprendiendo a su propio ritmo",
    icon: BookOpen,
    routeThruSelena: false,
    intent: 'explore' as const,
  };
};

const GuideCTABlock = ({ category }: GuideCTABlockProps) => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const config = getCTAConfig(category);

  // Extract guideId from current URL for context passing
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const guideMatch = currentPath.match(/^\/v2\/guides\/(.+)$/);
  const currentGuideId = guideMatch?.[1];

  const handleClick = () => {
    if (config.routeThruSelena) {
      logCTAClick({
        cta_name: CTA_NAMES.SELENA_ROUTE_CALL,
        destination: 'selena_chat',
        page_path: currentPath,
        intent: config.intent,
      });
      openChat({
        source: 'guide_handoff',
        guideId: currentGuideId,
        guideCategory: category,
        intent: config.intent,
      });
    }
  };

  return (
    <section className="bg-cc-navy py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-white mb-3">
            {t("Ready for Your Next Step?", "¿Listo para Su Próximo Paso?")}
          </h2>
          <p className="text-white/70 text-base mb-8">
            {t(
              "No pressure. Just support when you're ready.",
              "Sin presión. Solo apoyo cuando esté listo."
            )}
          </p>
          
          {config.routeThruSelena ? (
            <Button 
              size="lg" 
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-10 py-6 text-base sm:text-lg shadow-gold max-w-full"
              onClick={handleClick}
            >
              <config.icon className="w-5 h-5 flex-shrink-0 mr-2 sm:mr-3" />
              <span className="text-center">{t(config.textEn, config.textEs)}</span>
            </Button>
          ) : (
            <Button 
              asChild 
              size="lg" 
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-10 py-6 text-base sm:text-lg shadow-gold max-w-full"
            >
              <Link to={config.link} className="inline-flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                <config.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-center">{t(config.textEn, config.textEs)}</span>
              </Link>
            </Button>
          )}
          
          <p className="text-white/50 text-sm mt-4">
            {t(config.subtextEn, config.subtextEs)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default GuideCTABlock;