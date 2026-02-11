import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Calendar, Sparkles, MessageCircle } from "lucide-react";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";

interface Answer {
  questionIndex: number;
  answerIndex: number;
}

interface Question {
  question: string;
  options: { en: string; es: string }[];
}

interface SelenaHandoffProps {
  answers: Answer[];
  questions: Question[];
  onBack: () => void;
}

const SelenaHandoff = ({ answers, questions, onBack }: SelenaHandoffProps) => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  const [currentFollowUp, setCurrentFollowUp] = useState(0);
  const [followUpAnswers, setFollowUpAnswers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const followUpQuestions = [
    {
      question: t(
        "What's your ideal timeline for moving into a new home?",
        "¿Cuál es tu cronograma ideal para mudarte a una nueva casa?"
      ),
      placeholder: t(
        "e.g., Within 3 months, by summer, flexible...",
        "ej., En 3 meses, para el verano, flexible..."
      ),
    },
    {
      question: t(
        "Are there specific areas or neighborhoods in Tucson you're interested in?",
        "¿Hay áreas o vecindarios específicos en Tucson que te interesen?"
      ),
      placeholder: t(
        "e.g., Catalina Foothills, Downtown, not sure yet...",
        "ej., Catalina Foothills, Centro, no estoy seguro/a aún..."
      ),
    },
    {
      question: t(
        "Is there anything specific you'd like to discuss with Kasandra?",
        "¿Hay algo específico que te gustaría discutir con Kasandra?"
      ),
      placeholder: t(
        "e.g., First-time buyer questions, investment property, downsizing...",
        "ej., Preguntas de primera compra, propiedad de inversión, reducir tamaño..."
      ),
    },
  ];

  const handleSubmitAnswer = () => {
    if (!inputValue.trim()) return;
    
    setFollowUpAnswers([...followUpAnswers, inputValue]);
    setInputValue("");
    
    if (currentFollowUp < followUpQuestions.length - 1) {
      setCurrentFollowUp(currentFollowUp + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  return (
    <div className="min-h-[500px] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-cc-slate hover:text-cc-navy transition-colors flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("Back", "Atrás")}
        </button>
      </div>

      {/* Selena AI Introduction */}
      <div className="bg-cc-navy rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-cc-gold rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-cc-gold/50 ring-offset-2 ring-offset-cc-navy">
            <Sparkles className="w-6 h-6 text-cc-navy" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">
              {t("Meet Selena AI", "Conoce a Selena AI")}
            </h3>
            <p className="text-white/80 text-sm mb-4">
              {t(
                "Selena AI is Kasandra's AI assistant, available anytime to help gather details and make sure your conversation is focused and helpful. She'll never replace Kasandra—just help prepare for your chat.",
                "Selena AI es la asistente de IA de Kasandra, disponible en cualquier momento para ayudar a reunir detalles y asegurar que tu conversación sea enfocada y útil. Nunca reemplazará a Kasandra—solo ayuda a preparar tu charla."
              )}
            </p>
            {/* Trust Reference */}
            <div className="bg-white/10 rounded-lg p-3 mt-3">
              <p className="text-white/70 text-xs italic">
                {t(
                  "Many of Kasandra's clients describe her as patient, clear, and deeply committed to helping them feel safe and confident through the process.",
                  "Muchos clientes describen a Kasandra como paciente, clara y muy comprometida con ayudarles a sentirse tranquilos y seguros durante todo el proceso."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isComplete ? (
        <>
          {/* Chat-like conversation */}
          <div className="flex-1 space-y-4 mb-6">
            {/* Previous answers */}
            {followUpAnswers.map((answer, index) => (
              <div key={index} className="space-y-3">
                <div className="bg-cc-sand rounded-xl p-4">
                  <p className="text-sm text-cc-navy font-medium">
                    {followUpQuestions[index].question}
                  </p>
                </div>
                <div className="bg-cc-gold/10 rounded-xl p-4 ml-8">
                  <p className="text-sm text-cc-charcoal">{answer}</p>
                </div>
              </div>
            ))}

            {/* Current question */}
            <div className="bg-cc-sand rounded-xl p-4">
              <p className="text-sm text-cc-navy font-medium">
                {followUpQuestions[currentFollowUp].question}
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="mt-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={followUpQuestions[currentFollowUp].placeholder}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-cc-sand-dark focus:border-cc-gold focus:outline-none transition-colors text-cc-charcoal"
              />
              <Button
                onClick={handleSubmitAnswer}
                disabled={!inputValue.trim()}
                className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy rounded-xl px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-cc-slate">
                {t(
                  `Question ${currentFollowUp + 1} of ${followUpQuestions.length}`,
                  `Pregunta ${currentFollowUp + 1} de ${followUpQuestions.length}`
                )}
              </p>
              {/* Skip option - concierge philosophy: don't force qualification */}
              <button
                onClick={() => {
                  // Skip to completion with current answers
                  setIsComplete(true);
                }}
                className="text-xs text-cc-slate hover:text-cc-navy underline underline-offset-2 transition-colors"
              >
                {t("I'll share later", "Lo comparto después")}
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Completion state */
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-cc-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-cc-gold" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-cc-navy mb-4">
            {t("You're all set!", "¡Todo listo!")}
          </h3>
          <p className="text-cc-charcoal mb-6 max-w-md mx-auto">
            {t(
              "Thanks for sharing. Kasandra will have everything she needs to make your conversation focused and helpful.",
              "Gracias por compartir. Kasandra tendrá todo lo que necesita para que tu conversación sea enfocada y útil."
            )}
          </p>
          
          <div className="bg-cc-sand rounded-xl p-6 mb-6 max-w-md mx-auto">
            <h4 className="font-semibold text-cc-navy mb-3">
              {t("What you shared:", "Lo que compartiste:")}
            </h4>
            <ul className="text-sm text-cc-charcoal space-y-2 text-left">
              {followUpAnswers.map((answer, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-cc-gold">•</span>
                  <span>{answer}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={() => {
              logCTAClick({
                cta_name: CTA_NAMES.SELENA_ROUTE_CALL,
                destination: 'selena_chat',
                page_path: '/v2/buyer-readiness',
                intent: 'buy',
              });
              openChat({ source: 'hero', intent: 'buy' });
            }}
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("Continue with Selena", "Continuar con Selena")}
          </Button>
          
          <p className="text-xs text-cc-slate mt-4">
            {t(
              "Your information will be shared with Kasandra to prepare for your call.",
              "Tu información será compartida con Kasandra para preparar tu llamada."
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default SelenaHandoff;
