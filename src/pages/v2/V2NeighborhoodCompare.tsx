import { useState, useCallback, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/analytics/logEvent";
import { setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { toast } from "sonner";
import type { NeighborhoodProfile } from "@/components/v2/neighborhood/NeighborhoodCard";
import {
  MapPin, Search, MessageCircle, ArrowRight, X,
  Users, TrendingUp, AlertTriangle, Lightbulb, Plus, Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

interface ZipResult {
  zip: string;
  profileEn: NeighborhoodProfile;
  profileEs: NeighborhoodProfile;
}

const TUCSON_QUICK_ZIPS = [
  { zip: "85701", label: "Downtown" },
  { zip: "85718", label: "Foothills" },
  { zip: "85742", label: "Marana" },
  { zip: "85747", label: "Vail" },
  { zip: "85629", label: "Sahuarita" },
  { zip: "85614", label: "Green Valley" },
];

const ZipSearchInput = ({
  onAdd,
  loading,
  existing,
}: {
  onAdd: (zip: string) => void;
  loading: boolean;
  existing: string[];
}) => {
  const { t } = useLanguage();
  const [value, setValue] = useState("");

  const submit = () => {
    const z = value.trim();
    if (!/^\d{5}$/.test(z)) {
      toast.error(t("Enter a valid 5-digit ZIP.", "Ingresa un código postal de 5 dígitos."));
      return;
    }
    if (existing.includes(z)) {
      toast.info(t("That ZIP is already added.", "Ese código postal ya está agregado."));
      return;
    }
    onAdd(z);
    setValue("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        inputMode="numeric"
        maxLength={5}
        placeholder="85701"
        value={value}
        onChange={e => setValue(e.target.value.replace(/\D/g, "").slice(0, 5))}
        onKeyDown={e => e.key === "Enter" && submit()}
        className="w-32 px-4 py-2.5 rounded-full border border-cc-sand-dark/40 focus:border-cc-navy/40 focus:outline-none text-sm text-cc-charcoal"
      />
      <Button
        onClick={submit}
        disabled={loading || value.length !== 5}
        className="bg-cc-navy text-white rounded-full px-5 text-sm"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <><Plus className="w-4 h-4 mr-1" />{t("Add", "Agregar")}</>
        )}
      </Button>
    </div>
  );
};

const CompareColumn = ({
  result,
  onRemove,
}: {
  result: ZipResult;
  onRemove: () => void;
}) => {
  const { language, t } = useLanguage();
  const profile = language === "es" ? result.profileEs : result.profileEn;

  return (
    <div className="bg-white rounded-2xl border border-cc-sand-dark/30 shadow-soft overflow-hidden min-w-[280px] flex-1">
      {/* Header */}
      <div className="bg-cc-navy px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cc-gold" />
          <span className="font-serif text-xl font-bold text-white">{result.zip}</span>
        </div>
        <button
          onClick={onRemove}
          className="text-white/40 hover:text-white/80 transition-colors"
          aria-label={t("Remove", "Quitar")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Lifestyle */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-cc-gold" />
            <span className="text-xs font-semibold text-cc-navy uppercase tracking-wider">
              {t("Lifestyle & Vibe", "Estilo de Vida")}
            </span>
          </div>
          <p className="text-sm text-cc-charcoal leading-relaxed">{profile.lifestyle_feel}</p>
        </div>

        {/* Best For */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-cc-gold" />
            <span className="text-xs font-semibold text-cc-navy uppercase tracking-wider">
              {t("Best For", "Ideal Para")}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.buyer_fit.map((fit, i) => (
              <Badge key={i} className="bg-cc-sand text-cc-navy border-cc-sand-dark/30 text-xs px-2 py-0.5">
                {fit}
              </Badge>
            ))}
          </div>
        </div>

        {/* Seller Context */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cc-gold" />
            <span className="text-xs font-semibold text-cc-navy uppercase tracking-wider">
              {t("Seller Insights", "Para Vendedores")}
            </span>
          </div>
          <p className="text-sm text-cc-charcoal leading-relaxed">{profile.seller_context}</p>
        </div>

        {/* Market Context */}
        <div className="bg-cc-sand rounded-xl p-3 border border-cc-sand-dark/20">
          <p className="text-xs font-semibold text-cc-navy mb-1">{t("Market Context", "Contexto del Mercado")}</p>
          <p className="text-sm text-cc-charcoal leading-relaxed">{profile.market_framing}</p>
        </div>

        {/* Not Ideal For */}
        <div className="bg-cc-ivory rounded-xl p-3 border border-cc-sand-dark/20">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-cc-gold" />
            <span className="text-xs font-semibold text-cc-slate">
              {t("May Not Suit", "Puede No Ser Ideal")}
            </span>
          </div>
          <p className="text-xs text-cc-text-muted leading-relaxed">{profile.not_ideal_for}</p>
        </div>

        {/* Fun Fact */}
        <div className="flex items-start gap-2 pt-1 border-t border-cc-sand-dark/20">
          <Lightbulb className="w-4 h-4 text-cc-gold flex-shrink-0 mt-0.5" />
          <p className="text-xs text-cc-charcoal italic">{profile.fun_fact}</p>
        </div>
      </div>
    </div>
  );
};

const V2NeighborhoodCompareContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const [results, setResults] = useState<ZipResult[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [loadingZip, setLoadingZip] = useState<string | null>(null);

  useDocumentHead({
    titleEn: "Compare Tucson Neighborhoods Side by Side | ZIP Code Comparison",
    titleEs: "Comparar Vecindarios de Tucson Lado a Lado | Comparación de Códigos Postales",
    descriptionEn: "Compare up to 3 Tucson-area neighborhoods side by side — lifestyle, buyer fit, seller insights, and market context for each ZIP code.",
    descriptionEs: "Compara hasta 3 vecindarios del área de Tucson lado a lado — estilo de vida, perfil del comprador, insights para vendedores y contexto del mercado.",
  });

  const fetchZip = useCallback(async (zip: string) => {
    if (results.length >= 3) {
      toast.info(t("Compare up to 3 ZIPs at once.", "Compara hasta 3 códigos postales a la vez."));
      return;
    }
    setLoadingZip(zip);
    try {
      const { data, error } = await supabase.functions.invoke("neighborhood-profile", {
        body: { zip_code: zip },
      });
      if (error || !data?.profile_en) throw new Error("fetch failed");
      setResults(prev => [...prev, { zip, profileEn: data.profile_en, profileEs: data.profile_es }]);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      logEvent("neighborhood_profile_generated", { zip_code: zip, source: "comparison_tool", cached: data.cached });
    } catch {
      toast.error(t("Couldn't load that ZIP. Try another.", "No se pudo cargar ese código postal. Intenta otro."));
    } finally {
      setLoadingZip(null);
    }
  }, [results.length, t]);

  const removeZip = (zip: string) => setResults(prev => prev.filter(r => r.zip !== zip));

  const existingZips = results.map(r => r.zip);

  return (
    <>
      {/* Hero */}
      <section className="bg-cc-navy py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
            {t("Neighborhood Intelligence", "Inteligencia de Vecindarios")}
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mt-2 mb-4">
            {t("Compare", "Comparar")}
            <span className="text-cc-gold"> {t("Side by Side", "Lado a Lado")}</span>
          </h1>
          <p className="text-white/75 text-lg max-w-2xl">
            {t(
              "Add up to 3 Tucson-area ZIP codes to compare lifestyle, buyer fit, and seller insights in one view.",
              "Agrega hasta 3 códigos postales del área de Tucson para comparar estilo de vida, perfil del comprador e insights para vendedores."
            )}
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="py-10 bg-cc-ivory border-b border-cc-sand-dark/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div>
              <p className="text-sm font-semibold text-cc-navy mb-2">
                {t("Enter a ZIP code", "Ingresa un código postal")}
              </p>
              <ZipSearchInput
                onAdd={fetchZip}
                loading={!!loadingZip}
                existing={existingZips}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-cc-navy mb-2">
                {t("Or try a Tucson quick pick", "O elige un área de Tucson")}
              </p>
              <div className="flex flex-wrap gap-2">
                {TUCSON_QUICK_ZIPS.map(({ zip, label }) => (
                  <button
                    key={zip}
                    onClick={() => !existingZips.includes(zip) && fetchZip(zip)}
                    disabled={existingZips.includes(zip) || results.length >= 3 || !!loadingZip}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      existingZips.includes(zip)
                        ? "bg-cc-navy text-white border-cc-navy"
                        : "bg-white text-cc-charcoal border-cc-sand-dark/40 hover:border-cc-navy/40 disabled:opacity-40"
                    }`}
                  >
                    {label} · {zip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison grid */}
      <section className="py-12 bg-white min-h-[400px]">
        <div className="container mx-auto px-4 max-w-6xl">
          {results.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-cc-sand flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-cc-navy/40" />
              </div>
              <p className="text-cc-text-muted text-lg mb-2">
                {t("Add a ZIP code above to start comparing.", "Agrega un código postal arriba para comenzar.")}
              </p>
              <p className="text-cc-slate text-sm">
                {t("Profiles are powered by live Perplexity Sonar web search.", "Los perfiles se generan con búsqueda web en vivo de Perplexity Sonar.")}
              </p>
            </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-4">
              {results.map(r => (
                <CompareColumn key={r.zip} result={r} onRemove={() => removeZip(r.zip)} />
              ))}
              {results.length < 3 && (
                <div className="min-w-[280px] flex-1 rounded-2xl border-2 border-dashed border-cc-sand-dark/40 flex flex-col items-center justify-center p-10 text-cc-slate/60">
                  <Plus className="w-8 h-8 mb-2" />
                  <p className="text-sm text-center">
                    {t("Add another ZIP to compare", "Agrega otro código postal para comparar")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Selena CTA */}
      {results.length >= 2 && (
        <section className="py-12 bg-cc-sand">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h3 className="font-serif text-2xl font-bold text-cc-navy mb-3">
              {t("Still deciding?", "¿Todavía decidiendo?")}
            </h3>
            <p className="text-cc-charcoal mb-6">
              {t(
                "Kasandra knows these neighborhoods personally. She can help you weigh what matters most for your situation.",
                "Kasandra conoce estos vecindarios personalmente. Puede ayudarte a evaluar lo que más importa para tu situación."
              )}
            </p>
            <Button
              onClick={() => openChat({
                source: 'neighborhood_compare_result' as any,
                neighborhoodCompareData: {
                  areasCompared: results.map(r => `${r.zip}`),
                },
              })}
              className="bg-cc-navy text-white rounded-full px-8 font-semibold"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("Ask Selena About These Areas", "Preguntarle a Selena Sobre Estas Áreas")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Link to="/book?intent=buy&source=neighborhood_compare" className="inline-block mt-3">
              <Button className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold">
                <Calendar className="w-4 h-4 mr-2" />
                {t("Discuss These Areas With Kasandra", "Hablar de Estas Áreas Con Kasandra")}
              </Button>
            </Link>
          </div>
        </section>
      )}
    </>
  );
};

const V2NeighborhoodCompare = () => (
  <V2Layout>
    <V2NeighborhoodCompareContent />
  </V2Layout>
);

export default V2NeighborhoodCompare;
