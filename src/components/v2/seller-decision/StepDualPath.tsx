import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Zap, TrendingUp, HelpCircle, CheckCircle, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateSessionId, updateSessionContext } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";
import type { Situation, Timeline, GoalPriority } from "./StepSituation";
import type { PropertySnapshotData } from "./StepPropertySnapshot";
import type { ConditionTier } from "./conditionInsights";
import type { NeighborhoodResult } from "./StepNeighborhood";

export type RecommendedPath = 'cash' | 'traditional' | 'consult';

interface StepDualPathProps {
  situation: Situation;
  timeline: Timeline;
  goalPriority: GoalPriority;
  property: PropertySnapshotData;
  condition: ConditionTier;
  neighborhood?: NeighborhoodResult | null;
  onNext: (result: { recommendedPath: RecommendedPath; receiptId: string | null }) => void;
  onBack: () => void;
}

/**
 * Deterministic recommendation scoring.
 * Returns hint-only path — never "You should do X."
 */
function computeRecommendation(
  timeline: Timeline,
  condition: ConditionTier,
  goalPriority: GoalPriority
): RecommendedPath {
  let cashScore = 0;
  let tradScore = 0;

  // Timeline signals
  if (timeline === 'soon') cashScore += 2;
  if (timeline === 'exploring') tradScore += 1;
  if (timeline === 'considering') tradScore += 1;

  // Condition signals
  if (condition === 'needs_work') cashScore += 2;
  if (condition === 'mostly_original') cashScore += 1;
  if (condition === 'updated') tradScore += 2;
  if (condition === 'like_new') tradScore += 2;

  // Goal priority signals
  if (goalPriority === 'speed' || goalPriority === 'least_stress' || goalPriority === 'privacy') cashScore += 2;
  if (goalPriority === 'price') tradScore += 2;
  if (goalPriority === 'not_sure') return 'consult';

  if (cashScore === tradScore) return 'consult';
  return cashScore > tradScore ? 'cash' : 'traditional';
}

