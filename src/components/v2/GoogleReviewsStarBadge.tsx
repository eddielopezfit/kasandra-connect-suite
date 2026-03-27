/**
 * GoogleReviewsStarBadge — Compact inline star rating display.
 * Shows "5.0 ★★★★★ · 100+ Google Reviews" in a slim bar.
 * Uses the same data source as GoogleReviewsSection for consistency.
 */
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GoogleReviewsStarBadgeProps {
  className?: string;
}

const GoogleReviewsStarBadge = ({ className = '' }: GoogleReviewsStarBadgeProps) => {
  const { t } = useLanguage();

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-cc-gold text-cc-gold" />
        ))}
      </div>
      <span className="text-sm font-semibold text-cc-navy">5.0</span>
      <span className="text-sm text-cc-charcoal/60">·</span>
      <span className="text-sm text-cc-charcoal/60">
        {t("100+ Google Reviews", "100+ Reseñas de Google")}
      </span>
    </div>
  );
};

export default GoogleReviewsStarBadge;
