import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { getSessionContext } from "@/lib/analytics/selenaSession";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Live micro-context banner that surfaces session intelligence
 * in a calm, non-intrusive strip below the hero.
 * Updates based on real-time session activity.
 */
const SessionIntelligenceBanner = () => {
  const { t } = useLanguage();
  const progress = useJourneyProgress();
  const { openChat } = useSelenaChat();
  const ctx = getSessionContext();

  // Don't show for brand-new visitors — nothing to reflect yet
  if (progress.journeyDepth === 'new') return null;

  const { message, action } = getBannerContent(progress, ctx, t);
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-cc-navy/[0.04] border-b border-cc-sand-dark/20"
      >
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-cc-charcoal/80">
            <Sparkles className="w-3.5 h-3.5 text-cc-gold shrink-0" />
            <span>{message}</span>
          </div>
          {action && (
            action.type === 'link' ? (
              <Link
                to={action.destination}
                className="text-xs font-semibold text-cc-gold hover:text-cc-gold-dark flex items-center gap-1 whitespace-nowrap transition-colors"
              >
                {action.label}
                <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <button
                onClick={() => openChat({ source: 'intelligence_banner' })}
                className="text-xs font-semibold text-cc-gold hover:text-cc-gold-dark flex items-center gap-1 whitespace-nowrap transition-colors"
              >
                {action.label}
                <ArrowRight className="w-3 h-3" />
              </button>
            )
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

interface BannerAction {
  type: 'link' | 'chat';
  label: string;
  destination: string;
}

function getBannerContent(
  progress: ReturnType<typeof useJourneyProgress>,
  ctx: ReturnType<typeof getSessionContext>,
  t: (en: string, es: string) => string,
): { message: string | null; action: BannerAction | null } {
  const { intent, toolCount, guideCount, journeyDepth, hasExploredNeighborhood, confidenceLevel } = progress;

  // High confidence — nudge toward commitment
  if (confidenceLevel === 'high') {
    return {
      message: t(
        "You've done thorough research. Ready to talk strategy?",
        "Has investigado a fondo. ¿Lista/o para hablar de estrategia?"
      ),
      action: { type: 'link', label: t("Book a call", "Agenda una llamada"), destination: '/book' },
    };
  }

  // Neighborhood explorer
  if (hasExploredNeighborhood && toolCount === 0) {
    return {
      message: t(
        "You're exploring neighborhoods. Want to compare areas side by side?",
        "Estás explorando vecindarios. ¿Quieres comparar áreas lado a lado?"
      ),
      action: { type: 'link', label: t("Compare areas", "Comparar áreas"), destination: '/neighborhoods/compare' },
    };
  }

  // Multiple tools completed
  if (toolCount >= 2) {
    return {
      message: t(
        `You've completed ${toolCount} tools. Your picture is getting clearer.`,
        `Has completado ${toolCount} herramientas. Tu panorama se aclara.`
      ),
      action: { type: 'chat', label: t("Ask Selena what's next", "Pregúntale a Selena qué sigue"), destination: 'selena' },
    };
  }

  // Guide reader
  if (guideCount >= 3) {
    return {
      message: t(
        `You've read ${guideCount} guides — ready to put that knowledge to work?`,
        `Has leído ${guideCount} guías — ¿lista/o para aplicar ese conocimiento?`
      ),
      action: intent === 'buy'
        ? { type: 'link', label: t("Check readiness", "Verifica preparación"), destination: '/buyer-readiness' }
        : intent === 'sell'
        ? { type: 'link', label: t("Find your path", "Encuentra tu camino"), destination: '/seller-decision' }
        : { type: 'chat', label: t("Ask Selena", "Pregúntale a Selena"), destination: 'selena' },
    };
  }

  // Intent detected — affirm it
  if (intent && intent !== 'explore') {
    const intentMessages: Record<string, string> = {
      buy: t("You're exploring the buying process.", "Estás explorando el proceso de compra."),
      sell: t("You're exploring your selling options.", "Estás explorando tus opciones de venta."),
      cash: t("You're looking at cash offer options.", "Estás viendo opciones de oferta en efectivo."),
      investor: t("You're exploring investment opportunities.", "Estás explorando oportunidades de inversión."),
      dual: t("You're considering buying and selling.", "Estás considerando comprar y vender."),
    };
    return {
      message: intentMessages[intent] || null,
      action: { type: 'chat', label: t("Need help? Ask Selena", "¿Necesitas ayuda? Pregúntale a Selena"), destination: 'selena' },
    };
  }

  // Exploring with some activity
  if (journeyDepth === 'exploring') {
    return {
      message: t(
        "Based on your activity, we're tailoring your experience.",
        "Basado en tu actividad, estamos personalizando tu experiencia."
      ),
      action: null,
    };
  }

  return { message: null, action: null };
}

export default SessionIntelligenceBanner;
