import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowLeft, MapPin, Search, SkipForward } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";
import NeighborhoodCard, { type NeighborhoodProfile } from "@/components/v2/neighborhood/NeighborhoodCard";
import { toast } from "sonner";

export interface NeighborhoodResult {
  zip: string;
  profileEn: NeighborhoodProfile;
  profileEs: NeighborhoodProfile;
  cached: boolean;
}

interface StepNeighborhoodProps {
  externalZip?: string;
  initialResult?: NeighborhoodResult;
  onNext: (result: NeighborhoodResult | null) => void;
  onBack: () => void;
}

const StepNeighborhood = ({ externalZip, initialResult, onNext, onBack }: StepNeighborhoodProps) => {
  const { t } = useLanguage();
  const [zip, setZip] = useState(initialResult?.zip || externalZip || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NeighborhoodResult | null>(initialResult || null);
  const hasAutoExplored = useRef(false);

  const handleExplore = useCallback(async (overrideZip?: string) => {
    const trimmed = (overrideZip || zip).trim();
    if (!/^\d{5}$/.test(trimmed)) {
      toast.error(t("Please enter a valid 5-digit ZIP code.", "Ingrese un código postal válido de 5 dígitos."));
      return;
    }

    // Tucson-area soft warning
    const isTucsonZip = /^(857\d{2}|856\d{2})$/.test(trimmed);
    if (!isTucsonZip) {
      toast.info(t(
        "This tool is tuned for Tucson/Vail. Results for other areas may be limited.",
        "Esta herramienta está optimizada para Tucson/Vail. Los resultados para otras áreas pueden ser limitados."
      ));
    }

    logEvent('seller_decision_neighborhood_started', { zip: trimmed });
    setLoading(true);
    // Keep existing result visible until new one succeeds

    try {
      const { data, error } = await supabase.functions.invoke("neighborhood-profile", {
        body: { zip_code: trimmed },
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Unknown error");

      const newResult: NeighborhoodResult = {
        zip: trimmed,
        profileEn: data.profile_en,
        profileEs: data.profile_es,
        cached: !!data.cached,
      };
      setResult(newResult);

      updateSessionContext({
        last_neighborhood_zip: trimmed,
        neighborhood_explored: true,
      });

      logEvent('seller_decision_neighborhood_completed', { zip: trimmed, cached: !!data.cached });
    } catch (err: unknown) {
      console.error("[StepNeighborhood] Error:", err);
      const msg = (err as Error)?.message || "";
      if (msg.includes("Rate limit")) {
        toast.error(t("Too many requests. Please try again later.", "Demasiadas solicitudes. Intente más tarde."));
      } else {
        toast.error(t("Something went wrong. Please try again.", "Algo salió mal. Intente de nuevo."));
      }
      // Keep prior result visible on failure (no setResult(null))
    } finally {
      setLoading(false);
    }
  }, [zip, t]);

  // Auto-explore if external ZIP provided and no existing result
  useEffect(() => {
    if (externalZip && !initialResult && !hasAutoExplored.current && /^\d{5}$/.test(externalZip)) {
      hasAutoExplored.current = true;
      handleExplore(externalZip);
    }
  }, [externalZip, initialResult, handleExplore]);

  const handleSkip = () => {
    logEvent('seller_decision_neighborhood_skipped', { zip_draft: zip || null });
    onNext(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-2">
          {t("Neighborhood Context", "Contexto del Vecindario")}
        </h2>
        <p className="text-cc-text-muted text-sm">
          {t(
            "Optional — this helps us tailor your best path.",
            "Opcional — esto nos ayuda a personalizar su mejor camino."
          )}
        </p>
      </div>

      {/* ZIP input */}
      <div className="space-y-3">
        {externalZip && zip === externalZip && (
          <div className="inline-flex items-center gap-1.5 bg-cc-gold/10 text-cc-navy text-xs font-medium px-3 py-1.5 rounded-full border border-cc-gold/30">
            <MapPin className="w-3 h-3" />
            {t("Using ZIP from your property snapshot", "Usando el código postal de su propiedad")}
          </div>
        )}

        <div className="flex gap-3 max-w-sm">
          <Input
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder={t("Enter ZIP code (e.g. 85719)", "Código postal (ej. 85719)")}
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleExplore(); }
            }}
            className="text-center text-lg font-medium tracking-wider border-cc-sand-dark/40 focus-visible:ring-cc-gold"
          />
          <Button
            onClick={() => handleExplore()}
            disabled={loading || zip.length !== 5}
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold px-6 rounded-md shadow-gold"
          >
            <Search className="w-4 h-4 mr-1" />
            {t("Explore", "Explorar")}
          </Button>
        </div>
      </div>

      {/* Result — always visible; skeleton overlays during reload */}
      {result && (
        <div className="relative">
          <NeighborhoodCard profileEn={result.profileEn} profileEs={result.profileEs} zipCode={result.zip} />
          {loading && (
            <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
              <div className="space-y-4 w-full px-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial loading (no prior result) */}
      {loading && !result && (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} className="text-cc-text-muted rounded-full">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("Back", "Atrás")}
        </Button>

        {result ? (
          <Button
            onClick={() => onNext(result)}
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
          >
            {t("Continue", "Continuar")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleSkip}
            className="border-cc-sand-dark/40 text-cc-text-muted hover:text-cc-navy rounded-full"
          >
            <SkipForward className="w-4 h-4 mr-1" />
            {t("Skip This Step", "Saltar Este Paso")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default StepNeighborhood;
