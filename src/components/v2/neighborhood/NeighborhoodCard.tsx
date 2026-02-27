import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, TrendingUp, AlertTriangle, Lightbulb, Info } from "lucide-react";

export interface NeighborhoodProfile {
  lifestyle_feel: string;
  buyer_fit: string[];
  seller_context: string;
  market_framing: string;
  not_ideal_for: string;
  fun_fact: string;
  confidence_level: "high" | "medium" | "exploratory";
  source_scope: string[];
}

interface NeighborhoodCardProps {
  profileEn: NeighborhoodProfile;
  profileEs: NeighborhoodProfile;
  zipCode: string;
}

const NeighborhoodCard = ({ profileEn, profileEs, zipCode }: NeighborhoodCardProps) => {
  const { language, t } = useLanguage();
  const profile = language === "es" ? profileEs : profileEn;

  return (
    <div className="bg-white rounded-2xl border border-cc-sand-dark/30 shadow-elevated overflow-hidden">
      {/* Header */}
      <div className="bg-cc-navy p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cc-gold rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-cc-navy" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              {t("Neighborhood Profile", "Perfil del Vecindario")} — {zipCode}
            </h3>
            {profile.confidence_level === "exploratory" && (
              <p className="text-cc-gold text-xs mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {t(
                  "General insights — Kasandra specializes in Tucson-area neighborhoods",
                  "Información general — Kasandra se especializa en vecindarios del área de Tucson"
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Lifestyle Feel */}
        <div>
          <h4 className="font-serif text-lg font-semibold text-cc-navy mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cc-gold" />
            {t("Lifestyle & Vibe", "Estilo de Vida")}
          </h4>
          <p className="text-cc-charcoal leading-relaxed">{profile.lifestyle_feel}</p>
        </div>

        {/* Buyer Fit Tags */}
        <div>
          <h4 className="font-serif text-lg font-semibold text-cc-navy mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-cc-gold" />
            {t("Best For", "Ideal Para")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.buyer_fit.map((fit, i) => (
              <Badge
                key={i}
                className="bg-cc-sand text-cc-navy border-cc-sand-dark/30 font-medium px-3 py-1"
              >
                {fit}
              </Badge>
            ))}
          </div>
        </div>

        {/* Seller Context */}
        <div>
          <h4 className="font-serif text-lg font-semibold text-cc-navy mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cc-gold" />
            {t("Seller Insights", "Para Vendedores")}
          </h4>
          <p className="text-cc-charcoal leading-relaxed">{profile.seller_context}</p>
        </div>

        {/* Market Framing */}
        <div className="bg-cc-sand rounded-xl p-4 border border-cc-sand-dark/30">
          <h4 className="font-serif text-lg font-semibold text-cc-navy mb-2">
            {t("Market Context", "Contexto del Mercado")}
          </h4>
          <p className="text-cc-charcoal leading-relaxed">{profile.market_framing}</p>
        </div>

        {/* Not Ideal For — trust signal */}
        <div className="bg-cc-ivory rounded-xl p-4 border border-cc-sand-dark/20">
          <h4 className="font-serif text-sm font-semibold text-cc-slate mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cc-gold" />
            {t("May Not Be Ideal For", "Puede No Ser Ideal Para")}
          </h4>
          <p className="text-cc-text-muted text-sm leading-relaxed">{profile.not_ideal_for}</p>
        </div>

        {/* Fun Fact */}
        <div className="flex items-start gap-3 pt-2 border-t border-cc-sand-dark/20">
          <Lightbulb className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
          <p className="text-cc-charcoal text-sm italic">{profile.fun_fact}</p>
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodCard;
