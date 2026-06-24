import { Link, useNavigate } from "react-router-dom";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import JsonLd from "@/components/seo/JsonLd";
import { realEstateAgentSchema, localBusinessSchema } from "@/lib/seo/schemaGenerators";
import { useLanguage } from "@/contexts/LanguageContext";
import V2Layout from "@/components/v2/V2Layout";
import TrustBar from "@/components/v2/TrustBar";
import { lazy, Suspense } from "react";
import KasandraPortrait from "@/components/v2/KasandraPortrait";
const LazyGoogleReviews = lazy(() => import("@/components/v2/GoogleReviewsSection"));

import {
  Home,
  ArrowRight,
  DollarSign,
  Banknote,
  Eye,
  ShieldCheck,
  BookOpen,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import kasandraHeadshot from "@/assets/kasandra/desert-landscape-mountains.webp";

const LazyGlassmorphismHero = lazy(() => import("@/components/v2/hero/GlassmorphismHero"));

const HeroSkeleton = () => (
  <div className="min-h-[85dvh] bg-cc-navy flex items-center justify-center">
    <div className="container mx-auto px-4 max-w-3xl space-y-5">
      <div className="h-12 w-3/4 rounded bg-white/10 animate-pulse mx-auto" />
      <div className="h-12 w-2/3 rounded bg-white/10 animate-pulse mx-auto" />
      <div className="h-5 w-1/2 rounded bg-white/10 animate-pulse mx-auto" />
      <div className="h-12 w-48 rounded-full bg-white/10 animate-pulse mx-auto mt-8" />
    </div>
  </div>
);
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { updateSessionContext } from '@/lib/analytics/selenaSession';
import SelenaShowcase from "@/components/v2/SelenaShowcase";

const V2HomeContent = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { openChat } = useSelenaChat();
  useDocumentHead({
    titleEn: "Tucson Real Estate | Kasandra Prieto — Bilingual REALTOR® & Concierge",
    titleEs: "Bienes Raíces en Tucson | Kasandra Prieto — REALTOR® Bilingüe y Concierge",
    descriptionEn: "Tucson real estate agent serving Pima County. Cash offers, market listings, buyer guidance, and 24/7 AI concierge — bilingual service in English & Spanish.",
    descriptionEs: "Agente de bienes raíces en Tucson sirviendo Pima County. Ofertas en efectivo, listados, orientación de compra y asistente IA 24/7 — servicio bilingüe.",
  });

  return (
    <>
      <JsonLd data={realEstateAgentSchema()} />
      <JsonLd data={localBusinessSchema()} />

      {/* 1. Hero — calm, focused */}
      <Suspense fallback={<HeroSkeleton />}>
        <LazyGlassmorphismHero
          showMarketPulse={false}
          hideBadge
          hideRightCard
          hideSoftSelena
          primaryLabel={t("Book a Consultation", "Agendar una Cita")}
          primaryLink="/book?intent=explore&source=home_hero"
          secondaryLabel={t("Start With Selena", "Empieza con Selena")}
          secondaryIcon={<BookOpen className="w-5 h-5" />}
          secondaryOnClick={() => openChat({ source: 'home_hero' })}
          helperLine={t(
            "Ready to talk? Book a call. Not sure yet? Start with Selena — no pressure.",
            "¿Listo para hablar? Agenda una llamada. ¿No estás seguro? Empieza con Selena — sin presión."
          )}
        />
      </Suspense>

      {/* 2. Calm proof strip */}
      <TrustBar />

      {/* 3. Choose Your Path */}
      <section className="bg-cc-sand py-14 lg:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-center text-[12px] font-semibold uppercase tracking-widest text-cc-navy/50 mb-2">
            {t("Step 1 · Choose your path", "Paso 1 · Elige tu camino")}
            <span className="mx-2 text-cc-navy/30">·</span>
            {t("Step 2 · Share context", "Paso 2 · Comparte contexto")}
            <span className="mx-2 text-cc-navy/30">·</span>
            {t("Step 3 · Connect with Kasandra", "Paso 3 · Conecta con Kasandra")}
          </p>
          <h2 className="text-center font-serif text-3xl md:text-4xl font-bold text-cc-navy mb-8">
            {t("Where are you starting?", "¿Dónde estás empezando?")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => { updateSessionContext({ intent: 'buy' }); navigate('/buy'); }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-cc-navy/10 bg-white px-6 py-8 shadow-sm text-center transition-all duration-200 hover:border-cc-gold hover:shadow-[0_0_0_3px_rgba(225,181,74,0.15)] focus:outline-none focus:ring-2 focus:ring-cc-gold"
            >
              <Home className="w-7 h-7 text-cc-gold" />
              <p className="font-semibold text-cc-navy text-base">
                {t("I'm Looking to Buy", "Quiero Comprar")}
              </p>
            </button>

            <button
              onClick={() => { updateSessionContext({ intent: 'sell' }); navigate('/sell'); }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-cc-navy/10 bg-white px-6 py-8 shadow-sm text-center transition-all duration-200 hover:border-cc-gold hover:shadow-[0_0_0_3px_rgba(225,181,74,0.15)] focus:outline-none focus:ring-2 focus:ring-cc-gold"
            >
              <DollarSign className="w-7 h-7 text-cc-gold" />
              <p className="font-semibold text-cc-navy text-base">
                {t("I'm Thinking About Selling", "Estoy Pensando en Vender")}
              </p>
            </button>

            <button
              onClick={() => { updateSessionContext({ intent: 'cash' }); navigate('/cash-offer-options'); }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-cc-navy/10 bg-white px-6 py-8 shadow-sm text-center transition-all duration-200 hover:border-cc-gold hover:shadow-[0_0_0_3px_rgba(225,181,74,0.15)] focus:outline-none focus:ring-2 focus:ring-cc-gold"
            >
              <Banknote className="w-7 h-7 text-cc-gold" />
              <p className="font-semibold text-cc-navy text-base">
                {t("I Want to Compare Cash Options", "Quiero Comparar Opciones en Efectivo")}
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Meet Selena */}
      <SelenaShowcase />

      {/* 5. About Kasandra */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <KasandraPortrait
              src={kasandraHeadshot}
              alt="Kasandra Prieto, REALTOR®"
              size="lg"
              className="flex-shrink-0"
            />
            <div className="text-center sm:text-left">
              <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
                {t("About Kasandra", "Sobre Kasandra")}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-blue mt-2 mb-3">
                {t("Your Best Friend in Real Estate", "Tu Mejor Amiga en Bienes Raíces")}
              </h2>
              <p className="text-cc-text-muted mb-4">
                {t(
                  "20+ year Tucson resident. Bilingual REALTOR®, radio host, community leader, and dog mom. I didn't get into real estate to sell houses — I got in to help families.",
                  "Residente de Tucson por más de 20 años. REALTOR® bilingüe, conductora de radio, líder comunitaria y mamá perruna. No entré a bienes raíces para vender casas — entré para ayudar a familias."
                )}
              </p>
              <Link
                to="/about"
                className="inline-flex items-center text-cc-gold font-semibold hover:gap-3 gap-2 transition-all"
              >
                {t("Learn more about Kasandra", "Conoce más sobre Kasandra")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Client proof / reviews */}
      <Suspense fallback={<div className="h-64 bg-cc-sand/50 animate-pulse" />}>
        <LazyGoogleReviews />
      </Suspense>

      {/* 7. Cash Options / Corner Connect Advantage */}
      <section className="bg-cc-navy py-16 lg:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
              {t("The Corner Connect Advantage", "La Ventaja de Corner Connect")}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
              {t("More Than the MLS", "Más Allá del MLS")}
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              {t(
                "Through Corner Connect, Kasandra can compare a traditional listing, a cash-offer path, and off-market options — so you can decide what fits your timing.",
                "A través de Corner Connect, Kasandra puede comparar una venta tradicional, una oferta en efectivo y opciones fuera del mercado — para que decidas lo que mejor se ajusta a tu tiempo."
              )}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-cc-gold/20 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-cc-gold" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {t("Off-Market Access", "Acceso Fuera del Mercado")}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {t(
                  "Some properties sell before they're ever listed. Corner Connect's network surfaces inventory most buyers never see.",
                  "Algunas propiedades se venden antes de ser listadas. La red de Corner Connect muestra inventario que la mayoría de compradores nunca ve."
                )}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-cc-gold/20 flex items-center justify-center mb-4">
                <Banknote className="w-6 h-6 text-cc-gold" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {t("Cash-Offer Options", "Opciones en Efectivo")}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {t(
                  "Cash-offer programs can simplify certain situations, but every option has tradeoffs. Kasandra helps you compare paths side-by-side.",
                  "Los programas de oferta en efectivo pueden simplificar ciertas situaciones, pero cada opción tiene compensaciones. Kasandra te ayuda a comparar caminos lado a lado."
                )}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-cc-gold/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-cc-gold" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {t("Difficult Situations", "Situaciones Difíciles")}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {t(
                  "Facing a tough decision about your property? Kasandra works through options that protect your equity — with discretion and care.",
                  "¿Enfrentas una decisión difícil sobre tu propiedad? Kasandra evalúa opciones que protegen tu patrimonio — con discreción y cuidado."
                )}
              </p>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-white/50 max-w-2xl mx-auto">
            {t(
              "Cash-offer terms, fees, inspection requirements, and closing costs vary by buyer/program and should be reviewed before making a decision.",
              "Los términos, comisiones, requisitos de inspección y costos de cierre de las ofertas en efectivo varían según el comprador/programa y deben revisarse antes de tomar una decisión."
            )}
          </p>
          <div className="text-center mt-8">
            <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 py-3">
              <Link to="/cash-offer-options">
                {t("Compare your options", "Compara tus opciones")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 8. Tucson buyer/seller resources teaser */}
      <section className="py-16 lg:py-20 bg-cc-sand">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
              {t("Resources", "Recursos")}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mt-2">
              {t("Tucson Buyer & Seller Resources", "Recursos para Compradores y Vendedores en Tucson")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link to="/guides" className="group rounded-2xl bg-white border border-cc-navy/10 p-6 hover:border-cc-gold transition-all">
              <BookOpen className="w-6 h-6 text-cc-gold mb-3" />
              <h3 className="font-semibold text-cc-navy mb-1">{t("Guides", "Guías")}</h3>
              <p className="text-sm text-cc-charcoal/70">{t("Plain-English walkthroughs", "Explicaciones claras")}</p>
            </Link>
            <Link to="/neighborhoods" className="group rounded-2xl bg-white border border-cc-navy/10 p-6 hover:border-cc-gold transition-all">
              <MapPin className="w-6 h-6 text-cc-gold mb-3" />
              <h3 className="font-semibold text-cc-navy mb-1">{t("Neighborhoods", "Vecindarios")}</h3>
              <p className="text-sm text-cc-charcoal/70">{t("Explore Tucson areas", "Explora áreas de Tucson")}</p>
            </Link>
            <Link to="/market" className="group rounded-2xl bg-white border border-cc-navy/10 p-6 hover:border-cc-gold transition-all">
              <Home className="w-6 h-6 text-cc-gold mb-3" />
              <h3 className="font-semibold text-cc-navy mb-1">{t("Market Intel", "Mercado")}</h3>
              <p className="text-sm text-cc-charcoal/70">{t("Local market signals", "Señales del mercado local")}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mb-4">
            {t("Ready when you are.", "Lista cuando tú lo estés.")}
          </h2>
          <p className="text-cc-charcoal/70 mb-8">
            {t(
              "Book a no-pressure consultation with Kasandra, or start a conversation with Selena anytime — in English or Spanish.",
              "Agenda una consulta sin presión con Kasandra, o empieza una conversación con Selena en cualquier momento — en inglés o español."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 py-6">
              <Link to="/book">
                <Calendar className="w-4 h-4 mr-2" />
                {t("Book a Consultation", "Agendar una Cita")}
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => openChat({ source: 'home_final_cta' })}
              className="border-2 border-cc-navy/20 text-cc-navy hover:bg-cc-navy hover:text-white rounded-full px-8 py-6 font-semibold"
            >
              {t("Start With Selena", "Empieza con Selena")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

const V2Home = () => (
  <V2Layout>
    <V2HomeContent />
  </V2Layout>
);

export default V2Home;
