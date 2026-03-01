## Plan: Rewrite BuyerReadinessCheck.tsx as Tap-First Quiz

**Single file change:** `src/components/v2/BuyerReadinessCheck.tsx` — full rewrite

### Full replacement content

Replace the entire file with the following:

```tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { updateSessionContext, setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";

interface Answer {
  questionIndex: number;
  answerIndex: number | null;
}

interface BuyerReadinessCheckProps {
  onScoreRevealed?: (data: { readiness_score: number; primary_priority: string }) => void;
}

const BuyerReadinessCheck = ({ onScoreRevealed }: BuyerReadinessCheckProps = {}) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0); // 0 = selena card, 1-4 = questions, 5 = completion
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const hasLoggedToolStart = useRef(false);
  const hasCompletedRef = useRef(false);
  const hasFiredRef = useRef(false);

  const questions = [
    {
      question: t(
        "What best describes your current situation?",
        "¿Qué describe mejor tu situación actual?"
      ),
      options: [
        { en: "Just exploring / gathering information", es: "Solo explorando / recopilando información" },
        { en: "Planning to buy in the next 6–12 months", es: "Planeando comprar en los próximos 6–12 meses" },
        { en: "Actively looking in the next 3 months", es: "Buscando activamente en los próximos 3 meses" },
        { en: "Already touring homes", es: "Ya estoy visitando casas" },
      ],
    },
    {
      question: t(
        "Have you spoken with a lender yet?",
        "¿Ya has hablado con un prestamista?"
      ),
      options: [
        { en: "Yes, I'm pre-approved", es: "Sí, estoy pre-aprobado/a" },
        { en: "I've talked to one, but not pre-approved", es: "He hablado con uno, pero no estoy pre-aprobado/a" },
        { en: "Not yet", es: "Todavía no" },
        { en: "I'm not sure where to start", es: "No sé por dónde empezar" },
      ],
    },
    {
      question: t(
        "What matters most to you right now?",
        "¿Qué es lo más importante para ti ahora mismo?"
      ),
      options: [
        { en: "Monthly payment clarity", es: "Claridad en el pago mensual" },
        { en: "Understanding neighborhoods", es: "Conocer los vecindarios" },
        { en: "Knowing what I can afford", es: "Saber cuánto puedo pagar" },
        { en: "Timing the market correctly", es: "Elegir el momento correcto del mercado" },
      ],
    },
    {
      question: t(
        "How would you describe your comfort level with the process?",
        "¿Cómo describirías tu nivel de comodidad con el proceso?"
      ),
      options: [
        { en: "I feel confident", es: "Me siento seguro/a" },
        { en: "Somewhat confident", es: "Algo seguro/a" },
        { en: "A little overwhelmed", es: "Un poco abrumado/a" },
        { en: "Very overwhelmed", es: "Muy abrumado/a" },
      ],
    },
  ];

  // Null-safe scoring: null answerIndex = 0 points
  const calculateReadinessData = (currentAnswers: Answer[]) => {
    let score = 0;
    let primaryPriority = 'general';

    const situationIdx = currentAnswers.find((a) => a.questionIndex === 0)?.answerIndex;
    const situationScores = [5, 10, 20, 30];
    score += (situationIdx != null ? (situationScores[situationIdx] ?? 0) : 0);

    const lenderIdx = currentAnswers.find((a) => a.questionIndex === 1)?.answerIndex;
    const lenderScores = [30, 15, 5, 0];
    score += (lenderIdx != null ? (lenderScores[lenderIdx] ?? 0) : 0);

    const priorityIdx = currentAnswers.find((a) => a.questionIndex === 2)?.answerIndex;
    const priorityMap = ['monthly_payment', 'neighborhoods', 'affordability', 'timing'];
    if (priorityIdx != null) {
      primaryPriority = priorityMap[priorityIdx] || 'general';
      score += 20;
    }

    const comfortIdx = currentAnswers.find((a) => a.questionIndex === 3)?.answerIndex;
    const comfortScores = [20, 15, 5, 0];
    score += (comfortIdx != null ? (comfortScores[comfortIdx] ?? 0) : 0);

    return { readiness_score: Math.min(score, 100), primary_priority: primaryPriority };
  };

  // Step 5 side-effects: compute, log, then delayed onScoreRevealed
  useEffect(() => {
    if (currentStep !== 5) return;
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    const { readiness_score, primary_priority } = calculateReadinessData(answers);

    setFieldIfEmpty('intent', 'buy');
    updateSessionContext({ readiness_score, primary_priority });

    logEvent('quiz_complete', {
      quiz_id: 'buyer_readiness',
      readiness_score,
      primary_priority,
    });
    logEvent('tool_completed', {
      tool_id: 'buyer_readiness',
      page_path: '/v2/buyer-readiness',
      intent: 'buy',
      readiness_score,
      primary_priority,
    });

    const timer = setTimeout(() => {
      setIsComplete(true);
      if (!hasFiredRef.current) {
        hasFiredRef.current = true;
        onScoreRevealed?.({ readiness_score, primary_priority });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentStep, answers, onScoreRevealed]);

  const handleAnswer = (answerIndex: number) => {
    const questionIndex = currentStep - 1;
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionIndex !== questionIndex);
      return [...filtered, { questionIndex, answerIndex }];
    });

    setTimeout(() => {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(5);
      }
    }, 300);
  };

  const handleSkip = () => {
    const questionIndex = currentStep - 1;
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionIndex !== questionIndex);
      return [...filtered, { questionIndex, answerIndex: null }];
    });

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(5);
    }
  };

  const handleFinishLater = () => {
    logEvent('tool_abandoned', {
      tool_id: 'buyer_readiness',
      page_path: '/v2/buyer-readiness',
      step: currentStep,
    });
    navigate('/v2/guides');
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = currentStep >= 1 && currentStep <= 4 ? questions[currentStep - 1] : null;
  const selectedAnswer = answers.find((a) => a.questionIndex === currentStep - 1);
  const progressValue = currentStep >= 1 && currentStep <= 4
    ? Math.min(100, Math.max(0, ((currentStep - 1) / 4) * 100))
    : currentStep === 5 ? 100 : 0;

  return (
    <div className="min-h-[500px] flex flex-col">
      {/* Progress bar — visible on question steps */}
      {currentStep >= 1 && currentStep <= 4 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-cc-slate">
              {t("Question", "Pregunta")} {currentStep} {t("of", "de")} 4
            </span>
          </div>
          <Progress
            value={progressValue}
            className="h-2 bg-cc-sand-dark [&>div]:bg-cc-gold"
          />
        </div>
      )}

      {/* Step 0: Selena Context Card */}
      {currentStep === 0 && (
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-cc-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-cc-gold" />
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-4">
            {t(
              "Where Are You in Your Home Buying Journey?",
              "¿Dónde Estás en Tu Camino de Compra de Casa?"
            )}
          </h3>
          <p className="text-cc-charcoal mb-4 max-w-md mx-auto">
            {t(
              "Hi, I'm Selena — I'll guide you through a few quick questions. Tap what fits best. There are no right or wrong answers.",
              "Hola, soy Selena — te guiaré con unas preguntas rápidas. Toca la opción que mejor encaje. No hay respuestas correctas o incorrectas."
            )}
          </p>
          <p className="text-sm text-cc-slate mb-8">
            {t("Takes about 1 minute · Tap-only", "Toma ~1 minuto · Solo toques")}
          </p>
          <Button
            onClick={() => {
              if (!hasLoggedToolStart.current) {
                logEvent('tool_started', {
                  tool_id: 'buyer_readiness',
                  page_path: '/v2/buyer-readiness',
                });
                hasLoggedToolStart.current = true;
              }
              setCurrentStep(1);
            }}
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-8 shadow-gold text-sm sm:text-base"
          >
            {t("Start Quick Check", "Comenzar Evaluación")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Steps 1-4: Questions */}
      {currentStep >= 1 && currentStep <= 4 && currentQuestion && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="text-cc-slate hover:text-cc-navy transition-colors flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("Back", "Atrás")}
            </button>
          </div>

          <h3 className="font-serif text-xl md:text-2xl font-bold text-cc-navy mb-6 text-center">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3 max-w-lg mx-auto">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full py-5 px-6 min-h-[56px] text-left rounded-xl border-2 transition-all text-base ${
                  selectedAnswer?.answerIndex === index
                    ? "border-cc-gold bg-cc-gold/10"
                    : "border-cc-sand-dark hover:border-cc-gold/50 bg-white"
                }`}
              >
                <span className="text-cc-charcoal">
                  {language === "en" ? option.en : option.es}
                </span>
              </button>
            ))}
          </div>

          {/* Skip + Finish Later */}
          <div className="flex items-center justify-between max-w-lg mx-auto mt-6">
            <button
              onClick={handleSkip}
              className="text-sm text-cc-slate hover:text-cc-navy transition-colors underline underline-offset-2"
            >
              {t("Skip this question", "Saltar esta pregunta")}
            </button>
            <button
              onClick={handleFinishLater}
              className="text-sm text-cc-slate hover:text-cc-navy transition-colors underline underline-offset-2"
            >
              {t("I'll finish later", "Terminaré después")}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Neutral Completion State */}
      {currentStep === 5 && (
        <div className="text-center animate-fade-in py-12">
          {!isComplete ? (
            <>
              <div className="flex items-center justify-center gap-1.5 mb-6">
                <span className="w-2 h-2 bg-cc-gold rounded-full animate-pulse" />
                <span className="w-2 h-2 bg-cc-gold rounded-full animate-pulse [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-cc-gold rounded-full animate-pulse [animation-delay:0.4s]" />
              </div>
              <p className="text-cc-charcoal text-lg">
                {t(
                  "Thanks — we're putting your answers together.",
                  "Gracias — estamos procesando tus respuestas."
                )}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-cc-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-cc-gold" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-cc-navy mb-2">
                {t("All set.", "Listo.")}
              </h3>
              <p className="text-cc-slate text-sm">
                {t(
                  "Your readiness snapshot is ready.",
                  "Tu resumen de preparación está listo."
                )}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BuyerReadinessCheck;
```

### No changes to other files
- `src/pages/v2/V2BuyerReadiness.tsx` — unchanged (onScoreRevealed + LeadCaptureModal intact)
- `src/components/v2/SelenaHandoff.tsx` — orphaned but not deleted
