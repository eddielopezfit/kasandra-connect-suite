import { Link } from "react-router-dom";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import JsonLd from "@/components/seo/JsonLd";
import { useLanguage } from "@/contexts/LanguageContext";
import V2Layout from "@/components/v2/V2Layout";
import TrustBar from "@/components/v2/TrustBar";
import TestimonialCard from "@/components/v2/TestimonialCard";
import { primaryTestimonials, secondaryTestimonials } from "@/data/testimonials";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useState, useEffect, useCallback, useRef } from "react";
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
} from "lucide-react";
import kasandraHeadshot from "@/assets/kasandra-headshot.jpg";
import kasandraLifestyle from "@/assets/kasandra-lifestyle.jpg";
import HomepageNeighborhoodCards from "@/components/v2/neighborhood/HomepageNeighborhoodCards";
import GlassmorphismHero from "@/components/v2/hero/GlassmorphismHero";
import CTASection from "@/components/v2/CTASection";
import { useSelenaChat } from "@/contexts/SelenaChatContext";

const V2HomeContent = () => {
  const { t } = useLanguage();
  const { isOpen, openChat } = useSelenaChat();
  useDocumentHead({
    titleEn: "Kasandra Prieto | Tucson Realtor & Bilingual Real Estate Agent",
    titleEs: "Kasandra Prieto | Agente de Bienes Raíces Bilingüe en Tucson",
    descriptionEn: "Bilingual real estate guidance in Tucson. 24/7 AI concierge, cash offer options, and personalized home buying & selling support.",
    descriptionEs: "Orientación bilingüe de bienes raíces en Tucson. Asistente IA 24/7, opciones de oferta en efectivo y apoyo personalizado.",
  });
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  
  // Combine all testimonials for the carousel
  const allTestimonials = [...primaryTestimonials, ...secondaryTestimonials];
  
  const updateCarouselState = useCallback(() => {
    if (!carouselApi) return;
    setCurrentIndex(carouselApi.selectedScrollSnap());
  }, [carouselApi]);
  
  useEffect(() => {
    if (!carouselApi) return;
    
    updateCarouselState();
    
    carouselApi.on("select", updateCarouselState);
    carouselApi.on("reInit", updateCarouselState);
    
    return () => {
      carouselApi.off("select", updateCarouselState);
      carouselApi.off("reInit", updateCarouselState);
    };
  }, [carouselApi, updateCarouselState]);

  // ========== PROACTIVE SELENA TRIGGER ==========
  const proactiveFiredRef = useRef(false);
  const hasOpenedSelenaRef = useRef(false);
  const pageLoadTimeRef = useRef(Date.now());

  // Track if user opened Selena themselves
  useEffect(() => {
    if (isOpen && !proactiveFiredRef.current) {
      hasOpenedSelenaRef.current = true;
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (proactiveFiredRef.current || hasOpenedSelenaRef.current) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollPercent = (scrollTop / docHeight) * 100;
      const elapsedMs = Date.now() - pageLoadTimeRef.current;

      if (scrollPercent >= 50 && elapsedMs >= 15000) {
        proactiveFiredRef.current = true;

        // Open the drawer — greeting engine handles the welcome message
        openChat({ source: 'proactive_homepage' as any });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [openChat, t]);

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": ["RealEstateAgent", "LocalBusiness"],
        name: "Kasandra Prieto",
        description: "Bilingual REALTOR® serving the Tucson community with integrity, heart, and expertise.",
        url: "https://kasandraprietorealtor.com",
        image: "https://kasandraprietorealtor.com/og-kasandra.jpg",
        telephone: "+1-520-349-3248",
        address: { "@type": "PostalAddress", addressLocality: "Tucson", addressRegion: "AZ", addressCountry: "US" },
        areaServed: { "@type": "City", name: "Tucson" },
        knowsLanguage: ["en", "es"],
      }} />
      {/* Hero Section */}
      <GlassmorphismHero />

      {/* Buyer / Seller Fork */}
      <section className="bg-cc-sand py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-cc-navy/50 mb-6">
            {t("What brings you here today?", "¿Qué te trae hoy?")}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Card A — Buyer */}
            <button
              onClick={() => {
                openChat({ source: 'buyer_fork' as any });
              }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-cc-navy/10 bg-white px-6 py-8 shadow-sm text-left transition-all duration-200 hover:border-cc-gold hover:shadow-[0_0_0_3px_rgba(225,181,74,0.15)] focus:outline-none focus:ring-2 focus:ring-cc-gold"
            >
              <Home className="w-7 h-7 text-cc-gold" />
              <div>
                <p className="font-semibold text-cc-navy text-base leading-snug">
                  {t("I'm looking to buy", "Quiero comprar")}
                </p>
                <p className="text-sm text-cc-charcoal/60 mt-1">
                  {t("Find your home in Tucson", "Encuentra tu hogar en Tucson")}
                </p>
              </div>
            </button>

            {/* Card B — Seller */}
            <button
              onClick={() => {
                openChat({ source: 'seller_fork' as any });
              }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-cc-navy/10 bg-white px-6 py-8 shadow-sm text-left transition-all duration-200 hover:border-cc-gold hover:shadow-[0_0_0_3px_rgba(225,181,74,0.15)] focus:outline-none focus:ring-2 focus:ring-cc-gold"
            >
              <ArrowRight className="w-7 h-7 text-cc-gold" />
              <div>
                <p className="font-semibold text-cc-navy text-base leading-snug">
                  {t("I'm looking to sell", "Quiero vender")}
                </p>
                <p className="text-sm text-cc-charcoal/60 mt-1">
                  {t("See what your home is worth", "Descubre el valor de tu propiedad")}
                </p>
              </div>
            </button>
          </div>
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
              <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
                {t("About Kasandra", "Sobre Kasandra")}
              </span>
              <h2 className="font-serif text-4xl xl:text-5xl font-bold text-cc-blue mt-2 mb-6">
                {t("Your Trusted Tucson REALTOR®", "Su REALTOR® de Confianza en Tucson")}
              </h2>
              <div className="space-y-4 text-cc-text-muted mb-6">
                <p>
                  {t(
                    "A proud Tucson resident for over two decades, I serve my community not just as a licensed REALTOR®, but as a leader, advocate, and trusted voice. Fluent in English and Spanish, I bring warmth, clarity, and expertise to every client.",
                    "Orgullosa residente de Tucson por más de dos décadas, sirvo a mi comunidad no solo como REALTOR® licenciada, sino como líder, defensora y voz de confianza. Hablo inglés y español con fluidez, aportando calidez, claridad y experiencia a cada cliente."
                  )}
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t("Vice Chair, Arizona Diaper Bank Governing Board", "Vicepresidenta, Junta Directiva del Arizona Diaper Bank")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t("Greater Tucson Leadership — Class of 2026", "Greater Tucson Leadership — Promoción 2026")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('Host of "Lifting You Up with Kasandra Prieto" (Urbana 92.5 FM)', 'Conductora de "Lifting You Up with Kasandra Prieto" (Urbana 92.5 FM)')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t("Certified Global Luxury Property Specialist", "Especialista Certificada en Propiedades de Lujo Global")}</span>
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
              <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
                {t("About Kasandra", "Sobre Kasandra")}
              </span>
              <h2 className="font-serif text-4xl font-bold text-cc-blue mt-2 mb-4">
                {t("Your Trusted Tucson REALTOR®", "Su REALTOR® de Confianza en Tucson")}
              </h2>
              <p className="text-cc-text-muted max-w-2xl mx-auto">
                {t(
                  "A proud Tucson resident for over two decades, I serve my community not just as a licensed REALTOR®, but as a leader, advocate, and trusted voice.",
                  "Orgullosa residente de Tucson por más de dos décadas, sirvo a mi comunidad no solo como REALTOR® licenciada, sino como líder y defensora."
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
                <span className="text-cc-text-muted">{t("Vice Chair, Arizona Diaper Bank Governing Board", "Vicepresidenta, Junta Directiva del Arizona Diaper Bank")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted">{t("Greater Tucson Leadership — Class of 2026", "Greater Tucson Leadership — Promoción 2026")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted">{t('Host of "Lifting You Up with Kasandra Prieto" (Urbana 92.5 FM)', 'Conductora de "Lifting You Up with Kasandra Prieto" (Urbana 92.5 FM)')}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted">{t("Certified Global Luxury Property Specialist", "Especialista Certificada en Propiedades de Lujo Global")}</span>
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
              <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
                {t("About Kasandra", "Sobre Kasandra")}
              </span>
              <h2 className="font-serif text-3xl font-bold text-cc-blue mt-2 mb-4">
                {t("Your Trusted Tucson REALTOR®", "Su REALTOR® de Confianza en Tucson")}
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
                <span className="text-cc-text-muted text-sm">{t("Vice Chair, Arizona Diaper Bank", "Vicepresidenta, Arizona Diaper Bank")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted text-sm">{t("Greater Tucson Leadership — Class of 2026", "Greater Tucson Leadership — Promoción 2026")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
                <span className="text-cc-text-muted text-sm">{t('Radio Host (Urbana 92.5 FM)', 'Conductora de Radio (Urbana 92.5 FM)')}</span>
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

      {/* Neighborhood Cards */}
      <HomepageNeighborhoodCards />

      {/* Trust Bar */}
      <TrustBar />

      {/* Services Section - Header Band */}
      <section className="py-16 lg:py-20 bg-cc-blue-bg">
        <div className="container mx-auto px-4">
          {/* Section Header with Blue Band */}
          <div className="bg-cc-blue rounded-xl p-8 mb-12 text-center">
            <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
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
                  {t("Learn More", "Más Información")} <ArrowRight className="w-4 h-4" />
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
                  {t("Learn More", "Más Información")} <ArrowRight className="w-4 h-4" />
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
                  {t("Learn More", "Más Información")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selena AI Section */}
      <section className="py-16 lg:py-20 bg-cc-blue text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
                {t("24/7 Concierge", "Asistente 24/7")}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mt-2 mb-6">
                {t("Meet Selena AI", "Conozca a Selena AI")}
              </h2>
              <p className="text-white/90 mb-6">
                {t(
                  "Selena AI is Kasandra's AI concierge—designed to respond instantly, answer high-level questions, support English and Spanish conversations, and ensure no serious client is ever missed.",
                  "Selena AI es la asistente de IA de Kasandra—diseñada para responder instantáneamente, contestar preguntas generales, apoyar conversaciones en inglés y español, y asegurar que ningún cliente serio sea ignorado."
                )}
              </p>
              <p className="text-cc-gold mb-8 italic">
                {t(
                  "Selena AI does not replace Kasandra. She protects Kasandra's time so Kasandra can protect her clients.",
                  "Selena AI no reemplaza a Kasandra. Ella protege el tiempo de Kasandra para que Kasandra pueda proteger a sus clientes."
                )}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{t("24/7 bilingual responses", "Respuestas bilingües 24/7")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{t("Appointment booking", "Agendar citas")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{t("Buyer & seller pre-qualification", "Pre-calificación de compradores y vendedores")}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{t("Compliance-safe handoff", "Transferencia segura a Kasandra")}</span>
                </div>
              </div>
              <p className="text-xs text-white/60 border-t border-white/20 pt-4">
                {t(
                  "Selena AI is an AI assistant. All advice and decisions are reviewed and handled by Kasandra Prieto, licensed REALTOR®.",
                  "Selena AI es una asistente de IA. Todos los consejos y decisiones son revisados y manejados por Kasandra Prieto, REALTOR® licenciada."
                )}
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="w-48 h-48 md:w-60 md:h-60 rounded-full bg-white/15 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-cc-gold flex items-center justify-center">
                      <MessageCircle className="w-14 h-14 text-cc-navy" />
                    </div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 bg-cc-gold text-cc-blue text-xs font-bold px-3 py-1 rounded-full">
                  24/7
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 lg:py-20 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-blue mb-3">
              {t("What Clients Say", "Lo Que Dicen los Clientes")}
            </h2>
            <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">
              {t("Testimonials sourced from verified third-party review platforms.", "Testimonios de plataformas de reseñas verificadas.")}
            </p>
          </div>
          
          {/* Testimonials Carousel */}
          <div className="relative px-4 sm:px-12">
            <Carousel
              setApi={setCarouselApi}
              opts={{
                align: "start",
                loop: false,
                slidesToScroll: 1,
                containScroll: "trimSnaps",
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {allTestimonials.map((testimonial) => (
                  <CarouselItem key={testimonial.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                    <TestimonialCard testimonial={testimonial} variant="primary" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious 
                className="hidden sm:flex -left-2 sm:left-0 bg-white border-cc-blue/20 hover:bg-cc-blue hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              />
              <CarouselNext 
                className="hidden sm:flex -right-2 sm:right-0 bg-white border-cc-blue/20 hover:bg-cc-blue hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              />
            </Carousel>
            
            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {allTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => carouselApi?.scrollTo(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentIndex === index 
                      ? "bg-cc-blue w-4" 
                      : "bg-cc-blue/30 hover:bg-cc-blue/50"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Podcast Section */}
      <section className="py-16 lg:py-20 bg-cc-blue-bg">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
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
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/xmJ62GGtKgo"
                  title="Lifting You Up with Kasandra Prieto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
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
                  <p className="text-sm text-cc-text-muted">{t("Vice Chair, Arizona Diaper Bank", "Vicepresidenta, Arizona Diaper Bank")}</p>
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
              <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
                {t("Community Leadership", "Liderazgo Comunitario")}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-blue mt-2 mb-6">
                {t("Giving Back to Tucson", "Retribuyendo a Tucson")}
              </h2>
              <p className="text-cc-text-muted mb-6">
                {t(
                  "Real estate is about more than transactions—it's about building stronger communities. I'm committed to making a difference in the lives of families across Tucson.",
                  "Los bienes raíces son más que transacciones—se trata de construir comunidades más fuertes. Estoy comprometida a hacer una diferencia en la vida de las familias en todo Tucson."
                )}
              </p>
              <Link to="/community" className="inline-flex items-center text-cc-gold font-semibold hover:gap-3 gap-2 transition-all">
                {t("Learn More", "Más Información")} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <CTASection />
    </>
  );
};

const V2Home = () => (
  <V2Layout>
    <V2HomeContent />
  </V2Layout>
);

export default V2Home;