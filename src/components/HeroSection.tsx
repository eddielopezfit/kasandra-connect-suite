import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-downtown-tucson.png";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/50 to-navy/80" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="animate-fade-up text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            {t("Your Best Friend in Real Estate.", "Tu Mejor Amiga en Bienes Raíces.")}
          </h1>
          <p className="animate-fade-up animation-delay-200 text-lg md:text-xl lg:text-2xl text-white/90 mb-10 font-light max-w-2xl mx-auto">
            {t(
              "Serving the Tucson community with integrity, heart, and bilingual expertise.",
              "Sirviendo a la comunidad de Tucson con integridad, corazón y experiencia bilingüe."
            )}
          </p>
          <div className="animate-fade-up animation-delay-400 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="heroSecondary" size="xl" className="rounded-full" asChild>
              <a href="#services">{t("Explore Listings", "Explorar Propiedades")}</a>
            </Button>
            <Button variant="heroOutline" size="xl" className="rounded-full" asChild>
              <a href="#podcast">{t("Listen to Podcast", "Escuchar Podcast")}</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
