import { ArrowRight, MessageCircle, BookOpen, TrendingUp, Clock, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { useMarketPulse } from "@/hooks/useMarketPulse";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import { isReturningVisitor, getIntent, getGuidesRead } from "@/lib/guides/personalization";
import { getStoredUserName } from "@/lib/analytics/bridgeLeadIdToV2";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-bg.jpg";
import type { EntrySource } from "@/contexts/selena/types";

interface StatItemProps {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const StatItem = ({ value, label, icon }: StatItemProps) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-cc-gold/10 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-lg font-bold text-cc-ivory">{value}</p>
      <p className="text-xs text-cc-ivory/60">{label}</p>
    </div>
  </div>
);

export interface GlassmorphismHeroProps {
  /** Badge text override */
  badge?: string;
  /** Headline override (disables returning-visitor logic) */
  headline?: string;
  /** Subtext override (disables returning-visitor logic) */
  subtext?: string;
  /** Primary CTA label override */
  primaryLabel?: string;
  /** Secondary CTA label override */
  secondaryLabel?: string;
  /** Secondary CTA link override */
  secondaryLink?: string;
  /** Secondary CTA icon override */
  secondaryIcon?: React.ReactNode;
  /** Intent for analytics & openChat */
  intent?: string;
  /** Entry source for openChat */
  entrySource?: EntrySource;
  /** Page path for analytics */
  pagePath?: string;
  /** Background image override */
  backgroundImage?: string;
}

export default function GlassmorphismHero({
  badge,
  headline: headlineOverride,
  subtext: subtextOverride,
  primaryLabel: primaryLabelOverride,
  secondaryLabel: secondaryLabelOverride,
  secondaryLink: secondaryLinkOverride,
  secondaryIcon,
  intent: intentOverride,
  entrySource,
  pagePath = "/",
  backgroundImage,
}: GlassmorphismHeroProps = {}) {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  const { stats } = useMarketPulse(language as "en" | "es");

  const [returningContext, setReturningContext] = useState<{
    isReturning: boolean;
    firstName: string | null;
    intent: string | null;
    guidesReadCount: number;
  }>({ isReturning: false, firstName: null, intent: null, guidesReadCount: 0 });

  useEffect(() => {
    const isRet = isReturningVisitor();
    if (!isRet) return;
    const fullName = getStoredUserName();
    const firstName = fullName ? fullName.split(" ")[0] : null;
    const intent = getIntent() || null;
    const guidesReadCount = getGuidesRead().length;
    setReturningContext({ isReturning: true, firstName, intent, guidesReadCount });
  }, []);

  const resolvedIntent = intentOverride || returningContext.intent || "explore";

  const handleTalkToSelena = () => {
    logCTAClick({
      cta_name: CTA_NAMES.SELENA_ROUTE_CALL,
      destination: "selena_chat",
      page_path: pagePath,
      intent: resolvedIntent as any,
    });
    openChat({
      source: entrySource || (returningContext.isReturning ? "hero_returning" : "hero"),
      intent: resolvedIntent as any,
    });
  };

  // Use overrides if provided, otherwise fall back to returning-visitor logic
  const useOverrides = !!headlineOverride;

  const headline = useOverrides
    ? headlineOverride!
    : returningContext.isReturning
    ? returningContext.firstName
      ? t(`Welcome back, ${returningContext.firstName}.`, `Bienvenido/a de nuevo, ${returningContext.firstName}.`)
      : t("Welcome back.", "Bienvenido/a de nuevo.")
    : t(
        "Your Tucson Home. Your Decision. Your Clarity.",
        "Tu hogar en Tucson. Tu decisión. Tu claridad."
      );

  const subtext = useOverrides
    ? subtextOverride || ""
    : returningContext.isReturning
    ? returningContext.intent === "sell" || returningContext.intent === "cash"
      ? t(
          "Ready to take the next step? Selena can pull up your numbers, answer questions, or get you on Kasandra's calendar.",
          "¿Lista/o para el siguiente paso? Selena puede ver tus números, responder preguntas o agendarte con Kasandra."
        )
      : returningContext.intent === "buy"
      ? t(
          "Your search continues. Ask Selena anything about listings, neighborhoods, or next steps — she's ready.",
          "Tu búsqueda continúa. Pregúntale a Selena sobre propiedades, vecindarios o próximos pasos — está lista."
        )
      : returningContext.guidesReadCount > 0
      ? t(
          "You've been doing your research. Whenever you're ready to talk through your options, Selena's here.",
          "Has estado investigando. Cuando estés lista/o para hablar de tus opciones, Selena está aquí."
        )
      : t(
          "Good to see you again. Selena is ready whenever you are.",
          "Que bueno verte de nuevo. Selena está lista cuando tú estés."
        )
    : t(
        "Kasandra Prieto guides buyers, sellers, and families through every move with expertise, honesty, and an AI concierge built for you.",
        "Kasandra Prieto guía a compradores, vendedores y familias en cada mudanza con experiencia, honestidad y un asistente de IA diseñado para ti."
      );

  const primaryLabel = primaryLabelOverride
    || (returningContext.isReturning
      ? t("Continue with Selena", "Continuar con Selena")
      : t("Talk to Selena", "Habla con Selena"));

  const secondaryLabel = secondaryLabelOverride
    || (returningContext.isReturning
      && (returningContext.intent === "sell" || returningContext.intent === "cash")
      ? t("Find My Best Path", "Encontrar Mi Mejor Camino")
      : t("Explore Guides", "Explorar Guías"));

  const secondaryLink = secondaryLinkOverride
    || (returningContext.isReturning
      && (returningContext.intent === "sell" || returningContext.intent === "cash")
      ? "/seller-decision"
      : "/guides");

  const badgeText = badge || t("Tucson's Bilingual Concierge Agent", "La Agente Concierge Bilingüe de Tucson");

  return (
    <section className="relative min-h-[85dvh] md:min-h-[100dvh] flex items-center w-full overflow-hidden" role="banner">
      {/* Scoped keyframes */}
      <style>{`
        @keyframes heroFadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-in {
          animation: heroFadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .hero-delay-100 { animation-delay: 0.1s; }
        .hero-delay-200 { animation-delay: 0.2s; }
        .hero-delay-300 { animation-delay: 0.3s; }
        .hero-delay-400 { animation-delay: 0.4s; }
        .hero-delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* Background image + navy overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage || heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cc-navy/95 via-cc-navy/85 to-cc-navy-dark/90" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 pt-20 pb-10 md:pt-24 md:pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column — copy */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="hero-fade-in hero-delay-100 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cc-gold/30 bg-cc-gold/10 text-cc-gold text-xs font-semibold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                {badgeText}
              </span>
            </div>

            {/* Headline */}
            <h1 className="hero-fade-in hero-delay-200 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-cc-ivory leading-[1.1] mb-6">
              {headline}
            </h1>

            {/* Subtext */}
            <p className="hero-fade-in hero-delay-300 text-base sm:text-lg text-cc-ivory/70 leading-relaxed mb-8 max-w-lg">
              {subtext}
            </p>

            {/* CTA buttons */}
            <div className="hero-fade-in hero-delay-400 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleTalkToSelena}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-cc-gold text-cc-navy font-semibold text-base shadow-gold hover:bg-cc-gold-dark hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cc-gold/50 focus:ring-offset-2 focus:ring-offset-cc-navy"
              >
                <MessageCircle className="w-5 h-5" />
                {primaryLabel}
              </button>

              <Link
                to={secondaryLink}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-cc-ivory/25 text-cc-ivory font-medium text-base hover:bg-cc-ivory/10 hover:border-cc-ivory/40 transition-all duration-200"
              >
                {secondaryIcon || <BookOpen className="w-5 h-5" />}
                {secondaryLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right column — glassmorphism stats card */}
          <div className="hero-fade-in hero-delay-500 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-cc-gold/10 rounded-3xl blur-2xl" />

              {/* Glass card */}
              <div className="relative rounded-2xl border border-cc-ivory/10 bg-cc-navy-light/40 backdrop-blur-xl p-6 shadow-luxury">
                {/* Card header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-cc-gold/20 flex items-center justify-center">
                    <Home className="w-5 h-5 text-cc-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-cc-ivory">
                      {t("Tucson Market Pulse", "Pulso del Mercado de Tucson")}
                    </p>
                    <p className="text-xs text-cc-ivory/50">
                      {stats.verifiedDate
                        ? stats.verifiedDate
                        : t("Latest data", "Datos recientes")}
                    </p>
                  </div>
                  {stats.isLive && (
                    <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-cc-ivory/10 mb-5" />

                {/* Stats */}
                <div className="space-y-5">
                  <StatItem
                    icon={<TrendingUp className="w-5 h-5 text-cc-gold" />}
                    value={stats.saleToListRatio}
                    label={t("Sale-to-List Ratio", "Relación Venta/Lista")}
                  />
                  <StatItem
                    icon={<Clock className="w-5 h-5 text-cc-gold" />}
                    value={`${stats.daysOnMarket} ${t("days", "días")}`}
                    label={t("Median Days on Market", "Días Mediana en el Mercado")}
                  />
                  <StatItem
                    icon={<Home className="w-5 h-5 text-cc-gold" />}
                    value={`$${stats.holdingCostPerDay}/${t("day", "día")}`}
                    label={t("Holding Cost Per Day", "Costo Diario de Retención")}
                  />
                </div>

                {/* Divider */}
                <div className="h-px bg-cc-ivory/10 my-5" />

                {/* Footer tag */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {t("Data-Driven", "Datos en Tiempo Real")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cc-gold/10 text-cc-gold text-xs font-medium">
                    <TrendingUp className="w-3 h-3" />
                    {t("PREMIUM", "PREMIUM")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
