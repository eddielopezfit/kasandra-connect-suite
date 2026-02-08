/**
 * Cognitive Progress Bar
 * Pure progress indicator - NO Selena CTAs (per P0.3 consolidation)
 * 
 * Progress is context, not conversion.
 * Human-centered labels, not system terminology.
 */

import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { COGNITIVE_STAGES, type CognitiveStage } from '@/hooks/useCognitiveStage';

interface CognitiveProgressBarProps {
  stage: CognitiveStage;
  isVisible: boolean;
  className?: string;
}

// Human-centered affirmations (not gamification)
const AFFIRMATIONS: Record<number, { en: string; es: string }> = {
  2: {
    en: "You're making progress. Take your time.",
    es: "Estás avanzando. Tómate tu tiempo.",
  },
  3: {
    en: "You're building a clear picture. That's the goal.",
    es: "Estás formando una imagen clara. Ese es el objetivo.",
  },
  4: {
    en: "You know more than when you started. Trust that.",
    es: "Sabes más que cuando empezaste. Confía en eso.",
  },
  5: {
    en: "When you're ready, support is here. No rush.",
    es: "Cuando estés listo, el apoyo está aquí. Sin prisa.",
  },
  6: {
    en: "You're ready to take confident action.",
    es: "Estás listo para actuar con confianza.",
  },
};

export function CognitiveProgressBar({
  stage,
  isVisible,
  className,
}: CognitiveProgressBarProps) {
  const { t } = useLanguage();

  // Don't render if not visible
  if (!isVisible) return null;

  const affirmation = AFFIRMATIONS[stage.level] || AFFIRMATIONS[2];

  return (
    <section className={cn('bg-white py-4 border-b border-cc-sand-dark', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Compact layout: Progress + Stage + Affirmation in one row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            {/* Progress Segments */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {COGNITIVE_STAGES.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    'h-2 rounded-full transition-all duration-500',
                    s.level === 1 ? 'w-4' : 'w-6',
                    s.level <= stage.level
                      ? stage.level >= 5
                        ? 'bg-cc-gold'
                        : 'bg-cc-navy'
                      : 'bg-cc-sand-dark/50'
                  )}
                  title={t(s.labelEn, s.labelEs)}
                />
              ))}
            </div>

            {/* Stage Label */}
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium flex-shrink-0',
                stage.level >= 5
                  ? 'bg-cc-gold/20 text-cc-gold-dark'
                  : 'bg-cc-navy/10 text-cc-navy'
              )}
            >
              {t(stage.labelEn, stage.labelEs)}
            </span>

            {/* Affirmation - hidden on mobile for space */}
            <p className="text-sm text-cc-slate hidden sm:block">
              {t(affirmation.en, affirmation.es)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
