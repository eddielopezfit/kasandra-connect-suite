import { Link, useNavigate } from "react-router-dom";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import JsonLd from "@/components/seo/JsonLd";
import { realEstateAgentSchema, localBusinessSchema } from "@/lib/seo/schemaGenerators";
import { useLanguage } from "@/contexts/LanguageContext";
import V2Layout from "@/components/v2/V2Layout";
import TrustBar from "@/components/v2/TrustBar";
import { lazy, Suspense, useState } from "react";
const TestimonialColumns = lazy(() => import("@/components/v2/TestimonialColumns"));
const LazyHomepageNeighborhoodCards = lazy(() => import("@/components/v2/neighborhood/HomepageNeighborhoodCards"));
const LazyInstantAnswerWidget = lazy(() => import("@/components/v2/calculator/InstantAnswerWidget"));
const LazyGoogleReviews = lazy(() => import("@/components/v2/GoogleReviewsSection"));
import {
  Home,
  Shield,
  Clock,
  Users,
  Mic,
  Heart,
  HeartHandshake,
  Star,
  MessageCircle,
  Calendar,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Banknote,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import kasandraHeadshot from "@/assets/kasandra-headshot.jpg";
import kasandraLifestyle from "@/assets/kasandra-lifestyle.jpg";
import brandPhotoshoot from "@/assets/kasandra/brand-photoshoot-red-door.jpg";
import GlassmorphismHero from "@/components/v2/hero/GlassmorphismHero";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { updateSessionContext, getSessionContext } from '@/lib/analytics/selenaSession';
import JourneyBreadcrumb from "@/components/v2/JourneyBreadcrumb";
import { useJourneyProgress } from "@/hooks/useJourneyProgress";
import SelenaShowcase from "@/components/v2/SelenaShowcase";

const V2HomeContent = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { openChat } = useSelenaChat();
  const progress = useJourneyProgress();
  const ctx = getSessionContext();
  const isAdFunnelUser = !!ctx?.ad_funnel_source;
  const [ytLoaded, setYtLoaded] = useState(false);
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
      {/* Hero Section */}
      <GlassmorphismHero showMarketPulse={false} />

      {/* Journey Progress — returning users see their accumulated state */}
      {progress.isReturningUser && (
        <section className="py-4 bg-cc-sand">
          <div className="container mx-auto px-4 max-w-3xl">
            <JourneyBreadcrumb />
          </div>
        </section>
      )}

      {/* Buyer / Seller Fork */}
      <section className="bg-cc-sand py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-cc-navy/50 mb-6">
            {isAdFunnelUser && !progress.isReturningUser
              ? t("Welcome — your results are ready to explore", "Bienvenido — tus resultados están listos para explorar")
              : progress.isReturningUser
              ? t("Welcome back — continue where you left off", "Bienvenido de nuevo — continúa donde lo dejaste")
              : t("Where are you in your journey?", "¿En qué etapa estás?")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card A — Buyer */}
            <button
              onClick={() => {
                updateSessionContext({ intent: 'buy' });
                navigate('/buy');
              }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-cc-navy/10 bg-white px-6 py-8 shadow-sm text-left transition-all duration-200 hover:border-cc-gold hover:shadow-[0_0_0_3px_rgba(225,181,74,0.15)] focus:outline-none focus:ring-2 focus:ring-cc-gold"
            >
              <Home className="w-7 h-7 text-cc-gold" />
              <div>
                <p className="font-semibold text-cc-navy text-base leading-snug">
                  {t("I'm looking to buy", "Quiero comprar")}
                </p>
                <p className="text-sm text-cc-charcoal/60 mt-1">
                  {t("Get your free buying game plan", "Obtén tu plan gratuito de compra")}
                </p>
              </div>
            </button>

            {/* Card B — Seller */}
            <button
              onClick={() => {
                updateSessionContext({ intent: 'sell' });
                navigate('/sell');
              }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-cc-navy/10 bg-white px-6 py-8 shadow-sm text-left transition-all duration-200 hover:border-cc-gold hover:shadow-[0_0_0_3px_rgba(225,181,74,0.15)] focus:outline-none focus:ring-2 focus:ring-cc-gold"
            >
              <DollarSign className="w-7 h-7 text-cc-gold" />
              <div>
                <p className="font-semibold text-cc-navy text-base leading-snug">
                  {t("I'm looking to sell", "Quiero vender")}
                </p>
                <p className="text-sm text-cc-charcoal/60 mt-1">
                  {t("Find out your home's real value", "Descubre el valor real de tu casa")}
                </p>
              </div>
            </button>

            {/* Card C — Cash Offer */}
            <button
              onClick={() => {
                updateSessionContext({ intent: 'cash' });
                navigate('/cash-offer-options');
              }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-cc-navy/10 bg-white px-6 py-8 shadow-sm text-left transition-all duration-200 hover:border-cc-gold hover:shadow-[0_0_0_3px_rgba(225,181,74,0.15)] focus:outline-none focus:ring-2 focus:ring-cc-gold"
            >
              <Banknote className="w-7 h-7 text-cc-gold" />
              <div>
                <p className="font-semibold text-cc-navy text-base leading-snug">
                  {t("I want a cash offer", "Quiero una oferta en efectivo")}
                </p>
                <p className="text-sm text-cc-charcoal/60 mt-1">
                  {t("Close in days, skip the showings", "Cierra en días, sin visitas")}
                </p>
              </div>
            </button>
          </div>
          {/* Explore path for undecided users */}
          <div className="text-center mt-4">
            <button
              onClick={() => {
                updateSessionContext({ intent: 'explore' as any });
                openChat({ source: 'homepage_explore' });
              }}
              className="text-sm text-cc-charcoal/60 hover:text-cc-navy transition-colors underline underline-offset-4 decoration-cc-gold/40 hover:decoration-cc-gold"
            >
              {t("Not sure yet? Let Selena help you figure it out →", "¿No estás seguro? Deja que Selena te ayude →")}
            </button>
          </div>
        </div>
      </section>

      {/* Selena Prompt Banner */}
      <div className="bg-cc-navy py-3 px-4">
        <div className="container mx-auto max-w-3xl flex items-center justify-between gap-4 flex-wrap">
          <p className="text-white/80 text-sm">
            {t(
              "Have a quick question? Selena is available right now.",
              "¿Tienes una pregunta rápida? Selena está disponible ahora."
            )}
          </p>
          <button
            onClick={() => openChat({ source: 'homepage_banner' })}
            className="text-cc-gold text-sm font-semibold whitespace-nowrap hover:underline flex items-center gap-1"
          >
            <MessageCircle className="w-4 h-4" />
            {t("Ask Selena →", "Pregúntale a Selena →")}
          </button>
        </div>
      </div>

      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
              {t("Run the Numbers", "Haz los Números")}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mt-2">
              {t("Check Your Buying Power", "Descubre Tu Poder de Compra")}
            </h2>
          </div>
          <Suspense fallback={<div className="h-64 bg-cc-sand/50 rounded-2xl animate-pulse" />}>
            <LazyInstantAnswerWidget />
          </Suspense>
        </div>
      </section>


      {/* About Section */}
      <section className="py-16 lg:py-24 bg-cc-sand">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Desktop Layout (2-column) */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Video Card */}
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-cc-sand-dark/30">
              <p className="text-sm text-cc-gold font-semibold mb-4 uppercase tracking-wider text-center">
                {t("Meet Kasandra (60 seconds)", "Conoce a Kasandra (60 segundos)")}
              </p>
              <div 
                className="relative rounded-xl overflow-hidden bg-cc-navy/10 mx-auto"
                style={{ width: '100%', maxWidth: '280px', aspectRatio: '9/16' }}
              >
                <video
                  src="/videos/kasandra-welcome.mp4"
                  controls
                  playsInline
                  preload="none"
                  poster={kasandraHeadshot}
                  className="w-full h-full object-contain bg-cc-navy"
                  style={{ aspectRatio: '9/16' }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-xs text-cc-text-muted mt-4 italic text-center max-w-[280px] mx-auto">
                {t(
                  "Kasandra shares why she got into real estate and her commitment to guiding clients.",
                  "Kasandra comparte por qué entró en bienes raíces y su compromiso de guiar a sus clientes."
                )}
              </p>
            </div>

            {/* Right Column - Copy + Images */}
            <div>
              <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
                {t("About Kasandra", "Sobre Kasandra")}
              </span>
              <h2 className="font-serif text-4xl xl:text-5xl font-bold text-cc-blue mt-2 mb-6">
                {t("Your Best Friend in Real Estate", "Tu Mejor Amiga en Bienes Raíces")}
              </h2>
              <div className="space-y-4 text-cc-text-muted mb-6">
                <p>
                  {t(
                    "I didn't get into real estate to sell houses — I got in to help families make one of the biggest decisions of their lives with someone they actually trust.",
                    "No entré a bienes raíces para vender casas — entré para ayudar a las familias a tomar una de las decisiones más grandes de su vida con alguien en quien realmente confían."
                  )}
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t("VP, Governing Board — Arizona Diaper Bank", "VP, Junta Directiva — Arizona Diaper Bank")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t("Greater Tucson Leadership — Class of 2026", "Greater Tucson Leadership — Promoción 2026")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('Host of "Lifting You Up: Todo empieza en casita" (Urbana 92.5 FM)', 'Conductora de "Lifting You Up: Todo empieza en casita" (Urbana 92.5 FM)')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t("Luxury Property Specialist", "Especialista en Propiedades de Lujo")}</span>
                  </li>
                </ul>
              </div>

              {/* Image row */}
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={kasandraHeadshot}
                  alt="Kasandra Prieto, REALTOR®"
                  className="w-full h-40 object-cover object-top rounded-xl shadow-soft border border-cc-sand-dark/20"
                  loading="lazy"
                />
                <img
                  src={kasandraLifestyle}
                  alt={t("Kasandra Prieto, bilingual REALTOR® and community leader in Tucson.", "Kasandra Prieto, REALTOR® bilingüe y líder comunitaria en Tucson.")}
                  className="w-full h-40 object-cover object-center rounded-xl shadow-soft border border-cc-sand-dark/20"
                  loading="lazy"
                />
              </div>
              
              <p className="text-xs text-cc-text-muted text-center mt-4">
                {t("Dog mom · Karaoke lover · Community-driven", "Mamá perruna · Amante del karaoke · Comprometida con la comunidad")}
              </p>
            </div>
          </div>

          {/* Tablet Layout (768-1023px) */}
          <div className="hidden md:block lg:hidden">
            <div className="text-center mb-8">
              <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
                {t("About Kasandra", "Sobre Kasandra")}
              </span>
              <h2 className="font-serif text-4xl font-bold text-cc-blue mt-2 mb-4">
                {t("Your Best Friend in Real Estate", "Tu Mejor Amiga en Bienes Raíces")}
              </h2>
              <p className="text-cc-text-muted max-w-2xl mx-auto">
                {t(
                  "I didn't get into real estate to sell houses — I got in to help families make one of the biggest decisions of their lives with someone they actually trust.",
                  "No entré a bienes raíces para vender casas — entré para ayudar a las familias a tomar una de las decisiones más grandes de su vida con alguien en quien realmente confían."
                )}
              </p>
            </div>

            {/* Video - Local MP4 */}
            <div className="mb-8 flex flex-col items-center">
              <p className="text-sm text-cc-gold font-semibold mb-3 uppercase tracking-wider text-center">
                {t("Meet Kasandra (60 seconds)", "Conoce a Kasandra (60 segundos)")}
              </p>
              <div 
                className="relative rounded-xl overflow-hidden shadow-elevated bg-cc-navy" 
                style={{ width: '240px', aspectRatio: '9/16' }}
              >
                <video
                  src="/videos/kasandra-welcome.mp4"
                  controls
                  playsInline
                  preload="none"
                  poster={kasandraHeadshot}
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Bullets */}
            <ul className="space-y-3 max-w-xl mx-auto mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted">{t("VP, Governing Board — Arizona Diaper Bank", "VP, Junta Directiva — Arizona Diaper Bank")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted">{t("Greater Tucson Leadership — Class of 2026", "Greater Tucson Leadership — Promoción 2026")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted">{t('Host of "Lifting You Up: Todo empieza en casita" (Urbana 92.5 FM)', 'Conductora de "Lifting You Up: Todo empieza en casita" (Urbana 92.5 FM)')}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted">{t("Luxury Property Specialist", "Especialista en Propiedades de Lujo")}</span>
              </li>
            </ul>

            {/* Headshot */}
            <div className="flex justify-center">
              <img
                src={kasandraHeadshot}
                alt="Kasandra Prieto, REALTOR®"
                className="w-64 rounded-xl shadow-elevated border border-cc-sand-dark/20"
                loading="lazy"
              />
            </div>
          </div>

          {/* Mobile Layout (<=767px) */}
          <div className="md:hidden">
            <div className="text-center mb-6">
              <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
                {t("About Kasandra", "Sobre Kasandra")}
              </span>
              <h2 className="font-serif text-3xl font-bold text-cc-blue mt-2 mb-4">
                {t("Your Best Friend in Real Estate", "Tu Mejor Amiga en Bienes Raíces")}
              </h2>
            </div>

            {/* Headshot first on mobile */}
            <div className="flex justify-center mb-6">
              <img
                src={kasandraHeadshot}
                alt="Kasandra Prieto, REALTOR®"
                className="w-48 rounded-xl shadow-elevated border border-cc-sand-dark/20"
                loading="lazy"
              />
            </div>

            {/* Short paragraph */}
            <p className="text-cc-text-muted text-center mb-6">
              {t(
                "A proud Tucson resident for over two decades. Fluent in English and Spanish, I bring warmth, clarity, and expertise to every client.",
                "Orgullosa residente de Tucson por más de dos décadas. Hablo inglés y español con fluidez, aportando calidez y experiencia a cada cliente."
              )}
            </p>

            {/* Video - Local MP4 */}
            <div className="mb-6 flex flex-col items-center">
              <p className="text-sm text-cc-gold font-semibold mb-2 uppercase tracking-wider text-center">
                {t("Meet Kasandra (60 seconds)", "Conoce a Kasandra (60 segundos)")}
              </p>
              <div 
                className="relative rounded-xl overflow-hidden shadow-elevated bg-cc-navy" 
                style={{ width: '200px', aspectRatio: '9/16' }}
              >
                <video
                  src="/videos/kasandra-welcome.mp4"
                  controls
                  playsInline
                  preload="none"
                  poster={kasandraHeadshot}
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Bullets */}
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted text-sm">{t("VP, Governing Board — Arizona Diaper Bank", "VP, Junta Directiva — Arizona Diaper Bank")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted text-sm">{t("Greater Tucson Leadership — Class of 2026", "Greater Tucson Leadership — Promoción 2026")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted text-sm">{t('"Lifting You Up: Todo empieza en casita" (Urbana 92.5 FM)', '"Lifting You Up: Todo empieza en casita" (Urbana 92.5 FM)')}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted text-sm">{t("Luxury Property Specialist", "Especialista en Propiedades de Lujo")}</span>
              </li>
            </ul>

            {/* Lifestyle photo smaller on mobile */}
            <div className="flex justify-center">
              <img
                src={kasandraLifestyle}
                alt={t("Kasandra Prieto in Tucson", "Kasandra Prieto en Tucson")}
                className="w-48 h-48 object-cover rounded-xl shadow-soft border border-cc-sand-dark/20"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <TrustBar />

      {/* Services Section - Header Band */}
      <section className="py-16 lg:py-20 bg-cc-blue-bg">
        <div className="container mx-auto px-4">
          {/* Section Header with Blue Band */}
          <div className="bg-cc-blue rounded-xl p-8 mb-12 text-center">
            <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
              {t("How I Help", "Cómo Puedo Ayudarle")}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mt-2">
              {t("Real Estate Services", "Servicios de Bienes Raíces")}
            </h2>
          </div>

          {/* Cards Container */}
          <div className="bg-cc-sand rounded-2xl p-6 md:p-10 shadow-soft">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Buyers */}
              <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-elevated transition-all group">
                <div className="w-14 h-14 bg-cc-blue/10 group-hover:bg-cc-gold rounded-full flex items-center justify-center mb-6 transition-colors">
                  <Home className="w-7 h-7 text-cc-blue group-hover:text-cc-navy transition-colors" />
                </div>
                <h3 className="font-serif text-xl font-bold text-cc-blue mb-4">
                  {t("For Buyers", "Para Compradores")}
                </h3>
                <ul className="space-y-2 text-sm text-cc-text-muted mb-6">
                  <li>• {t("Financing clarity and guidance", "Claridad y orientación sobre financiamiento")}</li>
                  <li>• {t("Down payment assistance partners", "Socios de asistencia para pago inicial")}</li>
                  <li>• {t("Step-by-step buying process", "Proceso de compra paso a paso")}</li>
                  <li>• {t("Bilingual support throughout", "Apoyo bilingüe durante todo el proceso")}</li>
                </ul>
                <Link to="/buy" className="inline-flex items-center text-cc-gold font-semibold hover:gap-3 gap-2 transition-all">
                  {t("See how I help buyers", "Descubre cómo ayudo a compradores")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Sellers */}
              <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-elevated transition-all group">
                <div className="w-14 h-14 bg-cc-blue/10 group-hover:bg-cc-gold rounded-full flex items-center justify-center mb-6 transition-colors">
                  <Shield className="w-7 h-7 text-cc-blue group-hover:text-cc-navy transition-colors" />
                </div>
                <h3 className="font-serif text-xl font-bold text-cc-blue mb-4">
                  {t("For Sellers", "Para Vendedores")}
                </h3>
                <ul className="space-y-2 text-sm text-cc-text-muted mb-6">
                  <li>• {t("Market-based pricing strategy", "Estrategia de precios basada en el mercado")}</li>
                  <li>• {t("Offer reliability assessment", "Evaluación de confiabilidad de ofertas")}</li>
                  <li>• {t("Full disclosure guidance", "Orientación sobre divulgaciones")}</li>
                  <li>• {t("Protection-first approach", "Enfoque en protección")}</li>
                </ul>
                <Link to="/sell" className="inline-flex items-center text-cc-gold font-semibold hover:gap-3 gap-2 transition-all">
                  {t("See how I protect sellers", "Descubre cómo protejo a vendedores")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Cash Offer Options */}
              <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-elevated transition-all group">
                <div className="w-14 h-14 bg-cc-blue/10 group-hover:bg-cc-gold rounded-full flex items-center justify-center mb-6 transition-colors">
                  <Clock className="w-7 h-7 text-cc-blue group-hover:text-cc-navy transition-colors" />
                </div>
                <h3 className="font-serif text-xl font-bold text-cc-blue mb-4">
                  {t("Cash Offer Options", "Opciones de Oferta en Efectivo")}
                </h3>
                <ul className="space-y-2 text-sm text-cc-text-muted mb-6">
                  <li>• {t("Compare cash vs traditional listing", "Compare efectivo vs venta tradicional")}</li>
                  <li>• {t("Understand all your options", "Comprenda todas sus opciones")}</li>
                  <li>• {t("Risk awareness guidance", "Orientación sobre riesgos")}</li>
                  <li>• {t("No pressure, just clarity", "Sin presión, solo claridad")}</li>
                </ul>
                <Link to="/cash-offer-options" className="inline-flex items-center text-cc-gold font-semibold hover:gap-3 gap-2 transition-all">
                  {t("Understand your options", "Entiende tus opciones")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Selena — Brand Asset */}
      <SelenaShowcase />

      {/* Neighborhood Cards */}
      <Suspense fallback={<div className="h-64 bg-cc-sand/50 animate-pulse" />}>
        <LazyHomepageNeighborhoodCards />
      </Suspense>

      {/* Social Proof — Testimonials + Google Reviews */}
      <Suspense fallback={<div className="h-64 bg-cc-ivory animate-pulse" />}>
        <TestimonialColumns />
      </Suspense>

      <Suspense fallback={null}>
        <LazyGoogleReviews />
      </Suspense>

      {/* Corner Connect Advantage — Strategic Positioning */}
      <section className="bg-cc-navy py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
              {t("The Corner Connect Advantage", "La Ventaja de Corner Connect")}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
              {t("Access Properties Others Can't Show You", "Accede a Propiedades que Otros No Pueden Mostrarte")}
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              {t(
                "Most agents only show you what's on the MLS. Through Corner Connect, Kasandra has access to off-market inventory, cash-offer solutions, and investment opportunities that never hit public listings.",
                "La mayoría de los agentes solo te muestran lo que está en el MLS. A través de Corner Connect, Kasandra tiene acceso a inventario fuera del mercado, soluciones de oferta en efectivo y oportunidades de inversión que nunca llegan a listados públicos."
              )}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-cc-gold/20 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-cc-gold" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {t("Off-Market Properties", "Propiedades Fuera del Mercado")}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {t(
                  "Properties that sell before they're ever listed. Corner Connect's network gives you first access to inventory most buyers never see.",
                  "Propiedades que se venden antes de ser listadas. La red de Corner Connect te da primer acceso a inventario que la mayoría de compradores nunca ve."
                )}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-cc-gold/20 flex items-center justify-center mb-4">
                <Banknote className="w-6 h-6 text-cc-gold" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {t("Cash Offer Solutions", "Soluciones de Oferta en Efectivo")}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {t(
                  "Need to sell fast? No stress, no fees, we cover closing costs, no inspections required. A real solution for sellers who need speed and certainty.",
                  "¿Necesitas vender rápido? Sin estrés, sin comisiones, cubrimos costos de cierre, sin inspecciones requeridas. Una solución real para vendedores que necesitan rapidez y certeza."
                )}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-cc-gold/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-cc-gold" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {t("Distressed Property Solutions", "Soluciones para Propiedades en Dificultad")}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {t(
                  "Behind on payments? Facing a difficult situation with your property? Kasandra specializes in finding solutions that protect your equity and your future — with discretion and care.",
                  "¿Atrasado en pagos? ¿Enfrentando una situación difícil con tu propiedad? Kasandra se especializa en encontrar soluciones que protejan tu patrimonio y tu futuro — con discreción y cuidado."
                )}
              </p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 py-3">
              <Link to="/off-market?source=homepage_corner_connect">
                {t("See what's available off-market", "Descubre lo que hay fuera del mercado")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Podcast Section */}
      <section className="py-16 lg:py-20 bg-cc-blue-bg">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
                {t("Podcast & Radio", "Podcast y Radio")}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-blue mt-2 mb-6">
                {t("Lifting You Up with Kasandra Prieto", "Lifting You Up con Kasandra Prieto")}
              </h2>
              <p className="text-cc-text-muted mb-6">
                {t(
                  "Join me every Saturday at 9:30 AM on Urbana 92.5 FM, or catch episodes on YouTube. We discuss community leaders, generational wealth, Hispanic leadership stories, and more.",
                  "Acompáñeme cada sábado a las 9:30 AM en Urbana 92.5 FM, o vea los episodios en YouTube. Discutimos sobre líderes comunitarios, riqueza generacional, historias de liderazgo hispano, y más."
                )}
              </p>
              <div className="flex items-center gap-4 mb-6">
                <Mic className="w-8 h-8 text-cc-gold" />
                <div>
                  <p className="font-semibold text-cc-blue">Urbana 92.5 FM</p>
                  <p className="text-sm text-cc-text-muted">{t("Saturdays 9:30 AM", "Sábados 9:30 AM")}</p>
                </div>
              </div>
              <Link to="/podcast" className="inline-flex items-center text-cc-gold font-semibold hover:gap-3 gap-2 transition-all">
                {t("Explore Podcast", "Explorar Podcast")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-elevated">
              <div className="aspect-video rounded-lg overflow-hidden relative">
                {ytLoaded ? (
                  <iframe
                    src="https://www.youtube.com/embed/xmJ62GGtKgo?autoplay=1"
                    title="Lifting You Up with Kasandra Prieto"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <button
                    onClick={() => setYtLoaded(true)}
                    className="w-full h-full bg-cc-navy flex items-center justify-center group cursor-pointer"
                    aria-label="Play video"
                  >
                    <img
                      src="https://img.youtube.com/vi/xmJ62GGtKgo/hqdefault.jpg"
                      alt="Lifting You Up podcast episode thumbnail"
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="relative z-10 w-16 h-16 rounded-full bg-cc-gold/90 flex items-center justify-center shadow-lg group-hover:bg-cc-gold transition-colors">
                      <svg viewBox="0 0 24 24" className="w-7 h-7 text-cc-navy ml-1" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 lg:py-20 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-white rounded-2xl p-8 shadow-soft">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <Heart className="w-10 h-10 text-cc-gold mx-auto mb-3" />
                  <p className="text-sm text-cc-text-muted">{t("Former Vice Chair, Arizona Diaper Bank", "Ex-Vicepresidenta, Arizona Diaper Bank")}</p>
                </div>
                <div className="text-center">
                  <Users className="w-10 h-10 text-cc-gold mx-auto mb-3" />
                  <p className="text-sm text-cc-text-muted">{t("Vice President, Rumbo al Éxito", "Vicepresidenta, Rumbo al Éxito")}</p>
                </div>
                <div className="text-center">
                  <Star className="w-10 h-10 text-cc-gold mx-auto mb-3" />
                  <p className="text-sm text-cc-text-muted">{t("Leadership Tucson", "Liderazgo Tucson")}</p>
                </div>
                <div className="text-center">
                  <HeartHandshake className="w-10 h-10 text-cc-gold mx-auto mb-3" />
                  <p className="text-sm text-cc-text-muted">{t("Community Advocate", "Defensora Comunitaria")}</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
                {t("Community Leadership", "Liderazgo Comunitario")}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-blue mt-2 mb-6">
                {t("Giving Back to Tucson", "Retribuyendo a Tucson")}
              </h2>
              <p className="text-cc-text-muted mb-6">
                {t(
                  "This work has never been just about houses for me. It's about the families inside them and the neighborhoods that hold them together.",
                  "Este trabajo nunca ha sido solo sobre casas para mí. Se trata de las familias que viven en ellas y los vecindarios que las mantienen unidas."
                )}
              </p>
              <Link to="/community" className="inline-flex items-center text-cc-gold font-semibold hover:gap-3 gap-2 transition-all">
                {t("See how I give back", "Conoce cómo retribuyo")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
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