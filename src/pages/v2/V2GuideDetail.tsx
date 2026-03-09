import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, User } from "lucide-react";
import V2Layout from "@/components/v2/V2Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import JsonLd from "@/components/seo/JsonLd";
import LanguageToggle from "@/components/v2/LanguageToggle";
import { AuthorityCTABlock, GuideComplianceFooter, GuideComparisonCards, GuidePathSelector, GuideStatsGrid, GuideFaqAccordion, GuideReadNext, GuideMarketStats, GuideToolBridge } from "@/components/v2/guides";
import GuideImage from "@/components/v2/guides/GuideImage";
import GuideVideo from "@/components/v2/guides/GuideVideo";
import GuidePullQuote from "@/components/v2/guides/GuidePullQuote";
import { getGovernedMediaSlots, validateMediaSlots, type MediaSlot } from "@/lib/guides/guideMediaSlots";
import { useGuideScrollTracking } from "@/hooks/useGuideScrollTracking";
import { logEvent } from "@/lib/analytics/logEvent";
import { markGuideOpened, setLastGuideId, getGuidesRead } from '@/lib/guides/personalization';
import { getGuideById, type GuideCategory } from "@/lib/guides/guideRegistry";
import { getHowToSchema } from "@/lib/guides/howToSchemas";
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import { GUIDE_DATA_LOADERS, type GuideContentData } from "@/data/guides";
import { parseInlineMarkdown } from "@/lib/utils/parseInlineMarkdown";
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
    // image & checklist-image — not rendered in guide body (hero card only)
    return null;
  };

  // Per-guide SEO overrides — keyed by guideId
  const seoOverrides: Record<string, { titleEn: string; titleEs: string; descEn: string; descEs: string }> = {
    'cash-vs-traditional-sale': {
      titleEn: 'Cash Offer vs. Listing in Tucson – Kasandra Prieto',
      titleEs: 'Oferta en Efectivo vs. Listar en Tucson – Kasandra Prieto',
      descEn: 'Learn the trade-offs between a quick cash offer and listing your Tucson home. Calm, clear steps from local Realtor Kasandra Prieto.',
      descEs: 'Conoce las diferencias entre una oferta rápida en efectivo y listar tu casa en Tucson. Pasos claros de la Realtor Kasandra Prieto.',
    },
    'cost-to-sell-tucson': {
      titleEn: 'What Does It Cost to Sell a House in Tucson? (2026) – Kasandra Prieto',
      titleEs: '¿Cuánto Cuesta Vender una Casa en Tucson? (2026) – Kasandra Prieto',
      descEn: 'Full breakdown of Tucson seller costs: agent commission, closing costs, pre-sale prep, and holding costs. Real numbers for 2026.',
      descEs: 'Desglose completo de los costos de vender en Tucson: comisión, gastos de cierre, preparación y costos de tenencia. Números reales para 2026.',
    },
    'selling-for-loss': {
      titleEn: 'Selling Your Home for Less Than You Owe in Tucson – Kasandra Prieto',
      titleEs: 'Vender tu Casa por Menos de lo que Debes en Tucson – Kasandra Prieto',
      descEn: 'Understand your options when you owe more than your Tucson home is worth. Short sales, forbearance, and honest guidance from Kasandra Prieto.',
      descEs: 'Entiende tus opciones cuando debes más de lo que vale tu casa en Tucson. Ventas cortas y orientación honesta de Kasandra Prieto.',
    },
    'home-prep-staging': {
      titleEn: 'How to Prepare Your Tucson Home for Sale (2026) – Kasandra Prieto',
      titleEs: 'Cómo Preparar tu Casa en Tucson para Vender (2026) – Kasandra Prieto',
      descEn: 'What Tucson buyers actually react to, what to skip, and the high-ROI prep list. Desert-specific staging tips from Kasandra Prieto.',
      descEs: 'Lo que los compradores de Tucson realmente notan, qué omitir y la lista de preparación de alto retorno. Consejos específicos para el desierto.',
    },
    'pricing-strategy': {
      titleEn: 'How to Price Your Tucson Home to Sell in 2026 – Kasandra Prieto',
      titleEs: 'Cómo Fijar el Precio de tu Casa en Tucson para Vender en 2026 – Kasandra Prieto',
      descEn: 'The real strategy behind Tucson home pricing — why overpricing costs more than it saves, and how to price correctly from day one.',
      descEs: 'La estrategia real detrás de los precios de casas en Tucson — por qué sobrevalorar cuesta más de lo que ahorra.',
    },
    'military-pcs-guide': {
      titleEn: 'Military PCS to Tucson: Buying a Home Near Davis-Monthan AFB – Kasandra Prieto',
      titleEs: 'Mudanza Militar PCS a Tucson: Comprar Casa Cerca de Davis-Monthan – Kasandra Prieto',
      descEn: 'VA loan guidance, neighborhood intel, and Tucson base proximity map for military families PCSing to Davis-Monthan AFB.',
      descEs: 'Orientación sobre préstamos VA, información de vecindarios y mapa de proximidad a la base para familias militares en PCS a Tucson.',
    },
    'divorce-selling': {
      titleEn: 'Selling a Home During Divorce in Arizona – Kasandra Prieto',
      titleEs: 'Vender una Casa Durante un Divorcio en Arizona – Kasandra Prieto',
      descEn: 'Arizona community property rules, timeline coordination, and how to sell your Tucson home during divorce without adding stress.',
      descEs: 'Reglas de propiedad comunitaria en Arizona, coordinación de plazos y cómo vender tu casa en Tucson durante un divorcio sin añadir estrés.',
    },
    'senior-downsizing': {
      titleEn: 'Senior Downsizing in Tucson: Selling and Moving Forward – Kasandra Prieto',
      titleEs: 'Reducción de Vivienda para Mayores en Tucson – Kasandra Prieto',
      descEn: 'A calm guide to downsizing your Tucson home — timing, what to do with possessions, and community options for Arizona seniors.',
      descEs: 'Una guía tranquila para reducir tu vivienda en Tucson — tiempos, qué hacer con las pertenencias y opciones de comunidad para mayores en Arizona.',
    },
    'distressed-preforeclosure': {
      titleEn: 'Facing Foreclosure in Tucson? Your Options in Arizona – Kasandra Prieto',
      titleEs: '¿Enfrentando una Ejecución Hipotecaria en Tucson? Tus Opciones – Kasandra Prieto',
      descEn: 'If you\'re behind on your mortgage in Tucson, here are your real options before foreclosure. Arizona-specific guidance from Kasandra Prieto.',
      descEs: 'Si estás atrasado en tu hipoteca en Tucson, aquí están tus opciones reales antes de la ejecución hipotecaria.',
    },
    'relocating-to-tucson': {
      titleEn: 'Moving to Tucson, Arizona in 2026 – Neighborhood Guide & Relocation Tips',
      titleEs: 'Mudarse a Tucson, Arizona en 2026 – Guía de Vecindarios y Consejos',
      descEn: 'Everything you need to know before relocating to Tucson — best neighborhoods, cost of living, climate, and buying your first home here.',
      descEs: 'Todo lo que necesitas saber antes de mudarte a Tucson — mejores vecindarios, costo de vida, clima y cómo comprar tu primera casa aquí.',
    },
    'tucson-neighborhoods': {
      titleEn: 'Best Neighborhoods in Tucson, AZ (2026) – Buyer\'s Guide – Kasandra Prieto',
      titleEs: 'Los Mejores Vecindarios de Tucson, AZ (2026) – Guía para Compradores',
      descEn: 'Foothills, Marana, Vail, Downtown Tucson and more — a neighborhood-by-neighborhood breakdown for buyers from local Realtor Kasandra Prieto.',
      descEs: 'Foothills, Marana, Vail, Centro de Tucson y más — análisis vecindario por vecindario para compradores de la Realtor local Kasandra Prieto.',
    },
    'tucson-suburb-comparison': {
      titleEn: 'Marana vs Vail vs Sahuarita: Tucson Suburb Comparison 2026 – Kasandra Prieto',
      titleEs: 'Marana vs Vail vs Sahuarita: Comparación de Suburbios de Tucson 2026',
      descEn: 'Side-by-side comparison of Tucson\'s fastest-growing suburbs. Schools, commute, home prices, and lifestyle from a local Realtor.',
      descEs: 'Comparación lado a lado de los suburbios de más rápido crecimiento de Tucson. Escuelas, viaje al trabajo, precios de casas y estilo de vida.',
    },
    'arizona-first-time-buyer-programs': {
      titleEn: 'Arizona First-Time Home Buyer Programs in 2026 – Kasandra Prieto',
      titleEs: 'Programas para Compradores de Primera Vivienda en Arizona 2026 – Kasandra Prieto',
      descEn: 'Down payment assistance, ADOH programs, HOME Plus, and how to qualify as a first-time buyer in Arizona and Tucson.',
      descEs: 'Asistencia para el pago inicial, programas ADOH, HOME Plus y cómo calificar como comprador de primera vivienda en Arizona y Tucson.',
    },
    'buying-home-noncitizen-arizona': {
      titleEn: 'Buying a Home in Arizona as a Non-Citizen or DACA Recipient – Kasandra Prieto',
      titleEs: 'Comprar Casa en Arizona sin Ser Ciudadano o con DACA – Kasandra Prieto',
      descEn: 'Yes, non-citizens can buy homes in Arizona. Mortgage options for ITIN, green card, and DACA buyers in Tucson — explained clearly.',
      descEs: 'Sí, los no ciudadanos pueden comprar casas en Arizona. Opciones de hipoteca para compradores con ITIN, tarjeta verde y DACA en Tucson.',
    },
    'pima-county-property-taxes': {
      titleEn: 'Pima County Property Taxes Explained (2026) – Kasandra Prieto',
      titleEs: 'Impuestos a la Propiedad en el Condado de Pima Explicados (2026)',
      descEn: 'How Pima County property taxes work, how to calculate your bill, and what exemptions are available for Tucson homeowners.',
      descEs: 'Cómo funcionan los impuestos a la propiedad en el Condado de Pima, cómo calcular tu factura y qué exenciones están disponibles.',
    },
    'arizona-real-estate-glossary': {
      titleEn: 'Arizona Real Estate Terms Glossary (2026) – Kasandra Prieto',
      titleEs: 'Glosario de Términos de Bienes Raíces en Arizona (2026) – Kasandra Prieto',
      descEn: 'Plain-language definitions of Arizona real estate terms — escrow, contingency, earnest money, title, and more for Tucson buyers and sellers.',
      descEs: 'Definiciones en lenguaje sencillo de términos de bienes raíces en Arizona — depósito en garantía, contingencia, señal y más.',
    },
    'capital-gains-home-sale-arizona': {
      titleEn: 'Capital Gains When Selling Your Home in Arizona (2026) – Kasandra Prieto',
      titleEs: 'Ganancias de Capital al Vender tu Casa en Arizona (2026) – Kasandra Prieto',
      descEn: 'Do you owe capital gains tax when selling your Tucson home? The $250K/$500K exclusion, Arizona rules, and what to ask your CPA.',
      descEs: '¿Debes impuesto sobre ganancias de capital al vender tu casa en Tucson? La exclusión de $250K/$500K y las reglas de Arizona.',
    },
    'sell-or-rent-tucson': {
      titleEn: 'Should I Sell or Rent My Tucson Home? (2026 Analysis) – Kasandra Prieto',
      titleEs: '¿Debo Vender o Rentar mi Casa en Tucson? (Análisis 2026) – Kasandra Prieto',
      descEn: 'Sell now or become a landlord? A clear financial and lifestyle comparison for Tucson homeowners deciding what to do with their property.',
      descEs: '¿Vender ahora o convertirte en arrendador? Una comparación financiera y de estilo de vida clara para propietarios de Tucson.',
    },
    'how-long-to-sell-tucson': {
      titleEn: 'How Long Does It Take to Sell a House in Tucson? (2026) – Kasandra Prieto',
      titleEs: '¿Cuánto Tiempo Tarda en Venderse una Casa en Tucson? (2026)',
      descEn: 'Current Tucson days on market, what slows down a sale, and how to sell faster with the right strategy — from a local Realtor.',
      descEs: 'Días actuales en el mercado en Tucson, qué retrasa una venta y cómo vender más rápido con la estrategia correcta.',
    },
    'move-up-buyer': {
      titleEn: 'Buying Up in Tucson: How to Buy and Sell at the Same Time – Kasandra Prieto',
      titleEs: 'Comprar Casa Más Grande en Tucson: Comprar y Vender al Mismo Tiempo',
      descEn: 'Bridge loans, contingent offers, and the timing strategy for Tucson homeowners who need to buy before or while selling their current home.',
      descEs: 'Préstamos puente, ofertas contingentes y la estrategia de tiempo para propietarios de Tucson que necesitan comprar antes o mientras venden.',
    },
  };

  const seo = guideId && seoOverrides[guideId];
  const canonicalBase = 'https://kasandraoasis.com';
  const canonicalUrl = guideId ? `${canonicalBase}/v2/guides/${guideId}` : undefined;

  useDocumentHead({
    titleEn: seo ? seo.titleEn : guide ? `${guide.title} | Kasandra Prieto` : 'Guide | Kasandra Prieto',
    titleEs: seo ? seo.titleEs : guide ? `${guide.titleEs} | Kasandra Prieto` : 'Guía | Kasandra Prieto',
    descriptionEn: seo ? seo.descEn : guide ? guide.intro.slice(0, 155) + "…" : '',
    descriptionEs: seo ? seo.descEs : guide ? guide.introEs.slice(0, 155) + "…" : '',
    canonical: canonicalUrl,
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
          url: "https://kasandraprietorealtor.com",
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

      {/* HowTo schema — injected for process guides (cost-to-sell, home-prep, pricing, timeline) */}
      {guideId && (() => {
        const howToData = getHowToSchema(guideId, language);
        return howToData ? <JsonLd data={howToData as Record<string, unknown>} /> : null;
      })()}

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
                {parseInlineMarkdown(t(guide.intro, guide.introEs))}
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
                    {/* Default: inline-markdown parsed. Variants rendered below heading. */}
                    {(!section.variant || section.variant === 'default') && (
                      <div className="text-cc-charcoal leading-relaxed text-lg whitespace-pre-line">
                        {parseInlineMarkdown(t(section.content, section.contentEs))}
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
                {section.variant === 'market-stats' && (
                  <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                      <GuideMarketStats variant={section.marketStatsVariant ?? 'seller-full'} />
                    </div>
                  </div>
                )}
                {section.variant === 'tool-bridge' && guideId && (
                  <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                      <GuideToolBridge guideId={guideId} />
                    </div>
                  </div>
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

        {/* Read Next — guide-to-guide pathway. Keeps users in the hub. */}
        {guideId && (
          <GuideReadNext
            currentGuideId={guideId}
            currentCategory={safeCategory}
          />
        )}

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
