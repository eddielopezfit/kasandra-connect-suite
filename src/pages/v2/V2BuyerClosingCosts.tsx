import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { logEvent } from "@/lib/analytics/logEvent";
import { setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { MessageCircle, ArrowRight, Info, DollarSign, Home, Percent, FileText, Calendar } from "lucide-react";

interface CalcInputs {
  purchasePrice: string;
  loanType: "conventional" | "fha" | "va" | "cash";
  downPctInput: string;
  isFirstTimeBuyer: boolean;
}

interface CostLine {
  label: string;
  labelEs: string;
  low: number;
  high: number;
  note?: string;
  noteEs?: string;
  highlight?: boolean;
}

function buildCostLines(
  price: number,
  loanType: "conventional" | "fha" | "va" | "cash",
  downPct: number,
  isFirstTime: boolean
): CostLine[] {
  const loanAmt = price * (1 - downPct / 100);
  const lines: CostLine[] = [];

  // Title insurance (buyer's policy) — AZ typical
  lines.push({
    label: "Title Insurance (Buyer's Policy)",
    labelEs: "Seguro de Título (Póliza del Comprador)",
    low: price * 0.004,
    high: price * 0.006,
    note: "One-time premium — protects your ownership",
    noteEs: "Prima única — protege tu titularidad",
  });

  // Escrow / closing fee
  lines.push({
    label: "Escrow & Closing Fee",
    labelEs: "Honorarios de Cierre y Depósito en Garantía",
    low: price * 0.003,
    high: price * 0.005,
    note: "Paid to the title/escrow company",
    noteEs: "Pagado a la empresa de título",
  });

  // Home inspection
  lines.push({
    label: "Home Inspection",
    labelEs: "Inspección del Hogar",
    low: 350,
    high: 600,
    note: "Strongly recommended in Arizona",
    noteEs: "Muy recomendada en Arizona",
  });

  // Appraisal (lender-required)
  if (loanType !== "cash") {
    lines.push({
      label: "Appraisal",
      labelEs: "Avalúo",
      low: 450,
      high: 750,
      note: "Required by lender",
      noteEs: "Requerido por el prestamista",
    });
  }

  // Loan origination fee
  if (loanType !== "cash") {
    lines.push({
      label: "Loan Origination Fee",
      labelEs: "Comisión de Originación del Préstamo",
      low: loanAmt * 0.005,
      high: loanAmt * 0.01,
      note: "Lender fee — negotiate this",
      noteEs: "Comisión del prestamista — se puede negociar",
    });
  }

  // FHA mortgage insurance premium (upfront)
  if (loanType === "fha") {
    lines.push({
      label: "FHA Upfront MIP (1.75%)",
      labelEs: "Prima de Seguro Hipotecario FHA (1.75%)",
      low: loanAmt * 0.0175,
      high: loanAmt * 0.0175,
      note: "Can be rolled into loan",
      noteEs: "Se puede incluir en el préstamo",
      highlight: true,
    });
  }

  // VA funding fee
  if (loanType === "va") {
    const vaFee = isFirstTime ? 0.023 : 0.036;
    lines.push({
      label: `VA Funding Fee (${(vaFee * 100).toFixed(1)}%)`,
      labelEs: `Cargo de Financiamiento VA (${(vaFee * 100).toFixed(1)}%)`,
      low: loanAmt * vaFee,
      high: loanAmt * vaFee,
      note: isFirstTime ? "First-time use rate — can be rolled in" : "Subsequent use rate — can be rolled in",
      noteEs: isFirstTime ? "Tasa de primer uso — puede incluirse" : "Tasa de uso posterior — puede incluirse",
      highlight: true,
    });
  }

  // Prepaid items — property taxes (2 months reserve)
  lines.push({
    label: "Property Tax Reserve (2 months)",
    labelEs: "Reserva de Impuestos (2 meses)",
    low: (price * 0.007) / 6,
    high: (price * 0.011) / 6,
    note: "Held in escrow by lender",
    noteEs: "Retenido en depósito por el prestamista",
  });

  // Prepaid homeowners insurance
  lines.push({
    label: "Homeowners Insurance (1st year)",
    labelEs: "Seguro del Propietario (1er año)",
    low: price * 0.003,
    high: price * 0.005,
    note: "Required before closing",
    noteEs: "Requerido antes del cierre",
  });

  // Prepaid interest (15 days avg)
  if (loanType !== "cash") {
    const dailyInterest = (loanAmt * 0.07) / 365;
    lines.push({
      label: "Prepaid Interest (~15 days)",
      labelEs: "Interés Prepagado (~15 días)",
      low: dailyInterest * 10,
      high: dailyInterest * 20,
      note: "Depends on closing date",
      noteEs: "Depende de la fecha de cierre",
    });
  }

  // Recording fees — AZ
  lines.push({
    label: "Recording Fees",
    labelEs: "Honorarios de Registro",
    low: 30,
    high: 80,
    note: "County recorder — typically small",
    noteEs: "Registrador del condado — generalmente pequeño",
  });

  return lines;
}

const fmt = (n: number) =>
  n >= 1000
    ? `$${Math.round(n / 100) * 100 >= 1000 ? (Math.round(n / 100) * 100).toLocaleString() : Math.round(n).toLocaleString()}`
    : `$${Math.round(n).toLocaleString()}`;

const fmtRange = (low: number, high: number) =>
  Math.abs(high - low) < 50 ? fmt(low) : `${fmt(low)} – ${fmt(high)}`;

const V2BuyerClosingCostsContent = () => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();

  useDocumentHead({
    titleEn: "Buyer Closing Cost Estimator | Tucson, Arizona",
    titleEs: "Estimador de Costos de Cierre para Compradores | Tucson, Arizona",
    descriptionEn: "Estimate your buyer closing costs in Tucson, Arizona for conventional, FHA, VA, or cash purchases. Understand every line item before you make an offer.",
    descriptionEs: "Estima tus costos de cierre como comprador en Tucson, Arizona para compras convencionales, FHA, VA o en efectivo.",
  });

  const [inputs, setInputs] = useState<CalcInputs>({
    purchasePrice: "",
    loanType: "conventional",
    downPctInput: "20",
    isFirstTimeBuyer: true,
  });
  const [calculated, setCalculated] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const upd = <K extends keyof CalcInputs>(k: K, v: CalcInputs[K]) =>
    setInputs(prev => ({ ...prev, [k]: v }));

  const price = parseFloat(inputs.purchasePrice.replace(/,/g, "")) || 0;
  const isCash = inputs.loanType === "cash";
  const downPct = parseFloat(inputs.downPctInput) || 10;
  const downAmt = isCash ? 0 : price * (downPct / 100);
  const loanAmt = price - downAmt;

  const minDown = inputs.loanType === "fha" ? 3.5 : inputs.loanType === "va" ? 0 : 3;

  const lines = useMemo(() => {
    if (price < 50000) return [];
    return buildCostLines(price, inputs.loanType, downPct, inputs.isFirstTimeBuyer);
  }, [price, inputs.loanType, downPct, inputs.isFirstTimeBuyer]);

  const totLow = lines.reduce((s, l) => s + l.low, 0);
  const totHigh = lines.reduce((s, l) => s + l.high, 0);
  const cashNeeded = (isCash ? price : downAmt) + (totLow + totHigh) / 2;

  const handleCalculate = () => {
    if (price < 50000) return;
    setCalculated(true);
    setFieldIfEmpty('intent', 'buy');
    logEvent('calculator_complete', { tool: 'buyer_closing_costs', price, loan_type: inputs.loanType });
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const chipClass = (active: boolean) =>
    `px-4 py-2.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
      active
        ? "bg-cc-navy text-white border-cc-navy shadow-soft"
        : "bg-white text-cc-charcoal border-cc-sand-dark/40 hover:border-cc-navy/40"
    }`;

  return (
    <>
      {/* Hero */}
      <section className="bg-cc-navy py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
            {t("For Buyers", "Para Compradores")}
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mt-2 mb-4">
            {t("Know Your", "Conoce Tus")}
            <span className="text-cc-gold"> {t("Closing Costs", "Costos de Cierre")}</span>
          </h1>
          <p className="text-white/75 text-lg max-w-2xl">
            {t(
              "Every line item — conventional, FHA, VA, or cash — before you make an offer.",
              "Cada rubro — convencional, FHA, VA o efectivo — antes de hacer una oferta."
            )}
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-14 bg-cc-ivory">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl border border-cc-sand-dark/30 shadow-soft p-8 space-y-8">

            {/* Purchase price */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider flex items-center gap-2">
                <Home className="w-4 h-4" />
                {t("Purchase Price", "Precio de Compra")}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cc-slate font-medium">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="350,000"
                  value={inputs.purchasePrice}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    upd("purchasePrice", raw ? parseInt(raw).toLocaleString() : "");
                    setCalculated(false);
                  }}
                  className="w-full pl-8 pr-4 py-3 rounded-full border border-cc-sand-dark/40 focus:border-cc-navy/40 focus:outline-none text-cc-charcoal"
                />
              </div>
            </div>

            {/* Loan type */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t("Loan Type", "Tipo de Préstamo")}
              </label>
              <div className="flex flex-wrap gap-2">
                {(["conventional", "fha", "va", "cash"] as const).map(lt => (
                  <button
                    key={lt}
                    className={chipClass(inputs.loanType === lt)}
                    onClick={() => { upd("loanType", lt); setCalculated(false); }}
                  >
                    {lt === "conventional" ? t("Conventional", "Convencional")
                      : lt === "fha" ? "FHA"
                      : lt === "va" ? "VA"
                      : t("Cash", "Efectivo")}
                  </button>
                ))}
              </div>
              {inputs.loanType === "va" && (
                <p className="text-xs text-cc-gold font-medium">
                  {t("VA loans available to eligible veterans, active-duty, and surviving spouses.", "Préstamos VA disponibles para veteranos elegibles, servicio activo y cónyuges sobrevivientes.")}
                </p>
              )}
            </div>

            {/* Down payment — hide for cash */}
            {inputs.loanType !== "cash" && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  {t("Down Payment", "Enganche")}
                </label>
                <div className="flex flex-wrap gap-2 overflow-x-auto max-w-full">
                  {([3, 3.5, 5, 10, 20].filter(p => p >= minDown)).map(p => (
                    <button
                      key={p}
                      className={chipClass(parseFloat(inputs.downPctInput) === p)}
                      onClick={() => { upd("downPctInput", String(p)); setCalculated(false); }}
                    >
                      {p}%
                    </button>
                  ))}
                  <input
                    type="number"
                    min={minDown}
                    max={80}
                    step={0.5}
                    placeholder={t("Custom %", "% Personalizado")}
                    value={inputs.downPctInput}
                    onChange={e => { upd("downPctInput", e.target.value); setCalculated(false); }}
                    className="w-28 px-4 py-2.5 rounded-full border border-cc-sand-dark/40 focus:border-cc-navy/40 focus:outline-none text-sm text-cc-charcoal"
                  />
                </div>
                {price > 0 && (
                  <p className="text-sm text-cc-slate">
                    {t("Down payment:", "Enganche:")} <strong className="text-cc-navy">{fmt(downAmt)}</strong>
                    {" · "}{t("Loan amount:", "Monto del préstamo:")} <strong className="text-cc-navy">{fmt(loanAmt)}</strong>
                  </p>
                )}
              </div>
            )}

            {/* First-time buyer (FHA/conventional only) */}
            {inputs.loanType === "va" && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
                  {t("VA Funding Fee", "Cargo de Financiamiento VA")}
                </label>
                <div className="flex gap-2">
                  <button
                    className={chipClass(inputs.isFirstTimeBuyer)}
                    onClick={() => { upd("isFirstTimeBuyer", true); setCalculated(false); }}
                  >
                    {t("First Use", "Primer Uso")}
                  </button>
                  <button
                    className={chipClass(!inputs.isFirstTimeBuyer)}
                    onClick={() => { upd("isFirstTimeBuyer", false); setCalculated(false); }}
                  >
                    {t("Subsequent Use", "Uso Posterior")}
                  </button>
                </div>
              </div>
            )}

            {/* Calculate button */}
            <Button
              onClick={handleCalculate}
              disabled={price < 50000}
              className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-3 shadow-gold text-base"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              {t("Estimate My Closing Costs", "Estimar Mis Costos de Cierre")}
            </Button>
          </div>
        </div>
      </section>

      {/* Results */}
      {calculated && lines.length > 0 && (
        <section ref={resultsRef} className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-2xl">
            {/* Total banner */}
            <div className="bg-cc-navy rounded-2xl p-6 mb-8 text-center">
              <p className="text-cc-gold text-sm font-semibold uppercase tracking-wider mb-1">
                {t("Estimated Closing Costs", "Costos de Cierre Estimados")}
              </p>
              <p className="font-serif text-4xl font-bold text-white">{fmtRange(totLow, totHigh)}</p>
              <p className="text-white/60 text-sm mt-2">
                {isCash
                  ? t(
                      `Total cash needed at closing: ~${fmt(cashNeeded)}`,
                      `Total de efectivo necesario al cierre: ~${fmt(cashNeeded)}`
                    )
                  : t(
                      `Total cash needed at closing (including ${fmt(downAmt)} down): ~${fmt(cashNeeded)}`,
                      `Total de efectivo necesario al cierre (incluyendo ${fmt(downAmt)} de enganche): ~${fmt(cashNeeded)}`
                    )
                }
              </p>
            </div>

            {/* Line items */}
            <div className="space-y-3">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${
                    line.highlight
                      ? "bg-cc-gold/5 border-cc-gold/30"
                      : "bg-cc-ivory border-cc-sand-dark/20"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-cc-navy">
                      {language === "es" ? line.labelEs : line.label}
                    </p>
                    {(line.note || line.noteEs) && (
                      <p className="text-xs text-cc-slate mt-0.5 flex items-start gap-1">
                        <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        {language === "es" ? (line.noteEs || line.note) : line.note}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-cc-navy whitespace-nowrap">
                    {fmtRange(line.low, line.high)}
                  </span>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-cc-slate/60 mt-6 leading-relaxed">
              {t(
                "These are estimates based on typical Tucson/Arizona closing costs. Actual costs vary by lender, title company, and negotiation. This is not a Loan Estimate or Closing Disclosure.",
                "Estas son estimaciones basadas en costos de cierre típicos en Tucson/Arizona. Los costos reales varían según el prestamista, la empresa de título y la negociación. Esto no es una Estimación de Préstamo ni una Declaración de Cierre."
              )}
            </p>

            {/* Selena CTA */}
            <div className="mt-8 bg-cc-sand rounded-2xl p-6 text-center border border-cc-sand-dark/20">
              <p className="font-serif text-lg font-bold text-cc-navy mb-2">
                {t("Questions about these numbers?", "¿Preguntas sobre estos números?")}
              </p>
              <p className="text-cc-charcoal text-sm mb-4">
                {t(
                  "Kasandra can walk you through what's negotiable, what programs can reduce these costs, and what to expect on your specific purchase.",
                  "Kasandra puede orientarte sobre qué es negociable, qué programas pueden reducir estos costos y qué esperar en tu compra específica."
                )}
              </p>
              <Button
                onClick={() => openChat({
                  source: 'buyer_closing_costs',
                  intent: 'buy',
                  ...(calculated && price >= 50000 ? {
                    closingCostData: {
                      purchasePrice: price,
                      loanType: inputs.loanType,
                      downPaymentPercent: downPct,
                      estimatedLow: totLow,
                      estimatedHigh: totHigh,
                      totalCashNeeded: cashNeeded,
                    }
                  } : {}),
                })}
                className="bg-cc-navy text-white rounded-full px-8 font-semibold"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("Ask Selena About My Costs", "Preguntarle a Selena Sobre Mis Costos")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link to="/book?intent=buy&source=closing_costs" className="inline-block mt-3">
                <Button className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t("Review This With Kasandra", "Revisar Esto Con Kasandra")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

const V2BuyerClosingCosts = () => (
  <V2Layout>
    <V2BuyerClosingCostsContent />
  </V2Layout>
);

export default V2BuyerClosingCosts;
