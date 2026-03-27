/**
 * TucsonAlphaCalculator - Main orchestrator for the net-to-seller calculator
 * Multi-step form: Intro → Inputs → Results + CTAs
 */

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/analytics/logEvent";
import { trackJourneyAction } from "@/lib/guides/personalization";
import { updateSessionContext, setFieldIfEmpty, getSessionContext } from "@/lib/analytics/selenaSession";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Calculator, Sparkles, Calendar, MessageCircle } from "lucide-react";

import CashOfferProgressBar, { type CalculatorStage } from "./CashOfferProgressBar";
import CalculatorInputs from "./CalculatorInputs";
import CalculatorResults from "./CalculatorResults";

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
  const navigate = useNavigate();
  const { openChat, setCalculatorResult } = useSelenaChat();

  // State machine: 0 = intro, 1 = inputs, 2 = results
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0);
  
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
      case 0: return 0;
      case 1: return 1;
      case 2: return 2;
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

    logEvent('calculator_complete', {
      estimated_value: estimatedValue,
      motivation,
      timeline,
      recommendation: calculationResults.recommendation,
    });

    logEvent('tool_completed', {
      tool_id: 'tucson_alpha_calculator',
      page_path: '/cash-offer-options',
      recommendation: calculationResults.recommendation,
    });

    trackJourneyAction('calculator');
    setCalculatorResult(calculationResults.recommendation);

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
    import('@/lib/analytics/sessionSnapshot').then(({ saveSnapshot }) => saveSnapshot()).catch(() => {});

  }, [estimatedValue, motivation, timeline, setCalculatorResult, marketOverrides]);

  // Handle asking Selena with entry context
  const handleAskSelena = useCallback(() => {
    logCTAClick({
      cta_name: CTA_NAMES.TOOL_ASK_SELENA,
      destination: 'selena_chat',
      page_path: window.location.pathname,
      intent: 'cash',
    });
    logEvent('calculator_cta_click', { 
      cta: 'ask_selena',
      context: { estimatedValue, motivation, timeline },
    });
    
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

  const handleBookKasandra = useCallback(() => {
    logCTAClick({
      cta_name: CTA_NAMES.TOOL_BOOK_CONSULTATION,
      destination: '/book',
      page_path: window.location.pathname,
      intent: 'cash',
      recommendation: results?.recommendation,
    });
    navigate('/book?intent=cash&source=calculator');
  }, [navigate, results]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as 0 | 1 | 2);
    }
  }, [currentStep]);

  // Handle start
  const handleStart = useCallback(() => {
    setCurrentStep(1);
    logEvent('tool_started', { 
      tool_id: 'tucson_alpha_calculator',
      page_path: '/cash-offer-options',
    });
    logEvent('calculator_open', { source: 'cash_offer_options' });
  }, []);

  // Neutral recommendation copy
  const getRecommendationCopy = () => {
    if (!results) return { titleEn: '', titleEs: '', descEn: '', descEs: '' };
    if (results.recommendation === 'cash') {
      return {
        titleEn: "Based on your inputs, the cash path showed a speed advantage",
        titleEs: "Según tus datos, el camino en efectivo mostró una ventaja de rapidez",
        descEn: "The numbers reflect a scenario where closing quickly could reduce your carrying costs significantly.",
        descEs: "Los números reflejan un escenario donde cerrar rápido podría reducir significativamente tus costos de espera.",
      };
    }
    if (results.recommendation === 'traditional') {
      return {
        titleEn: "Based on your inputs, the traditional path showed a higher net",
        titleEs: "Según tus datos, la venta tradicional mostró un retorno neto mayor",
        descEn: "The numbers reflect a scenario where market exposure could yield a higher return, even after time costs.",
        descEs: "Los números reflejan un escenario donde la exposición al mercado podría generar un mayor retorno, aún después de costos de tiempo.",
      };
    }
    return {
      titleEn: "The numbers are close — a conversation can help you weigh what matters most",
      titleEs: "Los números están parejos — una conversación puede ayudarte a evaluar lo que más importa",
      descEn: "Your situation has factors that go beyond the calculator. Kasandra can walk through these with you.",
      descEs: "Tu situación tiene factores que van más allá de la calculadora. Kasandra puede revisarlos contigo.",
    };
  };

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

          {/* Step 2: Results + Terminal CTAs */}
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

              <CalculatorResults results={results} mortgageBalance={mortgageBalance} marketSource={marketSource} lastVerifiedDate={lastVerifiedDate} motivation={motivation} timeline={timeline} />

              {/* Neutral recommendation summary */}
              {(() => {
                const copy = getRecommendationCopy();
                return (
                  <div className="mt-8 bg-cc-sand rounded-2xl p-6 text-center">
                    <h3 className="font-serif text-lg md:text-xl font-bold text-cc-navy mb-2">
                      {t(copy.titleEn, copy.titleEs)}
                    </h3>
                    <p className="text-cc-charcoal text-sm max-w-md mx-auto">
                      {t(copy.descEn, copy.descEs)}
                    </p>
                  </div>
                );
              })()}

              {/* Terminal CTAs — 2 only */}
              <div className="mt-8 space-y-3">
                {/* Primary: Book with Kasandra */}
                <Button
                  onClick={handleBookKasandra}
                  className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-6 text-base shadow-gold group"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {t("Walk Through This with Kasandra", "Revisa Esto con Kasandra")}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                {/* Secondary: Ask Selena */}
                <button
                  onClick={handleAskSelena}
                  className="w-full p-4 text-center rounded-xl border-2 border-cc-gold/40 bg-white hover:border-cc-gold hover:bg-cc-gold/5 transition-all group"
                >
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5 text-cc-gold" />
                    <span className="font-semibold text-cc-navy text-sm">
                      {t("Have questions? Ask Selena", "¿Tienes preguntas? Pregúntale a Selena")}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TucsonAlphaCalculator;
