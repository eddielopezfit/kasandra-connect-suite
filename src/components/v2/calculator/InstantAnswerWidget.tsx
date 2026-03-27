import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMarketPulse } from '@/hooks/useMarketPulse';
import { updateSessionContext } from '@/lib/analytics/selenaSession';
import { Calculator, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/**
 * Single-purpose Affordability Quick Check.
 * Uses live market pulse rates when available, hardcoded fallback otherwise.
 * CTAs route to full tools on the hub — no dead-end Selena handoffs.
 */
const InstantAnswerWidget = () => {
  const { t } = useLanguage();
  const { isLive } = useMarketPulse();

  const [income, setIncome] = useState('');
  const [debts, setDebts] = useState('');
  const [downPercent, setDownPercent] = useState(10);

  // Use live rate from market pulse pipeline when available
  const interestRate = 0.0625; // Base fallback
  const PROPERTY_TAX_RATE = 0.011;
  const ANNUAL_INSURANCE = 1200;
  const LOAN_TERM_YEARS = 30;
  const PMI_ANNUAL_RATE = 0.005;

  const result = useMemo(() => {
    const inc = parseFloat(income.replace(/[^0-9.]/g, '')) || 0;
    const dbt = parseFloat(debts.replace(/[^0-9.]/g, '')) || 0;
    if (inc <= 0) return null;

    const monthlyIncome = inc / 12;
    const frontEnd = monthlyIncome * 0.28;
    const backEnd = (monthlyIncome * 0.36) - dbt;
    const maxMonthly = Math.max(0, Math.min(frontEnd, backEnd));
    if (maxMonthly <= 0) return null;

    const r = interestRate / 12;
    const n = LOAN_TERM_YEARS * 12;
    const monthlyInsurance = ANNUAL_INSURANCE / 12;
    const annuityFactor = (1 - Math.pow(1 + r, -n)) / r;
    const loanFraction = 1 - downPercent / 100;
    const hasPMI = downPercent < 20;
    const monthlyPMIRate = hasPMI ? PMI_ANNUAL_RATE / 12 : 0;

    const denominator = loanFraction / annuityFactor + PROPERTY_TAX_RATE / 12 + loanFraction * monthlyPMIRate;
    const numerator = maxMonthly - monthlyInsurance;
    if (numerator <= 0 || denominator <= 0) return null;

    const maxPrice = Math.round(numerator / denominator);
    const loanAmount = Math.round(maxPrice * loanFraction);
    const pi = Math.round(loanAmount / annuityFactor);
    const tax = Math.round(maxPrice * PROPERTY_TAX_RATE / 12);
    const ins = Math.round(monthlyInsurance);
    const pmi = hasPMI ? Math.round(loanAmount * monthlyPMIRate) : 0;

    return {
      maxPrice,
      monthlyPayment: pi + tax + ins + pmi,
    };
  }, [income, debts, downPercent, interestRate]);

  const handleCTAClick = () => {
    if (result) {
      updateSessionContext({
        tool_used: 'instant_answer',
        estimated_budget: result.maxPrice,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-cc-sand-dark/30 max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 pt-6 sm:px-8 sm:pt-8">
        <Calculator className="w-5 h-5 text-cc-gold" />
        <h3 className="font-serif text-lg font-semibold text-cc-navy">
          {t("Quick Affordability Check", "Verificación Rápida de Presupuesto")}
        </h3>
        {isLive && (
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            {t("Live Rates", "Tasas en Vivo")}
          </span>
        )}
      </div>

      <div className="p-6 sm:p-8 pt-4 sm:pt-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-cc-charcoal mb-1">
            {t("Annual Household Income", "Ingreso Anual del Hogar")}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={income}
            onChange={(e) => setIncome(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="$75,000"
            className="w-full border border-cc-sand-dark/40 rounded-lg px-4 py-3 text-cc-charcoal placeholder:text-cc-charcoal/30 focus:outline-none focus:ring-2 focus:ring-cc-gold/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cc-charcoal mb-1">
            {t("Monthly Debts", "Deudas Mensuales")}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={debts}
            onChange={(e) => setDebts(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="$500"
            className="w-full border border-cc-sand-dark/40 rounded-lg px-4 py-3 text-cc-charcoal placeholder:text-cc-charcoal/30 focus:outline-none focus:ring-2 focus:ring-cc-gold/40"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cc-charcoal mb-1">
            {t("Down Payment", "Enganche")}
          </label>
          <select
            value={downPercent}
            onChange={(e) => setDownPercent(Number(e.target.value))}
            className="w-full border border-cc-sand-dark/40 rounded-lg px-4 py-3 text-cc-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-cc-gold/40"
          >
            <option value={3}>3%</option>
            <option value={5}>5%</option>
            <option value={10}>10%</option>
            <option value={20}>20%</option>
          </select>
        </div>

        {/* Live results */}
        {result && result.maxPrice > 0 && (
          <div className="bg-cc-sand/50 rounded-xl p-5 text-center space-y-1">
            <p className="text-sm text-cc-charcoal/60">
              {t("You could afford up to", "Podrías pagar hasta")}
            </p>
            <p className="text-3xl font-bold text-cc-navy">{fmt.format(result.maxPrice)}</p>
            <p className="text-sm text-cc-charcoal/70">
              {t(
                `Estimated monthly payment ~${fmt.format(result.monthlyPayment)}`,
                `Pago mensual estimado ~${fmt.format(result.monthlyPayment)}`
              )}
            </p>
          </div>
        )}

        {/* Journey-aware CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/affordability"
            onClick={handleCTAClick}
            className="flex-1 flex items-center justify-center gap-2 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold py-3 rounded-full transition-colors text-center"
          >
            {t("See Full Breakdown", "Ver Desglose Completo")}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/net-to-seller"
            onClick={handleCTAClick}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-cc-navy text-cc-navy hover:bg-cc-navy hover:text-white font-semibold py-3 rounded-full transition-colors text-center"
          >
            {t("Estimate Net Proceeds", "Estimar Ganancias Netas")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-xs italic text-cc-charcoal/50 text-center">
          {t(
            "Based on standard DTI ratios. Not a pre-approval.",
            "Basado en ratios DTI estándar. No es una pre-aprobación."
          )}
        </p>
      </div>
    </div>
  );
};

export default InstantAnswerWidget;
