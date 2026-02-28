import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Waves, Car } from "lucide-react";

export type BedsCount = '1' | '2' | '3' | '4' | '5+';
export type BathsCount = '1' | '1.5' | '2' | '3+';
export type SqftRange = 'under_1000' | '1000_1500' | '1500_2000' | '2000_3000' | 'over_3000';
export type HomeEra = 'pre_1990' | 'post_1990' | 'not_sure';

export interface PropertySnapshotData {
  beds?: BedsCount;
  baths?: BathsCount;
  sqft?: SqftRange;
  homeEra?: HomeEra;
  hasPool?: boolean;
  hasGarage?: boolean;
  zip?: string;
}

interface StepPropertySnapshotProps {
  initialData?: PropertySnapshotData;
  onNext: (data: PropertySnapshotData) => void;
  onBack: () => void;
}

const StepPropertySnapshot = ({ initialData, onNext, onBack }: StepPropertySnapshotProps) => {
  const { t } = useLanguage();
  const [data, setData] = useState<PropertySnapshotData>(initialData || {});

  const update = <K extends keyof PropertySnapshotData>(key: K, value: PropertySnapshotData[K]) =>
    setData(prev => ({ ...prev, [key]: value }));

  const canProceed = data.beds && data.baths;

  const chipClass = (selected: boolean) =>
    `px-4 py-2.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
      selected
        ? 'bg-cc-navy text-white border-cc-navy shadow-soft'
        : 'bg-white text-cc-charcoal border-cc-sand-dark/40 hover:border-cc-navy/40'
    }`;

  const toggleClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
      active
        ? 'bg-cc-gold/20 text-cc-navy border-cc-gold font-semibold'
        : 'bg-white text-cc-charcoal border-cc-sand-dark/40 hover:border-cc-navy/40'
    }`;

  const zipIsValid = !data.zip || data.zip.length === 0 || data.zip.length === 5;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-2">
          {t("Tell us about your property", "Cuéntenos sobre su propiedad")}
        </h2>
        <p className="text-cc-text-muted text-sm">
          {t("A quick snapshot helps us compare your options.", "Una vista rápida nos ayuda a comparar sus opciones.")}
        </p>
      </div>

      {/* Beds */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
          {t("Bedrooms", "Habitaciones")}
        </label>
        <div className="flex flex-wrap gap-2">
          {(['1', '2', '3', '4', '5+'] as BedsCount[]).map(v => (
            <button key={v} className={chipClass(data.beds === v)} onClick={() => update('beds', v)}>{v}</button>
          ))}
        </div>
      </div>

      {/* Baths */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
          {t("Bathrooms", "Baños")}
        </label>
        <div className="flex flex-wrap gap-2">
          {(['1', '1.5', '2', '3+'] as BathsCount[]).map(v => (
            <button key={v} className={chipClass(data.baths === v)} onClick={() => update('baths', v)}>{v}</button>
          ))}
        </div>
      </div>

      {/* Sqft */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
          {t("Approximate Size", "Tamaño Aproximado")}
        </label>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'under_1000' as SqftRange, label: '< 1,000 sqft' },
            { value: '1000_1500' as SqftRange, label: '1,000–1,500' },
            { value: '1500_2000' as SqftRange, label: '1,500–2,000' },
            { value: '2000_3000' as SqftRange, label: '2,000–3,000' },
            { value: 'over_3000' as SqftRange, label: '3,000+' },
          ]).map(opt => (
            <button key={opt.value} className={chipClass(data.sqft === opt.value)} onClick={() => update('sqft', opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Home Era */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
          {t("When was it built?", "¿Cuándo se construyó?")}
        </label>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'pre_1990' as HomeEra, en: 'Before 1990', es: 'Antes de 1990' },
            { value: 'post_1990' as HomeEra, en: 'After 1990', es: 'Después de 1990' },
            { value: 'not_sure' as HomeEra, en: 'Not Sure', es: 'No Estoy Seguro/a' },
          ]).map(opt => (
            <button key={opt.value} className={chipClass(data.homeEra === opt.value)} onClick={() => update('homeEra', opt.value)}>
              {t(opt.en, opt.es)}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles: Pool + Garage (Lucide icons, no emojis) */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
          {t("Features", "Características")}
        </label>
        <div className="flex flex-wrap gap-2">
          <button className={toggleClass(!!data.hasPool)} onClick={() => update('hasPool', !data.hasPool)}>
            <Waves className="w-4 h-4" />
            {t("Pool", "Piscina")}
          </button>
          <button className={toggleClass(!!data.hasGarage)} onClick={() => update('hasGarage', !data.hasGarage)}>
            <Car className="w-4 h-4" />
            {t("Garage", "Garaje")}
          </button>
        </div>
      </div>

      {/* ZIP (optional) with helper text */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
          {t("ZIP Code (optional)", "Código Postal (opcional)")}
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="85701"
          value={data.zip || ''}
          onChange={e => update('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
          className={`w-32 px-4 py-2.5 rounded-full border text-base md:text-sm text-cc-charcoal focus:outline-none transition-colors ${
            data.zip && data.zip.length > 0 && data.zip.length < 5
              ? 'border-destructive/50 focus:border-destructive'
              : 'border-cc-sand-dark/40 focus:border-cc-navy/40'
          }`}
        />
        <p className="text-xs text-cc-text-muted">
          {data.zip && data.zip.length > 0 && data.zip.length < 5
            ? t("Enter 5 digits or clear the field.", "Ingrese 5 dígitos o borre el campo.")
            : t("Optional — helps us add neighborhood context.", "Opcional — nos ayuda a agregar contexto del vecindario.")
          }
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="text-cc-text-muted rounded-full">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("Back", "Atrás")}
        </Button>
        <Button
          onClick={() => canProceed && onNext(data)}
          disabled={!canProceed || !zipIsValid}
          className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
        >
          {t("Continue", "Continuar")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepPropertySnapshot;
