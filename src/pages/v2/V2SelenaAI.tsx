import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, Globe, Map, ArrowRight, ShieldCheck, Scale, UserX } from "lucide-react";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";

const V2SelenaAIContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();

  useDocumentHead({
    titleEn: "Meet Selena — AI Real Estate Concierge | Kasandra Prieto",
    titleEs: "Conoce a Selena — Concierge de Bienes Raíces con IA | Kasandra Prieto",
    descriptionEn: "Selena is Kasandra's AI real estate concierge. Available 24/7, bilingual, no pressure. Ask questions, explore neighborhoods, and get guided to the right next step.",
    descriptionEs: "Selena es la concierge de bienes raíces con IA de Kasandra. Disponible 24/7, bilingüe, sin presión.",
  });

  const doesItems = [
    {
      icon: Clock,
      text: t("Answers your real estate questions 24/7", "Responde tus preguntas de bienes raíces 24/7"),
    },
    {
      icon: Globe,
      text: t("Guides you through buying and selling — in English or Spanish", "Te guía en el proceso de compra y venta — en inglés o español"),
    },
    {
      icon: Map,
      text: t("Helps you explore neighborhoods, guides, and market data", "Te ayuda a explorar vecindarios, guías y datos del mercado"),
    },
    {
      icon: ArrowRight,
      text: t("Connects you to Kasandra when you're ready", "Te conecta con Kasandra cuando estés lista"),
    },
  ];

  const doesntItems = [
    {
      icon: ShieldCheck,
      text: t("Selena is not a licensed real estate agent", "Selena no es una agente de bienes raíces con licencia"),
    },
    {
      icon: Scale,
      text: t("Selena does not provide legal or financial advice", "Selena no proporciona asesoramiento legal o financiero"),
    },
    {
      icon: UserX,
      text: t("Selena does not replace Kasandra — she prepares you to talk to her", "Selena no reemplaza a Kasandra — te prepara para hablar con ella"),
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-cc-navy pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1.5 bg-cc-gold/20 text-cc-gold rounded-full text-sm font-medium mb-6">
            {t("AI Concierge", "Concierge con IA")}
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
            {t("Meet Selena", "Conoce a Selena")}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {t(
              "Kasandra's AI real estate concierge. Available 24/7. Bilingual. No pressure.",
              "La concierge de bienes raíces con IA de Kasandra. Disponible 24/7. Bilingüe. Sin presión."
            )}
          </p>
        </div>
      </section>

      {/* What Selena Does */}
      <section className="bg-cc-ivory py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-blue text-center mb-10">
            {t("What Selena Does", "Lo Que Selena Hace")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {doesItems.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-soft border border-cc-sand-dark/10 flex items-start gap-4">
                <item.icon className="w-6 h-6 text-cc-gold flex-shrink-0 mt-0.5" />
                <p className="text-cc-charcoal text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Selena Doesn't Do */}
      <section className="bg-cc-sand py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-blue text-center mb-10">
            {t("What Selena Doesn't Do", "Lo Que Selena No Hace")}
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {doesntItems.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-soft border border-cc-sand-dark/10 flex items-start gap-4">
                <item.icon className="w-5 h-5 text-cc-slate flex-shrink-0 mt-0.5" />
                <p className="text-cc-charcoal text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="bg-cc-ivory py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-cc-text-muted max-w-2xl mx-auto">
            {t(
              "Selena is an AI assistant. Conversations may be reviewed for quality and compliance. Standard TCPA consent applies. Your information is never sold.",
              "Selena es una asistente de IA. Las conversaciones pueden ser revisadas para calidad y cumplimiento. Se aplica el consentimiento estándar de TCPA. Su información nunca se vende."
            )}
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-cc-navy py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-6">
            {t("Ready to Try?", "¿Lista para Probar?")}
          </h2>
          <Button
            size="lg"
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-10 shadow-gold"
            onClick={() => {
              logCTAClick({ cta_name: CTA_NAMES.RESULT_CHAT_SELENA, destination: 'selena_drawer', page_path: '/selena-ai', intent: 'neutral' });
              openChat({ source: 'selena_ai_page' });
            }}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {t("Talk to Selena Now", "Habla con Selena Ahora")}
          </Button>
        </div>
      </section>
    </>
  );
};

const V2SelenaAI = () => (
  <V2Layout>
    <V2SelenaAIContent />
  </V2Layout>
);

export default V2SelenaAI;
