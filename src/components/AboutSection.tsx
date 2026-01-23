import kasandraPortrait from "@/assets/kasandra-portrait.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutSection = () => {
  const { language } = useLanguage();

  const t = (en: string, es: string) => (language === "en" ? en : es);

  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative animate-fade-up">
            <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl blur-xl" />
            <div className="relative">
              <div className="absolute -right-4 -bottom-4 w-full h-full bg-accent/20 rounded-2xl" />
              <img
                src={kasandraPortrait}
                alt="Kasandra Prieto - Tucson Realtor"
                className="relative w-full max-w-md mx-auto lg:max-w-none rounded-2xl shadow-luxury object-cover aspect-[4/5]"
              />
            </div>
          </div>

          {/* Content */}
          <div className="animate-fade-up animation-delay-200">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 block">
              {t("About Kasandra", "Sobre Kasandra")}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
              {t("More Than a Realtor—", "Más Que una Agente—")}
              <br />
              <span className="text-gradient-gold">{t("A Community Leader", "Una Líder Comunitaria")}</span>
            </h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>
                {language === "en" ? (
                  <>With over <strong className="text-foreground">18 years</strong> in the Tucson community, I've built my career on one simple principle: treat every client like family.</>
                ) : (
                  <>Con más de <strong className="text-foreground">18 años</strong> en la comunidad de Tucson, he construido mi carrera bajo un principio simple: tratar a cada cliente como familia.</>
                )}
              </p>
              <p>
                {language === "en" ? (
                  <>As a <strong className="text-foreground">bilingual professional</strong>, I bridge cultures and break barriers, ensuring every family—regardless of background—finds their perfect home.</>
                ) : (
                  <>Como <strong className="text-foreground">profesional bilingüe</strong>, conecto culturas y rompo barreras, asegurando que cada familia—sin importar su origen—encuentre su hogar perfecto.</>
                )}
              </p>
              <p>
                {language === "en" ? (
                  <>Through my leadership program <strong className="text-foreground">"Rumbo al Éxito"</strong>, I'm committed to empowering the next generation of Hispanic leaders in our community.</>
                ) : (
                  <>A través de mi programa de liderazgo <strong className="text-foreground">"Rumbo al Éxito"</strong>, estoy comprometida a empoderar a la próxima generación de líderes hispanos en nuestra comunidad.</>
                )}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="text-center">
                <span className="block text-3xl font-serif font-bold text-accent">18+</span>
                <span className="text-sm text-muted-foreground">{t("Years Experience", "Años de Experiencia")}</span>
              </div>
              <div className="text-center">
                <span className="block text-3xl font-serif font-bold text-accent">500+</span>
                <span className="text-sm text-muted-foreground">{t("Families Served", "Familias Atendidas")}</span>
              </div>
              <div className="text-center">
                <span className="block text-3xl font-serif font-bold text-accent">2</span>
                <span className="text-sm text-muted-foreground">{t("Languages Spoken", "Idiomas")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
