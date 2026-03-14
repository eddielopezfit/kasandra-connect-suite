import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import V2Layout from "@/components/v2/V2Layout";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateSessionId } from "@/lib/analytics/selenaSession";
import { updateSessionContext, setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";
import {
  MapPin, Home, DollarSign, Clock, CheckCircle2,
  ChevronRight, Star, Lock, Eye, ArrowRight, Sparkles
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TUCSON_AREAS = [
  { id: "foothills",   label: "Catalina Foothills",   labelEs: "Catalina Foothills" },
  { id: "midtown",     label: "Midtown / Central",     labelEs: "Midtown / Central" },
  { id: "northwest",   label: "Northwest / Marana",    labelEs: "Noroeste / Marana" },
  { id: "oro_valley",  label: "Oro Valley",            labelEs: "Oro Valley" },
  { id: "east_side",   label: "East Side / Rita Ranch", labelEs: "Lado Este / Rita Ranch" },
  { id: "south_side",  label: "South Side / Sahuarita", labelEs: "Lado Sur / Sahuarita" },
  { id: "downtown",    label: "Downtown / University",  labelEs: "Centro / Universidad" },
  { id: "green_valley",label: "Green Valley",           labelEs: "Green Valley" },
  { id: "open",        label: "Open — show me options", labelEs: "Abierto — muéstrame opciones" },
];

const PROPERTY_TYPES = [
  { id: "single_family", label: "Single-Family Home",   labelEs: "Casa Unifamiliar" },
  { id: "condo",         label: "Condo / Townhome",     labelEs: "Condominio / Townhome" },
  { id: "any",           label: "Either works for me",  labelEs: "Cualquiera me funciona" },
];

const TIMELINES = [
  { id: "ready_now",    label: "Ready to move now",       labelEs: "Listo para moverme ahora",       sub: "Actively searching" },
  { id: "1_3_months",   label: "Within 1–3 months",       labelEs: "En 1–3 meses",                   sub: "Getting serious" },
  { id: "3_6_months",   label: "Within 3–6 months",       labelEs: "En 3–6 meses",                   sub: "Planning ahead" },
  { id: "exploring",    label: "Just exploring right now", labelEs: "Solo explorando por ahora",      sub: "No rush" },
];

const BUDGET_RANGES = [
  { id: "200_300",  label: "Under $300K",     min: 0,      max: 300000  },
  { id: "300_400",  label: "$300K – $400K",   min: 300000, max: 400000  },
  { id: "400_500",  label: "$400K – $500K",   min: 400000, max: 500000  },
  { id: "500_700",  label: "$500K – $700K",   min: 500000, max: 700000  },
  { id: "700_plus", label: "$700K+",          min: 700000, max: 1500000 },
];

const BEDROOM_OPTIONS = [
  { id: 2, label: "2+" },
  { id: 3, label: "3+" },
  { id: 4, label: "4+" },
  { id: 5, label: "5+" },
];

const MUST_HAVES = [
  { id: "pool",         label: "Pool",             labelEs: "Piscina" },
  { id: "single_story", label: "Single story",     labelEs: "Un solo piso" },
  { id: "garage",       label: "2+ car garage",    labelEs: "Garaje para 2+ autos" },
  { id: "large_lot",    label: "Large lot (½ ac+)", labelEs: "Terreno grande (½ acre+)" },
  { id: "new_const",    label: "New construction", labelEs: "Construcción nueva" },
  { id: "mountain_view",label: "Mountain views",   labelEs: "Vistas a la montaña" },
  { id: "no_hoa",       label: "No HOA",           labelEs: "Sin HOA" },
  { id: "rv_parking",   label: "RV parking",       labelEs: "Estacionamiento para RV" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Criteria {
  areas: string[];
  budget: string;
  bedrooms: number;
  property_type: string;
  timeline: string;
  must_haves: string[];
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

// ─── Step Components ──────────────────────────────────────────────────────────

const StepIndicator = ({ step, total, t }: { step: number; total: number; t: (en: string, es: string) => string }) => (
  <div className="flex items-center gap-3 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
          ${i < step ? 'bg-cc-gold text-white' : i === step ? 'bg-cc-navy text-white' : 'bg-gray-200 text-gray-400'}
        `}>
          {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
        </div>
        {i < total - 1 && (
          <div className={`h-0.5 w-8 transition-all duration-300 ${i < step ? 'bg-cc-gold' : 'bg-gray-200'}`} />
        )}
      </div>
    ))}
    <span className="text-sm text-gray-500 ml-1">
      {t(`Step ${step + 1} of ${total}`, `Paso ${step + 1} de ${total}`)}
    </span>
  </div>
);

const ToggleChip = ({
  selected, onClick, children
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    type="button"
    className={`
      px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 cursor-pointer
      ${selected
        ? 'bg-cc-navy text-white border-cc-navy shadow-md scale-[1.02]'
        : 'bg-white text-gray-700 border-gray-200 hover:border-cc-navy/40 hover:bg-gray-50'
      }
    `}
  >
    {children}
  </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const V2OffMarketBuyerContent = () => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  useDocumentHead({
    titleEn: "Off-Market Homes | Kasandra Prieto — Realty Executives Arizona",
    titleEs: "Casas Fuera del Mercado | Kasandra Prieto — Realty Executives Arizona",
    descriptionEn: "Get exclusive access to off-market properties in Tucson. Kasandra Prieto connects you with sellers before they list.",
    descriptionEs: "Obtenga acceso exclusivo a propiedades fuera del mercado en Tucson. Kasandra le conecta con vendedores antes de publicar.",
  });
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0=criteria, 1=details, 2=contact, 3=confirmed
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [criteria, setCriteria] = useState<Criteria>({
    areas: [],
    budget: "",
    bedrooms: 3,
    property_type: "",
    timeline: "",
    must_haves: [],
  });

  const [contact, setContact] = useState<ContactInfo>({
    name: "",
    email: "",
    phone: "",
  });

  const toggleArea = (id: string) => {
    setCriteria(c => ({
      ...c,
      areas: c.areas.includes(id)
        ? c.areas.filter(a => a !== id)
        : [...c.areas, id],
    }));
  };

  const toggleMustHave = (id: string) => {
    setCriteria(c => ({
      ...c,
      must_haves: c.must_haves.includes(id)
        ? c.must_haves.filter(m => m !== id)
        : [...c.must_haves, id],
    }));
  };

  const step0Valid = criteria.areas.length > 0 && criteria.budget && criteria.timeline && criteria.property_type;
  const step1Valid = true; // must_haves optional
  const contactValid = contact.name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);

  const handleSubmit = useCallback(async () => {
    if (!contactValid || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const budgetRange = BUDGET_RANGES.find(b => b.id === criteria.budget);
      const sessionId = getOrCreateSessionId();

      const { data, error: fnError } = await supabase.functions.invoke("save-buyer-criteria", {
        body: {
          email: contact.email.trim().toLowerCase(),
          name: contact.name.trim(),
          phone: contact.phone.trim() || undefined,
          language,
          session_id: sessionId,
          source: "off_market_capture",
          buyer_criteria: {
            areas: criteria.areas,
            budget_min: budgetRange?.min ?? 0,
            budget_max: budgetRange?.max ?? 999999,
            bedrooms_min: criteria.bedrooms,
            property_type: criteria.property_type,
            timeline: criteria.timeline,
            must_haves: criteria.must_haves,
          },
        },
      });

      if (fnError || !data?.ok) throw new Error(data?.error || "Submission failed");

      // Enrich session
      setFieldIfEmpty("intent", "buy");
      updateSessionContext({ tool_used: "off_market_buyer", off_market_registered: true });

      logEvent("lead_capture", {
        source: "off_market_capture",
        intent: "buy",
      });

      setStep(3);

    } catch (err) {
      console.error("[OffMarketBuyer] Submit error:", err);
      setError(t(
        "Something went wrong. Please try again.",
        "Algo salió mal. Por favor intenta de nuevo."
      ));
    } finally {
      setSubmitting(false);
    }
  }, [contact, criteria, contactValid, submitting, language, t]);

  // ── Confirmed view ──────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-[100dvh] bg-cc-ivory">
        <section className="bg-cc-navy pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-cc-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              {t("You're on the list.", "Estás en la lista.")}
            </h1>
            <p className="text-white/80 max-w-lg mx-auto text-lg">
              {t(
                "Kasandra will personally reach out when a property matches your criteria — before it ever hits the market.",
                "Kasandra se pondrá en contacto personalmente cuando una propiedad coincida con tus criterios — antes de que llegue al mercado."
              )}
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="bg-white rounded-2xl shadow-elevated p-8 text-center">
              <p className="text-gray-700 mb-6">
                {t(
                  "In the meantime, Selena can answer questions about the buying process, neighborhoods, or financing options.",
                  "Mientras tanto, Selena puede responder preguntas sobre el proceso de compra, vecindarios u opciones de financiamiento."
                )}
              </p>
              <button
                onClick={() => {
                  const areaLabels = criteria.areas.map(id => TUCSON_AREAS.find(a => a.id === id)?.label || id);
                  const budgetLabel = BUDGET_RANGES.find(b => b.id === criteria.budget)?.label || criteria.budget;
                  const timelineLabel = TIMELINES.find(tl => tl.id === criteria.timeline)?.label || criteria.timeline;
                  const propLabel = PROPERTY_TYPES.find(p => p.id === criteria.property_type)?.label || criteria.property_type;
                  openChat({
                    source: "off_market_registered",
                    intent: "buy",
                    offMarketData: {
                      areas: areaLabels,
                      budgetRange: budgetLabel,
                      timeline: timelineLabel,
                      propertyType: propLabel,
                    },
                  });
                }}
              >
                <Sparkles className="w-4 h-4" />
                {t("Talk to Selena", "Hablar con Selena")}
              </button>
              <div className="mt-4">
                <button
                  onClick={() => navigate("/guides")}
                  className="text-sm text-cc-gold hover:text-cc-gold/80 underline underline-offset-2"
                >
                  {t("Browse buyer guides", "Ver guías para compradores")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-cc-ivory">
      {/* Hero */}
      <section className="bg-cc-navy pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #C4973B 0%, transparent 60%)" }}
        />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-cc-gold/10 border border-cc-gold/30 rounded-full px-4 py-1.5 mb-6">
              <Lock className="w-3.5 h-3.5 text-cc-gold" />
              <span className="text-cc-gold text-xs font-semibold tracking-wider uppercase">
                {t("Off-Market Access", "Acceso Fuera del Mercado")}
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              {t(
                "Find Homes Before Anyone Else Does",
                "Encuentra Casas Antes que Cualquier Otro"
              )}
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              {t(
                "Kasandra has relationships with Tucson homeowners who haven't listed yet — and sellers who prefer a private sale. Tell me what you're looking for and I'll reach out personally when something fits.",
                "Kasandra tiene relaciones con propietarios de Tucson que aún no han publicado su casa — y vendedores que prefieren una venta privada. Dime lo que buscas y me comunicaré personalmente cuando algo encaje."
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
              {([
                [Eye, t("Private listings", "Listados privados")] as [React.ComponentType<{className?: string}>, string],
                [Star, t("No bidding wars", "Sin guerras de ofertas")] as [React.ComponentType<{className?: string}>, string],
                [Lock, t("No obligation", "Sin compromiso")] as [React.ComponentType<{className?: string}>, string],
              ]).map(([Icon, label], i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-cc-gold" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-elevated p-8">

              <StepIndicator step={step} total={3} t={t} />

              {/* ── Step 0: Core Criteria ── */}
              {step === 0 && (
                <div className="space-y-7">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-cc-navy mb-1">
                      {t("Where in Tucson?", "¿Dónde en Tucson?")}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      {t("Select all areas that interest you.", "Selecciona todas las áreas que te interesan.")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TUCSON_AREAS.map(area => (
                        <ToggleChip
                          key={area.id}
                          selected={criteria.areas.includes(area.id)}
                          onClick={() => toggleArea(area.id)}
                        >
                          <MapPin className="w-3 h-3 inline mr-1 opacity-60" />
                          {language === "es" ? area.labelEs : area.label}
                        </ToggleChip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-serif text-xl font-bold text-cc-navy mb-4">
                      {t("What's your budget range?", "¿Cuál es tu rango de presupuesto?")}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {BUDGET_RANGES.map(b => (
                        <ToggleChip
                          key={b.id}
                          selected={criteria.budget === b.id}
                          onClick={() => setCriteria(c => ({ ...c, budget: b.id }))}
                        >
                          <DollarSign className="w-3 h-3 inline mr-0.5 opacity-60" />
                          {b.label}
                        </ToggleChip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-serif text-xl font-bold text-cc-navy mb-4">
                      {t("Property type", "Tipo de propiedad")}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPES.map(p => (
                        <ToggleChip
                          key={p.id}
                          selected={criteria.property_type === p.id}
                          onClick={() => setCriteria(c => ({ ...c, property_type: p.id }))}
                        >
                          <Home className="w-3 h-3 inline mr-1 opacity-60" />
                          {language === "es" ? p.labelEs : p.label}
                        </ToggleChip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-serif text-xl font-bold text-cc-navy mb-4">
                      {t("When are you hoping to move?", "¿Cuándo esperas mudarte?")}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TIMELINES.map(tl => (
                        <button
                          key={tl.id}
                          type="button"
                          onClick={() => setCriteria(c => ({ ...c, timeline: tl.id }))}
                          className={`
                            text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200
                            ${criteria.timeline === tl.id
                              ? 'border-cc-navy bg-cc-navy/5'
                              : 'border-gray-200 hover:border-cc-navy/30 bg-white'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${criteria.timeline === tl.id ? 'text-cc-navy' : 'text-gray-400'}`} />
                            <span className={`font-medium text-sm ${criteria.timeline === tl.id ? 'text-cc-navy' : 'text-gray-700'}`}>
                              {language === "es" ? tl.labelEs : tl.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 ml-6">{tl.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => step0Valid && setStep(1)}
                    disabled={!step0Valid}
                    className={`
                      w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                      ${step0Valid
                        ? 'bg-cc-navy text-white hover:bg-cc-navy/90 shadow-md'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {t("Continue", "Continuar")}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── Step 1: Must-Haves ── */}
              {step === 1 && (
                <div className="space-y-7">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-cc-navy mb-1">
                      {t("Minimum bedrooms", "Habitaciones mínimas")}
                    </h2>
                    <div className="flex gap-3 mt-3">
                      {BEDROOM_OPTIONS.map(b => (
                        <ToggleChip
                          key={b.id}
                          selected={criteria.bedrooms === b.id}
                          onClick={() => setCriteria(c => ({ ...c, bedrooms: b.id }))}
                        >
                          {b.label}
                        </ToggleChip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-serif text-xl font-bold text-cc-navy mb-1">
                      {t("Must-haves", "Indispensables")}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      {t("Optional — skip if flexible.", "Opcional — omite si eres flexible.")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MUST_HAVES.map(m => (
                        <ToggleChip
                          key={m.id}
                          selected={criteria.must_haves.includes(m.id)}
                          onClick={() => toggleMustHave(m.id)}
                        >
                          {language === "es" ? m.labelEs : m.label}
                        </ToggleChip>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(0)}
                      className="px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-gray-300 transition-colors"
                    >
                      {t("Back", "Atrás")}
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 rounded-xl bg-cc-navy text-white font-semibold flex items-center justify-center gap-2 hover:bg-cc-navy/90 transition-colors shadow-md"
                    >
                      {t("Continue", "Continuar")}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Contact ── */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-cc-navy mb-1">
                      {t("Where should Kasandra reach you?", "¿Cómo puede contactarte Kasandra?")}
                    </h2>
                    <p className="text-sm text-gray-500 mb-5">
                      {t(
                        "She'll reach out personally — no spam, no automated emails.",
                        "Se comunicará personalmente — sin spam, sin correos automatizados."
                      )}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t("Your name", "Tu nombre")} <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={e => setContact(c => ({ ...c, name: e.target.value }))}
                          placeholder={t("First and last name", "Nombre y apellido")}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cc-navy focus:outline-none transition-colors text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t("Email address", "Correo electrónico")} <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={contact.email}
                          onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                          placeholder="you@email.com"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cc-navy focus:outline-none transition-colors text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t("Phone (optional)", "Teléfono (opcional)")}
                        </label>
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={e => setContact(c => ({ ...c, phone: e.target.value }))}
                          placeholder="(520) 000-0000"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cc-navy focus:outline-none transition-colors text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Criteria summary */}
                  <div className="bg-cc-ivory rounded-xl p-4 text-sm text-gray-600 space-y-1.5 border border-gray-100">
                    <p className="font-semibold text-gray-800 mb-2">
                      {t("Your search criteria:", "Tus criterios de búsqueda:")}
                    </p>
                    <p>📍 {criteria.areas.map(a => TUCSON_AREAS.find(x => x.id === a)?.[language === "es" ? "labelEs" : "label"]).join(", ")}</p>
                    <p>💰 {BUDGET_RANGES.find(b => b.id === criteria.budget)?.label}</p>
                    <p>🏠 {PROPERTY_TYPES.find(p => p.id === criteria.property_type)?.[language === "es" ? "labelEs" : "label"]}, {criteria.bedrooms}+ beds</p>
                    <p>⏱ {TIMELINES.find(tl => tl.id === criteria.timeline)?.[language === "es" ? "labelEs" : "label"]}</p>
                    {criteria.must_haves.length > 0 && (
                      <p>✓ {criteria.must_haves.map(m => MUST_HAVES.find(x => x.id === m)?.[language === "es" ? "labelEs" : "label"]).join(", ")}</p>
                    )}
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-gray-300 transition-colors"
                    >
                      {t("Back", "Atrás")}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!contactValid || submitting}
                      className={`
                        flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                        ${contactValid && !submitting
                          ? 'bg-cc-gold text-white hover:bg-cc-gold/90 shadow-md'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t("Submitting...", "Enviando...")}
                        </span>
                      ) : (
                        <>
                          {t("Get on the list", "Unirme a la lista")}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 text-center">
                    {t(
                      "Your information is private and never sold.",
                      "Tu información es privada y nunca se vende."
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const V2OffMarketBuyer = () => (
  <V2Layout>
    <V2OffMarketBuyerContent />
  </V2Layout>
);

export default V2OffMarketBuyer;
