import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, User } from "lucide-react";
import V2Layout from "@/components/v2/V2Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import JsonLd from "@/components/seo/JsonLd";
import LanguageToggle from "@/components/v2/LanguageToggle";
import { AuthorityCTABlock, GuideComplianceFooter, GuideComparisonCards, GuidePathSelector, GuideStatsGrid, GuideFaqAccordion } from "@/components/v2/guides";
import GuideImage from "@/components/v2/guides/GuideImage";
import GuideVideo from "@/components/v2/guides/GuideVideo";
import GuidePullQuote from "@/components/v2/guides/GuidePullQuote";
import { getGovernedMediaSlots, validateMediaSlots, type MediaSlot } from "@/lib/guides/guideMediaSlots";
import { useGuideScrollTracking } from "@/hooks/useGuideScrollTracking";
import { logEvent } from "@/lib/analytics/logEvent";
import { markGuideOpened, setLastGuideId, getGuidesRead } from '@/lib/guides/personalization';
import { getGuideById, type GuideCategory } from "@/lib/guides/guideRegistry";
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import { GUIDE_DATA_LOADERS, type GuideContentData } from "@/data/guides";
import { validateRegistryLoadersOnce } from "@/lib/guides/validate";

// Inner component — must be rendered inside V2Layout (which provides SelenaChatProvider)
function GuideDetailContent() {
  const { guideId } = useParams<{ guideId: string }>();
  const { t, language } = useLanguage();
  const [guide, setGuide] = useState<GuideContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Registry entry for metadata (readTime, tier, destinations, etc.)
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

      // markGuideOpened deduplicates in localStorage (Set semantics).
      // Must be called BEFORE getGuidesRead() so the current guide is included.
      markGuideOpened(guideId);
      setLastGuideId(guideId);

      // Derive guides_read from the unique localStorage array — not a naive
      // increment. Previous bug: `prevGuideId !== guideId` only blocked same-
      // guide consecutive re-entry; returning to any earlier guide re-counted it.
      // Now: length of the deduped array is always the canonical unique count.
      const uniqueCount = getGuidesRead().length;
      updateSessionContext({
        last_guide_id: guideId,
        guides_read: uniqueCount,
      });
    }
  }, [guideId, guide, guideTitle]);

  // Renders a single media slot
  const MediaSlotRenderer = ({ slot }: { slot: MediaSlot }) => {
    if (slot.type === 'pull-quote-image') {
      return <GuidePullQuote quote={slot.quote} quoteEs={slot.quoteEs} />;
    }
    if (slot.type === 'video') {
      return <GuideVideo src={slot.src} posterSrc={slot.posterSrc} alt={slot.alt} altEs={slot.altEs} />;
    }
    return <GuideImage src={slot.src} alt={slot.alt} altEs={slot.altEs} />;
  };

  // Per-guide SEO overrides — keyed by guideId
  const seoOverrides: Record<string, { titleEn: string; titleEs: string; descEn: string; descEs: string }> = {
    'cash-vs-traditional-sale': {
      titleEn: 'Cash Offer vs. Listing in Tucson – Kasandra Prieto',
      titleEs: 'Oferta en Efectivo vs. Listar en Tucson – Kasandra Prieto',
      descEn: 'Learn the trade-offs between a quick cash offer and listing your Tucson home. Calm, clear steps from local Realtor Kasandra Prieto and Selena.',
      descEs: 'Conoce las diferencias entre una oferta rápida en efectivo y listar tu casa en Tucson. Pasos claros y tranquilos de la Realtor local Kasandra Prieto y Selena.',
    },
  };

  const seo = guideId && seoOverrides[guideId];

  useDocumentHead({
    titleEn: seo ? seo.titleEn : guide ? `${guide.title} | Kasandra Prieto` : 'Guide | Kasandra Prieto',
    titleEs: seo ? seo.titleEs : guide ? `${guide.titleEs} | Kasandra Prieto` : 'Guía | Kasandra Prieto',
    descriptionEn: seo ? seo.descEn : guide ? guide.intro.slice(0, 155) + "…" : '',
    descriptionEs: seo ? seo.descEs : guide ? guide.introEs.slice(0, 155) + "…" : '',
  });

  if (isLoading || !guide) {
    return (
      <section className="bg-cc-navy pt-32 pb-16 min-h-[40vh] flex items-center justify-center">
        <div className="text-white/50 text-lg">{t("Loading guide…", "Cargando guía…")}</div>
      </section>
    );
  }

  const safeCategory: GuideCategory = registryEntry?.category ?? 'stories';

  // Collect all faqItems across all sections for FAQPage schema
  const allFaqItems = guide.sections.flatMap(s => s.faqItems ?? []);

  return (
    <>
      {/* Article schema — authorship + description */}
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: t(guide.title, guide.titleEs),
        author: {
          "@type": "Person",
          name: guide.author,
          jobTitle: "REALTOR®",
          worksFor: { "@type": "Organization", name: "Corner Connect brokered by Realty Executives Arizona Territory" },
          url: "https://kasandraprieto.com",
        },
        publisher: {
          "@type": "Person",
          name: "Kasandra Prieto",
        },
        description: t(guide.intro, guide.introEs).slice(0, 200),
        inLanguage: language,
        areaServed: { "@type": "City", name: "Tucson", containedInPlace: { "@type": "State", name: "Arizona" } },
      }} />

      {/* FAQPage schema — injected only when guide has faqItems */}
      {allFaqItems.length > 0 && (
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: allFaqItems.map(item => ({
            "@type": "Question",
            name: language === 'es' ? item.questionEs : item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: language === 'es' ? item.answerEs : item.answer,
            },
          })),
        }} />
      )}

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
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="bg-cc-sand">
        {/* Intro — clean, no exit ramp */}
        <section className="bg-white py-12 border-b border-cc-sand-dark">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-cc-charcoal leading-relaxed">
                {t(guide.intro, guide.introEs)}
              </p>
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

        {/* Content Sections with Per-Guide Media Slots — no mid-guide interruptions */}
        {guide.sections.map((section, index) => {
          const slots = guideId ? getGovernedMediaSlots(guideId) : [];
          const sectionSlots = slots.filter((s) => s.afterSection === index);

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
                    {/* Default: plain text. Variants rendered below heading. */}
                    {(!section.variant || section.variant === 'default') && (
                      <div className="text-cc-charcoal leading-relaxed text-lg whitespace-pre-line">
                        {t(section.content, section.contentEs)}
                      </div>
                    )}
                  </div>
                </div>
                {/* Rich variant renderers */}
                {section.variant === 'comparison' && section.comparisonData && (
                  <GuideComparisonCards data={section.comparisonData} />
                )}
                {section.variant === 'path-selector' && section.pathData && (
                  <GuidePathSelector data={section.pathData} />
                )}
                {section.variant === 'stats-grid' && section.statsData && (
                  <GuideStatsGrid data={section.statsData} />
                )}
                {section.variant === 'faq' && section.faqItems && section.faqItems.length > 0 && (
                  <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                      <GuideFaqAccordion
                        items={section.faqItems}
                        intro={section.content || undefined}
                        introEs={section.contentEs || undefined}
                      />
                    </div>
                  </div>
                )}
              </section>
              {sectionSlots.map((slot) => <MediaSlotRenderer key={slot.id} slot={slot} />)}
            </div>
          );
        })}

        {/* Compliance Footer */}
        <GuideComplianceFooter />

        {/* Authority CTA Block — Tier 1 + Tier 2 only. Tier 3 stories end in silence. */}
        {registryEntry?.tier !== 3 && (
          <AuthorityCTABlock 
            guideId={guideId || 'unknown'}
            category={safeCategory}
            guideTitle={guideTitle}
            isCashGuide={!!registryEntry?.isCashGuide}
            authorityBridge={registryEntry?.authorityBridge}
            marketInsight={registryEntry?.marketInsight}
            registryDestinations={registryEntry?.destinations}
          />
        )}

        {/* QA Guardrail: warn in dev if >1 CTA component rendered */}
        <GuideCTAGuardrail guideId={guideId} />
      </article>
    </>
  );
}

