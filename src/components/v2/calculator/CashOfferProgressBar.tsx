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

      {/* Stage label */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-cc-slate">
          {language === 'en' ? stages[currentStage].en : stages[currentStage].es}
        </span>
        <span className="text-xs text-cc-slate">
          {currentStage + 1} / {stages.length}
        </span>
      </div>
    </div>
  );
};

export default CashOfferProgressBar;
