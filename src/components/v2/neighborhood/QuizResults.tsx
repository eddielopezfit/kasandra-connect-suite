import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { MapPin, Search, RotateCcw, Trophy, Star } from "lucide-react";
import type { NeighborhoodMatch } from "@/lib/neighborhood/quizScoring";

interface QuizResultsProps {
  matches: NeighborhoodMatch[];
  onExploreZip: (zip: string) => void;
  onRetake: () => void;
}

const RANK_STYLES = [
  { badge: "bg-cc-gold text-cc-navy", ring: "ring-cc-gold/30", icon: Trophy },
  { badge: "bg-cc-navy text-white", ring: "ring-cc-navy/20", icon: Star },
  { badge: "bg-cc-sand-dark text-cc-navy", ring: "ring-cc-sand-dark/30", icon: Star },
];

const QuizResults = ({ matches, onExploreZip, onRetake }: QuizResultsProps) => {
  const { language, t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-cc-gold/15 text-cc-gold-dark px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <MapPin className="w-4 h-4" />
          {t("Your Matches", "Tus Resultados")}
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mb-2">
          {t("Your Top Tucson Neighborhoods", "Tus Mejores Vecindarios en Tucson")}
        </h2>
        <p className="text-cc-text-muted">
          {t(
            "Based on your lifestyle preferences, here are the neighborhoods we recommend.",
            "Basado en tus preferencias de estilo de vida, estos son los vecindarios que recomendamos."
          )}
        </p>
      </div>

      <div className="space-y-4">
        {matches.map((match, index) => {
          const style = RANK_STYLES[index] || RANK_STYLES[2];
          const Icon = style.icon;
          return (
            <div
              key={match.zip}
              className={`bg-white rounded-2xl border border-cc-sand-dark/30 shadow-soft overflow-hidden ring-2 ${style.ring}`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${style.badge}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-cc-navy">
                        {language === "es" ? match.nameEs : match.nameEn}
                      </h3>
                      <span className="text-cc-text-muted text-sm">{match.zip}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-cc-gold">{match.matchPercent}%</span>
                    <p className="text-xs text-cc-text-muted">{t("match", "coincidencia")}</p>
                  </div>
                </div>

                {/* Match bar */}
                <div className="h-2 bg-cc-sand rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full bg-cc-gold rounded-full transition-all duration-500"
                    style={{ width: `${match.matchPercent}%` }}
                  />
                </div>

                <p className="text-cc-charcoal text-sm leading-relaxed mb-4">
                  {language === "es" ? match.whyEs : match.whyEn}
                </p>

                <Button
                  onClick={() => onExploreZip(match.zip)}
                  variant="outline"
                  className="border-cc-navy text-cc-navy hover:bg-cc-navy hover:text-white rounded-full text-sm font-medium"
                >
                  <Search className="w-3.5 h-3.5 mr-1.5" />
                  {t("Explore This Neighborhood", "Explorar Este Vecindario")}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Retake */}
      <div className="text-center mt-8">
        <Button
          variant="ghost"
          onClick={onRetake}
          className="text-cc-text-muted hover:text-cc-navy"
        >
          <RotateCcw className="w-4 h-4 mr-1.5" />
          {t("Retake Quiz", "Repetir Cuestionario")}
        </Button>
      </div>
    </div>
  );
};

export default QuizResults;
