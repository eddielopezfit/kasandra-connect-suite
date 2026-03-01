import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, User, Sparkles } from "lucide-react";
import V2Layout from "@/components/v2/V2Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import JsonLd from "@/components/seo/JsonLd";
import LanguageToggle from "@/components/v2/LanguageToggle";
import { AuthorityCTABlock, SelenaGuideHandoff, GuideComplianceFooter } from "@/components/v2/guides";
import GuideImage from "@/components/v2/guides/GuideImage";
import GuideVideo from "@/components/v2/guides/GuideVideo";
import GuidePullQuote from "@/components/v2/guides/GuidePullQuote";
// SelenaAnchorPrompt used inline as mid-guide CTA
import { getGovernedMediaSlots, validateMediaSlots, type MediaSlot } from "@/lib/guides/guideMediaSlots";
import { useGuideScrollTracking } from "@/hooks/useGuideScrollTracking";
import { logEvent } from "@/lib/analytics/logEvent";
import { markGuideOpened, setLastGuideId } from '@/lib/guides/personalization';
import { getGuideById, type GuideCategory, type MidGuidePromptKey } from "@/lib/guides/guideRegistry";
import { getSessionContext, updateSessionContext } from "@/lib/analytics/selenaSession";
import { GUIDE_DATA_LOADERS, type GuideContentData } from "@/data/guides";
import { validateRegistryLoadersOnce } from "@/lib/guides/validate";
import { useSelenaChat } from "@/contexts/SelenaChatContext";

// Mid-guide CTA prompt copy — keyed by MidGuidePromptKey union
const MID_GUIDE_PROMPTS: Record<MidGuidePromptKey, { en: string; es: string }> = {
  first_time_confidence: { en: "Have a question about any of these steps? Selena can walk you through it.", es: "¿Tienes alguna pregunta sobre estos pasos? Selena puede guiarte." },
  valuation_confusion: { en: "If you're seeing different numbers online, Selena can help explain why.", es: "Si ves diferentes números en línea, Selena puede ayudarte a entender por qué." },
  selling_options: { en: "Not sure which path is right? Selena can help you compare.", es: "¿No sabes qué camino es el correcto? Selena puede ayudarte a comparar." },
  cash_vs_list: { en: "Want to see what both options look like for your home? Ask Selena.", es: "¿Quieres ver cómo se ven ambas opciones para tu casa? Pregúntale a Selena." },
  life_event_support: { en: "If this feels heavy, you don't have to sort it out alone.", es: "Si esto se siente pesado, no tienes que resolverlo solo." },
  bilingual_support: { en: "¿Prefieres continuar en español? Selena habla tu idioma.", es: "¿Prefieres continuar en español? Selena habla tu idioma." },
  trust_story_followup: { en: "Does this sound like your situation? Selena can help you take the next step.", es: "¿Esto suena como tu situación? Selena puede ayudarte a dar el siguiente paso." },
};

