import { useState } from "react";
import JourneyBreadcrumb from '@/components/v2/JourneyBreadcrumb';
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles, Calendar, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import TrustBar from "@/components/v2/TrustBar";
import { NEIGHBORHOOD_REGISTRY, type RegionGroup } from "@/data/neighborhoods/neighborhoodRegistry";
import NeighborhoodIndexCard from "@/components/v2/neighborhood/NeighborhoodIndexCard";
import { useSelenaChat } from "@/contexts/SelenaChatContext";

const REGION_LABELS: Record<RegionGroup | 'all', { en: string; es: string }> = {
  all: { en: 'All Areas', es: 'Todas las Áreas' },
  central: { en: 'Central', es: 'Centro' },
  north: { en: 'North', es: 'Norte' },
  east: { en: 'East', es: 'Este' },
  south: { en: 'South', es: 'Sur' },
  metro: { en: 'Greater Metro', es: 'Área Metropolitana' },
};

/** Inner component — must be rendered inside V2Layout to access SelenaChatProvider */
const NeighborhoodsContent = () => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  const [activeRegion, setActiveRegion] = useState<RegionGroup | 'all'>('all');

  const filteredNeighborhoods = activeRegion === 'all'
    ? NEIGHBORHOOD_REGISTRY
    : NEIGHBORHOOD_REGISTRY.filter(n => n.regionGroup === activeRegion);

  const handleSelenaOpen = () => {
    openChat({
      source: 'neighborhoods_index',
      prefillMessage: t(
        "I'm exploring Tucson neighborhoods and want help finding the right fit.",
        "Estoy explorando vecindarios de Tucson y quiero ayuda para encontrar el adecuado."
      ),
    });
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-cc-navy via-cc-navy to-cc-slate py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('/og-kasandra.jpg')] bg-cover bg-bottom md:bg-center opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-cc-gold/20 text-cc-gold px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              {t("15 Communities", "15 Comunidades")}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t("Tucson Area Neighborhoods", "Vecindarios del Área de Tucson")}
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              {t(
                "From downtown Tucson to quiet acreage communities — find the neighborhood that fits your life, not just your budget.",
                "Desde el centro de Tucson hasta comunidades tranquilas con terreno — encuentra el vecindario que se adapte a tu vida, no solo a tu presupuesto."
              )}
            </p>
            <Button
              onClick={handleSelenaOpen}
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold px-8 py-6 text-lg rounded-full shadow-gold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {t("Help Me Find My Neighborhood", "Ayúdame a Encontrar Mi Vecindario")}
            </Button>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="bg-cc-ivory border-b border-cc-sand-dark/20 sticky top-[72px] z-[30]">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-4 gap-2 no-scrollbar">
            {(Object.keys(REGION_LABELS) as Array<RegionGroup | 'all'>).map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeRegion === region
                    ? 'bg-cc-navy text-white'
                    : 'bg-white text-cc-charcoal hover:bg-cc-sand border border-cc-sand-dark/20'
                }`}
              >
                {language === 'es' ? REGION_LABELS[region].es : REGION_LABELS[region].en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <TrustBar />

      {/* Grid */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNeighborhoods.map((neighborhood) => (
              <NeighborhoodIndexCard key={neighborhood.slug} neighborhood={neighborhood} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 lg:py-20 pb-24 sm:pb-16 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
            {t("Found a Neighborhood You Like?", "¿Encontraste un Vecindario que Te Gusta?")}
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            {t(
              "Let's talk about what's available and what fits your budget in the areas you're exploring.",
              "Hablemos sobre lo que está disponible y lo que cabe en tu presupuesto en las áreas que estás explorando."
            )}
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-10 py-6 text-lg shadow-gold">
              <Link
                to="/book?intent=buy&source=neighborhoods_bottom"
                onClick={() => logCTAClick({ cta_name: 'neighborhoods_book_call', destination: '/book', page_path: '/neighborhoods', intent: 'buy' })}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t("Book a Neighborhood Tour", "Agenda un Recorrido de Vecindario")}
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="text-white/80 hover:text-cc-gold font-medium rounded-full px-8"
              onClick={() => {
                logCTAClick({ cta_name: CTA_NAMES.RESULT_CHAT_SELENA, destination: 'selena_drawer', page_path: '/neighborhoods', intent: 'buy' });
                openChat({ source: 'neighborhoods_index', intent: 'buy' });
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("Ask Selena About Neighborhoods", "Pregúntale a Selena Sobre Vecindarios")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

const V2Neighborhoods = () => {
  useDocumentHead({
    titleEn: "Tucson Area Neighborhoods — Find Your Fit | Kasandra Prieto",
    titleEs: "Vecindarios del Área de Tucson — Encuentra Tu Lugar | Kasandra Prieto",
    descriptionEn: "Explore 15 Tucson-area neighborhoods with expert insights on buying and selling. Local market intelligence from Kasandra Prieto.",
    descriptionEs: "Explora 15 vecindarios del área de Tucson con información experta sobre compra y venta. Inteligencia de mercado local de Kasandra Prieto.",
  });

  return (
    <V2Layout>
      <NeighborhoodsContent />
    </V2Layout>
  );
};

export default V2Neighborhoods;
