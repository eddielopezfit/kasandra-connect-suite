import { useParams, Navigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles } from "lucide-react";
import { getNeighborhoodBySlug } from "@/data/neighborhoods/neighborhoodRegistry";
import JsonLd from "@/components/seo/JsonLd";
import NeighborhoodIntelligencePanel from "@/components/v2/neighborhood/NeighborhoodIntelligencePanel";
import NeighborhoodSplitCTA from "@/components/v2/neighborhood/NeighborhoodSplitCTA";
import RelatedNeighborhoodsRail from "@/components/v2/neighborhood/RelatedNeighborhoodsRail";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { logEvent } from "@/lib/analytics/logEvent";
import { useEffect } from "react";
import { type NeighborhoodEntry } from "@/data/neighborhoods/neighborhoodRegistry";

/** Inner content — must render inside V2Layout to access SelenaChatProvider */
const NeighborhoodDetailContent = ({ neighborhood }: { neighborhood: NeighborhoodEntry }) => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();

  useEffect(() => {
    logEvent('neighborhood_page_view', { slug: neighborhood.slug, region: neighborhood.regionGroup });
  }, [neighborhood.slug, neighborhood.regionGroup]);

  const handleSelenaOpen = () => {
    openChat({
      source: 'neighborhood_detail',
      neighborhoodSlug: neighborhood.slug,
      neighborhoodName: neighborhood.name,
      prefillMessage: t(
        `I'm interested in ${neighborhood.name} — can you tell me more about this area?`,
        `Me interesa ${neighborhood.nameEs} — ¿puedes contarme más sobre esta área?`
      ),
    });
  };

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Kasandra Prieto - Corner Connect",
    "description": language === 'es' ? neighborhood.metaDescription.es : neighborhood.metaDescription.en,
    "areaServed": {
      "@type": "Place",
      "name": `${neighborhood.name}, Arizona`
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": neighborhood.name,
      "addressRegion": "AZ",
      "postalCode": neighborhood.primaryZip,
      "addressCountry": "US"
    }
  };

  return (
    <>
      <JsonLd data={jsonLdData} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-cc-navy via-cc-navy to-cc-slate py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('/og-kasandra.jpg')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-cc-gold/20 text-cc-gold px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              {neighborhood.primaryZip}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {language === 'es' ? neighborhood.nameEs : neighborhood.name}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto italic">
              {language === 'es' ? neighborhood.heroTagline.es : neighborhood.heroTagline.en}
            </p>
            <Button
              onClick={handleSelenaOpen}
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold px-8 py-6 text-lg rounded-full shadow-gold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {t(`Talk to Kasandra About ${neighborhood.name}`, `Habla con Kasandra Sobre ${neighborhood.nameEs}`)}
            </Button>
          </div>
        </div>
      </section>

      {/* Intelligence Panel */}
      <NeighborhoodIntelligencePanel 
        zipCode={neighborhood.primaryZip} 
        neighborhoodName={neighborhood.neighborhoodQueryName || neighborhood.name}
      />

      {/* Seller / Buyer Split */}
      <NeighborhoodSplitCTA neighborhood={neighborhood} />

      {/* Related Neighborhoods + Guides */}
      <RelatedNeighborhoodsRail neighborhood={neighborhood} />
    </>
  );
};

const V2NeighborhoodDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const neighborhood = slug ? getNeighborhoodBySlug(slug) : undefined;

  useDocumentHead({
    titleEn: neighborhood ? `${neighborhood.name} AZ Real Estate | Kasandra Prieto — Corner Connect` : "Neighborhood Not Found",
    titleEs: neighborhood ? `Bienes Raíces en ${neighborhood.nameEs} AZ | Kasandra Prieto — Corner Connect` : "Vecindario No Encontrado",
    descriptionEn: neighborhood?.metaDescription.en || "",
    descriptionEs: neighborhood?.metaDescription.es || "",
  });

  if (!neighborhood) {
    return <Navigate to="/v2/neighborhoods" replace />;
  }

  return (
    <V2Layout>
      <NeighborhoodDetailContent neighborhood={neighborhood} />
    </V2Layout>
  );
};

export default V2NeighborhoodDetail;
