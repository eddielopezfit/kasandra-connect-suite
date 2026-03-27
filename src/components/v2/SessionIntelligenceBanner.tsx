import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { getSessionContext } from "@/lib/analytics/selenaSession";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SessionIntelligenceBanner = () => {
  const { t } = useLanguage();
  const progress = useJourneyProgress();
  const { openChat } = useSelenaChat();
  const ctx = getSessionContext();

  if (progress.journeyDepth === 'new') return null;

  const { message, actions, isReturning } = getBannerContent(progress, ctx, t);
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-cc-navy/[0.04] border-b border-cc-sand-dark/20"
      >
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-cc-charcoal/80">
              {isReturning ? (
                <RefreshCw className="w-3.5 h-3.5 text-cc-gold shrink-0" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-cc-gold shrink-0" />
              )}
              <span>{message}</span>
            </div>
            {actions && actions.length > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {actions.map((action, i) => (
                  action.type === 'link' ? (
                    <Link
                      key={i}
                      to={action.destination}
                      className="text-xs font-semibold text-cc-gold hover:text-cc-gold-dark flex items-center gap-1 whitespace-nowrap transition-colors"
                    >
                      {action.label}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <button
                      key={i}
                      onClick={() => openChat({ source: 'intelligence_banner' })}
                      className="text-xs font-semibold text-cc-gold hover:text-cc-gold-dark flex items-center gap-1 whitespace-nowrap transition-colors"
                    >
                      {action.label}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
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
): { message: string | null; actions: BannerAction[] | null; isReturning: boolean } {
  const { intent, toolCount, guideCount, journeyDepth, hasExploredNeighborhood, confidenceLevel, isReturningUser, estimatedValue } = progress;

  // Returning user — welcome back with context
  if (isReturningUser && ctx?.restored_from_snapshot) {
    const intentLabel = intent ? {
      buy: t("buying", "compra"),
      sell: t("selling", "venta"),
      cash: t("cash offers", "ofertas en efectivo"),
      investor: t("investing", "inversión"),
      explore: t("exploring", "explorando"),
      dual: t("buying & selling", "compra y venta"),
    }[intent] : null;

    const contextParts: string[] = [];
    if (intentLabel) contextParts.push(intentLabel);
    if (estimatedValue) contextParts.push(`~$${Math.round(estimatedValue / 1000)}K`);

    const contextStr = contextParts.length > 0 ? ` — ${contextParts.join(', ')}` : '';

    return {
      message: t(
        `Welcome back${contextStr}. Ready to continue where you left off?`,
        `Bienvenido/a de vuelta${contextStr}. ¿Listo/a para continuar donde te quedaste?`
      ),
      actions: [
        { type: 'link', label: t("Continue where you left off", "Continúa donde te quedaste"), destination: intent === 'sell' ? '/seller-decision' : intent === 'buy' ? '/buyer-readiness' : '/neighborhoods' },
        { type: 'link', label: t("See how areas compare", "Mira cómo se comparan las áreas"), destination: '/neighborhoods/compare' },
        { type: 'link', label: t("Plan your next step with Kasandra", "Planifica tu siguiente paso con Kasandra"), destination: '/book' },
      ],
      isReturning: true,
    };
  }

  // High confidence — nudge toward commitment
  if (confidenceLevel === 'high') {
    return {
      message: t(
        "You've done thorough research. Ready to talk strategy?",
        "Has investigado a fondo. ¿Lista/o para hablar de estrategia?"
      ),
      actions: [
        { type: 'link', label: t("Plan your next step with Kasandra", "Planifica tu siguiente paso con Kasandra"), destination: '/book' },
        { type: 'chat', label: t("Let Selena guide you", "Deja que Selena te guíe"), destination: 'selena' },
      ],
      isReturning: false,
    };
  }

  // Neighborhood explorer
  if (hasExploredNeighborhood && toolCount === 0) {
    return {
      message: t(
        "You're exploring neighborhoods. Want to compare areas side by side?",
        "Estás explorando vecindarios. ¿Quieres comparar áreas lado a lado?"
      ),
      actions: [
        { type: 'link', label: t("See how areas compare", "Mira cómo se comparan las áreas"), destination: '/neighborhoods/compare' },
        { type: 'chat', label: t("Get guided help from Selena", "Recibe orientación de Selena"), destination: 'selena' },
      ],
      isReturning: false,
    };
  }

  // Multiple tools completed
  if (toolCount >= 2) {
    return {
      message: t(
        `You've completed ${toolCount} tools. Your picture is getting clearer.`,
        `Has completado ${toolCount} herramientas. Tu panorama se aclara.`
      ),
      actions: [
        { type: 'chat', label: t("Ask Selena what's next", "Pregúntale a Selena qué sigue"), destination: 'selena' },
        { type: 'link', label: t("Talk to Kasandra", "Hablar con Kasandra"), destination: '/book' },
      ],
      isReturning: false,
    };
  }

  // Guide reader
  if (guideCount >= 3) {
    return {
      message: t(
        `You've read ${guideCount} guides — ready to put that knowledge to work?`,
        `Has leído ${guideCount} guías — ¿lista/o para aplicar ese conocimiento?`
      ),
      actions: [
        intent === 'buy'
          ? { type: 'link', label: t("Check readiness", "Verifica preparación"), destination: '/buyer-readiness' }
          : intent === 'sell'
          ? { type: 'link', label: t("Find your path", "Encuentra tu camino"), destination: '/seller-decision' }
          : { type: 'chat', label: t("Ask Selena", "Pregúntale a Selena"), destination: 'selena' },
      ],
      isReturning: false,
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
      actions: [{ type: 'chat', label: t("Need help? Ask Selena", "¿Necesitas ayuda? Pregúntale a Selena"), destination: 'selena' }],
      isReturning: false,
    };
  }

  // Exploring with some activity
  if (journeyDepth === 'exploring') {
    return {
      message: t(
        "Based on your activity, we're tailoring your experience.",
        "Basado en tu actividad, estamos personalizando tu experiencia."
      ),
      actions: null,
      isReturning: false,
    };
  }

  return { message: null, actions: null, isReturning: false };
}

export default SessionIntelligenceBanner;
