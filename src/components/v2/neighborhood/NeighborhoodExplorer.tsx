import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";
import NeighborhoodCard, { type NeighborhoodProfile } from "./NeighborhoodCard";
import { toast } from "sonner";

export interface MarketPulseData {
  negotiation_gap: number | null;   // sale-to-list ratio (e.g. 0.9764)
  days_to_close: number | null;     // median DOM + ~30 day close
  last_verified_date: string | null;
}

// Tucson market averages — used as fallback if live fetch fails
const TUCSON_FALLBACK: MarketPulseData = {
  negotiation_gap: 0.9764,
  days_to_close: 68,  // 38 DOM + 30 close
  last_verified_date: null,
};

interface NeighborhoodExplorerProps {
  /** External ZIP to auto-explore (e.g. from quiz results) */
  externalZip?: string | null;
}

const NeighborhoodExplorer = ({ externalZip }: NeighborhoodExplorerProps) => {
  const { t } = useLanguage();
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileEn, setProfileEn] = useState<NeighborhoodProfile | null>(null);
  const [profileEs, setProfileEs] = useState<NeighborhoodProfile | null>(null);
  const [resultZip, setResultZip] = useState("");
  const [marketPulse, setMarketPulse] = useState<MarketPulseData>(TUCSON_FALLBACK);
  const sectionRef = useRef<HTMLElement>(null);
  const processedExternalZip = useRef<string | null>(null);

  // Fetch live Tucson market data once on mount
  useEffect(() => {
    supabase.functions.invoke("get-market-pulse").then(({ data, error }) => {
      if (!error && data?.negotiation_gap != null) {
        setMarketPulse({
          negotiation_gap: data.negotiation_gap,
          days_to_close: data.days_to_close,
          last_verified_date: data.last_verified_date ?? null,
        });
      }
      // On error: silently keep TUCSON_FALLBACK — no toast, no broken UI
    });
  }, []);

  const doExplore = async (zipCode: string) => {
    if (!/^\d{5}$/.test(zipCode)) {
      toast.error(t("Please enter a valid 5-digit ZIP code.", "Ingrese un código postal válido de 5 dígitos."));
      return;
    }

    setLoading(true);
    setProfileEn(null);
    setProfileEs(null);

    try {
      const { data, error } = await supabase.functions.invoke("neighborhood-profile", {
        body: { zip_code: zipCode },
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Unknown error");

      setProfileEn(data.profile_en);
      setProfileEs(data.profile_es);
      setResultZip(zipCode);

      updateSessionContext({ last_neighborhood_zip: zipCode, neighborhood_explored: true });
      logEvent(data.cached ? "neighborhood_profile_cached" : "neighborhood_profile_generated", {
        zip_code: zipCode, cached: data.cached,
      });
    } catch (err: unknown) {
      console.error("[NeighborhoodExplorer] Error:", err);
      const msg = (err as Error)?.message || "";
      if (msg.includes("Rate limit")) {
        toast.error(t("Too many requests. Please try again later.", "Demasiadas solicitudes. Intente más tarde."));
      } else {
        toast.error(t("Something went wrong. Please try again.", "Algo salió mal. Intente de nuevo."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExplore = () => doExplore(zip.trim());

  // Handle external ZIP from quiz
  useEffect(() => {
    if (externalZip && externalZip !== processedExternalZip.current) {
      processedExternalZip.current = externalZip;
      setZip(externalZip);
      // Scroll into view then auto-explore
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      // Auto-trigger explore
      doExplore(externalZip);
    }
  }, [externalZip, t]);

  return (
    <section ref={sectionRef} className="py-16 lg:py-20 bg-cc-ivory">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-cc-navy text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <MapPin className="w-4 h-4 text-cc-gold" />
            {t("AI-Powered Insights", "Inteligencia con IA")}
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy">
            {t("Explore Tucson Neighborhoods", "Explora los Vecindarios de Tucson")}
          </h2>
          <p className="text-cc-text-muted mt-3 max-w-2xl mx-auto">
            {t(
              "Enter a ZIP code to get an AI-generated neighborhood profile — lifestyle feel, buyer fit, seller insights, and more.",
              "Ingrese un código postal para obtener un perfil de vecindario generado por IA — estilo de vida, tipo de comprador, información para vendedores y más."
            )}
          </p>
        </div>

        {/* ZIP Input */}
        <div className="max-w-md mx-auto mb-10">
          <div className="flex gap-3">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder={t("Enter ZIP code (e.g. 85719)", "Código postal (ej. 85719)")}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              onKeyDown={(e) => e.key === "Enter" && handleExplore()}
              className="text-center text-lg font-medium tracking-wider border-cc-sand-dark/40 focus-visible:ring-cc-gold"
            />
            <Button
              onClick={handleExplore}
              disabled={loading || zip.length !== 5}
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold px-6 rounded-md shadow-gold"
            >
              <Search className="w-4 h-4 mr-1" />
              {t("Explore", "Explorar")}
            </Button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="max-w-2xl mx-auto space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        )}

        {/* Result */}
        {!loading && profileEn && profileEs && (
          <div className="max-w-2xl mx-auto">
            <NeighborhoodCard
              profileEn={profileEn}
              profileEs={profileEs}
              zipCode={resultZip}
              marketPulse={marketPulse}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default NeighborhoodExplorer;
