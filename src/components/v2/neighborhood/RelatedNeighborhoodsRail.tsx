import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, BookOpen, GitCompare } from "lucide-react";
import { type NeighborhoodEntry, getNeighborhoodBySlug } from "@/data/neighborhoods/neighborhoodRegistry";
import { GUIDE_REGISTRY } from "@/lib/guides/guideRegistry";

interface RelatedNeighborhoodsRailProps {
  neighborhood: NeighborhoodEntry;
}

const RelatedNeighborhoodsRail = ({ neighborhood }: RelatedNeighborhoodsRailProps) => {
  const { t, language } = useLanguage();

  const relatedNeighborhoods = neighborhood.relatedNeighborhoods
    .map(slug => getNeighborhoodBySlug(slug))
    .filter(Boolean) as NeighborhoodEntry[];

  const relatedGuides = neighborhood.relatedGuides
    .map(id => GUIDE_REGISTRY.find(g => g.id === id))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Nearby Neighborhoods */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-bold text-cc-navy">
                {t("Nearby Neighborhoods", "Vecindarios Cercanos")}
              </h3>
              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <Link to={`/neighborhood-compare?areas=${neighborhood.slug},${neighborhood.relatedNeighborhoods.join(',')}`}>
                  <GitCompare className="w-4 h-4 mr-2" />
                  {t("Compare These Areas", "Comparar Estas Áreas")}
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {relatedNeighborhoods.map((related) => (
                <Link
                  key={related.slug}
                  to={`/neighborhoods/${related.slug}`}
                  className="group bg-cc-ivory hover:bg-cc-sand/50 rounded-xl p-5 transition-colors border border-cc-sand-dark/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-cc-navy group-hover:text-cc-gold transition-colors">
                      {language === 'es' ? related.nameEs : related.name}
                    </h4>
                    <span className="flex items-center gap-1 text-cc-text-muted text-xs">
                      <MapPin className="w-3 h-3" />
                      {related.primaryZip}
                    </span>
                  </div>
                  <p className="text-cc-text-muted text-sm line-clamp-2">
                    {language === 'es' ? related.heroTagline.es : related.heroTagline.en}
                  </p>
                  <div className="flex items-center text-cc-gold text-sm font-medium mt-3 group-hover:gap-2 transition-all">
                    {t("Explore", "Explorar")}
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile Compare CTA */}
            <div className="mt-4 sm:hidden">
              <Button asChild variant="outline" className="w-full">
                <Link to={`/neighborhood-compare?areas=${neighborhood.slug},${neighborhood.relatedNeighborhoods.join(',')}`}>
                  <GitCompare className="w-4 h-4 mr-2" />
                  {t("Compare These Areas", "Comparar Estas Áreas")}
                </Link>
              </Button>
            </div>
          </div>

          {/* Related Guides */}
          {relatedGuides.length > 0 && (
            <div>
              <h3 className="font-serif text-2xl font-bold text-cc-navy mb-6">
                {t("Helpful Guides", "Guías Útiles")}
              </h3>
              <div className="flex flex-wrap gap-3">
                {relatedGuides.map((guide) => (
                  <Link key={guide!.id} to={guide!.path} className="group">
                    <Badge
                      variant="outline"
                      className="px-4 py-2 text-sm font-medium bg-white hover:bg-cc-gold/10 hover:border-cc-gold transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3 mr-2 text-cc-gold" />
                      {language === 'es' ? guide!.labelEs : guide!.labelEn}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RelatedNeighborhoodsRail;
