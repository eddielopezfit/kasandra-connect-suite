import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import GHLBookingCalendar from "@/components/v2/GHLBookingCalendar";
import { Calendar } from "lucide-react";
import { logEvent } from "@/lib/analytics/logEvent";

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

const V2BookContent = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  useDocumentHead({
    titleEn: "Book a Consultation | Kasandra Prieto, Tucson Realtor",
    titleEs: "Agendar una Consulta | Kasandra Prieto, Realtor en Tucson",
    descriptionEn: "Schedule a conversation with Kasandra Prieto. Bilingual real estate consultation for buyers and sellers in Tucson.",
    descriptionEs: "Agende una conversación con Kasandra Prieto. Consulta bilingüe de bienes raíces para compradores y vendedores en Tucson.",
  });

  const callType = searchParams.get("callType");
  const intent = searchParams.get("intent") || "direct";
  const source = searchParams.get("source");

  // Contextual prep note based on how the user arrived
  const getContextNote = () => {
    if (source === 'calculator' && intent === 'cash') {
      return {
        en: "Kasandra will review your cash vs. listing comparison before your call.",
        es: "Kasandra revisará su comparación de efectivo vs. venta antes de su llamada.",
      };
    }
    if (source === 'affordability_calculator' || intent === 'buy') {
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

  const contextNote = getContextNote();

  // Condition 1: lightweight analytics — log page view + intent + UTMs
  useEffect(() => {
    const utm_source = searchParams.get("utm_source");
    const utm_campaign = searchParams.get("utm_campaign");
    const utm_medium = searchParams.get("utm_medium");
    const utm_content = searchParams.get("utm_content");
    const utm_term = searchParams.get("utm_term");

    logEvent('booking_started', {
      intent,
      ...(callType && { call_type: callType }),
      ...(utm_source && { utm_source }),
      ...(utm_campaign && { utm_campaign }),
      ...(utm_medium && { utm_medium }),
      ...(utm_content && { utm_content }),
      ...(utm_term && { utm_term }),
    });
  }, [searchParams, callType, intent]);

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
                  CALL_TYPE_SUBTITLES[callType]?.en || "Choose a time that works best for you. Kasandra personally reviews each situation before your conversation.",
                  CALL_TYPE_SUBTITLES[callType]?.es || "Elija un horario que le funcione mejor. Kasandra revisa personalmente cada situación antes de la conversación."
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

      {/* Trust signals — reduces cold feet at the booking moment */}
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

      {/* Calendar Embed */}
      <section className="py-8 md:py-12 bg-cc-ivory w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {contextNote && (
              <div className="bg-cc-sand rounded-xl p-4 mb-6 text-center border border-cc-sand-dark/30">
                <p className="text-sm text-cc-charcoal">
                  {t(contextNote.en, contextNote.es)}
                </p>
              </div>
            )}
            <GHLBookingCalendar />
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
