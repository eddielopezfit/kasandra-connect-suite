import { useLanguage } from "@/contexts/LanguageContext";
import { useGoogleReviews, GoogleReview } from "@/hooks/useGoogleReviews";
import { Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef, useState, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";

const ReviewCard = ({ review }: { review: GoogleReview }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-elevated border border-cc-sand-dark/30 flex flex-col h-full min-h-[220px]">
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-cc-gold text-cc-gold" />
        ))}
      </div>
      <blockquote className="text-cc-charcoal italic flex-1 mb-4 line-clamp-4">
        "{review.text}"
      </blockquote>
      <div className="flex items-center gap-3 mt-auto">
        {review.photo && (
          <img
            src={review.photo}
            alt={review.author}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-semibold text-cc-navy text-sm">{review.author}</p>
          <p className="text-xs text-cc-muted">{review.time}</p>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="flex gap-4 overflow-hidden">
    {[1, 2, 3].map((i) => (
      <div 
        key={i} 
        className={`flex-shrink-0 bg-white rounded-xl p-6 shadow-elevated border border-cc-sand-dark/30 w-full md:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] ${i > 1 ? 'hidden md:block' : ''} ${i > 2 ? 'md:hidden lg:block' : ''}`}
      >
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-20 w-full mb-4" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const GoogleReviewsSection = () => {
  const { t } = useLanguage();
  const { data: reviews, isLoading, error } = useGoogleReviews();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const autoplayPlugin = useRef(
    Autoplay({ 
      delay: 4000, 
      stopOnInteraction: false, 
      stopOnMouseEnter: true 
    })
  );

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Don't render the section if there are no reviews or there's an error
  if (error || (!isLoading && (!reviews || reviews.length === 0))) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-cc-sand">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
            {t("Client Reviews", "Reseñas de Clientes")}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mt-2">
            {t("What Clients Are Saying", "Lo Que Dicen los Clientes")}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <img
              src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
              alt="Google"
              className="h-5 w-5"
            />
            <span className="text-sm text-cc-muted">
              {t("Verified Google Reviews", "Reseñas Verificadas de Google")}
            </span>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="relative">
            <Carousel
              setApi={setApi}
              opts={{
                loop: true,
                align: "start",
              }}
              plugins={[autoplayPlugin.current]}
              className="w-full overflow-hidden"
            >
              <CarouselContent className="-ml-4">
                {reviews?.map((review, index) => (
                  <CarouselItem 
                    key={index} 
                    className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    <ReviewCard review={review} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Navigation arrows - hidden on mobile */}
              <CarouselPrevious className="hidden sm:flex -left-4 lg:-left-6" />
              <CarouselNext className="hidden sm:flex -right-4 lg:-right-6" />
            </Carousel>

            {/* Dot indicators */}
            {count > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      current === index 
                        ? "bg-cc-gold w-6" 
                        : "bg-cc-sand-dark hover:bg-cc-gold/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default GoogleReviewsSection;
