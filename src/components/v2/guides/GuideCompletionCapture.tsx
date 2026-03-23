/**
 * GuideCompletionCapture — P8: Guide Completion Email Capture
 * 
 * Appears after 90%+ guide scroll. Offers PDF summary via email.
 * Non-intrusive inline banner at guide bottom.
 */
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/analytics/logEvent";
import { getOrCreateSessionId } from "@/lib/analytics/selenaSession";
import { FileText, ArrowRight, Mail } from "lucide-react";

interface GuideCompletionCaptureProps {
  guideId: string;
  guideTitle: string;
  visible: boolean;
}

export function GuideCompletionCapture({ guideId, guideTitle, visible }: GuideCompletionCaptureProps) {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;
  // Skip if already captured
  if (localStorage.getItem("selena_lead_id")) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);

    try {
      const sessionId = getOrCreateSessionId();
      const { data } = await supabase.functions.invoke("upsert-lead-profile", {
        body: {
          email: email.trim().toLowerCase(),
          session_id: sessionId,
          source: `guide_pdf_${guideId}`,
          tags: [`guide_${guideId}_completed`, "guide_pdf_requested"],
          language,
        },
      });

      if (data?.lead_id) {
        logEvent("guide_pdf_requested", { guide_id: guideId, lead_id: data.lead_id });
        setDone(true);
      }
    } catch (err) {
      console.error("[GuideCompletionCapture] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 mb-4 bg-cc-navy rounded-2xl p-6 text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!done ? (
        <>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-cc-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-cc-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-snug mb-1">
                {t("Want a PDF summary of this guide?", "¿Quieres un resumen en PDF de esta guía?")}
              </h3>
              <p className="text-white/60 text-sm">
                {t(
                  "Enter your email and we'll send you a shareable summary you can reference anytime.",
                  "Ingresa tu correo y te enviaremos un resumen que puedes consultar en cualquier momento."
                )}
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={language === "es" ? "Tu correo electrónico" : "Your email address"}
              required
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cc-gold/60 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="flex-shrink-0 bg-cc-gold hover:bg-cc-gold/90 disabled:opacity-50 text-cc-navy font-semibold rounded-full px-4 py-2.5 text-sm transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-cc-navy/40 border-t-cc-navy rounded-full animate-spin" />
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  {t("Send PDF", "Enviar PDF")}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
          <div className="flex items-center justify-between mt-2">
            <p className="text-white/30 text-xs">
              {language === "es" ? "Sin spam. Sin compromiso." : "No spam. No obligation."}
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/30 hover:text-white/50 text-xs underline transition-colors"
            >
              {t("No thanks", "No gracias")}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-2">
          <p className="font-semibold text-cc-gold mb-1">
            {language === "es" ? "¡Enviado!" : "Sent!"}
          </p>
          <p className="text-white/70 text-sm">
            {language === "es"
              ? "Revisa tu correo para el resumen en PDF."
              : "Check your inbox for the PDF summary."}
          </p>
        </div>
      )}
    </div>
  );
}
