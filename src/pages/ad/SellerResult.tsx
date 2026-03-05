import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SellerFunnelLayout from "@/components/ad/SellerFunnelLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import { bridgeQuizResultsToV2, bridgeLeadIdToV2, setStoredUserName, setStoredEmail } from "@/lib/analytics/initAdFunnelSession";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { track, trackCustom, getDifferenceBand } from "@/lib/metaPixel";
import { calculateNetToSellerComparison, type Timeline } from "@/lib/calculator/netToSellerAlgorithm";

// Value ranges - midpoints for calculation (single source of truth)
const VALUE_RANGES: Record<string, number> = {
  "under-200k": 175000,
  "200-350k": 275000,
  "350-500k": 425000,
  "over-500k": 600000,
};

// Map quiz timeline IDs → calculator Timeline type
// Keeps ad funnel and main calculator in sync via shared algorithm
const TIMELINE_MAP: Record<string, Timeline> = {
  asap: "asap",
  soon: "30days",
  flexible: "60days",
  "no-rush": "flexible",
};

// Unified calculator — uses the same algorithm as the main Tucson calculator
// Eliminates the prior discrepancy where ad funnel showed cashOffer = value * 0.75
// while main calculator used market.cashDiscountRate (12%). Now both use 12%.
const calculateNetProceeds = (estimatedValue: number, quizTimeline?: string) => {
  const timeline: Timeline = TIMELINE_MAP[quizTimeline ?? ""] ?? "30days";
  const results = calculateNetToSellerComparison({ estimatedValue, timeline });
  const cashOffer = Math.round(results.cash.netProceeds);
  const listingNet = Math.round(results.traditional.netProceeds);
  const difference = listingNet - cashOffer;
  return { estimatedValue, cashOffer, listingNet, difference };
};

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

