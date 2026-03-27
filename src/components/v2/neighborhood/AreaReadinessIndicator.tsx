import { useLanguage } from '@/contexts/LanguageContext';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { motion } from 'framer-motion';

const stages = [
  { depth: 'new' as const, en: 'Early Exploration', es: 'Exploración Inicial', dot: false },
  { depth: 'exploring' as const, en: 'Getting Clarity', es: 'Obteniendo Claridad', dot: false },
  { depth: 'engaged' as const, en: 'Actively Planning', es: 'Planificando Activamente', dot: true },
  { depth: 'ready' as const, en: 'Ready to Move', es: 'Listo/a para Actuar', dot: true },
];

const AreaReadinessIndicator = () => {
  const { t } = useLanguage();
  const { journeyDepth, isReturningUser } = useJourneyProgress();

  // Only show for returning users
  if (!isReturningUser) return null;

  const currentIndex = stages.findIndex(s => s.depth === journeyDepth);
  const current = stages[currentIndex] || stages[0];

  return (
    <motion.div
      className="flex items-center gap-3 bg-cc-navy/5 rounded-full px-5 py-2.5 mx-auto w-fit"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
    >
      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {stages.map((stage, i) => (
          <div
            key={stage.depth}
            className={`rounded-full transition-all duration-500 ${
              i <= currentIndex
                ? i === currentIndex && current.dot
                  ? 'w-2.5 h-2.5 bg-cc-gold'
                  : 'w-2 h-2 bg-cc-navy/40'
                : 'w-1.5 h-1.5 bg-cc-navy/15'
            }`}
          />
        ))}
      </div>

      <span className="text-xs font-medium text-cc-navy/70 whitespace-nowrap">
        {t(current.en, current.es)}
      </span>
    </motion.div>
  );
};

export default AreaReadinessIndicator;
