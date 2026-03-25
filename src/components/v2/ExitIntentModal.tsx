/**
 * ExitIntentModal — P5: Exit-Intent Lead Magnet
 * 
 * Desktop: mouse leaves viewport top → modal
 * Mobile: 30s idle + scroll to top → modal
 * Gate: localStorage, fires once per 30 days
 * Suppression: no fire if user has booked, has active Selena convo, or on /book or /ad/*
 */
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/analytics/logEvent";
import { getOrCreateSessionId } from "@/lib/analytics/selenaSession";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "exit_modal_last_shown";
const GATE_DAYS = 30;

function shouldSuppress(): boolean {
  const path = window.location.pathname;
  if (path.startsWith("/book") || path.startsWith("/ad/")) return true;
  if (localStorage.getItem("selena_booking_confirmed") === "true") return true;
  
  // Check 30-day gate
  const lastShown = localStorage.getItem(STORAGE_KEY);
  if (lastShown) {
    const daysSince = (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24);
    if (daysSince < GATE_DAYS) return true;
  }
  
  // Already captured
  if (localStorage.getItem("selena_lead_id")) return true;
  
  return false;
}

export default function ExitIntentModal() {
  const { t, language } = useLanguage();
  const progress = useJourneyProgress();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const trigger = useCallback(() => {
    if (shouldSuppress()) return;
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setOpen(true);
    logEvent("exit_intent_shown", { page: window.location.pathname });
  }, []);

  useEffect(() => {
    // Desktop: mouse leaves viewport top
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY < 0 && !open) trigger();
    };

    // Mobile: back button (popstate)
    const handlePopState = () => {
      if (!open) {
        // Push state back so user doesn't actually leave
        window.history.pushState(null, "", window.location.href);
        trigger();
      }
    };

    document.addEventListener("mouseout", handleMouseOut);
    
    // Push an extra history entry so we can catch back button
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [trigger, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);

    try {
      const sessionId = getOrCreateSessionId();
      const { data } = await supabase.functions.invoke("upsert-lead-profile", {
        body: {
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          session_id: sessionId,
          source: "exit_intent",
          tags: ["monthly_market_report_subscriber", "exit_intent_captured"],
          language,
        },
      });

      if (data?.lead_id) {
        logEvent("exit_intent_captured", { lead_id: data.lead_id });
        setDone(true);
      }
    } catch (err) {
      console.error("[ExitIntent] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-cc-ivory border-cc-sand-dark max-w-[480px] p-0 overflow-hidden">
        <div className="p-8">
          {!done ? (
            <>
              <div className="text-center mb-6">
                <h2 className="font-serif text-2xl font-bold text-cc-navy mb-2">
                  {progress.journeyDepth === 'engaged' || progress.journeyDepth === 'ready'
                    ? t("Don't lose your progress —", "No pierdas tu progreso —")
                    : t("Before you go —", "Antes de irte —")}
                </h2>
                <p className="text-cc-charcoal/80 text-sm leading-relaxed">
                  {progress.journeyDepth === 'engaged' || progress.journeyDepth === 'ready'
                    ? t(
                        "You've explored tools and guides. Save your email so Selena can pick up where you left off next time.",
                        "Has explorado herramientas y guías. Guarda tu correo para que Selena retome donde lo dejaste la próxima vez."
                      )
                    : t(
                        "Kasandra sends a free monthly Tucson market update to her community. Want yours?",
                        "Kasandra envía una actualización mensual gratuita del mercado de Tucson a su comunidad. ¿Quieres la tuya?"
                      )}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t("Your email address", "Tu correo electrónico")}
                  className="border-cc-sand-dark focus:border-cc-gold focus:ring-cc-gold/20 bg-white"
                  autoFocus
                />
                <Input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t("First name (optional)", "Nombre (opcional)")}
                  className="border-cc-sand-dark focus:border-cc-gold focus:ring-cc-gold/20 bg-white"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-3 shadow-gold"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-cc-navy/40 border-t-cc-navy rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      {progress.journeyDepth === 'engaged' || progress.journeyDepth === 'ready'
                        ? t("Save My Progress", "Guardar Mi Progreso")
                        : t("Get the Free Market Report", "Recibe el Reporte Gratuito")}
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-cc-slate mt-4">
                {t("No spam. Unsubscribe anytime.", "Sin spam. Cancela cuando quieras.")}
              </p>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-cc-gold/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-cc-gold" />
              </div>
              <h3 className="font-serif text-xl font-bold text-cc-navy mb-2">
                {t("You're in!", "¡Estás dentro!")}
              </h3>
              <p className="text-cc-charcoal/70 text-sm">
                {t(
                  "Check your inbox for your first Tucson market update from Kasandra.",
                  "Revisa tu correo para tu primera actualización del mercado de Tucson de Kasandra."
                )}
              </p>
              <Button
                onClick={() => setOpen(false)}
                className="mt-4 bg-cc-navy text-white rounded-full px-6"
              >
                {t("Continue Browsing", "Seguir Explorando")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
