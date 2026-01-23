import { Home, Mic, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ServicesSection = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Home,
      title: t("Buy & Sell Homes", "Compra y Venta de Casas"),
      description: t(
        "Expert guidance through every step of your real estate journey. From first-time buyers to luxury properties, I make your dream home a reality.",
        "Orientación experta en cada paso de tu camino inmobiliario. Desde compradores primerizos hasta propiedades de lujo, hago realidad tu hogar soñado."
      ),
      link: "#contact",
      linkText: t("Start Your Search", "Comienza Tu Búsqueda"),
    },
    {
      icon: Mic,
      title: t("Lifting You Up Podcast", "Podcast Lifting You Up"),
      description: t(
        "Inspiring conversations with community leaders, entrepreneurs, and changemakers. Stories that motivate and uplift our Tucson community.",
        "Conversaciones inspiradoras con líderes comunitarios, empresarios y agentes de cambio. Historias que motivan y elevan a nuestra comunidad de Tucson."
      ),
      link: "#podcast",
      linkText: t("Listen Now", "Escuchar Ahora"),
    },
    {
      icon: Heart,
      title: t("Community Work", "Trabajo Comunitario"),
      description: t(
        "Dedicated to giving back through Arizona Diaper Bank, Tucson Hispanic Chamber, and mentoring future leaders in our community.",
        "Dedicada a retribuir a través del Arizona Diaper Bank, la Cámara Hispana de Tucson, y mentorando a futuros líderes en nuestra comunidad."
      ),
      link: "#community",
      linkText: t("Get Involved", "Involúcrate"),
    },
  ];

  return (
    <section id="services" className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 block">
            {t("What I Do", "Lo Que Hago")}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground">
            {t("How I Can Help You", "Cómo Puedo Ayudarte")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <a
              key={service.title}
              href={service.link}
              className="group animate-fade-up bg-card rounded-2xl p-8 shadow-sm hover:shadow-luxury transition-all duration-300 hover:scale-105 border border-border hover:border-accent/30"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <service.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-card-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {service.description}
              </p>
              <span className="text-accent font-semibold text-sm group-hover:underline inline-flex items-center gap-2">
                {service.linkText}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
