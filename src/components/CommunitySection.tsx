import { Heart, Users, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CommunitySection = () => {
  const { t } = useLanguage();

  const communityItems = [
    {
      icon: Heart,
      org: "Arizona Diaper Bank",
      description: t(
        "Supporting families in need with essential supplies and resources.",
        "Apoyando a familias necesitadas con suministros y recursos esenciales."
      ),
    },
    {
      icon: Users,
      org: t("Tucson Hispanic Chamber", "Cámara Hispana de Tucson"),
      description: t(
        "Empowering Hispanic business owners and entrepreneurs in our community.",
        "Empoderando a propietarios de negocios y empresarios hispanos en nuestra comunidad."
      ),
    },
    {
      icon: Award,
      org: "Rumbo al Éxito",
      description: t(
        "Leadership program mentoring the next generation of Hispanic leaders.",
        "Programa de liderazgo que guía a la próxima generación de líderes hispanos."
      ),
    },
  ];

  return (
    <section id="community" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 block">
            {t("Giving Back", "Retribuyendo")}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            {t("Community Involvement", "Participación Comunitaria")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(
              "Committed to building a stronger Tucson through service, mentorship, and advocacy.",
              "Comprometida a construir un Tucson más fuerte a través del servicio, la mentoría y la defensa."
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 animate-fade-up animation-delay-200">
          {communityItems.map((item) => (
            <div
              key={item.org}
              className="text-center p-8 rounded-2xl bg-muted/50 border border-border hover:border-accent/30 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <item.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                {item.org}
              </h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
