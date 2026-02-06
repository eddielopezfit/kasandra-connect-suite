/**
 * CalculatorResults - Side-by-side comparison of cash vs traditional
 * Shows transparent breakdown and "Cost of Time" analysis
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle, Clock, Calendar, DollarSign, Info } from "lucide-react";
import type { CalculatorResults as ResultsType } from "@/lib/calculator/netToSellerAlgorithm";

interface CalculatorResultsProps {
  results: ResultsType;
}

const CalculatorResults = ({ results }: CalculatorResultsProps) => {
  const { t, language } = useLanguage();
  const { traditional, cash, costOfTime, recommendationReason } = results;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(language === 'es' ? 'es-US' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Side-by-side comparison cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Cash Offer Card */}
        <div className="rounded-xl shadow-soft overflow-hidden border border-cc-sand-dark/30">
          <div className="bg-cc-gold text-cc-navy p-4">
            <h3 className="font-serif text-lg font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {t("Cash Offer Path", "Opción de Efectivo")}
            </h3>
            <p className="text-sm text-cc-navy/70 mt-1">
              {t("Sell as-is, close fast", "Vende tal cual, cierra rápido")}
            </p>
          </div>
          <div className="p-5 space-y-4 bg-white">
            {/* Net Proceeds - Prominent */}
            <div className="text-center py-4 bg-cc-gold/10 rounded-lg">
              <p className="text-sm text-cc-slate mb-1">
                {t("Estimated Net Proceeds", "Ganancia Neta Estimada")}
              </p>
              <p className="text-3xl font-serif font-bold text-cc-navy">
                {formatAmount(cash.netProceeds)}
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-cc-charcoal">
                <span>{t("Cash offer", "Oferta en efectivo")}</span>
                <span className="font-medium">{formatAmount(cash.grossAmount)}</span>
              </div>
              <div className="flex justify-between text-cc-slate">
                <span>{t("Commission", "Comisión")}</span>
                <span className="text-green-600">−{formatAmount(cash.commission)}</span>
              </div>
              <div className="flex justify-between text-cc-slate">
                <span>{t("Closing costs", "Costos de cierre")}</span>
                <span className="text-green-600">−{formatAmount(cash.closingCosts)}</span>
              </div>
              <div className="flex justify-between text-cc-slate">
                <span>{t("Holding costs", "Costos de espera")}</span>
                <span>−{formatAmount(cash.holdingCost)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-2 pt-3 border-t border-cc-sand">
              <Clock className="w-4 h-4 text-cc-gold" />
              <span className="text-sm text-cc-charcoal">
                {t(`Close in ~${cash.daysToClose} days`, `Cierre en ~${cash.daysToClose} días`)}
              </span>
            </div>

            {/* Benefits */}
            <div className="space-y-2 pt-2">
              <div className="flex items-start gap-2 text-sm text-cc-charcoal">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{t("No repairs needed", "Sin reparaciones")}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-cc-charcoal">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{t("No showings or staging", "Sin visitas o staging")}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-cc-charcoal">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{t("Certainty of sale", "Certeza de venta")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Traditional Listing Card */}
        <div className="rounded-xl shadow-soft overflow-hidden border border-cc-sand-dark/30">
          <div className="bg-cc-navy text-white p-4">
            <h3 className="font-serif text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t("Traditional Listing", "Venta Tradicional")}
            </h3>
            <p className="text-sm text-white/70 mt-1">
              {t("Market exposure, more time", "Exposición al mercado, más tiempo")}
            </p>
          </div>
          <div className="p-5 space-y-4 bg-white">
            {/* Net Proceeds - Prominent */}
            <div className="text-center py-4 bg-cc-navy/5 rounded-lg">
              <p className="text-sm text-cc-slate mb-1">
                {t("Estimated Net Proceeds", "Ganancia Neta Estimada")}
              </p>
              <p className="text-3xl font-serif font-bold text-cc-navy">
                {formatAmount(traditional.netProceeds)}
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-cc-charcoal">
                <span>{t("Sale price", "Precio de venta")}</span>
                <span className="font-medium">{formatAmount(traditional.grossAmount)}</span>
              </div>
              <div className="flex justify-between text-cc-slate">
                <span>{t("Commission (6%)", "Comisión (6%)")}</span>
                <span>−{formatAmount(traditional.commission)}</span>
              </div>
              <div className="flex justify-between text-cc-slate">
                <span>{t("Closing costs (2%)", "Costos de cierre (2%)")}</span>
                <span>−{formatAmount(traditional.closingCosts)}</span>
              </div>
              <div className="flex justify-between text-cc-slate">
                <span>{t("Holding costs", "Costos de espera")}</span>
                <span>−{formatAmount(traditional.holdingCost)}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-2 pt-3 border-t border-cc-sand">
              <Clock className="w-4 h-4 text-cc-navy" />
              <span className="text-sm text-cc-charcoal">
                {t(`Close in ~${traditional.daysToClose} days`, `Cierre en ~${traditional.daysToClose} días`)}
              </span>
            </div>

            {/* Benefits */}
            <div className="space-y-2 pt-2">
              <div className="flex items-start gap-2 text-sm text-cc-charcoal">
                <CheckCircle className="w-4 h-4 text-cc-navy flex-shrink-0 mt-0.5" />
                <span>{t("Maximum exposure", "Máxima exposición")}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-cc-charcoal">
                <CheckCircle className="w-4 h-4 text-cc-navy flex-shrink-0 mt-0.5" />
                <span>{t("Potential for higher price", "Potencial de mayor precio")}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-cc-charcoal">
                <CheckCircle className="w-4 h-4 text-cc-navy flex-shrink-0 mt-0.5" />
                <span>{t("Professional marketing", "Marketing profesional")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost of Time Box */}
      <div className="bg-gradient-to-r from-cc-navy to-cc-navy-dark rounded-xl p-6 text-white">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-cc-gold/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-cc-gold" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold mb-1">
              {t("Cost of Time", "Costo del Tiempo")}
            </h4>
            <p className="text-sm text-white/70">
              {t(
                "Understanding what speed is worth in your situation",
                "Entendiendo cuánto vale la rapidez en tu situación"
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-sm text-white/70 mb-1">
              {costOfTime.cashNetsMore 
                ? t("Cash Advantage", "Ventaja de Efectivo")
                : t("Traditional Advantage", "Ventaja Tradicional")
              }
            </p>
            <p className="text-2xl font-bold text-cc-gold">
              {formatAmount(costOfTime.netDifference)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <p className="text-sm text-white/70 mb-1">
              {t("Days Saved with Cash", "Días Ahorrados con Efectivo")}
            </p>
            <p className="text-2xl font-bold text-cc-gold">
              {costOfTime.daysSaved} {t("days", "días")}
            </p>
          </div>
        </div>

        {!costOfTime.cashNetsMore && costOfTime.dailyValueOfSpeed > 0 && (
          <div className="bg-white/10 rounded-lg p-4 text-center mb-4">
            <p className="text-sm text-white/70 mb-1">
              {t("Daily Value of Choosing Speed", "Valor Diario de Elegir Rapidez")}
            </p>
            <p className="text-xl font-bold">
              {formatAmount(costOfTime.dailyValueOfSpeed)}
              <span className="text-sm font-normal text-white/70"> / {t("day", "día")}</span>
            </p>
            <p className="text-xs text-white/60 mt-2">
              {t(
                "This is what each day of faster closing 'costs' in potential proceeds",
                "Esto es lo que 'cuesta' cada día de cierre más rápido en ganancias potenciales"
              )}
            </p>
          </div>
        )}

        {/* Recommendation */}
        <div className="border-t border-white/20 pt-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              {language === 'en' ? recommendationReason.en : recommendationReason.es}
            </p>
          </div>
        </div>
      </div>

      {/* Educational Disclaimer */}
      <div className="bg-cc-sand rounded-lg p-4 border border-cc-sand-dark/30">
        <p className="text-xs text-cc-slate text-center">
          {t(
            "These are estimates based on Tucson market averages. Actual results will vary based on your specific property, condition, location, and market conditions. For a personalized analysis, review your strategy with Kasandra.",
            "Estos son estimados basados en promedios del mercado de Tucson. Los resultados reales variarán según tu propiedad específica, condición, ubicación y condiciones del mercado. Para un análisis personalizado, revise su estrategia con Kasandra."
          )}
        </p>
      </div>
    </div>
  );
};

export default CalculatorResults;
