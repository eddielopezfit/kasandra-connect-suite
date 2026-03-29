import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useMarketPulse } from "@/hooks/useMarketPulse";
import { logEvent } from "@/lib/analytics/logEvent";
import { setFieldIfEmpty, updateSessionContext, getSessionContext } from "@/lib/analytics/selenaSession";
import {
  calculateAffordability,
  TUCSON_MEDIAN_PRICE,
  type CreditTier,
  type AffordabilityResult,
} from "@/lib/calculator/affordabilityAlgorithm";
import {
  DollarSign, Home, CreditCard, TrendingUp, Percent,
} from "lucide-react";
import { ToolResultLeadCapture } from "@/components/v2/ToolResultLeadCapture";
import ToolResultNextStep from "@/components/v2/ToolResultNextStep";

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const V2AffordabilityCalculatorContent = () => {
  const { language, t } = useLanguage();
  
  const { stats } = useMarketPulse();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [toolStarted, setToolStarted] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const [income, setIncome] = useState("");
  const [debts, setDebts] = useState("");
  const [downPct, setDownPct] = useState("5");
  const [creditTier, setCreditTier] = useState<CreditTier>("good");

  const incomeNum = parseInt(income.replace(/[^0-9]/g, "")) || 0;
  const debtsNum = parseInt(debts.replace(/[^0-9]/g, "")) || 0;
  const downNum = parseFloat(downPct) || 5;

  // Pass live rate from market pulse when available (sale_to_list_ratio is not the mortgage rate,
  // but the pipeline may return a conventional_rate field in the future — for now use the
  // algorithm's built-in base rate which is updated monthly in the source code)
  const result: AffordabilityResult = calculateAffordability(incomeNum, debtsNum, downNum, creditTier);

  const handleCalculate = () => {
    if (incomeNum < 20000) return;
    if (!toolStarted) {
      logEvent("tool_started", { tool_id: "affordability_calculator", source: "website", page_path: "/affordability-calculator" });
      setToolStarted(true);
    }
    setCalculated(true);
    setFieldIfEmpty("intent", "buy");
    const ctx = getSessionContext();
    updateSessionContext({
      last_tool_completed: "affordability_calculator",
      tools_completed: [...new Set([...(ctx?.tools_completed ?? []), "affordability_calculator"])],
    });
    logEvent("tool_completed", {
      tool_id: "affordability_calculator",
      source: "website",
      page_path: "/affordability-calculator",
      max_price: result.maxPrice,
      credit_tier: creditTier,
    });
    import('@/lib/analytics/sessionSnapshot').then(({ saveSnapshot }) => saveSnapshot()).catch(() => {});
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const chipClass = (active: boolean) =>
    `px-4 py-2.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
      active
        ? "bg-cc-navy text-white border-cc-navy shadow-soft"
        : "bg-white text-cc-charcoal border-cc-sand-dark/40 hover:border-cc-navy/40"
    }`;

  // Use live median from market_pulse when available, fallback to hardcoded constant
  const liveMedian = stats.medianSalePrice ?? TUCSON_MEDIAN_PRICE;
  const medianComparison = result.maxPrice > 0
    ? Math.round(((result.maxPrice - liveMedian) / liveMedian) * 100)
    : 0;

  return (
    <>
      <section className="bg-cc-navy py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
            {t("For Buyers", "Para Compradores")}
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mt-2 mb-4">
            {t("How Much Home", "¿Cuánta Casa")}
            <span className="text-cc-gold"> {t("Can You Afford?", "Puedes Pagar?")}</span>
          </h1>
          <p className="text-white/75 text-lg max-w-2xl">
            {t(
              "Tucson-calibrated DTI calculator with PMI, credit score adjustments, and real monthly payment breakdown.",
              "Calculadora de DTI calibrada para Tucson con PMI, ajustes por crédito y desglose mensual real."
            )}
          </p>
        </div>
      </section>

      <section className="py-14 bg-cc-ivory">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl border border-cc-sand-dark/30 shadow-soft p-8 space-y-8">

            {/* Annual Income */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                {t("Annual Household Income", "Ingreso Anual del Hogar")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cc-slate font-medium">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                   placeholder={t("e.g. 85,000", "ej. 85,000")}
                   value={income}
                   onChange={e => {
                     const raw = e.target.value.replace(/[^0-9]/g, "");
                     setIncome(raw ? parseInt(raw).toLocaleString() : "");
                     setCalculated(false);
                   }}
                   className="w-full pl-8 pr-4 py-3 rounded-full border border-cc-sand-dark/40 focus:border-cc-navy/40 focus:outline-none text-cc-charcoal placeholder:italic placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Monthly Debts */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {t("Monthly Debt Payments", "Pagos de Deuda Mensuales")}
              </label>
              <p className="text-xs text-cc-slate">
                {t("Car, student loans, credit cards, etc.", "Auto, préstamos estudiantiles, tarjetas, etc.")}
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cc-slate font-medium">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="500"
                  value={debts}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setDebts(raw ? parseInt(raw).toLocaleString() : "");
                    setCalculated(false);
                  }}
                  className="w-full pl-8 pr-4 py-3 rounded-full border border-cc-sand-dark/40 focus:border-cc-navy/40 focus:outline-none text-cc-charcoal"
                />
              </div>
            </div>

            {/* Down Payment % */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider flex items-center gap-2">
                <Percent className="w-4 h-4" />
                {t("Down Payment", "Enganche")}
              </label>
              <div className="flex flex-wrap gap-2">
                {[3, 5, 10, 20].map(p => (
                  <button
                    key={p}
                    className={chipClass(parseFloat(downPct) === p)}
                    onClick={() => { setDownPct(String(p)); setCalculated(false); }}
                  >
                    {p}%
                  </button>
                ))}
                <input
                  type="number"
                  min={3}
                  max={50}
                  step={1}
                  placeholder={t("Custom %", "% Personalizado")}
                  value={[3, 5, 10, 20].includes(parseFloat(downPct)) ? '' : downPct}
                  onChange={e => { setDownPct(e.target.value); setCalculated(false); }}
                  className="w-28 px-4 py-2.5 rounded-full border border-cc-sand-dark/40 focus:border-cc-navy/40 focus:outline-none text-sm text-cc-charcoal"
                />
              </div>
              {downNum < 20 && (
                <p className="text-xs text-cc-gold font-medium">
                  {t("PMI will apply — included in your estimate below.", "PMI aplicará — incluido en tu estimado abajo.")}
                </p>
              )}
            </div>

            {/* Credit Score Tier */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t("Credit Score Range", "Rango de Crédito")}
              </label>
              <div className="flex flex-wrap gap-2">
                {([
                  { key: "excellent" as CreditTier, en: "740+", es: "740+" },
                  { key: "good" as CreditTier, en: "700–739", es: "700–739" },
                  { key: "fair" as CreditTier, en: "640–699", es: "640–699" },
                  { key: "below" as CreditTier, en: "Below 640", es: "Menor a 640" },
                ]).map(tier => (
                  <button
                    key={tier.key}
                    className={chipClass(creditTier === tier.key)}
                    onClick={() => { setCreditTier(tier.key); setCalculated(false); }}
                  >
                    {language === "es" ? tier.es : tier.en}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={incomeNum < 20000}
              className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-3 shadow-gold text-base"
            >
              <Home className="w-5 h-5 mr-2" />
              {t("Calculate My Buying Power", "Calcular Mi Poder de Compra")}
            </Button>
            {incomeNum < 20000 && (
              <p className="text-xs text-cc-slate text-center mt-2">
                {t("Enter an annual income of at least $20,000 to calculate.", "Ingresa un ingreso anual de al menos $20,000 para calcular.")}
              </p>
            )}
          </div>
        </div>
      </section>

      {calculated && result.maxPrice > 0 && (
        <section ref={resultsRef} className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-2xl">
            {/* Max price banner */}
            <div className="bg-cc-navy rounded-2xl p-6 mb-8 text-center">
              <p className="text-cc-gold text-sm font-semibold uppercase tracking-wider mb-1">
                {t("Your Estimated Max Purchase Price", "Tu Precio Máximo Estimado de Compra")}
              </p>
              <p className="font-serif text-5xl font-bold text-white">{fmt(result.maxPrice)}</p>
              <p className="text-white/60 text-sm mt-2">
                {t("Monthly payment:", "Pago mensual:")} <strong className="text-white">{fmt(result.monthlyPayment)}/mo</strong>
                {" · "}
                {t("Rate:", "Tasa:")} {(result.effectiveRate * 100).toFixed(2)}%
              </p>
              {medianComparison !== 0 && (
                <p className="text-cc-gold/80 text-xs mt-1">
                  {medianComparison > 0
                    ? t(`${medianComparison}% above Tucson median (~${fmt(liveMedian)})`, `${medianComparison}% sobre la mediana de Tucson (~${fmt(liveMedian)})`)
                    : t(`${Math.abs(medianComparison)}% below Tucson median (~${fmt(liveMedian)})`, `${Math.abs(medianComparison)}% bajo la mediana de Tucson (~${fmt(liveMedian)})`)
                  }
                </p>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-3 mb-8">
              {[
                { label: t("Principal & Interest", "Capital e Interés"), value: result.breakdown.principalInterest },
                { label: t("Property Tax", "Impuesto Predial"), value: result.breakdown.propertyTax },
                { label: t("Homeowner's Insurance", "Seguro de Propietario"), value: result.breakdown.insurance },
                ...(result.breakdown.pmi > 0
                  ? [{ label: t("PMI (Private Mortgage Insurance)", "PMI (Seguro Hipotecario Privado)"), value: result.breakdown.pmi }]
                  : []),
              ].map((line, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-cc-ivory border-cc-sand-dark/20">
                  <span className="text-sm font-semibold text-cc-navy">{line.label}</span>
                  <span className="text-sm font-semibold text-cc-navy">{fmt(line.value)}/mo</span>
                </div>
              ))}

              <div className="flex items-center justify-between p-4 rounded-xl border bg-cc-gold/10 border-cc-gold/30">
                <span className="text-sm font-bold text-cc-navy">{t("Down Payment", "Enganche")}</span>
                <span className="text-sm font-bold text-cc-navy">{fmt(result.downPaymentAmount)}</span>
              </div>
            </div>

            <p className="text-xs text-cc-slate/60 leading-relaxed mb-8">
              {t(
                "Estimates based on Tucson/Pima County averages. Actual rates, taxes, and insurance vary. This is not a loan pre-qualification. DTI used: " + (result.dtiUsed === "front" ? "28% front-end" : "36% back-end") + ".",
                "Estimaciones basadas en promedios de Tucson/Condado de Pima. Las tasas, impuestos y seguros reales varían. Esto no es una pre-calificación de préstamo. DTI usado: " + (result.dtiUsed === "front" ? "28% front-end" : "36% back-end") + "."
              )}
            </p>

          </div>
        </section>
      )}
      {/* V2: Tool Result Lead Capture — fires 2.5s after result */}
      {calculated && result.maxPrice > 0 && (
        <section className="pb-8 bg-white">
          <div className="container mx-auto px-4 max-w-2xl">
            <ToolResultLeadCapture
              toolType="affordability"
              resultData={{ max_price: result.maxPrice, monthly_payment: result.monthlyPayment }}
              delayMs={2500}
            />
          </div>
        </section>
      )}
      {calculated && result.maxPrice > 0 && (
        <section className="pb-8 bg-white">
          <div className="container mx-auto px-4 max-w-2xl">
            <ToolResultNextStep
              completedToolLabel="Affordability Calculator"
              completedToolLabelEs="Calculadora de Presupuesto"
            />
          </div>
        </section>
      )}
    </>
  );
};

const V2AffordabilityCalculator = () => {
  useDocumentHead({
    titleEn: "Affordability Calculator | How Much Home Can You Afford? — Kasandra Prieto",
    titleEs: "Calculadora de Presupuesto | ¿Cuánta Casa Puedes Pagar? — Kasandra Prieto",
    descriptionEn: "Calculate your Tucson home buying power with DTI analysis, PMI estimates, and credit score adjustments. Free tool — no login required.",
    descriptionEs: "Calcula tu poder de compra en Tucson con análisis DTI, estimados de PMI y ajustes de crédito. Herramienta gratuita — sin registro.",
  });

  return (
    <V2Layout>
      <V2AffordabilityCalculatorContent />
    </V2Layout>
  );
};

export default V2AffordabilityCalculator;
