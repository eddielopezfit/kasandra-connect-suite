import { useParams, Navigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles, Calendar, MessageCircle } from "lucide-react";
import { getNeighborhoodBySlug } from "@/data/neighborhoods/neighborhoodRegistry";
import JsonLd from "@/components/seo/JsonLd";
import NeighborhoodIntelligencePanel from "@/components/v2/neighborhood/NeighborhoodIntelligencePanel";
import NeighborhoodSplitCTA from "@/components/v2/neighborhood/NeighborhoodSplitCTA";
import RelatedNeighborhoodsRail from "@/components/v2/neighborhood/RelatedNeighborhoodsRail";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { logEvent } from "@/lib/analytics/logEvent";
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import { useEffect, useState } from "react";
import { type NeighborhoodEntry } from "@/data/neighborhoods/neighborhoodRegistry";
import { getNeighborhoodHeroUrl } from "@/lib/neighborhood/heroUrl";

/** Inner content — must render inside V2Layout to access SelenaChatProvider */
const NeighborhoodDetailContent = ({ neighborhood }: { neighborhood: NeighborhoodEntry }) => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  const [heroError, setHeroError] = useState(false);
  const heroUrl = getNeighborhoodHeroUrl(neighborhood.slug);
  useEffect(() => {
    logEvent('neighborhood_page_view', { slug: neighborhood.slug, region: neighborhood.regionGroup });
    updateSessionContext({
      last_neighborhood_zip: neighborhood.primaryZip,
      neighborhood_explored: true,
      last_seen_page_type: 'page',
      last_seen_page_path: `/neighborhoods/${neighborhood.slug}`,
    });
  }, [neighborhood.slug, neighborhood.regionGroup, neighborhood.primaryZip]);

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
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kasandraprietorealtor.com" },
          { "@type": "ListItem", "position": 2, "name": "Neighborhoods", "item": "https://kasandraprietorealtor.com/neighborhoods" },
          { "@type": "ListItem", "position": 3, "name": language === 'es' ? neighborhood.nameEs : neighborhood.name, "item": `https://kasandraprietorealtor.com/neighborhoods/${neighborhood.slug}` }
        ]
      }} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-cc-navy via-cc-navy to-cc-slate py-20 lg:py-28 overflow-hidden">
        {!heroError ? (
          <img
            src={heroUrl}
            alt={`${neighborhood.name} Arizona neighborhood`}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            onError={() => setHeroError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-[url('/og-kasandra.jpg')] bg-cover bg-center opacity-10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cc-navy/90 via-cc-navy/50 to-cc-navy/70" />
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

      {/* Booking Pivot CTA */}
      <section className="py-16 lg:py-20 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            {t(
              `Ready to explore ${neighborhood.name}?`,
              `¿Listo para explorar ${neighborhood.nameEs}?`
            )}
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">
            {t(
              "Kasandra knows this area inside and out. Book a call to discuss your options.",
              "Kasandra conoce esta área de adentro hacia afuera. Agenda una llamada para discutir tus opciones."
            )}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/book?intent=buy&source=neighborhood_detail&neighborhood=${neighborhood.slug}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-cc-gold text-cc-navy font-semibold text-base shadow-gold hover:bg-cc-gold-dark hover:scale-[1.02] transition-all"
            >
              <Calendar className="w-5 h-5" />
              {t("Book a Strategy Call", "Agenda una Llamada de Estrategia")}
            </Link>
            <button
              onClick={handleSelenaOpen}
              className="inline-flex items-center gap-2 text-cc-gold hover:text-cc-gold/80 text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t("Or ask Selena first", "O habla primero con Selena")}
            </button>
          </div>
          {/* P9: Off-market bridge CTA */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <Link
              to={`/off-market?area=${neighborhood.slug}`}
              className="inline-flex items-center gap-2 text-white/70 hover:text-cc-gold text-sm font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t(
                `Looking for off-market homes in ${neighborhood.name}? Join Kasandra's private buyer list.`,
                `¿Buscas casas fuera de mercado en ${neighborhood.nameEs}? Únete a la lista privada de Kasandra.`
              )}
            </Link>
          </div>
        </div>
      </section>
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
    return <Navigate to="/neighborhoods" replace />;
  }

  return (
    <V2Layout>
      <NeighborhoodDetailContent neighborhood={neighborhood} />
    </V2Layout>
  );
};

export default V2NeighborhoodDetail;
