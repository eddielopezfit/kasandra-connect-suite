/**
 * TucsonAlphaCalculator - Main orchestrator for the net-to-seller calculator
 * Multi-step form: Intro → Inputs → Results → Next Steps
 */

import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { logEvent } from "@/lib/analytics/logEvent";
import { trackJourneyAction } from "@/lib/guides/personalization";
import { updateSessionContext, setFieldIfEmpty, getSessionContext } from "@/lib/analytics/selenaSession";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calculator, Sparkles } from "lucide-react";

import CashOfferProgressBar, { type CalculatorStage } from "./CashOfferProgressBar";
import CalculatorInputs from "./CalculatorInputs";
import CalculatorResults from "./CalculatorResults";
import CalculatorNextSteps from "./CalculatorNextSteps";
import EquityPulseSection from "./EquityPulseSection";

import {
  calculateNetToSellerComparison,
  type CalculatorInputs as InputsType,
  type CalculatorResults as ResultsType,
  type Motivation,
  type Timeline,
} from "@/lib/calculator/netToSellerAlgorithm";

const TucsonAlphaCalculator = () => {
  const { t } = useLanguage();
  const { openChat, leadId, setCalculatorResult } = useSelenaChat();

  // State machine: 0 = intro, 1 = inputs, 2 = results, 3 = next steps
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(0);
  
  // Form inputs
  const [estimatedValue, setEstimatedValue] = useState(350000);
  const [motivation, setMotivation] = useState<Motivation>('uncertain');
  const [timeline, setTimeline] = useState<Timeline>('flexible');
  
  // Results
  const [results, setResults] = useState<ResultsType | null>(null);

  // Map step to progress stage
  const getProgressStage = (): CalculatorStage => {
    switch (currentStep) {
      case 0: return 0; // Exploring
      case 1: return 1; // Calculating
      case 2: return 2; // Comparing
      case 3: return 3; // Deciding
      default: return 0;
    }
  };

  // Handle calculation
  const handleCalculate = useCallback(() => {
    const inputs: InputsType = {
      estimatedValue,
      motivation,
      timeline,
    };

    const calculationResults = calculateNetToSellerComparison(inputs);
    setResults(calculationResults);
    setCurrentStep(2);

    // Log analytics
    logEvent('calculator_complete', {
      estimated_value: estimatedValue,
      motivation,
      timeline,
      recommendation: calculationResults.recommendation,
    });

    // Emit tool_completed event
    logEvent('tool_completed', {
      tool_id: 'tucson_alpha_calculator',
      page_path: '/v2/cash-offer-options',
      recommendation: calculationResults.recommendation,
    });

    // Track journey action
    trackJourneyAction('calculator');

    // Set Selena awareness (Task 4)
    setCalculatorResult(calculationResults.recommendation);

    // Enrich SessionContext with decision-grade fields for Selena
    setFieldIfEmpty('intent', 'cash');
    const ctx = getSessionContext();
    const runId = crypto.randomUUID();
    updateSessionContext({
      tool_used: 'tucson_alpha_calculator',
      last_tool_completed: 'tucson_alpha_calculator',
      tools_completed: [...new Set([...(ctx?.tools_completed ?? []), 'tucson_alpha_calculator'])],
      last_tool_result: calculationResults.recommendation,
      estimated_value: estimatedValue,
      calculator_difference: Math.abs(
        calculationResults.traditional.netProceeds - calculationResults.cash.netProceeds
      ),
      calculator_advantage: calculationResults.recommendation === 'cash' ? 'cash'
        : calculationResults.recommendation === 'traditional' ? 'traditional'
        : 'consult',
      calculator_motivation: motivation,
      calculator_run_id: runId,
    });
    // P1.1: Persist snapshot after calculator completion
    import('@/lib/analytics/sessionSnapshot').then(({ saveSnapshot }) => saveSnapshot()).catch(() => {});

  }, [estimatedValue, motivation, timeline, setCalculatorResult]);

  // Handle going to next steps
  const handleViewNextSteps = useCallback(() => {
    setCurrentStep(3);
    logEvent('calculator_results_view', { step: 'next_steps' });
  }, []);

  // Handle asking Selena with entry context
  const handleAskSelena = useCallback(() => {
    logEvent('calculator_cta_click', { 
      cta: 'ask_selena',
      context: { estimatedValue, motivation, timeline },
    });
    
    // Pass calculator context for context-aware greeting
    openChat({
      source: 'calculator',
      calculatorAdvantage: results?.recommendation === 'traditional' ? 'traditional' : results?.recommendation === 'cash' ? 'cash' : 'consult',
      calculatorDifference: results?.costOfTime?.netDifference,
    });
  }, [openChat, estimatedValue, motivation, timeline, results]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as 0 | 1 | 2 | 3);
    }
  }, [currentStep]);

  // Handle start - emit tool_started
  const handleStart = useCallback(() => {
    setCurrentStep(1);
    logEvent('tool_started', { 
      tool_id: 'tucson_alpha_calculator',
      page_path: '/v2/cash-offer-options',
    });
    logEvent('calculator_open', { source: 'cash_offer_options' });
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-elevated border border-cc-sand-dark/30 overflow-hidden">
      {/* Header with Progress */}
      <div className="bg-cc-sand p-4 md:p-6 border-b border-cc-sand-dark/30">
        <div className="max-w-2xl mx-auto">
          <CashOfferProgressBar currentStage={getProgressStage()} />
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 0: Intro */}
          {currentStep === 0 && (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-cc-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calculator className="w-8 h-8 text-cc-gold" />
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-4">
                {t(
                  "See Your Real Options, Side by Side",
                  "Mira Tus Opciones Reales, Lado a Lado"
                )}
              </h3>
              <p className="text-cc-charcoal mb-6 max-w-md mx-auto">
                {t(
                  "This calculator shows you the estimated net proceeds for a cash offer versus a traditional listing—based on Tucson market data. No hype, just numbers.",
                  "Esta calculadora te muestra las ganancias netas estimadas para una oferta en efectivo versus una venta tradicional—basado en datos del mercado de Tucson. Sin exageraciones, solo números."
                )}
              </p>
              
              <div className="bg-cc-sand rounded-lg p-4 mb-8 max-w-sm mx-auto">
                <div className="flex items-center gap-3 text-left">
                  <Sparkles className="w-5 h-5 text-cc-gold flex-shrink-0" />
                  <p className="text-sm text-cc-charcoal">
                    {t(
                      "Takes about 2 minutes. Your info stays private.",
                      "Toma unos 2 minutos. Tu información es privada."
                    )}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleStart}
                className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 py-6 text-lg shadow-gold"
              >
                {t("Calculate My Options", "Calcular Mis Opciones")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 1: Inputs */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBack}
                  className="text-cc-slate hover:text-cc-navy transition-colors flex items-center gap-1 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("Back", "Atrás")}
                </button>
                <span className="text-sm text-cc-slate font-medium">
                  {t("Your Property Details", "Detalles de Tu Propiedad")}
                </span>
              </div>

              <CalculatorInputs
                estimatedValue={estimatedValue}
                motivation={motivation}
                timeline={timeline}
                onValueChange={setEstimatedValue}
                onMotivationChange={setMotivation}
                onTimelineChange={setTimeline}
                onCalculate={handleCalculate}
              />
            </div>
          )}

          {/* Step 2: Results */}
          {currentStep === 2 && results && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBack}
                  className="text-cc-slate hover:text-cc-navy transition-colors flex items-center gap-1 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("Adjust Values", "Ajustar Valores")}
                </button>
                <span className="text-sm text-cc-slate font-medium">
                  {t("Your Comparison", "Tu Comparación")}
                </span>
              </div>

              <CalculatorResults results={results} />

              {/* Equity Pulse — Saved Utility hook */}
              <EquityPulseSection
                estimatedValue={estimatedValue}
                recommendation={results.recommendation}
              />

              <div className="mt-6">
                <Button
                  onClick={handleViewNextSteps}
                  className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-6 text-lg shadow-gold"
                >
                  {t("See My Next Steps", "Ver Mis Próximos Pasos")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Next Steps */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBack}
                  className="text-cc-slate hover:text-cc-navy transition-colors flex items-center gap-1 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("Back to Results", "Volver a Resultados")}
                </button>
                <span className="text-sm text-cc-slate font-medium">
                  {t("Next Steps", "Próximos Pasos")}
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="font-serif text-xl md:text-2xl font-bold text-cc-navy mb-2">
                  {t(
                    "You've Got Options",
                    "Tienes Opciones"
                  )}
                </h3>
                <p className="text-cc-charcoal">
                  {t(
                    "There's no right or wrong answer—only what's right for you.",
                    "No hay respuesta correcta o incorrecta—solo lo que es correcto para ti."
                  )}
                </p>
              </div>

              <CalculatorNextSteps
                onAskSelena={handleAskSelena}
                showSaveResults={!!leadId}
                recommendation={results?.recommendation === 'cash' ? 'cash_advantage' : results?.recommendation === 'traditional' ? 'listing_advantage' : 'consult'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TucsonAlphaCalculator;
