import { Link } from "react-router-dom";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useYouTubeVideos } from "@/hooks/useYouTubeVideos";
import { format } from "date-fns";

const PodcastSection = () => {
  const { t } = useLanguage();
  const { data: videos, isLoading, error } = useYouTubeVideos(4);

  return (
    <section id="podcast" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 block">
            {t("The Podcast", "El Podcast")}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Lifting You Up
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(
              "Join me for inspiring conversations with community leaders, entrepreneurs, and changemakers who are lifting up the Tucson community.",
              "Únete a conversaciones inspiradoras con líderes comunitarios, empresarios y agentes de cambio que están elevando a la comunidad de Tucson."
            )}
          </p>
        </div>

        {/* Episode Cards Carousel */}
        <div className="relative animate-fade-up animation-delay-200">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                {t("Loading episodes...", "Cargando episodios...")}
              </span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {t("New episodes are available on YouTube.", "Nuevos episodios están disponibles en YouTube.")}
              </p>
              <a
                href="https://www.youtube.com/@KasandraPrietoTucson/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                {t("View on YouTube", "Ver en YouTube")}
              </a>
            </div>
          )}

          {!isLoading && !error && videos && videos.length > 0 && (
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={video.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-80 snap-center bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-luxury transition-all duration-300 border border-border group"
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
                      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-accent-foreground ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
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
          )}
        </div>

        <div className="text-center mt-12 animate-fade-up animation-delay-400">
          <Button variant="accent" size="lg" className="rounded-full" asChild>
            <Link to="/podcast/episodes">
              {t("View All Episodes", "Ver Todos los Episodios")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PodcastSection;
