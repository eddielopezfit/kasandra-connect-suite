import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { NEIGHBORHOOD_REGISTRY } from "@/data/neighborhoods/neighborhoodRegistry";
import { getNeighborhoodHeroUrl } from "@/lib/neighborhood/heroUrl";
import { useState } from "react";

/** 3 featured neighborhoods for homepage — diverse buyer profiles */
const FEATURED_SLUGS = ["catalina-foothills", "marana", "sahuarita"];

const HomepageNeighborhoodCards = () => {
  const { t, language } = useLanguage();
  
  const featured = FEATURED_SLUGS.map(slug =>
    NEIGHBORHOOD_REGISTRY.find(n => n.slug === slug)!
  ).filter(Boolean);

  return (
    <section className="py-16 lg:py-20 bg-cc-ivory">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
            {t("Explore Tucson", "Explora Tucson")}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mt-2 mb-3">
            {t("Find Your Neighborhood", "Encuentra Tu Vecindario")}
          </h2>
          <p className="text-cc-text-muted max-w-xl mx-auto">
            {t(
              "15 Tucson communities — schools, market data, and what it's actually like to live there.",
              "15 comunidades de Tucson — escuelas, datos del mercado y cómo es realmente vivir allí."
            )}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featured.map(neighborhood => (
            <NeighborhoodFeatureCard key={neighborhood.slug} neighborhood={neighborhood} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Link
            to="/neighborhoods"
            className="inline-flex items-center gap-2 text-cc-gold font-semibold hover:gap-3 transition-all"
          >
            {t("Explore all 15 Tucson neighborhoods", "Explora los 15 vecindarios de Tucson")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

function NeighborhoodFeatureCard({ neighborhood }: { neighborhood: typeof NEIGHBORHOOD_REGISTRY[number] }) {
  const { language } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const heroUrl = getNeighborhoodHeroUrl(neighborhood.slug);

  return (
    <Link to={`/neighborhoods/${neighborhood.slug}`} className="group">
      <div className="bg-white rounded-2xl overflow-hidden border border-cc-sand-dark/20 shadow-soft hover:shadow-elevated transition-all duration-300 group-hover:scale-[1.02]">
        {/* Image */}
        <div className="h-44 relative overflow-hidden bg-gradient-to-br from-cc-navy/80 to-cc-slate/60">
          {!imgError ? (
            <img
              src={heroUrl}
              alt={`${neighborhood.name} neighborhood in Tucson`}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
              width={400}
              height={176}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-[url('/og-kasandra.jpg')] bg-cover bg-center opacity-20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-1 text-white/80 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            {neighborhood.primaryZip}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-serif text-xl font-bold text-cc-navy mb-2 group-hover:text-cc-gold transition-colors">
            {language === "es" ? neighborhood.nameEs : neighborhood.name}
          </h3>
          <p className="text-cc-text-muted text-sm line-clamp-2 mb-3">
            {language === "es" ? neighborhood.heroTagline.es : neighborhood.heroTagline.en}
          </p>
          <span className="inline-flex items-center text-cc-gold font-medium text-sm group-hover:gap-2 transition-all">
            {language === "es" ? "Explorar" : "Explore"}
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default HomepageNeighborhoodCards;
