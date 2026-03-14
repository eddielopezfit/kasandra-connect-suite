import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { allTestimonials, type Testimonial } from "@/data/testimonials";
import { useState } from "react";

/* ─── Single testimonial card ────────────────────────────── */
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { language } = useLanguage();
  const content = testimonial.content[language];

  return (
    <div className="flex flex-col rounded-2xl border border-cc-gold/20 bg-white/[0.06] p-6 backdrop-blur-sm transition-all duration-300 hover:border-cc-gold/40 hover:bg-white/[0.10] hover:shadow-[0_0_24px_rgba(225,181,74,0.08)]">
      {/* Stars */}
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: testimonial.stars }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-cc-gold text-cc-gold" />
        ))}
      </div>

      {/* Quote — flex-1 pushes attribution to bottom */}
      <p className="mb-5 flex-1 font-serif text-[15px] italic leading-relaxed text-white/90">
        "{content}"
      </p>

      {/* Attribution — always at bottom */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
        <span className="text-sm font-semibold text-cc-gold">
          — {testimonial.clientName}
        </span>
        <Badge
          variant="outline"
          className="border-white/15 bg-white/[0.06] text-[10px] font-medium tracking-wide text-white/50"
        >
          {testimonial.source}
        </Badge>
      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────── */
export default function TestimonialColumns() {
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const visibleTestimonials = showAll ? allTestimonials : allTestimonials.slice(0, 6);
  const hiddenCount = allTestimonials.length - 6;

  return (
    <section className="bg-cc-navy py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block font-sans text-xs font-semibold uppercase tracking-[0.2em] text-cc-gold">
            {t("What My Clients Say", "Lo Que Dicen Mis Clientes")}
          </span>
          <h2 className="font-serif text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {t("Real Stories, Real Results", "Historias Reales, Resultados Reales")}
          </h2>
          <p className="mt-4 text-white/50 text-sm">
            {t("4.9 stars · 126+ verified reviews", "4.9 estrellas · 126+ reseñas verificadas")}
          </p>
        </div>

        {/* 3-column grid — first 6 always visible */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Show more / show less toggle */}
        <div className="mt-10 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 rounded-full border border-cc-gold/30 px-6 py-3 text-sm font-semibold text-cc-gold transition-all duration-200 hover:border-cc-gold hover:bg-cc-gold/10"
          >
            {showAll ? (
              <>
                {t("Show less", "Ver menos")}
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                {t(`See all ${hiddenCount + 6} reviews`, `Ver las ${hiddenCount + 6} reseñas`)}
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
