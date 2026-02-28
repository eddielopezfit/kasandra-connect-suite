import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Info } from "lucide-react";
import { conditionInsights, conditionTierOrder, type ConditionTier } from "./conditionInsights";

interface StepConditionProps {
  initialCondition?: ConditionTier;
  onNext: (condition: ConditionTier) => void;
  onBack: () => void;
}

const StepCondition = ({ initialCondition, onNext, onBack }: StepConditionProps) => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<ConditionTier | undefined>(initialCondition);

  const insight = selected ? conditionInsights[selected] : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-2">
          {t("How would you describe your home's condition?", "¿Cómo describiría la condición de su casa?")}
        </h2>
        <p className="text-cc-text-muted text-sm">
          {t("Be honest — this helps us recommend the right path.", "Sea honesto/a — esto nos ayuda a recomendar el camino correcto.")}
        </p>
      </div>

      {/* Condition chips */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {conditionTierOrder.map(tier => {
            const ci = conditionInsights[tier];
            const isSelected = selected === tier;
            return (
              <button
                key={tier}
                onClick={() => setSelected(tier)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cc-navy text-white border-cc-navy shadow-soft'
                    : 'bg-white text-cc-charcoal border-cc-sand-dark/40 hover:border-cc-navy/40'
                }`}
              >
                {t(ci.labelEn, ci.labelEs)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interpretation panel */}
      {insight && (
        <div className="bg-white rounded-xl border border-cc-sand-dark/30 p-6 space-y-4 shadow-soft animate-fade-in">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif text-lg font-bold text-cc-navy">
                {t(insight.labelEn, insight.labelEs)}
              </h3>
              <p className="text-sm text-cc-charcoal mt-1">
                {t(insight.descriptionEn, insight.descriptionEs)}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-cc-sand-dark/20">
            <div>
              <span className="text-xs font-semibold text-cc-navy uppercase tracking-wider">
                {t("Likely Buyers", "Compradores Probables")}
              </span>
              <p className="text-sm text-cc-charcoal mt-1">
                {t(insight.buyerTypeEn, insight.buyerTypeEs)}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-cc-navy uppercase tracking-wider">
                {t("Expected Timeline", "Plazo Esperado")}
              </span>
              <p className="text-sm text-cc-charcoal mt-1">
                {t(insight.speedEn, insight.speedEs)}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-cc-navy uppercase tracking-wider">
                {t("Preparation", "Preparación")}
              </span>
              <p className="text-sm text-cc-charcoal mt-1">
                {t(insight.prepEn, insight.prepEs)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="text-cc-text-muted rounded-full">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("Back", "Atrás")}
        </Button>
        <Button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
        >
          {t("Continue", "Continuar")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepCondition;
