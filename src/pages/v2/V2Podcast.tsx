import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import JsonLd from "@/components/seo/JsonLd";
import V2Layout from "@/components/v2/V2Layout";
import { Radio, Youtube, Users, TrendingUp, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import heroImage from "@/assets/hero-podcast-homes.png";

const V2PodcastContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  useDocumentHead({
    titleEn: "Lifting You Up Podcast | Tucson Real Estate & Community",
    titleEs: "Podcast Lifting You Up | Bienes Raíces y Comunidad en Tucson",
    descriptionEn: "Listen to Lifting You Up with Kasandra Prieto on Urbana 92.5 FM. Inspiring conversations about community, wealth, and Hispanic success stories.",
    descriptionEs: "Escuche Lifting You Up con Kasandra Prieto en Urbana 92.5 FM. Conversaciones sobre comunidad, riqueza y éxito hispano.",
  });

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "PodcastSeries",
        name: "Lifting You Up with Kasandra Prieto",
        description: "Inspiring conversations about community leadership, generational wealth, and Hispanic success stories in Tucson.",
        url: "https://www.youtube.com/@KasandraPrietoTucson",
        author: { "@type": "Person", name: "Kasandra Prieto" },
        inLanguage: ["en", "es"],
      }} />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-cc-blue/90 to-cc-blue/75" />
        </div>
        <div className="relative container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-3xl">
            <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
              {t("Podcast & Radio", "Podcast y Radio")}
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mt-2 mb-6 text-white">
              {t("Lifting You Up with Kasandra Prieto", "Lifting You Up con Kasandra Prieto")}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {t(
                "Inspiring conversations about community leadership, generational wealth, and Hispanic success stories in Tucson and beyond.",
                "Conversaciones inspiradoras sobre liderazgo comunitario, riqueza generacional, e historias de éxito hispano en Tucson y más allá."
              )}
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
                <Radio className="w-6 h-6 text-cc-gold" />
                <div>
                  <p className="font-semibold text-white">Urbana 92.5 FM</p>
                  <p className="text-sm text-white/70">{t("Saturdays 9:30 AM", "Sábados 9:30 AM")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
                <Youtube className="w-6 h-6 text-cc-gold" />
                <div>
                  <p className="font-semibold text-white">YouTube</p>
                  <p className="text-sm text-white/70">{t("Full Episodes", "Episodios Completos")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Show */}
      <section className="py-16 lg:py-20 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-elevated border border-cc-sand-dark/30">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mb-6">
                {t("About the Show", "Sobre el Programa")}
              </h2>
              <p className="text-cc-charcoal mb-6">
                {t(
                  "\"Lifting You Up\" is more than a podcast—it's a platform for sharing stories that inspire, educate, and empower our community. Each week, I sit down with community leaders, entrepreneurs, and changemakers to discuss topics that matter.",
                  "\"Lifting You Up\" es más que un podcast—es una plataforma para compartir historias que inspiran, educan y empoderan a nuestra comunidad. Cada semana, me siento con líderes comunitarios, emprendedores y agentes de cambio para discutir temas que importan."
                )}
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-cc-gold flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-cc-navy">{t("Community Leaders", "Líderes Comunitarios")}</h4>
                    <p className="text-sm text-cc-charcoal">
                      {t("Featuring local voices making a difference in Tucson", "Presentando voces locales que hacen la diferencia en Tucson")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-6 h-6 text-cc-gold flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-cc-navy">{t("Generational Wealth", "Riqueza Generacional")}</h4>
                    <p className="text-sm text-cc-charcoal">
                      {t("Discussions on building lasting financial foundations", "Discusiones sobre construir bases financieras duraderas")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-6 h-6 text-cc-gold flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-cc-navy">{t("Hispanic Leadership", "Liderazgo Hispano")}</h4>
                    <p className="text-sm text-cc-charcoal">
                      {t("Celebrating success stories from our community", "Celebrando historias de éxito de nuestra comunidad")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-elevated border border-cc-sand-dark/30">
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/xmJ62GGtKgo"
                  title="Lifting You Up with Kasandra Prieto"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <p className="text-center text-sm text-cc-slate mt-3">
                {t("Episodes available on YouTube", "Episodios disponibles en YouTube")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Selena Trust Bridge — listeners thinking about real estate */}
      <section className="py-14 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 border border-cc-sand-dark/30 shadow-soft text-center">
            <div className="w-12 h-12 rounded-full bg-cc-gold/15 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-cc-gold" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-cc-navy mb-3">
              {t(
                "Heard something on the show that got you thinking?",
                "¿Escuchaste algo en el programa que te hizo pensar?"
              )}
            </h3>
            <p className="text-cc-charcoal text-sm mb-6 max-w-md mx-auto">
              {t(
                "Ask Selena any real estate question — buying, selling, cash offers, or just exploring your options. Free, confidential, available 24/7.",
                "Pregúntale a Selena cualquier pregunta de bienes raíces — comprar, vender, ofertas en efectivo, o solo explorar tus opciones. Gratis, confidencial, disponible 24/7."
              )}
            </p>
            <Button
              onClick={() => {
                logCTAClick({ cta_name: CTA_NAMES.SELENA_ROUTE_CALL, destination: 'selena_chat', page_path: '/v2/podcast', intent: 'explore' });
                openChat({ source: 'podcast_page', intent: 'explore' });
              }}
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t("Ask Selena a Question", "Hazle una Pregunta a Selena")}
            </Button>
          </div>
        </div>
      </section>

      {/* Listen CTA */}
      <section className="py-16 lg:py-20 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
            {t("Never Miss an Episode", "No Se Pierda Ningún Episodio")}
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            {t(
              "Tune in every Saturday at 9:30 AM on Urbana 92.5 FM or subscribe on YouTube to catch all episodes.",
              "Sintonize cada sábado a las 9:30 AM en Urbana 92.5 FM o suscríbase en YouTube para ver todos los episodios."
            )}
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://www.youtube.com/@KasandraPrietoTucson"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold">
                <Youtube className="w-5 h-5 mr-2" />
                {t("Subscribe on YouTube", "Suscribirse en YouTube")}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

const V2Podcast = () => (
  <V2Layout>
    <V2PodcastContent />
  </V2Layout>
);

export default V2Podcast;
