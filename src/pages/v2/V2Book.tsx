/**
 * V2Book — Booking Page with Native Booking Flow
 * 
 * Replaces GHL iframe with a 3-step native flow:
 * 1. Lead capture (name, email, phone, intent)
 * 2. Real-time slot selection via GHL Calendar API
 * 3. Confirmation + handoff to Kasandra
 * 
 * Still calls enrich-booking-context for dossier bridge.
 */
import { useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import { NativeBookingFlow, BookingHydrationPanel } from "@/components/v2/booking";
import JourneyBreadcrumb from "@/components/v2/JourneyBreadcrumb";
import { Calendar } from "lucide-react";
import { logEvent } from "@/lib/analytics/logEvent";
import { getSessionContext, getOrCreateSessionId } from "@/lib/analytics/selenaSession";
import { supabase } from "@/integrations/supabase/client";
import { getLeadId } from "@/lib/analytics/bridgeLeadIdToV2";

const CALL_TYPE_SUBTITLES: Record<string, { en: string; es: string }> = {
  'clarity-call': {
    en: "A focused 15-minute call to get clear on your options — no obligation.",
    es: "Una llamada enfocada de 15 minutos para aclarar sus opciones — sin compromiso.",
  },
  'virtual-walkthrough': {
    en: "A virtual walkthrough so you can explore your property's potential from anywhere.",
    es: "Un recorrido virtual para que explore el potencial de su propiedad desde cualquier lugar.",
  },
  'no-pressure-review': {
    en: "A relaxed, no-pressure review of your situation — just honest guidance.",
    es: "Una revisión relajada y sin presión de su situación — solo orientación honesta.",
  },
};

type DossierState = 'loading' | 'ready' | 'skipped';

interface DossierResult {
  readiness_score?: number;
  tools_completed?: string[];
  guides_read_count?: number;
  intent?: string;
  situation?: string;
  inherited_home?: boolean;
  military_flag?: boolean;
  language?: string;
  journey_state?: string;
}

const V2BookContent = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [dossierState, setDossierState] = useState<DossierState>('loading');
  const [dossierResult, setDossierResult] = useState<DossierResult | null>(null);
  const enrichedRef = useRef(false);

  useDocumentHead({
    titleEn: "Book a Consultation | Kasandra Prieto, Tucson Realtor",
    titleEs: "Agendar una Consulta | Kasandra Prieto, Realtor en Tucson",
    descriptionEn: "Schedule a conversation with Kasandra Prieto. Bilingual real estate consultation for buyers and sellers in Tucson.",
    descriptionEs: "Agende una conversación con Kasandra Prieto. Consulta bilingüe de bienes raíces para compradores y vendedores en Tucson.",
  });

  const callType = searchParams.get("callType");
  const intent = searchParams.get("intent") || "direct";
  const source = searchParams.get("source");

  // Build context note based on dossier or arrival params
  const getContextNote = () => {
    if (dossierResult?.readiness_score && dossierResult.readiness_score >= 75) {
      const tool = dossierResult.tools_completed?.[dossierResult.tools_completed.length - 1];
      if (tool) {
        return {
          en: `Your ${tool.replace(/_/g, ' ')} results and profile are ready for Kasandra to review before your call.`,
          es: `Sus resultados de ${tool.replace(/_/g, ' ')} y perfil están listos para que Kasandra los revise antes de su llamada.`,
        };
      }
    }
    if (dossierResult?.inherited_home) {
      return {
        en: "Kasandra will review your inherited property situation before your call.",
        es: "Kasandra revisará su situación de propiedad heredada antes de su llamada.",
      };
    }
    if (dossierResult?.military_flag) {
      return {
        en: "Kasandra will review your VA loan profile and BAH results before your call.",
        es: "Kasandra revisará su perfil de préstamo VA y resultados de BAH antes de su llamada.",
      };
    }
    if (source === 'calculator' && (intent === 'cash' || intent === 'sell')) {
      return {
        en: "Kasandra will review your cash vs. listing comparison before your call.",
        es: "Kasandra revisará su comparación de efectivo vs. venta antes de su llamada.",
      };
    }
    if (source?.includes('affordability') || intent === 'buy') {
      return {
        en: "Kasandra will review your affordability results before your call.",
        es: "Kasandra revisará sus resultados de asequibilidad antes de su llamada.",
      };
    }
    if (intent === 'sell') {
      return {
        en: "Kasandra will review your selling situation before your call.",
        es: "Kasandra revisará su situación de venta antes de su llamada.",
      };
    }
    return null;
  };

  // Priority 1: Enrich booking context before showing form
  useEffect(() => {
    if (enrichedRef.current) return;
    enrichedRef.current = true;

    const enrichBooking = async () => {
      try {
        const sessionId = getOrCreateSessionId();
        const leadId = getLeadId();
        const ctx = getSessionContext();

        const payload = {
          session_id: sessionId,
          lead_id: leadId || undefined,
          intent: ctx?.intent || intent || undefined,
          situation: ctx?.situation || undefined,
          timeline: ctx?.timeline || undefined,
          language: language || ctx?.language || 'en',
          readiness_score: ctx?.readiness_score || undefined,
          readiness_type: ctx?.last_tool_completed?.includes('buyer') ? 'buyer' :
                          ctx?.last_tool_completed?.includes('seller') ? 'seller' :
                          ctx?.last_tool_completed?.includes('cash') ? 'cash' : undefined,
          primary_priority: ctx?.primary_priority || undefined,
          tools_completed: ctx?.tools_completed || undefined,
          guides_read: ctx?.guides_completed || undefined,
          guides_read_count: ctx?.guides_read || undefined,
          calculator_advantage: ctx?.calculator_advantage || undefined,
          calculator_difference: ctx?.calculator_difference || undefined,
          estimated_value: ctx?.estimated_value || undefined,
          estimated_budget: ctx?.estimated_budget || undefined,
          decision_receipt_id: ctx?.seller_decision_recommended_path ? undefined : undefined,
          seller_decision_path: ctx?.seller_decision_recommended_path || undefined,
          seller_goal_priority: ctx?.seller_goal_priority || undefined,
          property_condition_raw: ctx?.property_condition_raw || undefined,
          journey_state: ctx?.journey_state || undefined,
          chip_phase_floor: ctx?.chip_phase_floor || undefined,
          inherited_home: ctx?.inherited_home || undefined,
          military_flag: (ctx?.last_tool_completed === 'bah_calculator' ||
                         (ctx?.tools_completed || []).includes('bah_calculator')) || undefined,
          neighborhood_zip: ctx?.last_neighborhood_zip || undefined,
          last_guide_title: ctx?.entry_guide_title || undefined,
          selena_mode_reached: ctx?.current_mode || undefined,
          utm_source: ctx?.utm_source || undefined,
          utm_campaign: ctx?.utm_campaign || undefined,
          source: source || ctx?.entry_source || undefined,
        };

        const { data, error } = await supabase.functions.invoke('enrich-booking-context', {
          body: payload,
        });

        if (error) {
          console.warn('[V2Book] Enrichment failed silently:', error.message);
          setDossierState('skipped');
          return;
        }

        if (data?.ok) {
          setDossierResult({
            readiness_score: payload.readiness_score,
            tools_completed: payload.tools_completed,
            guides_read_count: payload.guides_read_count,
            intent: payload.intent,
            situation: payload.situation,
            inherited_home: payload.inherited_home,
            military_flag: payload.military_flag,
            language: payload.language,
            journey_state: payload.journey_state,
          });
        }
      } catch (e) {
        console.warn('[V2Book] Enrichment error (non-blocking):', e);
      } finally {
        setDossierState('ready');
      }
    };

    const timer = setTimeout(enrichBooking, 600);
    return () => clearTimeout(timer);
  }, [intent, language, source]);

  // Analytics
  useEffect(() => {
    const utm_source = searchParams.get("utm_source");
    const utm_campaign = searchParams.get("utm_campaign");
    logEvent('booking_started', {
      intent,
      ...(callType && { call_type: callType }),
      ...(utm_source && { utm_source }),
      ...(utm_campaign && { utm_campaign }),
      dossier_enriched: dossierState === 'ready',
    });
  }, [searchParams, callType, intent, dossierState]);

  const contextNote = getContextNote();

  return (
    <>
      {/* Header */}
      <section className="bg-cc-navy pt-32 pb-12 w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Calendar className="w-12 h-12 text-cc-gold mx-auto mb-6" />
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-white">
              {t(
                "Schedule a Conversation with Kasandra",
                "Agende una Conversación con Kasandra"
              )}
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              {callType ? (
                t(
                  CALL_TYPE_SUBTITLES[callType]?.en || "Share a few details so Kasandra can prepare for your conversation.",
                  CALL_TYPE_SUBTITLES[callType]?.es || "Comparta algunos detalles para que Kasandra pueda prepararse para su conversación."
                )
              ) : (
                t(
                  "Share a few details so Kasandra can prepare for your conversation.",
                  "Comparta algunos detalles para que Kasandra pueda prepararse para su conversación."
                )
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="bg-cc-navy border-t border-white/10 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/70">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cc-gold inline-block" />
                {t("Realty Executives · Pima County Specialist", "Realty Executives · Especialista en Condado de Pima")}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cc-gold inline-block" />
                {t("Bilingual · English & Spanish", "Bilingüe · Inglés y Español")}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cc-gold inline-block" />
                {t("No pressure · No obligation", "Sin presión · Sin compromiso")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Native Booking Section */}
      <section className="py-8 md:py-12 bg-cc-ivory w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">

            {/* Dossier Loading State */}
            {dossierState === 'loading' && (
              <div className="bg-cc-navy/5 border border-cc-gold/20 rounded-xl p-5 mb-6 text-center animate-pulse">
                <div className="flex items-center justify-center gap-3 text-cc-navy/70">
                  <div className="w-5 h-5 border-2 border-cc-gold/40 border-t-cc-gold rounded-full animate-spin" />
                  <p className="text-sm font-medium">
                    {t(
                      "Kasandra is reviewing your profile so your call is more personalized...",
                      "Kasandra está revisando su perfil para que su llamada sea más personalizada..."
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* What Kasandra Already Knows — session-aware hydration panel */}
            {dossierState === 'ready' && (
              <div className="mb-6">
                <BookingHydrationPanel />
              </div>
            )}

            {/* Context note from source/intent */}
            {contextNote && dossierState !== 'loading' && (
              <div className="bg-cc-sand rounded-xl p-4 mb-6 text-center border border-cc-sand-dark/30">
                <p className="text-sm text-cc-charcoal">
                  {t(contextNote.en, contextNote.es)}
                </p>
              </div>
            )}

            {/* Journey breadcrumb */}
            {dossierState !== 'loading' && (
              <div className="mb-6">
                <JourneyBreadcrumb />
              </div>
            )}

            {/* Native Booking Flow — replaces GHL iframe */}
            {dossierState !== 'loading' && (
              <NativeBookingFlow defaultIntent={intent} />
            )}
          </div>
        </div>
      </section>

      {/* Bilingual Note */}
      <section className="py-10 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/90">
            {t(
              "Bilingual service available in English and Spanish. / Servicio bilingüe disponible en inglés y español.",
              "Servicio bilingüe disponible en inglés y español. / Bilingual service available in English and Spanish."
            )}
          </p>
        </div>
      </section>
    </>
  );
};

const V2Book = () => (
  <V2Layout>
    <V2BookContent />
  </V2Layout>
);

export default V2Book;
