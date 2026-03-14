import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Home, Clock, Star } from "lucide-react";
import { type NeighborhoodEntry, type RegionGroup } from "@/data/neighborhoods/neighborhoodRegistry";
import { getNeighborhoodHeroUrl } from "@/lib/neighborhood/heroUrl";
import { useState } from "react";

// Per-neighborhood median price data (Pima County / Southern AZ — early 2026)
// Source: Pima County MLS, Redfin, Zillow aggregated estimates
const NEIGHBORHOOD_STATS: Record<string, { median: string; medianEs: string; days: number; label: string; labelEs: string }> = {
  'tucson':           { median: '$285K', medianEs: '$285K', days: 35, label: 'Central Tucson', labelEs: 'Centro Tucson' },
  'oro-valley':       { median: '$520K', medianEs: '$520K', days: 42, label: 'Premium suburb',  labelEs: 'Suburbio premium' },
  'marana':           { median: '$385K', medianEs: '$385K', days: 36, label: 'Growing fast',    labelEs: 'Crecimiento rápido' },
  'catalina':         { median: '$320K', medianEs: '$320K', days: 40, label: 'Mountain views',  labelEs: 'Vistas a montañas' },
  'catalina-foothills': { median: '$610K', medianEs: '$610K', days: 48, label: 'Luxury enclave', labelEs: 'Enclave de lujo' },
  'vail':             { median: '$365K', medianEs: '$365K', days: 32, label: 'Family favorite', labelEs: 'Favorito familiar' },
  'sahuarita':        { median: '$310K', medianEs: '$310K', days: 38, label: 'Value leader',    labelEs: 'Mejor valor' },
  'south-tucson':     { median: '$195K', medianEs: '$195K', days: 45, label: 'Entry-level buys',labelEs: 'Compras accesibles' },
  'green-valley':     { median: '$285K', medianEs: '$285K', days: 50, label: 'Retirement haven',labelEs: 'Paraíso de retiro' },
  'corona-de-tucson': { median: '$340K', medianEs: '$340K', days: 44, label: 'Rural acreage',   labelEs: 'Terreno rural' },
  'sierra-vista':     { median: '$255K', medianEs: '$255K', days: 42, label: 'Military area',   labelEs: 'Zona militar' },
  'rio-rico':         { median: '$230K', medianEs: '$230K', days: 55, label: 'Border lifestyle', labelEs: 'Estilo fronterizo' },
  'nogales':          { median: '$180K', medianEs: '$180K', days: 58, label: 'Binational hub',  labelEs: 'Hub binacional' },
  'red-rock':         { median: '$285K', medianEs: '$285K', days: 52, label: 'Rural Arizona',   labelEs: 'Arizona rural' },
};

const DEFAULT_STATS = { median: '$365K', medianEs: '$365K', days: 38, label: 'Tucson area', labelEs: 'Área Tucson' };


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
  const stats = NEIGHBORHOOD_STATS[neighborhood.slug] ?? DEFAULT_STATS;

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
        <div className="absolute bottom-0 left-0 right-0 z-[2] p-4">
          <div className="flex items-end justify-between">
            <h3 className="font-serif text-2xl font-bold text-white drop-shadow-md">
              {displayName}
            </h3>
            <span className="flex items-center gap-1 text-cc-gold text-sm font-medium flex-shrink-0">
              {t('Explore', 'Explorar')}
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
          {/* Touch-only condensed stats — hidden on hover devices (overlay shows them there) */}
          <div className="flex items-center gap-2 mt-1.5 [@media(hover:hover)]:hidden">
            <span className="text-[11px] text-white/75 font-medium">{language === 'es' ? stats.medianEs : stats.median}</span>
            <span className="text-white/30 text-[10px]">·</span>
            <span className="text-[11px] text-white/75">{stats.days} {t('days avg', 'días prom')}</span>
            <span className="text-white/30 text-[10px]">·</span>
            <span className="text-[11px] text-white/75">{language === 'es' ? stats.labelEs : stats.label}</span>
          </div>
        </div>

        {/* Hover reveal overlay */}
        <div className="absolute inset-0 z-[3] bg-cc-navy/60 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:bg-cc-navy/92 backdrop-blur-sm transition-opacity duration-300 flex flex-col justify-center px-6 py-5">
          <h3 className="font-serif text-xl font-bold text-white mb-3">
            {displayName}
          </h3>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/10 rounded-full px-3 py-1 text-xs text-white/90 flex items-center gap-1.5">
              <Home size={12} /> {language === 'es' ? stats.medianEs : stats.median}
            </span>
            <span className="bg-white/10 rounded-full px-3 py-1 text-xs text-white/90 flex items-center gap-1.5">
              <Clock size={12} /> {stats.days} {t('days avg', 'días prom')}
            </span>
            <span className="bg-white/10 rounded-full px-3 py-1 text-xs text-white/90 flex items-center gap-1.5">
              <Star size={12} /> {language === 'es' ? stats.labelEs : stats.label}
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
