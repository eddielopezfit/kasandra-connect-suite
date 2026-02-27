import { useLanguage } from "@/contexts/LanguageContext";
import V2Layout from "@/components/v2/V2Layout";
import { Radio, Youtube, Users, TrendingUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";

const V2PodcastContent = () => {
  const { t } = useLanguage();

  return (
    <>
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

      {/* YouTube Channel Embed */}
      <section className="py-16 lg:py-20 bg-cc-sand">
        <div className="container mx-auto px-4">
          <div className="bg-cc-navy rounded-xl p-6 md:p-8 mb-10 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
              {t("Watch on YouTube", "Ver en YouTube")}
            </h2>
            <p className="text-white/80 mt-3 max-w-2xl mx-auto">
              {t(
                "Catch up on all episodes featuring community leaders, entrepreneurs, and inspiring stories from Tucson.",
                "Vea todos los episodios con líderes comunitarios, emprendedores e historias inspiradoras de Tucson."
              )}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-elevated max-w-4xl mx-auto border border-cc-sand-dark/30">
            <div className="bg-cc-navy/5 rounded-xl p-10 flex flex-col items-center justify-center gap-6 min-h-[200px]">
              <Youtube className="w-14 h-14 text-cc-gold" />
              <div className="text-center">
                <h3 className="font-serif text-xl font-bold text-cc-navy mb-2">
                  {t("Watch All Episodes", "Ver Todos los Episodios")}
                </h3>
                <p className="text-cc-charcoal text-sm max-w-md">
                  {t(
                    "New episodes added regularly. Subscribe so you never miss a conversation.",
                    "Se agregan nuevos episodios regularmente. Suscríbase para no perderse ninguna conversación."
                  )}
                </p>
              </div>
              <a
                href="https://www.youtube.com/@KasandraPrietoTucson"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold px-6 py-3 rounded-full transition-colors shadow-gold"
              >
                <Youtube className="w-5 h-5" />
                {t("Visit Channel", "Visitar Canal")}
              </a>
            </div>
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
