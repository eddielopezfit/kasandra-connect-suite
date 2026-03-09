/**
 * GuideSuggestionCard - Reusable card for suggesting guides as next steps
 * Used in diagnostic tools (Buyer Readiness, Calculator) to create connective tissue
 */

import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { logEvent } from "@/lib/analytics/logEvent";

interface GuideSuggestionCardProps {
  guideId: string;
  titleEn: string;
  titleEs: string;
  descriptionEn: string;
  descriptionEs: string;
  ctaSource: string;
  variant?: 'default' | 'compact';
}

const GuideSuggestionCard = ({
  guideId,
  titleEn,
  titleEs,
  descriptionEn,
  descriptionEs,
  ctaSource,
  variant = 'default',
}: GuideSuggestionCardProps) => {
  const { t } = useLanguage();

  const handleClick = () => {
    logEvent('cta_click', {
      cta_name: `guide_suggestion_${guideId}`,
      destination: `/guides/${guideId}`,
      page_path: window.location.pathname,
      source: ctaSource,
    });
  };

  if (variant === 'compact') {
    return (
      <Link
        to={`/guides/${guideId}`}
        onClick={handleClick}
...
  return (
    <Link
      to={`/guides/${guideId}`}
      onClick={handleClick}
      className="block p-4 rounded-xl bg-cc-sand hover:bg-cc-sand-dark/30 border border-cc-sand-dark/30 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-cc-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-cc-gold" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-cc-slate uppercase tracking-wide mb-1">
            {t("Recommended Reading", "Lectura Recomendada")}
          </p>
          <h4 className="font-semibold text-cc-navy group-hover:text-cc-navy-dark text-sm mb-1">
            {t(titleEn, titleEs)}
          </h4>
          <p className="text-xs text-cc-charcoal">
            {t(descriptionEn, descriptionEs)}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-cc-slate group-hover:text-cc-navy transition-colors flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
};

export default GuideSuggestionCard;
