import { useEffect, useState, lazy, Suspense } from "react";
import JsonLd from "@/components/seo/JsonLd";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import TestimonialCard from "@/components/v2/TestimonialCard";
import { sellerTestimonials } from "@/data/testimonials";
const GoogleReviewsSection = lazy(() => import("@/components/v2/GoogleReviewsSection"));
import { Shield, TrendingUp, FileText, Handshake, AlertCircle, ArrowRight, Zap, DollarSign, Users, Star, Home, Wrench, Network, Clock, Calendar, BarChart3, MessageCircle, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import { logEvent } from "@/lib/analytics/logEvent";
import FeaturedGuideCard from "@/components/v2/shared/FeaturedGuideCard";
import { useNavigate } from "react-router-dom";
import { getStoredUserName } from "@/lib/analytics/bridgeLeadIdToV2";
import GlassmorphismHero from "@/components/v2/hero/GlassmorphismHero";
import heroSellBg from "@/assets/hero-sell-tucson-aerial.png";
import JourneyBreadcrumb from "@/components/v2/JourneyBreadcrumb";
import StickyMobileBookingBar from "@/components/v2/StickyMobileBookingBar";


const PAGE_PATH = '/sell';
const PAGE_INTENT = 'sell' as const;

const V2SellContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const navigate = useNavigate();
  const [leadName, setLeadName] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState("");
  useDocumentHead({
    titleEn: "Tucson Home Selling | Cash Offer & Traditional Listing — Kasandra Prieto",
    titleEs: "Venta de Casas en Tucson | Oferta en Efectivo y Venta Tradicional — Kasandra Prieto",
    descriptionEn: "Tucson home selling options — cash offer review, traditional listing, and market-based pricing. Bilingual REALTOR® serving Pima County with 20+ years of experience.",
    descriptionEs: "Opciones de venta de casas en Tucson — ofertas en efectivo, listado tradicional y precios de mercado. REALTOR® bilingüe con 20+ años en Pima County.",
  });

  useEffect(() => {
    setFieldIfEmpty('intent', 'sell');
    const stored = getStoredUserName();
    if (stored) setLeadName(stored.split(' ')[0]);
  }, []);

  const handleCTAClick = (cta_name: string, destination: string) => {
    logCTAClick({ cta_name, destination, page_path: PAGE_PATH, intent: PAGE_INTENT });
  };

  const handleSelenaRoute = () => {
    handleCTAClick(CTA_NAMES.SELENA_ROUTE_CALL, 'selena_chat');
    openChat({ source: 'hero', intent: 'sell' });
  };

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Tucson Home Selling Services",
        "description": "Full-service home selling in Tucson and Pima County — traditional listing, cash offer options, and bilingual REALTOR® representation.",
        "provider": {
          "@type": "RealEstateAgent",
          "name": "Kasandra Prieto, REALTOR®",
          "url": "https://kasandraprietorealtor.com",
          "telephone": "+15203493248",
          "areaServed": ["Tucson, AZ", "Pima County, AZ"],
          "knowsLanguage": ["en", "es"]
        },
        "areaServed": {
          "@type": "Place",
          "name": "Tucson, AZ and Pima County"
        },
        "serviceType": "Real Estate Listing and Cash Offer Services"
      }} />
      {/* Hero */}
      <GlassmorphismHero
        badge={t("For Sellers", "Para Vendedores")}
        headline={t("Selling Your Home? I'll Make Sure You Know Exactly Where You Stand.", "¿Vendiendo Tu Casa? Me Aseguraré de Que Sepas Exactamente Dónde Estás.")}
        subtext={t(
          "I help Tucson sellers price right, time the market, and close with confidence — plus you get a 24/7 AI concierge that works while you sleep.",
          "Ayudo a vendedores en Tucson a fijar el precio correcto, aprovechar el mercado y cerrar con confianza — además tienes un asistente de IA 24/7 que trabaja mientras duermes."
        )}
        primaryLabel={t("Talk to Selena", "Habla con Selena")}
        secondaryLabel={t("Seller Readiness Quiz", "Quiz de Preparación para Vender")}
        secondaryLink="/seller-readiness"
        intent="sell"
        entrySource="sell_hero"
        pagePath="/sell"
        backgroundImage={heroSellBg}
      />

      {/* Journey Progress — visible only to returning users */}
      <section className="py-4">
        <div className="container mx-auto px-4 max-w-3xl">
          <JourneyBreadcrumb />
        </div>
      </section>

      {/* Address-First Entry — Quick Valuation CTA */}
      <section className="bg-gradient-to-b from-cc-navy/5 to-transparent py-8">
        <div className="container mx-auto px-4 max-w-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!addressInput.trim()) return;
              handleCTAClick('sell_address_entry', '/home-valuation');
              logEvent('seller_address_entry_submitted', { address: addressInput.trim() });
              navigate(`/home-valuation?address=${encodeURIComponent(addressInput.trim())}`);
            }}
            className="flex flex-col sm:flex-row gap-3 items-stretch"
          >
            <div className="flex-1 relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cc-charcoal/40" />
              <Input
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder={t("Enter your address for a free estimate…", "Ingrese su dirección para un estimado gratis…")}
                className="pl-10 h-12 border-cc-sand-dark/40 bg-white rounded-full text-sm"
              />
            </div>
            <Button
              type="submit"
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full h-12 px-6 whitespace-nowrap"
            >
              {t("Get My Estimate", "Obtener Estimado")}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
          <p className="text-center text-xs text-cc-charcoal/50 mt-2">
            {t("Free, no obligation. Takes 60 seconds.", "Gratis, sin compromiso. Toma 60 segundos.")}
          </p>
        </div>
      </section>

      {/* Cash Offer Highlight — Corner Connect */}
      <section className="bg-gradient-to-br from-cc-navy via-cc-navy to-cc-navy/95 py-14">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white/5 border border-cc-gold/30 rounded-2xl p-8 md:p-10 text-center">
            <span className="inline-block bg-cc-gold/20 text-cc-gold font-semibold text-xs tracking-wider uppercase px-4 py-1.5 rounded-full mb-4">
              {t("Corner Connect Exclusive", "Exclusivo de Corner Connect")}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">
              {t("Need to sell fast? Let me show you what a real cash offer looks like.", "¿Necesitas vender rápido? Déjame mostrarte cómo luce una oferta en efectivo real.")}
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <span className="flex items-center gap-2 text-white/80 text-sm">
                <Check className="w-4 h-4 text-cc-gold" />
                {t("No fees", "Sin comisiones")}
              </span>
              <span className="flex items-center gap-2 text-white/80 text-sm">
                <Check className="w-4 h-4 text-cc-gold" />
                {t("We cover closing costs", "Cubrimos costos de cierre")}
              </span>
              <span className="flex items-center gap-2 text-white/80 text-sm">
                <Check className="w-4 h-4 text-cc-gold" />
                {t("No inspections", "Sin inspecciones")}
              </span>
              <span className="flex items-center gap-2 text-white/80 text-sm">
                <Check className="w-4 h-4 text-cc-gold" />
                {t("Close on your timeline", "Cierra en tu tiempo")}
              </span>
            </div>
            <p className="text-white/60 text-sm max-w-xl mx-auto mb-8">
              {t(
                "Whether you're relocating, going through a life change, or just need certainty — Corner Connect's cash-offer program gives you a clean, stress-free path to close.",
                "Ya sea que te estés reubicando, pasando por un cambio de vida, o simplemente necesites certeza — el programa de oferta en efectivo de Corner Connect te da un camino limpio y sin estrés para cerrar."
              )}
            </p>
            <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 py-3">
              <Link
                to="/cash-offer-options?source=sell_hub_cash"
                onClick={() => handleCTAClick('sell_cash_offer_request', '/cash-offer-options')}
              >
                {t("See your cash offer options", "Conoce tus opciones de oferta en efectivo")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How I Protect Sellers — 2-column layout */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Left: Title + description + numbered steps */}
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mb-4">
                {t("How I Protect Your Interests", "Cómo Protejo Sus Intereses")}
              </h2>
              <p className="text-cc-charcoal mb-8 max-w-lg">
                {t(
                  "My approach is centered on your protection and informed decision-making at every stage.",
                  "Mi enfoque está centrado en su protección y toma de decisiones informada en cada etapa."
                )}
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="text-cc-gold font-serif text-2xl font-bold">01</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-cc-navy">
                      {t("Strategic Analysis", "Análisis Estratégico")}
                    </h3>
                    <p className="text-sm text-cc-charcoal">
                      {t(
                        "Market-based pricing strategy using current data and comparable sales in your area.",
                        "Estrategia de precios basada en datos actuales del mercado y ventas comparables en su área."
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-cc-gold font-serif text-2xl font-bold">02</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-cc-navy">
                      {t("Risk Mitigation", "Mitigación de Riesgos")}
                    </h3>
                    <p className="text-sm text-cc-charcoal">
                      {t(
                        "Full disclosure support and offer reliability assessment to protect you throughout.",
                        "Apoyo completo de divulgación y evaluación de confiabilidad de ofertas para protegerle."
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="text-cc-gold font-serif text-2xl font-bold">03</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-cc-navy">
                      {t("Expert Execution", "Ejecución Experta")}
                    </h3>
                    <p className="text-sm text-cc-charcoal">
                      {t(
                        "Skilled negotiation and professional marketing to maximize your outcome.",
                        "Negociación hábil y marketing profesional para maximizar su resultado."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 2x2 card grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl text-center border border-cc-sand-dark/30 shadow-soft">
                <TrendingUp className="w-10 h-10 text-cc-navy mx-auto mb-4" />
                <h3 className="font-serif text-base font-bold text-cc-navy mb-2">
                  {t("Market-Based Pricing", "Precios Basados en el Mercado")}
                </h3>
                <p className="text-xs text-cc-charcoal">
                  {t("Data-driven pricing strategy", "Estrategia de precios basada en datos")}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center border border-cc-sand-dark/30 shadow-soft">
                <Shield className="w-10 h-10 text-cc-navy mx-auto mb-4" />
                <h3 className="font-serif text-base font-bold text-cc-navy mb-2">
                  {t("Offer Reliability", "Confiabilidad de Ofertas")}
                </h3>
                <p className="text-xs text-cc-charcoal">
                  {t("Assess each offer's strength", "Evaluar la fortaleza de cada oferta")}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center border border-cc-sand-dark/30 shadow-soft">
                <FileText className="w-10 h-10 text-cc-navy mx-auto mb-4" />
                <h3 className="font-serif text-base font-bold text-cc-navy mb-2">
                  {t("Disclosure Guidance", "Orientación de Divulgación")}
                </h3>
                <p className="text-xs text-cc-charcoal">
                  {t("Full transaction protection", "Protección completa de transacción")}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center border border-cc-sand-dark/30 shadow-soft">
                <Handshake className="w-10 h-10 text-cc-navy mx-auto mb-4" />
                <h3 className="font-serif text-base font-bold text-cc-navy mb-2">
                  {t("Negotiation Support", "Apoyo en Negociación")}
                </h3>
                <p className="text-xs text-cc-charcoal">
                  {t("Your interests always first", "Sus intereses siempre primero")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seller Planning Tools Strip */}
      <section className="bg-white border-b border-cc-sand-dark/20 py-6">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-xs font-semibold text-cc-navy/50 uppercase tracking-wider text-center mb-4">
            {t("Seller Planning Tools", "Herramientas de Planificación")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/market"
              onClick={() => handleCTAClick('sell_tool_market', '/market')}
              className="flex flex-col items-center gap-2 bg-cc-ivory hover:bg-cc-sand rounded-xl border border-cc-sand-dark/30 hover:border-cc-navy/20 px-4 py-3.5 transition-all text-center"
            >
              <TrendingUp className="w-5 h-5 text-cc-gold" />
              <span className="text-xs font-semibold text-cc-navy leading-tight">
                {t("Market Data", "Datos del Mercado")}
              </span>
            </Link>
            <Link
              to="/seller-timeline"
              onClick={() => handleCTAClick('sell_tool_timeline', '/seller-timeline')}
              className="flex flex-col items-center gap-2 bg-cc-ivory hover:bg-cc-sand rounded-xl border border-cc-sand-dark/30 hover:border-cc-navy/20 px-4 py-3.5 transition-all text-center"
            >
              <Clock className="w-5 h-5 text-cc-gold" />
              <span className="text-xs font-semibold text-cc-navy leading-tight">
                {t("Selling Timeline", "Cronograma de Venta")}
              </span>
            </Link>
            <Link
              to="/cash-offer-options"
              onClick={() => handleCTAClick('sell_tool_calculator', '/cash-offer-options')}
              className="flex flex-col items-center gap-2 bg-cc-ivory hover:bg-cc-sand rounded-xl border border-cc-sand-dark/30 hover:border-cc-navy/20 px-4 py-3.5 transition-all text-center"
            >
              <DollarSign className="w-5 h-5 text-cc-gold" />
              <span className="text-xs font-semibold text-cc-navy leading-tight">
                {t("Cash vs. Listing", "Efectivo vs. Listado")}
              </span>
            </Link>
            <Link
              to="/home-valuation"
              onClick={() => handleCTAClick('sell_tool_valuation', '/home-valuation')}
              className="flex flex-col items-center gap-2 bg-cc-ivory hover:bg-cc-sand rounded-xl border border-cc-sand-dark/30 hover:border-cc-navy/20 px-4 py-3.5 transition-all text-center"
            >
              <BarChart3 className="w-5 h-5 text-cc-gold" />
              <span className="text-xs font-semibold text-cc-navy leading-tight">
                {t("Home Valuation", "Valoración de Casa")}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Guide */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <FeaturedGuideCard
              guideId="selling-for-top-dollar"
              titleEn="Selling Your Home for Top Dollar"
              titleEs="Vender Su Casa al Mejor Precio"
              descriptionEn="A comprehensive guide to maximizing your home's value—from preparation to pricing strategy to closing."
              descriptionEs="Una guía completa para maximizar el valor de su casa—desde la preparación hasta la estrategia de precios hasta el cierre."
              readTimeEn="8 min read"
              readTimeEs="8 min de lectura"
              ctaSource="v2_sell_featured"
            />
          </div>
        </div>
      </section>

      {/* Seller Testimonials */}
      <section className="py-12 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-2 border border-cc-sand-dark/30">
              <TestimonialCard testimonial={sellerTestimonials[0]} variant="primary" />
            </div>
            <TestimonialCard testimonial={sellerTestimonials[1]} variant="secondary" />
          </div>
        </div>
      </section>

      {/* Google Reviews — Social Proof */}
      <Suspense fallback={null}><GoogleReviewsSection /></Suspense>

      {/* Your Selling Options — Premium Split-Panel Comparison */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
              {t("The Choice Is Yours", "La Decisión Es Suya")}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mt-2">
              {t("Your Selling Options", "Sus Opciones de Venta")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* LEFT — List on the Market */}
            <div className="bg-cc-navy border-t-4 border-cc-gold rounded-2xl p-8 transition-all duration-200 hover:scale-[1.01] hover:shadow-luxury flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <span className="bg-cc-gold/20 text-cc-gold text-xs font-semibold px-3 py-1 rounded-full">
                  {t("Maximum Value", "Máximo Valor")}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-7 h-7 text-cc-gold" />
                <h3 className="font-serif text-xl font-bold text-white">
                  {t("List on the Market", "Listado en el Mercado")}
                </h3>
              </div>
              <p className="text-white/60 text-sm mb-6">Via Realty Executives Arizona Territory</p>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{t("30–60 days typical", "30–60 días típico")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{t("Full market competition drives price up", "La competencia del mercado sube el precio")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{t("Thousands of qualified buyers see your home", "Miles de compradores calificados ven tu casa")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{t("Kasandra negotiates every offer for you", "Kasandra negocia cada oferta por ti")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{t("Global Luxury certified representation", "Representación certificada Global Luxury")}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => {
                  handleCTAClick('sell_comparison_traditional', 'selena_chat');
                  openChat({ source: 'sell_comparison_traditional', intent: 'sell' });
                }}
                className="text-cc-gold hover:text-cc-gold/80 hover:bg-cc-gold/10 font-semibold mt-2 px-4 py-2"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("Ask Selena about listing", "Pregúntale a Selena sobre listar")}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {/* RIGHT — Cash Offer via Corner Connect */}
            <div className="bg-cc-ivory border-t-4 border-cc-charcoal rounded-2xl p-8 transition-all duration-200 hover:scale-[1.01] hover:shadow-luxury flex flex-col border border-cc-sand-dark/30">
              <div className="flex items-center gap-3 mb-5">
                <span className="bg-cc-charcoal/10 text-cc-navy text-xs font-semibold px-3 py-1 rounded-full">
                  {t("Fastest Close", "Cierre Más Rápido")}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-7 h-7 text-cc-navy" />
                <h3 className="font-serif text-xl font-bold text-cc-navy">
                  {t("Cash Offer", "Oferta en Efectivo")}
                </h3>
              </div>
              <p className="text-cc-charcoal/60 text-sm mb-6">Via Corner Connect Buyer Network</p>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-cc-charcoal">{t("Close in 7–14 days", "Cierra en 7–14 días")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-cc-charcoal">{t("Certain close, no financing contingencies", "Cierre seguro, sin contingencias de financiamiento")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-cc-charcoal">{t("No showings, no open houses", "Sin visitas, sin casas abiertas")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Wrench className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-cc-charcoal">{t("As-is — no repairs required", "Como está — sin reparaciones requeridas")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Network className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-cc-charcoal">{t("Kasandra's vetted buyer network", "Red de compradores verificados de Kasandra")}</span>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full border-cc-navy text-cc-navy hover:bg-cc-navy hover:text-white font-semibold rounded-full"
                onClick={() => handleCTAClick(CTA_NAMES.CASH_OFFER_OPTIONS, '/cash-offer-options')}
              >
                <Link to="/cash-offer-options">
                  {t("See My Cash Options", "Ver Mis Opciones en Efectivo")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Bottom Callout */}
          <div className="max-w-5xl mx-auto mt-8">
            <div className="bg-cc-sand rounded-xl py-6 px-8 text-center">
              <p className="text-cc-charcoal text-sm max-w-2xl mx-auto mb-3">
                {t(
                  "Not sure which path is right for you? Kasandra reviews both options with every seller — you decide with full information.",
                  "¿No estás segura de qué camino es el correcto? Kasandra revisa ambas opciones con cada vendedor — tú decides con información completa."
                )}
              </p>
              <button
                onClick={() => {
                  handleCTAClick('sell_comparison_undecided', 'selena_chat');
                  openChat({ source: 'sell_comparison_undecided', intent: 'sell' });
                }}
                className="text-cc-gold hover:text-cc-gold-dark font-semibold text-sm transition-colors inline-flex items-center gap-1"
              >
                {t("Get Kasandra's Recommendation", "Obtén la Recomendación de Kasandra")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 pb-24 sm:pb-16 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
            {t("Ready to Sell?", "¿Listo para Vender?")}
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            {t(
              "Let's discuss your home and create a selling strategy that works for your situation.",
              "Hablemos sobre su casa y creemos una estrategia de venta que funcione para su situación."
            )}
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button 
              asChild
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 py-3 text-sm sm:px-10 sm:py-6 sm:text-lg shadow-gold"
            >
              <Link
                to="/book?intent=sell&source=sell_hub_bottom"
                onClick={() => logCTAClick({ cta_name: 'sell_hub_book_call', destination: '/book', page_path: '/sell', intent: 'sell' })}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t("Book a Strategy Call", "Agenda una Llamada de Estrategia")}
              </Link>
            </Button>
            <button
              onClick={handleSelenaRoute}
              className="inline-flex items-center gap-2 text-cc-gold hover:text-cc-gold/80 text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t("Not ready? Talk to Selena first", "¿No estás listo? Habla con Selena primero")}
            </button>
          </div>
        </div>
      </section>

      {/* Important Note */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-cc-ivory rounded-xl p-8 shadow-soft max-w-3xl mx-auto border border-cc-sand-dark/30">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-cc-gold flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl font-bold text-cc-navy mb-3">
                  {t("Important Note", "Nota Importante")}
                </h3>
                <p className="text-cc-charcoal">
                  {t(
                    "I provide real estate guidance and market expertise. For specific legal or tax questions, I recommend consulting with qualified professionals in those fields. My role is to guide you through the real estate process with clarity and care.",
                    "Proporciono orientación inmobiliaria y experiencia de mercado. Para preguntas legales o fiscales específicas, recomiendo consultar con profesionales calificados en esos campos. Mi rol es guiarle a través del proceso inmobiliario con claridad y cuidado."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <StickyMobileBookingBar intent="sell" source="sell_hub_sticky" />
      
    </>
  );
};

const V2Sell = () => (
  <V2Layout suppressCTA>
    <V2SellContent />
  </V2Layout>
);

export default V2Sell;
