import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle } from "lucide-react";
import CredentialsBentoGrid from "@/components/v2/CredentialsBentoGrid";
import { Link } from "react-router-dom";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import heroImage from "@/assets/hero-community-neighborhood.png";
import kasandraHeadshot from "@/assets/kasandra-headshot.jpg";
import kasandraLifestyle from "@/assets/kasandra-lifestyle.jpg";

const V2AboutContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();

  useDocumentHead({
    titleEn: "About Kasandra Prieto | Tucson REALTOR® & Community Leader",
    titleEs: "Sobre Kasandra Prieto | REALTOR® y Líder Comunitaria en Tucson",
    descriptionEn: "Meet Kasandra Prieto — 20+ year Tucson resident, bilingual REALTOR®, radio host, and community advocate. Your best friend in real estate.",
    descriptionEs: "Conoce a Kasandra Prieto — residente de Tucson por más de 20 años, REALTOR® bilingüe, conductora de radio y defensora comunitaria.",
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
            <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
              {t("About Kasandra", "Sobre Kasandra")}
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mt-2 mb-6 text-white">
              {t("Your Best Friend in Real Estate", "Tu Mejor Amiga en Bienes Raíces")}
            </h1>
            <p className="text-xl text-white/90">
              {t(
                "Born in Agua Prieta. Raised in Douglas, AZ. Tucson resident for over 20 years.",
                "Nacida en Agua Prieta. Criada en Douglas, AZ. Residente de Tucson por más de 20 años."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="bg-cc-ivory py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left — Video */}
            <div className="flex flex-col items-center">
              <p className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase mb-4">
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

            {/* Right — Copy + Images */}
            <div>
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
                <p className="text-sm text-cc-text-muted">
                  {t("Arizona License #SA682372000 · Corner Connect / Realty Executives Arizona Territory", "Licencia de Arizona #SA682372000 · Corner Connect / Realty Executives Arizona Territory")}
                </p>
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
            </div>
          </div>
        </div>
      </section>

      {/* Credentials Bento Grid */}
      <CredentialsBentoGrid />

      {/* Podcast Link */}
      <div className="bg-cc-sand py-4 text-center">
        <Link to="/podcast" className="text-sm text-cc-gold hover:underline transition-colors">
          🎙 {t("Listen to Lifting You Up on Urbana 92.5 FM →", "Escucha Lifting You Up en Urbana 92.5 FM →")}
        </Link>
      </div>

      {/* Personal Touch */}
      <section className="bg-cc-sand py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-cc-text-muted italic text-lg">
            {t("Dog mom. Singer. Karaoke enthusiast. Community-driven.", "Mamá perruna. Cantante. Entusiasta del karaoke. Comprometida con la comunidad.")}
          </p>
          <p className="text-cc-gold font-semibold text-sm mt-4 italic">
            {t(
              '"Growth and giving back IS the formula to continuous, true happiness."',
              '"El crecimiento y retribuir ES la fórmula para la felicidad continua y verdadera."'
            )}
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-cc-navy py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            {t("Ready to Talk?", "¿Lista para Hablar?")}
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            {t(
              "Whether you're buying, selling, or just curious — Kasandra is here for you.",
              "Ya sea que quieras comprar, vender, o simplemente tengas curiosidad — Kasandra está aquí para ti."
            )}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold">
              <Link
                to="/book"
                onClick={() => logCTAClick({ cta_name: CTA_NAMES.TOOL_BOOK_CONSULTATION, destination: '/book', page_path: '/about', intent: 'neutral' })}
              >
                {t("Book a Strategy Session", "Agendar una Sesión de Estrategia")}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 rounded-full px-8"
              onClick={() => {
                logCTAClick({ cta_name: CTA_NAMES.RESULT_CHAT_SELENA, destination: 'selena_drawer', page_path: '/about', intent: 'neutral' });
                openChat({ source: 'about_page' });
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("Talk to Selena First", "Habla con Selena Primero")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

const V2About = () => (
  <V2Layout>
    <V2AboutContent />
  </V2Layout>
);

export default V2About;
