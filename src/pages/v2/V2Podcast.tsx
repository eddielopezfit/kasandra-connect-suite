import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { Link } from "react-router-dom";
import JsonLd from "@/components/seo/JsonLd";
import V2Layout from "@/components/v2/V2Layout";
import { Radio, Youtube, Users, TrendingUp, Heart, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import heroImage from "@/assets/hero-podcast-homes.png";
import JourneyBreadcrumb from "@/components/v2/JourneyBreadcrumb";

const V2PodcastContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const [ytLoaded, setYtLoaded] = useState(false);
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
        name: "Lifting You Up: Todo empieza en casita",
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

      {/* Journey Progress — visible only to returning users */}
      <div className="bg-cc-ivory">
        <div className="container mx-auto px-4 pt-8">
          <JourneyBreadcrumb />
        </div>
      </div>

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
              <div className="aspect-video rounded-lg overflow-hidden relative">
                {ytLoaded ? (
                  <iframe
                    src="https://www.youtube.com/embed/xmJ62GGtKgo?autoplay=1"
                    title="Lifting You Up with Kasandra Prieto"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <button
                    onClick={() => setYtLoaded(true)}
                    className="w-full h-full bg-cc-navy flex items-center justify-center group cursor-pointer"
                    aria-label="Play video"
                  >
                    <img
                      src="https://img.youtube.com/vi/xmJ62GGtKgo/hqdefault.jpg"
                      alt="Lifting You Up podcast episode thumbnail"
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="relative z-10 w-16 h-16 rounded-full bg-cc-gold/90 flex items-center justify-center shadow-lg group-hover:bg-cc-gold transition-colors">
                      <svg viewBox="0 0 24 24" className="w-7 h-7 text-cc-navy ml-1" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                    </div>
                  </button>
                )}
              </div>
              <p className="text-center text-sm text-cc-slate mt-3">
                {t("Episodes available on YouTube", "Episodios disponibles en YouTube")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Todo Empieza en Casa */}
      <section className="py-16 lg:py-20 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-elevated border border-cc-sand-dark/30">
              <span className="inline-block bg-cc-gold/15 text-cc-gold text-xs font-semibold tracking-wider uppercase rounded-full px-3 py-1 mb-4">
                {t("New Series", "Nueva Serie")}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-cc-navy mb-6">
                {t("Todo Empieza en Casa", "Todo Empieza en Casa")}
              </h2>
              <p className="text-cc-charcoal mb-6">
                {t(
                  "\"Everything Starts at Home\" — a Spanish-language series about the fundamentals of buying a home. I bring together experts in psychology and lending to talk about the emotional and financial realities of homeownership. Because stability, personal growth, and family legacy all begin at home.",
                  "\"Todo Empieza en Casa\" — una serie en español sobre los fundamentos de comprar una casa. Reúno a expertos en psicología y préstamos para hablar sobre las realidades emocionales y financieras de ser propietario. Porque la estabilidad, el crecimiento personal y el legado familiar comienzan en casa."
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-cc-navy/10 text-cc-navy text-xs font-medium rounded-full px-3 py-1">
                  {t("Spanish-language", "En español")}
                </span>
                <span className="bg-cc-navy/10 text-cc-navy text-xs font-medium rounded-full px-3 py-1">
                  {t("Psychology + Lending", "Psicología + Préstamos")}
                </span>
                <span className="bg-cc-navy/10 text-cc-navy text-xs font-medium rounded-full px-3 py-1">
                  {t("Family & Stability", "Familia y Estabilidad")}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-cc-sand-dark/30 text-center">
              <p className="font-serif text-2xl text-cc-navy italic mb-4">
                {t("\"Because everything starts at home.\"", "\"Porque todo empieza en casa.\"")}
              </p>
              <p className="text-cc-charcoal text-sm mb-6">
                {t(
                  "First conversation: Money. Emotional health. Stability. With a lender and a psychologist.",
                  "Primera conversación: Dinero. Salud emocional. Estabilidad. Con un lender y una psicóloga."
                )}
              </p>
              <a
                href="https://www.youtube.com/@KasandraPrietoTucson"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 py-2.5 transition-colors"
              >
                <Youtube className="w-4 h-4" />
                {t("Watch on YouTube", "Ver en YouTube")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Selena Trust Bridge */}
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
                logCTAClick({ cta_name: CTA_NAMES.SELENA_ROUTE_CALL, destination: 'selena_chat', page_path: '/podcast', intent: 'explore' });
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

      {/* Booking CTA */}
      <section className="py-16 lg:py-20 pb-24 sm:pb-16 bg-cc-navy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white">
            {t("Thinking About Real Estate?", "¿Pensando en Bienes Raíces?")}
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            {t(
              "Whether you're buying, selling, or just exploring — let's have a conversation about your goals.",
              "Ya sea que estés comprando, vendiendo, o solo explorando — tengamos una conversación sobre tus metas."
            )}
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-10 py-6 text-lg shadow-gold">
              <Link
                to="/book?source=podcast_page"
                onClick={() => logCTAClick({ cta_name: 'podcast_book_call', destination: '/book', page_path: '/podcast', intent: 'explore' })}
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t("Book a Call with Kasandra", "Agenda una Llamada con Kasandra")}
              </Link>
            </Button>
            <a
              href="https://www.youtube.com/@KasandraPrietoTucson"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" className="text-white/80 hover:text-cc-gold font-medium rounded-full px-8">
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