// Inner component — must be rendered inside V2Layout (which provides SelenaChatProvider)
function GuideDetailContent() {
  const { guideId } = useParams<{ guideId: string }>();
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  const [guide, setGuide] = useState<GuideContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Registry entry for metadata (readTime, midGuideCTA, exitRamp, etc.)
  const registryEntry = guideId ? getGuideById(guideId) : undefined;

  // Dev-only: validate registry ↔ loaders on first mount
  useEffect(() => {
    validateRegistryLoadersOnce();
  }, []);

  // Load guide content dynamically
  useEffect(() => {
    if (!guideId) {
      setIsLoading(false);
      return;
    }
    const loader = GUIDE_DATA_LOADERS[guideId];
    if (!loader) {
      // Load fallback
      import('@/data/guides/fallback').then(mod => {
        setGuide(mod.default);
        setIsLoading(false);
      });
      return;
    }
    setIsLoading(true);
    loader().then(mod => {
      setGuide(mod.default);
      setIsLoading(false);
    }).catch(() => {
      import('@/data/guides/fallback').then(mod => {
        setGuide(mod.default);
        setIsLoading(false);
      });
    });
  }, [guideId]);

  const guideTitle = guide ? (language === 'es' ? guide.titleEs : guide.title) : '';
  const readTime = registryEntry ? (language === 'es' ? registryEntry.readTimeEs : registryEntry.readTime) : '';

  // Track scroll depth for analytics
  useGuideScrollTracking({
    guideId: guideId || 'unknown',
    guideTitle,
    enabled: !!guide,
  });

  // Log guide open and track in personalization on mount
  useEffect(() => {
    if (guideId && guide) {
      logEvent('guide_open', {
        guide_id: guideId,
        guide_title: guideTitle,
      });
      markGuideOpened(guideId);
      setLastGuideId(guideId);

      const ctx = getSessionContext();
      const prevGuideId = ctx?.last_guide_id;
      if (prevGuideId !== guideId) {
        updateSessionContext({
          last_guide_id: guideId,
          guides_read: (ctx?.guides_read ?? 0) + 1,
        });
      }
    }
  }, [guideId, guide, guideTitle]);

  // Renders a single media slot — returns null if no content
  const MediaSlotRenderer = ({ slot }: { slot: MediaSlot }) => {
    if (slot.type === 'pull-quote-image') {
      return <GuidePullQuote quote={slot.quote} quoteEs={slot.quoteEs} />;
    }
    if (slot.type === 'video') {
      return <GuideVideo src={slot.src} posterSrc={slot.posterSrc} alt={slot.alt} altEs={slot.altEs} />;
    }
    return <GuideImage src={slot.src} alt={slot.alt} altEs={slot.altEs} />;
  };

  // Handle exit ramp click — opens Selena with guide context
  const handleExitRampClick = () => {
    if (!registryEntry) return;
    const mappedIntent = registryEntry.decisionIntent === 'buy' ? 'buy' : 'sell';
    openChat({
      source: 'guide_exit_ramp',
      guideId: registryEntry.id,
      intent: mappedIntent,
    });
    logEvent('guide_exit_ramp_clicked', {
      guide_id: registryEntry.id,
      intent: mappedIntent,
    });
  };

  // Handle mid-guide CTA click
  const handleMidGuideCTA = () => {
    if (!registryEntry) return;
    openChat({
      source: 'guide_mid_cta',
      guideId: registryEntry.id,
    });
    logEvent('guide_mid_cta_clicked', {
      guide_id: registryEntry.id,
      prompt_key: registryEntry.midGuideCTA?.promptKey,
    });
  };

  useDocumentHead({
    titleEn: guide ? `${guide.title} | Kasandra Prieto` : 'Guide | Kasandra Prieto',
    titleEs: guide ? `${guide.titleEs} | Kasandra Prieto` : 'Guía | Kasandra Prieto',
    descriptionEn: guide ? guide.intro.slice(0, 155) + "…" : '',
    descriptionEs: guide ? guide.introEs.slice(0, 155) + "…" : '',
  });

  if (isLoading || !guide) {
    return (
      <section className="bg-cc-navy pt-32 pb-16 min-h-[40vh] flex items-center justify-center">
        <div className="text-white/50 text-lg">{t("Loading guide…", "Cargando guía…")}</div>
      </section>
    );
  }

  const safeCategory: GuideCategory = registryEntry?.category ?? 'stories';

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: t(guide.title, guide.titleEs),
        author: { "@type": "Person", name: guide.author },
        publisher: { "@type": "Person", name: "Kasandra Prieto" },
        description: t(guide.intro, guide.introEs).slice(0, 200),
        inLanguage: language,
      }} />
      {/* Hero Section */}
      <section className="relative bg-cc-navy pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-cc-navy via-cc-navy-dark to-cc-navy opacity-95" />
        <div className="container mx-auto px-4 relative z-10">
          {/* Top Bar: Back + Language Toggle */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/v2/guides"
              className="inline-flex items-center text-white/70 hover:text-cc-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to Guides", "Volver a Guías")}
            </Link>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
              <LanguageToggle variant="dark" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-cc-gold/20 text-cc-gold rounded-full text-sm font-medium">
              {t(guide.category, guide.categoryEs)}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6 leading-tight max-w-4xl">
            {t(guide.title, guide.titleEs)}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {guide.author}
            </div>
            {readTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {readTime}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="bg-cc-sand">
        {/* Intro */}
        <section className="bg-white py-12 border-b border-cc-sand-dark">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-cc-charcoal leading-relaxed">
                {t(guide.intro, guide.introEs)}
              </p>
              
              {/* Exit Ramp — soft text link under intro */}
              {registryEntry?.exitRampCopy && (
                <button
                  onClick={handleExitRampClick}
                  className="mt-6 text-sm text-cc-slate/70 hover:text-cc-gold transition-colors underline underline-offset-2 decoration-dotted"
                >
                  {t(registryEntry.exitRampCopy.en, registryEntry.exitRampCopy.es)}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Media slots after intro (afterSection === -1) */}
        {(() => {
          const slots = guideId ? getGovernedMediaSlots(guideId) : [];
          if (slots.length && guideId) validateMediaSlots(slots, guideId, registryEntry?.tier);
          const introSlots = slots.filter((s) => s.afterSection === -1);
          return introSlots.map((slot) => <MediaSlotRenderer key={slot.id} slot={slot} />);
        })()}

        {/* Content Sections with Per-Guide Media Slots + Mid-Guide CTA */}
        {guide.sections.map((section, index) => {
          const slots = guideId ? getGovernedMediaSlots(guideId) : [];
          const sectionSlots = slots.filter((s) => s.afterSection === index);
          const showMidCTA = registryEntry?.midGuideCTA?.afterSection === index;
          const midPromptKey = registryEntry?.midGuideCTA?.promptKey;

          return (
            <div key={index}>
              <section
                className={`py-12 ${index % 2 === 0 ? "bg-cc-sand" : "bg-white"}`}
              >
                <div className="container mx-auto px-4">
                  <div className="max-w-3xl mx-auto">
                    <h2 className="font-serif text-2xl md:text-3xl text-cc-navy mb-6">
                      {t(section.heading, section.headingEs)}
                    </h2>
                    <div className="text-cc-charcoal leading-relaxed text-lg whitespace-pre-line">
                      {t(section.content, section.contentEs)}
                    </div>
                  </div>
                </div>
              </section>
              {sectionSlots.map((slot) => <MediaSlotRenderer key={slot.id} slot={slot} />)}
              
              {/* Mid-Guide CTA — contextual Selena anchor */}
              {showMidCTA && midPromptKey && (
                <div className="container mx-auto px-4 py-6">
                  <div className="max-w-3xl mx-auto">
                    <div
                      className="bg-gradient-to-r from-cc-navy/5 to-cc-gold/5 rounded-xl p-5 border border-cc-sand-dark/50 flex items-center gap-4 cursor-pointer hover:border-cc-gold/30 transition-colors"
                      onClick={() => handleMidGuideCTA()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleMidGuideCTA()}
                    >
                      <div className="w-10 h-10 rounded-full bg-cc-gold/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-cc-gold" />
                      </div>
                      <p className="text-sm text-cc-slate flex-1">
                        {t(MID_GUIDE_PROMPTS[midPromptKey].en, MID_GUIDE_PROMPTS[midPromptKey].es)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Compliance Footer */}
        <GuideComplianceFooter />

        {/* Authority CTA Block (Decision-Compression) */}
        <AuthorityCTABlock 
          category={safeCategory}
          guideTitle={guideTitle}
          isCashGuide={!!registryEntry?.isCashGuide}
          authorityBridge={registryEntry?.authorityBridge}
          marketInsight={registryEntry?.marketInsight}
          registryDestinations={registryEntry?.destinations}
        />
        <SelenaGuideHandoff 
          guideId={guideId || 'unknown'}
          category={safeCategory}
        />
      </article>
    </>
  );
}

const V2GuideDetail = () => (
  <V2Layout>
    <GuideDetailContent />
  </V2Layout>
);

export default V2GuideDetail;
