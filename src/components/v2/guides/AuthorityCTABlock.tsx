/**
 * AuthorityCTABlock - Decision-Compression CTA
 * 
 * Renders registry-driven CTAs when `registryDestinations` is provided (Model A).
 * Falls back to category-level CTA_CONFIG when registry data is absent.
 * 
 * Authority bridge text, market insight, and visual rhythm are always
 * preserved — only the CTA buttons swap based on the data source.
 * 
 * Tone: Calm, Adult, Inevitable, Earned
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { logEvent } from '@/lib/analytics/logEvent';
import { logCTAClick, CTA_NAMES } from '@/lib/analytics/ctaDefaults';
import type { GuideCategory, GuideDestinations } from '@/lib/guides/guideRegistry';
import type { ActionSpec } from '@/lib/actions/actionSpec';
import { isActionValid, resolveAction } from '@/lib/actions/actionSpec';
import { DollarSign, MessageCircle, ArrowRight, Calendar } from 'lucide-react';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AuthorityCTABlockProps {
  category: GuideCategory;
  guideTitle: string;
  isCashGuide?: boolean;
  authorityBridge?: { en: string; es: string };
  marketInsight?: { en: string; es: string };
  /** When provided, buttons are rendered from registry (Model A). */
  registryDestinations?: GuideDestinations;
}

// ---------------------------------------------------------------------------
// Authority bridge copy (category-level defaults)
// ---------------------------------------------------------------------------

const DEFAULT_AUTHORITY_BRIDGE: Record<GuideCategory, { en: string; es: string }> = {
  buying: {
    en: "This decision has nuances most people don't see until it's too late. Kasandra walks people through exactly this every day.",
    es: "Esta decisión tiene matices que la mayoría no ve hasta que es demasiado tarde. Kasandra guía a las personas a través de exactamente esto todos los días.",
  },
  selling: {
    en: "Selling is situational. What works depends on your timeline, your home's condition, and the current Tucson market. Kasandra helps you see all of it clearly.",
    es: "Vender es situacional. Lo que funciona depende de su cronograma, la condición de su casa y el mercado actual de Tucson. Kasandra le ayuda a verlo todo claramente.",
  },
  valuation: {
    en: "Understanding your home's value is the foundation of any good decision. Kasandra provides clarity, not pressure.",
    es: "Entender el valor de su casa es la base de cualquier buena decisión. Kasandra ofrece claridad, no presión.",
  },
  cash: {
    en: "Cash transactions amplify mistakes. The outcome depends on structure, timing, and who's protecting your interests, not just speed.",
    es: "Las transacciones en efectivo amplifican los errores. El resultado depende de la estructura, el momento y quién protege sus intereses, no solo la velocidad.",
  },
  stories: {
    en: "Every situation is different. What stays the same is having someone who can see the whole picture.",
    es: "Cada situación es diferente. Lo que no cambia es tener a alguien que pueda ver el panorama completo.",
  },
  probate: {
    en: "Inherited property decisions involve family, legal timelines, and emotional weight. Kasandra has helped families navigate exactly this—with patience and clarity.",
    es: "Las decisiones sobre propiedades heredadas involucran familia, plazos legales y peso emocional. Kasandra ha ayudado a familias a navegar exactamente esto—con paciencia y claridad.",
  },
  divorce: {
    en: "Selling during a separation requires sensitivity, clear communication, and someone who understands the process from all sides.",
    es: "Vender durante una separación requiere sensibilidad, comunicación clara y alguien que entienda el proceso desde todos los ángulos.",
  },
  distressed: {
    en: "When a property needs work and time is limited, having someone who can evaluate your real options makes all the difference.",
    es: "Cuando una propiedad necesita trabajo y el tiempo es limitado, tener a alguien que pueda evaluar sus opciones reales hace toda la diferencia.",
  },
  military: {
    en: "Military transitions come with unique timelines and benefits. Kasandra understands the programs available and how to use them effectively.",
    es: "Las transiciones militares vienen con plazos y beneficios únicos. Kasandra entiende los programas disponibles y cómo usarlos efectivamente.",
  },
  senior: {
    en: "Downsizing or planning for the next chapter is deeply personal. Kasandra provides guidance that respects your pace and priorities.",
    es: "Reducir espacio o planificar el próximo capítulo es profundamente personal. Kasandra ofrece orientación que respeta su ritmo y prioridades.",
  },
};

