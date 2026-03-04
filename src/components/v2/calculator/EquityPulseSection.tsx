/**
 * EquityPulseSection — "Saved Utility" hook for the calculator.
 * Converts a one-time calculation into a monitoring relationship.
 * Saves scenario to session snapshot and displays confirmation.
 */

import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Bookmark, Share2, TrendingUp, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";

interface EquityPulseSectionProps {
  estimatedValue: number;
  mortgageBalance?: number;
  recommendation: string;
}

const EquityPulseSection = ({ estimatedValue, mortgageBalance, recommendation }: EquityPulseSectionProps) => {
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveScenario = useCallback(async () => {
    setIsSaving(true);

    try {
      // Enrich session context with save intent + full results
      updateSessionContext({
        equity_pulse_saved: true,
        equity_pulse_value: estimatedValue,
        equity_pulse_recommendation: recommendation,
        mortgage_balance: mortgageBalance ?? 0,
      });

      // Direct upsert to saved_scenarios via edge function
      const { supabase } = await import('@/integrations/supabase/client');
      const leadId = localStorage.getItem('selena_lead_id');

      await supabase.functions.invoke('upsert-session-snapshot', {
        body: {
          session_id: (await import('@/lib/analytics/selenaSession')).getOrCreateSessionId(),
          intent: 'cash',
          calculator_data: {
            estimated_value: estimatedValue,
            mortgage_balance: mortgageBalance ?? 0,
          },
          context_json: {
            equity_pulse_saved: true,
            equity_pulse_value: estimatedValue,
            equity_pulse_recommendation: recommendation,
          },
          ...(leadId ? { lead_id: leadId } : {}),
        },
      });

      logEvent('equity_pulse_saved', {
        estimated_value: estimatedValue,
        recommendation,
      });

      // Brief delay for UX feedback
      await new Promise((r) => setTimeout(r, 1200));

      setSaved(true);
      toast({
        title: t("Analysis Saved!", "¡Análisis Guardado!"),
        description: t(
          "Selena will notify you of market changes affecting your net proceeds.",
          "Selena te notificará de cambios en el mercado que afecten tus ganancias netas."
        ),
      });
    } catch {
      toast({
        variant: "destructive",
        title: t("Could not save", "No se pudo guardar"),
        description: t("Please try again.", "Inténtalo de nuevo."),
      });
    } finally {
      setIsSaving(false);
    }
  }, [estimatedValue, mortgageBalance, recommendation, t]);

  const handleShare = useCallback(() => {
    const shareText = t(
      `I just ran a cash vs. listing comparison for a $${estimatedValue.toLocaleString()} home in Tucson. Check it out!`,
      `Acabo de comparar oferta en efectivo vs. venta tradicional para una casa de $${estimatedValue.toLocaleString()} en Tucson. ¡Míralo!`
    );

    if (navigator.share) {
      navigator.share({
        title: t("My Tucson Home Analysis", "Mi Análisis de Casa en Tucson"),
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      toast({
        title: t("Link copied!", "¡Enlace copiado!"),
        description: t("Share it with anyone.", "Compártelo con quien quieras."),
      });
    }

    logEvent('equity_pulse_shared', { estimated_value: estimatedValue });
  }, [estimatedValue, t]);

  return (
    <div className="mt-6 rounded-xl border-2 border-dashed border-cc-gold/40 bg-cc-sand/50 p-5">
      <AnimatePresence mode="wait">
        {!saved ? (
          <motion.div
            key="save-prompt"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-cc-gold/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-cc-gold" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-cc-navy">
                  {t("Monitor Your Equity Growth", "Monitorea el Crecimiento de Tu Patrimonio")}
                </h4>
                <p className="text-sm text-cc-charcoal mt-1">
                  {t(
                    "Tucson market values shift frequently. Save this scenario to receive monthly \"Equity Pulse\" updates based on these exact calculations.",
                    "Los valores del mercado de Tucson cambian frecuentemente. Guarda este escenario para recibir actualizaciones mensuales de \"Equity Pulse\" basadas en estos cálculos exactos."
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveScenario}
                disabled={isSaving}
                className="flex-1 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {isSaving
                  ? t("Saving…", "Guardando…")
                  : t("Save My Calculation", "Guardar Mi Cálculo")}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="rounded-full border-cc-sand-dark text-cc-charcoal hover:border-cc-gold"
              >
                <Share2 className="w-4 h-4 mr-1" />
                {t("Share", "Compartir")}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="save-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-cc-gold/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-cc-gold" />
            </div>
            <h4 className="font-serif text-lg font-bold text-cc-navy">
              {t("Scenario Locked!", "¡Escenario Guardado!")}
            </h4>
            <p className="text-sm text-cc-charcoal max-w-xs mx-auto">
              {t(
                "Selena is now monitoring active market data in your area for changes.",
                "Selena ahora monitorea datos de mercado activos en tu área para cambios."
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EquityPulseSection;
