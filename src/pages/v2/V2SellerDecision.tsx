import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import QuizFunnelLayout from "@/components/v2/QuizFunnelLayout";
import { Progress } from "@/components/ui/progress";
import { StepSituation, StepPropertySnapshot, StepCondition } from "@/components/v2/seller-decision";
import type { Situation, Timeline, GoalPriority } from "@/components/v2/seller-decision/StepSituation";
import type { PropertySnapshotData } from "@/components/v2/seller-decision/StepPropertySnapshot";
import type { ConditionTier } from "@/components/v2/seller-decision/conditionInsights";
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { Clock, ArrowLeft } from "lucide-react";

const TOTAL_STEPS = 7;

interface WizardState {
  situation?: Situation;
  timeline?: Timeline;
  goalPriority?: GoalPriority;
  property?: PropertySnapshotData;
  condition?: ConditionTier;
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

  const goTo = useCallback((nextStep: number) => {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleStep1 = useCallback((data: { situation: Situation; timeline: Timeline; goalPriority: GoalPriority }) => {
    setWizardData(prev => ({ ...prev, ...data }));
    updateSessionContext({
      intent: 'sell',
      situation: data.situation as any,
      timeline: data.timeline === 'soon' ? 'asap' : data.timeline === 'considering' ? '30_days' : 'exploring',
      seller_goal_priority: data.goalPriority,
      seller_decision_step: 1,
    });
    goTo(2);
  }, [goTo]);

  const handleStep2 = useCallback((data: PropertySnapshotData) => {
    setWizardData(prev => ({ ...prev, property: data }));
    updateSessionContext({ seller_decision_step: 2 });
    goTo(3);
  }, [goTo]);

  const handleStep3 = useCallback((condition: ConditionTier) => {
    setWizardData(prev => ({ ...prev, condition }));
    updateSessionContext({
      property_condition_raw: condition,
      seller_decision_step: 3,
    });
    goTo(4);
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

        {/* Step renderer */}
        {step === 1 && (
          <StepSituation
            initialData={wizardData}
            onNext={handleStep1}
          />
        )}
        {step === 2 && (
          <StepPropertySnapshot
            initialData={wizardData.property}
            onNext={handleStep2}
            onBack={() => goTo(1)}
          />
        )}
        {step === 3 && (
          <StepCondition
            initialCondition={wizardData.condition}
            onNext={handleStep3}
            onBack={() => goTo(2)}
          />
        )}

        {/* Placeholder for Steps 4–7: calm "coming soon" — not an error */}
        {step >= 4 && step <= TOTAL_STEPS && (
          <div className="text-center py-16 space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-cc-gold/10 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-cc-gold" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-cc-navy">
                {t("We're building this for you", "Estamos construyendo esto para usted")}
              </h2>
              <p className="text-cc-text-muted text-sm max-w-md mx-auto">
                {t(
                  "Your answers have been saved. The remaining steps — neighborhood insights, your personalized comparison, and your Decision Receipt — are coming very soon.",
                  "Sus respuestas han sido guardadas. Los pasos restantes — información del vecindario, su comparación personalizada, y su Recibo de Decisión — llegarán muy pronto."
                )}
              </p>
            </div>
            <button
              onClick={() => goTo(3)}
              className="inline-flex items-center gap-1.5 text-sm text-cc-navy hover:text-cc-navy-dark transition-colors underline underline-offset-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t("Back to your last step", "Volver a su último paso")}
            </button>
          </div>
        )}
      </div>
    </QuizFunnelLayout>
  );
};

export default V2SellerDecision;
