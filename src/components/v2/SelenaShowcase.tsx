import { useLanguage } from "@/contexts/LanguageContext";
import { Bot, Sparkles, MessageCircle, Video, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSelenaChat } from "@/contexts/SelenaChatContext";

interface SelenaShowcaseProps {
  variant?: "full" | "compact";
}

const SelenaShowcase = ({ variant = "full" }: SelenaShowcaseProps) => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();

  if (variant === "compact") {
    return (
      <section className="py-12 bg-cc-ivory">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-white rounded-2xl p-6 shadow-md border border-cc-sand-dark/10">
            <div className="w-16 h-16 rounded-full bg-cc-gold/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-8 h-8 text-cc-gold" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="font-serif text-xl font-bold text-cc-navy">Selena</h3>
                <span className="text-[10px] font-semibold bg-cc-gold/20 text-cc-gold-dark px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-cc-charcoal/70 text-sm mb-3">
                {t(
                  "Kasandra's AI assistant — available 24/7 in English and Spanish to answer your real estate questions.",
                  "La asistente de IA de Kasandra — disponible 24/7 en inglés y español para responder tus preguntas de bienes raíces."
                )}
              </p>
              <button
                onClick={() => openChat({ source: 'showcase_compact' })}
                className="inline-flex items-center gap-2 text-cc-gold font-semibold text-sm hover:gap-3 transition-all"
              >
                {t("Chat with Selena", "Habla con Selena")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 lg:py-20 bg-gradient-to-br from-cc-navy via-cc-navy to-cc-blue overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cc-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cc-gold/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-2xl relative z-10 text-center">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-cc-gold/20 flex items-center justify-center">
            <Bot className="w-7 h-7 text-cc-gold" />
          </div>
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
              {t("Meet Selena", "Conoce a Selena")}
            </h2>
            <span className="text-cc-gold text-sm font-medium">
              {t("Kasandra's AI Assistant", "Asistente de IA de Kasandra")}
            </span>
          </div>
        </div>

        <p className="text-white/70 leading-relaxed mb-6">
          {t(
            "Selena is Kasandra's AI-powered assistant — trained on Tucson real estate, bilingual in English and Spanish, and available 24/7. She can answer your questions about buying, selling, market conditions, and programs you might qualify for. Think of her as Kasandra's digital team member who never sleeps.",
            "Selena es la asistente impulsada por IA de Kasandra — entrenada en bienes raíces de Tucson, bilingüe en inglés y español, y disponible 24/7. Puede responder tus preguntas sobre comprar, vender, condiciones del mercado y programas para los que podrías calificar. Piensa en ella como la miembro digital del equipo de Kasandra que nunca duerme."
          )}
        </p>

        <ul className="space-y-3 mb-8 inline-block text-left">
          <li className="flex items-center gap-3 text-white/80 text-sm">
            <Sparkles className="w-4 h-4 text-cc-gold flex-shrink-0" />
            {t("Bilingual — English & Spanish", "Bilingüe — Inglés y Español")}
          </li>
          <li className="flex items-center gap-3 text-white/80 text-sm">
            <Sparkles className="w-4 h-4 text-cc-gold flex-shrink-0" />
            {t("Trained on local Tucson market data", "Entrenada en datos del mercado local de Tucson")}
          </li>
          <li className="flex items-center gap-3 text-white/80 text-sm">
            <Sparkles className="w-4 h-4 text-cc-gold flex-shrink-0" />
            {t("Available 24/7 — nights, weekends, holidays", "Disponible 24/7 — noches, fines de semana, días festivos")}
          </li>
          <li className="flex items-center gap-3 text-white/80 text-sm">
            <Sparkles className="w-4 h-4 text-cc-gold flex-shrink-0" />
            {t("Knows Kasandra's programs and specialties", "Conoce los programas y especialidades de Kasandra")}
          </li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6"
            onClick={() => openChat({ source: 'showcase_full' })}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("Chat with Selena", "Habla con Selena")}
          </Button>
          <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-6">
            <Link to="/about">
              {t("Meet Kasandra", "Conoce a Kasandra")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SelenaShowcase;
