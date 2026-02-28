/**
 * SelenaGuideHandoff - Guide-Aware Selena Prompt
 * 
 * A subtle handoff block after the CTA that opens the existing Selena drawer.
 * Uses the same openChat mechanism from SelenaChatContext.
 * 
 * Tone: Calm, supportive, no-pressure
 */

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { logEvent } from '@/lib/analytics/logEvent';
import { getGuideById, type GuideCategory } from '@/lib/guides/guideRegistry';

interface SelenaGuideHandoffProps {
  guideId: string;
  category: GuideCategory;
}

// Category-specific handoff copy
const HANDOFF_COPY: Record<GuideCategory, { en: string; es: string }> = {
  buying: {
    en: "If anything here raised a question, I can help you think it through. Or, if you're ready, I can help you book time with Kasandra.",
    es: "Si algo aquí le generó una pregunta, puedo ayudarle a pensarlo. O, si ya está listo(a), puedo ayudarle a reservar tiempo con Kasandra.",
  },
  selling: {
    en: "Thinking about your situation? I'm here to help you understand your options, no pressure, just clarity.",
    es: "¿Pensando en su situación? Estoy aquí para ayudarle a entender sus opciones, sin presión, solo claridad.",
  },
  valuation: {
    en: "Thinking about your situation? I'm here to help you understand your options, no pressure, just clarity.",
    es: "¿Pensando en su situación? Estoy aquí para ayudarle a entender sus opciones, sin presión, solo claridad.",
  },
  cash: {
    en: "Cash offers are situational. If you want to talk through whether this path makes sense for you, I'm here.",
    es: "Las ofertas en efectivo dependen de la situación. Si quiere conversar sobre si este camino tiene sentido para usted, aquí estoy.",
  },
  stories: {
    en: "Still thinking? That's okay. I'm here whenever you're ready to talk.",
    es: "¿Aún pensándolo? Está bien. Estoy aquí cuando usted esté listo(a) para conversar.",
  },
  probate: {
    en: "Navigating an inherited property is personal. If you'd like to talk through your specific situation, I'm here — no rush, no pressure.",
    es: "Navegar una propiedad heredada es personal. Si desea conversar sobre su situación específica, estoy aquí — sin prisa, sin presión.",
  },
  divorce: {
    en: "These decisions are never easy. If you'd like a calm conversation about your options, I'm here.",
    es: "Estas decisiones nunca son fáciles. Si desea una conversación tranquila sobre sus opciones, estoy aquí.",
  },
  distressed: {
    en: "Every property situation has options. I can help you understand yours whenever you're ready.",
    es: "Cada situación de propiedad tiene opciones. Puedo ayudarle a entender las suyas cuando esté listo(a).",
  },
  military: {
    en: "Transitions are complex. I can help you understand the programs and options available to you.",
    es: "Las transiciones son complejas. Puedo ayudarle a entender los programas y opciones disponibles para usted.",
  },
  senior: {
    en: "Planning your next chapter takes time. I'm here whenever you'd like to explore what's possible.",
    es: "Planificar su próximo capítulo toma tiempo. Estoy aquí cuando desee explorar lo que es posible.",
  },
};

const SelenaGuideHandoff = React.forwardRef<HTMLElement, SelenaGuideHandoffProps>(({ guideId, category }, ref) => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  
  const copy = HANDOFF_COPY[category];

  const handleClick = () => {
    // Resolve guide title from registry
    const entry = getGuideById(guideId);
    const resolvedTitle = entry ? (language === 'es' ? entry.titleEs : entry.titleEn) : undefined;
    
    logEvent('guide_cta_clicked', {
      guideId,
      cta_id: `handoff_${category}`,
      category,
    });
    // Pass full guide context for context-aware greeting
    openChat({
      source: 'guide_handoff',
      guideId,
      guideTitle: resolvedTitle,
      guideCategory: category,
    });
  };

  return (
    <section ref={ref} className="bg-cc-navy/95 py-8 border-t border-white/10">
      <div className="container mx-auto px-4">
        <button
          onClick={handleClick}
          className="max-w-xl mx-auto flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-left w-full group"
        >
          {/* Selena Avatar */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cc-gold/20 flex items-center justify-center group-hover:bg-cc-gold/30 transition-colors">
            <MessageCircle className="w-6 h-6 text-cc-gold" />
          </div>
          
          {/* Copy */}
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">
              {t("Selena, Digital Concierge", "Selena, Concierge Digital")}
            </p>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              {t(copy.en, copy.es)}
            </p>
          </div>
        </button>
      </div>
      </section>
    );
});

SelenaGuideHandoff.displayName = 'SelenaGuideHandoff';

export default SelenaGuideHandoff;