const DEFAULT_CASH_MARKET_INSIGHT = {
  en: "In Tucson, cash buyer patterns vary by neighborhood and season. Kasandra has evaluated hundreds of cash offers and rejected the ones that didn't serve her clients. She'll do the same for you.",
  es: "En Tucson, los patrones de compradores en efectivo varían por vecindario y temporada. Kasandra ha evaluado cientos de ofertas en efectivo y rechazado las que no beneficiaban a sus clientes. Hará lo mismo por usted.",
};

// ---------------------------------------------------------------------------
// Fallback CTA_CONFIG — used ONLY when registryDestinations is absent
// ---------------------------------------------------------------------------

const CTA_CONFIG: Record<GuideCategory, {
  labelEn: string;
  labelEs: string;
  routeThruSelena: boolean;
  link: string;
}> = {
  buying:    { labelEn: 'Get Clarity on Your Buying Journey',         labelEs: 'Obtenga Claridad sobre Su Proceso de Compra',       routeThruSelena: true,  link: 'selena_chat' },
  selling:   { labelEn: 'Request a Home Value Review',               labelEs: 'Solicitar Revisión de Valor de Vivienda',            routeThruSelena: true,  link: 'selena_chat' },
  valuation: { labelEn: 'Request a Home Value Review',               labelEs: 'Solicitar Revisión de Valor de Vivienda',            routeThruSelena: true,  link: 'selena_chat' },
  cash:      { labelEn: 'Schedule Your Private Cash Review',         labelEs: 'Programe Su Revisión Privada de Efectivo',           routeThruSelena: false, link: '/v2/cash-offer-options' },
  stories:   { labelEn: 'Explore Your Options with Kasandra',        labelEs: 'Explore Sus Opciones con Kasandra',                  routeThruSelena: true,  link: 'selena_chat' },
  probate:   { labelEn: 'Discuss Your Inherited Property Options',   labelEs: 'Converse Sobre Sus Opciones de Propiedad Heredada',  routeThruSelena: true,  link: 'selena_chat' },
  divorce:   { labelEn: 'Talk Through Your Situation',               labelEs: 'Converse Sobre Su Situación',                       routeThruSelena: true,  link: 'selena_chat' },
  distressed:{ labelEn: 'Explore Your Property Options',             labelEs: 'Explore Sus Opciones de Propiedad',                  routeThruSelena: true,  link: 'selena_chat' },
  military:  { labelEn: 'Explore Your Transition Options',           labelEs: 'Explore Sus Opciones de Transición',                 routeThruSelena: true,  link: 'selena_chat' },
  senior:    { labelEn: 'Discuss Your Next Chapter',                 labelEs: 'Converse Sobre Su Próximo Capítulo',                 routeThruSelena: true,  link: 'selena_chat' },
};

const SUBTEXT = {
  en: "A calm, no-pressure conversation to understand your real options.",
  es: "Una conversación tranquila, sin presión, para entender sus opciones reales.",
};

// ---------------------------------------------------------------------------
// Icon resolver for ActionSpec types
// ---------------------------------------------------------------------------

