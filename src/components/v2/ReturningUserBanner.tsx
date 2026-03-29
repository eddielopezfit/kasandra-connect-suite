/**
 * ReturningUserBanner — continuation banner for returning visitors.
 * "Welcome back — continue where you left off"
 */

import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVIPContext } from '@/contexts/VIPContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReturningUserBanner({ className = '' }: { className?: string }) {
  const { language } = useLanguage();
  const { vip, continuationSummary, recommendedNextStep } = useVIPContext();
  const isEs = language === 'es';

  // Only show for returning users with real engagement
  if (!vip.identity.isReturning || vip.journey.journeyDepth === 'new') return null;
  if (vip.journey.hasBooked) return null;

  const name = vip.identity.name;
  const headline = name
    ? isEs ? `Bienvenido/a de nuevo, ${name}` : `Welcome back, ${name}`
    : isEs ? 'Bienvenido/a de nuevo' : 'Welcome back';

  const subtitle = continuationSummary.insightsCount > 0
    ? (isEs ? continuationSummary.es : continuationSummary.en)
    : isEs ? 'Continúa donde lo dejaste.' : 'Continue where you left off.';

  const step = recommendedNextStep;
  const isSelenaAction = step.destination.startsWith('selena:');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={`bg-gradient-to-r from-cc-navy via-cc-navy-dark to-cc-navy border-b border-cc-gold/20 ${className}`}
      >
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-cc-gold shrink-0" />
              <div className="min-w-0">
                <span className="text-white font-semibold text-sm">{headline}</span>
                <span className="text-white/50 text-xs ml-2 hidden sm:inline">{subtitle}</span>
              </div>
            </div>
            {!isSelenaAction && (
              <Link
                to={step.destination}
                className="inline-flex items-center gap-1.5 text-cc-gold hover:text-cc-gold/80 text-xs font-medium transition-colors shrink-0"
              >
                {isEs ? step.labelEs : step.labelEn}
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
