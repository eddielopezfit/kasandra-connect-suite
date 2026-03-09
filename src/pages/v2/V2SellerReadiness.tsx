import { useState, useCallback, useRef } from "react";
import V2Layout from "@/components/v2/V2Layout";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import SellerReadinessCheck from "@/components/v2/SellerReadinessCheck";
import LeadCaptureModal from "@/components/v2/LeadCaptureModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSessionContext, updateSessionContext, setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { getStoredEmail } from "@/lib/analytics/bridgeLeadIdToV2";
import { supabase } from "@/integrations/supabase/client";
import { Save } from "lucide-react";
import { track, trackCustom, getScoreBand } from "@/lib/metaPixel";
import { useSelenaChat } from "@/contexts/SelenaChatContext";

const LEAD_ID_KEY = "selena_lead_id";

const V2SellerReadinessContent = () => {
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

      setFieldIfEmpty("intent", "sell");
      updateSessionContext({
        tool_used: "seller_readiness",
        readiness_score: data.readiness_score,
        primary_priority: data.primary_priority,
      });
      // P1.1: Persist snapshot after quiz completion
      import('@/lib/analytics/sessionSnapshot').then(({ saveSnapshot }) => saveSnapshot()).catch(() => {});

      trackCustom("SellerReadinessCompleted", {
        readiness_score_band: getScoreBand(data.readiness_score),
        primary_priority: data.primary_priority,
      });

      const leadId = localStorage.getItem(LEAD_ID_KEY);
      const storedEmail = getStoredEmail();
      const ctx = getSessionContext();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const alreadyPrompted = !!(ctx as any)?.tool_seller_readiness_capture_prompted;
      const alreadyKnown = !!leadId || !!storedEmail || alreadyPrompted;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateSessionContext({
        tool_seller_readiness_capture_prompted: true,
      } as any);

      if (leadId) {
        supabase.functions.invoke("update-lead-score", {
          body: {
            lead_id: leadId,
            session_id: localStorage.getItem("selena_session_id") || undefined,
            tool_used: "seller_readiness",
            readiness_score: data.readiness_score,
            primary_priority: data.primary_priority,
            page_path: window.location.pathname,
            language: localStorage.getItem("kasandra-language") || "en",
          },
        }).then((res) => {
          if (res.data?.ok) {
            if (import.meta.env.DEV) console.log("[SellerReadiness] Re-scored returning lead:", res.data.lead_score);
          }
        }).catch((err) => console.error("[SellerReadiness] Re-score error:", err));
      }

      if (alreadyKnown) return;

      setTimeout(() => {
        setShowModal(true);
      }, 2000);
    },
    []
  );

  const handleModalClose = () => {
    setShowModal(false);
    if (!captured) {
      setShowSaveLink(true);
    }
  };

  const handleModalSuccess = () => {
    track("Lead", { content_category: "seller_readiness" });
    trackCustom("SellerReadinessLeadCaptured", { content_category: "seller_readiness" });
    setCaptured(true);
    setShowSaveLink(false);
    const ctx = getSessionContext();
    setTimeout(() => openChat({
      source: "seller_readiness_capture",
      intent: "sell",
      readinessData: {
        score: ctx?.readiness_score ?? 0,
        primaryPriority: ctx?.primary_priority ?? '',
        toolType: 'seller',
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
              {t("For Sellers", "Para Vendedores")}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mt-2 mb-4 text-white">
              {t(
                "How Ready Are You to Sell Your Home?",
                "¿Qué Tan Listo/a Estás para Vender Tu Casa?"
              )}
            </h1>
            <p className="text-white/80">
              {t(
                "A quick diagnostic to understand your selling situation—no pressure, just clarity.",
                "Un diagnóstico rápido para entender tu situación de venta—sin presión, solo claridad."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Check Component */}
      <section className="py-12 lg:py-16 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-elevated">
            <SellerReadinessCheck onScoreRevealed={handleScoreRevealed} />

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
        source="seller_readiness"
        title={{
          en: "Save your seller readiness results",
          es: "Guarda tus resultados de preparación para vender",
        }}
        subtitle={{
          en: "Enter your email so Selena can save your results and send personalized next steps.",
          es: "Ingresa tu correo para que Selena guarde tus resultados y te envíe los próximos pasos personalizados.",
        }}
      />
    </>
  );
};

const V2SellerReadiness = () => (
  <V2Layout>
    <V2SellerReadinessContent />
  </V2Layout>
);

export default V2SellerReadiness;