// Inner component that uses the chat context
const SellerResultContent = () => {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { openChat, isOpen: isChatOpen } = useSelenaChat();
  const hasTriggeredProactive = useRef(false);
  const { t } = useLanguage();

  // Get quiz answers from URL params
  const quizAnswers = {
    situation: searchParams.get("situation") || "",
    condition: searchParams.get("condition") || "",
    timeline: searchParams.get("timeline") || "",
    value: searchParams.get("value") || "200-350k",
    address: searchParams.get("address") || "",
  };

  // Calculate net proceeds using unified algorithm (same as main Tucson calculator)
  // quizAnswers.timeline is passed so timeline-based holding costs are accurate
  const calculations = useMemo(() => {
    const estimatedValue = VALUE_RANGES[quizAnswers.value] || 275000;
    return calculateNetProceeds(estimatedValue, quizAnswers.timeline);
  }, [quizAnswers.value, quizAnswers.timeline]);
  
  // Store difference for booking page context continuity
  useEffect(() => {
    if (calculations.difference) {
      localStorage.setItem('cc_net_sheet_difference', String(calculations.difference));
    }
  }, [calculations.difference]);

  // ViewContent — once per page load
  useEffect(() => {
    track("ViewContent", { content_name: "Seller Result", content_category: "seller_funnel" });
  }, []);
  
  // Loss aversion timer - proactive Selena chat trigger after 30 seconds
  useEffect(() => {
    if (isUnlocked || isChatOpen || hasTriggeredProactive.current) return;
    
    const timer = setTimeout(() => {
      hasTriggeredProactive.current = true;
      openChat({ source: 'proactive', intent: 'sell' });
      
      setTimeout(() => {
        const proactiveMessage = t(
          `I noticed the ${formatCurrency(calculations.difference)} difference in your report — want me to explain what's driving that number?`,
          `Noté una diferencia de ${formatCurrency(calculations.difference)} en tu reporte — ¿quieres que te explique qué está influyendo en ese número?`
        );
        
        window.dispatchEvent(new CustomEvent('selena-proactive-message', {
          detail: { message: proactiveMessage }
        }));
      }, 500);
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [isUnlocked, isChatOpen, calculations.difference, openChat, t]);

  // Chart data
  const chartData = [
    {
      name: t("Cash Offer", "Oferta en efectivo"),
      value: calculations.cashOffer,
      fill: "#E3B23C",
    },
    {
      name: t("Traditional Listing", "Listado tradicional"),
      value: calculations.listingNet,
      fill: "#22C55E",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error(t("Please fill in all fields", "Por favor completa todos los campos"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t("Please enter a valid email address", "Por favor ingresa un correo electrónico válido"));
      return;
    }

    setIsSubmitting(true);

    try {
      const sessionId = localStorage.getItem('selena_session_id') || undefined;
      const language = localStorage.getItem('kasandra-language') || 'en';
      
      const { data, error } = await supabase.functions.invoke('submit-seller', {
        body: {
          name: name.trim(),
          email: email.trim(),
          propertyAddress: quizAnswers.address,
          situation: quizAnswers.situation,
          condition: quizAnswers.condition,
          timeline: quizAnswers.timeline,
          estimatedValue: quizAnswers.value,
          calculatedCashOffer: calculations.cashOffer,
          calculatedListingNet: calculations.listingNet,
          sessionId,
          language,
        },
      });

      if (error) throw error;

      bridgeQuizResultsToV2({
        situation: quizAnswers.situation,
        condition: quizAnswers.condition,
        timeline: quizAnswers.timeline,
        value: quizAnswers.value,
      });

      if (data?.lead_id) {
        bridgeLeadIdToV2(data.lead_id, 'seller_funnel');
        setStoredUserName(name.trim());
        setStoredEmail(email.trim());
      }

      // Fire Lead + custom event (no PII — only bucketed values)
      track("Lead", {
        content_category: "seller_funnel",
        value_band: quizAnswers.value,
        timeline: quizAnswers.timeline,
      });
      trackCustom("SellerReportUnlocked", {
        content_category: "seller_funnel",
        value_band: quizAnswers.value,
        timeline: quizAnswers.timeline,
        difference_band: getDifferenceBand(calculations.difference),
      });

      setIsUnlocked(true);
      toast.success(
        t("Report sent! Check your messages.", "¡Reporte enviado! Revisa tus mensajes."),
        { description: t("A detailed breakdown has been sent to you.", "Se te ha enviado un desglose detallado.") }
      );

    } catch (error) {
      console.error("Submission error:", error);
      toast.error(t("Something went wrong. Please try again.", "Algo salió mal. Por favor intenta de nuevo."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg mx-auto w-full space-y-8">
        {/* Success indicator */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cc-gold/20 rounded-full mb-4">
            {isUnlocked ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <svg className="w-8 h-8 text-cc-gold" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-cc-gold text-sm font-medium uppercase tracking-wide">
            {isUnlocked
              ? t("Report Unlocked", "Reporte desbloqueado")
              : t("Analysis Complete", "Análisis completo")}
          </p>
        </div>

        {/* Teaser Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl text-white mb-2">
            {t("Potential Difference", "Diferencia potencial")}
          </h2>
          <p className="text-cc-gold text-4xl sm:text-5xl font-bold mb-4">
            {formatCurrency(calculations.difference)}
          </p>
          <p className="text-white/60 text-sm mb-6">
            {t("Between Cash Offer and Traditional Listing", "Entre oferta en efectivo y listado tradicional")}
          </p>

          {/* Bar Chart */}
          <div className="mb-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <XAxis
                  type="number"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  stroke="#ffffff40"
                  fontSize={12}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#ffffff60"
                  fontSize={12}
                  width={120}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(value: number) => formatCurrency(value)}
                    fill="#ffffff"
                    fontSize={14}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown - Blurred or Visible */}
          <div className="relative">
            <div className={`space-y-3 p-4 bg-white/5 rounded-xl transition-all duration-500 ${
              isUnlocked ? "" : "blur-sm select-none pointer-events-none"
            }`}>
              <div className="flex justify-between text-white/80">
                <span>{t("Estimated Market Value", "Valor estimado de mercado")}</span>
                <span>{formatCurrency(calculations.estimatedValue)}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>{t("Cash Offer (As-Is)", "Oferta en efectivo (como está)")}</span>
                <span className="text-cc-gold">{formatCurrency(calculations.cashOffer)}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>{t("Traditional Net (Est.)", "Neto tradicional (est.)")}</span>
                <span className="text-green-400">{formatCurrency(calculations.listingNet)}</span>
              </div>
              <div className="border-t border-white/10 pt-3 mt-3 flex justify-between text-white/80">
                <span>{t("Time to Close", "Tiempo de cierre")}</span>
                <span>{t("7-14 days vs 45-60 days", "7-14 días vs 45-60 días")}</span>
              </div>
              <div className="flex justify-between text-white/60 text-sm">
                <span>{t("Your Timeline Preference", "Tu preferencia de plazo")}</span>
                <span className="capitalize">{quizAnswers.timeline.replace(/-/g, ' ') || t('Flexible', 'Flexible')}</span>
              </div>
            </div>
            
            {/* Lock overlay */}
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-cc-navy/90 rounded-xl px-4 py-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cc-gold" />
                  <span className="text-white text-sm font-medium">
                    {t("Unlock Full Report", "Desbloquear reporte completo")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lead Capture Form (Hidden when unlocked) */}
        {!isUnlocked && (
          <div className="bg-white/10 border border-cc-gold/30 rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <h3 className="font-serif text-xl text-white mb-2">
                {t("Unlock Your Full Net Sheet", "Desbloquea tu reporte completo")}
              </h3>
              <p className="text-white/60 text-sm">
                {t(
                  "Get a personalized breakdown with exact numbers for your property.",
                  "Obtén un desglose personalizado con números exactos para tu propiedad."
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80 text-sm">
                  {t("Your Name", "Tu nombre")}
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("Enter your name", "Ingresa tu nombre")}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-cc-gold focus:ring-cc-gold/20"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 text-sm">
                  {t("Email Address", "Correo electrónico")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("you@email.com", "tu@correo.com")}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-cc-gold focus:ring-cc-gold/20"
                  required
                  maxLength={255}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? (
                  t("Sending...", "Enviando...")
                ) : (
                  <>
                    {t("Unlock My Net Sheet", "Desbloquear mi reporte")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-white/40 text-xs text-center mt-4">
              {t(
                "No spam. Unsubscribe anytime. We respect your privacy.",
                "Sin spam. Puedes darte de baja cuando quieras. Respetamos tu privacidad."
              )}
            </p>
          </div>
        )}

        {/* Success State CTA */}
        {isUnlocked && (() => {
          // Build pre-population params for the Seller Decision Wizard.
          // Passes situation + timeline so Step 1 chips are pre-selected —
          // the user skips re-entering what they already told us.
          const wizardParams = new URLSearchParams({
            from: "ad_funnel",
            ...(quizAnswers.situation && { situation: quizAnswers.situation }),
            ...(quizAnswers.timeline && { timeline: quizAnswers.timeline }),
          }).toString();

          return (
            <div className="space-y-4">
              {/* Confirmation strip */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-white font-medium">
                  {t("Your Net Sheet is on its way", "Tu reporte está en camino")}
                </p>
                <p className="text-white/50 text-sm mt-1">
                  {t(`Sent to ${email}`, `Enviado a ${email}`)}
                </p>
              </div>

              {/* Primary next step — Seller Decision Wizard */}
              <div className="bg-cc-gold/10 border border-cc-gold/40 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-cc-gold/20 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-5 h-5 text-cc-gold" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-white font-semibold leading-tight">
                      {t(
                        "Now get your personalized selling recommendation",
                        "Ahora obtén tu recomendación personalizada de venta"
                      )}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">
                      {t(
                        "Answer 4 more questions. Kasandra reviews your full picture before your call — no surprises.",
                        "Responde 4 preguntas más. Kasandra revisa tu situación completa antes de tu llamada — sin sorpresas."
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-5 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-cc-gold" />
                    {t("Your situation pre-filled", "Tu situación pre-llenada")}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-cc-gold" />
                    {t("Takes about 2 minutes", "Tarda unos 2 minutos")}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-cc-gold" />
                    {t("Get a written receipt", "Obtén un recibo escrito")}
                  </span>
                </div>

                <Button
                  asChild
                  className="w-full bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold py-6 rounded-full text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  <Link to={`/v2/seller-decision?${wizardParams}`}>
                    {t("Get My Selling Recommendation", "Obtener Mi Recomendación de Venta")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>

              {/* Secondary — Selena chat */}
              <div className="text-center">
                <button
                  onClick={() => openChat({ source: "post_funnel_unlock", intent: "sell" })}
                  className="text-white/50 text-sm hover:text-white/80 underline underline-offset-2 transition-colors"
                >
                  {t(
                    "Prefer to talk first? Chat with Selena →",
                    "¿Prefieres hablar primero? Chatea con Selena →"
                  )}
                </button>
              </div>
            </div>
          );
        })()}

        {!isUnlocked && (
          <div className="text-center">
            <p className="text-white/50 text-sm">
              {t("Prefer to talk to a human?", "¿Prefieres hablar con una persona?")}{" "}
              <button 
                onClick={() => openChat({ source: 'pre_unlock', intent: 'sell' })}
                className="text-cc-gold hover:text-cc-gold/80 underline underline-offset-2"
              >
                {t("Chat with Selena to schedule", "Chatea con Selena para agendar")}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SellerResult = () => {
  return (
    <SellerFunnelLayout>
      <SellerResultContent />
    </SellerFunnelLayout>
  );
};

export default SellerResult;
