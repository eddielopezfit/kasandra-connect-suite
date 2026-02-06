import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import TestimonialCard from "@/components/v2/TestimonialCard";
import { sellerTestimonials } from "@/data/testimonials";
import { Shield, TrendingUp, FileText, Handshake, CheckCircle, AlertCircle, MessageCircle } from "lucide-react";
import { setIntentIfEmpty } from "@/lib/analytics/selenaSession";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import FeaturedGuideCard from "@/components/v2/shared/FeaturedGuideCard";

const PAGE_PATH = '/v2/sell';
const PAGE_INTENT = 'sell' as const;

const V2SellContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();

  // Auto-set intent only if not already declared (prevents overwriting quiz/URL intent)
  useEffect(() => {
    setIntentIfEmpty('sell');
  }, []);

  // Handle CTA clicks with tracking (uses constants from CTA_NAMES)
  const handleCTAClick = (cta_name: string, destination: string) => {
    logCTAClick({ cta_name, destination, page_path: PAGE_PATH, intent: PAGE_INTENT });
  };

  // Handle Selena routing CTA
  const handleSelenaRoute = () => {
    handleCTAClick(CTA_NAMES.SELENA_ROUTE_CALL, 'selena_chat');
    openChat();
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-cc-navy pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
              {t("For Sellers", "Para Vendedores")}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mt-2 mb-6 text-white">
              {t("Sell Your Home with Confidence", "Venda Su Casa con Confianza")}
            </h1>
            <p className="text-lg text-white/90 mb-8">
              {t(
                "Selling your home is a significant decision. I'll guide you with market-based pricing, full disclosure support, and a protection-first approach.",
                "Vender su casa es una decisión significativa. Le guiaré con precios basados en el mercado, apoyo de divulgación completa, y un enfoque en protección."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-8 shadow-gold text-sm sm:text-base"
                onClick={() => handleCTAClick(CTA_NAMES.HERO_CASH_COMPARISON, '/v2/cash-offer-options')}
              >
                <Link to="/v2/cash-offer-options">{t("Compare Your Options", "Compare Sus Opciones")}</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 rounded-full px-6 sm:px-8 text-sm sm:text-base"
                onClick={() => handleCTAClick(CTA_NAMES.HERO_SELLING_GUIDE, '/v2/guides/selling-for-top-dollar')}
              >
                <Link to="/v2/guides/selling-for-top-dollar">{t("Read Our Seller Guide", "Lea Nuestra Guía")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How I Protect Sellers */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="bg-cc-navy rounded-xl p-6 md:p-8 mb-10 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
              {t("How I Protect Sellers", "Cómo Protejo a los Vendedores")}
            </h2>
            <p className="text-white/80 mt-3 max-w-2xl mx-auto">
              {t(
                "My approach is centered on your protection and informed decision-making.",
                "Mi enfoque está centrado en su protección y toma de decisiones informada."
              )}
            </p>
          </div>

          {/* Cards Container */}
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-elevated">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-cc-sand p-6 rounded-xl text-center border border-cc-sand-dark/30">
                <TrendingUp className="w-10 h-10 text-cc-navy mx-auto mb-4" />
                <h3 className="font-serif text-lg font-bold text-cc-navy mb-3">
                  {t("Market-Based Pricing", "Precios Basados en el Mercado")}
                </h3>
                <p className="text-sm text-cc-charcoal">
                  {t(
                    "Pricing strategy based on current market data and comparable sales in your area.",
                    "Estrategia de precios basada en datos actuales del mercado y ventas comparables en su área."
                  )}
                </p>
              </div>
              <div className="bg-cc-sand p-6 rounded-xl text-center border border-cc-sand-dark/30">
                <Shield className="w-10 h-10 text-cc-navy mx-auto mb-4" />
                <h3 className="font-serif text-lg font-bold text-cc-navy mb-3">
                  {t("Offer Reliability", "Confiabilidad de Ofertas")}
                </h3>
                <p className="text-sm text-cc-charcoal">
                  {t(
                    "I assess each offer's strength and reliability so you can make informed decisions.",
                    "Evalúo la fortaleza y confiabilidad de cada oferta para que pueda tomar decisiones informadas."
                  )}
                </p>
              </div>
              <div className="bg-cc-sand p-6 rounded-xl text-center border border-cc-sand-dark/30">
                <FileText className="w-10 h-10 text-cc-navy mx-auto mb-4" />
                <h3 className="font-serif text-lg font-bold text-cc-navy mb-3">
                  {t("Disclosure Guidance", "Orientación de Divulgación")}
                </h3>
                <p className="text-sm text-cc-charcoal">
                  {t(
                    "Full support with required disclosures to protect you throughout the transaction.",
                    "Apoyo completo con las divulgaciones requeridas para protegerle durante la transacción."
                  )}
                </p>
              </div>
              <div className="bg-cc-sand p-6 rounded-xl text-center border border-cc-sand-dark/30">
                <Handshake className="w-10 h-10 text-cc-navy mx-auto mb-4" />
                <h3 className="font-serif text-lg font-bold text-cc-navy mb-3">
                  {t("Negotiation Support", "Apoyo en Negociación")}
                </h3>
                <p className="text-sm text-cc-charcoal">
                  {t(
                    "Skilled negotiation on your behalf, always keeping your best interests first.",
                    "Negociación hábil en su nombre, siempre poniendo sus mejores intereses primero."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guide: Selling for Top Dollar */}
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
            {/* Primary Testimonial */}
            <div className="bg-white rounded-2xl p-2 border border-cc-sand-dark/30">
              <TestimonialCard testimonial={sellerTestimonials[0]} variant="primary" />
            </div>
            
            {/* Secondary Testimonial */}
            <TestimonialCard testimonial={sellerTestimonials[1]} variant="secondary" />
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

      {/* Options */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy">
              {t("Your Selling Options", "Sus Opciones de Venta")}
            </h2>
          </div>
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-elevated">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-cc-sand p-8 rounded-xl border-2 border-cc-navy">
                <h3 className="font-serif text-xl font-bold text-cc-navy mb-4">
                  {t("Traditional Listing", "Venta Tradicional")}
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Maximum market exposure", "Máxima exposición al mercado")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Competitive offers from multiple buyers", "Ofertas competitivas de múltiples compradores")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Professional marketing and showings", "Marketing profesional y visitas")}</span>
                  </li>
                </ul>
                <Button 
                  asChild 
                  className="w-full bg-cc-navy hover:bg-cc-navy-dark text-white rounded-full"
                  onClick={() => handleCTAClick(CTA_NAMES.TRADITIONAL_LISTING_GUIDE, '/v2/guides/selling-for-top-dollar')}
                >
                  <Link to="/v2/guides/selling-for-top-dollar">{t("Learn Traditional Sale Strategy", "Conozca la Estrategia de Venta")}</Link>
                </Button>
              </div>
              <div className="bg-white p-8 rounded-xl border border-cc-sand-dark/50">
                <h3 className="font-serif text-xl font-bold text-cc-navy mb-4">
                  {t("Cash Offer Options", "Opciones de Oferta en Efectivo")}
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Faster closing timeline", "Cierre más rápido")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Sell as-is without repairs", "Venda como está sin reparaciones")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Certainty over maximum price", "Certeza sobre precio máximo")}</span>
                  </li>
                </ul>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full border-cc-gold text-cc-gold hover:bg-cc-gold hover:text-cc-navy rounded-full"
                  onClick={() => handleCTAClick(CTA_NAMES.CASH_OFFER_OPTIONS, '/v2/cash-offer-options')}
                >
                  <Link to="/v2/cash-offer-options">{t("Explore Cash Options", "Explorar Opciones en Efectivo")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-white">
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
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-10 py-6 text-lg shadow-gold"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {t("Ask Selena to Set Up My Call", "Pídale a Selena que Programe Mi Llamada")}
          </Button>
          <p className="text-white/60 text-sm mt-4 max-w-md mx-auto">
            {t(
              "Selena will ask a few quick questions so Kasandra is prepared.",
              "Selena hará unas preguntas rápidas para que Kasandra esté preparada."
            )}
          </p>
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
