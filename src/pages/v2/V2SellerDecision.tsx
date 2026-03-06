import { useState, useCallback, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSearchParams } from "react-router-dom";
import QuizFunnelLayout from "@/components/v2/QuizFunnelLayout";
import { Progress } from "@/components/ui/progress";
import { StepSituation, StepPropertySnapshot, StepCondition, StepDualPath, StepContact } from "@/components/v2/seller-decision";
import StepReceiptView from "@/components/v2/seller-decision/StepReceiptView";
import type { Situation, Timeline, GoalPriority } from "@/components/v2/seller-decision/StepSituation";
import type { PropertySnapshotData } from "@/components/v2/seller-decision/StepPropertySnapshot";
import type { ConditionTier } from "@/components/v2/seller-decision/conditionInsights";
import type { RecommendedPath } from "@/components/v2/seller-decision/StepDualPath";
import type { ContactResult } from "@/components/v2/seller-decision/StepContact";
import { updateSessionContext, setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { logEvent } from "@/lib/analytics/logEvent";

// ─── Ad-funnel pre-population helpers ────────────────────────────────────────
const AD_SITUATION_MAP: Record<string, Situation> = {
  inherited: "inherited",
  relocating: "relocating",
  downsizing: "downsizing",
  other: "exploring",
};

const AD_TIMELINE_MAP: Record<string, Timeline> = {
  asap: "soon",
  soon: "soon",
  flexible: "considering",
  "no-rush": "exploring",
};

function seedWizardFromParams(params: URLSearchParams): WizardState {
  const rawSituation = params.get("situation") ?? "";
  const rawTimeline = params.get("timeline") ?? "";
  const seed: WizardState = {};
  if (AD_SITUATION_MAP[rawSituation]) seed.situation = AD_SITUATION_MAP[rawSituation];
  if (AD_TIMELINE_MAP[rawTimeline]) seed.timeline = AD_TIMELINE_MAP[rawTimeline];
  return seed;
}
// ─────────────────────────────────────────────────────────────────────────────

// 7 → 5 steps:
//   Removed: StepNeighborhood (ZIP already in PropertySnapshot; neighborhood data
//            enriches DualPath contextually but doesn't need its own step)
//   Merged:  StepContact + StepReceiptView → step 5 shows contact form,
//            then reveals receipt inline after submission (no extra navigation)
const TOTAL_STEPS = 5;

interface WizardState {
  situation?: Situation;
  timeline?: Timeline;
  goalPriority?: GoalPriority;
  property?: PropertySnapshotData;
  condition?: ConditionTier;
  recommendedPath?: RecommendedPath;
  receiptId?: string | null;
  contact?: ContactResult;
}

const V2SellerDecision = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [showReceipt, setShowReceipt] = useState(false);
  const [wizardData, setWizardData] = useState<WizardState>(() => seedWizardFromParams(searchParams));

  useDocumentHead({
    titleEn: "Discover Your Best Selling Path | Tucson Home Seller Decision Tool",
    titleEs: "Descubra Su Mejor Camino de Venta | Herramienta de Decisión para Vendedores en Tucson",
    descriptionEn: "Answer a few questions about your property and situation to get a personalized selling recommendation — cash offer, traditional listing, or a calm next step.",
    descriptionEs: "Responda algunas preguntas sobre su propiedad y situación para obtener una recomendación personalizada de venta.",
  });

  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  useEffect(() => {
    logEvent('seller_decision_step_viewed', { step });
    if (step === 1) {
      const source = searchParams.get("from") ?? "direct";
      logEvent('seller_decision_started', { source, preseeded: !!searchParams.get("situation") });
    }
  }, [step]);

  const goTo = useCallback((nextStep: number) => {
    setStep(nextStep);
    setShowReceipt(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Step 1: Situation + timeline + goal
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

  // Step 2: Property details (ZIP here feeds downstream context)
  const handleStep2 = useCallback((data: PropertySnapshotData) => {
    setWizardData(prev => ({ ...prev, property: data }));
    updateSessionContext({ seller_decision_step: 2, ...(data.zip && { last_neighborhood_zip: data.zip }) });
    logEvent('seller_decision_step_completed', { step: 2, beds: data.beds, baths: data.baths, zip: data.zip || null });
    goTo(3);
  }, [goTo]);

  // Step 3: Condition
  const handleStep3 = useCallback((condition: ConditionTier) => {
    setWizardData(prev => ({ ...prev, condition }));
    updateSessionContext({ property_condition_raw: condition, seller_decision_step: 3 });
    logEvent('seller_decision_step_completed', { step: 3, condition });
    goTo(4);
  }, [goTo]);

  // Step 4: Dual path recommendation (was step 5)
  const handleStep4 = useCallback((result: { recommendedPath: RecommendedPath; receiptId: string | null }) => {
    setWizardData(prev => ({ ...prev, recommendedPath: result.recommendedPath, receiptId: result.receiptId }));
    updateSessionContext({ seller_decision_step: 4, seller_decision_recommended_path: result.recommendedPath });
    logEvent('seller_decision_step_completed', { step: 4, recommended_path: result.recommendedPath, receipt_id: result.receiptId });
    goTo(5);
  }, [goTo]);

  // Step 5: Contact capture → reveals receipt inline (no extra step)
  const handleStep5 = useCallback((result: ContactResult) => {
    setWizardData(prev => ({ ...prev, contact: result }));
    updateSessionContext({ seller_decision_step: 5 });
    logEvent('seller_decision_step_completed', { step: 5, lead_id: result.leadId, cta_variant: result.variant });
    setShowReceipt(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <QuizFunnelLayout showSelena={step >= TOTAL_STEPS && showReceipt}>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Progress bar — hide once receipt is showing */}
        {!showReceipt && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-cc-navy uppercase tracking-wider">
                {t(`Step ${step} of ${TOTAL_STEPS}`, `Paso ${step} de ${TOTAL_STEPS}`)}
              </span>
              <span className="text-xs text-cc-text-muted">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-cc-sand" />
          </div>
        )}

        {step === 1 && (
          <StepSituation initialData={wizardData} onNext={handleStep1} />
        )}
        {step === 2 && (
          <StepPropertySnapshot initialData={wizardData.property} onNext={handleStep2} onBack={() => goTo(1)} />
        )}
        {step === 3 && (
          <StepCondition initialCondition={wizardData.condition} onNext={handleStep3} onBack={() => goTo(2)} />
        )}
        {step === 4 && wizardData.situation && wizardData.timeline && wizardData.goalPriority && wizardData.property && wizardData.condition && (
          <StepDualPath
            situation={wizardData.situation}
            timeline={wizardData.timeline}
            goalPriority={wizardData.goalPriority}
            property={wizardData.property}
            condition={wizardData.condition}
            neighborhood={null}
            onNext={handleStep4}
            onBack={() => goTo(3)}
          />
        )}
        {step === 5 && !showReceipt && wizardData.recommendedPath && (
          <StepContact
            receiptId={wizardData.receiptId ?? null}
            recommendedPath={wizardData.recommendedPath}
            situation={wizardData.situation}
            timeline={wizardData.timeline}
            goalPriority={wizardData.goalPriority}
            property={wizardData.property}
            condition={wizardData.condition}
            onNext={handleStep5}
            onBack={() => goTo(4)}
          />
        )}
        {step === 5 && showReceipt && (
          <StepReceiptView
            onBackToComparison={() => goTo(4)}
            onRestart={() => { setWizardData({}); goTo(1); }}
          />
        )}
      </div>
    </QuizFunnelLayout>
  );
};

export default V2SellerDecision;
