import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { logEvent } from "@/lib/analytics/logEvent";
import { setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { calculateBAHMortgage, type BAHInput, type BAHResult } from "@/lib/calculator/bahMortgageAlgorithm";
import {
  DollarSign, Home, MessageCircle, ArrowRight, Calendar, Shield, CreditCard,
} from "lucide-react";
import { ToolResultLeadCapture } from "@/components/v2/ToolResultLeadCapture";

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const V2BAHCalculatorContent = () => {
  const { language, t } = useLanguage();
  const { openChat } = useSelenaChat();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [toolStarted, setToolStarted] = useState(false);
  const [calculated, setCalculated] = useState(false);

  const [bah, setBah] = useState("");
  const [otherIncome, setOtherIncome] = useState("");
  const [debts, setDebts] = useState("");
  const [downPct, setDownPct] = useState("0");
  const [isFirstUse, setIsFirstUse] = useState(true);
  const [isDisabilityExempt, setIsDisabilityExempt] = useState(false);

  const bahNum = parseInt(bah.replace(/[^0-9]/g, "")) || 0;
  const otherNum = parseInt(otherIncome.replace(/[^0-9]/g, "")) || 0;
  const debtsNum = parseInt(debts.replace(/[^0-9]/g, "")) || 0;
  const downNum = parseFloat(downPct) || 0;

  const input: BAHInput = {
    bahMonthly: bahNum,
    otherIncome: otherNum,
    monthlyDebts: debtsNum,
    downPercent: downNum,
    isFirstUse,
    isDisabilityExempt,
  };

  const result: BAHResult = calculateBAHMortgage(input);

  const handleCalculate = () => {
    if (bahNum < 500) return;
    if (!toolStarted) {
      logEvent("tool_started", { tool: "bah_calculator", source: "website", tool_origin: "bah_calculator" });
      setToolStarted(true);
    }
    setCalculated(true);
    setFieldIfEmpty("intent", "buy");
    logEvent("tool_completed", {
      tool: "bah_calculator",
      source: "website",
      tool_origin: "bah_calculator",
      max_price: result.maxPrice,
      bah_amount: bahNum,
    });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const chipClass = (active: boolean) =>
    `px-4 py-2.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
      active
        ? "bg-cc-navy text-white border-cc-navy shadow-soft"
        : "bg-white text-cc-charcoal border-cc-sand-dark/40 hover:border-cc-navy/40"
    }`;

  return (
    <>
      <section className="bg-cc-navy py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t("For Military Families", "Para Familias Militares")}
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mt-2 mb-4">
            {t("BAH to", "BAH a")}
            <span className="text-cc-gold"> {t("Buying Power", "Poder de Compra")}</span>
          </h1>
          <p className="text-white/75 text-lg max-w-2xl">
            {t(
              "Davis-Monthan and Tucson military families: see how your BAH translates to home buying power with VA loan benefits — $0 down, no PMI.",
              "Familias militares de Davis-Monthan y Tucson: vean cómo su BAH se traduce en poder de compra con beneficios de préstamo VA — $0 de enganche, sin PMI."
            )}
          </p>
        </div>
      </section>

      <section className="py-14 bg-cc-ivory">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl border border-cc-sand-dark/30 shadow-soft p-8 space-y-8">

            {/* BAH Amount */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {t("Monthly BAH", "BAH Mensual")}
              </label>
              <p className="text-xs text-cc-slate">
                {t("Your Basic Allowance for Housing (with dependents or without)", "Tu Subsidio Básico para Vivienda (con o sin dependientes)")}
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cc-slate font-medium">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1,800"
                  value={bah}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setBah(raw ? parseInt(raw).toLocaleString() : "");
                    setCalculated(false);
                  }}
                  className="w-full pl-8 pr-4 py-3 rounded-full border border-cc-sand-dark/40 focus:border-cc-navy/40 focus:outline-none text-cc-charcoal"
                />
              </div>
            </div>

            {/* Other Income */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                {t("Other Monthly Income", "Otro Ingreso Mensual")}
              </label>
              <p className="text-xs text-cc-slate">
                {t("Base pay, spouse income, etc.", "Salario base, ingreso del cónyuge, etc.")}
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cc-slate font-medium">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="3,500"
                  value={otherIncome}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setOtherIncome(raw ? parseInt(raw).toLocaleString() : "");
                    setCalculated(false);
                  }}
                  className="w-full pl-8 pr-4 py-3 rounded-full border border-cc-sand-dark/40 focus:border-cc-navy/40 focus:outline-none text-cc-charcoal"
                />
              </div>
            </div>

            {/* Monthly Debts */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                {t("Monthly Debt Payments", "Pagos de Deuda Mensuales")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cc-slate font-medium">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="400"
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

            {/* Down Payment */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
                {t("Down Payment (VA allows 0%)", "Enganche (VA permite 0%)")}
              </label>
              <div className="flex flex-wrap gap-2">
                {[0, 5, 10].map(p => (
                  <button
                    key={p}
                    className={chipClass(parseFloat(downPct) === p)}
                    onClick={() => { setDownPct(String(p)); setCalculated(false); }}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            {/* VA Funding Fee */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
                {t("VA Funding Fee", "Cargo de Financiamiento VA")}
              </label>
              <div className="flex flex-wrap gap-2">
                <button className={chipClass(isFirstUse)} onClick={() => { setIsFirstUse(true); setCalculated(false); }}>
                  {t("First Use", "Primer Uso")}
                </button>
                <button className={chipClass(!isFirstUse && !isDisabilityExempt)} onClick={() => { setIsFirstUse(false); setIsDisabilityExempt(false); setCalculated(false); }}>
                  {t("Subsequent Use", "Uso Posterior")}
                </button>
                <button className={chipClass(isDisabilityExempt)} onClick={() => { setIsDisabilityExempt(true); setCalculated(false); }}>
                  {t("10%+ Disability (Exempt)", "10%+ Discapacidad (Exento)")}
                </button>
              </div>
            </div>

            <Button
              onClick={handleCalculate}
              disabled={bahNum < 500}
              className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-3 shadow-gold text-base"
            >
              <Home className="w-5 h-5 mr-2" />
              {t("Calculate My VA Buying Power", "Calcular Mi Poder de Compra VA")}
            </Button>
          </div>
        </div>
      </section>

      {calculated && result.maxPrice > 0 && (
        <section ref={resultsRef} className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="bg-cc-navy rounded-2xl p-6 mb-8 text-center">
              <p className="text-cc-gold text-sm font-semibold uppercase tracking-wider mb-1">
                {t("Your VA Buying Power", "Tu Poder de Compra VA")}
              </p>
              <p className="font-serif text-5xl font-bold text-white">{fmt(result.maxPrice)}</p>
              <p className="text-white/60 text-sm mt-2">
                {t("Monthly payment:", "Pago mensual:")} <strong className="text-white">{fmt(result.monthlyPayment)}/mo</strong>
                {" · "}
                {t("No PMI with VA", "Sin PMI con VA")} ✓
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {result.breakdown.map((line, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-cc-ivory border-cc-sand-dark/20">
                  <span className="text-sm font-semibold text-cc-navy">
                    {language === "es" ? line.labelEs : line.label}
                  </span>
                  <span className="text-sm font-semibold text-cc-navy">{fmt(line.value)}/mo</span>
                </div>
              ))}

              {result.vaFundingFee > 0 && (
                <div className="flex items-center justify-between p-4 rounded-xl border bg-cc-gold/10 border-cc-gold/30">
                  <div>
                    <span className="text-sm font-bold text-cc-navy">
                      {t("VA Funding Fee", "Cargo de Financiamiento VA")}
                    </span>
                    <p className="text-xs text-cc-slate">
                      {t(`${result.vaFundingFeePercent.toFixed(2)}% — can be financed into loan`, `${result.vaFundingFeePercent.toFixed(2)}% — puede financiarse en el préstamo`)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-cc-navy">{fmt(result.vaFundingFee)}</span>
                </div>
              )}

              {isDisabilityExempt && (
                <div className="flex items-center justify-between p-4 rounded-xl border bg-cc-gold/10 border-cc-gold/30">
                  <span className="text-sm font-semibold text-cc-navy">
                    {t("VA Funding Fee: Exempt ✓", "Cargo VA: Exento ✓")}
                  </span>
                  <span className="text-sm font-semibold text-cc-navy">{fmt(0)}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-cc-slate/60 leading-relaxed mb-8">
              {t(
                "Based on VA loan guidelines and Tucson/Pima County property tax rates. Actual terms depend on your lender and Certificate of Eligibility. This is not a pre-qualification.",
                "Basado en las pautas de préstamos VA y tasas de impuestos del Condado de Pima. Los términos reales dependen de tu prestamista y Certificado de Elegibilidad. Esto no es una pre-calificación."
              )}
            </p>

            <div className="bg-cc-sand rounded-2xl p-6 text-center border border-cc-sand-dark/20">
              <p className="font-serif text-lg font-bold text-cc-navy mb-2">
                {t("Ready to explore Tucson neighborhoods?", "¿Listo para explorar vecindarios en Tucson?")}
              </p>
              <p className="text-cc-charcoal text-sm mb-4">
                {t(
                  "Kasandra has helped many military families find homes near Davis-Monthan. She understands PCS timelines and VA requirements.",
                  "Kasandra ha ayudado a muchas familias militares a encontrar hogares cerca de Davis-Monthan. Entiende los cronogramas PCS y requisitos VA."
                )}
              </p>
              <Button
                onClick={() => openChat({
                  source: "bah_calculator" as const,
                  intent: "buy",
                  estimatedBudget: result.maxPrice,
                })}
                className="bg-cc-navy text-white rounded-full px-8 font-semibold"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("Ask Selena About VA Homes", "Preguntarle a Selena Sobre Casas VA")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link to="/book?intent=buy&source=bah_calculator" className="inline-block mt-3">
                <Button className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t("Talk to Kasandra", "Hablar Con Kasandra")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
      {/* V2: BAH Tool Result Lead Capture */}
      {calculated && result.maxPrice > 0 && (
        <section className="pb-8 bg-white">
          <div className="container mx-auto px-4 max-w-2xl">
            <ToolResultLeadCapture
              toolType="bah"
              resultData={{ max_price: result.maxPrice, va_funding_fee: result.vaFundingFee }}
              delayMs={2500}
            />
          </div>
        </section>
      )}
    </>
  );
};

const V2BAHCalculator = () => {
  useDocumentHead({
    titleEn: "BAH Calculator | Military Home Buying Power in Tucson — Kasandra Prieto",
    titleEs: "Calculadora BAH | Poder de Compra Militar en Tucson — Kasandra Prieto",
    descriptionEn: "Turn your BAH into Tucson home buying power. VA loan calculator for Davis-Monthan AFB families — $0 down, no PMI, funding fee estimates.",
    descriptionEs: "Convierte tu BAH en poder de compra en Tucson. Calculadora VA para familias de Davis-Monthan — $0 de enganche, sin PMI.",
  });

  return (
    <V2Layout>
      <V2BAHCalculatorContent />
    </V2Layout>
  );
};

export default V2BAHCalculator;
