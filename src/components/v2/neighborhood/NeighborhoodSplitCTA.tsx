import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, DollarSign } from "lucide-react";
import { type NeighborhoodEntry } from "@/data/neighborhoods/neighborhoodRegistry";

interface NeighborhoodSplitCTAProps {
  neighborhood: NeighborhoodEntry;
}

const NeighborhoodSplitCTA = ({ neighborhood }: NeighborhoodSplitCTAProps) => {
  const { t, language } = useLanguage();

  return (
    <section className="py-16 lg:py-20 bg-cc-ivory">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mb-4">
            {t("Your Path Forward", "Tu Camino a Seguir")}
          </h2>
          <p className="text-cc-text-muted max-w-2xl mx-auto">
            {t(
              `Whether you're buying into ${neighborhood.name} or selling your home here, Kasandra has the local knowledge to guide your next move.`,
              `Ya sea que estés comprando en ${neighborhood.nameEs} o vendiendo tu casa aquí, Kasandra tiene el conocimiento local para guiar tu próximo paso.`
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Seller Column */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-cc-sand-dark/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-cc-gold" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-cc-navy">
                {t("Selling Here", "Vendiendo Aquí")}
              </h3>
            </div>
            <p className="text-cc-charcoal leading-relaxed mb-6">
              {language === 'es' ? neighborhood.sellerProfile.es : neighborhood.sellerProfile.en}
            </p>
            <Button asChild className="w-full bg-cc-navy hover:bg-cc-navy/90 text-white font-semibold py-6 rounded-lg">
              <Link to={`/seller-readiness?neighborhood=${neighborhood.slug}`}>
                {t("Check My Seller Readiness", "Verificar Mi Preparación de Vendedor")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Buyer Column */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-cc-sand-dark/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center">
                <Home className="w-6 h-6 text-cc-gold" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-cc-navy">
                {t("Buying Here", "Comprando Aquí")}
              </h3>
            </div>
            <p className="text-cc-charcoal leading-relaxed mb-6">
              {language === 'es' ? neighborhood.buyerProfile.es : neighborhood.buyerProfile.en}
            </p>
            <Button asChild className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold py-6 rounded-lg shadow-gold">
              <Link to={`/buyer-readiness?neighborhood=${neighborhood.slug}`}>
                {t("Check My Buyer Readiness", "Verificar Mi Preparación de Comprador")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NeighborhoodSplitCTA;
