import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, TrendingUp, AlertTriangle, Lightbulb, Info, Signal, SignalZero } from "lucide-react";
import { stripCitations } from "@/lib/utils/stripCitations";
import type { MarketPulseData } from "./NeighborhoodExplorer";

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
  marketPulse?: MarketPulseData;
}

const NeighborhoodCard = ({ profileEn, profileEs, zipCode, marketPulse }: NeighborhoodCardProps) => {
  const { language, t } = useLanguage();
  const profile = language === "es" ? profileEs : profileEn;

  // Format sale-to-list as percentage
  const saleToList = marketPulse?.negotiation_gap
    ? `${(marketPulse.negotiation_gap * 100).toFixed(1)}%`
    : "97.6%";

  // DOM is days_to_close minus ~30 days for closing process
  const domDays = marketPulse?.days_to_close
    ? Math.max(1, Math.round(marketPulse.days_to_close - 30))
    : 38;

  const isLive = !!(marketPulse?.negotiation_gap && marketPulse?.last_verified_date);

  const verifiedDate = marketPulse?.last_verified_date
    ? new Date(marketPulse.last_verified_date).toLocaleDateString(
        language === "es" ? "es-US" : "en-US",
        { month: "short", year: "numeric" }
      )
    : null;

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

      {/* Live Market Stats Strip */}
      <div className="bg-cc-sand border-b border-cc-sand-dark/30 px-5 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-cc-navy uppercase tracking-wide">
            {t("Pima County Market Snapshot", "Mercado del Condado de Pima")}
          </span>
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <Signal className="w-3 h-3 text-green-600" />
            ) : (
              <SignalZero className="w-3 h-3 text-cc-slate" />
            )}
            <span className={`text-[10px] font-medium ${isLive ? "text-green-700" : "text-cc-slate"}`} style={{fontSize: "12px"}}>
              {isLive
                ? t(`Live · ${verifiedDate}`, `En vivo · ${verifiedDate}`)
                : t("Tucson averages", "Promedios de Tucson")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Median Days on Market */}
          <div className="bg-white rounded-xl p-3 text-center border border-cc-sand-dark/20">
            <p className="text-2xl font-serif font-bold text-cc-navy">{domDays}</p>
            <p className="text-[12px] text-cc-slate mt-0.5 leading-tight">
              {t("Days on Market", "Días en Mercado")}
            </p>
          </div>

          {/* Sale-to-List Ratio */}
          <div className="bg-white rounded-xl p-3 text-center border border-cc-sand-dark/20">
            <p className="text-2xl font-serif font-bold text-cc-navy">{saleToList}</p>
            <p className="text-[12px] text-cc-slate mt-0.5 leading-tight">
              {t("Sale-to-List Ratio", "Precio vs. Lista")}
            </p>
          </div>

          {/* Median Price */}
          <div className="bg-white rounded-xl p-3 text-center border border-cc-sand-dark/20">
            <p className="text-2xl font-serif font-bold text-cc-navy">$365K</p>
            <p className="text-[12px] text-cc-slate mt-0.5 leading-tight">
              {t("Pima County Median", "Mediana del Condado")}
            </p>
          </div>
        </div>

        <p className="text-[12px] text-cc-slate/70 mt-2 text-center">
          {t(
            "Pima County-wide averages. Individual neighborhoods vary.",
            "Promedios del Condado de Pima. Los vecindarios individuales varían."
          )}
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Lifestyle Feel */}
        <div>
          <h4 className="font-serif text-lg font-semibold text-cc-navy mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cc-gold" />
            {t("Lifestyle & Vibe", "Estilo de Vida")}
          </h4>
          <p className="text-cc-charcoal leading-relaxed">{stripCitations(profile.lifestyle_feel)}</p>
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
                {stripCitations(fit)}
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
          <p className="text-cc-charcoal leading-relaxed">{stripCitations(profile.seller_context)}</p>
        </div>

        {/* Market Framing */}
        <div className="bg-cc-sand rounded-xl p-4 border border-cc-sand-dark/30">
          <h4 className="font-serif text-lg font-semibold text-cc-navy mb-2">
            {t("Market Context", "Contexto del Mercado")}
          </h4>
          <p className="text-cc-charcoal leading-relaxed">{stripCitations(profile.market_framing)}</p>
        </div>

        {/* Not Ideal For — trust signal */}
        <div className="bg-cc-ivory rounded-xl p-4 border border-cc-sand-dark/20">
          <h4 className="font-serif text-sm font-semibold text-cc-slate mb-1 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-cc-gold" />
            {t("May Not Be Ideal For", "Puede No Ser Ideal Para")}
          </h4>
          <p className="text-cc-text-muted text-sm leading-relaxed">{stripCitations(profile.not_ideal_for)}</p>
        </div>

        {/* Fun Fact */}
        <div className="flex items-start gap-3 pt-2 border-t border-cc-sand-dark/20">
          <Lightbulb className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
          <p className="text-cc-charcoal text-sm italic">{stripCitations(profile.fun_fact)}</p>
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodCard;
