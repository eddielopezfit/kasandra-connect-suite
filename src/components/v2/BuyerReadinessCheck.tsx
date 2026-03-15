import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import ReadinessSnapshot from "@/components/v2/ReadinessSnapshot";
import { updateSessionContext, setFieldIfEmpty, getSessionContext, syncLeadScore } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Answer {
  questionIndex: number;
  answerIndex: number | null;
}

interface BuyerReadinessCheckProps {
  onScoreRevealed?: (data: { readiness_score: number; primary_priority: string }) => void;
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

function calculateReadinessData(answers: Answer[]) {
  let score = 0;
  let primaryPriority = "general";

  // Q0: Situation (max 30)
  const q0 = answers.find((a) => a.questionIndex === 0)?.answerIndex;
  score += q0 != null ? ([5, 10, 20, 30][q0] ?? 0) : 0;

  // Q1: Lender (max 30)
  const q1 = answers.find((a) => a.questionIndex === 1)?.answerIndex;
  score += q1 != null ? ([30, 15, 5, 0][q1] ?? 0) : 0;

  // Q2: Priority → determines primary_priority
  const q2 = answers.find((a) => a.questionIndex === 2)?.answerIndex;
  if (q2 != null) {
    primaryPriority = ["monthly_payment", "neighborhoods", "affordability", "timing"][q2] ?? "general";
    score += 20; // has a clear priority
  }

  // Q3: Comfort (max 20)
  const q3 = answers.find((a) => a.questionIndex === 3)?.answerIndex;
  score += q3 != null ? ([20, 15, 5, 0][q3] ?? 0) : 0;

  return { readiness_score: Math.min(score, 100), primary_priority: primaryPriority };
}

// ─── Questions Data ──────────────────────────────────────────────────────────

function useQuestions() {
  const { t } = useLanguage();

  return [
    {
      question: t("What best describes your current situation?", "¿Qué describe mejor tu situación actual?"),
      options: [
        { en: "Just exploring / gathering information", es: "Solo explorando / recopilando información" },
        { en: "Planning to buy in the next 6–12 months", es: "Planeando comprar en los próximos 6–12 meses" },
        { en: "Actively looking in the next 3 months", es: "Buscando activamente en los próximos 3 meses" },
        { en: "Already touring homes", es: "Ya estoy visitando casas" },
      ],
    },
    {
      question: t("Have you spoken with a lender yet?", "¿Ya has hablado con un prestamista?"),
      options: [
        { en: "Yes, I'm pre-approved", es: "Sí, estoy pre-aprobado/a" },
        { en: "I've talked to one, but not pre-approved", es: "He hablado con uno, pero no estoy pre-aprobado/a" },
        { en: "Not yet", es: "Todavía no" },
        { en: "I'm not sure where to start", es: "No sé por dónde empezar" },
      ],
    },
    {
      question: t("What matters most to you right now?", "¿Qué es lo más importante para ti ahora mismo?"),
      options: [
        { en: "Monthly payment clarity", es: "Claridad en el pago mensual" },
        { en: "Understanding neighborhoods", es: "Conocer los vecindarios" },
        { en: "Knowing what I can afford", es: "Saber cuánto puedo pagar" },
        { en: "Timing the market correctly", es: "Elegir el momento correcto del mercado" },
      ],
    },
    {
      question: t("How would you describe your comfort level with the process?", "¿Cómo describirías tu nivel de comodidad con el proceso?"),
      options: [
        { en: "I feel confident", es: "Me siento seguro/a" },
        { en: "Somewhat confident", es: "Algo seguro/a" },
        { en: "A little overwhelmed", es: "Un poco abrumado/a" },
        { en: "Very overwhelmed", es: "Muy abrumado/a" },
      ],
    },
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

const BuyerReadinessCheck = ({ onScoreRevealed }: BuyerReadinessCheckProps) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const questions = useQuestions();

  // State
  const [currentStep, setCurrentStep] = useState(0); // 0=intro, 1-4=questions, 5=completion
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scoreData, setScoreData] = useState<{ readiness_score: number; primary_priority: string } | null>(null);

  // Guards
  const hasLoggedToolStart = useRef(false);
  const hasCompletedRef = useRef(false);
  const hasFiredRef = useRef(false);
  const hasAbandonedRef = useRef(false);

  // Derived
  const currentQuestion = currentStep >= 1 && currentStep <= 4 ? questions[currentStep - 1] : null;
  const selectedAnswer = answers.find((a) => a.questionIndex === currentStep - 1);
  const progressValue = Math.min(100, Math.max(0, ((currentStep - 1) / 4) * 100));

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleStart = () => {
    if (!hasLoggedToolStart.current) {
      logEvent("tool_started", {
        tool_id: "buyer_readiness",
        page_path: "/buyer-readiness",
      });
      hasLoggedToolStart.current = true;
    }
    setCurrentStep(1);
  };

  const handleAnswer = (answerIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const questionIndex = currentStep - 1;
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionIndex !== questionIndex);
      return [...filtered, { questionIndex, answerIndex }];
    });

    setTimeout(() => {
      setIsTransitioning(false);
      setCurrentStep((s) => (s < 4 ? s + 1 : 5));
    }, 300);
  };

  const handleSkip = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const questionIndex = currentStep - 1;
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionIndex !== questionIndex);
      return [...filtered, { questionIndex, answerIndex: null }];
    });

    setTimeout(() => {
      setIsTransitioning(false);
      setCurrentStep((s) => (s < 4 ? s + 1 : 5));
    }, 300);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
    } else if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFinishLater = () => {
    if (hasAbandonedRef.current) return;
    hasAbandonedRef.current = true;

    logEvent("tool_abandoned", {
      tool_id: "buyer_readiness",
      page_path: "/buyer-readiness",
      step_reached: currentStep,
      questions_answered: answers.filter((a) => a.answerIndex != null).length,
    });
    navigate("/guides");
  };

  // ─── Completion Side-Effects (fires exactly once) ────────────────────────

  useEffect(() => {
    if (currentStep !== 5) return;
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    const { readiness_score, primary_priority } = calculateReadinessData(answers);

    // Session persistence
    setFieldIfEmpty("intent", "buy");
    const ctx = getSessionContext();
    updateSessionContext({
      readiness_score,
      primary_priority,
      tool_used: 'buyer_readiness',
      last_tool_completed: 'buyer_readiness',
      tools_completed: [...new Set([...(ctx?.tools_completed ?? []), 'buyer_readiness'])],
    });
    // Fire-and-forget lead score sync
    const storedLeadId = localStorage.getItem('selena_lead_id');
    if (storedLeadId) void syncLeadScore(storedLeadId, readiness_score);

    // Analytics
    logEvent("quiz_complete", {
      quiz_id: "buyer_readiness",
      readiness_score,
      primary_priority,
    });
    logEvent("tool_completed", {
      tool_id: "buyer_readiness",
      page_path: "/buyer-readiness",
      intent: "buy",
      readiness_score,
      primary_priority,
    });

    // Delayed reveal
    const timer = setTimeout(() => {
      setScoreData({ readiness_score, primary_priority });
      setIsComplete(true);
      if (!hasFiredRef.current) {
        hasFiredRef.current = true;
        onScoreRevealed?.({ readiness_score, primary_priority });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentStep, answers, onScoreRevealed]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[420px] flex flex-col justify-center">
      {/* Progress bar — visible during questions */}
      {currentStep >= 1 && currentStep <= 4 && (
        <div className="mb-6 sm:mb-8">
          <Progress
            value={progressValue}
            className="h-2 bg-cc-sand-dark [&>div]:bg-cc-gold"
          />
          <p className="text-xs text-cc-slate text-center mt-2">
            {currentStep} {t("of", "de")} 4
          </p>
        </div>
      )}

      {/* ── Step 0: Selena Context Card ── */}
      {currentStep === 0 && (
        <div className="text-center animate-fade-in px-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-cc-gold/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-cc-gold" />
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-3">
            {t(
              "Where Are You in Your Home Buying Journey?",
              "¿Dónde Estás en Tu Camino de Compra de Casa?"
            )}
          </h3>
          <p className="text-cc-charcoal mb-4 max-w-md mx-auto leading-relaxed">
            {t(
              "4 quick taps — no typing needed. I'll help you figure out your best next step.",
              "4 toques rápidos — sin escribir. Te ayudaré a descubrir tu mejor próximo paso."
            )}
          </p>
          <p className="text-sm text-cc-slate mb-6">
            {t("~1 min · Tap only · No wrong answers", "~1 min · Solo toques · Sin respuestas incorrectas")}
          </p>
          <Button
            onClick={handleStart}
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 py-6 shadow-gold text-base min-h-[52px]"
          >
            {t("Let's Go", "Comencemos")}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}

      {/* ── Steps 1–4: Questions ── */}
      {currentStep >= 1 && currentStep <= 4 && currentQuestion && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={handleBack}
              className="text-cc-slate hover:text-cc-navy transition-colors flex items-center gap-1.5 text-sm min-h-[44px] min-w-[44px]"
              aria-label={t("Go back", "Regresar")}
            >
              <ArrowLeft className="w-4 h-4" />
              {t("Back", "Atrás")}
            </button>
            <button
              onClick={handleFinishLater}
              className="text-xs text-cc-slate hover:text-cc-navy transition-colors underline underline-offset-4 min-h-[44px] flex items-center"
            >
              {t("Finish later", "Terminar después")}
            </button>
          </div>

          <h3 className="font-serif text-xl md:text-2xl font-bold text-cc-navy mb-5 sm:mb-6 text-center leading-snug">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3 max-w-lg mx-auto">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                disabled={isTransitioning}
                onClick={() => handleAnswer(index)}
                className={`w-full py-4 sm:py-5 px-5 sm:px-6 min-h-[60px] text-left rounded-xl border-2 transition-all text-base leading-snug active:scale-[0.98] ${
                  selectedAnswer?.answerIndex === index
                    ? "border-cc-gold bg-cc-gold/10 shadow-sm"
                    : "border-cc-sand-dark hover:border-cc-gold/50 hover:shadow-sm bg-white"
                } disabled:opacity-60`}
              >
                <span className="text-cc-charcoal">
                  {language === "en" ? option.en : option.es}
                </span>
              </button>
            ))}
          </div>

          {/* Skip link */}
          <div className="text-center mt-5">
            <button
              onClick={handleSkip}
              disabled={isTransitioning}
              className="text-xs text-cc-slate hover:text-cc-navy transition-colors underline underline-offset-4 disabled:opacity-60 min-h-[44px] inline-flex items-center"
            >
              {t("Skip this question", "Saltar esta pregunta")}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 5: Completion ── */}
      {currentStep === 5 && (
        <div className="animate-fade-in py-10 sm:py-12">
          {!isComplete || !scoreData ? (
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-6">
                <div className="w-3 h-3 bg-cc-gold rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-cc-gold rounded-full animate-pulse [animation-delay:200ms]" />
                <div className="w-3 h-3 bg-cc-gold rounded-full animate-pulse [animation-delay:400ms]" />
              </div>
              <p className="text-cc-charcoal text-sm sm:text-base">
                {t(
                  "Putting your results together…",
                  "Preparando tus resultados…"
                )}
              </p>
            </div>
          ) : (
            <ReadinessSnapshot
              readiness_score={scoreData.readiness_score}
              primary_priority={scoreData.primary_priority}
              intent="buy"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BuyerReadinessCheck;
