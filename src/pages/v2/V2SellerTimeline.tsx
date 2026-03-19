import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { useMarketPulse } from "@/hooks/useMarketPulse";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { logEvent } from "@/lib/analytics/logEvent";
import {
  updateSessionContext,
  setFieldIfEmpty,
  getSessionContext,
} from "@/lib/analytics/selenaSession";
import {
  Calendar, ArrowRight, ArrowLeft, CheckCircle2, Clock,
  Home, MapPin, MessageCircle, ListChecks, Key, ClipboardList,
  TrendingUp, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CloseWindow =
  | "asap"      // under 60 days
  | "2mo"       // ~2 months
  | "3mo"       // ~3 months
  | "4mo"       // ~4 months
  | "5mo"       // ~5 months
  | "6plus";    // 6+ months

type ReadinessState =
  | "just_thinking"
  | "ready_to_prep"
  | "already_listed"
  | "must_move_fast";

interface WizardState {
  closeWindow?: CloseWindow;
  readiness?: ReadinessState;
  zip?: string;
  estimatedValue?: string;
}

// ─── Phase Engine ─────────────────────────────────────────────────────────────

interface PhaseData {
  id: string;
  labelEn: string;
  labelEs: string;
  icon: React.ReactNode;
  colorClass: string;
  weekRangeEn: string;
  weekRangeEs: string;
  dateRange: string; // calculated
  actionsEn: string[];
  actionsEs: string[];
  isActive?: boolean;
  isPast?: boolean;
}

const CLOSE_WINDOW_WEEKS: Record<CloseWindow, number> = {
  asap: 8,
  "2mo": 9,
  "3mo": 13,
  "4mo": 17,
  "5mo": 21,
  "6plus": 26,
};

function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function fmtDate(d: Date, lang: "en" | "es"): string {
  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  return d.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", opts);
}

function fmtMonth(d: Date, lang: "en" | "es"): string {
  const opts: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
  return d.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", opts);
}

function buildPhases(
  closeWindow: CloseWindow,
  readiness: ReadinessState,
  lang: "en" | "es"
): PhaseData[] {
  const today = new Date();
  const totalWeeks = CLOSE_WINDOW_WEEKS[closeWindow];
  const closeDate = addWeeks(today, totalWeeks);

  // Compressed timeline adjustments for ASAP/2mo
  const isCompressed = closeWindow === "asap" || closeWindow === "2mo";

  // Phase 1: Strategic Prep
  // Starts: now (or week -totalWeeks from close)
  // Ends: week -totalWeeks+prepDuration
  const prepDuration = isCompressed ? 1 : 3;
  const prepStart = today;
  const prepEnd = addWeeks(today, prepDuration);

  // Phase 2: Home Prep & Staging
  const stagingDuration = isCompressed ? 1 : 3;
  const stagingStart = prepEnd;
  const stagingEnd = addWeeks(prepEnd, stagingDuration);

  // Phase 3: Active on Market
  // Tucson median DOM: 38 days (~5-6 weeks)
  const domWeeks = isCompressed ? 3 : 5;
  const listStart = stagingEnd;
  const listEnd = addWeeks(listStart, domWeeks);

  // Phase 4: Under Contract to Close
  // 30-45 days contract period
  const contractStart = listEnd;
  const contractEnd = addWeeks(contractStart, isCompressed ? 4 : 6);

  // Warning if timeline is too compressed
  const estimatedClose = contractEnd;

  const phases: PhaseData[] = [
    {
      id: "strategic_prep",
      labelEn: "Strategic Preparation",
      labelEs: "Preparación Estratégica",
      icon: <ClipboardList className="w-5 h-5" />,
      colorClass: "border-cc-gold bg-cc-gold/5",
      weekRangeEn: isCompressed ? "Week 1" : "Weeks 1–3",
      weekRangeEs: isCompressed ? "Semana 1" : "Semanas 1–3",
      dateRange:
        lang === "es"
          ? `${fmtDate(prepStart, "es")} – ${fmtDate(prepEnd, "es")}`
          : `${fmtDate(prepStart, "en")} – ${fmtDate(prepEnd, "en")}`,
      actionsEn: [
        "Get a Comparative Market Analysis (CMA) — your pricing anchor",
        "Identify and budget for any deferred maintenance items",
        "Interview agents and confirm your selling strategy",
      ],
      actionsEs: [
        "Obtén un Análisis Comparativo de Mercado (CMA) — tu ancla de precios",
        "Identifica y presupuesta cualquier trabajo de mantenimiento diferido",
        "Entrevista agentes y confirma tu estrategia de venta",
      ],
    },
    {
      id: "home_prep_staging",
      labelEn: "Home Prep & Staging",
      labelEs: "Preparación del Hogar",
      icon: <Home className="w-5 h-5" />,
      colorClass: "border-cc-navy/30 bg-cc-navy/5",
      weekRangeEn: isCompressed ? "Week 2" : "Weeks 4–6",
      weekRangeEs: isCompressed ? "Semana 2" : "Semanas 4–6",
      dateRange:
        lang === "es"
          ? `${fmtDate(stagingStart, "es")} – ${fmtDate(stagingEnd, "es")}`
          : `${fmtDate(stagingStart, "en")} – ${fmtDate(stagingEnd, "en")}`,
      actionsEn: [
        "Deep clean, declutter, and neutralize the space",
        "Complete agreed repairs — focus on inspection-stoppers first",
        "Schedule professional photography (HDR + drone if available)",
      ],
      actionsEs: [
        "Limpeza profunda, despeje y neutraliza el espacio",
        "Completa las reparaciones acordadas — primero las que detienen inspecciones",
        "Programa fotografía profesional (HDR + dron si está disponible)",
      ],
    },
    {
      id: "active_market",
      labelEn: "Active on Market",
      labelEs: "Activo en el Mercado",
      icon: <TrendingUp className="w-5 h-5" />,
      colorClass: "border-cc-gold/60 bg-white",
      weekRangeEn: `~${domWeeks} weeks (Tucson median: 38 days)`,
      weekRangeEs: `~${domWeeks} semanas (mediana Tucson: 38 días)`,
      dateRange:
        lang === "es"
          ? `${fmtDate(listStart, "es")} – ${fmtDate(listEnd, "es")}`
          : `${fmtDate(listStart, "en")} – ${fmtDate(listEnd, "en")}`,
      actionsEn: [
        "Go live on MLS — first 14 days are your peak traffic window",
        "Review showing feedback at day 7 — price adjust if needed by day 14",
        "Evaluate offers on price, terms, financing type, and contingencies",
      ],
      actionsEs: [
        "Lanzamiento en MLS — los primeros 14 días son tu ventana de tráfico máximo",
        "Revisa los comentarios de visitas al día 7 — ajusta el precio si es necesario al día 14",
        "Evalúa ofertas en precio, términos, tipo de financiamiento y contingencias",
      ],
    },
    {
      id: "under_contract",
      labelEn: "Under Contract → Close",
      labelEs: "Bajo Contrato → Cierre",
      icon: <Key className="w-5 h-5" />,
      colorClass: "border-green-200 bg-green-50",
      weekRangeEn: "30–45 days",
      weekRangeEs: "30–45 días",
      dateRange:
        lang === "es"
          ? `${fmtDate(contractStart, "es")} → ${fmtDate(closeDate, "es")}`
          : `${fmtDate(contractStart, "en")} → ${fmtDate(closeDate, "en")}`,
      actionsEn: [
        "Buyer inspection period (typically 10 days in Arizona)",
        "Appraisal ordered by lender — usually completes within 2 weeks",
        "Final walkthrough, title clear, funding, and close",
      ],
      actionsEs: [
        "Período de inspección del comprador (típicamente 10 días en Arizona)",
        "Tasación ordenada por el prestamista — generalmente completa en 2 semanas",
        "Revisión final, título libre, fondos y cierre",
      ],
    },
  ];

  // Mark readiness-based active phase
  const activeIndex =
    readiness === "already_listed"
      ? 2
      : readiness === "must_move_fast"
      ? 0
      : readiness === "ready_to_prep"
      ? 1
      : 0;

  return phases.map((p, i) => ({
    ...p,
    isActive: i === activeIndex,
    isPast: i < activeIndex,
  }));
}

// ─── Step 1: Target Close Window ─────────────────────────────────────────────

const CLOSE_OPTIONS: { value: CloseWindow; labelEn: string; labelEs: string; subEn: string; subEs: string }[] = [
  { value: "asap", labelEn: "As soon as possible", labelEs: "Lo antes posible", subEn: "Under 60 days — compressed timeline", subEs: "Menos de 60 días — cronograma comprimido" },
  { value: "2mo", labelEn: "~2 months", labelEs: "~2 meses", subEn: "Tight but workable", subEs: "Ajustado pero factible" },
  { value: "3mo", labelEn: "~3 months", labelEs: "~3 meses", subEn: "Standard Tucson window", subEs: "Ventana estándar en Tucson" },
  { value: "4mo", labelEn: "~4 months", labelEs: "~4 meses", subEn: "Comfortable — good prep time", subEs: "Cómodo — buen tiempo de preparación" },
  { value: "5mo", labelEn: "~5 months", labelEs: "~5 meses", subEn: "Plenty of runway", subEs: "Amplio margen de tiempo" },
  { value: "6plus", labelEn: "6+ months", labelEs: "6+ meses", subEn: "Long runway — strategic planning mode", subEs: "Largo plazo — modo de planificación estratégica" },
];

interface Step1Props {
  initial?: CloseWindow;
  onNext: (v: CloseWindow) => void;
}

const StepCloseDate = ({ initial, onNext }: Step1Props) => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<CloseWindow | undefined>(initial);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-cc-gold" />
          <span className="text-xs font-semibold text-cc-gold uppercase tracking-wider">
            {t("Seller Timeline Planner", "Planificador de Cronograma")}
          </span>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-2">
          {t("When do you want to close?", "¿Cuándo quieres cerrar?")}
        </h2>
        <p className="text-cc-text-muted text-sm">
          {t(
            "Your target close date is the anchor for everything else — pricing, prep, and listing strategy.",
            "Tu fecha objetivo de cierre es el ancla para todo lo demás: precio, preparación y estrategia de listado."
          )}
        </p>
      </div>

      <div className="space-y-3">
        {CLOSE_OPTIONS.map(opt => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`w-full text-left px-5 py-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-cc-navy text-white border-cc-navy shadow-soft"
                  : "bg-white text-cc-charcoal border-cc-sand-dark/40 hover:border-cc-navy/40"
              }`}
            >
              <span className="font-semibold text-base block">
                {t(opt.labelEn, opt.labelEs)}
              </span>
              <span className={`text-sm mt-0.5 block ${isSelected ? "text-white/70" : "text-cc-text-muted"}`}>
                {t(opt.subEn, opt.subEs)}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        onClick={() => selected && onNext(selected)}
        disabled={!selected}
        className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-3 shadow-gold text-base"
      >
        {t("Build My Timeline", "Construir Mi Cronograma")}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

// ─── Step 2: Readiness State ──────────────────────────────────────────────────

const READINESS_OPTIONS: { value: ReadinessState; labelEn: string; labelEs: string; subEn: string; subEs: string }[] = [
  { value: "just_thinking", labelEn: "Still thinking it through", labelEs: "Todavía lo estoy pensando", subEn: "Early stage — exploring options", subEs: "Etapa temprana — explorando opciones" },
  { value: "ready_to_prep", labelEn: "Ready to start prepping", labelEs: "Listo/a para empezar a preparar", subEn: "Committed — starting the process", subEs: "Comprometido/a — iniciando el proceso" },
  { value: "already_listed", labelEn: "Already listed or about to list", labelEs: "Ya listada o a punto de listar", subEn: "Active — need to manage the market phase", subEs: "Activo/a — necesito manejar la fase de mercado" },
  { value: "must_move_fast", labelEn: "Need to move fast — timeline pressure", labelEs: "Necesito moverme rápido — presión de tiempo", subEn: "Urgency driver: relocation, financial, or life event", subEs: "Factor urgente: reubicación, finanzas o evento de vida" },
];

interface Step2Props {
  initial?: ReadinessState;
  onNext: (v: ReadinessState) => void;
  onBack: () => void;
}

const StepReadiness = ({ initial, onNext, onBack }: Step2Props) => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<ReadinessState | undefined>(initial);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-2">
          {t("Where are you in the process?", "¿Dónde estás en el proceso?")}
        </h2>
        <p className="text-cc-text-muted text-sm">
          {t(
            "This helps us show you which phase you're actually in — not just a generic timeline.",
            "Esto nos ayuda a mostrarte en qué fase estás realmente, no solo un cronograma genérico."
          )}
        </p>
      </div>

      <div className="space-y-3">
        {READINESS_OPTIONS.map(opt => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`w-full text-left px-5 py-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-cc-navy text-white border-cc-navy shadow-soft"
                  : "bg-white text-cc-charcoal border-cc-sand-dark/40 hover:border-cc-navy/40"
              }`}
            >
              <span className="font-semibold text-base block">
                {t(opt.labelEn, opt.labelEs)}
              </span>
              <span className={`text-sm mt-0.5 block ${isSelected ? "text-white/70" : "text-cc-text-muted"}`}>
                {t(opt.subEn, opt.subEs)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="text-cc-text-muted rounded-full">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("Back", "Atrás")}
        </Button>
        <Button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="flex-1 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-3 shadow-gold"
        >
          {t("Continue", "Continuar")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// ─── Step 3: Property Context (optional) ─────────────────────────────────────

interface Step3Props {
  initial?: { zip?: string; estimatedValue?: string };
  onNext: (v: { zip: string; estimatedValue: string }) => void;
  onBack: () => void;
}

const StepProperty = ({ initial, onNext, onBack }: Step3Props) => {
  const { t } = useLanguage();
  const [zip, setZip] = useState(initial?.zip ?? "");
  const [value, setValue] = useState(initial?.estimatedValue ?? "");

  const handleSkip = () => onNext({ zip: zip || "", estimatedValue: value || "" });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-2">
          {t("Your property — quick context", "Tu propiedad — contexto rápido")}
        </h2>
        <p className="text-cc-text-muted text-sm">
          {t(
            "Optional — helps personalize your timeline. Skip if you prefer.",
            "Opcional — ayuda a personalizar tu cronograma. Omite si prefieres."
          )}
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t("ZIP Code", "Código Postal")}
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder="e.g. 85718"
            value={zip}
            onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
            className="w-full px-5 py-3 rounded-full border border-cc-sand-dark/40 focus:border-cc-navy/40 focus:outline-none text-cc-charcoal"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-cc-navy uppercase tracking-wider flex items-center gap-2">
            <Home className="w-4 h-4" />
            {t("Estimated Home Value", "Valor Estimado del Hogar")}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cc-slate font-medium">$</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="350,000"
              value={value}
              onChange={e => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setValue(raw ? parseInt(raw).toLocaleString() : "");
              }}
              className="w-full pl-8 pr-4 py-3 rounded-full border border-cc-sand-dark/40 focus:border-cc-navy/40 focus:outline-none text-cc-charcoal"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="text-cc-text-muted rounded-full">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("Back", "Atrás")}
        </Button>
        <Button
          onClick={handleSkip}
          className="flex-1 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-3 shadow-gold"
        >
          {zip || value ? t("Build My Plan", "Construir Mi Plan") : t("Skip & Build Plan", "Omitir y Construir Plan")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// ─── Step 4: Phase Plan Output ────────────────────────────────────────────────

const CLOSE_LABEL: Record<CloseWindow, { en: string; es: string }> = {
  asap: { en: "as soon as possible", es: "lo antes posible" },
  "2mo": { en: "in ~2 months", es: "en ~2 meses" },
  "3mo": { en: "in ~3 months", es: "en ~3 meses" },
  "4mo": { en: "in ~4 months", es: "en ~4 meses" },
  "5mo": { en: "in ~5 months", es: "en ~5 meses" },
  "6plus": { en: "in 6+ months", es: "en 6+ meses" },
};

interface Step4Props {
  wizardData: WizardState;
  onRestart: () => void;
}

const StepPhasePlan = ({ wizardData, onRestart }: Step4Props) => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();

  const phases = buildPhases(
    wizardData.closeWindow!,
    wizardData.readiness!,
    language
  );

  const closeLabel = CLOSE_LABEL[wizardData.closeWindow!];
  const isCompressed = wizardData.closeWindow === "asap" || wizardData.closeWindow === "2mo";

  const handleChat = () => {
    openChat({
      source: "seller_timeline",
      intent: "sell",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="w-5 h-5 text-cc-gold" />
          <span className="text-xs font-semibold text-cc-gold uppercase tracking-wider">
            {t("Your Seller Timeline", "Tu Cronograma de Vendedor")}
          </span>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-2">
          {t(
            `Your plan to close ${language === "en" ? closeLabel.en : closeLabel.es}`,
            `Tu plan para cerrar ${closeLabel.es}`
          )}
        </h2>
        {isCompressed && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              {t(
                "Compressed timeline: every phase needs to move in parallel. Kasandra can help you prioritize what matters most.",
                "Cronograma comprimido: cada fase necesita avanzar en paralelo. Kasandra puede ayudarte a priorizar lo que importa más."
              )}
            </p>
          </div>
        )}
      </div>

      {/* Phase Cards */}
      <div className="space-y-4">
        {phases.map((phase, i) => (
          <div
            key={phase.id}
            className={`rounded-2xl border-2 p-5 transition-all ${phase.colorClass} ${
              phase.isActive ? "shadow-soft ring-1 ring-cc-gold/30" : ""
            } ${phase.isPast ? "opacity-60" : ""}`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${phase.isActive ? "bg-cc-gold/20" : "bg-white/60"}`}>
                  {phase.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cc-slate font-medium">
                      {t("Phase", "Fase")} {i + 1}
                    </span>
                    {phase.isActive && (
                      <span className="text-xs font-semibold text-cc-gold bg-cc-gold/10 px-2 py-0.5 rounded-full">
                        {t("You Are Here", "Estás Aquí")}
                      </span>
                    )}
                    {phase.isPast && (
                      <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                        {t("Complete", "Completado")}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-cc-navy text-lg leading-tight">
                    {t(phase.labelEn, phase.labelEs)}
                  </h3>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-cc-slate text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{t(phase.weekRangeEn, phase.weekRangeEs)}</span>
                </div>
              </div>
            </div>

            <div className="text-xs font-medium text-cc-navy/70 bg-white/50 rounded-lg px-3 py-1.5 mb-3 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {phase.dateRange}
            </div>

            <ul className="space-y-2">
              {(language === "es" ? phase.actionsEs : phase.actionsEn).map((action, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm text-cc-charcoal">
                  <CheckCircle2 className="w-4 h-4 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Selena CTA */}
      <div className="bg-cc-navy rounded-2xl p-6 text-center">
        <p className="font-serif text-xl font-bold text-white mb-1">
          {t("Walk through this timeline with Kasandra", "Revisa este cronograma con Kasandra")}
        </p>
        <p className="text-white/70 text-sm mb-5">
          {t(
            "Every seller's situation is different. Kasandra can confirm which phase you're actually in, what to do first, and what typically trips people up at each step.",
            "La situación de cada vendedor es diferente. Kasandra puede confirmar en qué fase estás realmente, qué hacer primero y qué obstáculos suelen surgir en cada paso."
          )}
        </p>
        <Button
          onClick={handleChat}
          className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {t("Talk Through My Timeline", "Hablar Sobre Mi Cronograma")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-white/40 text-xs mt-3">
          {t("No pressure. No obligation.", "Sin presión. Sin obligación.")}
        </p>
      </div>

      {/* Restart */}
      <div className="text-center">
        <button
          onClick={onRestart}
          className="text-sm text-cc-slate hover:text-cc-navy transition-colors underline underline-offset-4"
        >
          {t("Start over with a different timeline", "Empezar de nuevo con un cronograma diferente")}
        </button>
      </div>
    </div>
  );
};

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

const V2SellerTimeline = () => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardState>({});

  useDocumentHead({
    titleEn: "Seller Timeline Planner | Tucson Home Sale Roadmap",
    titleEs: "Planificador de Cronograma del Vendedor | Hoja de Ruta de Venta en Tucson",
    descriptionEn:
      "Build a personalized home-selling timeline for Tucson. See exactly what needs to happen — and when — to hit your target close date.",
    descriptionEs:
      "Construye un cronograma personalizado de venta de tu casa en Tucson. Ve exactamente qué debe suceder — y cuándo — para alcanzar tu fecha objetivo de cierre.",
  });

  const progressPercent = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100);
  const isComplete = step === TOTAL_STEPS;

  const goTo = useCallback((n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleStep1 = useCallback(
    (closeWindow: CloseWindow) => {
      setWizardData(prev => ({ ...prev, closeWindow }));
      setFieldIfEmpty("intent", "sell");
      logEvent('tool_started', { tool: 'seller_timeline' });
      updateSessionContext({
        last_quiz_id: "seller_timeline",
        timeline:
          closeWindow === "asap"
            ? "asap"
            : closeWindow === "2mo" || closeWindow === "3mo"
            ? "30_days"
            : closeWindow === "4mo" || closeWindow === "5mo"
            ? "60_90"
            : "exploring",
      });
      logEvent("seller_timeline_step_completed", { step: 1, closeWindow });
      goTo(2);
    },
    [goTo]
  );

  const handleStep2 = useCallback(
    (readiness: ReadinessState) => {
      setWizardData(prev => ({ ...prev, readiness }));
      updateSessionContext({
        seller_decision_step: 1,
        seller_goal_priority:
          readiness === "must_move_fast"
            ? "speed"
            : readiness === "just_thinking"
            ? "not_sure"
            : "price",
      });
      logEvent("seller_timeline_step_completed", { step: 2, readiness });
      goTo(3);
    },
    [goTo]
  );

  const handleStep3 = useCallback(
    (data: { zip: string; estimatedValue: string }) => {
      setWizardData(prev => ({ ...prev, ...data }));
      if (data.zip) updateSessionContext({ last_neighborhood_zip: data.zip });
      if (data.estimatedValue) {
        const numVal = parseFloat(data.estimatedValue.replace(/,/g, ""));
        if (!isNaN(numVal)) updateSessionContext({ estimated_value: numVal });
      }
      logEvent("seller_timeline_step_completed", { step: 3, has_zip: !!data.zip, has_value: !!data.estimatedValue });
      // Fire Level 3 completion event
      const ctx = getSessionContext();
      updateSessionContext({
        last_tool_completed: "seller_timeline",
        tools_completed: [...new Set([...(ctx?.tools_completed ?? []), "seller_timeline"])],
        quiz_completed: true,
        quiz_result_path: "selling",
      });
      logEvent("seller_timeline_completed", {
        close_window: wizardData.closeWindow,
        readiness: wizardData.readiness,
      });
      logEvent('tool_completed', { tool: 'seller_timeline', close_window: wizardData.closeWindow, readiness: wizardData.readiness });
      goTo(4);
    },
    [goTo, wizardData]
  );

  const handleRestart = useCallback(() => {
    setWizardData({});
    goTo(1);
  }, [goTo]);

  return (
    <V2Layout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Progress bar */}
        {!isComplete && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-cc-navy uppercase tracking-wider">
                {t(`Step ${step} of ${TOTAL_STEPS - 1}`, `Paso ${step} de ${TOTAL_STEPS - 1}`)}
              </span>
              <span className="text-xs text-cc-text-muted">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-cc-sand" />
          </div>
        )}

        {step === 1 && (
          <StepCloseDate initial={wizardData.closeWindow} onNext={handleStep1} />
        )}
        {step === 2 && (
          <StepReadiness
            initial={wizardData.readiness}
            onNext={handleStep2}
            onBack={() => goTo(1)}
          />
        )}
        {step === 3 && (
          <StepProperty
            initial={{ zip: wizardData.zip, estimatedValue: wizardData.estimatedValue }}
            onNext={handleStep3}
            onBack={() => goTo(2)}
          />
        )}
        {step === 4 && wizardData.closeWindow && wizardData.readiness && (
          <StepPhasePlan wizardData={wizardData} onRestart={handleRestart} />
        )}
      </div>
    </V2Layout>
  );
};

export default V2SellerTimeline;
