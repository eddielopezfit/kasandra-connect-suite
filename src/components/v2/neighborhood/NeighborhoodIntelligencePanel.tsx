import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Brain, Users, TrendingUp, AlertTriangle, Sparkles, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { stripCitations } from "@/lib/utils/stripCitations";
import { type NeighborhoodProfile } from "./NeighborhoodCard";

interface NeighborhoodIntelligencePanelProps {
  zipCode: string;
  neighborhoodName: string;
}

/** sessionStorage cache key */
const cacheKey = (slug: string) => `neighborhood_profile_${slug}`;

interface CachedProfile {
  profile_en: NeighborhoodProfile;
  profile_es: NeighborhoodProfile;
  ts: number;
}

const SESSION_CACHE_TTL = 30 * 60 * 1000; // 30 min within session

const NeighborhoodIntelligencePanel = ({ zipCode, neighborhoodName }: NeighborhoodIntelligencePanelProps) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [profileEn, setProfileEn] = useState<NeighborhoodProfile | null>(null);
  const [profileEs, setProfileEs] = useState<NeighborhoodProfile | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  const slug = neighborhoodName.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setErrorType(null);

      // Check sessionStorage first
      try {
        const raw = sessionStorage.getItem(cacheKey(slug));
        if (raw) {
          const cached: CachedProfile = JSON.parse(raw);
          if (Date.now() - cached.ts < SESSION_CACHE_TTL) {
            setProfileEn(cached.profile_en);
            setProfileEs(cached.profile_es);
            setLoading(false);
            return;
          }
        }
      } catch { /* ignore parse errors */ }

      try {
        const { data, error: fnError } = await supabase.functions.invoke("neighborhood-profile", {
          body: { zip_code: zipCode, neighborhood_name: neighborhoodName },
        });

        if (fnError) throw fnError;
        if (!data?.ok) {
          setErrorType(data?.error || "network_error");
          throw new Error(data?.detail || data?.error || "Unknown error");
        }

        setProfileEn(data.profile_en);
        setProfileEs(data.profile_es);

        // Cache in sessionStorage
        try {
          sessionStorage.setItem(cacheKey(slug), JSON.stringify({
            profile_en: data.profile_en,
            profile_es: data.profile_es,
            ts: Date.now(),
          }));
        } catch { /* quota exceeded — ignore */ }
      } catch (err) {
        console.error("[NeighborhoodIntelligencePanel] Error:", err);
        if (!errorType) setErrorType("network_error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [zipCode, neighborhoodName, slug]);

  const profile = language === 'es' ? profileEs : profileEn;

  if (loading) {
    return (
      <section className="py-16 bg-background">
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

  if (errorType || !profile) {
    const errorMessages: Record<string, { en: string; es: string }> = {
      api_key_missing: {
        en: "The neighborhood intelligence service is being configured. Please check back shortly.",
        es: "El servicio de inteligencia del vecindario se está configurando. Vuelve pronto.",
      },
      rate_limited: {
        en: "We're receiving a lot of requests right now. Please try again in a few minutes.",
        es: "Estamos recibiendo muchas solicitudes. Intenta de nuevo en unos minutos.",
      },
      payment_required: {
        en: "The intelligence service is temporarily unavailable. Please try again later.",
        es: "El servicio de inteligencia no está disponible temporalmente. Intenta más tarde.",
      },
    };

    const msg = errorMessages[errorType || ""] || {
      en: "We couldn't load the neighborhood intelligence panel. Please try again later.",
      es: "No pudimos cargar el panel de inteligencia del vecindario. Por favor intenta más tarde.",
    };

    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <AlertTriangle className="w-12 h-12 text-cc-gold mx-auto mb-4" />
            <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
              {t("Intelligence Temporarily Unavailable", "Inteligencia Temporalmente No Disponible")}
            </h3>
            <p className="text-muted-foreground">
              {t(msg.en, msg.es)}
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
      : 'text-muted-foreground';

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-cc-gold/10 text-cc-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Brain className="w-4 h-4" />
              {t("AI-Powered Insights", "Perspectivas con IA")}
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              {t("Neighborhood Intelligence", "Inteligencia del Vecindario")}
            </h2>
          </div>

          {/* Lifestyle Feel */}
          <div className="bg-gradient-to-br from-cc-ivory to-cc-sand/30 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-cc-gold mt-1" />
              <h3 className="font-semibold text-foreground text-lg">
                {t("Lifestyle & Vibe", "Estilo de Vida")}
              </h3>
            </div>
            <p className="text-cc-charcoal leading-relaxed">
              {stripCitations(profile.lifestyle_feel)}
            </p>
          </div>

          {/* Two Column: Buyer Fit + Market Framing */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-background border border-cc-sand-dark/20 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <Users className="w-5 h-5 text-foreground mt-0.5" />
                <h3 className="font-semibold text-foreground">
                  {t("Who Thrives Here", "Quién Prospera Aquí")}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.buyer_fit?.map((fit, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-cc-sand text-cc-charcoal">
                    {stripCitations(fit)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-background border border-cc-sand-dark/20 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-foreground mt-0.5" />
                <h3 className="font-semibold text-foreground">
                  {t("Market Context", "Contexto del Mercado")}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {stripCitations(profile.market_framing)}
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
                    {stripCitations(profile.not_ideal_for)}
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
                  <h3 className="font-semibold text-foreground mb-1">
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
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
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
