import V2Layout from "@/components/v2/V2Layout";
import BuyerReadinessCheck from "@/components/v2/BuyerReadinessCheck";
import { useLanguage } from "@/contexts/LanguageContext";

const V2BuyerReadinessContent = () => {
  const { t } = useLanguage();

  return (
    <>
      {/* Hero */}
      <section className="bg-cc-navy pt-32 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
              {t("For Buyers", "Para Compradores")}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2 mb-4 text-white">
              {t("Where Are You in Your Home Buying Journey?", "¿Dónde Estás en Tu Camino de Compra de Casa?")}
            </h1>
            <p className="text-white/80">
              {t(
                "A quick check to help you understand your next best step—no pressure, just clarity.",
                "Una evaluación rápida para ayudarte a entender tu mejor próximo paso—sin presión, solo claridad."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Check Component */}
      <section className="py-12 lg:py-16 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-elevated">
            <BuyerReadinessCheck />
          </div>
        </div>
      </section>
    </>
  );
};

const V2BuyerReadiness = () => (
  <V2Layout>
    <V2BuyerReadinessContent />
  </V2Layout>
);

export default V2BuyerReadiness;
