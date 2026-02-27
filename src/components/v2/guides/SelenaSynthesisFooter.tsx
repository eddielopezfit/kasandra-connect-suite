/**
 * Selena Synthesis Footer
 * 
 * Post-grid Selena entry point with gated CTAs:
 * - "Summarize what I've learned" → only if guidesReadCount >= 3
 * - "Ask a question" → always available
 * 
 * This is the "Selena as interpreter" layer, not "Selena as CTA spam" layer.
 */

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Sparkles, FileText, MessageCircle } from 'lucide-react';

interface SelenaSynthesisFooterProps {
  guidesReadCount: number;
  onAskSelena: (prefillMessage?: string) => void;
  onRequestSummary: () => void;
  className?: string;
}

export function SelenaSynthesisFooter({
  guidesReadCount,
  onAskSelena,
  onRequestSummary,
  className,
}: SelenaSynthesisFooterProps) {
  const { t, language } = useLanguage();
  
  // Gate: Summary only available after 3+ guides read
  const showSummary = guidesReadCount >= 3;
  
  const handleSummaryClick = () => {
    onRequestSummary();
    const prefill = language === 'es'
      ? 'Resúmeme lo más importante de lo que he leído.'
      : 'Summarize what I\'ve learned so far.';
    onAskSelena(prefill);
  };
  
  const handleQuestionClick = () => {
    onAskSelena();
  };
  
  return (
    <div
      className={cn(
        'rounded-xl p-6 border bg-gradient-to-r from-cc-navy/5 to-cc-gold/5 border-cc-sand-dark/50',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-cc-gold/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-7 h-7 text-cc-gold" />
        </div>

        {/* Text */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-medium text-cc-navy mb-1">
            {showSummary
              ? t(
                   "Ready for your next step?",
                   "¿Listo para tu siguiente paso?"
                 )
              : t(
                  "Not sure which guide fits?",
                  "¿No sabes cuál guía te conviene?"
                )
            }
          </h3>
          <p className="text-sm text-cc-slate">
            {showSummary
              ? t(
                  `You've read ${guidesReadCount} guides. I can summarize what matters most to your situation.`,
                  `Has leído ${guidesReadCount} guías. Puedo resumirte lo más importante para tu situación.`
                )
              : t(
                  "I can help you find the right starting point.",
                  "Puedo ayudarte a encontrar el punto de partida correcto."
                )
            }
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          {showSummary && (
            <Button
              onClick={handleSummaryClick}
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-medium rounded-full px-5"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t('Get My Summary', 'Obtener Mi Resumen')}
            </Button>
          )}
          <Button
            onClick={handleQuestionClick}
            variant={showSummary ? 'outline' : 'default'}
            className={cn(
              'rounded-full px-5',
              showSummary
                ? 'border-cc-sand-dark hover:bg-cc-sand/50'
                : 'bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-medium'
            )}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t('Ask a question', 'Hacer una pregunta')}
          </Button>
        </div>
      </div>
    </div>
  );
}
