import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin } from "lucide-react";
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
  const { language } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const heroUrl = getNeighborhoodHeroUrl(neighborhood.slug);
  
  return (
    <Link to={`/neighborhoods/${neighborhood.slug}`}>
      <Card className="group h-full bg-white hover:shadow-lg transition-all duration-300 border-cc-sand-dark/20 overflow-hidden">
        <div className="h-40 relative overflow-hidden bg-gradient-to-br from-cc-navy/80 to-cc-slate/60">
          {!imgError ? (
            <img
              src={heroUrl}
              alt={`${neighborhood.name} neighborhood`}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-[url('/og-kasandra.jpg')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 left-3">
            <Badge className={`${REGION_COLORS[neighborhood.regionGroup]} font-medium`}>
              {language === 'es' ? REGION_LABELS[neighborhood.regionGroup].es : REGION_LABELS[neighborhood.regionGroup].en}
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/70 text-sm">
            <MapPin className="w-3 h-3" />
            {neighborhood.primaryZip}
          </div>
        </div>
        
        <CardContent className="p-5">
          <h3 className="font-serif text-xl font-bold text-cc-navy mb-2 group-hover:text-cc-gold transition-colors">
            {language === 'es' ? neighborhood.nameEs : neighborhood.name}
          </h3>
          <p className="text-cc-text-muted text-sm line-clamp-2 mb-4">
            {language === 'es' ? neighborhood.heroTagline.es : neighborhood.heroTagline.en}
          </p>
          <div className="flex items-center text-cc-gold font-medium text-sm group-hover:gap-2 transition-all">
            {language === 'es' ? 'Explorar' : 'Explore'}
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default NeighborhoodIndexCard;
