import { useParams, Navigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import { Sparkles, MapPin } from "lucide-react";
import { getNeighborhoodBySlug } from "@/data/neighborhoods/neighborhoodRegistry";
import JsonLd from "@/components/seo/JsonLd";
import NeighborhoodIntelligencePanel from "@/components/v2/neighborhood/NeighborhoodIntelligencePanel";
import RelatedNeighborhoodsRail from "@/components/v2/neighborhood/RelatedNeighborhoodsRail";
import AreaStoryBreak from "@/components/v2/neighborhood/AreaStoryBreak";
import AreaLifestyleFit from "@/components/v2/neighborhood/AreaLifestyleFit";
import AreaIntelligenceCard from "@/components/v2/neighborhood/AreaIntelligenceCard";
import AreaVisualSection from "@/components/v2/neighborhood/AreaVisualSection";
import AreaDecisionTools from "@/components/v2/neighborhood/AreaDecisionTools";
import AreaCinematicCTA from "@/components/v2/neighborhood/AreaCinematicCTA";
import AreaReadinessIndicator from "@/components/v2/neighborhood/AreaReadinessIndicator";
import NeighborhoodSplitCTA from "@/components/v2/neighborhood/NeighborhoodSplitCTA";
import KasandraPresenceCard from "@/components/v2/KasandraPresenceCard";
import KasandraVideoBlock from "@/components/v2/KasandraVideoBlock";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { logEvent } from "@/lib/analytics/logEvent";
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import { useEffect, useState } from "react";
import { type NeighborhoodEntry } from "@/data/neighborhoods/neighborhoodRegistry";
import { getNeighborhoodHeroUrl } from "@/lib/neighborhood/heroUrl";
import { motion } from "framer-motion";

/** Inner content — must render inside V2Layout to access SelenaChatProvider */
const NeighborhoodDetailContent = ({ neighborhood }: { neighborhood: NeighborhoodEntry }) => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  const [heroError, setHeroError] = useState(false);
  const heroUrl = getNeighborhoodHeroUrl(neighborhood.slug);

  const hasCinematicData = !!(neighborhood.lifestyleFit || neighborhood.areaIntelligence || neighborhood.storyBreak);

  useEffect(() => {
    logEvent('neighborhood_page_view', { slug: neighborhood.slug, region: neighborhood.regionGroup });
    updateSessionContext({
      last_neighborhood_zip: neighborhood.primaryZip,
      neighborhood_explored: true,
      last_seen_page_type: 'page',
      last_seen_page_path: `/neighborhoods/${neighborhood.slug}`,
    });
  }, [neighborhood.slug, neighborhood.regionGroup, neighborhood.primaryZip]);

  const handleSelenaOpen = () => {
    openChat({
      source: 'neighborhood_detail',
      neighborhoodSlug: neighborhood.slug,
      neighborhoodName: neighborhood.name,
      prefillMessage: t(
        `What are you prioritizing in an area — price, lifestyle, or location?`,
        `¿Qué estás priorizando en un área — precio, estilo de vida o ubicación?`
      ),
    });
  };

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Kasandra Prieto - Corner Connect",
    "description": language === 'es' ? neighborhood.metaDescription.es : neighborhood.metaDescription.en,
    "areaServed": {
      "@type": "Place",
      "name": `${neighborhood.name}, Arizona`
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": neighborhood.name,
      "addressRegion": "AZ",
      "postalCode": neighborhood.primaryZip,
      "addressCountry": "US"
    }
  };

  const positioningText = neighborhood.positioningLine
    ? (language === 'es' ? neighborhood.positioningLine.es : neighborhood.positioningLine.en)
    : (language === 'es' ? neighborhood.heroTagline.es : neighborhood.heroTagline.en);

  return (
    <>
      <JsonLd data={jsonLdData} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kasandraprietorealtor.com" },
          { "@type": "ListItem", "position": 2, "name": "Neighborhoods", "item": "https://kasandraprietorealtor.com/neighborhoods" },
          { "@type": "ListItem", "position": 3, "name": language === 'es' ? neighborhood.nameEs : neighborhood.name, "item": `https://kasandraprietorealtor.com/neighborhoods/${neighborhood.slug}` }
        ]
      }} />

      {/* ── CINEMATIC HERO ── */}
      <section className="relative bg-gradient-to-br from-cc-navy via-cc-navy to-cc-charcoal py-24 lg:py-36 overflow-hidden">
        {!heroError ? (
          <img
            src={heroUrl}
            alt={`${neighborhood.name} Arizona neighborhood`}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            onError={() => setHeroError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-[url('/og-kasandra.jpg')] bg-cover bg-center opacity-10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cc-navy/95 via-cc-navy/60 to-cc-navy/80" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 bg-cc-gold/15 text-cc-gold px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                <MapPin className="w-4 h-4" />
                {neighborhood.primaryZip}
              </div>
            </motion.div>

            <motion.h1
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {language === 'es' ? neighborhood.nameEs : neighborhood.name}
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-white/75 mb-4 max-w-2xl mx-auto italic font-serif"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {positioningText}
            </motion.p>

            <motion.p
              className="text-sm text-white/50 mb-8 max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {t(
                'A breakdown of what living here actually feels like — so you can decide with clarity.',
                'Un desglose de cómo se siente realmente vivir aquí — para que puedas decidir con claridad.'
              )}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="space-y-4"
            >
              {/* Readiness Indicator */}
              <AreaReadinessIndicator />

              <button
                onClick={handleSelenaOpen}
                className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold px-8 py-4 text-lg rounded-full shadow-lg hover:scale-[1.02] transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {t('Start Your Area Decision', 'Comienza Tu Decisión de Área')}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STORY BREAK ── */}
      {hasCinematicData && (
        <AreaStoryBreak
          headline={neighborhood.storyBreak?.headline}
          body={neighborhood.storyBreak?.body}
          fallbackTagline={neighborhood.heroTagline}
        />
      )}

      {/* ── LIFESTYLE FIT ── */}
      {neighborhood.lifestyleFit && (
        <AreaLifestyleFit lifestyleFit={neighborhood.lifestyleFit} />
      )}

      {/* ── KASANDRA PRESENCE — after lifestyle, before intelligence ── */}
      {hasCinematicData && (
        <KasandraPresenceCard
          variant="editorial"
          messageEn="Hi, I'm Kasandra — if you're exploring this area, here's what I'd want you to know: the right neighborhood isn't about price alone. It's about how your daily life feels."
          messageEs="Hola, soy Kasandra — si estás explorando esta área, esto es lo que me gustaría que supieras: el vecindario correcto no se trata solo del precio. Se trata de cómo se siente tu vida diaria."
        />
      )}

      {/* ── AREA INTELLIGENCE CARDS ── */}
      {neighborhood.areaIntelligence && (
        <AreaIntelligenceCard areaIntelligence={neighborhood.areaIntelligence} />
      )}

      {/* ── AI-POWERED INTELLIGENCE PANEL ── */}
      <NeighborhoodIntelligencePanel
        zipCode={neighborhood.primaryZip}
        neighborhoodName={neighborhood.neighborhoodQueryName || neighborhood.name}
      />

      {/* ── LIFESTYLE VISUAL SECTION ── */}
      {neighborhood.lifestyleHighlights && (
        <AreaVisualSection
          lifestyleHighlights={neighborhood.lifestyleHighlights}
          imageUrl={neighborhood.lifestyleImageUrl}
          areaName={language === 'es' ? neighborhood.nameEs : neighborhood.name}
        />
      )}

      {/* ── KASANDRA VIDEO — before decision tools ── */}
      <KasandraVideoBlock
        variant="compact"
        labelEn="Watch: What buyers should know about this area"
        labelEs="Mira: Lo que los compradores deben saber de esta área"
        className="px-4"
      />

      {/* ── DECISION TOOLS ── */}
      <AreaDecisionTools slug={neighborhood.slug} />

      {/* ── SELLER / BUYER PROFILES (fallback for areas without cinematic data) ── */}
      {!hasCinematicData && (
        <NeighborhoodSplitCTA neighborhood={neighborhood} />
      )}

      {/* ── RELATED NEIGHBORHOODS + GUIDES ── */}
      <RelatedNeighborhoodsRail neighborhood={neighborhood} />

      {/* ── CINEMATIC CTA ── */}
      <AreaCinematicCTA
        slug={neighborhood.slug}
        areaName={neighborhood.name}
        areaNameEs={neighborhood.nameEs}
        onOpenSelena={handleSelenaOpen}
      />
    </>
  );
};

const V2NeighborhoodDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const neighborhood = slug ? getNeighborhoodBySlug(slug) : undefined;

  useDocumentHead({
    titleEn: neighborhood ? `${neighborhood.name} AZ — Area Decision Guide | Kasandra Prieto` : "Neighborhood Not Found",
    titleEs: neighborhood ? `${neighborhood.nameEs} AZ — Guía de Decisión de Área | Kasandra Prieto` : "Vecindario No Encontrado",
    descriptionEn: neighborhood?.metaDescription.en || "",
    descriptionEs: neighborhood?.metaDescription.es || "",
  });

  if (!neighborhood) {
    return <Navigate to="/neighborhoods" replace />;
  }

  return (
    <V2Layout suppressCTA>
      <NeighborhoodDetailContent neighborhood={neighborhood} />
    </V2Layout>
  );
};

export default V2NeighborhoodDetail;
