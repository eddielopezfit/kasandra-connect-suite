import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { useNavigate } from "react-router-dom";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, Globe, Map, ArrowRight } from "lucide-react";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import SelenaConversationDemo from "@/components/v2/selena/SelenaConversationDemo";

const V2SelenaAIContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const navigate = useNavigate();

  useDocumentHead({
    titleEn: "Meet Selena — AI Real Estate Concierge | Kasandra Prieto",
    titleEs: "Conoce a Selena — Concierge de Bienes Raíces con IA | Kasandra Prieto",
    descriptionEn: "Selena is Kasandra's AI real estate concierge. Available 24/7, bilingual, no pressure. Ask questions, explore neighborhoods, and get guided to the right next step.",
    descriptionEs: "Selena es la concierge de bienes raíces con IA de Kasandra. Disponible 24/7, bilingüe, sin presión.",
  });

  const handleOpenChat = () => {
    logCTAClick({ cta_name: CTA_NAMES.RESULT_CHAT_SELENA, destination: 'selena_drawer', page_path: '/selena-ai', intent: 'neutral' });
    openChat({ source: 'selena_ai_page' });
  };

  const featureItems = [
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
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            {t(
              "Kasandra's AI real estate concierge. Available 24/7. Bilingual. No pressure.",
              "La concierge de bienes raíces con IA de Kasandra. Disponible 24/7. Bilingüe. Sin presión."
            )}
          </p>
          <Button
            size="lg"
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-10 shadow-gold"
            onClick={handleOpenChat}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {t("Try Selena Now →", "Prueba Selena Ahora →")}
          </Button>
        </div>
      </section>

      {/* Simulated Conversation Demo */}
      <section className="bg-cc-navy py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <SelenaConversationDemo onStartChat={handleOpenChat} />
          <p className="text-cc-ivory/50 text-sm italic text-center mt-6">
            {t("Real answers. Real situations. No scripts.", "Respuestas reales. Situaciones reales. Sin guiones.")}
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="bg-cc-ivory py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-blue text-center mb-10">
            {t("What Selena Does", "Lo Que Selena Hace")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {featureItems.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-soft border border-transparent hover:border-cc-gold/50 transition-all duration-300 flex items-start gap-4"
              >
                <item.icon className="w-6 h-6 text-cc-gold flex-shrink-0 mt-0.5" />
                <p className="text-cc-charcoal text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try Selena Right Now — inline CTA band */}
      <section className="bg-cc-navy py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            {t("Try Selena Right Now", "Prueba a Selena Ahora Mismo")}
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            {t(
              "Ask anything — what to expect when buying, how cash offers work, what your home might be worth.",
              "Pregunta lo que quieras — qué esperar al comprar, cómo funcionan las ofertas en efectivo, cuánto podría valer tu casa."
            )}
          </p>
          <Button
            size="lg"
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-10 shadow-gold mb-8"
            onClick={() => openChat({ source: 'selena_ai_page_demo' })}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {t("Start Talking to Selena", "Empieza a Hablar con Selena")}
          </Button>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { en: "How does a cash offer work?", es: "¿Cómo funciona una oferta en efectivo?" },
              { en: "Am I ready to buy?", es: "¿Estoy lista para comprar?" },
              { en: "What's my home worth?", es: "¿Cuánto vale mi casa?" },
            ].map((chip) => (
              <button
                key={chip.en}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full border border-white/20 transition-colors"
                onClick={() => openChat({ source: 'selena_ai_page_demo', prefillMessage: t(chip.en, chip.es) })}
              >
                {t(chip.en, chip.es)}
              </button>
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
        <div className="container mx-auto px-4 text-center flex flex-col items-center gap-3">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            {t("Ready to Try?", "¿Lista para Probar?")}
          </h2>
          <Button
            size="lg"
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-10 shadow-gold"
            onClick={handleOpenChat}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {t("Start Talking to Selena →", "Empieza a Hablar con Selena →")}
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
            onClick={() => navigate("/book")}
          >
            {t("Book with Kasandra Instead", "Agenda con Kasandra")}
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
