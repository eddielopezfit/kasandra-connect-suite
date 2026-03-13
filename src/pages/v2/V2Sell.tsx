import { useEffect, useState } from "react";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import TestimonialCard from "@/components/v2/TestimonialCard";
import { sellerTestimonials } from "@/data/testimonials";
import GoogleReviewsSection from "@/components/v2/GoogleReviewsSection";
import { Shield, TrendingUp, FileText, Handshake, CheckCircle, AlertCircle, MessageCircle, ArrowRight } from "lucide-react";
import { setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import FeaturedGuideCard from "@/components/v2/shared/FeaturedGuideCard";

import { getStoredUserName } from "@/lib/analytics/bridgeLeadIdToV2";
import GlassmorphismHero from "@/components/v2/hero/GlassmorphismHero";
import heroSellBg from "@/assets/hero-sell-tucson-aerial.png";

const PAGE_PATH = '/sell';
const PAGE_INTENT = 'sell' as const;

const V2SellContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const [leadName, setLeadName] = useState<string | null>(null);
  useDocumentHead({
    titleEn: "Sell Your Tucson Home | Cash Offer & Traditional Listing Options",
    titleEs: "Venda Su Casa en Tucson | Opciones de Oferta en Efectivo y Venta Tradicional",
    descriptionEn: "Explore your selling options in Tucson. Market-based pricing, cash offer review, and full disclosure support from a bilingual REALTOR®.",
    descriptionEs: "Explore sus opciones de venta en Tucson. Precios de mercado, revisión de ofertas en efectivo y apoyo bilingüe.",
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
      {/* Hero */}
      <GlassmorphismHero
        badge={t("For Sellers", "Para Vendedores")}
        headline={t("Know Your Home's Worth. Move on Your Terms.", "Conoce el valor de tu hogar. Muévete en tus términos.")}
        subtext={t(
          "Kasandra helps Tucson sellers price right, time the market, and close with confidence — with an AI concierge that answers every question before you even ask.",
          "Kasandra ayuda a vendedores en Tucson a fijar el precio correcto, aprovechar el mercado y cerrar con confianza — con un asistente de IA que responde cada pregunta antes de que la hagas."
        )}
        primaryLabel={t("Talk to Selena", "Habla con Selena")}
        secondaryLabel={t("Seller Readiness Quiz", "Quiz de Preparación para Vender")}
        secondaryLink="/seller-readiness"
        intent="sell"
        entrySource="sell_hero"
        pagePath="/sell"
        backgroundImage={heroSellBg}
      />

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
      <GoogleReviewsSection />

      {/* Your Selling Options — Navy/dark styled cards */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
              {t("The Choice Is Yours", "La Decisión Es Suya")}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mt-2">
              {t("Your Selling Options", "Sus Opciones de Venta")}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Traditional Listing — navy bg */}
            <div className="bg-cc-navy p-8 rounded-2xl">
              <h3 className="font-serif text-xl font-bold text-white mb-4">
                {t("Traditional Listing", "Venta Tradicional")}
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{t("Maximum market exposure", "Máxima exposición al mercado")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{t("Competitive offers from multiple buyers", "Ofertas competitivas de múltiples compradores")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{t("Professional marketing and showings", "Marketing profesional y visitas")}</span>
                </li>
              </ul>
              <Button 
                asChild 
                className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full"
                onClick={() => handleCTAClick(CTA_NAMES.TRADITIONAL_LISTING_GUIDE, '/guides/selling-for-top-dollar')}
              >
                <Link to="/guides/selling-for-top-dollar">
                  {t("Learn Listing Strategy", "Conocer Estrategia de Venta")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Cash Offer — dark slate bg */}
            <div className="bg-cc-charcoal p-8 rounded-2xl border border-cc-gold/20">
              <h3 className="font-serif text-xl font-bold text-white mb-4">
                {t("Cash Offer Options", "Opciones de Oferta en Efectivo")}
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{t("Faster closing timeline", "Cierre más rápido")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{t("Sell as-is without repairs", "Venda como está sin reparaciones")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{t("Certainty over maximum price", "Certeza sobre precio máximo")}</span>
                </li>
              </ul>
              <Button 
                asChild 
                variant="outline"
                className="w-full border-cc-gold text-cc-gold hover:bg-cc-gold hover:text-cc-navy font-semibold rounded-full"
                onClick={() => handleCTAClick(CTA_NAMES.CASH_OFFER_OPTIONS, '/cash-offer-options')}
              >
                <Link to="/cash-offer-options">
                  {t("Explore Cash Options", "Explorar Opciones en Efectivo")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
        </div>

          {/* Decision Path CTA */}
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-white rounded-2xl p-8 border border-cc-gold/30 text-center shadow-soft">
              <span className="text-cc-gold font-semibold text-xs tracking-wider uppercase">
                {t("Not Sure Which Path?", "¿No Está Seguro/a Cuál Camino?")}
              </span>
              <h3 className="font-serif text-2xl font-bold text-cc-navy mt-2 mb-3">
                {t("Discover Your Best Path", "Descubra Su Mejor Camino")}
              </h3>
              <p className="text-cc-charcoal text-sm mb-6 max-w-lg mx-auto">
                {t(
                  "Answer a few quick questions about your property and goals. Get a personalized recommendation — no pressure, no commitment.",
                  "Responda algunas preguntas rápidas sobre su propiedad y objetivos. Obtenga una recomendación personalizada — sin presión, sin compromiso."
                )}
              </p>
              <Button
                asChild
                className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
              >
                <Link 
                  to="/seller-decision"
                  onClick={() => handleCTAClick('seller_decision_path', '/seller-decision')}
                >
                  {t("Start the Decision Tool", "Iniciar la Herramienta de Decisión")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-cc-gold/50 text-cc-navy font-medium rounded-full px-8 mt-3"
              >
                <Link
                  to="/seller-readiness"
                  onClick={() => handleCTAClick('seller_readiness_check', '/seller-readiness')}
                >
                  {t("Quick Readiness Check", "Check Rápido de Preparación")}
                </Link>
              </Button>
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
          <Button 
            onClick={handleSelenaRoute}
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 py-3 text-sm sm:px-10 sm:py-6 sm:text-lg shadow-gold"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <span className="sm:hidden">{t("Ask Selena", "Pregúntale a Selena")}</span>
            <span className="hidden sm:inline">{t("Ask Selena to Set Up My Call", "Pídale a Selena que Programe Mi Llamada")}</span>
          </Button>
          <p className="text-white/60 text-sm mt-4 max-w-md mx-auto">
            {t(
              "Selena will ask a few quick questions so Kasandra is prepared.",
              "Selena hará unas preguntas rápidas para que Kasandra esté preparada."
            )}
          </p>
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
    </>
  );
};

const V2Sell = () => (
  <V2Layout>
    <V2SellContent />
  </V2Layout>
);

export default V2Sell;
