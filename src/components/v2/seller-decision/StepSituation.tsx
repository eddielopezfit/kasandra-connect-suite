import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export type Situation = 'inherited' | 'relocating' | 'downsizing' | 'divorce' | 'tired_landlord' | 'exploring';
export type Timeline = 'exploring' | 'soon' | 'considering';
export type GoalPriority = 'speed' | 'price' | 'least_stress' | 'privacy' | 'not_sure';

interface StepSituationProps {
  initialData?: { situation?: Situation; timeline?: Timeline; goalPriority?: GoalPriority };
  onNext: (data: { situation: Situation; timeline: Timeline; goalPriority: GoalPriority }) => void;
}

const StepSituation = ({ initialData, onNext }: StepSituationProps) => {
  const { t } = useLanguage();
  const [situation, setSituation] = useState<Situation | undefined>(initialData?.situation);
  const [timeline, setTimeline] = useState<Timeline | undefined>(initialData?.timeline);
  const [goalPriority, setGoalPriority] = useState<GoalPriority | undefined>(initialData?.goalPriority);

  const canProceed = situation && timeline && goalPriority;

  const chipClass = (selected: boolean) =>
    `px-4 py-2.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
      selected
        ? 'bg-cc-navy text-white border-cc-navy shadow-soft'
        : 'bg-white text-cc-charcoal border-cc-sand-dark/40 hover:border-cc-navy/40'
    }`;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-2">
          {t("What's your situation?", "¿Cuál es su situación?")}
        </h2>
        <p className="text-cc-text-muted text-sm">
          {t("This helps us tailor your options.", "Esto nos ayuda a personalizar sus opciones.")}
        </p>
      </div>

      {/* Situation */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
          {t("My situation", "Mi situación")}
        </label>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'inherited' as Situation, en: 'Inherited Property', es: 'Propiedad Heredada' },
            { value: 'relocating' as Situation, en: 'Relocating', es: 'Reubicándome' },
            { value: 'downsizing' as Situation, en: 'Downsizing', es: 'Reduciendo Espacio' },
            { value: 'divorce' as Situation, en: 'Life Change / Divorce', es: 'Cambio de Vida / Divorcio' },
            { value: 'tired_landlord' as Situation, en: 'Tired Landlord', es: 'Cansado de Ser Propietario' },
            { value: 'exploring' as Situation, en: 'Just Exploring', es: 'Solo Explorando' },
          ]).map(opt => (
            <button key={opt.value} className={chipClass(situation === opt.value)} onClick={() => setSituation(opt.value)}>
              {t(opt.en, opt.es)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
          {t("When are you thinking?", "¿Cuándo está pensando?")}
        </label>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'exploring' as Timeline, en: 'Just Exploring', es: 'Solo Explorando' },
            { value: 'soon' as Timeline, en: 'Within 30 Days', es: 'Dentro de 30 Días' },
            { value: 'considering' as Timeline, en: 'Already Considering', es: 'Ya Considerando' },
          ]).map(opt => (
            <button key={opt.value} className={chipClass(timeline === opt.value)} onClick={() => setTimeline(opt.value)}>
              {t(opt.en, opt.es)}
            </button>
          ))}
        </div>
      </div>

      {/* Goal Priority */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
          {t("What matters most?", "¿Qué importa más?")}
        </label>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'speed' as GoalPriority, en: 'Speed', es: 'Rapidez' },
            { value: 'price' as GoalPriority, en: 'Best Price', es: 'Mejor Precio' },
            { value: 'least_stress' as GoalPriority, en: 'Least Stress', es: 'Menos Estrés' },
            { value: 'privacy' as GoalPriority, en: 'Privacy', es: 'Privacidad' },
            { value: 'not_sure' as GoalPriority, en: 'Not Sure Yet', es: 'No Estoy Seguro/a' },
          ]).map(opt => (
            <button key={opt.value} className={chipClass(goalPriority === opt.value)} onClick={() => setGoalPriority(opt.value)}>
              {t(opt.en, opt.es)}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => canProceed && onNext({ situation: situation!, timeline: timeline!, goalPriority: goalPriority! })}
        disabled={!canProceed}
        className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
      >
        {t("Continue", "Continuar")}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default StepSituation;
