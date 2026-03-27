import { Link, useLocation } from "react-router-dom";
import { ArrowRight, MessageCircle, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";

const SELL_PATHS = ['/sell', '/seller-', '/cash-', '/net-to-seller', '/home-valuation', '/private-cash-review'];
const BUY_PATHS = ['/buy', '/buyer-', '/affordability', '/bah-calculator', '/off-market', '/buyer-closing'];

function getPageIntent(pathname: string): 'sell' | 'buy' | 'general' {
  if (SELL_PATHS.some(p => pathname.startsWith(p))) return 'sell';
  if (BUY_PATHS.some(p => pathname.startsWith(p))) return 'buy';
  return 'general';
}

/**
 * Premium booking CTA with architectural crosshair corner marks.
 * Adapts heading, subtext, and primary CTA based on cognitive stage + page intent.
 */
const CTASection = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const progress = useJourneyProgress();
  const { pathname } = useLocation();
  const pageIntent = getPageIntent(pathname);

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
          {progress.journeyDepth === 'ready'
            ? t("You've done the research. Let's talk.", "Ya investigaste. Hablemos.")
            : progress.journeyDepth === 'engaged'
            ? t("Getting clearer? Let's keep the momentum.", "¿Más claro? Mantengamos el impulso.")
            : t("Ready to move with clarity?", "¿Listo para avanzar con claridad?")}
        </h2>

        <p className="text-cc-ivory/60 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          {progress.journeyDepth === 'ready'
            ? t(
                "Book a private strategy session with Kasandra — she's already reviewed your profile.",
                "Agenda una sesión de estrategia privada con Kasandra — ya revisó tu perfil."
              )
            : progress.journeyDepth === 'engaged'
            ? t(
                "Selena can help you compare your options or connect you with Kasandra when you're ready.",
                "Selena puede ayudarte a comparar opciones o conectarte con Kasandra cuando estés listo."
              )
            : t(
                "Book a private strategy session with Kasandra. No pressure, no scripts — just honest guidance.",
                "Reserva una sesión de estrategia privada con Kasandra. Sin presión, sin guiones — solo orientación honesta."
              )}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {(progress.journeyDepth === 'ready' || progress.journeyDepth === 'engaged') ? (
            <Link
              to="/book"
              onClick={() =>
                logCTAClick({
                  cta_name: CTA_NAMES.SELENA_ROUTE_CALL,
                  destination: '/book',
                  page_path: window.location.pathname,
                  intent: progress.intent || 'explore',
                })
              }
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-cc-gold text-cc-navy font-semibold text-base shadow-gold hover:bg-cc-gold-dark hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cc-gold/50 focus:ring-offset-2 focus:ring-offset-cc-navy"
            >
              <Calendar className="w-4 h-4" />
              {t("Book a Strategy Session", "Agenda una Sesión de Estrategia")}
            </Link>
          ) : progress.nextRecommendedAction.destination.startsWith('selena:') ? (
            <button
              onClick={() => {
                logCTAClick({
                  cta_name: 'cta_section_next_action',
                  destination: 'selena_chat',
                  page_path: window.location.pathname,
                  intent: progress.intent || 'explore',
                });
                openChat({ source: 'cta_section', intent: progress.intent || 'explore' });
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-cc-gold text-cc-navy font-semibold text-base shadow-gold hover:bg-cc-gold-dark hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cc-gold/50 focus:ring-offset-2 focus:ring-offset-cc-navy"
            >
              {t(progress.nextRecommendedAction.labelEn, progress.nextRecommendedAction.labelEs)}
            </button>
          ) : (
            <Link
              to={progress.nextRecommendedAction.destination}
              onClick={() =>
                logCTAClick({
                  cta_name: 'cta_section_next_action',
                  destination: progress.nextRecommendedAction.destination,
                  page_path: window.location.pathname,
                  intent: progress.intent || 'explore',
                })
              }
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-cc-gold text-cc-navy font-semibold text-base shadow-gold hover:bg-cc-gold-dark hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cc-gold/50 focus:ring-offset-2 focus:ring-offset-cc-navy"
            >
              {t(progress.nextRecommendedAction.labelEn, progress.nextRecommendedAction.labelEs)}
            </Link>
          )}

          <button
            onClick={() => {
              logCTAClick({
                cta_name: 'cta_section_selena',
                destination: 'selena_chat',
                page_path: window.location.pathname,
                intent: progress.intent || 'explore',
              });
              openChat({ source: 'cta_section' });
            }}
            className="inline-flex items-center gap-2 text-cc-gold hover:text-cc-gold/80 text-sm font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {t("Or let Selena guide you through this", "O deja que Selena te guíe")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
