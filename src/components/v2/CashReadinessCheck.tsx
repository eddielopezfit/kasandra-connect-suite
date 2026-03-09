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

interface CashReadinessCheckProps {
  onScoreRevealed?: (data: { readiness_score: number; primary_priority: string }) => void;
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

function calculateCashReadinessData(answers: Answer[]) {
  let score = 0;
  let primaryPriority = "general";

  // Q0: Timeline urgency (max 25)
  // ASAP=25, 30d=20, 2-3mo=10, no rush=5
  const q0 = answers.find((a) => a.questionIndex === 0)?.answerIndex;
  score += q0 != null ? ([25, 20, 10, 5][q0] ?? 0) : 0;

  // Q1: Property condition (max 25)
  // Significant work=25 (best cash fit), needs repairs=20, cosmetic=10, move-in=5
  const q1 = answers.find((a) => a.questionIndex === 1)?.answerIndex;
  score += q1 != null ? ([5, 10, 20, 25][q1] ?? 0) : 0;

  // Q2: Equity / mortgage situation (max 25)
  // Own free & clear=25, significant equity=20, some equity=10, unsure=5
  const q2 = answers.find((a) => a.questionIndex === 2)?.answerIndex;
  score += q2 != null ? ([25, 20, 10, 5][q2] ?? 0) : 0;

  // Q3: Flexibility priority → determines primary_priority (max 25)
  const q3 = answers.find((a) => a.questionIndex === 3)?.answerIndex;
  if (q3 != null) {
    primaryPriority = ["certainty", "speed", "no_repairs", "flexibility"][q3] ?? "general";
    score += 25; // has a clear priority
  }

  return { readiness_score: Math.min(score, 100), primary_priority: primaryPriority };
}

// ─── Questions Data ──────────────────────────────────────────────────────────

function useCashQuestions() {
  const { t } = useLanguage();

  return [
    {
      question: t(
        "How quickly do you need to close?",
        "¿Qué tan rápido necesitas cerrar?"
      ),
      options: [
        { en: "As soon as possible (1–2 weeks)", es: "Lo antes posible (1–2 semanas)" },
        { en: "Within 30 days", es: "Dentro de 30 días" },
        { en: "In the next 2–3 months", es: "En los próximos 2–3 meses" },
        { en: "No rush — exploring options", es: "Sin prisa — explorando opciones" },
      ],
    },
    {
      question: t(
        "What's the current condition of your property?",
        "¿Cuál es la condición actual de tu propiedad?"
      ),
      options: [
        { en: "Move-in ready — no work needed", es: "Lista para mudarse — sin trabajo necesario" },
        { en: "Minor cosmetic updates needed", es: "Necesita actualizaciones cosméticas menores" },
        { en: "Needs some repairs", es: "Necesita algunas reparaciones" },
        { en: "Significant work or deferred maintenance", es: "Trabajo significativo o mantenimiento diferido" },
      ],
    },
    {
      question: t(
        "What's your mortgage situation?",
        "¿Cuál es tu situación hipotecaria?"
      ),
      options: [
        { en: "I own it free and clear", es: "La poseo libre de deuda" },
        { en: "Significant equity built up", es: "Tengo bastante equidad acumulada" },
        { en: "Some equity — still paying mortgage", es: "Algo de equidad — aún pago hipoteca" },
        { en: "I'm not sure about my equity", es: "No estoy seguro/a de mi equidad" },
      ],
    },
    {
      question: t(
        "What matters most to you about a cash offer?",
        "¿Qué es lo más importante de una oferta en efectivo?"
      ),
      options: [
        { en: "Certainty — I want a guaranteed close", es: "Certeza — quiero un cierre garantizado" },
        { en: "Speed — I need this done fast", es: "Velocidad — necesito que sea rápido" },
        { en: "Selling as-is — no repairs or showings", es: "Vender como está — sin reparaciones ni visitas" },
        { en: "Flexibility — choose my move-out date", es: "Flexibilidad — elegir mi fecha de mudanza" },
      ],
    },
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

const CashReadinessCheck = ({ onScoreRevealed }: CashReadinessCheckProps) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const questions = useCashQuestions();

  // State
  const [currentStep, setCurrentStep] = useState(0);
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
        tool_id: "cash_readiness",
        page_path: "/cash-readiness",
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
      tool_id: "cash_readiness",
      page_path: "/cash-readiness",
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

    const { readiness_score, primary_priority } = calculateCashReadinessData(answers);

    // Session persistence
    setFieldIfEmpty("intent", "cash");
    const ctx = getSessionContext();
    updateSessionContext({
      readiness_score,
      primary_priority,
      tool_used: 'cash_readiness',
      last_tool_completed: 'cash_readiness',
      tools_completed: [...new Set([...(ctx?.tools_completed ?? []), 'cash_readiness'])],
    });

    // Analytics
    logEvent("quiz_complete", {
      quiz_id: "cash_readiness",
      readiness_score,
      primary_priority,
    });
    logEvent("tool_completed", {
      tool_id: "cash_readiness",
      page_path: "/v2/cash-readiness",
      intent: "cash",
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
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-3">
            {t(
              "Is a Cash Offer Right for You?",
              "¿Es una Oferta en Efectivo lo Correcto para Ti?"
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

      {/* ── Step 5: Completion → Snapshot ── */}
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
                  "Analyzing your cash offer fit…",
                  "Analizando tu perfil para oferta en efectivo…"
                )}
              </p>
            </div>
          ) : (
            <ReadinessSnapshot
              readiness_score={scoreData.readiness_score}
              primary_priority={scoreData.primary_priority}
              intent="cash"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CashReadinessCheck;
