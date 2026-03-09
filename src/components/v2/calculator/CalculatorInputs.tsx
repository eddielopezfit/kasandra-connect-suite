/**
 * CalculatorInputs - Input form for the TucsonAlphaCalculator
 * Collects property value, motivation, and timeline
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Target, Clock, Landmark } from "lucide-react";
import type { Motivation, Timeline } from "@/lib/calculator/netToSellerAlgorithm";

interface CalculatorInputsProps {
  estimatedValue: number;
  mortgageBalance: number;
  motivation: Motivation;
  timeline: Timeline;
  onValueChange: (value: number) => void;
  onMortgageBalanceChange: (value: number) => void;
  onMotivationChange: (motivation: Motivation) => void;
  onTimelineChange: (timeline: Timeline) => void;
  onCalculate: () => void;
}

const CalculatorInputs = ({
  estimatedValue,
  mortgageBalance,
  motivation,
  timeline,
  onValueChange,
  onMortgageBalanceChange,
  onMotivationChange,
  onTimelineChange,
  onCalculate,
}: CalculatorInputsProps) => {
  const { t, language } = useLanguage();
  const [showMortgageField, setShowMortgageField] = useState(mortgageBalance > 0);

  const motivationOptions: { value: Motivation; labelEn: string; labelEs: string }[] = [
    { value: 'speed', labelEn: 'I need to sell quickly', labelEs: 'Necesito vender rápido' },
    { value: 'maximize', labelEn: 'I want maximum profit', labelEs: 'Quiero máxima ganancia' },
    { value: 'uncertain', labelEn: 'I\'m not sure yet', labelEs: 'No estoy seguro/a aún' },
  ];

  const timelineOptions: { value: Timeline; labelEn: string; labelEs: string }[] = [
    { value: 'asap', labelEn: 'ASAP / Within 2 weeks', labelEs: 'Lo antes posible / 2 semanas' },
    { value: '30days', labelEn: 'Within 30 days', labelEs: 'Dentro de 30 días' },
    { value: '60days', labelEn: 'Within 60 days', labelEs: 'Dentro de 60 días' },
    { value: 'flexible', labelEn: 'Flexible / Just exploring', labelEs: 'Flexible / Solo explorando' },
  ];

  const formatValue = (value: number) => {
    return new Intl.NumberFormat(language === 'es' ? 'es-US' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Property Value */}
      <div className="space-y-4">
        <Label className="text-cc-charcoal font-medium flex items-center gap-2 text-base">
          <Home className="w-5 h-5 text-cc-gold" />
          {t("Estimated Home Value", "Valor Estimado de la Casa")}
        </Label>
        
        <div className="bg-cc-sand rounded-xl p-6">
          <div className="text-center mb-4">
            <span className="text-3xl font-serif font-bold text-cc-navy">
              {formatValue(estimatedValue)}
            </span>
          </div>
          
          <Slider
            value={[estimatedValue]}
            onValueChange={(values) => onValueChange(values[0])}
            min={100000}
            max={2000000}
            step={10000}
            className="my-4"
          />
          
          <div className="flex justify-between text-xs text-cc-slate">
            <span>$100k</span>
            <span>$2M</span>
          </div>

          {/* Direct input option */}
          <div className="mt-4 pt-4 border-t border-cc-sand-dark/30">
            <Label className="text-xs text-cc-slate mb-2 block">
              {t("Or enter exact amount:", "O ingresa la cantidad exacta:")}
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              value={estimatedValue}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 100000;
                onValueChange(Math.min(2000000, Math.max(100000, val)));
              }}
              className="text-center font-semibold border-cc-sand-dark bg-white"
              id="estimated-value"
              name="estimated-value"
            />
          </div>
        </div>
      </div>

      {/* Mortgage Balance — optional */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-cc-charcoal font-medium flex items-center gap-2 text-base">
            <Landmark className="w-5 h-5 text-cc-gold" />
            {t("Remaining Mortgage Balance", "Saldo Restante de Hipoteca")}
          </Label>
          <button
            onClick={() => {
              setShowMortgageField(!showMortgageField);
              if (showMortgageField) onMortgageBalanceChange(0);
            }}
            className="text-xs text-cc-gold hover:text-cc-gold-dark underline underline-offset-2 transition-colors"
          >
            {showMortgageField
              ? t("Remove", "Quitar")
              : t("I have a mortgage", "Tengo hipoteca")}
          </button>
        </div>

        {showMortgageField && (
          <div className="bg-cc-sand rounded-xl p-5 space-y-3">
            <p className="text-xs text-cc-slate">
              {t(
                "This shows what you'd actually walk away with after paying off your loan.",
                "Esto muestra lo que realmente recibirías después de pagar tu préstamo."
              )}
            </p>
            <Input
              type="text"
              inputMode="numeric"
              placeholder={t("e.g. 245000", "ej. 245000")}
              value={mortgageBalance || ""}
              onChange={(e) => {
                const val = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                onMortgageBalanceChange(Math.max(0, val));
              }}
              className="text-center font-semibold border-cc-sand-dark bg-white text-lg"
              id="mortgage-balance"
              name="mortgage-balance"
            />
            {mortgageBalance > 0 && (
              <p className="text-xs text-center text-cc-slate">
                {t("Payoff balance:", "Saldo a pagar:")}{" "}
                <span className="font-semibold text-cc-navy">
                  {new Intl.NumberFormat(language === "es" ? "es-US" : "en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(mortgageBalance)}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Motivation */}
      <div className="space-y-4">
        <Label className="text-cc-charcoal font-medium flex items-center gap-2 text-base">
          <Target className="w-5 h-5 text-cc-gold" />
          {t("What matters most to you?", "¿Qué es lo más importante para ti?")}
        </Label>
        
        <div className="space-y-3">
          {motivationOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onMotivationChange(option.value)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                motivation === option.value
                  ? "border-cc-gold bg-cc-gold/10"
                  : "border-cc-sand-dark hover:border-cc-gold/50 bg-white"
              }`}
            >
              <span className="text-cc-charcoal">
                {language === "en" ? option.labelEn : option.labelEs}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <Label className="text-cc-charcoal font-medium flex items-center gap-2 text-base">
          <Clock className="w-5 h-5 text-cc-gold" />
          {t("When do you need to sell?", "¿Cuándo necesitas vender?")}
        </Label>
        
        <div className="grid grid-cols-2 gap-3">
          {timelineOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimelineChange(option.value)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                timeline === option.value
                  ? "border-cc-gold bg-cc-gold/10"
                  : "border-cc-sand-dark hover:border-cc-gold/50 bg-white"
              }`}
            >
              <span className="text-cc-charcoal">
                {language === "en" ? option.labelEn : option.labelEs}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Calculate Button */}
      <Button
        onClick={onCalculate}
        className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-6 text-lg shadow-gold min-h-[48px]"
      >
        {t("Calculate My Options", "Calcular Mis Opciones")}
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      {/* Disclaimer */}
      <p className="text-center text-xs text-cc-slate">
        {t(
          "This is an educational estimate only. For a personalized analysis, speak with Kasandra.",
          "Este es solo un estimado educativo. Para un análisis personalizado, habla con Kasandra."
        )}
      </p>
    </div>
  );
};

export default CalculatorInputs;
