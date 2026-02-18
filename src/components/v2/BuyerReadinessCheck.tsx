import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import SelenaHandoff from "./SelenaHandoff";
import { updateSessionContext, setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import GuideSuggestionCard from "@/components/v2/shared/GuideSuggestionCard";

interface Answer {
  questionIndex: number;
  answerIndex: number;
}

const BuyerReadinessCheck = () => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  const [currentStep, setCurrentStep] = useState(0); // 0 = intro, 1-4 = questions, 5 = results, 6 = selena
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showSelena, setShowSelena] = useState(false);
  const hasLoggedToolStart = useRef(false);

  const questions = [
    {
      question: t(
        "What best describes your current situation?",
        "¿Qué describe mejor tu situación actual?"
      ),
      options: [
        {
          en: "Just exploring / gathering information",
          es: "Solo explorando / recopilando información",
        },
        {
          en: "Planning to buy in the next 6–12 months",
          es: "Planeando comprar en los próximos 6–12 meses",
        },
        {
          en: "Actively looking in the next 3 months",
          es: "Buscando activamente en los próximos 3 meses",
        },
        {
          en: "Already touring homes",
          es: "Ya estoy visitando casas",
        },
      ],
    },
    {
      question: t(
        "Have you spoken with a lender yet?",
        "¿Ya has hablado con un prestamista?"
      ),
      options: [
        {
          en: "Yes, I'm pre-approved",
          es: "Sí, estoy pre-aprobado/a",
        },
        {
          en: "I've talked to one, but not pre-approved",
          es: "He hablado con uno, pero no estoy pre-aprobado/a",
        },
        {
          en: "Not yet",
          es: "Todavía no",
        },
        {
          en: "I'm not sure where to start",
          es: "No sé por dónde empezar",
        },
      ],
    },
    {
      question: t(
        "What matters most to you right now?",
        "¿Qué es lo más importante para ti ahora mismo?"
      ),
      options: [
        {
          en: "Monthly payment clarity",
          es: "Claridad en el pago mensual",
        },
        {
          en: "Understanding neighborhoods",
          es: "Conocer los vecindarios",
        },
        {
          en: "Knowing what I can afford",
          es: "Saber cuánto puedo pagar",
        },
        {
          en: "Timing the market correctly",
          es: "Elegir el momento correcto del mercado",
        },
      ],
    },
    {
      question: t(
        "How would you describe your comfort level with the process?",
        "¿Cómo describirías tu nivel de comodidad con el proceso?"
      ),
      options: [
        {
          en: "I feel confident",
          es: "Me siento seguro/a",
        },
        {
          en: "Somewhat confident",
          es: "Algo seguro/a",
        },
        {
          en: "A little overwhelmed",
          es: "Un poco abrumado/a",
        },
        {
          en: "Very overwhelmed",
          es: "Muy abrumado/a",
        },
      ],
    },
  ];

  // Calculate readiness score (0-100) and primary priority
  const calculateReadinessData = () => {
    let score = 0;
    let primaryPriority = 'general';
    
    // Question 0: Situation (max 30 points)
    const situationAnswer = answers.find((a) => a.questionIndex === 0)?.answerIndex ?? 0;
    const situationScores = [5, 10, 20, 30]; // exploring, planning, active, touring
    score += situationScores[situationAnswer] || 5;
    
    // Question 1: Lender (max 30 points)
    const lenderAnswer = answers.find((a) => a.questionIndex === 1)?.answerIndex ?? 3;
    const lenderScores = [30, 15, 5, 0]; // pre-approved, talked, not yet, unsure
    score += lenderScores[lenderAnswer] || 0;
    
    // Question 2: Priority (determines primary_priority)
    const priorityAnswer = answers.find((a) => a.questionIndex === 2)?.answerIndex ?? 0;
    const priorityMap = ['monthly_payment', 'neighborhoods', 'affordability', 'timing'];
    primaryPriority = priorityMap[priorityAnswer] || 'general';
    // Add 20 points for having a clear priority
    score += 20;
    
    // Question 3: Comfort (max 20 points)
    const comfortAnswer = answers.find((a) => a.questionIndex === 3)?.answerIndex ?? 2;
    const comfortScores = [20, 15, 5, 0]; // confident, somewhat, little, very overwhelmed
    score += comfortScores[comfortAnswer] || 0;
    
    return { readiness_score: Math.min(score, 100), primary_priority: primaryPriority };
  };

  const getResultProfile = () => {
    // Determine buyer stage based on answers
    const situationAnswer = answers.find((a) => a.questionIndex === 0)?.answerIndex ?? 0;
    const lenderAnswer = answers.find((a) => a.questionIndex === 1)?.answerIndex ?? 2;
    const comfortAnswer = answers.find((a) => a.questionIndex === 3)?.answerIndex ?? 2;

    // Early discovery (exploring, no lender, overwhelmed)
    if (situationAnswer <= 1 && lenderAnswer >= 2) {
      return "early";
    }
    // Active but needs guidance
    if (situationAnswer >= 2 && lenderAnswer >= 1 && comfortAnswer >= 2) {
      return "active-guided";
    }
    // Ready to move
    if (situationAnswer >= 2 && lenderAnswer <= 1) {
      return "ready";
    }
    return "early";
  };

  // Get dynamic bullets based on primary priority
  const getDynamicBullets = (baseBullets: string[], priorityIndex: number) => {
    // Reorder bullets to put priority-relevant one first
    const reordered = [...baseBullets];
    if (priorityIndex >= 0 && priorityIndex < reordered.length) {
      const priorityBullet = reordered[priorityIndex];
      reordered.splice(priorityIndex, 1);
      reordered.unshift(priorityBullet);
    }
    return reordered;
  };

  const resultContent = {
    early: {
      message: t(
        "Based on what you shared, it sounds like you're in the early discovery phase. That's completely normal. Most smart buyers start by gaining clarity before making any decisions.",
        "Según lo que compartiste, parece que estás en la fase inicial de descubrimiento. Eso es completamente normal. La mayoría de los compradores inteligentes comienzan por obtener claridad antes de tomar cualquier decisión."
      ),
      bullets: [
        t(
          "Understanding your budget and financing options",
          "Entender tu presupuesto y opciones de financiamiento"
        ),
        t(
          "Learning about Tucson neighborhoods that match your lifestyle",
          "Conocer los vecindarios de Tucson que se ajustan a tu estilo de vida"
        ),
        t(
          "Getting comfortable with the home buying timeline",
          "Familiarizarte con el cronograma de compra de casa"
        ),
      ],
    },
    "active-guided": {
      message: t(
        "You're actively searching but may have some questions along the way. That's a great place to be—having guidance at this stage can save you time and stress.",
        "Estás buscando activamente pero puede que tengas algunas preguntas en el camino. Ese es un excelente lugar para estar—tener orientación en esta etapa puede ahorrarte tiempo y estrés."
      ),
      bullets: [
        t(
          "Clarifying your must-haves vs. nice-to-haves",
          "Clarificar tus necesidades esenciales vs. deseables"
        ),
        t(
          "Understanding how to make competitive offers",
          "Entender cómo hacer ofertas competitivas"
        ),
        t(
          "Having someone in your corner during negotiations",
          "Tener a alguien de tu lado durante las negociaciones"
        ),
      ],
    },
    ready: {
      message: t(
        "It looks like you're well-prepared and ready to take the next step. With pre-approval in hand and a clear sense of what you want, you're in a strong position.",
        "Parece que estás bien preparado/a y listo/a para dar el siguiente paso. Con pre-aprobación en mano y una idea clara de lo que quieres, estás en una posición fuerte."
      ),
      bullets: [
        t(
          "Access to listings before they hit the market",
          "Acceso a propiedades antes de que salgan al mercado"
        ),
        t(
          "Expert negotiation to get the best terms",
          "Negociación experta para obtener los mejores términos"
        ),
        t(
          "Smooth coordination from offer to closing",
          "Coordinación fluida desde la oferta hasta el cierre"
        ),
      ],
    },
  };

  const handleAnswer = (answerIndex: number) => {
    const questionIndex = currentStep - 1;
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionIndex !== questionIndex);
      return [...filtered, { questionIndex, answerIndex }];
    });
    
    // Auto-advance after selection
    setTimeout(() => {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        // Calculate and persist readiness data before showing results
        const { readiness_score, primary_priority } = calculateReadinessData();
        // Intent uses write-once to preserve user-declared intent (from URL/prior declaration)
        setFieldIfEmpty('intent', 'buy');
        // Quiz result fields are definitive tool outputs - always update
        updateSessionContext({ 
          readiness_score,
          primary_priority,
        });
        logEvent('quiz_complete', { 
          quiz_id: 'buyer_readiness',
          readiness_score,
          primary_priority,
        });
        // Emit tool_completed event
        logEvent('tool_completed', {
          tool_id: 'buyer_readiness',
          page_path: '/v2/buyer-readiness',
          intent: 'buy',
          readiness_score,
          primary_priority,
        });
        setCurrentStep(5); // Go to results
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = questions[currentStep - 1];
  const selectedAnswer = answers.find((a) => a.questionIndex === currentStep - 1);
  const profile = getResultProfile();
  const result = resultContent[profile];
  
  
  // Calculate readiness data for dynamic bullets
  const { primary_priority } = calculateReadinessData();
  const priorityToIndex: Record<string, number> = {
    monthly_payment: 0,
    neighborhoods: 1,
    affordability: 2,
    timing: 0,
  };
  const dynamicBullets = getDynamicBullets(result.bullets, priorityToIndex[primary_priority] || 0);

  if (showSelena) {
    return <SelenaHandoff answers={answers} questions={questions} onBack={() => setShowSelena(false)} />;
  }

  return (
    <div className="min-h-[500px] flex flex-col">
      {/* Progress indicator */}
      {currentStep >= 1 && currentStep <= 4 && (
        <div className="flex gap-2 mb-8 justify-center">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 w-12 rounded-full transition-colors ${
                step <= currentStep ? "bg-cc-gold" : "bg-cc-sand-dark"
              }`}
            />
          ))}
        </div>
      )}

      {/* Step 0: Intro */}
      {currentStep === 0 && (
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-cc-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-cc-gold" />
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-4">
            {t("Buyer Readiness Check", "Evaluación de Preparación del Comprador")}
          </h3>
          <p className="text-cc-charcoal mb-6 max-w-md mx-auto">
            {t(
              "Answer 4 quick questions to understand where you are in your home buying journey and what might help you next.",
              "Responde 4 preguntas rápidas para entender dónde estás en tu camino de compra de casa y qué podría ayudarte después."
            )}
          </p>
          <p className="text-sm text-cc-slate mb-8">
            {t("Takes about 1 minute • No email required", "Toma aproximadamente 1 minuto • No se requiere correo")}
          </p>
          <Button
            onClick={() => {
              // Emit tool_started event (once per session)
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
            <span className="text-sm text-cc-slate">
              {currentStep} {t("of", "de")} 4
            </span>
          </div>

          <h3 className="font-serif text-xl md:text-2xl font-bold text-cc-navy mb-6 text-center">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3 max-w-lg mx-auto">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
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
        </div>
      )}

      {/* Step 5: Results */}
      {currentStep === 5 && (
        <div className="animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cc-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-cc-gold" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-cc-navy mb-4">
              {t("Your Clarity Summary", "Tu Resumen de Claridad")}
            </h3>
          </div>

          <div className="bg-cc-sand rounded-xl p-6 mb-6 max-w-lg mx-auto">
            <p className="text-cc-charcoal mb-4">{result.message}</p>
            <p className="text-sm font-semibold text-cc-navy mb-3">
              {t("Most helpful next steps for you:", "Los próximos pasos más útiles para ti:")}
            </p>
            <ul className="space-y-2">
              {dynamicBullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-cc-charcoal">
                  <CheckCircle className="w-4 h-4 text-cc-gold flex-shrink-0 mt-0.5" />
                  {bullet}
                </li>
              ))}
            </ul>
            
            {/* Personalization note */}
            <p className="mt-4 pt-4 border-t border-cc-sand-dark text-xs text-cc-slate">
              {t(
                "This summary is reviewed and personalized by Kasandra Prieto, a licensed REALTOR® in Arizona. No pressure, just clarity.",
                "Este resumen es revisado y personalizado por Kasandra Prieto, REALTOR® licenciada en Arizona. Sin presión, solo claridad."
              )}
            </p>
          </div>

          {/* Recommended Reading - First-Time Buyer Guide for early/guided profiles */}
          {(profile === "early" || profile === "active-guided") && (
            <div className="mb-6 max-w-lg mx-auto">
              <GuideSuggestionCard
                guideId="first-time-buyer-guide"
                titleEn="First-Time Buyer's Complete Guide"
                titleEs="Guía Completa para Compradores de Primera Vivienda"
                descriptionEn="Clear steps from pre-approval to closing day—at your own pace."
                descriptionEs="Pasos claros desde la pre-aprobación hasta el día de cierre—a tu ritmo."
                ctaSource="buyer_readiness_results"
              />
            </div>
          )}

          {/* Choice-based next step */}
          <div className="space-y-4 max-w-lg mx-auto">
            <p className="text-center text-sm text-cc-slate mb-4">
              {t("Choose how you'd like to continue:", "Elige cómo te gustaría continuar:")}
            </p>

            {/* Option A: Talk with Selena AI */}
            <button
              onClick={() => {
                logCTAClick({
                  cta_name: CTA_NAMES.RESULT_CHAT_SELENA,
                  destination: 'selena_handoff',
                  page_path: '/v2/buyer-readiness',
                  intent: 'buy',
                });
                setShowSelena(true);
              }}
              className="w-full p-4 sm:p-5 text-left rounded-xl border-2 border-cc-gold bg-cc-gold/5 hover:bg-cc-gold/10 transition-all group"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 bg-cc-gold rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-cc-gold/50 ring-offset-2 ring-offset-white">
                  <MessageCircle className="w-5 h-5 text-cc-navy" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-cc-navy group-hover:text-cc-navy-dark text-sm sm:text-base">
                    {t("Chat with Selena AI", "Conversa con Selena AI")}
                  </h4>
                  <p className="text-xs sm:text-sm text-cc-slate mt-1">
                    {t(
                      "Get personalized answers 24/7 — Selena AI can help you prepare before talking with Kasandra.",
                      "Obtén respuestas personalizadas 24/7 — Selena AI puede ayudarte a prepararte antes de hablar con Kasandra."
                    )}
                  </p>
                </div>
              </div>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option B: Schedule with Kasandra → Routes through Selena */}
              <button
                onClick={() => {
                  logCTAClick({
                    cta_name: CTA_NAMES.RESULT_TALK_KASANDRA,
                    destination: 'selena_chat',
                    page_path: '/v2/buyer-readiness',
                    intent: 'buy',
                  });
                  openChat({ source: 'calculator', intent: 'buy' });
                }}
                className="p-4 text-left rounded-xl border-2 border-cc-sand-dark bg-white hover:border-cc-gold/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-cc-navy group-hover:text-cc-navy-dark text-sm">
                      {t("Talk with Kasandra", "Habla con Kasandra")}
                    </h4>
                    <p className="text-xs text-cc-slate mt-1">
                      {t("Schedule a calm, no-pressure call.", "Agenda una llamada tranquila.")}
                    </p>
                  </div>
                </div>
              </button>

              {/* Option C: Continue exploring */}
              <Link
                to="/v2/guides"
                onClick={() => {
                  logCTAClick({
                    cta_name: CTA_NAMES.RESULT_CONTINUE_EXPLORING,
                    destination: '/v2/guides',
                    page_path: '/v2/buyer-readiness',
                    intent: 'buy',
                  });
                }}
                className="p-4 text-left rounded-xl border-2 border-cc-sand-dark bg-white hover:border-cc-gold/50 transition-all group block"
              >
                <h4 className="font-semibold text-cc-navy group-hover:text-cc-navy-dark text-sm">
                  {t("Continue Exploring", "Continúa Explorando")}
                </h4>
                <p className="text-xs text-cc-slate mt-1">
                  {t("Browse guides at your own pace.", "Explora guías a tu ritmo.")}
                </p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerReadinessCheck;
