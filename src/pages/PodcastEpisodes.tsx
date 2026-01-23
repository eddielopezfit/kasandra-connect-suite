import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useYouTubeVideos } from "@/hooks/useYouTubeVideos";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Play, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const PodcastEpisodes = () => {
  const { t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(12);
  const { data: videos, isLoading, error } = useYouTubeVideos(50);

  const visibleVideos = videos?.slice(0, visibleCount) || [];
  const hasMore = videos && visibleCount < videos.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary to-navy-dark">
        <div className="container mx-auto px-4">
          <Link
            to="/#podcast"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("Back to Home", "Volver al Inicio")}
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            {t("All Episodes", "Todos los Episodios")}
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            {t(
              "Explore all episodes of Lifting You Up with Kasandra Prieto. Inspiring conversations about community, leadership, and generational wealth.",
              "Explore todos los episodios de Lifting You Up con Kasandra Prieto. Conversaciones inspiradoras sobre comunidad, liderazgo y riqueza generacional."
            )}
          </p>
        </div>
      </section>

      {/* Episodes Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">
                {t("Loading episodes...", "Cargando episodios...")}
              </span>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-6">
                {t(
                  "New episodes are available on YouTube.",
                  "Nuevos episodios están disponibles en YouTube."
                )}
              </p>
              <a
                href="https://www.youtube.com/@KasandraPrietoTucson/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                {t("View on YouTube", "Ver en YouTube")}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {!isLoading && !error && visibleVideos.length > 0 && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleVideos.map((video) => (
                  <a
                    key={video.id}
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-luxury transition-all duration-300 border border-border group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shadow-gold opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                          <Play className="w-5 h-5 text-accent-foreground ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-5">
                      <span className="text-xs font-medium text-accent uppercase tracking-wider">
                        {format(new Date(video.publishedAt), "MMM d, yyyy")}
                      </span>
                      <h3 className="font-serif font-semibold text-card-foreground mt-2 line-clamp-2">
                        {video.title}
                      </h3>
                    </div>
                  </a>
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-12">
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                  >
                    {t("Load More", "Cargar Más")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PodcastEpisodes;
