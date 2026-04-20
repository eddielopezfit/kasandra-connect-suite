import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { MapPin, Search, RotateCcw, Trophy, Star, ArrowRight, MessageCircle } from "lucide-react";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { logEvent } from "@/lib/analytics/logEvent";
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
  const { openChat } = useSelenaChat();
  const isEs = language === "es";

  const handleSelenaOpen = () => {
    logEvent("quiz_result_cta_click", { quiz: "neighborhood", cta: "selena" });
    openChat({ source: "quiz_result", intent: "buy" });
  };

  const handleBookClick = () => {
    logEvent("quiz_result_cta_click", { quiz: "neighborhood", cta: "book" });
  };

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
                  onClick={() => {
                    logEvent("quiz_result_cta_click", { quiz: "neighborhood", cta: "explore_zip", zip: match.zip });
                    onExploreZip(match.zip);
                  }}
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

      {/* Terminal CTA — primary book + secondary Selena (no dead-end) */}
      <div className="mt-8 rounded-2xl bg-cc-navy text-white p-6 sm:p-7">
        <h3 className="font-serif text-xl sm:text-2xl mb-2 leading-snug">
          {isEs
            ? "¿Lista para ver casas en estas zonas?"
            : "Ready to tour homes in these areas?"}
        </h3>
        <p className="text-white/70 text-sm mb-5">
          {isEs
            ? "Una sesión de estrategia con Kasandra es el siguiente paso natural — sin presión."
            : "A strategy session with Kasandra is the natural next step — no pressure."}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            asChild
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-5 py-2.5 text-sm"
          >
            <Link
              to="/book?intent=buy&source=neighborhood_quiz"
              onClick={handleBookClick}
            >
              {isEs ? "Agendar con Kasandra" : "Book with Kasandra"}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
          <button
            type="button"
            onClick={handleSelenaOpen}
            className="inline-flex items-center gap-1.5 text-cc-gold hover:text-cc-gold/80 font-medium text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {isEs ? "Hablar primero con Selena" : "Talk to Selena first"}
          </button>
        </div>
      </div>

      {/* Retake */}
      <div className="text-center mt-6">
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
