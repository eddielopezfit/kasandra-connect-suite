import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { updateSessionContext } from '@/lib/analytics/selenaSession';
import { supabase } from '@/integrations/supabase/client';
import { calculateAffordability } from '@/lib/calculator/affordabilityAlgorithm';
import { useMarketPulse } from '@/hooks/useMarketPulse';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, Home } from 'lucide-react';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const InstantAnswerWidget = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const { stats } = useMarketPulse();
  const [activeTab, setActiveTab] = useState<'afford' | 'value'>('afford');

  // ===== TAB 1: Affordability =====
  const [income, setIncome] = useState('');
  const [debts, setDebts] = useState('');
  const [downPercent, setDownPercent] = useState(10);

  const affordability = useMemo(() => {
    const inc = parseFloat(income.replace(/[^0-9.]/g, '')) || 0;
    const dbt = parseFloat(debts.replace(/[^0-9.]/g, '')) || 0;
    if (inc <= 0) return null;
    return calculateAffordability(inc, dbt, downPercent, stats.mortgageRate30yr);
  }, [income, debts, downPercent, stats.mortgageRate30yr]);

  // ===== TAB 2: Home Value =====
  const [zipCode, setZipCode] = useState('85718'); // Default to popular Tucson ZIP
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [sqft, setSqft] = useState('1600');
  const [valueRange, setValueRange] = useState<{ low: number; high: number } | null>(null);
  const [valueLoading, setValueLoading] = useState(false);
  const [valueError, setValueError] = useState('');

  const isValidZip = /^\d{5}$/.test(zipCode);

  const handleEstimate = async () => {
    if (!isValidZip) return;
    setValueLoading(true);
    setValueError('');
    setValueRange(null);

    try {
      const { data, error } = await supabase.functions.invoke('neighborhood-profile', {
        body: { zip_code: zipCode },
      });

      if (error) throw error;

      const profile = data?.profile_en || data;
      const median = profile?.market_snapshot?.median_home_price
        ?? profile?.median_home_price
        ?? null;

      if (!median || typeof median !== 'number') {
        setValueError(t('ZIP code not found', 'Código postal no encontrado'));
        return;
      }

      const sqftNum = parseInt(sqft.replace(/[^0-9]/g, ''), 10) || 1600;
      const bedAdj = (bedrooms - 3) * 0.05;
      const bathAdj = (bathrooms - 2) * 0.03;
      const sqftAdj = ((sqftNum - 1600) / 100) * 0.005;
      const adjusted = median * (1 + bedAdj + bathAdj + sqftAdj);

      setValueRange({
        low: Math.round(adjusted * 0.92),
        high: Math.round(adjusted * 1.08),
      });
    } catch {
      setValueError(t('Unable to fetch data. Try again.', 'No se pudieron obtener datos. Intente de nuevo.'));
    } finally {
      setValueLoading(false);
    }
  };

  const tabClass = (tab: 'afford' | 'value') =>
    `flex-1 pb-3 text-sm font-semibold transition-colors ${
      activeTab === tab
        ? 'text-cc-navy border-b-2 border-cc-gold'
        : 'text-cc-charcoal/50 border-b-2 border-transparent hover:text-cc-charcoal/70'
    }`;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-cc-sand-dark/30 max-w-2xl mx-auto overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-cc-sand-dark/20">
        <button onClick={() => setActiveTab('afford')} className={tabClass('afford')}>
          <span className="flex items-center justify-center gap-2 pt-4 px-4">
            <Calculator className="w-4 h-4" />
            {t("What Can I Afford?", "¿Cuánto Puedo Pagar?")}
          </span>
        </button>
        <button onClick={() => setActiveTab('value')} className={tabClass('value')}>
          <span className="flex items-center justify-center gap-2 pt-4 px-4">
            <Home className="w-4 h-4" />
            {t("What's My Home Worth?", "¿Cuánto Vale Mi Casa?")}
          </span>
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {activeTab === 'afford' ? (
          /* ===== AFFORDABILITY TAB ===== */
          <div className="space-y-5">
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
            {affordability && affordability.maxPrice > 0 && (
              <div className="bg-cc-sand/50 rounded-xl p-5 text-center space-y-1">
                <p className="text-sm text-cc-charcoal/60">
                  {t("You could afford up to", "Podrías pagar hasta")}
                </p>
                <p className="text-3xl font-bold text-cc-navy">{fmt.format(affordability.maxPrice)}</p>
                <p className="text-sm text-cc-charcoal/70">
                  {t(
                    `Estimated monthly payment ~${fmt.format(affordability.monthlyPayment)}`,
                    `Pago mensual estimado ~${fmt.format(affordability.monthlyPayment)}`
                  )}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                if (affordability) {
                  updateSessionContext({
                    tool_used: 'instant_answer',
                    estimated_budget: affordability.maxPrice,
                  });
                }
                openChat({ source: 'instant_answer_affordability' });
              }}
              className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold py-3 rounded-full transition-colors"
            >
              {t("Talk to Selena About Options →", "Habla con Selena Sobre Opciones →")}
            </button>
          </div>
        ) : (
          /* ===== HOME VALUE TAB ===== */
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-cc-charcoal mb-1">
                  {t("ZIP Code", "Código Postal")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="85718"
                  className="w-full border border-cc-sand-dark/40 rounded-lg px-4 py-3 text-cc-charcoal placeholder:text-cc-charcoal/30 focus:outline-none focus:ring-2 focus:ring-cc-gold/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cc-charcoal mb-1">
                  {t("Bedrooms", "Habitaciones")}
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full border border-cc-sand-dark/40 rounded-lg px-4 py-3 text-cc-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-cc-gold/40"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-cc-charcoal mb-1">
                  {t("Bathrooms", "Baños")}
                </label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full border border-cc-sand-dark/40 rounded-lg px-4 py-3 text-cc-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-cc-gold/40"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-cc-charcoal mb-1">
                  {t("Square Feet", "Pies Cuadrados")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="1,600"
                  className="w-full border border-cc-sand-dark/40 rounded-lg px-4 py-3 text-cc-charcoal placeholder:text-cc-charcoal/30 focus:outline-none focus:ring-2 focus:ring-cc-gold/40"
                />
              </div>
            </div>

            <button
              onClick={handleEstimate}
              disabled={!isValidZip || valueLoading}
              className="w-full bg-cc-navy hover:bg-cc-navy-dark text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {valueLoading
                ? t("Estimating...", "Estimando...")
                : t("Estimate Value", "Estimar Valor")}
            </button>

            {/* Loading skeleton */}
            {valueLoading && (
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-5 w-1/2 mx-auto" />
              </div>
            )}

            {/* Error */}
            {valueError && (
              <p className="text-center text-sm text-red-600">{valueError}</p>
            )}

            {/* Results */}
            {valueRange && !valueLoading && (
              <div className="bg-cc-sand/50 rounded-xl p-5 text-center space-y-1">
                <p className="text-sm text-cc-charcoal/60">
                  {t("Estimated Range", "Rango Estimado")}
                </p>
                <p className="text-2xl font-bold text-cc-navy">
                  {fmt.format(valueRange.low)} – {fmt.format(valueRange.high)}
                </p>
                <p className="text-xs text-cc-charcoal/50">
                  {t("Based on Tucson market data", "Basado en datos del mercado de Tucson")}
                </p>
              </div>
            )}

            {/* Compliance disclaimer — always visible */}
            <p className="text-xs italic text-cc-charcoal/50 mt-2">
              {t(
                "This is an estimate only, not an appraisal.",
                "Esto es solo una estimación, no una tasación."
              )}
            </p>

            <button
              onClick={() => {
                if (valueRange) {
                  const midpoint = Math.round((valueRange.low + valueRange.high) / 2);
                  updateSessionContext({
                    tool_used: 'instant_answer',
                    estimated_value: midpoint,
                  });
                }
                openChat({ source: 'instant_answer_value' });
              }}
              className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold py-3 rounded-full transition-colors"
            >
              {t("Get a Detailed Analysis →", "Obtén un Análisis Detallado →")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstantAnswerWidget;
