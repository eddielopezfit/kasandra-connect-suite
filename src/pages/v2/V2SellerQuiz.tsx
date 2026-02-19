import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import QuizFunnelLayout from "@/components/v2/QuizFunnelLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Check, MessageCircle, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getFullSessionDossier } from "@/hooks/useSessionPrePopulation";
import { updateSessionContext, SessionContext } from "@/lib/analytics/selenaSession";
import { toast } from "@/hooks/use-toast";

/**
 * Map seller quiz Step 1 answerIndex to canonical intent for edge function.
 * Seller-safe only: no buyer path.
 */
function mapSellerIntentToCanonical(answerIndex: number): "sell" | "cash" {
  switch (answerIndex) {
    case 0: return "sell";
    case 1: return "cash";
    case 2: return "sell"; // selling_compare stays seller-safe canonical
    default: return "sell";
  }
}

/**
 * Map Step 1 answerIndex to quiz_result_path.
 */
function mapSellerResultPath(answerIndex: number): SellerResultPath {
  switch (answerIndex) {
    case 0: return "selling";
    case 1: return "cash";
    case 2: return "selling_compare";
    default: return "selling";
  }
}

/**
 * Map quiz timeline answerIndex to canonical values for edge function.
 */
function mapQuizTimelineToCanonical(answerIndex: number): string {
  switch (answerIndex) {
    case 0: return "asap";
    case 1: return "60_90";
    case 2: return "exploring";
    default: return "exploring";
  }
}

