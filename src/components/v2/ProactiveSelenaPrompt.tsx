import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ProactiveSelenaPrompt — Behavior-triggered contextual Selena nudge.
 * Appears after milestones (neighborhood views, tool usage, scroll hesitation).
 * Calm, observant, never intrusive. Dismissible and session-aware.
 */

interface TriggerConfig {
  condition: boolean;
  messageEn: string;
  messageEs: string;
  prefillEn: string;
  prefillEs: string;
  source: string;
}

const DISMISS_KEY = 'selena_proactive_dismissed';
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes between prompts

const ProactiveSelenaPrompt = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const progress = useJourneyProgress();
  const [visible, setVisible] = useState(false);
  const [activeMessage, setActiveMessage] = useState<{ message: string; prefill: string; source: string } | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
  }, []);

  useEffect(() => {
    // Check cooldown
    try {
      const lastDismissed = localStorage.getItem(DISMISS_KEY);
      if (lastDismissed && Date.now() - parseInt(lastDismissed) < COOLDOWN_MS) return;
    } catch {}

    // Don't show for brand new users
    if (progress.journeyDepth === 'new') return;

    const triggers: TriggerConfig[] = [
      {
        condition: progress.hasExploredNeighborhood && progress.toolCount === 0 && progress.guideCount >= 1,
        messageEn: "I see you're comparing areas — want help narrowing it down?",
        messageEs: "Veo que estás comparando áreas — ¿quieres ayuda para reducir opciones?",
        prefillEn: "Help me narrow down which area fits best",
        prefillEs: "Ayúdame a decidir qué área me conviene más",
        source: "proactive_neighborhood",
      },
      {
        condition: progress.toolCount >= 1 && progress.confidenceLevel === 'medium' && !progress.hasBooked,
        messageEn: "You've used our tools — ready to see what your next step looks like?",
        messageEs: "Has usado nuestras herramientas — ¿lista/o para ver tu próximo paso?",
        prefillEn: "What should my next step be?",
        prefillEs: "¿Cuál debería ser mi próximo paso?",
        source: "proactive_tool_followup",
      },
      {
        condition: progress.guideCount >= 3 && progress.toolCount === 0,
        messageEn: "You've been doing great research. Want to turn that into an action plan?",
        messageEs: "Has investigado muy bien. ¿Quieres convertir eso en un plan de acción?",
        prefillEn: "Help me create an action plan based on what I've read",
        prefillEs: "Ayúdame a crear un plan de acción basado en lo que he leído",
        source: "proactive_guide_reader",
      },
      {
        condition: progress.intent === 'sell' && !progress.hasSellerDecision && progress.journeyDepth === 'exploring',
        messageEn: "Thinking about selling? I can help you understand your options in 2 minutes.",
        messageEs: "¿Pensando en vender? Puedo ayudarte a entender tus opciones en 2 minutos.",
        prefillEn: "What are my selling options?",
        prefillEs: "¿Cuáles son mis opciones para vender?",
        source: "proactive_seller_nudge",
      },
      {
        condition: progress.intent === 'buy' && !progress.hasReadinessScore && progress.journeyDepth === 'exploring',
        messageEn: "Based on your budget, I can show you areas that fit. Want to explore?",
        messageEs: "Según tu presupuesto, puedo mostrarte áreas que encajan. ¿Quieres explorar?",
        prefillEn: "Show me areas that fit my budget",
        prefillEs: "Muéstrame áreas que se ajusten a mi presupuesto",
        source: "proactive_buyer_budget",
      },
    ];

    // Fire the first matching trigger after a delay
    const matched = triggers.find(t => t.condition);
    if (!matched) return;

    const timer = setTimeout(() => {
      setActiveMessage({
        message: t(matched.messageEn, matched.messageEs),
        prefill: t(matched.prefillEn, matched.prefillEs),
        source: matched.source,
      });
      setVisible(true);
    }, 8000); // 8s delay — calm, not immediate

    return () => clearTimeout(timer);
  }, [progress, t]);

  const handleEngage = () => {
    if (!activeMessage) return;
    openChat({
      source: activeMessage.source,
      prefillMessage: activeMessage.prefill,
    });
    dismiss();
  };

  return (
    <AnimatePresence>
      {visible && activeMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-24 right-4 sm:right-6 z-50 max-w-xs"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-cc-sand-dark/30 p-4 relative">
            <button
              onClick={dismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-cc-sand/50 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5 text-cc-charcoal/40" />
            </button>

            <div className="flex items-start gap-3 pr-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cc-gold/20 to-cc-gold/5 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-cc-gold" />
              </div>
              <div>
                <p className="text-sm text-cc-charcoal leading-relaxed">
                  {activeMessage.message}
                </p>
                <button
                  onClick={handleEngage}
                  className="mt-3 text-xs font-semibold text-cc-gold hover:text-cc-gold-dark transition-colors inline-flex items-center gap-1"
                >
                  {t("Chat with Selena", "Conversa con Selena")}
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-[10px] text-cc-charcoal/30 mt-2 text-right">
              {t("Powered by Selena AI", "Impulsado por Selena AI")}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProactiveSelenaPrompt;
