import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useMarketPulse } from "@/hooks/useMarketPulse";
import { logEvent } from "@/lib/analytics/logEvent";
import { setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { getLeadId } from "@/lib/analytics/bridgeLeadIdToV2";
import {
  TrendingUp, Clock, DollarSign, BarChart2, Calendar,
  Signal, SignalZero, MessageCircle, ArrowRight, RefreshCw
} from "lucide-react";

const V2MarketIntelligenceContent = () => {
  const { t, language } = useLanguage();
  const { openChat } = useSelenaChat();
  const { stats: pulseStats, isLive, loading } = useMarketPulse(language);

  useDocumentHead({
    titleEn: "Tucson Real Estate Market Intelligence | Current Market Data",
    titleEs: "Inteligencia del Mercado Inmobiliario de Tucson | Datos del Mercado Actual",
    descriptionEn: "Live Tucson housing market data — days on market, sale-to-list ratio, holding costs, and what it means for buyers and sellers right now.",
    descriptionEs: "Datos en vivo del mercado de Tucson — días en mercado, precio vs. lista, costos de espera, y qué significa para compradores y vendedores.",
  });

  useEffect(() => {
    setFieldIfEmpty('intent', 'explore');
    logEvent('page_view', { page: '/market', tool: 'market_intelligence' });
  }, []);

  const dom = pulseStats.daysOnMarket;
  const saleToListPct = pulseStats.saleToListRatio;
  const holdingCost = pulseStats.holdingCostPerDay;
  const prepCost = pulseStats.prepAvg;
  const verifiedDate = pulseStats.verifiedDate;

  const sellerImplication =
    dom <= 20 ? t("Fast-moving market — well-priced homes are moving quickly.", "Mercado activo — casas bien valuadas se están vendiendo rápido.")
    : dom <= 45 ? t("Balanced market — pricing and presentation matter most.", "Mercado equilibrado — el precio y la presentación son clave.")
    : t("Buyer's market — positioning and condition drive results.", "Mercado de compradores — posicionamiento y condición son determinantes.");

  const buyerImplication =
    dom <= 20 ? t("Competitive — pre-approval and quick decisions help.", "Competitivo — pre-aprobación y decisiones rápidas son útiles.")
    : dom <= 45 ? t("Room to be selective — do your due diligence.", "Hay margen para ser selectivo — haga su debida diligencia.")
    : t("Good selection — more negotiating room available.", "Buena selección — más margen para negociar.");

  const stats = [
    {
      icon: Clock,
      label: t("Days on Market", "Días en Mercado"),
      value: loading ? "—" : `${dom}`,
      unit: t("days", "días"),
      context: t("Median time from list to accepted offer", "Tiempo mediano de lista a oferta aceptada"),
      color: "cc-navy",
    },
    {
      icon: TrendingUp,
      label: t("Sale-to-List Ratio", "Precio vs. Lista"),
      value: loading ? "—" : saleToListPct,
      unit: "",
      context: t("What homes are actually selling for vs. asking price", "Lo que las casas realmente venden vs. precio pedido"),
      color: "cc-navy",
    },
    {
      icon: DollarSign,
      label: t("Daily Holding Cost", "Costo Diario de Espera"),
      value: loading ? "—" : `$${holdingCost}`,
      unit: t("/ day", "/ día"),
      context: t("Avg. mortgage + taxes + insurance per day unsold", "Prom. hipoteca + impuestos + seguro por día sin vender"),
      color: "cc-navy",
    },
    {
      icon: BarChart2,
      label: t("Market-Ready Prep Avg", "Costo Prom. de Preparación"),
      value: loading ? "—" : `$${prepCost.toLocaleString()}`,
      unit: "",
      context: t("Typical spend to prepare for traditional listing", "Gasto típico para preparar una venta tradicional"),
      color: "cc-navy",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-cc-navy py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            {isLive ? (
              <>
                <Signal className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  {t("Live Data", "Datos en Vivo")}
                  {verifiedDate && ` · ${verifiedDate}`}
                </span>
              </>
            ) : (
              <>
                <SignalZero className="w-4 h-4 text-cc-gold/60" />
                <span className="text-cc-gold/60 text-sm">{t("Tucson market averages", "Promedios del mercado de Tucson")}</span>
              </>
            )}
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            {t("Tucson Market", "Mercado de Tucson")}
            <span className="block text-cc-gold">{t("Intelligence", "Inteligencia")}</span>
          </h1>
          <p className="text-white/75 text-lg md:text-xl max-w-2xl leading-relaxed">
            {t(
              "What the numbers actually say — and what they mean for your next move.",
              "Lo que dicen los números — y qué significan para tu próxima decisión."
            )}
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-14 bg-cc-ivory">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid sm:grid-cols-2 gap-5">
            {stats.map(({ icon: Icon, label, value, unit, context }) => (
              <div key={label} className="bg-white rounded-2xl border border-cc-sand-dark/30 shadow-soft p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cc-sand flex items-center justify-center">
                    <Icon className="w-5 h-5 text-cc-navy" />
                  </div>
                  <span className="text-xs font-semibold text-cc-slate uppercase tracking-wider">{label}</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="font-serif text-4xl font-bold text-cc-navy">{value}</span>
                  {unit && <span className="text-cc-slate text-sm">{unit}</span>}
                </div>
                <p className="text-cc-text-muted text-sm leading-relaxed">{context}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-cc-slate/60 mt-4">
            {t(
              "Pima County-wide data. Individual neighborhoods and price ranges vary — Kasandra can walk you through specifics.",
              "Datos del Condado de Pima. Los vecindarios y rangos de precio individuales varían — Kasandra puede orientarte en los detalles."
            )}
          </p>
        </div>
      </section>

      {/* What It Means */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-3xl font-bold text-cc-navy mb-8 text-center">
            {t("What This Means For You", "Qué Significa Para Ti")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sellers */}
            <div className="bg-cc-sand rounded-2xl p-6 border border-cc-sand-dark/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-cc-navy flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-serif text-lg font-bold text-cc-navy">{t("For Sellers", "Para Vendedores")}</h3>
              </div>
              <p className="text-cc-charcoal leading-relaxed mb-4">{sellerImplication}</p>
              <ul className="space-y-2 text-sm text-cc-charcoal">
                <li className="flex items-start gap-2">
                  <span className="text-cc-gold font-bold mt-0.5">·</span>
                  {t(
                    `At ${dom} days on market, every day without an offer costs ~$${holdingCost}`,
                    `Con ${dom} días en mercado, cada día sin oferta cuesta ~$${holdingCost}`
                  )}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cc-gold font-bold mt-0.5">·</span>
                  {t(
                    `Cash offers skip the ${dom}-day clock entirely`,
                    `Las ofertas en efectivo evitan los ${dom} días por completo`
                  )}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cc-gold font-bold mt-0.5">·</span>
                  {t(
                    `Traditional listing prep averages $${prepCost.toLocaleString()} upfront`,
                    `Preparación para venta tradicional promedia $${prepCost.toLocaleString()} por adelantado`
                  )}
                </li>
              </ul>
            </div>
            {/* Buyers */}
            <div className="bg-cc-sand rounded-2xl p-6 border border-cc-sand-dark/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-cc-navy flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-serif text-lg font-bold text-cc-navy">{t("For Buyers", "Para Compradores")}</h3>
              </div>
              <p className="text-cc-charcoal leading-relaxed mb-4">{buyerImplication}</p>
              <ul className="space-y-2 text-sm text-cc-charcoal">
                <li className="flex items-start gap-2">
                  <span className="text-cc-gold font-bold mt-0.5">·</span>
                  {t(
                    `Homes are closing at ~${saleToListPct} of list price on average`,
                    `Las casas cierran a ~${saleToListPct} del precio de lista en promedio`
                  )}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cc-gold font-bold mt-0.5">·</span>
                  {t(
                    "Pre-approval strengthens your position in any market condition",
                    "La pre-aprobación fortalece tu posición en cualquier condición de mercado"
                  )}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cc-gold font-bold mt-0.5">·</span>
                  {t(
                    "Off-market properties bypass this timeline entirely",
                    "Las propiedades fuera del mercado evitan este cronograma por completo"
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Market Timing Context */}
      <section className="py-14 bg-cc-ivory">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-cc-navy rounded-2xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-cc-gold" />
              <span className="text-cc-gold text-sm font-semibold uppercase tracking-wider">
                {t("Real Talk", "Realidad del Mercado")}
              </span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">
              {t("Data tells one story. Your situation tells another.", "Los datos cuentan una historia. Tu situación cuenta otra.")}
            </h3>
            <p className="text-white/75 leading-relaxed mb-6 max-w-2xl">
              {t(
                "Tucson-wide averages are a useful starting point — but your ZIP, price range, and property condition each shift the picture. Kasandra looks at all three before she advises on timing.",
                "Los promedios de Tucson son un buen punto de partida — pero tu código postal, rango de precio y condición de la propiedad cambian el panorama. Kasandra analiza los tres antes de orientarte sobre el momento."
              )}
            </p>
            <Button
              onClick={() => openChat({ source: 'market_intelligence', intent: 'explore' })}
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("Ask Selena About My Market", "Preguntarle a Selena Sobre Mi Mercado")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Data Freshness */}
      <section className="py-8 bg-white border-t border-cc-sand-dark/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 text-cc-slate text-sm">
            <RefreshCw className="w-4 h-4" />
            <span>
              {isLive && verifiedDate
                ? t(`Market data updated ${verifiedDate} via Redfin Tucson.`, `Datos del mercado actualizados ${verifiedDate} vía Redfin Tucson.`)
                : t("Market data is refreshed weekly via Redfin Tucson.", "Los datos del mercado se actualizan semanalmente vía Redfin Tucson.")}
              {" "}
              {t(
                "All figures are estimates — not guarantees. Kasandra can explain what current conditions mean for your specific property.",
                "Todas las cifras son estimaciones — no garantías. Kasandra puede explicar qué significan las condiciones actuales para tu propiedad específica."
              )}
            </span>
          </div>
        </div>
      </section>
    </>
  );
};

const V2MarketIntelligence = () => (
  <V2Layout>
    <V2MarketIntelligenceContent />
  </V2Layout>
);

export default V2MarketIntelligence;