interface QuizAnswer {
  questionIndex: number;
  answerIndex: number;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

type SellerResultPath = "selling" | "cash" | "selling_compare";

// ─────────────────────────────────────────────────────────────────────────────
// Result content — 3 seller-only variants, fully bilingual
// ─────────────────────────────────────────────────────────────────────────────
const resultContent: Record<SellerResultPath, {
  headline: { en: string; es: string };
  validation: { en: string; es: string };
  nextStep: { en: string; es: string };
  helpfulSteps: { en: string[]; es: string[] };
  secondaryCta: {
    en: string; es: string;
    href: string;
  };
}> = {
  selling: {
    headline: {
      en: "Selling Traditionally Can Maximize Your Value",
      es: "Vender de Forma Tradicional Puede Maximizar Tu Valor",
    },
    validation: {
      en: "If you're thinking about listing your home, having clarity on pricing, timing, and the steps ahead can help you feel confident and in control.",
      es: "Si estás pensando en vender tu casa, tener claridad sobre el precio, el tiempo y los pasos a seguir puede ayudarte a sentirte con confianza y en control.",
    },
    nextStep: {
      en: "Based on what you shared, here are the most helpful next steps:",
      es: "Según lo que compartiste, estos son los próximos pasos más útiles:",
    },
    helpfulSteps: {
      en: [
        "Understand what drives your home's value in today's market",
        "See a simple step-by-step plan for selling without overwhelm",
        "Talk with Kasandra about timing and strategy for your goals",
      ],
      es: [
        "Entiende qué impulsa el valor de tu casa en el mercado actual",
        "Ve un plan paso a paso para vender sin sentirte abrumado",
        "Habla con Kasandra sobre el tiempo y la estrategia según tus metas",
      ],
    },
    secondaryCta: {
      en: "Book a Consultation with Kasandra",
      es: "Agendar una Consulta con Kasandra",
      href: "/v2/book?intent=sell&source=seller_quiz",
    },
  },
  cash: {
    headline: {
      en: "Cash Offers Can Offer Speed and Simplicity",
      es: "Las Ofertas en Efectivo Pueden Ofrecer Rapidez y Simplicidad",
    },
    validation: {
      en: "If a cash offer is on your mind, you may be looking for a faster path with fewer moving parts — especially if timing, repairs, or uncertainty feel heavy.",
      es: "Si estás considerando una oferta en efectivo, quizá buscas un camino más rápido y con menos complicaciones — especialmente si el tiempo, las reparaciones o la incertidumbre se sienten pesados.",
    },
    nextStep: {
      en: "Based on what you shared, here are the most helpful next steps:",
      es: "Según lo que compartiste, estos son los próximos pasos más útiles:",
    },
    helpfulSteps: {
      en: [
        "Learn how cash offers work in Arizona",
        "Compare cash vs. traditional listing options side-by-side",
        "Talk with Kasandra about what fits your situation",
      ],
      es: [
        "Aprende cómo funcionan las ofertas en efectivo en Arizona",
        "Compara efectivo vs. venta tradicional lado a lado",
        "Habla con Kasandra sobre lo que mejor se adapta a tu situación",
      ],
    },
    secondaryCta: {
      en: "Explore Cash vs. Traditional Options",
      es: "Comparar Efectivo vs. Tradicional",
      href: "/v2/cash-offer-options",
    },
  },
  selling_compare: {
    headline: {
      en: "You Don't Have to Decide Yet",
      es: "No Tienes Que Decidir Todavía",
    },
    validation: {
      en: "Many homeowners start by comparing a traditional sale and a cash offer. A clear side-by-side view can make the next step feel simple and confident.",
      es: "Muchos propietarios comienzan comparando vender de forma tradicional y una oferta en efectivo. Verlo lado a lado puede hacer que el próximo paso se sienta más claro y simple.",
    },
    nextStep: {
      en: "Based on what you shared, here are the most helpful next steps:",
      es: "Según lo que compartiste, estos son los próximos pasos más útiles:",
    },
    helpfulSteps: {
      en: [
        "See the real trade-offs between cash and traditional selling",
        "Understand how timing and condition affect your best path",
        "Talk with Kasandra for clarity — no pressure",
      ],
      es: [
        "Ve las diferencias reales entre efectivo y venta tradicional",
        "Entiende cómo el tiempo y la condición influyen en tu mejor opción",
        "Habla con Kasandra para tener claridad — sin presión",
      ],
    },
    secondaryCta: {
      en: "Compare Cash vs. Traditional Options",
      es: "Comparar Opciones",
      href: "/v2/cash-offer-options",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Inner quiz content component (must live inside QuizFunnelLayout which
// provides SelenaChatProvider)
// ─────────────────────────────────────────────────────────────────────────────
const V2SellerQuizContent = ({ onComplete }: { onComplete?: () => void }) => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: "",
    email: "",
    phone: "",
  });
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Quiz questions ────────────────────────────────────────────────────────
  const questions = [
    {
      id: "intent",
      question: t(
        "What brings you here today?",
        "¿Qué te trae por aquí hoy?"
      ),
      // SELLER-ONLY: exactly 3 options, no buying path
      options: [
        { en: "Selling a home", es: "Vender una casa" },
        { en: "Exploring cash offer options", es: "Explorar opciones de oferta en efectivo" },
        { en: "Not sure yet — help me compare my options", es: "Aún no estoy seguro — ayúdame a comparar mis opciones" },
      ],
    },
    {
      id: "timeline",
      question: t(
        "When are you hoping to make a move?",
        "¿Cuándo esperas tomar una decisión?"
      ),
      options: [
        { en: "As soon as possible", es: "Lo antes posible" },
        { en: "3–6 months", es: "3–6 meses" },
        { en: "6–12 months", es: "6–12 meses" },
        { en: "Just exploring", es: "Solo explorando" },
      ],
    },
    {
      id: "experience",
      question: t(
        "Have you been through this process before?",
        "¿Has pasado por este proceso antes?"
      ),
      options: [
        { en: "Yes", es: "Sí" },
        { en: "No, first time", es: "No, es la primera vez" },
        { en: "Started before but didn't finish", es: "Empecé antes pero no terminé" },
        { en: "Not sure how it works", es: "No estoy seguro de cómo funciona" },
      ],
    },
    {
      id: "friction",
      question: t(
        "What feels most overwhelming right now?",
        "¿Qué te resulta más abrumador en este momento?"
      ),
      options: [
        { en: "Understanding my options", es: "Entender mis opciones" },
        { en: "Timing or pressure", es: "Tiempo o presión" },
        { en: "Repairs or condition of the home", es: "Reparaciones o condición de la casa" },
        { en: "Getting a fair price", es: "Obtener un precio justo" },
        { en: "I'm not sure — I need clarity", es: "No estoy seguro — necesito claridad" },
      ],
    },
  ];

  const totalSteps = questions.length + 1; // 4 questions + contact form
  const isContactStep = currentStep === questions.length;

  // Derive result path from Step 1 answer
  const getResultPath = (): SellerResultPath => {
    const intentAnswer = answers.find(a => a.questionIndex === 0)?.answerIndex;
    return mapSellerResultPath(intentAnswer ?? 0);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = answers.filter(a => a.questionIndex !== currentStep);
    newAnswers.push({ questionIndex: currentStep, answerIndex });
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentStep < questions.length) {
        setCurrentStep(currentStep + 1);
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isContactValid = () => {
    const hasName = contactInfo.name.trim().length > 0;
    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email);
    const hasPhone = contactInfo.phone.replace(/\D/g, "").length >= 10;
    return hasName && hasEmail && hasPhone;
  };

  const getSelectedAnswer = (questionIndex: number) =>
    answers.find(a => a.questionIndex === questionIndex)?.answerIndex;

  // ── Submission ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!contactInfo.phone.trim() || contactInfo.phone.replace(/\D/g, "").length < 10) {
      toast({
        title: t("Phone required", "Teléfono requerido"),
        description: t(
          "Please enter a valid phone number to continue.",
          "Por favor ingresa un número de teléfono válido para continuar."
        ),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Ensure session ID
    let sessionId = localStorage.getItem("selena_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("selena_session_id", sessionId);
    }

    // Pull attribution / tool-usage dossier from session
    const sessionDossier = getFullSessionDossier();

    // Map answers to canonical values
    const intentAnswer   = answers.find(a => a.questionIndex === 0)?.answerIndex ?? 0;
    const timelineAnswer = answers.find(a => a.questionIndex === 1)?.answerIndex ?? 3;
    const experienceAnswer = answers.find(a => a.questionIndex === 2)?.answerIndex ?? -1;
    const frictionAnswer   = answers.find(a => a.questionIndex === 3)?.answerIndex ?? -1;

    const canonicalIntent   = mapSellerIntentToCanonical(intentAnswer);
    const canonicalTimeline = mapQuizTimelineToCanonical(timelineAnswer);
    const quizResultPath    = mapSellerResultPath(intentAnswer);

    const notes = `seller_quiz: experience=${experienceAnswer}; friction=${frictionAnswer}`;

    // ── CRITICAL: spread dossier FIRST, then override with authoritative values
    // This prevents the dossier's stale quiz_completed=false from overwriting
    // the canonical submission values.
    const payload = {
      // Base contact fields
      name:  contactInfo.name.trim(),
      email: contactInfo.email.trim().toLowerCase(),
      phone: contactInfo.phone.trim(),
      language,
      notes,
      // Session dossier (attribution, tool signals, UTMs) — spread FIRST
      ...sessionDossier,
      // Authoritative overrides — MUST come after dossier spread
      session_id:       sessionId,
      source:           "seller_quiz",
      page_path:        "/v2/seller-quiz",
      intent:           canonicalIntent,
      timeline:         canonicalTimeline,
      quiz_completed:   true,
      quiz_result_path: quizResultPath,
    };

    try {
      const { data: response, error } = await supabase.functions.invoke(
        "submit-consultation-intake",
        { body: payload }
      );

      if (error) {
        console.error("[V2SellerQuiz] Edge function error:", error);
        toast({
          title: t("Something went wrong", "Algo salió mal"),
          description: t(
            "Something went wrong saving your quiz. Please try again.",
            "Algo salió mal al guardar tu cuestionario. Por favor intenta de nuevo."
          ),
          variant: "destructive",
        });
        return;
      }

      if (!response?.ok) {
        console.error("[V2SellerQuiz] Submission failed:", response);
        toast({
          title: t("Submission failed", "Error al enviar"),
          description: response?.message || t(
            "Something went wrong. Please try again.",
            "Algo salió mal. Por favor intenta de nuevo."
          ),
          variant: "destructive",
        });
        return;
      }

      // Persist lead ID for cross-session continuity (Identity Bridge)
      if (response.lead_id) {
        localStorage.setItem("selena_lead_id", response.lead_id);
      }

      // Write canonical intent + quiz completion to SessionContext so
      // Selena acknowledges quiz results immediately when chat opens
      updateSessionContext({
        intent:           canonicalIntent as SessionContext["intent"],
        timeline:         canonicalTimeline as SessionContext["timeline"],
        quiz_completed:   true,
        quiz_result_path: quizResultPath,
      });

      toast({
        title: t("Quiz saved!", "¡Cuestionario guardado!"),
        description: t(
          "Your answers have been saved. Let's find your next steps.",
          "Tus respuestas han sido guardadas. Encontremos tus próximos pasos."
        ),
      });

      setIsComplete(true);
      onComplete?.();
    } catch (err) {
      console.error("[V2SellerQuiz] Unexpected error:", err);
      toast({
        title: t("Something went wrong", "Algo salió mal"),
        description: t(
          "Something went wrong saving your quiz. Please try again.",
          "Algo salió mal al guardar tu cuestionario. Por favor intenta de nuevo."
        ),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Results screen ────────────────────────────────────────────────────────
  if (isComplete) {
    const path = getResultPath();
    const content = resultContent[path];
    // selling_compare uses "sell" as derivedIntent to keep pipeline clean
    const derivedIntent: "sell" | "cash" =
      path === "cash" ? "cash" : "sell";

    return (
      <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-cc-gold/20 flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-cc-gold" />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-cc-navy mb-4">
              {t(content.headline.en, content.headline.es)}
            </h1>
            <p className="text-cc-slate text-lg leading-relaxed mb-6">
              {t(content.validation.en, content.validation.es)}
            </p>
          </div>

          {/* Helpful next steps card */}
          <div className="bg-cc-sand rounded-xl p-6">
            <p className="text-cc-navy font-semibold mb-4">
              {t(content.nextStep.en, content.nextStep.es)}
            </p>
            <ul className="space-y-3">
              {content.helpfulSteps.en.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-cc-charcoal">
                  <Check className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span>{t(step, content.helpfulSteps.es[index])}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-cc-slate border-t border-cc-sand-dark pt-4">
              {t(
                "Every recommendation is reviewed by Kasandra Prieto, licensed REALTOR®. You'll never feel pushed — just supported.",
                "Cada recomendación es revisada por Kasandra Prieto, REALTOR® licenciada. Nunca te sentirás presionado — solo apoyado."
              )}
            </p>
          </div>

          {/* 3-tier CTA hierarchy */}
          <div className="space-y-4">
            <p className="text-center text-sm text-cc-slate font-medium">
              {t("Here's what to do next.", "Aquí está lo que puedes hacer ahora.")}
            </p>

            {/* PRIMARY — Selena (always) */}
            <button
              onClick={() => openChat({ source: "quiz_result", intent: derivedIntent })}
              className="w-full p-5 text-left rounded-xl border-2 border-cc-gold bg-cc-gold/5 hover:bg-cc-gold/10 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-cc-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-cc-navy" />
                </div>
                <div>
                  <h4 className="font-semibold text-cc-navy group-hover:text-cc-navy-dark">
                    {t(
                      "Selena has your results — talk with her now",
                      "Selena ya revisó tus respuestas — habla con ella ahora"
                    )}
                  </h4>
                  <p className="text-sm text-cc-slate mt-1">
                    {t(
                      "Get personalized answers based on your quiz — available 24/7 in English or Spanish.",
                      "Obtén respuestas personalizadas según tu cuestionario — disponible 24/7 en inglés o español."
                    )}
                  </p>
                </div>
              </div>
            </button>

            {/* SECONDARY — path-specific destination */}
            <Link
              to={content.secondaryCta.href}
              className="flex items-start gap-4 p-5 rounded-xl border-2 border-cc-sand-dark bg-white hover:border-cc-gold/50 transition-all group"
            >
              <div className="w-10 h-10 bg-cc-sand rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-cc-navy" />
              </div>
              <div>
                <h4 className="font-semibold text-cc-navy group-hover:text-cc-navy-dark text-sm">
                  {t(content.secondaryCta.en, content.secondaryCta.es)}
                </h4>
                <p className="text-xs text-cc-slate mt-1">
                  {path === "selling"
                    ? t("15-minute consultation, no pressure.", "Consulta de 15 minutos, sin presión.")
                    : t("See a side-by-side comparison for your situation.", "Ve una comparación para tu situación.")}
                </p>
              </div>
            </Link>

            {/* TERTIARY — guides text link */}
            <div className="text-center pt-1">
              <Link
                to="/v2/guides"
                className="text-sm text-cc-slate hover:text-cc-navy underline underline-offset-2 transition-colors"
              >
                {t("Browse guides at your own pace", "Explorar guías a tu propio ritmo")}
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-cc-slate pt-4">
            {t(
              "You're not behind — you're exactly where you need to be.",
              "No estás atrasado — estás exactamente donde necesitas estar."
            )}
          </p>
        </div>
      </section>
    );
  }

  // ── Quiz steps ────────────────────────────────────────────────────────────
  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {t("Step", "Paso")} {currentStep + 1} {t("of", "de")} {totalSteps}
            </span>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("Back", "Atrás")}
              </button>
            )}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Page hero — only on Step 1 */}
        {currentStep === 0 && (
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-2">
              {t(
                "Find the Best Way to Sell Your Home",
                "Encuentra la Mejor Manera de Vender Tu Casa"
              )}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "Compare a traditional listing vs. a cash offer — and choose what fits your situation.",
                "Compara vender de forma tradicional vs. una oferta en efectivo — y elige lo que mejor se adapte a tu situación."
              )}
            </p>
          </div>
        )}

        {/* Contact form (Step 5) */}
        {isContactStep ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground mb-2">
                {t(
                  "Where should we send your next steps?",
                  "¿A dónde debemos enviar tus próximos pasos?"
                )}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t(
                  "No spam, no pressure — just helpful guidance.",
                  "Sin spam, sin presión — solo orientación útil."
                )}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("Name", "Nombre")} *
                </label>
                <Input
                  type="text"
                  placeholder={t("Your name", "Tu nombre")}
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("Email", "Correo electrónico")} *
                </label>
                <Input
                  type="email"
                  placeholder={t("your@email.com", "tu@correo.com")}
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("Phone", "Teléfono")} *
                </label>
                <Input
                  type="tel"
                  placeholder={t("(555) 123-4567", "(555) 123-4567")}
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t(
                    "Required so Kasandra can reach you.",
                    "Requerido para que Kasandra pueda contactarte."
                  )}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              disabled={!isContactValid() || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? t("Saving…", "Guardando…")
                : t("Get My Next Steps", "Obtener Mis Próximos Pasos")}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {t(
                "Your information is private and will never be shared.",
                "Tu información es privada y nunca será compartida."
              )}
            </p>
          </div>
        ) : (
          /* Question steps (0–3) */
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground text-center mb-6">
              {questions[currentStep].question}
            </h2>

            <div className="space-y-3">
              {questions[currentStep].options.map((option, index) => {
                const isSelected = getSelectedAnswer(currentStep) === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent/50 text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                      </span>
                      <span className="text-base">{t(option.en, option.es)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Wrapper — owns isQuizComplete, wires to QuizFunnelLayout showSelena prop
// ─────────────────────────────────────────────────────────────────────────────
const V2SellerQuiz = () => {
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  return (
    <QuizFunnelLayout showSelena={isQuizComplete}>
      <V2SellerQuizContent onComplete={() => setIsQuizComplete(true)} />
    </QuizFunnelLayout>
  );
};

export default V2SellerQuiz;
