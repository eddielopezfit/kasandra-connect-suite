/**
 * Contextual Selena Prompt
 * Stage-aware prompt with personalized summary offer
 */

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Sparkles, FileText, ArrowRight } from 'lucide-react';
import { getSelenaPromptForStage, type CognitiveStageId } from '@/hooks/useCognitiveStage';

interface ContextualSelenaPromptProps {
  stageId: CognitiveStageId;
  guidesReadCount: number;
  onAskSelena: (prefillMessage?: string) => void;
  onRequestSummary: () => void;
  variant?: 'inline' | 'floating' | 'compact';
  className?: string;
}

export function ContextualSelenaPrompt({
  stageId,
  guidesReadCount,
  onAskSelena,
  onRequestSummary,
  variant = 'inline',
  className,
}: ContextualSelenaPromptProps) {
  const { t, language } = useLanguage();
  const { promptEn, promptEs, showSummaryOffer } = getSelenaPromptForStage(stageId, guidesReadCount);

  const handleSummaryClick = () => {
    // Log event first
    onRequestSummary();
    // Send prefilled message to Selena
    const prefill = language === 'es'
      ? 'Me gustaría un resumen personalizado de lo que he leído hasta ahora.'
      : 'I\'d like a personalized summary of what I\'ve read so far.';
    onAskSelena(prefill);
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Button
          onClick={() => onAskSelena()}
          size="sm"
          className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-medium rounded-full"
        >
          <Sparkles className="w-4 h-4 mr-1" />
          {t('Ask Selena', 'Pregunta a Selena')}
        </Button>
        <span className="text-sm text-cc-slate hidden md:inline">
          {t(promptEn, promptEs)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl p-6 border',
        variant === 'floating'
          ? 'bg-gradient-to-r from-cc-navy/5 to-cc-gold/5 border-cc-sand-dark/50'
          : 'bg-white border-cc-sand-dark/50',
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
            {t(promptEn, promptEs)}
          </h3>
          {showSummaryOffer && (
            <p className="text-sm text-cc-slate">
              {t(
                `You've read ${guidesReadCount} guides. Want me to summarize what matters most?`,
                `Has leído ${guidesReadCount} guías. ¿Quieres que resuma lo más importante?`
              )}
            </p>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          {showSummaryOffer && (
            <Button
              onClick={handleSummaryClick}
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-medium rounded-full px-5"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t('Get My Summary', 'Obtener Mi Resumen')}
            </Button>
          )}
          <Button
            onClick={() => onAskSelena()}
            variant={showSummaryOffer ? 'outline' : 'default'}
            className={cn(
              'rounded-full px-5',
              showSummaryOffer
                ? 'border-cc-sand-dark hover:bg-cc-sand/50'
                : 'bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-medium'
            )}
          >
            {!showSummaryOffer && <Sparkles className="w-4 h-4 mr-2" />}
            {showSummaryOffer
              ? t('Ask Something Else', 'Pregunta Otra Cosa')
              : t('Ask Selena', 'Pregunta a Selena')
            }
            {showSummaryOffer && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
