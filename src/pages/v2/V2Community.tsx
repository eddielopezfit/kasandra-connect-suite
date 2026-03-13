import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Heart, Users, Award, HandHeart, Store, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import arizonaDiaperBankLogo from "@/assets/arizona-diaper-bank-logo.jpg";
import rumboAlExitoLogo from "@/assets/rumbo-al-exito-logo.jpg";
import tucsonApplianceLogo from "@/assets/tucson-appliance-logo.jpg";
import GoogleReviewsSection from "@/components/v2/GoogleReviewsSection";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import heroImage from "@/assets/hero-community-neighborhood.png";

const V2CommunityContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  useDocumentHead({
    titleEn: "Tucson Community Impact | Kasandra Prieto Gives Back",
    titleEs: "Impacto Comunitario en Tucson | Kasandra Prieto Retribuye",
    descriptionEn: "Kasandra Prieto's community leadership in Tucson. Arizona Diaper Bank, Rumbo al Éxito, and local business advocacy.",
    descriptionEs: "Liderazgo comunitario de Kasandra Prieto en Tucson. Arizona Diaper Bank, Rumbo al Éxito y apoyo empresarial local.",
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
              {t("Community Leadership", "Liderazgo Comunitario")}
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mt-2 mb-6 text-white">
              {t("Giving Back to Tucson", "Retribuyendo a Tucson")}
            </h1>
            <p className="text-xl text-white/90">
              {t(
                "Real estate is about more than transactions—it's about building stronger communities. I'm committed to making a difference in the lives of families across Tucson.",
                "Los bienes raíces son más que transacciones—se trata de construir comunidades más fuertes. Estoy comprometida a hacer una diferencia en la vida de las familias en todo Tucson."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <GoogleReviewsSection />

      {/* Selena mid-page trust prompt — trust formed here → action */}
      <section className="py-10 bg-cc-navy">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="flex-1">
              <p className="text-white font-semibold text-lg leading-snug">
                {t(
                  "Ready to talk about buying or selling in Tucson?",
                  "¿Listo/a para hablar sobre comprar o vender en Tucson?"
                )}
              </p>
              <p className="text-white/60 text-sm mt-1">
                {t(
                  "Selena is available 24/7 — no pressure, bilingual, completely free.",
                  "Selena está disponible 24/7 — sin presión, bilingüe, completamente gratis."
                )}
              </p>
            </div>
            <Button
              onClick={() => {
                logCTAClick({ cta_name: CTA_NAMES.SELENA_ROUTE_CALL, destination: 'selena_chat', page_path: '/community', intent: 'explore' });
                openChat({ source: 'community_mid_page', intent: 'explore' });
              }}
              className="shrink-0 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-7 shadow-gold"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("Chat with Selena", "Hablar con Selena")}
            </Button>
          </div>
        </div>
      </section>

      {/* Arizona Diaper Bank */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-elevated border border-cc-sand-dark/30">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <div className="w-16 h-16 bg-cc-gold/10 rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-cc-gold" />
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mb-6">
                  Arizona Diaper Bank
                </h2>
                <p className="text-cc-charcoal mb-6">
                  {t(
                    "As Vice Chair of the Governing Board and Chair of the Ambassador Program since 2021, I work to ensure families across Arizona have access to essential supplies for their children.",
                    "Como Vicepresidenta de la Junta Directiva y Presidenta del Programa de Embajadores desde 2021, trabajo para asegurar que las familias en todo Arizona tengan acceso a suministros esenciales para sus hijos."
                  )}
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("Vice Chair, Governing Board", "Vicepresidenta, Junta Directiva")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("Chair, Ambassador Program", "Presidenta, Programa de Embajadores")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <HandHeart className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("Supporting families since 2021", "Apoyando familias desde 2021")}</span>
                  </div>
                </div>
              </div>
              <div className="bg-cc-sand rounded-xl p-8 flex items-center justify-center border border-cc-sand-dark/30">
                <img
                  src={arizonaDiaperBankLogo}
                  alt={t("Arizona Diaper Bank logo", "Logotipo de Arizona Diaper Bank")}
                  className="max-h-[120px] w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rumbo al Éxito */}
      <section className="py-16 lg:py-20 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-elevated border border-cc-sand-dark/30">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 md:order-1 bg-cc-ivory rounded-xl p-8 flex items-center justify-center border border-cc-sand-dark/30">
                <img
                  src={rumboAlExitoLogo}
                  alt={t("Rumbo al Éxito Latino Business Group logo", "Logotipo de Rumbo al Éxito Latino Business Group")}
                  className="max-h-[120px] w-auto object-contain"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="w-16 h-16 bg-cc-navy/10 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-cc-navy" />
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mb-6">
                  Rumbo al Éxito Latino Business Group
                </h2>
                <p className="text-cc-charcoal mb-6">
                  {t(
                    "As Vice President of this organization, I help foster entrepreneurship and professional development within the Hispanic community. We believe in lifting each other up and creating pathways to success.",
                    "Como Vicepresidenta de esta organización, ayudo a fomentar el emprendimiento y el desarrollo profesional dentro de la comunidad hispana. Creemos en elevarnos mutuamente y crear caminos hacia el éxito."
                  )}
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("Vice President", "Vicepresidenta")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("Supporting Latino entrepreneurs", "Apoyando emprendedores latinos")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <HandHeart className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("Professional development programs", "Programas de desarrollo profesional")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tucson Appliance */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-elevated border border-cc-sand-dark/30">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <div className="w-16 h-16 bg-cc-gold/10 rounded-full flex items-center justify-center mb-6">
                  <Store className="w-8 h-8 text-cc-gold" />
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mb-6">
                  Tucson Appliance
                </h2>
                <p className="text-sm text-cc-gold font-semibold uppercase tracking-wider mb-4">
                  {t("Hispanic Community Spokeswoman", "Portavoz de la Comunidad Hispana")}
                </p>
                <p className="text-cc-charcoal mb-6">
                  {t(
                    "As a Hispanic spokesperson for Tucson Appliance, I help bridge trust and understanding between local businesses and the Hispanic community—ensuring families feel confident when making important home decisions.",
                    "Como portavoz hispana de Tucson Appliance, ayudo a generar confianza y claridad entre las familias hispanas y las empresas locales, apoyando decisiones informadas para el hogar."
                  )}
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("Hispanic Community Spokeswoman", "Portavoz de la comunidad hispana")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("Trusted local brand representation", "Representación confiable de marca local")}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <HandHeart className="w-5 h-5 text-cc-gold flex-shrink-0 mt-0.5" />
                    <span className="text-cc-charcoal">{t("Supporting informed homeownership decisions", "Apoyo a decisiones informadas para el hogar")}</span>
                  </div>
                </div>
              </div>
              <div className="bg-cc-sand rounded-xl p-8 flex items-center justify-center border border-cc-sand-dark/30">
                <img
                  src={tucsonApplianceLogo}
                  alt={t("Tucson Appliance logo", "Logotipo de Tucson Appliance")}
                  className="max-h-[120px] w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Community Matters */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mb-6">
            {t("Why Community Matters", "Por Qué la Comunidad Importa")}
          </h2>
          <p className="text-cc-charcoal mb-8">
            {t(
              "When I help you buy or sell a home, I'm not just closing a transaction—I'm helping build the foundation for your family's future. That same commitment to family and community drives everything I do, both in real estate and in my volunteer work.",
              "Cuando le ayudo a comprar o vender una casa, no solo estoy cerrando una transacción—estoy ayudando a construir la base para el futuro de su familia. Ese mismo compromiso con la familia y la comunidad impulsa todo lo que hago, tanto en bienes raíces como en mi trabajo voluntario."
            )}
          </p>
          <Button 
            onClick={() => {
              logCTAClick({ cta_name: CTA_NAMES.SELENA_ROUTE_CALL, destination: 'selena_chat', page_path: '/community', intent: 'explore' });
              openChat({ source: 'hero', intent: 'explore' });
            }}
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {t("Chat with Selena", "Hablar con Selena")}
          </Button>
          
        </div>
      </section>
    </>
  );
};

const V2Community = () => (
  <V2Layout>
    <V2CommunityContent />
  </V2Layout>
);

export default V2Community;
