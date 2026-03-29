import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { getSessionContext } from "@/lib/analytics/selenaSession";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { Sparkles, ArrowRight, RefreshCw, TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { logEvent } from "@/lib/analytics/logEvent";
import { useCallback } from "react";

// Page path → intent override (show relevant messaging on intent-specific pages)
const PAGE_INTENT_OVERRIDE: Record<string, string> = {
  '/sell': 'sell',
  '/seller-decision': 'sell',
  '/seller-readiness': 'sell',
  '/seller-timeline': 'sell',
  '/cash-offer-options': 'cash',
  '/cash-readiness': 'cash',
  '/buy': 'buy',
  '/buyer-readiness': 'buy',
  '/affordability-calculator': 'buy',
  '/bah-calculator': 'buy',
  '/buyer-closing-costs': 'buy',
  '/off-market': 'buy',
};

interface BannerAction {
  type: 'link' | 'chat';
  label: string;
  destination: string;
}

const SessionIntelligenceBanner = () => {
  const { t } = useLanguage();
  const progress = useJourneyProgress();
  const { openChat } = useSelenaChat();
  const ctx = getSessionContext();
  const { pathname } = useLocation();

  // Track CTA interactions for CRM feedback
  const trackBannerAction = useCallback((action: string, destination: string) => {
    logEvent('banner_cta_clicked', { action, destination, intent: progress.intent, depth: progress.journeyDepth });
  }, [progress.intent, progress.journeyDepth]);

  // Track banner impression + ignored CTA (fires on unmount or page change)
  if (progress.journeyDepth !== 'new') {
    logEvent('banner_impression', { intent: progress.intent, depth: progress.journeyDepth, page: pathname });
  }

  if (progress.journeyDepth === 'new') return null;

  // Override displayed intent based on current page
  const pageOverrideIntent = PAGE_INTENT_OVERRIDE[pathname];
  const displayIntent = pageOverrideIntent || progress.intent;

  const { message, actions, isReturning, momentum } = getBannerContent(progress, ctx, t, displayIntent, pathname);
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
              ) : momentum ? (
                <TrendingUp className="w-3.5 h-3.5 text-cc-gold shrink-0" />
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
                      onClick={() => trackBannerAction(action.label, action.destination)}
                      className="text-xs font-semibold text-cc-gold hover:text-cc-gold-dark flex items-center gap-1 whitespace-nowrap transition-colors"
                    >
                      {action.label}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <button
                      key={i}
                      onClick={() => {
                        trackBannerAction(action.label, 'selena');
                        openChat({ source: 'intelligence_banner' });
                      }}
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

function getBannerContent(
  progress: ReturnType<typeof useJourneyProgress>,
  ctx: ReturnType<typeof getSessionContext>,
  t: (en: string, es: string) => string,
  displayIntent: string | undefined,
  pathname: string,
): { message: string | null; actions: BannerAction[] | null; isReturning: boolean; momentum: boolean } {
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
      momentum: false,
    };
  }

  // High confidence — momentum signal + nudge toward commitment
  if (confidenceLevel === 'high') {
    return {
      message: t(
        "Most people at your stage book a strategy call next — you've earned it.",
        "La mayoría en tu etapa agenda una llamada de estrategia — te lo has ganado."
      ),
      actions: [
        { type: 'link', label: t("Plan your next step with Kasandra", "Planifica tu siguiente paso con Kasandra"), destination: '/book' },
        { type: 'chat', label: t("Let Selena guide you", "Deja que Selena te guíe"), destination: 'selena' },
      ],
      isReturning: false,
      momentum: true,
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
      momentum: false,
    };
  }

  // Multiple tools completed — momentum signal
  if (toolCount >= 2) {
    return {
      message: t(
        `You've completed ${toolCount} tools — clients with this level of clarity usually connect with Kasandra next.`,
        `Has completado ${toolCount} herramientas — clientes con esta claridad usualmente conectan con Kasandra.`
      ),
      actions: [
        { type: 'link', label: t("Plan your next step with Kasandra", "Planifica tu siguiente paso con Kasandra"), destination: '/book' },
        { type: 'chat', label: t("Let Selena walk you through it", "Deja que Selena te acompañe"), destination: 'selena' },
      ],
      isReturning: false,
      momentum: true,
    };
  }

  // Guide reader — momentum signal
  if (guideCount >= 3) {
    return {
      message: t(
        `You've read ${guideCount} guides — ready to put that knowledge to work?`,
        `Has leído ${guideCount} guías — ¿lista/o para aplicar ese conocimiento?`
      ),
      actions: [
        displayIntent === 'buy'
          ? { type: 'link', label: t("See where you stand as a buyer", "Mira dónde estás como comprador"), destination: '/buyer-readiness' }
          : displayIntent === 'sell'
          ? { type: 'link', label: t("Understand your options", "Comprende tus opciones"), destination: '/seller-decision' }
          : { type: 'chat', label: t("Get guided help from Selena", "Recibe orientación de Selena"), destination: 'selena' },
      ],
      isReturning: false,
      momentum: true,
    };
  }

  // Intent detected — page-aware affirmation
  if (displayIntent && displayIntent !== 'explore') {
    const intentMessages: Record<string, string> = {
      buy: t("You're exploring the buying process.", "Estás explorando el proceso de compra."),
      sell: t("You're exploring your selling options.", "Estás explorando tus opciones de venta."),
      cash: t("You're looking at cash offer options.", "Estás viendo opciones de oferta en efectivo."),
      investor: t("You're exploring investment opportunities.", "Estás explorando oportunidades de inversión."),
      dual: t("You're considering buying and selling.", "Estás considerando comprar y vender."),
    };
    return {
      message: intentMessages[displayIntent] || null,
      actions: [{ type: 'chat', label: t("Get guided help from Selena", "Recibe orientación de Selena"), destination: 'selena' }],
      isReturning: false,
      momentum: false,
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
      momentum: false,
    };
  }

  return { message: null, actions: null, isReturning: false, momentum: false };
}

export default SessionIntelligenceBanner;
