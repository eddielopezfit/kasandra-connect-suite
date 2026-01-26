/**
 * Cognitive Progress Bar
 * Actionable progress indicator with stage explanations
 */

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { COGNITIVE_STAGES, type CognitiveStage } from '@/hooks/useCognitiveStage';
import { Sparkles, ArrowRight, Calendar, BookOpen } from 'lucide-react';

interface CognitiveProgressBarProps {
  stage: CognitiveStage;
  isVisible: boolean;
  onCtaClick: () => void;
  onAskSelena: () => void;
  className?: string;
}

export function CognitiveProgressBar({
  stage,
  isVisible,
  onCtaClick,
  onAskSelena,
  className,
}: CognitiveProgressBarProps) {
  const { t } = useLanguage();

  // Don't render if not visible
  if (!isVisible) return null;

  const getCtaIcon = () => {
    switch (stage.ctaAction) {
      case 'book':
        return <Calendar className="w-4 h-4 mr-2" />;
      case 'selena':
        return <Sparkles className="w-4 h-4 mr-2" />;
      case 'continue':
        return <ArrowRight className="w-4 h-4 mr-2" />;
      default:
        return <BookOpen className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <section className={cn('bg-white py-6 border-b border-cc-sand-dark', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Progress Segments */}
          <div className="flex items-center gap-1.5 mb-4 justify-center">
            {COGNITIVE_STAGES.map((s) => (
              <div
                key={s.id}
                className={cn(
                  'h-2 rounded-full transition-all duration-500',
                  s.level === 1 ? 'w-6' : 'w-10',
                  s.level <= stage.level
                    ? stage.level >= 5
                      ? 'bg-cc-gold' // Gold for high stages
                      : 'bg-cc-navy' // Navy for earlier stages
                    : 'bg-cc-sand-dark/50'
                )}
                title={t(s.labelEn, s.labelEs)}
              />
            ))}
          </div>

          {/* Stage Info */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  stage.level >= 5
                    ? 'bg-cc-gold/20 text-cc-gold-dark'
                    : 'bg-cc-navy/10 text-cc-navy'
                )}
              >
                {t(stage.labelEn, stage.labelEs)}
              </span>
            </div>
            <p className="text-sm text-cc-slate">
              {t(stage.descriptionEn, stage.descriptionEs)}
            </p>
          </div>

          {/* Microcopy */}
          <p className="text-center text-sm text-cc-charcoal mb-4">
            {t(stage.microcopyEn, stage.microcopyEs)}
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3">
            {stage.ctaAction === 'selena' ? (
              <Button
                onClick={onAskSelena}
                className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-medium rounded-full px-6"
              >
                {getCtaIcon()}
                {t(stage.ctaLabelEn, stage.ctaLabelEs)}
              </Button>
            ) : (
              <Button
                onClick={onCtaClick}
                className={cn(
                  'font-medium rounded-full px-6',
                  stage.level >= 5
                    ? 'bg-cc-gold hover:bg-cc-gold-dark text-cc-navy'
                    : 'bg-cc-navy hover:bg-cc-navy-dark text-white'
                )}
              >
                {getCtaIcon()}
                {t(stage.ctaLabelEn, stage.ctaLabelEs)}
              </Button>
            )}

            {/* Secondary: Ask Selena (only if primary CTA isn't already Selena) */}
            {stage.ctaAction !== 'selena' && stage.level < 5 && (
              <Button
                onClick={onAskSelena}
                variant="outline"
                className="border-cc-sand-dark hover:bg-cc-sand/50 rounded-full px-6"
              >
                <Sparkles className="w-4 h-4 mr-2 text-cc-gold" />
                {t('Ask Selena', 'Pregunta a Selena')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