/**
 * DEV-ONLY QA Guardrail: Counts CTA-class elements on the guide page.
 * Warns in console if >1 CTA component is detected, preventing regression
 * into the old multi-CTA pattern.
 */
function GuideCTAGuardrail({ guideId }: { guideId?: string }) {
  const warned = useRef(false);

  useEffect(() => {
    if (import.meta.env.PROD || warned.current) return;

    // Run after paint so all components have mounted
    const timer = setTimeout(() => {
      const ctaSelectors = [
        '[data-cta-block="authority"]',
        '[data-cta-block="handoff"]',
        '[data-cta-block="mid-guide"]',
        '[data-cta-block="exit-ramp"]',
      ];
      const found = ctaSelectors
        .map(sel => ({ sel, count: document.querySelectorAll(sel).length }))
        .filter(r => r.count > 0);

      const totalCTAs = found.reduce((sum, r) => sum + r.count, 0);

      if (totalCTAs > 1) {
        warned.current = true;
        console.warn(
          `[Guide CTA Guardrail] ⚠️ Guide "${guideId}" has ${totalCTAs} CTA blocks. ` +
          `Policy: max 1 terminal CTA (Tier 1/2) or 0 (Tier 3). ` +
          `Found: ${found.map(r => `${r.sel} ×${r.count}`).join(', ')}`
        );
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [guideId]);

  return null;
}

const V2GuideDetail = () => (
  <V2Layout>
    <GuideDetailContent />
  </V2Layout>
);

export default V2GuideDetail;
