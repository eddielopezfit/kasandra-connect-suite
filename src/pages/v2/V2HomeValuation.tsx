import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { logEvent } from "@/lib/analytics/logEvent";
import { setFieldIfEmpty, getOrCreateSessionId, updateSessionContext, getSessionContext } from "@/lib/analytics/selenaSession";
import { bridgeLeadIdToV2 } from "@/lib/analytics/bridgeLeadIdToV2";
import {
  Home, MapPin, ArrowRight, ArrowLeft, CheckCircle, Loader2, MessageCircle, Phone, Mail, User,
} from "lucide-react";
import ToolResultNextStep from "@/components/v2/ToolResultNextStep";

type Step = 1 | 2 | 3 | 4;

const V2HomeValuationContent = () => {
  const { language, t } = useLanguage();
  const { openChat } = useSelenaChat();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Address
  const [address, setAddress] = useState("");

  // Step 2: Property details
  const [beds, setBeds] = useState("3");
  const [baths, setBaths] = useState("2");
  const [sqft, setSqft] = useState("");
  const [condition, setCondition] = useState("move_in_ready");
  const [yearBuilt, setYearBuilt] = useState("");

  // Step 3: Contact (all required per Revision 2)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timeline, setTimeline] = useState("exploring");
  const [consent, setConsent] = useState(false);

  const chipClass = (active: boolean) =>
    `px-4 py-2.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
      active
        ? "bg-cc-navy text-white border-cc-navy shadow-soft"
        : "bg-white text-cc-charcoal border-cc-sand-dark/40 hover:border-cc-navy/40"
    }`;

  const canProceedStep1 = address.trim().length >= 5;
  const canProceedStep2 = true; // all have defaults
  const canSubmit = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && phone.trim().length >= 10 && consent;

  const handleStep1 = () => {
    logEvent("tool_started", { tool: "home_valuation", source: "website", tool_origin: "home_valuation" });
    setFieldIfEmpty("intent", "sell");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const sessionId = getOrCreateSessionId();
      const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-valuation-request`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          propertyAddress: address.trim(),
          beds: parseInt(beds) || null,
          baths: parseInt(baths) || null,
          sqft: parseInt(sqft.replace(/[^0-9]/g, "")) || null,
          condition,
          yearBuilt: yearBuilt.trim() || null,
          timeline,
          sessionId,
          language,
          consent,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || t("Something went wrong. Please try again.", "Algo salió mal. Por favor intenta de nuevo."));
        setSubmitting(false);
        return;
      }

      // Bridge lead ID
      if (data.lead_id) {
        bridgeLeadIdToV2(data.lead_id, name.trim());
      }

      logEvent("valuation_request_completed", {
        tool_origin: "home_valuation",
        source: "website",
        lead_id: data.lead_id,
      });
      logEvent("lead_capture", {
        source: "website",
        tool_origin: "home_valuation",
        has_phone: true,
      });

      setStep(4); // Success
    } catch {
      setError(t("Network error. Please try again.", "Error de red. Por favor intenta de nuevo."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-cc-navy py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
            {t("For Sellers", "Para Vendedores")}
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mt-2 mb-4">
            {t("Kasandra's Personalized", "El Análisis de Mercado")}
            <span className="text-cc-gold"> {t("Market Analysis", "Personalizado de Kasandra")}</span>
          </h1>
          <p className="text-white/75 text-lg max-w-2xl">
            {t(
              "Not an algorithm. A real comparative market analysis prepared by Kasandra using active, pending, and recently sold data specific to your property and neighborhood.",
              "No es un algoritmo. Un análisis de mercado comparativo real preparado por Kasandra usando datos activos, pendientes y vendidos recientemente, específicos para tu propiedad y vecindario."
            )}
          </p>
        </div>
      </section>

      <section className="py-14 bg-cc-ivory">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`w-10 h-1.5 rounded-full transition-all ${
                  s <= (step === 4 ? 3 : step) ? "bg-cc-gold" : "bg-cc-sand-dark/30"
                }`}
              />
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-cc-sand-dark/30 shadow-soft p-8 space-y-6">

            {/* STEP 1: Address */}
            {step === 1 && (
              <>
                <div className="text-center mb-6">
                  <MapPin className="w-8 h-8 text-cc-gold mx-auto mb-2" />
                  <h2 className="font-serif text-2xl font-bold text-cc-navy">
                    {t("Where's your property?", "¿Dónde está tu propiedad?")}
                  </h2>
                  <p className="text-cc-slate text-sm mt-1">
                    {t("Enter the full address including city and ZIP code.", "Ingresa la dirección completa incluyendo ciudad y código postal.")}
                  </p>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-cc-navy uppercase tracking-wider">
                    {t("Property Address", "Dirección de la Propiedad")}
                  </Label>
                  <Input
                    placeholder={t("123 Main St, Tucson, AZ 85701", "123 Main St, Tucson, AZ 85701")}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="rounded-full border-cc-sand-dark/40 focus:border-cc-navy/40"
                    maxLength={200}
                  />
                </div>
                <Button
                  onClick={handleStep1}
                  disabled={!canProceedStep1}
                  className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-3 shadow-gold"
                >
                  {t("Continue", "Continuar")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {/* STEP 2: Property Details */}
            {step === 2 && (
              <>
                <div className="text-center mb-6">
                  <Home className="w-8 h-8 text-cc-gold mx-auto mb-2" />
                  <h2 className="font-serif text-2xl font-bold text-cc-navy">
                    {t("Tell us about the property", "Cuéntanos sobre la propiedad")}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-cc-navy">{t("Beds", "Recámaras")}</Label>
                    <select
                      value={beds}
                      onChange={e => setBeds(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full border border-cc-sand-dark/40 focus:border-cc-navy/40 focus:outline-none text-cc-charcoal text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-cc-navy">{t("Baths", "Baños")}</Label>
                    <select
                      value={baths}
                      onChange={e => setBaths(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-full border border-cc-sand-dark/40 focus:border-cc-navy/40 focus:outline-none text-cc-charcoal text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-cc-navy">{t("Approx. Square Feet", "Pies Cuadrados Aprox.")}</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="1,800"
                    value={sqft}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setSqft(raw ? parseInt(raw).toLocaleString() : "");
                    }}
                    className="rounded-full border-cc-sand-dark/40 focus:border-cc-navy/40"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-cc-navy">{t("Condition", "Condición")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "move_in_ready", en: "Move-in Ready", es: "Lista para Mudarse" },
                      { key: "minor_repairs", en: "Needs Updates", es: "Necesita Actualizaciones" },
                      { key: "distressed", en: "Major Repairs", es: "Reparaciones Mayores" },
                    ].map(c => (
                      <button key={c.key} className={chipClass(condition === c.key)} onClick={() => setCondition(c.key)}>
                        {language === "es" ? c.es : c.en}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-cc-navy">{t("Year Built (optional)", "Año de Construcción (opcional)")}</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="1995"
                    value={yearBuilt}
                    onChange={e => setYearBuilt(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                    className="rounded-full border-cc-sand-dark/40 focus:border-cc-navy/40"
                    maxLength={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-full border-cc-sand-dark/40">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("Back", "Atrás")}
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-3 shadow-gold"
                  >
                    {t("Continue", "Continuar")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            )}

            {/* STEP 3: Contact (all required) */}
            {step === 3 && (
              <>
                <div className="text-center mb-6">
                  <User className="w-8 h-8 text-cc-gold mx-auto mb-2" />
                  <h2 className="font-serif text-2xl font-bold text-cc-navy">
                    {t("Where should Kasandra send your analysis?", "¿Dónde debe Kasandra enviar tu análisis?")}
                  </h2>
                  <p className="text-cc-slate text-sm mt-1">
                    {t("Kasandra personally prepares every CMA.", "Kasandra prepara personalmente cada CMA.")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-cc-navy flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      {t("Full Name", "Nombre Completo")}
                    </Label>
                    <Input
                      placeholder={t("Your name", "Tu nombre")}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="rounded-full border-cc-sand-dark/40 focus:border-cc-navy/40"
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-cc-navy flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      {t("Email", "Correo Electrónico")}
                    </Label>
                    <Input
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="rounded-full border-cc-sand-dark/40 focus:border-cc-navy/40"
                      maxLength={255}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-cc-navy flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" />
                      {t("Phone", "Teléfono")}
                    </Label>
                    <Input
                      type="tel"
                      placeholder="(520) 555-1234"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="rounded-full border-cc-sand-dark/40 focus:border-cc-navy/40"
                      maxLength={20}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-cc-navy">{t("Timeline", "Cronograma")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "asap", en: "ASAP", es: "Lo antes posible" },
                        { key: "30_days", en: "Next 30 Days", es: "Próximos 30 Días" },
                        { key: "60_90", en: "1-3 Months", es: "1-3 Meses" },
                        { key: "exploring", en: "Just Exploring", es: "Solo Explorando" },
                      ].map(tl => (
                        <button key={tl.key} className={chipClass(timeline === tl.key)} onClick={() => setTimeline(tl.key)}>
                          {language === "es" ? tl.es : tl.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TCPA Consent */}
                  <div className="flex items-start space-x-3 pt-2">
                    <Checkbox
                      id="consent"
                      checked={consent}
                      onCheckedChange={checked => setConsent(checked === true)}
                      className="mt-0.5"
                    />
                    <label htmlFor="consent" className="text-xs text-cc-slate leading-relaxed cursor-pointer">
                      {t(
                        "I agree to receive communications from Kasandra Prieto about my property valuation and real estate services. I have read the ",
                        "Acepto recibir comunicaciones de Kasandra Prieto sobre mi valuación de propiedad y servicios de bienes raíces. He leído la "
                      )}
                      <Link to="/privacy" className="underline text-cc-navy">{t("Privacy Policy", "Política de Privacidad")}</Link>
                      {t(" and ", " y los ")}
                      <Link to="/terms" className="underline text-cc-navy">{t("Terms", "Términos")}</Link>.
                    </label>
                  </div>

                  {error && (
                    <p className="text-destructive text-sm text-center">{error}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-full border-cc-sand-dark/40">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("Back", "Atrás")}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting}
                    className="flex-1 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-3 shadow-gold"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {t("Request My Analysis", "Solicitar Mi Análisis")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* STEP 4: Success */}
            {step === 4 && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-cc-gold mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-bold text-cc-navy mb-2">
                  {t("Your Request Is In!", "¡Tu Solicitud Fue Recibida!")}
                </h2>
                <p className="text-cc-charcoal mb-6 max-w-md mx-auto">
                  {t(
                    "Kasandra will personally prepare your market analysis using active, pending, and recently sold comparables in your area. Expect to hear from her within 24 hours.",
                    "Kasandra preparará personalmente tu análisis de mercado usando comparables activos, pendientes y vendidos recientemente en tu zona. Espera respuesta dentro de 24 horas."
                  )}
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => openChat({ source: "home_valuation" as const, intent: "sell" })}
                    className="bg-cc-navy text-white rounded-full px-8 font-semibold"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t("Ask Selena About Selling", "Preguntarle a Selena Sobre Vender")}
                  </Button>
                  <div>
                    <Link to="/guides/cash-vs-traditional-sale">
                      <Button variant="link" className="text-cc-navy font-medium">
                        {t("Read: Cash Offer vs Traditional Sale →", "Leer: Oferta en Efectivo vs Venta Tradicional →")}
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-6">
                    <ToolResultNextStep
                      completedToolLabel="Home Valuation Request"
                      completedToolLabelEs="Solicitud de Valuación"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

const V2HomeValuation = () => {
  useDocumentHead({
    titleEn: "Home Valuation | Personalized CMA — Kasandra Prieto",
    titleEs: "Valuación de Casa | Análisis de Mercado Personalizado — Kasandra Prieto",
    descriptionEn: "Get a personalized comparative market analysis for your Tucson home — not an algorithm. Kasandra reviews active, pending, and sold data specific to your property.",
    descriptionEs: "Obtén un análisis de mercado comparativo personalizado para tu casa en Tucson — no es un algoritmo. Kasandra revisa datos activos, pendientes y vendidos.",
  });

  return (
    <V2Layout>
      <V2HomeValuationContent />
    </V2Layout>
  );
};

export default V2HomeValuation;
