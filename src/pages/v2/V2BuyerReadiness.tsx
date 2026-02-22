import { useState, useCallback, useRef } from "react";
import V2Layout from "@/components/v2/V2Layout";
import BuyerReadinessCheck from "@/components/v2/BuyerReadinessCheck";
import LeadCaptureModal from "@/components/v2/LeadCaptureModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSessionContext, updateSessionContext, setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { getStoredEmail } from "@/lib/analytics/bridgeLeadIdToV2";
import { Save } from "lucide-react";
import { track, trackCustom, getScoreBand } from "@/lib/metaPixel";

const LEAD_ID_KEY = "selena_lead_id";

const V2BuyerReadinessContent = () => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showSaveLink, setShowSaveLink] = useState(false);
  const [captured, setCaptured] = useState(false);
  const autoOpenFired = useRef(false);

  const handleScoreRevealed = useCallback(
    (data: { readiness_score: number; primary_priority: string }) => {
      if (autoOpenFired.current) return;
      autoOpenFired.current = true;

      // Enrich session context with tool data
      setFieldIfEmpty("intent", "buy");
      updateSessionContext({
        tool_used: "buyer_readiness",
        readiness_score: data.readiness_score,
        primary_priority: data.primary_priority,
      });

      trackCustom("BuyerReadinessCompleted", {
        readiness_score_band: getScoreBand(data.readiness_score),
        primary_priority: data.primary_priority,
      });

      // Guardrail 2: check lead_id, storedEmail (cc_user_email), AND prompted flag
      const leadId = localStorage.getItem(LEAD_ID_KEY);
      const storedEmail = getStoredEmail();
      const ctx = getSessionContext();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alreadyPrompted = !!(ctx as any)?.tool_buyer_readiness_capture_prompted;

      const alreadyKnown = !!leadId || !!storedEmail || alreadyPrompted;


      // Guardrail 3: namespaced flag to prevent re-open on refresh
      // Using any cast because this is an ad-hoc flag not in SessionContext type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateSessionContext({
        tool_buyer_readiness_capture_prompted: true,
      } as any);

      if (alreadyKnown) return;

      // Auto-open modal after 2s delay
      setTimeout(() => {
        setShowModal(true);
      }, 2000);
    },
    []
  );

  const handleModalClose = () => {
    setShowModal(false);
    if (!captured) {
      setShowSaveLink(true); // Immediate fallback link (no delay)
    }
  };

  const handleModalSuccess = () => {
    track("Lead", { content_category: "buyer_readiness" });
    trackCustom("BuyerReadinessLeadCaptured", { content_category: "buyer_readiness" });
    setCaptured(true);
    setShowSaveLink(false);
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-cc-navy pt-32 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
              {t("For Buyers", "Para Compradores")}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2 mb-4 text-white">
              {t(
                "Where Are You in Your Home Buying Journey?",
                "¿Dónde Estás en Tu Camino de Compra de Casa?"
              )}
            </h1>
            <p className="text-white/80">
              {t(
                "A quick check to help you understand your next best step—no pressure, just clarity.",
                "Una evaluación rápida para ayudarte a entender tu mejor próximo paso—sin presión, solo claridad."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Check Component */}
      <section className="py-12 lg:py-16 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-elevated">
            <BuyerReadinessCheck onScoreRevealed={handleScoreRevealed} />

            {/* Fallback save link */}
            {showSaveLink && !captured && (
              <div className="mt-6 text-center animate-fade-in">
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 text-sm text-cc-gold hover:text-cc-gold-dark underline underline-offset-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {t("Save my results", "Guardar mis resultados")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        source="buyer_readiness"
        title={{
          en: "Save your readiness results",
          es: "Guarda tus resultados de preparación",
        }}
        subtitle={{
          en: "Enter your email so Selena can save your results and send personalized next steps.",
          es: "Ingresa tu correo para que Selena guarde tus resultados y te envíe los próximos pasos personalizados.",
        }}
      />
    </>
  );
};

const V2BuyerReadiness = () => (
  <V2Layout>
    <V2BuyerReadinessContent />
  </V2Layout>
);

export default V2BuyerReadiness;
