import { useLanguage } from "@/contexts/LanguageContext";
import { useGoogleReviews, type GoogleReview, type ReviewsSource } from "@/hooks/useGoogleReviews";
import { Star } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

/** Render n filled stars out of 5 */
const Stars = ({ count }: { count: number }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < count ? "fill-cc-gold text-cc-gold" : "text-cc-ivory/20"
        }`}
      />
    ))}
  </div>
);

function SplitText({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.02 }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

const GoogleReviewsSection = () => {
  const { t } = useLanguage();
  const { data, isLoading } = useGoogleReviews();
  const reviews = data?.reviews ?? [];
  const reviewsSource: ReviewsSource = data?.source ?? "fallback";
  const isVerifiedGoogle = reviewsSource === "live" || reviewsSource === "cache";

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handleNext = () => {
    if (reviews.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  // Loading state
  if (isLoading || reviews.length === 0) {
    return (
      <section className="py-16 lg:py-20 bg-cc-navy">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
              {t("Client Reviews", "Reseñas de Clientes")}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-ivory mt-2">
              {t("What Clients Are Saying", "Lo Que Dicen los Clientes")}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[300px]">
            {isLoading ? (
              <p className="font-serif text-2xl md:text-3xl text-cc-ivory/40 italic text-center">
                "{t("Loading client stories...", "Cargando historias de clientes...")}"
              </p>
            ) : (
              /* Fallback when no reviews at all */
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-cc-gold text-cc-gold" />
                  ))}
                </div>
                <p className="text-4xl font-serif font-bold text-cc-ivory">4.9</p>
                <a
                  href="https://www.google.com/maps/place/Kasandra+Prieto+-+Realtor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-cc-gold hover:text-cc-gold-dark underline underline-offset-4 text-sm font-medium transition-colors"
                >
                  {t("See all reviews on Google", "Ver todas las reseñas en Google")}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  const current = reviews[activeIndex];

  return (
    <section className="py-16 lg:py-20 bg-cc-navy">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="text-cc-gold font-semibold text-sm tracking-wider uppercase">
            {t("Client Reviews", "Reseñas de Clientes")}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-ivory mt-2">
            {t("What Clients Are Saying", "Lo Que Dicen los Clientes")}
          </h2>
          {isVerifiedGoogle && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <img
                src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
                alt="Google"
                className="h-5 w-5"
              />
              <span className="text-sm text-cc-ivory/50">
                {t("Verified Google Reviews", "Reseñas Verificadas de Google")}
              </span>
            </div>
          )}
        </div>

        {/* Interactive testimonial area */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleNext}
          className="relative max-w-4xl mx-auto cursor-none select-none min-h-[320px] md:min-h-[360px] flex flex-col justify-center"
          role="region"
          aria-label={t("Client testimonials", "Testimonios de clientes")}
          aria-roledescription="carousel"
        >
          {/* Custom magnetic cursor — desktop only */}
          <motion.div
            className="pointer-events-none fixed top-0 left-0 z-50 hidden lg:block"
            style={{ x: cursorX, y: cursorY }}
          >
            <motion.div
              initial={false}
              animate={{
                scale: isHovered ? 1 : 0,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="relative -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-16 h-16 rounded-full bg-cc-gold flex items-center justify-center">
                <span className="text-cc-navy text-xs font-semibold">Next</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Pagination indicator */}
          <div className="absolute top-0 right-0 text-sm font-mono tracking-wide flex items-baseline gap-1">
            <span className="text-cc-gold text-lg font-bold">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span className="text-cc-ivory/30">/</span>
            <span className="text-cc-ivory/30">
              {String(reviews.length).padStart(2, "0")}
            </span>
          </div>

          {/* Quote */}
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] text-cc-ivory leading-snug tracking-tight mb-10"
            >
              "<SplitText text={current.text} />"
            </motion.blockquote>
          </AnimatePresence>

          {/* Attribution */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`attr-${activeIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="flex items-center gap-4"
            >
              {/* Gold accent line */}
              <div className="w-10 h-px bg-cc-gold" />

              {/* Photo if available */}
              {current.photo && (
                <img
                  src={current.photo}
                  alt={current.author}
                  className="w-10 h-10 rounded-full object-cover border border-cc-ivory/10"
                />
              )}

              <div>
                <div className="flex items-center gap-3">
                  <span className="text-cc-ivory font-semibold text-sm">
                    {current.author}
                  </span>
                  <Stars count={current.rating} />
                </div>
                <span className="text-cc-ivory/40 text-xs">
                  {current.time}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-cc-ivory/10">
            <motion.div
              key={`progress-${activeIndex}`}
              className="h-full bg-cc-gold/60"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 6, ease: "linear" }}
              onAnimationComplete={handleNext}
            />
          </div>

          {/* Mobile tap hint */}
          <p className="absolute -bottom-8 left-0 right-0 text-center text-cc-ivory/20 text-xs lg:hidden">
            {t("Tap for next review", "Toca para la siguiente reseña")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviewsSection;
