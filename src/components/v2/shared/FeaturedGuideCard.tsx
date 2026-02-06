/**
 * FeaturedGuideCard - Prominent guide promotion for service pages
 * Used on /v2/buy and /v2/sell to feature relevant guides
 */

import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { logEvent } from "@/lib/analytics/logEvent";

interface FeaturedGuideCardProps {
  guideId: string;
  titleEn: string;
  titleEs: string;
  descriptionEn: string;
  descriptionEs: string;
  readTimeEn: string;
  readTimeEs: string;
  ctaSource: string;
}

const FeaturedGuideCard = ({
  guideId,
  titleEn,
  titleEs,
  descriptionEn,
  descriptionEs,
  readTimeEn,
  readTimeEs,
  ctaSource,
}: FeaturedGuideCardProps) => {
  const { t } = useLanguage();

  const handleClick = () => {
    logEvent('cta_click', {
      cta_name: `featured_guide_${guideId}`,
      destination: `/v2/guides/${guideId}`,
      page_path: window.location.pathname,
      source: ctaSource,
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-cc-sand-dark/30">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-5 h-5 text-cc-gold" />
        <span className="text-xs text-cc-slate uppercase tracking-wide font-medium">
          {t("Helpful Resource", "Recurso Útil")}
        </span>
      </div>
      
      <h3 className="font-serif text-lg font-bold text-cc-navy mb-2">
        {t(titleEn, titleEs)}
      </h3>
      
      <p className="text-sm text-cc-charcoal mb-4">
        {t(descriptionEn, descriptionEs)}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-cc-slate">
          {t(readTimeEn, readTimeEs)}
        </span>
        
        <Link
          to={`/v2/guides/${guideId}`}
          onClick={handleClick}
          className="inline-flex items-center gap-1 text-sm font-medium text-cc-gold hover:text-cc-gold-dark transition-colors group"
        >
          {t("Read Guide", "Leer Guía")}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default FeaturedGuideCard;
