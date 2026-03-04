import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import ReadinessSnapshot from "@/components/v2/ReadinessSnapshot";
import { updateSessionContext, setFieldIfEmpty, getSessionContext } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Answer {
  questionIndex: number;
  answerIndex: number | null;
}

interface SellerReadinessCheckProps {
  onScoreRevealed?: (data: { readiness_score: number; primary_priority: string }) => void;
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

function calculateSellerReadinessData(answers: Answer[]) {
  let score = 0;
  let primaryPriority = "general";

  // Q0: Motivation / situation clarity (max 25)
  const q0 = answers.find((a) => a.questionIndex === 0)?.answerIndex;
  score += q0 != null ? ([25, 20, 10, 5][q0] ?? 0) : 0;

  // Q1: Timeline urgency (max 25)
  const q1 = answers.find((a) => a.questionIndex === 1)?.answerIndex;
  score += q1 != null ? ([25, 20, 10, 5][q1] ?? 0) : 0;

  // Q2: Property condition awareness (max 25)
  const q2 = answers.find((a) => a.questionIndex === 2)?.answerIndex;
  score += q2 != null ? ([25, 20, 10, 5][q2] ?? 0) : 0;

  // Q3: Priority → determines primary_priority (max 25)
  const q3 = answers.find((a) => a.questionIndex === 3)?.answerIndex;
  if (q3 != null) {
    primaryPriority = ["speed", "maximize_value", "simplicity", "flexibility"][q3] ?? "general";
    score += 25; // has a clear priority
  }

  return { readiness_score: Math.min(score, 100), primary_priority: primaryPriority };
}

// ─── Questions Data ──────────────────────────────────────────────────────────

function useSellerQuestions() {
  const { t } = useLanguage();

  return [
    {
      question: t("What's driving your decision to sell?", "¿Qué motiva tu decisión de vender?"),
      options: [
        { en: "I've already decided — I'm ready to move forward", es: "Ya decidí — estoy listo/a para avanzar" },
        { en: "Life change (relocation, divorce, inheritance)", es: "Cambio de vida (reubicación, divorcio, herencia)" },
        { en: "Testing the waters — curious about my options", es: "Explorando opciones — quiero saber qué puedo hacer" },
        { en: "Financial pressure — I need to act soon", es: "Presión financiera — necesito actuar pronto" },
      ],
    },
    {
      question: t("What's your ideal timeline to sell?", "¿Cuál es tu plazo ideal para vender?"),
      options: [
        { en: "As soon as possible (1–2 weeks)", es: "Lo antes posible (1–2 semanas)" },
        { en: "Within the next 30 days", es: "Dentro de los próximos 30 días" },
        { en: "In the next 2–3 months", es: "En los próximos 2–3 meses" },
        { en: "No rush — I'm exploring", es: "Sin prisa — estoy explorando" },
      ],
    },
    {
      question: t("How would you describe your property's condition?", "¿Cómo describirías la condición de tu propiedad?"),
      options: [
        { en: "Move-in ready — no work needed", es: "Lista para mudarse — no necesita trabajo" },
        { en: "Mostly good — minor cosmetic updates", es: "Mayormente bien — actualizaciones cosméticas menores" },
        { en: "Needs some repairs before listing", es: "Necesita algunas reparaciones antes de publicarse" },
        { en: "Significant work needed", es: "Necesita trabajo significativo" },
      ],
    },
    {
      question: t("What matters most to you in this sale?", "¿Qué es lo más importante para ti en esta venta?"),
      options: [
        { en: "Speed — I want this done fast", es: "Velocidad — quiero que sea rápido" },
        { en: "Getting the highest possible price", es: "Obtener el precio más alto posible" },
        { en: "Simplicity — minimal hassle", es: "Simplicidad — mínimas complicaciones" },
        { en: "Flexibility — I want to keep my options open", es: "Flexibilidad — quiero mantener mis opciones abiertas" },
      ],
    },
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

const SellerReadinessCheck = ({ onScoreRevealed }: SellerReadinessCheckProps) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const questions = useSellerQuestions();

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
        tool_id: "seller_readiness",
        page_path: "/v2/seller-readiness",
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
      tool_id: "seller_readiness",
      page_path: "/v2/seller-readiness",
      step_reached: currentStep,
      questions_answered: answers.filter((a) => a.answerIndex != null).length,
    });
    navigate("/v2/guides");
  };

  // ─── Completion Side-Effects (fires exactly once) ────────────────────────

  useEffect(() => {
    if (currentStep !== 5) return;
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    const { readiness_score, primary_priority } = calculateSellerReadinessData(answers);

    // Session persistence
    setFieldIfEmpty("intent", "sell");
    const ctx = getSessionContext();
    updateSessionContext({
      readiness_score,
      primary_priority,
      tool_used: 'seller_readiness',
      last_tool_completed: 'seller_readiness',
      tools_completed: [...new Set([...(ctx?.tools_completed ?? []), 'seller_readiness'])],
    });

    // Analytics
    logEvent("quiz_complete", {
      quiz_id: "seller_readiness",
      readiness_score,
      primary_priority,
    });
    logEvent("tool_completed", {
      tool_id: "seller_readiness",
      page_path: "/v2/seller-readiness",
      intent: "sell",
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
    <div className="min-h-[420px] flex flex-col mb-6 sm:mb-8">
      {/* Progress bar — visible during questions */}
      {currentStep >= 1 && currentStep <= 4 && (
        <div className="mb-8">
          <Progress
            value={progressValue}
            className="h-2 bg-cc-sand-dark [&>div]:bg-cc-gold"
          />
          <p className="text-xs text-cc-slate text-center mt-2">
            {t("Question", "Pregunta")} {currentStep} {t("of", "de")} 4
          </p>
        </div>
      )}

      {/* ── Step 0: Selena Context Card ── */}
      {currentStep === 0 && (
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-cc-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-cc-gold" />
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-4">
            {t(
              "How Ready Are You to Sell?",
              "¿Qué Tan Listo/a Estás para Vender?"
            )}
          </h3>
          <p className="text-cc-charcoal mb-2 max-w-md mx-auto">
            {t(
              "4 quick taps — no typing needed",
              "4 toques rápidos — sin escribir"
            )}
          </p>
          <p className="text-sm text-cc-slate mb-8">
            {t("~1 min · Tap only · No wrong answers", "~1 min · Solo toques · Sin respuestas incorrectas")}
          </p>
          <Button
            onClick={handleStart}
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-8 shadow-gold text-sm sm:text-base min-h-[44px] active:scale-[0.98] transition-all"
          >
            {t("Let's Go", "Empecemos")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* ── Steps 1–4: Questions ── */}
      {currentStep >= 1 && currentStep <= 4 && currentQuestion && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="text-cc-slate hover:text-cc-navy transition-colors flex items-center gap-1 text-sm min-h-[44px] active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("Back", "Atrás")}
            </button>
            <button
              onClick={handleFinishLater}
              className="text-xs text-cc-slate hover:text-cc-navy transition-colors underline underline-offset-2 min-h-[44px] active:scale-[0.98]"
            >
              {t("I'll finish later", "Termino después")}
            </button>
          </div>

          <h3 className="font-serif text-xl md:text-2xl font-bold text-cc-navy mb-6 text-center leading-snug">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3 max-w-lg mx-auto">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                disabled={isTransitioning}
                onClick={() => handleAnswer(index)}
                className={`w-full py-5 px-6 min-h-[60px] text-left rounded-xl border-2 transition-all active:scale-[0.98] text-base ${
                  selectedAnswer?.answerIndex === index
                    ? "border-cc-gold bg-cc-gold/10"
                    : "border-cc-sand-dark hover:border-cc-gold/50 bg-white"
                } disabled:opacity-60`}
              >
                <span className="text-cc-charcoal">
                  {language === "en" ? option.en : option.es}
                </span>
              </button>
            ))}
          </div>

          {/* Skip link */}
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              disabled={isTransitioning}
              className="text-xs text-cc-slate hover:text-cc-navy transition-colors underline underline-offset-2 disabled:opacity-60 min-h-[44px] active:scale-[0.98]"
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
              <p className="text-cc-charcoal">
                {t(
                  "Thanks — we're putting your answers together.",
                  "Gracias — estamos organizando tus respuestas."
                )}
              </p>
            </div>
          ) : (
            <ReadinessSnapshot
              readiness_score={scoreData.readiness_score}
              primary_priority={scoreData.primary_priority}
              intent="sell"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SellerReadinessCheck;
