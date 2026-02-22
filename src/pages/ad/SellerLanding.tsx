import { useEffect } from "react";
import { Link } from "react-router-dom";
import SellerFunnelLayout from "@/components/ad/SellerFunnelLayout";
import { Button } from "@/components/ui/button";
import SelenaTextTrigger from "@/components/ad/SelenaTextTrigger";
import { initAdFunnelSession } from "@/lib/analytics/initAdFunnelSession";
import { useLanguage } from "@/contexts/LanguageContext";

const SellerLanding = () => {
  const { t } = useLanguage();

  useEffect(() => {
    initAdFunnelSession();
  }, []);

  return (
    <SellerFunnelLayout>
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-cc-gold/10 border border-cc-gold/30 rounded-full px-4 py-2">
            <span className="text-cc-gold text-sm font-medium">
              {t("Free • No Obligation • Confidential", "Gratis • Sin compromiso • Confidencial")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
            {t("Inherited a Home in Tucson?", "¿Heredaste una casa en Tucson?")}{" "}
            <span className="text-cc-gold">
              {t("See What It's Actually Worth.", "Descubre lo que realmente vale.")}
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-cc-sand text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            {t(
              "Compare a Cash Offer vs. Traditional Listing in about a minute.",
              "Compara una oferta en efectivo vs. listado tradicional en aproximadamente un minuto."
            )}
          </p>

          {/* Primary CTA */}
          <div className="pt-4">
            <Button
              asChild
              size="lg"
              className="bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold text-lg px-10 py-7 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Link to="/ad/seller-quiz">
                {t("Start Free Net Sheet", "Comenzar reporte gratis")}
              </Link>
            </Button>
          </div>

          {/* Secondary CTA */}
          <p className="text-white/60 text-sm">
            {t("Have questions?", "¿Tienes preguntas?")}{" "}
            <SelenaTextTrigger />
          </p>

          {/* Trust indicators */}
          <div className="pt-8 flex flex-wrap justify-center gap-6 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t("No pressure", "Sin presión")}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t("100% free", "100% gratis")}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t("Results in about a minute", "Resultados en aproximadamente un minuto")}</span>
            </div>
          </div>
        </div>
      </div>
    </SellerFunnelLayout>
  );
};

export default SellerLanding;
