/**
 * JourneyMomentum — Dynamic progress visualization (Predictive Guidance V3)
 * Shows completed steps + next recommended action with subtle motion.
 * Invisible to new visitors. Updates in real-time.
 */

import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { motion, AnimatePresence } from 'framer-motion';

interface MilestoneItem {
  labelEn: string;
  labelEs: string;
  done: boolean;
}

export default function JourneyMomentum({ className = '' }: { className?: string }) {
  const progress = useJourneyProgress();
  const { language } = useLanguage();
  const { openChat } = useSelenaChat();
  const isEs = language === 'es';

  // Only show for returning users
  if (!progress.isReturningUser) return null;

  // Build milestones dynamically
  const milestones: MilestoneItem[] = [];

  if (progress.hasExploredNeighborhood) {
    milestones.push({ labelEn: 'Explored Areas', labelEs: 'Áreas Exploradas', done: true });
  }

  if (progress.guideCount > 0) {
    milestones.push({
      labelEn: `${progress.guideCount} Guide${progress.guideCount > 1 ? 's' : ''} Read`,
      labelEs: `${progress.guideCount} Guía${progress.guideCount > 1 ? 's' : ''} Leída${progress.guideCount > 1 ? 's' : ''}`,
      done: true,
    });
  }

  if (progress.toolCount > 0) {
    milestones.push({
      labelEn: `${progress.toolCount} Tool${progress.toolCount > 1 ? 's' : ''} Completed`,
      labelEs: `${progress.toolCount} Herramienta${progress.toolCount > 1 ? 's' : ''} Completada${progress.toolCount > 1 ? 's' : ''}`,
      done: true,
    });
  }

  if (progress.hasReadinessScore) {
    milestones.push({
      labelEn: `Readiness Score: ${progress.readinessScore}`,
      labelEs: `Puntuación: ${progress.readinessScore}`,
      done: true,
    });
  }

  if (progress.hasSellerDecision) {
    milestones.push({ labelEn: 'Seller Decision Complete', labelEs: 'Decisión de Venta Completa', done: true });
  }

  // Only render if there's at least one milestone
  if (milestones.length === 0) return null;

  // Next step
  const next = progress.nextRecommendedAction;
  const isChat = next.destination.startsWith('selena:');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl border border-white/10 bg-cc-navy-dark/60 backdrop-blur-sm p-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-cc-gold" />
        <span className="text-xs uppercase tracking-widest text-cc-gold/80 font-semibold">
          {isEs ? 'Tu Camino Hasta Ahora' : 'Your Journey So Far'}
        </span>
      </div>

      {/* Milestones */}
      <div className="space-y-2 mb-4">
        <AnimatePresence>
          {milestones.map((m, i) => (
            <motion.div
              key={m.labelEn}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-cc-gold/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-cc-gold" />
              </div>
              <span className="text-sm text-white/70">
                {isEs ? m.labelEs : m.labelEn}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Next step divider */}
      <div className="border-t border-white/10 pt-3">
        <p className="text-xs text-white/40 mb-2">
          {isEs ? '→ Próximo paso recomendado:' : '→ Recommended next:'}
        </p>
        {isChat ? (
          <button
            onClick={() =>
              openChat({
                source: 'journey_breadcrumb',
                prefillMessage: isEs ? next.labelEs : next.labelEn,
              })
            }
            className="inline-flex items-center gap-1.5 text-cc-gold hover:text-cc-gold-dark font-medium text-sm transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {isEs ? next.labelEs : next.labelEn}
          </button>
        ) : (
          <Link
            to={next.destination}
            className="inline-flex items-center gap-1.5 text-cc-gold hover:text-cc-gold-dark font-medium text-sm transition-colors"
          >
            {isEs ? next.labelEs : next.labelEn}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
