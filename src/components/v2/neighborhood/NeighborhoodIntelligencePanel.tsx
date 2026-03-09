import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, TrendingUp, AlertTriangle, Sparkles, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type NeighborhoodProfile } from "./NeighborhoodCard";

interface NeighborhoodIntelligencePanelProps {
  zipCode: string;
  neighborhoodName: string;
}

const NeighborhoodIntelligencePanel = ({ zipCode, neighborhoodName }: NeighborhoodIntelligencePanelProps) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profileEn, setProfileEn] = useState<NeighborhoodProfile | null>(null);
  const [profileEs, setProfileEs] = useState<NeighborhoodProfile | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(false);
      
      try {
        const { data, error: fnError } = await supabase.functions.invoke("neighborhood-profile", {
          body: { zip_code: zipCode, neighborhood_name: neighborhoodName },
        });

        if (fnError) throw fnError;
        if (!data?.ok) throw new Error(data?.error || "Unknown error");

        setProfileEn(data.profile_en);
        setProfileEs(data.profile_es);
      } catch (err) {
        console.error("[NeighborhoodIntelligencePanel] Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [zipCode, neighborhoodName]);

  const profile = language === 'es' ? profileEs : profileEn;

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid md:grid-cols-2 gap-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !profile) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <AlertTriangle className="w-12 h-12 text-cc-gold mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-cc-navy mb-2">
              {t("Intelligence Temporarily Unavailable", "Inteligencia Temporalmente No Disponible")}
            </h3>
            <p className="text-cc-text-muted">
              {t(
                "We couldn't load the neighborhood intelligence panel. Please try again later.",
                "No pudimos cargar el panel de inteligencia del vecindario. Por favor intenta más tarde."
              )}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const confidenceColor = profile.confidence_level === 'high' 
    ? 'text-green-600' 
    : profile.confidence_level === 'medium' 
      ? 'text-amber-600' 
      : 'text-cc-text-muted';

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-cc-gold/10 text-cc-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Brain className="w-4 h-4" />
              {t("AI-Powered Insights", "Perspectivas con IA")}
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy">
              {t("Neighborhood Intelligence", "Inteligencia del Vecindario")}
            </h2>
          </div>

          {/* Lifestyle Feel */}
          <div className="bg-gradient-to-br from-cc-ivory to-cc-sand/30 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-cc-gold mt-1" />
              <h3 className="font-semibold text-cc-navy text-lg">
                {t("Lifestyle & Vibe", "Estilo de Vida")}
              </h3>
            </div>
            <p className="text-cc-charcoal leading-relaxed">
              {profile.lifestyle_feel}
            </p>
          </div>

          {/* Two Column: Buyer Fit + Market Framing */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Buyer Fit */}
            <div className="bg-white border border-cc-sand-dark/20 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <Users className="w-5 h-5 text-cc-navy mt-0.5" />
                <h3 className="font-semibold text-cc-navy">
                  {t("Who Thrives Here", "Quién Prospera Aquí")}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.buyer_fit?.map((fit, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-cc-sand text-cc-charcoal">
                    {fit}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Market Framing */}
            <div className="bg-white border border-cc-sand-dark/20 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-cc-navy mt-0.5" />
                <h3 className="font-semibold text-cc-navy">
                  {t("Market Context", "Contexto del Mercado")}
                </h3>
              </div>
              <p className="text-cc-text-muted text-sm leading-relaxed">
                {profile.market_framing}
              </p>
            </div>
          </div>

          {/* Not Ideal For — Trust Signal */}
          {profile.not_ideal_for && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">
                    {t("May Not Be Right For", "Puede No Ser Ideal Para")}
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {profile.not_ideal_for}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fun Fact */}
          {profile.fun_fact && (
            <div className="bg-cc-navy/5 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5" />
                <div>
                  <h3 className="font-semibold text-cc-navy mb-1">
                    {t("Local Insight", "Dato Local")}
                  </h3>
                  <p className="text-cc-charcoal text-sm">
                    {profile.fun_fact}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confidence + Sources */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-cc-text-muted">
            <span className={`flex items-center gap-1 ${confidenceColor}`}>
              <span className="font-medium">
                {t("Confidence:", "Confianza:")}
              </span>
              {profile.confidence_level}
            </span>
            {profile.source_scope && profile.source_scope.length > 0 && (
              <span className="flex items-center gap-1">
                <span className="font-medium">{t("Sources:", "Fuentes:")}</span>
                {profile.source_scope.slice(0, 3).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NeighborhoodIntelligencePanel;
