import { Link } from "react-router-dom";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { TucsonAlphaCalculator } from "@/components/v2/calculator";
import GoogleReviewsSection from "@/components/v2/GoogleReviewsSection";
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, Clock, Shield, FileText, MessageCircle, Sparkles } from "lucide-react";
import { logCTAClick } from "@/lib/analytics/ctaDefaults";
import heroImage from "@/assets/hero-cash-calm.png";

const V2CashOfferOptionsContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  useDocumentHead({
    titleEn: "Cash Offer vs. Traditional Listing | Tucson Home Sale Calculator",
    titleEs: "Oferta en Efectivo vs. Venta Tradicional | Calculadora de Venta en Tucson",
    descriptionEn: "Compare cash offer vs. traditional listing net proceeds with our Tucson calculator. Understand your options with no pressure.",
    descriptionEs: "Compare ganancias netas de oferta en efectivo vs. venta tradicional con nuestra calculadora de Tucson.",
  });

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-cc-blue/90 to-cc-blue/75" />
        </div>
        <div className="relative container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-3xl">
            <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
              {t("Education & Options", "Educación y Opciones")}
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mt-2 mb-6 text-white">
              {t("Understanding Cash Offers", "Entendiendo las Ofertas en Efectivo")}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {t(
                "Not all cash offers are created equal. Let me help you understand your options so you can make an informed decision—with no pressure.",
                "No todas las ofertas en efectivo son iguales. Permítame ayudarle a entender sus opciones para que pueda tomar una decisión informada—sin presión."
              )}
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('cash-calculator');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center gap-2 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold px-6 py-3 rounded-full shadow-gold transition-all active:scale-95"
              >
                {t("Run My Numbers", "Calcular Mis Números")}
              </button>
              <button
                onClick={() => openChat({ source: 'cash_offer_options_hero', intent: 'cash' })}
                className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white font-medium px-6 py-3 rounded-full transition-all"
              >
                {t("Ask Selena a Question", "Preguntarle a Selena")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section id="cash-calculator" className="py-12 lg:py-16 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mb-4">
                {t("Compare Your Options", "Compara Tus Opciones")}
              </h2>
              <p className="text-cc-charcoal max-w-2xl mx-auto">
                {t(
                  "Use this calculator to see estimated net proceeds for a cash offer versus a traditional listing—based on real Tucson market data.",
                  "Usa esta calculadora para ver las ganancias netas estimadas para una oferta en efectivo versus una venta tradicional—basado en datos reales del mercado de Tucson."
                )}
              </p>
            </div>
            <TucsonAlphaCalculator />
          </div>
        </div>
      </section>

      {/* Static Comparison Section - Educational Reference */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="bg-cc-navy rounded-xl p-6 md:p-8 mb-10 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
              {t("Quick Reference: Cash vs. Traditional", "Referencia Rápida: Efectivo vs. Tradicional")}
            </h2>
            <p className="text-white/80 mt-3 max-w-2xl mx-auto">
              {t(
                "A general overview of the trade-offs to consider.",
                "Una visión general de las ventajas y desventajas a considerar."
              )}
            </p>
          </div>

          {/* Cards Container */}
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-elevated">
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Cash Offer */}
              <div className="rounded-xl shadow-soft overflow-hidden border border-cc-sand-dark/30">
                <div className="bg-cc-gold text-cc-navy p-6">
                  <h3 className="font-serif text-xl font-bold">{t("Cash Offer", "Oferta en Efectivo")}</h3>
                </div>
                <div className="p-6 space-y-4 bg-cc-sand">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Faster closing (often 7-14 days)", "Cierre más rápido (a menudo 7-14 días)")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("No repairs or showings required", "Sin reparaciones ni visitas requeridas")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Certainty of sale", "Certeza de venta")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Flexible move-out timeline", "Cronograma flexible de mudanza")}</span>
                  </div>
                  <div className="border-t border-cc-sand-dark/50 pt-4 mt-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-cc-slate flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-cc-slate">{t("Typically lower sale price", "Típicamente precio de venta más bajo")}</span>
                    </div>
                    <div className="flex items-start gap-3 mt-2">
                      <XCircle className="w-5 h-5 text-cc-slate flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-cc-slate">{t("Less market competition", "Menos competencia de mercado")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traditional Listing */}
              <div className="rounded-xl shadow-soft overflow-hidden border border-cc-sand-dark/30">
                <div className="bg-cc-navy text-white p-6">
                  <h3 className="font-serif text-xl font-bold">{t("Traditional Listing", "Venta Tradicional")}</h3>
                </div>
                <div className="p-6 space-y-4 bg-cc-sand">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Maximum market exposure", "Máxima exposición al mercado")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Potential for higher sale price", "Potencial de precio de venta más alto")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Multiple offers possible", "Múltiples ofertas posibles")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-cc-charcoal">{t("Professional marketing", "Marketing profesional")}</span>
                  </div>
                  <div className="border-t border-cc-sand-dark/50 pt-4 mt-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-cc-slate flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-cc-slate">{t("Longer timeline (30-60+ days)", "Cronograma más largo (30-60+ días)")}</span>
                    </div>
                    <div className="flex items-start gap-3 mt-2">
                      <XCircle className="w-5 h-5 text-cc-slate flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-cc-slate">{t("May require repairs/staging", "Puede requerir reparaciones/staging")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selena Prompt — between comparison and warning */}
      <section className="py-10 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <p className="max-w-xl mx-auto mb-4 text-white">
            {t(
              "Not sure which path fits your situation? Ask Selena — she can walk you through both options based on your specific home.",
              "¿No está seguro qué camino se adapta a su situación? Pregúntele a Selena — ella puede guiarle por ambas opciones según su casa."
            )}
          </p>
          <Button
            onClick={() => openChat({ source: 'calculator', intent: 'cash' })}
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {t("Ask Selena About My Options", "Pregúntale a Selena Sobre Mis Opciones")}
          </Button>
        </div>
      </section>

      {/* Warning Section */}
      <section className="py-12 bg-cc-gold/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-10 h-10 text-cc-gold flex-shrink-0" />
              <div>
                <h3 className="font-serif text-xl font-bold text-cc-navy mb-3">
                  {t("Watch Out for Wholesaler Issues", "Cuidado con Problemas de Mayoristas")}
                </h3>
                <p className="text-cc-charcoal mb-4">
                  {t(
                    "Not everyone who contacts you with a \"cash offer\" is a legitimate buyer. Some are wholesalers who tie up your property under contract, then sell that contract to an actual buyer—often at your expense.",
                    "No todos los que le contactan con una \"oferta en efectivo\" son compradores legítimos. Algunos son mayoristas que atan su propiedad bajo contrato, luego venden ese contrato a un comprador real—a menudo a su costa."
                  )}
                </p>
                <p className="text-cc-charcoal">
                  {t(
                    "I help you understand the difference and protect yourself from potentially problematic offers.",
                    "Le ayudo a entender la diferencia y protegerse de ofertas potencialmente problemáticas."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* When Cash Makes Sense */}
      <section className="py-16 lg:py-20 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-elevated">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
              <div>
                <h3 className="font-serif text-2xl font-bold text-cc-navy mb-6 flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  {t("A Cash Offer May Make Sense If...", "Una Oferta en Efectivo Puede Tener Sentido Si...")}
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 bg-cc-ivory p-4 rounded-lg border border-cc-sand-dark/30">
                    <Clock className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("You need to sell quickly due to life circumstances", "Necesita vender rápidamente debido a circunstancias de vida")}</span>
                  </li>
                  <li className="flex items-start gap-3 bg-cc-ivory p-4 rounded-lg border border-cc-sand-dark/30">
                    <Shield className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("The home needs significant repairs you can't afford", "La casa necesita reparaciones significativas que no puede costear")}</span>
                  </li>
                  <li className="flex items-start gap-3 bg-cc-ivory p-4 rounded-lg border border-cc-sand-dark/30">
                    <FileText className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("You inherited a property and prefer simplicity", "Heredó una propiedad y prefiere simplicidad")}</span>
                  </li>
                  <li className="flex items-start gap-3 bg-cc-ivory p-4 rounded-lg border border-cc-sand-dark/30">
                    <ArrowRight className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("Certainty is more important than maximizing price", "La certeza es más importante que maximizar el precio")}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-cc-navy mb-6 flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-cc-slate" />
                  {t("A Traditional Listing May Be Better If...", "Una Venta Tradicional Puede Ser Mejor Si...")}
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 bg-cc-ivory p-4 rounded-lg border border-cc-sand-dark/30">
                    <span className="text-cc-charcoal">{t("You're not in a rush to sell", "No tiene prisa por vender")}</span>
                  </li>
                  <li className="flex items-start gap-3 bg-cc-ivory p-4 rounded-lg border border-cc-sand-dark/30">
                    <span className="text-cc-charcoal">{t("Your home is in good, market-ready condition", "Su casa está en buenas condiciones, lista para el mercado")}</span>
                  </li>
                  <li className="flex items-start gap-3 bg-cc-ivory p-4 rounded-lg border border-cc-sand-dark/30">
                    <span className="text-cc-charcoal">{t("You want to maximize your sale price", "Quiere maximizar su precio de venta")}</span>
                  </li>
                  <li className="flex items-start gap-3 bg-cc-ivory p-4 rounded-lg border border-cc-sand-dark/30">
                    <span className="text-cc-charcoal">{t("You're comfortable with showings and the listing process", "Se siente cómodo con visitas y el proceso de venta")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cash Readiness Diagnostic CTA */}
      <section className="py-12 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto">
            <Sparkles className="w-8 h-8 text-cc-gold mx-auto mb-4" />
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-3">
              {t("Not Sure Which Path Fits?", "¿No Estás Seguro/a Qué Camino Te Conviene?")}
            </h3>
            <p className="text-white/80 mb-6">
              {t(
                "Take a 1-minute readiness check to see how well a cash offer fits your situation.",
                "Toma un check de preparación de 1 minuto para ver qué tan bien se ajusta una oferta en efectivo a tu situación."
              )}
            </p>
            <Link
              to="/cash-readiness"
              className="inline-flex items-center bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 py-3 shadow-gold transition-all active:scale-[0.98]"
            >
              {t("Take the Cash Readiness Check", "Toma el Check de Preparación")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mb-6">
            {t("Complimentary Cash Offer Review", "Revisión Complementaria de Oferta en Efectivo")}
          </h2>
          <p className="text-cc-charcoal max-w-2xl mx-auto mb-8">
            {t(
              "Already received a cash offer? I'll help you review it—check for red flags, compare it to potential market value, and make sure you understand exactly what you're signing.",
              "¿Ya recibió una oferta en efectivo? Le ayudaré a revisarla—verificar señales de alerta, compararla con el valor potencial de mercado, y asegurar que entienda exactamente lo que está firmando."
            )}
          </p>
          <div className="bg-white rounded-xl p-8 max-w-xl mx-auto shadow-elevated border border-cc-sand-dark/30">
            <p className="text-sm text-cc-slate mb-6">
              {t(
                "This is an educational service to help you understand your options. For specific legal or tax advice, please consult qualified professionals.",
                "Este es un servicio educativo para ayudarle a entender sus opciones. Para consejos legales o fiscales específicos, por favor consulte profesionales calificados."
              )}
            </p>
            <Button 
              asChild
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
            >
              <Link
                to="/v2/book?intent=sell&callType=cash_offer_review&source=hub_cash_offer_options"
                onClick={() => {
                  logCTAClick({ cta_name: 'cash_offer_book_review', destination: '/v2/book?intent=sell&callType=cash_offer_review&source=hub_cash_offer_options', page_path: '/v2/cash-offer-options', intent: 'sell' });
                }}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {t("Book a Cash Offer Review", "Agendar una Revisión de Oferta en Efectivo")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Google Reviews — Social Proof */}
      <GoogleReviewsSection />

      {/* Back Link */}
      <section className="py-10 pb-24 sm:pb-10 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/80 mb-4">
            {t(
              "Prefer a traditional sale? Learn more about how I work with sellers.",
              "¿Prefiere una venta tradicional? Conozca más sobre cómo trabajo con vendedores."
            )}
          </p>
          <Link to="/v2/sell" className="inline-flex items-center text-cc-gold font-semibold hover:text-cc-gold-dark gap-2">
            {t("View Seller Services", "Ver Servicios para Vendedores")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
};

const V2CashOfferOptions = () => (
  <V2Layout>
    <V2CashOfferOptionsContent />
  </V2Layout>
);

export default V2CashOfferOptions;
