import { useLanguage } from "@/contexts/LanguageContext";
import GoHighLevelForm from "@/components/v2/GoHighLevelForm";

const ContactSection = () => {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-up">
          <span className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 block">
            {t("Get In Touch", "Contáctame")}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            {t("Let's Connect", "Conectemos")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t(
              "Ready to find your dream home or start a conversation? I'd love to hear from you.",
              "¿Lista para encontrar tu hogar soñado o iniciar una conversación? Me encantaría saber de ti."
            )}
          </p>
        </div>

        {/* GoHighLevel Form */}
        <div className="max-w-2xl mx-auto animate-fade-up animation-delay-200">
          <GoHighLevelForm className="bg-background rounded-2xl overflow-hidden shadow-lg" />
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
