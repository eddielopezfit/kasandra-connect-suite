/**
 * CashOfferProgressBar - 4-stage progress indicator for the calculator
 * Tracks user's psychological journey: Exploring → Calculating → Comparing → Deciding
 */

import { useLanguage } from "@/contexts/LanguageContext";

export type CalculatorStage = 0 | 1 | 2 | 3;

interface CashOfferProgressBarProps {
  currentStage: CalculatorStage;
}

const stages = [
  { en: 'Exploring', es: 'Explorando' },
  { en: 'Calculating', es: 'Calculando' },
  { en: 'Comparing', es: 'Comparando' },
  { en: 'Deciding', es: 'Decidiendo' },
];

const CashOfferProgressBar = ({ currentStage }: CashOfferProgressBarProps) => {
  const { language } = useLanguage();

  return (
    <div className="w-full">
      {/* Counter */}
      <div className="flex justify-end mb-1.5">
        <span className="text-xs text-cc-slate font-medium">
          {currentStage + 1} / {stages.length}
        </span>
      </div>

      {/* Progress bar segments */}
      <div className="flex gap-1.5 mb-2">
        {stages.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              index <= currentStage
                ? 'bg-cc-gold'
                : 'bg-cc-sand-dark/50'
            }`}
          />
        ))}
      </div>

      {/* All 4 stage labels */}
      <div className="grid grid-cols-4 gap-1.5">
        {stages.map((stage, index) => (
          <span
            key={index}
            className={`text-[12px] tracking-wider uppercase text-center transition-colors duration-300 ${
              index <= currentStage
                ? 'text-cc-gold font-semibold'
                : 'text-cc-slate/60'
            }`}
          >
            {language === 'en' ? stage.en : stage.es}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CashOfferProgressBar;
