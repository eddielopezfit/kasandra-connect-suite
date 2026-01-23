import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ContextualChatPromptProps {
  context: "guides" | "quiz" | "buying" | "selling" | "cash" | "general";
}

const ContextualChatPrompt = ({ context }: ContextualChatPromptProps) => {
  const { t } = useLanguage();

  const prompts: Record<string, { prompt: { en: string; es: string }; cta: { en: string; es: string } }> = {
    guides: {
      prompt: {
        en: "Have a question about what you just read?",
        es: "¿Tienes una pregunta sobre lo que acabas de leer?"
      },
      cta: {
        en: "Ask Selena AI",
        es: "Pregúntale a Selena AI"
      }
    },
    quiz: {
      prompt: {
        en: "Not sure which path fits you best?",
        es: "¿No estás seguro de qué camino es mejor para ti?"
      },
      cta: {
        en: "Chat with Selena AI",
        es: "Conversa con Selena AI"
      }
    },
    buying: {
      prompt: {
        en: "Questions about the buying process?",
        es: "¿Preguntas sobre el proceso de compra?"
      },
      cta: {
        en: "Ask Selena AI",
        es: "Pregúntale a Selena AI"
      }
    },
    selling: {
      prompt: {
        en: "Wondering about your home's value?",
        es: "¿Te preguntas sobre el valor de tu casa?"
      },
      cta: {
        en: "Ask Selena AI",
        es: "Pregúntale a Selena AI"
      }
    },
    cash: {
      prompt: {
        en: "Curious how cash offers work?",
        es: "¿Curioso sobre cómo funcionan las ofertas en efectivo?"
      },
      cta: {
        en: "Ask Selena AI",
        es: "Pregúntale a Selena AI"
      }
    },
    general: {
      prompt: {
        en: "Have a question?",
        es: "¿Tienes una pregunta?"
      },
      cta: {
        en: "Chat with Selena AI",
        es: "Conversa con Selena AI"
      }
    }
  };

  const content = prompts[context] || prompts.general;

  return (
    <div className="bg-cc-sand/50 rounded-xl p-4 border border-cc-sand-dark/30">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-cc-charcoal">
          {t(content.prompt.en, content.prompt.es)}
        </p>
        <button
          onClick={() => {
            // Trigger the Lead Connector chat widget if available
            const chatWidget = document.querySelector('[data-widget-id]');
            if (chatWidget) {
              (chatWidget as HTMLElement).click?.();
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-cc-navy text-white text-sm font-medium rounded-full hover:bg-cc-navy-dark transition-colors whitespace-nowrap"
        >
          <MessageCircle className="w-4 h-4" />
          {t(content.cta.en, content.cta.es)}
        </button>
      </div>
      <p className="text-xs text-cc-slate mt-2">
        {t(
          "Selena AI is available 24/7 in English or Spanish. All guidance is reviewed by Kasandra.",
          "Selena AI está disponible 24/7 en inglés o español. Toda la orientación es revisada por Kasandra."
        )}
      </p>
    </div>
  );
};

export default ContextualChatPrompt;