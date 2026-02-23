import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import V2Layout from "@/components/v2/V2Layout";
import GHLBookingCalendar from "@/components/v2/GHLBookingCalendar";
import { Calendar } from "lucide-react";
import { logEvent } from "@/lib/analytics/logEvent";

const V2BookContent = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent");

  // Condition 1: lightweight analytics — log page view + intent
  useEffect(() => {
    logEvent('booking_started', { intent: intent || 'direct' });
  }, [intent]);

  return (
    <>
      {/* Header */}
      <section className="bg-cc-navy pt-32 pb-12 w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Calendar className="w-12 h-12 text-cc-gold mx-auto mb-6" />
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
              {t(
                "Schedule a Conversation with Kasandra",
                "Agende una Conversación con Kasandra"
              )}
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              {t(
                "Choose a time that works best for you. Kasandra personally reviews each situation before your conversation.",
                "Elija un horario que le funcione mejor. Kasandra revisa personalmente cada situación antes de la conversación."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Calendar Embed */}
      <section className="py-8 md:py-12 bg-cc-ivory w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
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
