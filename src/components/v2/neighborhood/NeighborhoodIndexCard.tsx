import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Home, Clock, Star } from "lucide-react";
import { type NeighborhoodEntry, type RegionGroup } from "@/data/neighborhoods/neighborhoodRegistry";
import { getNeighborhoodHeroUrl } from "@/lib/neighborhood/heroUrl";
import { useState } from "react";

const REGION_COLORS: Record<RegionGroup, string> = {
  central: 'bg-blue-100 text-blue-800',
  north: 'bg-green-100 text-green-800',
  east: 'bg-amber-100 text-amber-800',
  south: 'bg-rose-100 text-rose-800',
  metro: 'bg-purple-100 text-purple-800',
};

const REGION_LABELS: Record<RegionGroup, { en: string; es: string }> = {
  central: { en: 'Central', es: 'Centro' },
  north: { en: 'North', es: 'Norte' },
  east: { en: 'East', es: 'Este' },
  south: { en: 'South', es: 'Sur' },
  metro: { en: 'Greater Metro', es: 'Área Metro' },
};

interface NeighborhoodIndexCardProps {
  neighborhood: NeighborhoodEntry;
}

const NeighborhoodIndexCard = ({ neighborhood }: NeighborhoodIndexCardProps) => {
  const { language, t } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const heroUrl = getNeighborhoodHeroUrl(neighborhood.slug);
  const displayName = language === 'es' ? neighborhood.nameEs : neighborhood.name;

  return (
    <Link to={`/neighborhoods/${neighborhood.slug}`}>
      <div className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-elevated hover:shadow-luxury transition-all duration-300 hover:scale-[1.02]">
        {/* Image layer */}
        {!loaded && !imgError && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-cc-sand via-white/40 to-cc-sand bg-[length:200%_100%] z-0" />
        )}
        {!imgError ? (
          <img
            src={heroUrl}
            alt={`${neighborhood.name} neighborhood`}
            className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-[url('/og-kasandra.jpg')] bg-cover bg-center opacity-20" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-[1]" />

        {/* Region badge — top left */}
        <div className="absolute top-3 left-3 z-[2]">
          <Badge className={`${REGION_COLORS[neighborhood.regionGroup]} font-medium`}>
            {language === 'es' ? REGION_LABELS[neighborhood.regionGroup].es : REGION_LABELS[neighborhood.regionGroup].en}
          </Badge>
        </div>

        {/* ZIP pill — top right */}
        <div className="absolute top-3 right-3 z-[2] flex items-center gap-1 bg-black/40 text-white/80 rounded-full px-2.5 py-0.5 text-xs">
          <MapPin className="w-3 h-3" />
          {neighborhood.primaryZip}
        </div>

        {/* Bottom content — always visible */}
        <div className="absolute bottom-0 left-0 right-0 z-[2] flex items-end justify-between p-4">
          <h3 className="font-serif text-2xl font-bold text-white drop-shadow-md">
            {displayName}
          </h3>
          <span className="flex items-center gap-1 text-cc-gold text-sm font-medium flex-shrink-0">
            {t('Explore', 'Explorar')}
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        {/* Hover reveal overlay */}
        <div className="absolute inset-0 z-[3] bg-cc-navy/60 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:bg-cc-navy/92 backdrop-blur-sm transition-opacity duration-300 flex flex-col justify-center px-6 py-5">
          <h3 className="font-serif text-xl font-bold text-white mb-3">
            {displayName}
          </h3>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/10 rounded-full px-3 py-1 text-xs text-white/90 flex items-center gap-1.5">
              <Home size={12} /> {t('Median $365K', 'Mediana $365K')}
            </span>
            <span className="bg-white/10 rounded-full px-3 py-1 text-xs text-white/90 flex items-center gap-1.5">
              <Clock size={12} /> {t('38 days avg', '38 días prom')}
            </span>
            <span className="bg-white/10 rounded-full px-3 py-1 text-xs text-white/90 flex items-center gap-1.5">
              <Star size={12} /> {t('Top Tucson area', 'Top zona Tucson')}
            </span>
          </div>

          {/* Tagline */}
          <p className="text-cc-ivory/70 text-sm line-clamp-2 mt-3">
            {language === 'es' ? neighborhood.heroTagline.es : neighborhood.heroTagline.en}
          </p>

          {/* Gold CTA button */}
          <div className="mt-4">
            <span className="block w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-2 text-sm text-center transition-colors">
              {t(`Explore ${neighborhood.name}`, `Explorar ${neighborhood.nameEs}`)} →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NeighborhoodIndexCard;
