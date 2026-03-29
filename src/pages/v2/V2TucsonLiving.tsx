import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import { Sun, MapPin, ArrowRight, Calendar, Heart } from "lucide-react";
import desertSunsetHero from "@/assets/kasandra/desert-sunset-cowboy.jpg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LIFESTYLE_HIGHLIGHTS,
  KASANDRA_PICKS,
  SEASON_LABELS,
  EVENT_CATEGORY_LABELS,
  type Season,
} from "@/data/tucsonEvents";
import { useTucsonEvents } from "@/hooks/useTucsonEvents";

const SEASONS: Season[] = ['winter', 'spring', 'summer', 'fall'];

const V2TucsonLivingContent = () => {
  const { t, language } = useLanguage();
  const [activeSeason, setActiveSeason] = useState<Season | 'all'>('all');

  useDocumentHead({
    titleEn: "Discover Tucson Living | Events, Culture & Lifestyle — Kasandra Prieto",
    titleEs: "Descubre la Vida en Tucson | Eventos, Cultura y Estilo de Vida — Kasandra Prieto",
    descriptionEn:
      "Explore what makes Tucson special — signature events, UNESCO food culture, 350+ days of sunshine, and why families love living here. Your Tucson lifestyle guide.",
    descriptionEs:
      "Explora lo que hace especial a Tucson — eventos emblemáticos, cultura gastronómica UNESCO, 350+ días de sol y por qué las familias aman vivir aquí.",
  });

  const filteredEvents = activeSeason === 'all'
    ? TUCSON_EVENTS
    : TUCSON_EVENTS.filter(e => e.season === activeSeason);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${desertSunsetHero})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-cc-navy/90 to-cc-navy/70" />
        </div>
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <Sun className="w-10 h-10 text-cc-gold mb-4" />
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t("Discover Tucson Living", "Descubre la Vida en Tucson")}
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            {t(
              "Tucson isn't just where I work — it's where I've built my life for over 20 years. From the sunsets at Gates Pass to Sonoran hot dogs on South 12th, this city has a soul. Here's what makes it special.",
              "Tucson no es solo donde trabajo — es donde he construido mi vida por más de 20 años. Desde los atardeceres en Gates Pass hasta los hot dogs Sonorenses en la calle 12 Sur, esta ciudad tiene alma. Esto es lo que la hace especial."
            )}
          </p>
        </div>
      </section>

      {/* Why Tucson — Lifestyle Highlights */}
      <section className="bg-cc-ivory py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-3xl font-bold text-cc-navy mb-10 text-center">
            {t("Why Tucson?", "¿Por Qué Tucson?")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {LIFESTYLE_HIGHLIGHTS.map(h => (
              <Card key={h.id} className="bg-white border-cc-sand-dark/20 shadow-soft">
                <CardContent className="p-6 text-center">
                  <span className="text-3xl mb-3 block">{h.emoji}</span>
                  <h3 className="font-serif text-lg font-bold text-cc-navy mb-2">
                    {language === 'es' ? h.stat.es : h.stat.en}
                  </h3>
                  <p className="text-sm text-cc-charcoal/70 leading-relaxed">
                    {language === 'es' ? h.detail.es : h.detail.en}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Events Calendar */}
      <section className="bg-cc-sand py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-2 justify-center mb-3">
            <Calendar className="w-5 h-5 text-cc-gold" />
            <h2 className="font-serif text-3xl font-bold text-cc-navy">
              {t("Tucson Events Calendar", "Calendario de Eventos de Tucson")}
            </h2>
          </div>
          <p className="text-center text-cc-charcoal/60 mb-10 max-w-xl mx-auto">
            {t(
              "Signature events that define life in Tucson — something for every season.",
              "Eventos emblemáticos que definen la vida en Tucson — algo para cada temporada."
            )}
          </p>

          {/* Season Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveSeason('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeSeason === 'all' ? 'bg-cc-navy text-white' : 'bg-white text-cc-charcoal/70 hover:bg-cc-navy/10'
              }`}
            >
              {t("All Seasons", "Todas")}
            </button>
            {SEASONS.map(s => (
              <button
                key={s}
                onClick={() => setActiveSeason(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeSeason === s ? 'bg-cc-navy text-white' : 'bg-white text-cc-charcoal/70 hover:bg-cc-navy/10'
                }`}
              >
                {language === 'es' ? SEASON_LABELS[s].es : SEASON_LABELS[s].en}
              </button>
            ))}
          </div>

          {/* Event Cards */}
          <div className="grid md:grid-cols-2 gap-5">
            {filteredEvents.map(event => (
              <Card key={event.id} className="bg-white border-cc-sand-dark/20 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs bg-cc-navy/5 text-cc-navy/70 px-2.5 py-1 rounded-full font-medium">
                      {language === 'es' ? EVENT_CATEGORY_LABELS[event.category].es : EVENT_CATEGORY_LABELS[event.category].en}
                    </span>
                    <span className="text-xs text-cc-charcoal/50">
                      {event.month}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-cc-navy mb-2">
                    {language === 'es' ? event.name.es : event.name.en}
                  </h3>
                  <p className="text-sm text-cc-charcoal/70 leading-relaxed">
                    {language === 'es' ? event.description.es : event.description.en}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Kasandra's Picks */}
      <section className="bg-cc-ivory py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-2 justify-center mb-3">
            <Heart className="w-5 h-5 text-cc-gold" />
            <h2 className="font-serif text-3xl font-bold text-cc-navy">
              {t("What I Love About Tucson", "Lo Que Amo de Tucson")}
            </h2>
          </div>
          <p className="text-center text-cc-charcoal/60 mb-10">
            {t("Personal favorites from someone who's lived here 20+ years.", "Favoritos personales de alguien que ha vivido aquí más de 20 años.")}
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {KASANDRA_PICKS.map(pick => (
              <Card key={pick.id} className="bg-white border-cc-sand-dark/20 shadow-soft">
                <CardContent className="p-6">
                  <h3 className="font-serif text-lg font-bold text-cc-navy mb-3">
                    {language === 'es' ? pick.title.es : pick.title.en}
                  </h3>
                  <p className="text-sm text-cc-charcoal/70 leading-relaxed italic">
                    "{language === 'es' ? pick.blurb.es : pick.blurb.en}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhood Connection CTA */}
      <section className="bg-cc-navy py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <MapPin className="w-8 h-8 text-cc-gold mx-auto mb-4" />
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-4">
            {t("Find Your Tucson Neighborhood", "Encuentra Tu Vecindario en Tucson")}
          </h2>
          <p className="text-white/70 mb-8">
            {t(
              "Love what Tucson has to offer? Explore neighborhoods that match your lifestyle — from family-friendly Marana to vibrant downtown living.",
              "¿Te encanta lo que Tucson ofrece? Explora vecindarios que coincidan con tu estilo de vida — desde Marana para familias hasta la vibrante vida del centro."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold">
              <Link to="/neighborhoods">
                {t("Explore Neighborhoods", "Explorar Vecindarios")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10">
              <Link to="/buy">
                {t("Start Your Home Search", "Comienza Tu Búsqueda")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

const V2TucsonLiving = () => (
  <V2Layout>
    <V2TucsonLivingContent />
  </V2Layout>
);

export default V2TucsonLiving;
