/**
 * VIPNextBestAction — VIP-driven next step recommendation.
 * Wraps NextBestActionCard with VIP selectors instead of predictive engine.
 * Shows only for returning/engaged users.
 */

import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { useVIP } from '@/hooks/useVIP';
import { logEvent } from '@/lib/analytics/logEvent';
import { motion } from 'framer-motion';
import { useCallback } from 'react';

interface VIPNextBestActionProps {
  className?: string;
  /** Optional context line above the headline */
  contextLine?: string;
  contextLineEs?: string;
}

export default function VIPNextBestAction({
  className = '',
  contextLine,
  contextLineEs,
}: VIPNextBestActionProps) {
  const { language } = useLanguage();
  const { openChat } = useSelenaChat();
  const { recommendedNextStep, vip, continuationSummary } = useVIP({ localOnly: true });
  const isEs = language === 'es';

  // Don't show for brand-new visitors or users who have already booked
  if (vip.journey.hasBooked || vip.journey.journeyDepth === 'new') return null;

  const step = recommendedNextStep;

  const handleClick = useCallback(() => {
    logEvent('vip_next_action_clicked' as any, {
      type: step.type,
      destination: step.destination,
      priority: step.priority,
      journey_depth: vip.journey.journeyDepth,
    });
  }, [step, vip.journey.journeyDepth]);

  const handleSelenaOpen = useCallback(() => {
    openChat({
      source: 'predictive_guidance',
      prefillMessage: isEs ? step.labelEs : step.labelEn,
    });
  }, [step, openChat, isEs]);

  const isSelenaAction = step.destination.startsWith('selena:');
  const isCapture = step.type === 'capture';

  const label = isEs ? step.labelEs : step.labelEn;
  const summaryText = isEs ? continuationSummary.es : continuationSummary.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-cc-navy/80 backdrop-blur-sm ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cc-gold/40 to-transparent" />

      <div className="p-6 sm:p-8">
        {contextLine && (
          <p className="text-xs uppercase tracking-widest text-cc-gold/70 font-medium mb-3">
            {isEs ? (contextLineEs || contextLine) : contextLine}
          </p>
        )}

        {/* Summary of what the system knows */}
        {continuationSummary.insightsCount > 0 && (
          <p className="text-xs text-white/40 mb-4 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            {summaryText}
          </p>
        )}

        {/* Headline */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-cc-gold/15 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-cc-gold" />
          </div>
          <h3 className="text-lg sm:text-xl font-serif text-white leading-snug">
            {isEs ? 'Tu próximo paso recomendado' : 'Your recommended next step'}
          </h3>
        </div>

        {/* CTA */}
        <div className="ml-11 mt-4">
          {isSelenaAction || isCapture ? (
            <button
              onClick={() => { handleClick(); handleSelenaOpen(); }}
              className="inline-flex items-center gap-2 bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold rounded-full px-5 py-2.5 text-sm transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              {label}
            </button>
          ) : (
            <Link
              to={step.destination}
              onClick={handleClick}
              className="inline-flex items-center gap-2 bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold rounded-full px-5 py-2.5 text-sm transition-all active:scale-95"
            >
              {label}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
