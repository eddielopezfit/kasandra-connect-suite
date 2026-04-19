import { useState, useCallback, useRef } from "react";
import V2Layout from "@/components/v2/V2Layout";
import BuyerReadinessCheck from "@/components/v2/BuyerReadinessCheck";
import ToolResultNextStep from "@/components/v2/ToolResultNextStep";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import LeadCaptureModal from "@/components/v2/LeadCaptureModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSessionContext, updateSessionContext, setFieldIfEmpty, syncLeadScore } from "@/lib/analytics/selenaSession";
import { getStoredEmail } from "@/lib/analytics/bridgeLeadIdToV2";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";
import { track, trackCustom, getScoreBand } from "@/lib/metaPixel";
import { useSelenaChat } from "@/contexts/SelenaChatContext";

const LEAD_ID_KEY = "selena_lead_id";

const V2BuyerReadinessContent = () => {
  useDocumentHead({
    titleEn: "Buyer Readiness Quiz | Are You Ready to Buy in Tucson?",
    titleEs: "Quiz de Preparación | ¿Estás Listo para Comprar en Tucson?",
    descriptionEn: "Take the free 3-minute buyer readiness quiz and get a personalized readiness score with next steps from Kasandra Prieto.",
    descriptionEs: "Toma el quiz gratuito de 3 minutos y obtén tu puntaje de preparación personalizado de Kasandra Prieto.",
  });
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showSaveLink, setShowSaveLink] = useState(false);
  const [captured, setCaptured] = useState(false);
  const autoOpenFired = useRef(false);
  const { openChat } = useSelenaChat();

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
      // Fire-and-forget lead score sync
      const storedLeadId = localStorage.getItem(LEAD_ID_KEY);
      if (storedLeadId) void syncLeadScore(storedLeadId, data.readiness_score);
      // P1.1: Persist snapshot after quiz completion
      import('@/lib/analytics/sessionSnapshot').then(({ saveSnapshot }) => saveSnapshot()).catch(() => {});

      trackCustom("BuyerReadinessCompleted", {
        readiness_score_band: getScoreBand(data.readiness_score),
        primary_priority: data.primary_priority,
      });

      // Guardrail 2: check lead_id, storedEmail (cc_user_email), AND prompted flag
      const leadId = localStorage.getItem(LEAD_ID_KEY);
      const storedEmail = getStoredEmail();
      const ctx = getSessionContext();
      const alreadyPrompted = !!ctx?.tool_buyer_readiness_capture_prompted;

      const alreadyKnown = !!leadId || !!storedEmail || alreadyPrompted;


      // Guardrail 3: namespaced flag to prevent re-open on refresh
      updateSessionContext({
        tool_buyer_readiness_capture_prompted: true,
      });

      // Re-score returning leads on tool completion (no modal needed)
      if (leadId) {
        supabase.functions.invoke("update-lead-score", {
          body: {
            lead_id: leadId,
            session_id: localStorage.getItem("selena_session_id") || undefined,
            tool_used: "buyer_readiness",
            readiness_score: data.readiness_score,
            primary_priority: data.primary_priority,
            page_path: window.location.pathname,
            language: localStorage.getItem("kasandra-language") || "en",
          },
        }).then((res) => {
          if (res.data?.ok) {
            if (import.meta.env.DEV) console.log("[BuyerReadiness] Re-scored returning lead:", res.data.lead_score);
          }
        }).catch((err) => console.error("[BuyerReadiness] Re-score error:", err));
      }

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
    const ctx = getSessionContext();
    setTimeout(() => openChat({
      source: "buyer_readiness_capture",
      intent: "buy",
      readinessData: {
        score: ctx?.readiness_score ?? 0,
        primaryPriority: ctx?.primary_priority ?? '',
        toolType: 'buyer',
      },
    }), 400);
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
            <h1 className="font-serif text-4xl md:text-5xl font-bold mt-2 mb-4 text-white">
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
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 text-sm text-cc-gold hover:text-cc-gold-dark underline underline-offset-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {t("Save my results", "Guardar mis resultados")}
                </button>
              </div>
            )}
            {showSaveLink && (
              <div className="mt-6">
                <ToolResultNextStep
                  completedToolLabel="Buyer Readiness Check"
                  completedToolLabelEs="Evaluación de Preparación del Comprador"
                />
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
