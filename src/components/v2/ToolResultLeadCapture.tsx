/**
 * ToolResultLeadCapture
 * Selena OS V2 — Priority 2: Calculator Result Lead Capture
 * 
 * A lightweight, tool-specific email capture modal that fires
 * after a calculator or tool result renders.
 * 
 * Replaces the heavy LeadCaptureModal with a non-intrusive
 * single-field capture that matches the tool's context.
 */
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/analytics/logEvent";
import { getOrCreateSessionId } from "@/lib/analytics/selenaSession";
import { X, Mail, ArrowRight } from "lucide-react";

export type ToolType = 'affordability' | 'bah' | 'buyer_closing_costs' | 'seller_timeline';

interface ToolResultLeadCaptureProps {
  toolType: ToolType;
  resultData?: Record<string, unknown>;
  onCapture?: (leadId: string) => void;
  onDismiss?: () => void;
  // Delay before showing (ms) — allows user to see result first
  delayMs?: number;
}

const TOOL_COPY: Record<ToolType, { en: { headline: string; sub: string; cta: string }; es: { headline: string; sub: string; cta: string } }> = {
  affordability: {
    en: {
      headline: "Want Kasandra to find homes matching your budget?",
      sub: "Enter your email and she'll send you options in Tucson that fit your price range.",
      cta: "Send me matching homes",
    },
    es: {
      headline: "¿Quieres que Kasandra encuentre casas dentro de tu presupuesto?",
      sub: "Ingresa tu correo y ella te enviará opciones en Tucson que se ajusten a tu rango de precios.",
      cta: "Envíame casas compatibles",
    },
  },
  bah: {
    en: {
      headline: "Get VA-matched listings sent to you",
      sub: "Kasandra works with active-duty and veterans in Tucson. Enter your email for VA-eligible options.",
      cta: "Send me VA listings",
    },
    es: {
      headline: "Recibe listados compatibles con VA",
      sub: "Kasandra trabaja con militares en activo y veteranos en Tucson. Ingresa tu correo para opciones VA.",
      cta: "Enviarme listados VA",
    },
  },
  buyer_closing_costs: {
    en: {
      headline: "Kasandra can negotiate these costs down",
      sub: "She's done it on recent Tucson transactions. A quick review could save you thousands.",
      cta: "Get my cost reduction review",
    },
    es: {
      headline: "Kasandra puede reducir estos costos",
      sub: "Lo ha hecho en transacciones recientes en Tucson. Una revisión rápida podría ahorrarte miles.",
      cta: "Obtener mi revisión de reducción",
    },
  },
  seller_timeline: {
    en: {
      headline: "Walk through this timeline with Kasandra",
      sub: "Every seller's situation is different. Get your personalized timeline review.",
      cta: "Get my personalized review",
    },
    es: {
      headline: "Revisa este cronograma con Kasandra",
      sub: "Cada situación de vendedor es diferente. Obtén tu revisión de cronograma personalizada.",
      cta: "Obtener mi revisión personalizada",
    },
  },
};

const TOOL_TAGS: Record<ToolType, string[]> = {
  affordability: ['affordability_complete', 'selena - intent buyer'],
  bah: ['bah_complete', 'military_buyer', 'selena - intent buyer', 'selena - finance ready'],
  buyer_closing_costs: ['closing_costs_complete', 'selena - intent buyer'],
  seller_timeline: ['seller_timeline_complete', 'selena - intent seller'],
};

export function ToolResultLeadCapture({
  toolType,
  resultData,
  onCapture,
  onDismiss,
  delayMs = 2000,
}: ToolResultLeadCaptureProps) {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const copy = TOOL_COPY[toolType][language as 'en' | 'es'];

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleDismiss = () => {
    setDismissed(true);
    logEvent('tool_capture_dismissed', { tool: toolType });
    onDismiss?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      const sessionId = getOrCreateSessionId();
      const intentMap: Record<ToolType, string> = {
        affordability: 'buy', bah: 'buy', buyer_closing_costs: 'buy', seller_timeline: 'sell',
      };

      const { data, error } = await supabase.functions.invoke('upsert-lead-profile', {
        body: {
          email: email.trim().toLowerCase(),
          session_id: sessionId,
          source: `tool_capture_${toolType}`,
          intent: intentMap[toolType],
          tool_used: toolType,
          ...(resultData && {
            notes: JSON.stringify(resultData).slice(0, 500),
          }),
          tags: TOOL_TAGS[toolType],
          language,
        },
      });

      if (!error && data?.lead_id) {
        logEvent('tool_capture_submitted', { tool: toolType, lead_id: data.lead_id });
        setDone(true);
        onCapture?.(data.lead_id);
      }
    } catch (e) {
      console.error('[ToolResultLeadCapture] Error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || dismissed) return null;

  return (
    <div className="mt-8 bg-cc-navy rounded-2xl p-6 text-white relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      {!done ? (
        <>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-cc-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail className="w-4 h-4 text-cc-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-snug mb-1">{copy.headline}</h3>
              <p className="text-white/60 text-sm">{copy.sub}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={language === 'es' ? "Tu correo electrónico" : "Your email address"}
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
                  {copy.cta}
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
          <p className="text-white/30 text-xs mt-2 text-center">
            {language === 'es' ? "Sin spam. Sin compromiso." : "No spam. No obligation."}
          </p>
        </>
      ) : (
        <div className="text-center py-2">
          <p className="font-semibold text-cc-gold mb-1">
            {language === 'es' ? "¡Listo!" : "You're in!"}
          </p>
          <p className="text-white/70 text-sm">
            {language === 'es'
              ? "Kasandra revisará tu perfil pronto."
              : "Kasandra will review your profile shortly."}
          </p>
        </div>
      )}
    </div>
  );
}

export default ToolResultLeadCapture;