function iconForSpec(spec: ActionSpec) {
  switch (spec.type) {
    case 'open_chat':   return MessageCircle;
    case 'run_calculator':
    case 'open_tool':   return DollarSign;
    case 'book':        return Calendar;
    default:            return ArrowRight;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AuthorityCTABlock = React.forwardRef<HTMLElement, AuthorityCTABlockProps>(({
  category,
  guideTitle,
  isCashGuide = false,
  authorityBridge,
  marketInsight,
  registryDestinations,
}, ref) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { openChat } = useSelenaChat();

  // Framing text — always uses category defaults or overrides (never changes with registry)
  const bridge = authorityBridge ?? DEFAULT_AUTHORITY_BRIDGE[category];
  const insight = isCashGuide ? (marketInsight ?? DEFAULT_CASH_MARKET_INSIGHT) : null;

  // Extract guideId from URL for analytics context
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const guideMatch = currentPath.match(/^\/v2\/guides\/(.+)$/);
  const currentGuideId = guideMatch?.[1];

  useEffect(() => {
    logEvent('guide_authority_cta_view', {
      category,
      guide_title: guideTitle,
      is_cash_guide: isCashGuide,
      source: registryDestinations ? 'registry' : 'cta_config',
    });
  }, [category, guideTitle, isCashGuide, registryDestinations]);

  // ------------------------------------------------------------------
  // Label resolution with 3-tier fallback
  // ------------------------------------------------------------------
  function resolveLabel(spec: ActionSpec): string {
    // 1. Prefer spec.label
    if (spec.label?.en && spec.label?.es) return t(spec.label.en, spec.label.es);
    // 2. Fallback to CTA_CONFIG category label
    const cfg = CTA_CONFIG[category];
    if (cfg) return t(cfg.labelEn, cfg.labelEs);
    // 3. Hard fallback
    return t('Continue', 'Continuar');
  }

  // ------------------------------------------------------------------
  // Render a single action button
  // ------------------------------------------------------------------
  function renderActionButton(
    spec: ActionSpec,
    variant: 'primary' | 'secondary',
    key?: string,
  ) {
    if (!isActionValid(spec)) return null;

    const Icon = iconForSpec(spec);
    const label = resolveLabel(spec);
    const isPrimary = variant === 'primary';

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      logEvent('guide_cta_clicked', {
        guideId: currentGuideId,
        cta_id: `authority_cta_${category}_${spec.type}`,
        category,
        guide_title: guideTitle,
        destination: spec.type,
        source: 'registry',
      });

      if (spec.type === 'open_chat') {
        logCTAClick({
          cta_name: CTA_NAMES.SELENA_ROUTE_CALL,
          destination: 'selena_chat',
          page_path: currentPath,
          intent: category === 'buying' ? 'buy' : 'sell',
        });
      }

      resolveAction(
        spec,
        navigate,
        (payload) => openChat(payload as any),
      );
    };

    return (
      <Button
        key={key}
        type="button"
        size="lg"
        className={
          isPrimary
            ? 'bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-10 py-6 text-base sm:text-lg shadow-gold max-w-full'
            : 'border-2 border-white/30 bg-transparent text-white font-medium rounded-full px-6 sm:px-8 py-5 text-sm sm:text-base hover:bg-white/10 hover:border-white/50 max-w-full'
        }
        onClick={handleClick}
      >
        <Icon className="w-5 h-5 flex-shrink-0 mr-2 sm:mr-3" />
        <span className="text-center">{label}</span>
      </Button>
    );
  }

  // ------------------------------------------------------------------
  // Fallback CTA (old CTA_CONFIG path — used when no registryDestinations)
  // ------------------------------------------------------------------
  function renderFallbackCTA() {
    const cfg = CTA_CONFIG[category];
    const label = t(cfg.labelEn, cfg.labelEs);
    const Icon = cfg.routeThruSelena ? MessageCircle : DollarSign;

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      logEvent('guide_cta_clicked', {
        guideId: currentGuideId,
        cta_id: `authority_cta_${category}`,
        category,
        guide_title: guideTitle,
        destination: cfg.link,
        source: 'cta_config',
      });

      if (cfg.routeThruSelena) {
        logCTAClick({
          cta_name: CTA_NAMES.SELENA_ROUTE_CALL,
          destination: 'selena_chat',
          page_path: currentPath,
          intent: category === 'buying' ? 'buy' : 'sell',
        });
        openChat({
          source: 'guide_handoff',
          guideId: currentGuideId,
          guideTitle,
          guideCategory: category,
          intent: category === 'buying' ? 'buy' : category === 'cash' ? 'cash' : 'sell',
        });
      } else {
        navigate(cfg.link);
      }
    };

    return (
      <Button
        type="button"
        size="lg"
        className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-10 py-6 text-base sm:text-lg shadow-gold max-w-full"
        onClick={handleClick}
      >
        <Icon className="w-5 h-5 flex-shrink-0 mr-2 sm:mr-3" />
        <span className="text-center">{label}</span>
      </Button>
    );
  }

  // ------------------------------------------------------------------
  // Determine which CTAs to render
  // ------------------------------------------------------------------
  const hasRegistryPrimary =
    registryDestinations?.primaryAction &&
    isActionValid(registryDestinations.primaryAction);

  const validSecondaries = (registryDestinations?.secondaryActions ?? [])
    .filter(isActionValid)
    .slice(0, 2);

  return (
    <section ref={ref} className="bg-cc-navy py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center">
          {/* Authority Bridge */}
          <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-6">
            {t(bridge.en, bridge.es)}
          </p>

          {/* Market Insight (cash guides only) */}
          {insight && (
            <p className="text-white/70 text-base leading-relaxed mb-8">
              {t(insight.en, insight.es)}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4">
            {hasRegistryPrimary
              ? renderActionButton(registryDestinations!.primaryAction, 'primary')
              : renderFallbackCTA()
            }

            {validSecondaries.map((spec, i) =>
              renderActionButton(spec, 'secondary', `secondary-${i}`)
            )}
          </div>

          {/* Subtext */}
          <p className="text-white/50 text-sm mt-4">
            {t(SUBTEXT.en, SUBTEXT.es)}
          </p>
        </div>
      </div>
    </section>
  );
});

AuthorityCTABlock.displayName = 'AuthorityCTABlock';

export default AuthorityCTABlock;
