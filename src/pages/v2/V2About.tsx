import { useLanguage } from "@/contexts/LanguageContext";
import JsonLd from "@/components/seo/JsonLd";
import { realEstateAgentSchema } from "@/lib/seo/schemaGenerators";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle, Home, Star, Mic, Heart, Sparkles, Users, ShieldCheck, Award } from "lucide-react";
import CredentialsBentoGrid from "@/components/v2/CredentialsBentoGrid";
import SelenaShowcase from "@/components/v2/SelenaShowcase";
import { Link } from "react-router-dom";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import heroImage from "@/assets/hero-community-neighborhood.png";
import kasandraHeadshot from "@/assets/kasandra/black-dress-professional.jpg";
import KasandraPortrait from "@/components/v2/KasandraPortrait";
import kasandraLifestyle from "@/assets/kasandra/desert-garden-closeup.jpg";
import JourneyBreadcrumb from "@/components/v2/JourneyBreadcrumb";
import KasandraVideoBlock from "@/components/v2/KasandraVideoBlock";
import KasandraPhotoGallery from "@/components/v2/KasandraPhotoGallery";

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
      <JsonLd data={realEstateAgentSchema()} />
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
                "Born in Tucson. Raised in Douglas, AZ. Resident for over 20 years.",
                "Nacida en Tucson. Criada en Douglas, AZ. Residente por más de 20 años."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Journey Progress — visible only to returning users */}
      <div className="bg-cc-ivory">
        <div className="container mx-auto px-4 pt-8">
          <JourneyBreadcrumb />
        </div>
      </div>

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
                {t("Your Trusted Tucson REALTOR®", "Tu REALTOR® de Confianza en Tucson")}
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
                <p className="text-sm text-cc-text-muted">
                  {t("Arizona License #SA682372000 · Corner Connect / Realty Executives Arizona Territory", "Licencia de Arizona #SA682372000 · Corner Connect / Realty Executives Arizona Territory")}
                </p>
              </div>

              {/* Image row */}
              <div className="grid grid-cols-2 gap-4">
                <KasandraPortrait
                  src={kasandraHeadshot}
                  alt="Kasandra Prieto, REALTOR®"
                  size="lg"
                  className="w-full"
                />
                <KasandraPortrait
                  src={kasandraLifestyle}
                  alt={t("Kasandra Prieto, bilingual REALTOR® and community leader in Tucson.", "Kasandra Prieto, REALTOR® bilingüe y líder comunitaria en Tucson.")}
                  size="lg"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Journey — Personal Story */}
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
            {t("My Journey", "Mi Historia")}
          </span>
          <h2 className="font-serif text-4xl xl:text-5xl font-bold text-cc-navy mt-2 mb-8">
            {t("A Little About Me", "Un Poco Sobre Mí")}
          </h2>

          <div className="space-y-6 text-cc-charcoal/80 leading-relaxed text-[17px]">
            <p>
              {t(
                "I grew up between Douglas, Arizona and Agua Prieta, Sonora — a border town kid who learned early that two cultures, two languages, and two ways of seeing the world aren't a complication. They're a superpower.",
                "Crecí entre Douglas, Arizona y Agua Prieta, Sonora — una niña de pueblo fronterizo que aprendió temprano que dos culturas, dos idiomas y dos formas de ver el mundo no son una complicación. Son un superpoder."
              )}
            </p>
            <p>
              {t(
                "Before real estate, I spent years in financial services — life insurance, specifically. That's where I learned how to sit with families during their most vulnerable moments and help them make decisions that protect their future. When I transitioned to real estate in 2018, I brought that same approach: listen first, educate always, pressure never.",
                "Antes de bienes raíces, pasé años en servicios financieros — seguros de vida, específicamente. Ahí aprendí a sentarme con familias en sus momentos más vulnerables y ayudarles a tomar decisiones que protejan su futuro. Cuando hice la transición a bienes raíces en 2018, traje el mismo enfoque: escuchar primero, educar siempre, presionar nunca."
              )}
            </p>
            <p>
              {t(
                "I started this career at 35. Some people thought I was late. I think I was right on time. By 42, I've guided over 100 families through one of the biggest decisions of their lives — and I've earned the International Diamond Society recognition, the Luxury Property Specialist designation, and a 5-star average across 126+ reviews. But the credential I'm most proud of? The families who call me back for their second, third, or fourth transaction.",
                "Comencé esta carrera a los 35. Algunas personas pensaron que era tarde. Yo creo que fue justo a tiempo. A los 42, he guiado a más de 100 familias a través de una de las decisiones más grandes de sus vidas — y he ganado el reconocimiento International Diamond Society, la designación de Especialista en Propiedades de Lujo, y un promedio de 5 estrellas en más de 126 reseñas. Pero la credencial de la que más me enorgullezco? Las familias que me llaman de nuevo para su segunda, tercera o cuarta transacción."
              )}
            </p>
          </div>
        </div>
      </section>


      {/* The Real Kasandra — Photo Gallery */}
      <KasandraPhotoGallery />

      {/* Investments in Myself */}
      <section className="bg-cc-ivory py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
            {t("Investments in Myself", "Inversiones en Mí Misma")}
          </span>
          <h2 className="font-serif text-4xl xl:text-5xl font-bold text-cc-navy mt-2 mb-10">
            {t("I Believe in Walking the Talk", "Creo en Predicar con el Ejemplo")}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-soft border border-cc-sand-dark/20">
              <div className="w-10 h-10 bg-cc-gold/10 rounded-full flex items-center justify-center mb-4">
                <Home className="w-5 h-5 text-cc-gold" />
              </div>
              <h3 className="font-serif text-lg font-bold text-cc-navy mb-2">
                {t("Construction Course", "Curso de Construcción")}
              </h3>
              <p className="text-sm text-cc-charcoal/70 leading-relaxed">
                {t(
                  "I completed a 6-month construction course where I built 15 tiny homes. I invested in understanding how homes are actually constructed — not just how they're sold. When I walk through a property with you, I see what most agents don't.",
                  "Completé un curso de construcción de 6 meses donde construí 15 casas pequeñas. Invertí en entender cómo se construyen las casas — no solo cómo se venden. Cuando camino por una propiedad contigo, veo lo que la mayoría de los agentes no ven."
                )}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-soft border border-cc-sand-dark/20">
              <div className="w-10 h-10 bg-cc-gold/10 rounded-full flex items-center justify-center mb-4">
                <Star className="w-5 h-5 text-cc-gold" />
              </div>
              <h3 className="font-serif text-lg font-bold text-cc-navy mb-2">
                {t("Personal Development", "Desarrollo Personal")}
              </h3>
              <p className="text-sm text-cc-charcoal/70 leading-relaxed">
                {t(
                  "Influenced by Tony Robbins, Jim Rohn, and Les Brown through their books and teachings. Greater Tucson Leadership Class of 2026, and continuous education in real estate. I believe the best agents are the ones who never stop growing.",
                   "Influenciada por Tony Robbins, Jim Rohn y Les Brown a través de sus libros y enseñanzas. Greater Tucson Leadership Promoción 2026, y educación continua en bienes raíces. Creo que los mejores agentes son los que nunca dejan de crecer."
                )}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-soft border border-cc-sand-dark/20">
              <div className="w-10 h-10 bg-cc-gold/10 rounded-full flex items-center justify-center mb-4">
                <Mic className="w-5 h-5 text-cc-gold" />
              </div>
              <h3 className="font-serif text-lg font-bold text-cc-navy mb-2">
                {t("Media & Community Voice", "Voz en Medios y Comunidad")}
              </h3>
              <p className="text-sm text-cc-charcoal/70 leading-relaxed">
                {t(
                  "Host of \"Lifting You Up\" on Urbana 92.5 FM and \"Todo Empieza en Casa\" on YouTube. I created these platforms because I believe in lifting others up — and because homeownership education shouldn't only be available in English.",
                  "Conductora de \"Lifting You Up\" en Urbana 92.5 FM y \"Todo Empieza en Casa\" en YouTube. Creé estas plataformas porque creo en levantar a otros — y porque la educación sobre vivienda no debería estar disponible solo en inglés."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* From the Field — Construction Class Video */}
      <section className="bg-cc-sand py-14 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
            {t("From the Field", "Desde el Campo")}
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mt-2 mb-6">
            {t("Built Different", "Construida Diferente")}
          </h2>
          <div className="flex justify-center mb-6">
            <video
              controls
              preload="none"
              playsInline
              className="w-full max-w-xs rounded-2xl shadow-soft border border-cc-sand-dark/20 aspect-[9/16] object-cover bg-cc-navy"
              src={constructionVideo}
            />
          </div>
          <p className="text-cc-charcoal/80 max-w-lg mx-auto text-sm md:text-base italic">
            {t(
              "\"Four years ago I committed to a 6-month construction class. Steel-toe boots. Long days. The knowledge I gained? I use it every single day in real estate.\"",
              "\"Hace cuatro años me comprometí con un curso de construcción de 6 meses. Botas de seguridad. Días largos. ¿El conocimiento que obtuve? Lo uso todos los días en bienes raíces.\""
            )}
          </p>
        </div>
      </section>

      {/* Backed by Realty Executives */}
      <section className="bg-white py-14 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="rounded-2xl border border-cc-sand-dark/20 bg-cc-sand p-8 md:p-10 text-center">
            <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
              {t("Backed by a Global Brand", "Respaldada por una Marca Global")}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mt-2 mb-4">
              {t("Realty Executives Arizona Territory", "Realty Executives Arizona Territory")}
            </h2>
            <p className="text-cc-charcoal/80 max-w-2xl mx-auto mb-6">
              {t(
                "Realty Executives is an international brokerage with 50+ years of proven excellence. Through Corner Connect, I bring you the strength of a global network with the personal attention of a local expert.",
                "Realty Executives es una correduría internacional con más de 50 años de excelencia comprobada. A través de Corner Connect, te ofrezco la fortaleza de una red global con la atención personal de una experta local."
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-cc-charcoal/70">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-cc-gold" />{t("50+ Years in Business", "Más de 50 Años en el Negocio")}</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-cc-gold" />{t("International Network", "Red Internacional")}</span>
              <span className="flex items-center gap-2"><Award className="w-4 h-4 text-cc-gold" />{t("Arizona Territory Office", "Oficina Arizona Territory")}</span>
            </div>
            <a
              href="https://www.realtyexecutives.com/agents/kasandra-prieto"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 text-sm text-cc-gold hover:underline transition-colors"
            >
              {t("View Realty Executives →", "Ver Realty Executives →")}
            </a>
          </div>
        </div>
      </section>

      {/* Credentials Bento Grid */}
      <CredentialsBentoGrid />

      {/* Podcast Link */}
      <div className="bg-cc-sand py-4 text-center">
        <Link to="/podcast" className="text-sm text-cc-gold hover:underline transition-colors">
          🎙 {t('Listen to "Lifting You Up: Todo empieza en casita" on Urbana 92.5 FM →', 'Escucha "Lifting You Up: Todo empieza en casita" en Urbana 92.5 FM →')}
        </Link>
      </div>

      {/* Personal Touch */}
      <section className="bg-cc-sand py-14">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-serif text-2xl font-bold text-cc-navy mb-8">
            {t("Beyond Real Estate", "Más Allá de Bienes Raíces")}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-cc-gold" />
              </div>
              <p className="font-semibold text-cc-navy text-sm">{t("Dog Mom", "Mamá Perruna")}</p>
              <p className="text-xs text-cc-charcoal/60">{t("Lilly is always on the team", "Lilly siempre está en el equipo")}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center">
                <Mic className="w-5 h-5 text-cc-gold" />
              </div>
              <p className="font-semibold text-cc-navy text-sm">{t("Singer", "Cantante")}</p>
              <p className="text-xs text-cc-charcoal/60">{t("Fiestas Patrias, karaoke, anywhere", "Fiestas Patrias, karaoke, donde sea")}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-cc-gold" />
              </div>
              <p className="font-semibold text-cc-navy text-sm">{t("Community First", "Comunidad Primero")}</p>
              <p className="text-xs text-cc-charcoal/60">{t("5 years nonprofit leadership", "5 años liderazgo sin fines de lucro")}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-cc-gold/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cc-gold" />
              </div>
              <p className="font-semibold text-cc-navy text-sm">{t("Always Growing", "Siempre Creciendo")}</p>
              <p className="text-xs text-cc-charcoal/60">{t("\"Growth IS the formula\"", "\"El crecimiento ES la fórmula\"")}</p>
            </div>
          </div>

          <p className="text-cc-gold font-semibold text-sm italic">
            {t(
              '"Growth and giving back IS the formula to continuous, true happiness."',
              '"El crecimiento y retribuir ES la fórmula para la felicidad continua y verdadera."'
            )}
          </p>
        </div>
      </section>

      {/* Selena on About Page */}
      <div className="text-center py-10 bg-cc-sand">
        <h3 className="font-serif text-2xl font-bold text-cc-navy mb-2">
          {t("My Team Includes AI", "Mi Equipo Incluye IA")}
        </h3>
        <p className="text-cc-charcoal/70 max-w-xl mx-auto text-sm mb-0 px-4">
          {t(
            "I built Selena so you can get answers even when I'm with another client. She knows my programs, my market, and my approach.",
            "Creé a Selena para que puedas obtener respuestas incluso cuando estoy con otro cliente. Ella conoce mis programas, mi mercado y mi enfoque."
          )}
        </p>
      </div>
      <SelenaShowcase variant="compact" />

    </>
  );
};

const V2About = () => (
  <V2Layout>
    <V2AboutContent />
  </V2Layout>
);

export default V2About;
