/**
 * TucsonAlphaCalculator - Main orchestrator for the net-to-seller calculator
 * Multi-step form: Intro → Inputs → Results → Next Steps
 */

import { useState, useCallback, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/analytics/logEvent";
import { trackJourneyAction } from "@/lib/guides/personalization";
import { updateSessionContext, setFieldIfEmpty, getSessionContext } from "@/lib/analytics/selenaSession";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calculator, Sparkles, TrendingUp } from "lucide-react";

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
  type MarketOverrides,
} from "@/lib/calculator/netToSellerAlgorithm";

const TucsonAlphaCalculator = () => {
  const { t } = useLanguage();
  const { openChat, leadId, setCalculatorResult } = useSelenaChat();

  // State machine: 0 = intro, 1 = inputs, 2 = results, 3 = next steps
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(0);
  
  // Form inputs
  const [estimatedValue, setEstimatedValue] = useState(350000);
  const [mortgageBalance, setMortgageBalance] = useState(0);
  const [motivation, setMotivation] = useState<Motivation>('uncertain');
  const [timeline, setTimeline] = useState<Timeline>('flexible');
  
  // Results
  const [results, setResults] = useState<ResultsType | null>(null);
  
  // Live market overrides from market_pulse_settings
  const [marketOverrides, setMarketOverrides] = useState<MarketOverrides | undefined>();
  const [marketSource, setMarketSource] = useState<'live' | 'fallback'>('fallback');
  const [lastVerifiedDate, setLastVerifiedDate] = useState<string | null>(null);

  useEffect(() => {
    supabase.functions.invoke('get-market-pulse').then(({ data, error }) => {
      if (!error && data) {
        setMarketOverrides({
          holdingCostPerDay: data.holding_cost_per_day ?? undefined,
          traditionalClosingDays: data.days_to_close ?? undefined,
          negotiationGap: data.negotiation_gap ?? undefined,
        });
        setMarketSource('live');
        setLastVerifiedDate(data.last_verified_date ?? data.updated_at ?? null);
      }
    });
  }, []);

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

    const calculationResults = calculateNetToSellerComparison(inputs, marketOverrides);
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
      page_path: '/cash-offer-options',
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

  }, [estimatedValue, motivation, timeline, setCalculatorResult, marketOverrides]);

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
      intent: 'sell',
      calculatorAdvantage: results?.recommendation === 'traditional' ? 'traditional' : results?.recommendation === 'cash' ? 'cash' : 'consult',
      calculatorDifference: results?.costOfTime?.netDifference,
      sellerCalcData: results ? {
        estimatedValue,
        mortgageBalance,
        cashNetProceeds: results.cash.netProceeds,
        traditionalNetProceeds: results.traditional.netProceeds,
        recommendation: results.recommendation,
        netDifference: Math.abs(results.traditional.netProceeds - results.cash.netProceeds),
        motivation,
        timeline,
      } : undefined,
    });
  }, [openChat, estimatedValue, mortgageBalance, motivation, timeline, results]);

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
      page_path: '/cash-offer-options',
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
                mortgageBalance={mortgageBalance}
                motivation={motivation}
                timeline={timeline}
                onValueChange={setEstimatedValue}
                onMortgageBalanceChange={setMortgageBalance}
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

              <CalculatorResults results={results} mortgageBalance={mortgageBalance} marketSource={marketSource} lastVerifiedDate={lastVerifiedDate} />

              {/* Equity Pulse — Saved Utility hook */}
              <EquityPulseSection
                estimatedValue={estimatedValue}
                mortgageBalance={mortgageBalance}
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

          {/* Step 3: Your Decision — personalized final stage */}
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
                  {t("Your Decision", "Tu Decisión")}
                </span>
              </div>

              {/* Personalized recommendation summary */}
              <div className="bg-cc-sand rounded-2xl p-6 mb-8 text-center">
                {results?.recommendation === 'cash' ? (
                  <>
                    <div className="w-12 h-12 bg-cc-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-cc-gold" />
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-cc-navy mb-2">
                      {t("A Cash Offer Could Work in Your Favor", "Una Oferta en Efectivo Podría Funcionar a Tu Favor")}
                    </h3>
                    <p className="text-cc-charcoal text-sm max-w-md mx-auto">
                      {t(
                        "Based on your numbers, the speed and certainty of a cash offer could net you more after time costs. Here's how to move forward.",
                        "Según tus números, la rapidez y certeza de una oferta en efectivo podría darte más después de los costos de tiempo. Así puedes avanzar."
                      )}
                    </p>
                  </>
                ) : results?.recommendation === 'traditional' ? (
                  <>
                    <div className="w-12 h-12 bg-cc-navy/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-6 h-6 text-cc-navy" />
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-cc-navy mb-2">
                      {t("A Traditional Listing Could Maximize Your Return", "Una Venta Tradicional Podría Maximizar Tu Retorno")}
                    </h3>
                    <p className="text-cc-charcoal text-sm max-w-md mx-auto">
                      {t(
                        "Based on your numbers, listing on the market with the right strategy could get you the best price. Here's how to get started.",
                        "Según tus números, vender en el mercado con la estrategia correcta podría darte el mejor precio. Así puedes comenzar."
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-cc-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calculator className="w-6 h-6 text-cc-gold" />
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-cc-navy mb-2">
                      {t("Your Situation Deserves a Closer Look", "Tu Situación Merece una Revisión Más Detallada")}
                    </h3>
                    <p className="text-cc-charcoal text-sm max-w-md mx-auto">
                      {t(
                        "The numbers are close—your best option depends on your timeline and priorities. A quick conversation can clarify the path forward.",
                        "Los números están parejos—tu mejor opción depende de tu cronograma y prioridades. Una conversación rápida puede aclarar el camino."
                      )}
                    </p>
                  </>
                )}
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