const StepDualPath = ({
  situation,
  timeline,
  goalPriority,
  property,
  condition,
  neighborhood,
  onNext,
  onBack,
}: StepDualPathProps) => {
  const { language, t } = useLanguage();
  const { openChat } = useSelenaChat();
  const [saving, setSaving] = useState(false);

  const recommendedPath = computeRecommendation(timeline, condition, goalPriority);

  const hintCopy = (() => {
    switch (recommendedPath) {
      case 'cash':
        return t(
          "Many sellers in your situation start with the certainty path.",
          "Muchos vendedores en su situación comienzan con el camino de certeza."
        );
      case 'traditional':
        return t(
          "Many sellers in your situation start with the traditional listing path.",
          "Muchos vendedores en su situación comienzan con la venta tradicional."
        );
      case 'consult':
        return t(
          "Your situation has unique factors — a brief conversation would help clarify the best path.",
          "Su situación tiene factores únicos — una breve conversación ayudaría a clarificar el mejor camino."
        );
    }
  })();

  const handleContinue = useCallback(async () => {
    setSaving(true);

    const receiptData = {
      version: 1,
      flow: 'seller_decision',
      situation,
      timeline,
      goal_priority: goalPriority,
      property: {
        beds: property.beds,
        baths: property.baths,
        sqft: property.sqft,
        homeEra: property.homeEra,
        hasPool: property.hasPool,
        hasGarage: property.hasGarage,
        zip: property.zip || null,
      },
      condition: condition,
      property_condition_raw: condition,
      neighborhood: neighborhood ? {
        zip: neighborhood.zip,
        cached: neighborhood.cached,
        lifestyle_feel: neighborhood.profileEn?.lifestyle_feel || null,
        buyer_fit: neighborhood.profileEn?.buyer_fit || null,
      } : null,
      recommended_path: recommendedPath,
      language,
    };

    try {
      const sessionId = getOrCreateSessionId();

      const { data, error } = await supabase.functions.invoke('save-decision-receipt', {
        body: {
          session_id: sessionId,
          receipt_type: 'seller_decision',
          language,
          receipt_data: receiptData,
        },
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Failed to save receipt');

      const receiptId = data.receipt_id;

      updateSessionContext({
        seller_decision_step: 5,
        seller_decision_recommended_path: recommendedPath,
      });

      logEvent('decision_receipt_generated', {
        receipt_id: receiptId,
        step: 5,
        recommended_path: recommendedPath,
        has_neighborhood: !!neighborhood,
      });

      logEvent('seller_decision_step_completed', {
        step: 5,
        recommended_path: recommendedPath,
        receipt_saved: true,
      });

      onNext({ recommendedPath, receiptId });
    } catch (err) {
      console.error('[StepDualPath] Receipt save error:', err);
      // Non-blocking: proceed even if receipt save fails, using a placeholder ID
      logEvent('seller_decision_step_completed', { step: 5, recommended_path: recommendedPath, receipt_saved: false });
      onNext({ recommendedPath, receiptId: null });
    } finally {
      setSaving(false);
    }
  }, [situation, timeline, goalPriority, property, condition, neighborhood, recommendedPath, language, onNext]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-2">
          {t("Your Two Paths", "Sus Dos Caminos")}
        </h2>
        <p className="text-cc-text-muted text-sm">
          {t(
            "Compare your options side by side. There's no wrong choice.",
            "Compare sus opciones lado a lado. No hay una elección incorrecta."
          )}
        </p>
      </div>

      {/* Hint banner */}
      <div className="bg-cc-gold/10 border border-cc-gold/30 rounded-xl p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
        <p className="text-sm text-cc-navy font-medium">{hintCopy}</p>
      </div>

      {/* Two-card comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Cash / Certainty Path */}
        <div className={`rounded-2xl p-6 border-2 transition-colors ${
          recommendedPath === 'cash'
            ? 'border-cc-gold bg-cc-gold/5'
            : 'border-cc-sand-dark/30 bg-white'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-cc-gold" />
            <h3 className="font-serif text-lg font-bold text-cc-navy">
              {t("Certainty Path", "Camino de Certeza")}
            </h3>
          </div>
          <p className="text-xs text-cc-text-muted mb-4 uppercase tracking-wider font-semibold">
            {t("Commission-Free Cash Offer", "Oferta en Efectivo Sin Comisión")}
          </p>

          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-cc-navy">{t("Best if you value:", "Ideal si valora:")}</p>
            <ul className="space-y-2">
              {[
                t("Speed and certainty of closing", "Rapidez y certeza de cierre"),
                t("No showings, no repairs, no staging", "Sin visitas, sin reparaciones, sin preparación"),
                t("Privacy throughout the process", "Privacidad durante todo el proceso"),
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-cc-charcoal">
                  <CheckCircle className="w-4 h-4 text-cc-gold flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-cc-sand-dark/20 pt-4">
            <p className="text-xs font-semibold text-cc-navy uppercase tracking-wider mb-2">
              {t("Tradeoffs", "Compensaciones")}
            </p>
            <p className="text-xs text-cc-text-muted">
              {t(
                "Typically 10–15% below full market value in exchange for speed and certainty.",
                "Típicamente 10–15% debajo del valor de mercado completo a cambio de rapidez y certeza."
              )}
            </p>
          </div>
        </div>

        {/* Traditional / Maximize Path */}
        <div className={`rounded-2xl p-6 border-2 transition-colors ${
          recommendedPath === 'traditional'
            ? 'border-cc-gold bg-cc-gold/5'
            : 'border-cc-sand-dark/30 bg-white'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cc-navy" />
            <h3 className="font-serif text-lg font-bold text-cc-navy">
              {t("Maximize Value Path", "Camino para Maximizar Valor")}
            </h3>
          </div>
          <p className="text-xs text-cc-text-muted mb-4 uppercase tracking-wider font-semibold">
            {t("Traditional Listing with Full Support", "Venta Tradicional con Apoyo Completo")}
          </p>

          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-cc-navy">{t("Best if you value:", "Ideal si valora:")}</p>
            <ul className="space-y-2">
              {[
                t("Getting the highest possible price", "Obtener el precio más alto posible"),
                t("Full market exposure and competing offers", "Máxima exposición y ofertas competitivas"),
                t("Professional marketing and negotiation", "Marketing profesional y negociación"),
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-cc-charcoal">
                  <CheckCircle className="w-4 h-4 text-cc-navy flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-cc-sand-dark/20 pt-4">
            <p className="text-xs font-semibold text-cc-navy uppercase tracking-wider mb-2">
              {t("Tradeoffs", "Compensaciones")}
            </p>
            <p className="text-xs text-cc-text-muted">
              {t(
                "Takes 30–90 days. Requires showings, staging prep, and market timing.",
                "Toma 30–90 días. Requiere visitas, preparación y sincronización del mercado."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Consult bridge CTA */}
      {recommendedPath === 'consult' && (
        <div className="text-center">
          <button
            onClick={() => {
              logEvent('cta_click', { cta: 'consult_talk_to_selena', destination: 'selena_chat' });
              openChat({ source: 'seller_decision', intent: 'sell' });
            }}
            className="inline-flex items-center gap-2 text-sm text-cc-gold hover:text-cc-gold-dark underline underline-offset-2 font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {t("Talk to Selena for a calm recommendation", "Habla con Selena para una recomendación tranquila")}
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="text-cc-text-muted rounded-full">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("Back", "Atrás")}
        </Button>
        <Button
          onClick={handleContinue}
          disabled={saving}
          className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
        >
          {saving
            ? t("Saving your results…", "Guardando sus resultados…")
            : t("Continue", "Continuar")
          }
          {!saving && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
};

export default StepDualPath;
export { computeRecommendation };
