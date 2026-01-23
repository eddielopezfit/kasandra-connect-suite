import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelenaAnchorPromptProps {
  variant: 'floating' | 'category' | 'grid_idle';
  onAskSelena: (prefillMessage?: string) => void;
  className?: string;
}

const variantContent = {
  floating: {
    title: "Not sure what to read next?",
    titleEs: "¿No sabes qué leer ahora?",
    subtitle: "Ask Selena to guide you — in English or Spanish.",
    subtitleEs: "Pregúntale a Selena — en inglés o español.",
    cta: "Ask Selena",
    ctaEs: "Preguntar a Selena",
    prefill: "I'm not sure which guide to read. Can you help me find the right one?",
  },
  category: {
    title: "Feeling overwhelmed?",
    titleEs: "¿Te sientes abrumado?",
    subtitle: "Selena can help you narrow down what matters most.",
    subtitleEs: "Selena puede ayudarte a enfocarte en lo que más importa.",
    cta: "Get Guidance",
    ctaEs: "Obtener Guía",
    prefill: "There are so many guides. Can you help me figure out what's most important for my situation?",
  },
  grid_idle: {
    title: "Still browsing?",
    titleEs: "¿Aún explorando?",
    subtitle: "Tell Selena about your situation and get personalized recommendations.",
    subtitleEs: "Cuéntale a Selena sobre tu situación y obtén recomendaciones personalizadas.",
    cta: "Chat with Selena",
    ctaEs: "Chatear con Selena",
    prefill: "I've been looking at guides but I'm not sure where to focus. Can you help?",
  },
};

export function SelenaAnchorPrompt({
  variant,
  onAskSelena,
  className,
}: SelenaAnchorPromptProps) {
  const { t } = useLanguage();
  const content = variantContent[variant];
  
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-cc-navy/5 to-cc-gold/5 rounded-xl p-6 border border-cc-sand-dark/50",
        "flex flex-col sm:flex-row items-center gap-4 sm:gap-6",
        className
      )}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-full bg-cc-gold/20 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-6 h-6 text-cc-gold" />
      </div>
      
      {/* Text */}
      <div className="flex-1 text-center sm:text-left">
        <h3 className="font-medium text-cc-navy mb-1">
          {t(content.title, content.titleEs)}
        </h3>
        <p className="text-sm text-cc-slate">
          {t(content.subtitle, content.subtitleEs)}
        </p>
      </div>
      
      {/* CTA */}
      <Button
        onClick={() => onAskSelena(content.prefill)}
        className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-medium rounded-full px-6 flex-shrink-0"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {t(content.cta, content.ctaEs)}
      </Button>
    </div>
  );
}
