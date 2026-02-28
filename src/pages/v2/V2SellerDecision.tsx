import { useState, useCallback, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import QuizFunnelLayout from "@/components/v2/QuizFunnelLayout";
import { Progress } from "@/components/ui/progress";
import { StepSituation, StepPropertySnapshot, StepCondition, StepNeighborhood, StepDualPath, StepContact } from "@/components/v2/seller-decision";
import type { Situation, Timeline, GoalPriority } from "@/components/v2/seller-decision/StepSituation";
import type { PropertySnapshotData } from "@/components/v2/seller-decision/StepPropertySnapshot";
import type { ConditionTier } from "@/components/v2/seller-decision/conditionInsights";
import type { NeighborhoodResult } from "@/components/v2/seller-decision/StepNeighborhood";
import type { RecommendedPath } from "@/components/v2/seller-decision/StepDualPath";
import type { ContactResult } from "@/components/v2/seller-decision/StepContact";
import { updateSessionContext, setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { logEvent } from "@/lib/analytics/logEvent";
import { Clock, ArrowLeft } from "lucide-react";

const TOTAL_STEPS = 7;

interface WizardState {
  situation?: Situation;
  timeline?: Timeline;
  goalPriority?: GoalPriority;
  property?: PropertySnapshotData;
  condition?: ConditionTier;
  neighborhood?: NeighborhoodResult | null;
  recommendedPath?: RecommendedPath;
  receiptId?: string | null;
  contact?: ContactResult;
}

const V2SellerDecision = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardState>({});

  useDocumentHead({
    titleEn: "Discover Your Best Selling Path | Tucson Home Seller Decision Tool",
    titleEs: "Descubra Su Mejor Camino de Venta | Herramienta de Decisión para Vendedores en Tucson",
    descriptionEn: "Answer a few questions about your property and situation to get a personalized selling recommendation — cash offer, traditional listing, or a calm next step.",
    descriptionEs: "Responda algunas preguntas sobre su propiedad y situación para obtener una recomendación personalizada de venta.",
  });

  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  // Step viewed logging — measures drop-off inside each step
  useEffect(() => {
    logEvent('seller_decision_step_viewed', { step });
    if (step === 1) {
      logEvent('seller_decision_started', {});
    }
  }, [step]);

  const goTo = useCallback((nextStep: number) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleStep1 = useCallback((data: { situation: Situation; timeline: Timeline; goalPriority: GoalPriority }) => {
    setWizardData(prev => ({ ...prev, ...data }));
    setFieldIfEmpty('intent', 'sell');
    updateSessionContext({
      situation: data.situation as any,
      timeline: data.timeline === 'soon' ? 'asap' : data.timeline === 'considering' ? '30_days' : 'exploring',
      seller_goal_priority: data.goalPriority,
      seller_decision_step: 1,
    });
    logEvent('seller_decision_step_completed', { step: 1, situation: data.situation, timeline: data.timeline, goal_priority: data.goalPriority });
    goTo(2);
  }, [goTo]);

  const handleStep2 = useCallback((data: PropertySnapshotData) => {
    setWizardData(prev => ({ ...prev, property: data }));
    updateSessionContext({ seller_decision_step: 2 });
    logEvent('seller_decision_step_completed', { step: 2, beds: data.beds, baths: data.baths, zip: data.zip || null });
    goTo(3);
  }, [goTo]);

  const handleStep3 = useCallback((condition: ConditionTier) => {
    setWizardData(prev => ({ ...prev, condition }));
    updateSessionContext({
      property_condition_raw: condition,
      seller_decision_step: 3,
    });
    logEvent('seller_decision_step_completed', { step: 3, condition });
    goTo(4);
  }, [goTo]);

  const handleStep4 = useCallback((result: NeighborhoodResult | null) => {
    setWizardData(prev => ({ ...prev, neighborhood: result }));
    updateSessionContext({ seller_decision_step: 4 });
    logEvent('seller_decision_step_completed', { step: 4, has_neighborhood: !!result, zip: result?.zip || null });
    goTo(5);
  }, [goTo]);

  const handleStep5 = useCallback((result: { recommendedPath: RecommendedPath; receiptId: string | null }) => {
    setWizardData(prev => ({ ...prev, recommendedPath: result.recommendedPath, receiptId: result.receiptId }));
    updateSessionContext({ seller_decision_step: 5, seller_decision_recommended_path: result.recommendedPath });
    logEvent('seller_decision_step_completed', { step: 5, recommended_path: result.recommendedPath, receipt_id: result.receiptId });
    goTo(6);
  }, [goTo]);

  const handleStep6 = useCallback((result: ContactResult) => {
    setWizardData(prev => ({ ...prev, contact: result }));
    updateSessionContext({ seller_decision_step: 6 });
    logEvent('seller_decision_step_completed', { step: 6, lead_id: result.leadId, cta_variant: result.variant });
    goTo(7);
  }, [goTo]);

  return (
    <QuizFunnelLayout showSelena={step >= TOTAL_STEPS}>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-cc-navy uppercase tracking-wider">
              {t(`Step ${step} of ${TOTAL_STEPS}`, `Paso ${step} de ${TOTAL_STEPS}`)}
            </span>
            <span className="text-xs text-cc-text-muted">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-cc-sand" />
        </div>

        {/* Steps 1-3 */}
        {step === 1 && (
          <StepSituation initialData={wizardData} onNext={handleStep1} />
        )}
        {step === 2 && (
          <StepPropertySnapshot initialData={wizardData.property} onNext={handleStep2} onBack={() => goTo(1)} />
        )}
        {step === 3 && (
          <StepCondition initialCondition={wizardData.condition} onNext={handleStep3} onBack={() => goTo(2)} />
        )}

        {/* Step 4: Neighborhood (optional) */}
        {step === 4 && (
          <StepNeighborhood
            externalZip={wizardData.property?.zip}
            initialResult={wizardData.neighborhood || undefined}
            onNext={handleStep4}
            onBack={() => goTo(3)}
          />
        )}

        {/* Step 5: Dual Path + Receipt */}
        {step === 5 && wizardData.situation && wizardData.timeline && wizardData.goalPriority && wizardData.property && wizardData.condition && (
          <StepDualPath
            situation={wizardData.situation}
            timeline={wizardData.timeline}
            goalPriority={wizardData.goalPriority}
            property={wizardData.property}
            condition={wizardData.condition}
            neighborhood={wizardData.neighborhood}
            onNext={handleStep5}
            onBack={() => goTo(4)}
          />
        )}

        {/* Step 6: Contact */}
        {step === 6 && wizardData.recommendedPath && (
          <StepContact
            receiptId={wizardData.receiptId ?? null}
            recommendedPath={wizardData.recommendedPath}
            situation={wizardData.situation}
            timeline={wizardData.timeline}
            condition={wizardData.condition}
            onNext={handleStep6}
            onBack={() => goTo(5)}
          />
        )}

        {/* Placeholder for Step 7 (Receipt view) */}
        {step === 7 && (
          <div className="text-center py-16 space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-cc-gold/10 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-cc-gold" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-cc-navy">
                {t("Your Decision Receipt is saved", "Su Recibo de Decisión está guardado")}
              </h2>
              <p className="text-cc-text-muted text-sm max-w-md mx-auto">
                {t(
                  "Your personalized Decision Receipt view is coming very soon. Your data is safe.",
                  "La vista de su Recibo de Decisión personalizado llegará muy pronto. Sus datos están seguros."
                )}
              </p>
              {wizardData.recommendedPath && (
                <p className="text-cc-navy font-medium text-sm mt-4">
                  {t("Recommended path: ", "Camino recomendado: ")}
                  <span className="text-cc-gold font-bold capitalize">{wizardData.recommendedPath}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => goTo(6)}
              className="inline-flex items-center gap-1.5 text-sm text-cc-navy hover:text-cc-navy-dark transition-colors underline underline-offset-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t("Back", "Atrás")}
            </button>
          </div>
        )}
      </div>
    </QuizFunnelLayout>
  );
};

export default V2SellerDecision;
