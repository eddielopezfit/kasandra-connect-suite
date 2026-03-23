import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { TucsonAlphaCalculator } from "@/components/v2/calculator";
import { Button } from "@/components/ui/button";
import { Calculator, MessageCircle, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import JsonLd from "@/components/seo/JsonLd";

const V2NetToSellerContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();

  useDocumentHead({
    titleEn: "Net-to-Seller Calculator | What Will You Actually Walk Away With?",
    titleEs: "Calculadora Neto al Vendedor | ¿Cuánto Te Llevarás Realmente?",
    descriptionEn: "Calculate your real net proceeds after commissions, closing costs, and repairs. Compare cash offer vs. traditional listing in Tucson.",
    descriptionEs: "Calcula tus ganancias netas reales después de comisiones, costos de cierre y reparaciones. Compara oferta en efectivo vs. listado tradicional en Tucson.",
  });

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Net-to-Seller Calculator",
        description: "Calculate your real net proceeds from selling your Tucson home. Compare cash offer vs. traditional listing.",
        url: "https://kasandraprietorealtor.com/net-to-seller",
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }} />

      {/* Hero */}
      <section className="bg-cc-navy pt-32 pb-14">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-cc-gold/15 text-cc-gold rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Calculator className="w-4 h-4" />
            {t("Free Tool — No Login Required", "Herramienta Gratuita — Sin Registro")}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 leading-[1.1]">
            {t("Net-to-Seller Calculator", "Calculadora Neto al Vendedor")}
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            {t(
              "See what you'd actually walk away with — after commissions, closing costs, and repairs. Cash offer vs. traditional listing, side by side.",
              "Descubre cuánto te llevarías realmente — después de comisiones, costos de cierre y reparaciones. Oferta en efectivo vs. listado tradicional, lado a lado."
            )}
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="bg-cc-ivory py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <TucsonAlphaCalculator />
        </div>
      </section>

      {/* Bottom CTAs */}
      <section className="bg-cc-sand py-14">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="font-serif text-2xl font-bold text-cc-navy mb-2">
            {t("Want a Personalized Number?", "¿Quieres un Número Personalizado?")}
          </h2>
          <p className="text-cc-text-muted text-sm mb-6">
            {t(
              "The calculator gives you a solid estimate. A CMA from Kasandra gives you the actual number based on recent sales in your neighborhood.",
              "La calculadora te da un estimado sólido. Un CMA de Kasandra te da el número real basado en ventas recientes en tu vecindario."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 shadow-gold"
              size="lg"
            >
              <Link to="/home-valuation">
                <ArrowRight className="w-4 h-4 mr-2" />
                {t("Get a Free CMA", "Obtener un CMA Gratuito")}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-cc-navy/20 text-cc-navy hover:bg-cc-navy hover:text-white rounded-full px-6"
              size="lg"
              onClick={() => {
                logCTAClick({ cta_name: CTA_NAMES.RESULT_CHAT_SELENA, destination: 'selena_drawer', page_path: '/net-to-seller', intent: 'sell' });
                openChat({ source: 'calculator', intent: 'sell' });
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("Ask Selena", "Pregúntale a Selena")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

const V2NetToSeller = () => (
  <V2Layout>
    <V2NetToSellerContent />
  </V2Layout>
);

export default V2NetToSeller;
