import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";

/**
 * Premium booking CTA with architectural crosshair corner marks.
 * "Clarity Call" framing per brand psychology — low-risk continuation, not sales event.
 */
const CTASection = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();

  return (
    <section className="relative py-20 lg:py-28 bg-cc-navy overflow-hidden">
      {/* Corner crosshair marks — cc-gold at 60% */}
      {/* Top-left */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10">
        <div className="w-8 h-px bg-cc-gold/60" />
        <div className="w-px h-8 bg-cc-gold/60" />
      </div>
      {/* Top-right */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10">
        <div className="w-8 h-px bg-cc-gold/60 ml-auto" />
        <div className="w-px h-8 bg-cc-gold/60 ml-auto" />
      </div>
      {/* Bottom-left */}
      <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
        <div className="w-px h-8 bg-cc-gold/60" />
        <div className="w-8 h-px bg-cc-gold/60" />
      </div>
      {/* Bottom-right */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10">
        <div className="w-px h-8 bg-cc-gold/60 ml-auto" />
        <div className="w-8 h-px bg-cc-gold/60 ml-auto" />
      </div>

      {/* Subtle gold gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-cc-gold/[0.03] via-transparent to-cc-gold/[0.03]" />

      {/* Content */}
      <div className="relative container mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-cc-ivory leading-tight max-w-3xl mx-auto mb-6">
          {t("Ready to move with clarity?", "¿Listo para avanzar con claridad?")}
        </h2>

        <p className="text-cc-ivory/60 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          {t(
            "Book a private strategy session with Kasandra. No pressure, no scripts — just honest guidance.",
            "Reserva una sesión de estrategia privada con Kasandra. Sin presión, sin guiones — solo orientación honesta."
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/book"
            onClick={() =>
              logCTAClick({
                cta_name: CTA_NAMES.SELENA_ROUTE_CALL,
                destination: "/book",
                page_path: window.location.pathname,
                intent: "explore",
              })
            }
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-cc-gold text-cc-navy font-semibold text-base shadow-gold hover:bg-cc-gold-dark hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cc-gold/50 focus:ring-offset-2 focus:ring-offset-cc-navy"
          >
            {t("Book a Consultation", "Reservar una Consulta")}
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => {
              logCTAClick({
                cta_name: CTA_NAMES.SELENA_ROUTE_CALL,
                destination: "selena_chat",
                page_path: window.location.pathname,
                intent: "explore",
              });
              openChat({ source: "cta_section", intent: "explore" });
            }}
            className="text-cc-ivory/60 hover:text-cc-gold text-sm underline underline-offset-2 transition-colors"
          >
            {t("Or talk to Selena first", "O habla primero con Selena")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
