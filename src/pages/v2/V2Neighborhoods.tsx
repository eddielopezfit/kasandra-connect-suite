import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles } from "lucide-react";
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

const V2Neighborhoods = () => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  const [activeRegion, setActiveRegion] = useState<RegionGroup | 'all'>('all');

  useDocumentHead({
    titleEn: "Tucson Area Neighborhoods — Find Your Fit | Kasandra Prieto",
    titleEs: "Vecindarios del Área de Tucson — Encuentra Tu Lugar | Kasandra Prieto",
    descriptionEn: "Explore 15 Tucson-area neighborhoods with expert insights on buying and selling. Local market intelligence from Kasandra Prieto.",
    descriptionEs: "Explora 15 vecindarios del área de Tucson con información experta sobre compra y venta. Inteligencia de mercado local de Kasandra Prieto.",
  });

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
    <V2Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-cc-navy via-cc-navy to-cc-slate py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('/og-kasandra.jpg')] bg-cover bg-center opacity-10" />
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
      <section className="bg-cc-ivory border-b border-cc-sand-dark/20 sticky top-16 z-30">
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

      {/* Grid */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNeighborhoods.map((neighborhood) => (
              <NeighborhoodIndexCard key={neighborhood.slug} neighborhood={neighborhood} />
            ))}
          </div>
          
          {filteredNeighborhoods.length === 0 && (
            <div className="text-center py-12 text-cc-text-muted">
              {t("No neighborhoods found in this region.", "No se encontraron vecindarios en esta región.")}
            </div>
          )}
        </div>
      </section>
    </V2Layout>
  );
};

export default V2Neighborhoods;
