/**
 * NextBestActionCard — Predictive Guidance V3
 * Surfaces the system's best recommendation at decision points.
 * Calm, advisory, non-intrusive. Integrates with Selena via openChat.
 */

import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import {
  predictNextBestAction,
  buildPredictiveContext,
  type PredictionResult,
} from '@/lib/predictiveEngine';
import { logEvent } from '@/lib/analytics/logEvent';
import { motion } from 'framer-motion';
import { useMemo, useCallback } from 'react';

interface NextBestActionCardProps {
  /** Optional override — skip prediction engine and use this directly */
  override?: PredictionResult;
  /** Additional context line (e.g., "After comparing 3 areas…") */
  contextLine?: string;
  contextLineEs?: string;
  className?: string;
}

export default function NextBestActionCard({
  override,
  contextLine,
  contextLineEs,
  className = '',
}: NextBestActionCardProps) {
  const progress = useJourneyProgress();
  const { language } = useLanguage();
  const { openChat } = useSelenaChat();
  const isEs = language === 'es';

  const prediction = useMemo(() => {
    if (override) return override;
    const ctx = buildPredictiveContext(progress);
    return predictNextBestAction(ctx);
  }, [override, progress]);

  const handlePrimaryClick = useCallback(() => {
    logEvent('predicted_action_clicked', {
      action: prediction.action,
      cta: 'primary',
      destination: prediction.primaryCta.destination,
    });
  }, [prediction]);

  const handleSecondaryClick = useCallback(() => {
    logEvent('predicted_action_clicked', {
      action: prediction.action,
      cta: 'secondary',
      destination: prediction.secondaryCta.destination,
    });
  }, [prediction]);

  const handleSelenaOpen = useCallback(
    () => {
      logEvent('selena_predictive_trigger', { action: prediction.action });
      openChat({
        source: 'tool_result_next_step',
        prefillMessage: isEs ? prediction.subtextEs : prediction.subtextEn,
      });
    },
    [prediction, openChat, isEs],
  );

  // Don't show for users who have already booked
  if (progress.hasBooked) return null;

  const renderCtaButton = (
    cta: PredictionResult['primaryCta'],
    variant: 'primary' | 'secondary',
  ) => {
    const isSelena = cta.destination.startsWith('selena:');
    const label = isEs ? cta.labelEs : cta.labelEn;
    const onClick = variant === 'primary' ? handlePrimaryClick : handleSecondaryClick;

    if (isSelena) {
      return (
        <button
          onClick={() => {
            onClick();
            handleSelenaOpen();
          }}
          className={
            variant === 'primary'
              ? 'inline-flex items-center gap-2 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-5 py-2.5 text-sm transition-all active:scale-95'
              : 'inline-flex items-center gap-1.5 text-cc-gold hover:text-cc-gold-dark font-medium text-sm transition-colors'
          }
        >
          <MessageCircle className="w-4 h-4" />
          {label}
        </button>
      );
    }

    return (
      <Link
        to={cta.destination}
        onClick={onClick}
        className={
          variant === 'primary'
            ? 'inline-flex items-center gap-2 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-5 py-2.5 text-sm transition-all active:scale-95'
            : 'inline-flex items-center gap-1.5 text-white/60 hover:text-white/80 font-medium text-sm transition-colors'
        }
      >
        {label}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-cc-navy/80 backdrop-blur-sm ${className}`}
    >
      {/* Subtle accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cc-gold/40 to-transparent" />

      <div className="p-6 sm:p-8">
        {/* Context line */}
        {contextLine && (
          <p className="text-xs uppercase tracking-widest text-cc-gold/70 font-medium mb-3">
            {isEs ? (contextLineEs || contextLine) : contextLine}
          </p>
        )}

        {/* Icon + Headline */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-cc-gold/15 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-cc-gold" />
          </div>
          <h3 className="text-lg sm:text-xl font-serif text-white leading-snug">
            {isEs ? prediction.headlineEs : prediction.headlineEn}
          </h3>
        </div>

        {/* Subtext */}
        <p className="text-sm text-white/50 mb-6 ml-11">
          {isEs ? prediction.subtextEs : prediction.subtextEn}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4 ml-11">
          {renderCtaButton(prediction.primaryCta, 'primary')}
          {renderCtaButton(prediction.secondaryCta, 'secondary')}
        </div>
      </div>
    </motion.div>
  );
}
