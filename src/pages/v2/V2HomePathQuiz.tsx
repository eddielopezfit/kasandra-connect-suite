import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
 * Map quiz intent answerIndex to canonical values for edge function
 */
function mapQuizIntentToCanonical(answerIndex: number): string {
  switch (answerIndex) {
    case 0: return "buy";
    case 1: return "sell";
    case 2: return "cash"; // Canonical value (not 'cash_offer')
    default: return "explore";
  }
}

/**
 * Map quiz timeline answerIndex to canonical values for edge function
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

type ResultPath = "buying" | "selling" | "cash" | "exploring";

/**
 * Inner component that uses Selena context (must be inside V2Layout)
 */
const V2HomePathQuizContent = ({ onComplete }: { onComplete?: () => void }) => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: "",
    email: "",
    phone: "",
  });
  const [isComplete, setIsComplete] = useState(false);

  const questions = [
    {
      id: "intent",
      question: t(
        "What brings you here today?",
        "¿Qué le trae por aquí hoy?"
      ),
      options: [
        { en: "Buying a home", es: "Comprar una casa" },
        { en: "Selling a home", es: "Vender una casa" },
        { en: "Exploring cash offer options", es: "Explorar opciones de oferta en efectivo" },
        { en: "Not sure yet — need guidance", es: "Aún no estoy seguro — necesito orientación" },
      ],
    },
    {
      id: "timeline",
      question: t(
        "When are you hoping to make a move?",
        "¿Cuándo espera tomar una decisión?"
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
        "¿Ha pasado por este proceso antes?"
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
        "¿Qué le resulta más abrumador en este momento?"
      ),
      options: [
        { en: "Understanding my options", es: "Entender mis opciones" },
        { en: "Financing or affordability", es: "Financiamiento o asequibilidad" },
        { en: "Timing or pressure", es: "Tiempo o presión" },
        { en: "Repairs or inspections", es: "Reparaciones o inspecciones" },
        { en: "I'm not sure — I need clarity", es: "No estoy seguro — necesito claridad" },
      ],
    },
  ];

  const totalSteps = questions.length + 1; // questions + contact form
  const isContactStep = currentStep === questions.length;

  // Determine result path based on first question answer
  const getResultPath = (): ResultPath => {
    const intentAnswer = answers.find(a => a.questionIndex === 0)?.answerIndex;
    switch (intentAnswer) {
      case 0: return "buying";
      case 1: return "selling";
      case 2: return "cash";
      default: return "exploring";
    }
  };

  const resultContent: Record<ResultPath, {
    headline: { en: string; es: string };
    validation: { en: string; es: string };
    nextStep: { en: string; es: string };
    helpfulSteps: { en: string[]; es: string[] };
  }> = {
    buying: {
      headline: {
        en: "You're Ready to Start Your Home Search",
        es: "Está Listo Para Comenzar Su Búsqueda de Casa"
      },
      validation: {
        en: "Looking to buy a home is a big step — and it's completely normal to have questions. Whether this is your first time or you've done it before, having clarity on your options makes all the difference.",
        es: "Buscar comprar una casa es un gran paso — y es completamente normal tener preguntas. Ya sea su primera vez o lo haya hecho antes, tener claridad sobre sus opciones hace toda la diferencia."
      },
      nextStep: {
        en: "Based on what you shared, here are the most helpful next steps:",
        es: "Según lo que compartió, estos son los próximos pasos más útiles:"
      },
      helpfulSteps: {
        en: [
          "Take the Buyer Readiness Check to see where you stand",
          "Review financing basics in our guides",
          "Connect with Selena for personalized guidance"
        ],
        es: [
          "Toma la Evaluación de Preparación del Comprador para ver dónde estás",
          "Revisa los conceptos básicos de financiamiento en nuestras guías",
          "Conéctate con Selena para orientación personalizada"
        ]
      }
    },
    selling: {
      headline: {
        en: "You're Thinking About Selling — That's a Smart Move",
        es: "Está Pensando en Vender — Es una Decisión Inteligente"
      },
      validation: {
        en: "Selling a home involves more than listing it online. Understanding your home's value, timing, and options can help you feel confident and in control of the process.",
        es: "Vender una casa implica más que publicarla en línea. Entender el valor de su casa, el momento adecuado y sus opciones le ayudará a sentirse seguro y en control del proceso."
      },
      nextStep: {
        en: "Based on what you shared, here are the most helpful next steps:",
        es: "Según lo que compartió, estos son los próximos pasos más útiles:"
      },
      helpfulSteps: {
        en: [
          "Learn what factors affect your home's value",
          "Understand the selling process step-by-step",
          "Connect with Kasandra for a personalized consultation"
        ],
        es: [
          "Aprende qué factores afectan el valor de tu casa",
          "Entiende el proceso de venta paso a paso",
          "Conéctate con Kasandra para una consulta personalizada"
        ]
      }
    },
    cash: {
      headline: {
        en: "Cash Offers Can Offer Speed and Simplicity",
        es: "Las Ofertas en Efectivo Pueden Ofrecer Rapidez y Simplicidad"
      },
      validation: {
        en: "If you're considering a cash offer, you're likely looking for a faster, simpler path. That's a valid option worth exploring — especially if repairs, timing, or traditional listings feel overwhelming.",
        es: "Si está considerando una oferta en efectivo, probablemente busca un camino más rápido y sencillo. Es una opción válida que vale la pena explorar — especialmente si las reparaciones, el tiempo o las ventas tradicionales le resultan abrumadores."
      },
      nextStep: {
        en: "Based on what you shared, here are the most helpful next steps:",
        es: "Según lo que compartió, estos son los próximos pasos más útiles:"
      },
      helpfulSteps: {
        en: [
          "Learn how cash offers work in Arizona",
          "Compare cash vs. traditional listing options",
          "Talk with Kasandra about what fits your situation"
        ],
        es: [
          "Aprende cómo funcionan las ofertas en efectivo en Arizona",
          "Compara las opciones de efectivo vs. venta tradicional",
          "Habla con Kasandra sobre lo que mejor se adapta a tu situación"
        ]
      }
    },
    exploring: {
      headline: {
        en: "It's Okay to Not Know Yet — You're in the Right Place",
        es: "Está Bien No Saber Aún — Está en el Lugar Correcto"
      },
      validation: {
        en: "Many people start their real estate journey with more questions than answers. That's exactly where you should be. Taking time to learn is never wasted.",
        es: "Muchas personas comienzan su viaje inmobiliario con más preguntas que respuestas. Eso es exactamente donde debería estar. Tomarse el tiempo para aprender nunca es tiempo perdido."
      },
      nextStep: {
        en: "Based on what you shared, here are the most helpful next steps:",
        es: "Según lo que compartió, estos son los próximos pasos más útiles:"
      },
      helpfulSteps: {
        en: [
          "Browse our guides at your own pace",
          "Take the quick Buyer Readiness Check",
          "Chat with Selena for personalized direction"
        ],
        es: [
          "Explora nuestras guías a tu propio ritmo",
          "Toma la Evaluación Rápida de Preparación del Comprador",
          "Chatea con Selena para orientación personalizada"
        ]
      }
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = answers.filter(a => a.questionIndex !== currentStep);
    newAnswers.push({ questionIndex: currentStep, answerIndex });
    setAnswers(newAnswers);
    
    // Auto-advance after a brief delay
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

  const handleSubmit = async () => {
    // Validate phone is present (required by submit-consultation-intake)
    if (!contactInfo.phone.trim() || contactInfo.phone.trim().length < 10) {
      toast({
        title: t("Phone required", "Teléfono requerido"),
        description: t(
          "Please enter a valid phone number to continue.",
          "Por favor ingrese un número de teléfono válido para continuar."
        ),
        variant: "destructive",
      });
      return;
    }

    // Ensure session ID exists
    let sessionId = localStorage.getItem("selena_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("selena_session_id", sessionId);
    }

    // Get session dossier for UTMs and attribution
    const sessionDossier = getFullSessionDossier();

    // Map quiz answers to canonical values
    const intentAnswer = answers.find(a => a.questionIndex === 0)?.answerIndex ?? 3;
    const timelineAnswer = answers.find(a => a.questionIndex === 1)?.answerIndex ?? 3;
    const experienceAnswer = answers.find(a => a.questionIndex === 2)?.answerIndex ?? -1;
    const frictionAnswer = answers.find(a => a.questionIndex === 3)?.answerIndex ?? -1;
    const contactPrefAnswer = answers.find(a => a.questionIndex === 4)?.answerIndex ?? -1;

    // Build structured notes from non-mapped quiz answers
    const notes = `path_quiz: experience=${experienceAnswer}; friction=${frictionAnswer}; contact_pref=${contactPrefAnswer}`;

    // Build payload for submit-consultation-intake
    const payload = {
      name: contactInfo.name.trim(),
      email: contactInfo.email.trim().toLowerCase(),
      phone: contactInfo.phone.trim(),
      language,
      intent: mapQuizIntentToCanonical(intentAnswer),
      timeline: mapQuizTimelineToCanonical(timelineAnswer),
      session_id: sessionId,
      source: "path_quiz",
      page_path: "/v2/quiz",
      quiz_completed: true,
      quiz_result_path: getResultPath(),
      notes,
      ...sessionDossier,
    };

    try {
      const { data: response, error } = await supabase.functions.invoke(
        "submit-consultation-intake",
        { body: payload }
      );

      if (error) {
        console.error("[V2HomePathQuiz] Edge function error:", error);
        toast({
          title: t("Something went wrong", "Algo salió mal"),
          description: t(
            "Something went wrong saving your quiz. Please try again.",
            "Algo salió mal al guardar su cuestionario. Por favor intente de nuevo."
          ),
          variant: "destructive",
        });
        return;
      }

      if (!response?.ok) {
        console.error("[V2HomePathQuiz] Submission failed:", response);
        toast({
          title: t("Submission failed", "Error al enviar"),
          description: response?.message || t(
            "Something went wrong saving your quiz. Please try again.",
            "Algo salió mal al guardar su cuestionario. Por favor intente de nuevo."
          ),
          variant: "destructive",
        });
        return;
      }

      // Store lead ID for cross-session continuity
      if (response.lead_id) {
        localStorage.setItem("selena_lead_id", response.lead_id);
      }

      // Write intent, timeline, and quiz_completed to SessionContext
      // so Selena acknowledges quiz results immediately when chat opens
      const canonicalIntent = mapQuizIntentToCanonical(intentAnswer);
      const canonicalTimeline = mapQuizTimelineToCanonical(timelineAnswer);
      updateSessionContext({
        intent: canonicalIntent as SessionContext['intent'],
        timeline: canonicalTimeline as SessionContext['timeline'],
        quiz_completed: true,
        quiz_result_path: getResultPath(),
      });

      toast({
        title: t("Quiz saved!", "¡Cuestionario guardado!"),
        description: t(
          "Your answers have been saved. Let's find your next steps.",
          "Sus respuestas han sido guardadas. Encontremos sus próximos pasos."
        ),
      });

      setIsComplete(true);
      onComplete?.(); // Signal layout to reveal Selena UI
    } catch (err) {
      console.error("[V2HomePathQuiz] Unexpected error:", err);
      toast({
        title: t("Something went wrong", "Algo salió mal"),
        description: t(
          "Something went wrong saving your quiz. Please try again.",
          "Algo salió mal al guardar su cuestionario. Por favor intente de nuevo."
        ),
        variant: "destructive",
      });
    }
  };

  const isContactValid = () => {
    const hasName = contactInfo.name.trim().length > 0;
    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email);
    const hasPhone = contactInfo.phone.replace(/\D/g, '').length >= 10;
    return hasName && hasEmail && hasPhone;
  };

  const getSelectedAnswer = (questionIndex: number) => {
    return answers.find(a => a.questionIndex === questionIndex)?.answerIndex;
  };

  // Completion screen with path-specific results
  if (isComplete) {
    const path = getResultPath();
    const content = resultContent[path];
    const derivedIntent = path === 'buying' ? 'buy' : path === 'selling' ? 'sell' : path === 'cash' ? 'cash' : 'explore';
    const exploreHref = path === 'cash' ? '/v2/cash-offer-options' : '/v2/guides';

    return (
      <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-cc-gold/20 flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-cc-gold" />
            </div>
            
            {/* Path-specific headline and validation */}
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-cc-navy mb-4">
              {t(content.headline.en, content.headline.es)}
            </h1>
            <p className="text-cc-slate text-lg leading-relaxed mb-6">
              {t(content.validation.en, content.validation.es)}
            </p>
          </div>

          {/* Most Helpful Next Steps */}
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
            
            {/* Personalization note */}
            <p className="mt-6 text-sm text-cc-slate border-t border-cc-sand-dark pt-4">
              {t(
                "Every recommendation is reviewed by Kasandra Prieto, licensed REALTOR®. You'll never feel pushed — just supported.",
                "Cada recomendación es revisada por Kasandra Prieto, REALTOR® licenciada. Nunca te sentirás presionado — solo apoyado."
              )}
            </p>
          </div>

          {/* Fixed three-tier CTA hierarchy */}
          <div className="space-y-4">
            <p className="text-center text-sm text-cc-slate font-medium">
              {t("Here's what to do next.", "Aquí está lo que puede hacer ahora.")}
            </p>

            {/* PRIMARY — Selena (always) */}
            <button
              onClick={() => openChat({ source: 'quiz_result', intent: derivedIntent })}
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
                      "Selena ya revisó sus respuestas — hable con ella ahora"
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

            {/* SECONDARY — Cash Options (cash path) or Booking (all other paths) */}
            {path === 'cash' ? (
              <Link
                to="/v2/cash-offer-options"
                className="flex items-start gap-4 p-5 rounded-xl border-2 border-cc-sand-dark bg-white hover:border-cc-gold/50 transition-all group"
              >
                <div className="w-10 h-10 bg-cc-sand rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-cc-navy" />
                </div>
                <div>
                  <h4 className="font-semibold text-cc-navy group-hover:text-cc-navy-dark text-sm">
                    {t("Explore Cash vs. Traditional Options", "Explorar opciones en efectivo vs. tradicional")}
                  </h4>
                  <p className="text-xs text-cc-slate mt-1">
                    {t("See a side-by-side comparison for your situation.", "Vea una comparación para su situación.")}
                  </p>
                </div>
              </Link>
            ) : (
              <Link
                to={`/v2/book?intent=${derivedIntent}&source=quiz`}
                className="flex items-start gap-4 p-5 rounded-xl border-2 border-cc-sand-dark bg-white hover:border-cc-gold/50 transition-all group"
              >
                <div className="w-10 h-10 bg-cc-sand rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-cc-navy" />
                </div>
                <div>
                  <h4 className="font-semibold text-cc-navy group-hover:text-cc-navy-dark text-sm">
                    {t("Book a Consultation with Kasandra", "Reservar una Consulta con Kasandra")}
                  </h4>
                  <p className="text-xs text-cc-slate mt-1">
                    {t("15-minute consultation, no pressure.", "Consulta de 15 minutos, sin presión.")}
                  </p>
                </div>
              </Link>
            )}

            {/* TERTIARY — low-weight text link */}
            <div className="text-center pt-1">
              {path === 'exploring' ? (
                <Link
                  to="/v2/buyer-readiness"
                  className="text-sm text-cc-slate hover:text-cc-navy underline underline-offset-2 transition-colors"
                >
                  {t("Take the Buyer Readiness Check", "Realizar la evaluación de preparación")}
                </Link>
              ) : (
                <Link
                  to={exploreHref}
                  className="text-sm text-cc-slate hover:text-cc-navy underline underline-offset-2 transition-colors"
                >
                  {t("Browse guides at your own pace", "Explorar guías a su propio ritmo")}
                </Link>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-cc-slate pt-4">
            {t(
              "You're not behind — you're exactly where you need to be.",
              "No está atrasado — está exactamente donde necesita estar."
            )}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl mx-auto">
          {/* Progress indicator */}
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

          {/* Quiz title - only on first step */}
          {currentStep === 0 && (
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-2">
                {t(
                  "Find Your Best Home Path",
                  "Encuentre Su Mejor Camino"
                )}
              </h1>
              <p className="text-muted-foreground">
                {t(
                  "Buyer, Seller, or Cash Options — Let's find what fits you.",
                  "Comprador, Vendedor u Opciones en Efectivo — Encontremos lo que mejor le convenga."
                )}
              </p>
            </div>
          )}

          {/* Question or Contact Form */}
          {isContactStep ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground mb-2">
                  {t(
                    "Where should we send your next steps?",
                    "¿A dónde debemos enviar sus próximos pasos?"
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
                    placeholder={t("Your name", "Su nombre")}
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
                    placeholder={t("your@email.com", "su@correo.com")}
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
                      "Requerido para que Kasandra pueda contactarle."
                    )}
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full gap-2"
                disabled={!isContactValid()}
                onClick={handleSubmit}
              >
                {t("Get My Next Steps", "Obtener Mis Próximos Pasos")}
                <ArrowRight className="w-5 h-5" />
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {t(
                  "Your information is private and will never be shared.",
                  "Su información es privada y nunca será compartida."
                )}
              </p>
            </div>
          ) : (
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
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </span>
                        <span className="text-base">
                          {t(option.en, option.es)}
                        </span>
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

/**
 * Wrapper component — owns isQuizComplete state and wires it to both
 * QuizFunnelLayout (showSelena) and V2HomePathQuizContent (onComplete).
 * SelenaChatProvider stays mounted throughout; only the UI is suppressed.
 */
const V2HomePathQuiz = () => {
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  return (
    <QuizFunnelLayout showSelena={isQuizComplete}>
      <V2HomePathQuizContent onComplete={() => setIsQuizComplete(true)} />
    </QuizFunnelLayout>
  );
};

export default V2HomePathQuiz;
