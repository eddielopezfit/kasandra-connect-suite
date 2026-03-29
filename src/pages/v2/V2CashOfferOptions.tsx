import { useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { TucsonAlphaCalculator } from "@/components/v2/calculator";
const LazyGoogleReviews = lazy(() => import("@/components/v2/GoogleReviewsSection"));
import { AlertTriangle, Calendar, MessageCircle } from "lucide-react";
import StickyMobileBookingBar from "@/components/v2/StickyMobileBookingBar";
import { logCTAClick } from "@/lib/analytics/ctaDefaults";
import { setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import heroImage from "@/assets/hero-cash-calm.png";
import JourneyBreadcrumb from "@/components/v2/JourneyBreadcrumb";

const V2CashOfferOptionsContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();

  // Set intent to 'cash' so JourneyBreadcrumb shows cash-relevant next steps
  useEffect(() => {
    setFieldIfEmpty('intent', 'cash');
  }, []);
  useDocumentHead({
    titleEn: "Cash Offer vs. Traditional Listing | Tucson Home Sale Calculator",
    titleEs: "Oferta en Efectivo vs. Venta Tradicional | Calculadora de Venta en Tucson",
    descriptionEn: "Compare cash offer vs. traditional listing net proceeds with our Tucson calculator. Understand your options with no pressure.",
    descriptionEs: "Compare ganancias netas de oferta en efectivo vs. venta tradicional con nuestra calculadora de Tucson.",
  });

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-cc-blue/90 to-cc-blue/75" />
        </div>
        <div className="relative container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-3xl">
            <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
              {t("Education & Options", "Educación y Opciones")}
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mt-2 mb-6 text-white">
              {t("Understanding Cash Offers", "Entendiendo las Ofertas en Efectivo")}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {t(
                "Not all cash offers are created equal. Let me help you understand your options so you can make an informed decision—with no pressure.",
                "No todas las ofertas en efectivo son iguales. Permítame ayudarle a entender sus opciones para que pueda tomar una decisión informada—sin presión."
              )}
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('cash-calculator');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center gap-2 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold px-6 py-3 rounded-full shadow-gold transition-all active:scale-95"
              >
                {t("Run My Numbers", "Calcular Mis Números")}
              </button>
              <button
                onClick={() => openChat({ source: 'cash_offer_options_hero', intent: 'cash' })}
                className="inline-flex items-center gap-2 text-cc-gold hover:text-cc-gold/80 text-sm font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {t("Or ask Selena a question", "O pregúntale a Selena")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Progress — visible only to returning users */}
      <section className="py-4">
        <div className="container mx-auto px-4 max-w-3xl">
          <JourneyBreadcrumb />
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section id="cash-calculator" className="py-12 lg:py-16 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mb-4">
                {t("Compare Your Options", "Compara Tus Opciones")}
              </h2>
              <p className="text-cc-charcoal max-w-2xl mx-auto">
                {t(
                  "Use this calculator to see estimated net proceeds for a cash offer versus a traditional listing—based on real Tucson market data.",
                  "Usa esta calculadora para ver las ganancias netas estimadas para una oferta en efectivo versus una venta tradicional—basado en datos reales del mercado de Tucson."
                )}
              </p>
            </div>
            <TucsonAlphaCalculator />
          </div>
        </div>
      </section>

      {/* Warning Section */}
      <section className="py-12 bg-cc-gold/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-10 h-10 text-cc-gold flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl font-bold text-cc-navy mb-3">
                  {t("Watch Out for Wholesaler Issues", "Cuidado con Problemas de Mayoristas")}
                </h3>
                <p className="text-cc-charcoal mb-4">
                  {t(
                    "Not everyone who contacts you with a \"cash offer\" is a legitimate buyer. Some are wholesalers who tie up your property under contract, then sell that contract to an actual buyer—often at your expense.",
                    "No todos los que le contactan con una \"oferta en efectivo\" son compradores legítimos. Algunos son mayoristas que atan su propiedad bajo contrato, luego venden ese contrato a un comprador real—a menudo a su costa."
                  )}
                </p>
                <p className="text-cc-charcoal">
                  {t(
                    "I help you understand the difference and protect yourself from potentially problematic offers.",
                    "Le ayudo a entender la diferencia y protegerse de ofertas potencialmente problemáticas."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Single Terminal CTA — Book + secondary Cash Readiness */}
      <section className="py-16 lg:py-20 pb-24 sm:pb-16 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              {t(
                "You've seen the numbers — let's talk about what fits your situation",
                "Ya viste los números — hablemos de lo que se adapta a tu situación"
              )}
            </h2>
            <p className="text-white/80 text-sm mb-6">
              {t(
                "I walk through both paths with every seller I work with — no pressure, just the full picture so you can decide what actually fits your life.",
                "Reviso ambos caminos con cada vendedor con el que trabajo — sin presión, solo el panorama completo para que decidas lo que realmente se adapta a tu vida."
              )}
            </p>
            <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold">
              <Link
                to="/book?intent=sell&source=cash_offer_bottom"
                onClick={() => logCTAClick({ cta_name: 'cash_offer_bottom_book', destination: '/book', page_path: '/cash-offer-options', intent: 'sell' })}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t("Book a Strategy Call", "Agenda una Llamada de Estrategia")}
              </Link>
            </Button>
            <Link
              to="/cash-readiness"
              className="block mx-auto mt-4 text-white/70 hover:text-cc-gold text-sm font-medium transition-colors"
            >
              {t("Or take the Cash Readiness Check first →", "O toma el Check de Preparación primero →")}
            </Link>
          </div>
        </div>
      </section>

      {/* Google Reviews — Social Proof */}
      <Suspense fallback={null}>
        <LazyGoogleReviews />
      </Suspense>

      {/* Sticky Mobile Booking Bar */}
      <StickyMobileBookingBar intent="sell" source="cash_offer_sticky" />
    </>
  );
};

const V2CashOfferOptions = () => (
  <V2Layout>
    <V2CashOfferOptionsContent />
  </V2Layout>
);

export default V2CashOfferOptions;
