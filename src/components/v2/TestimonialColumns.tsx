import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { allTestimonials, type Testimonial } from "@/data/testimonials";

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
        </div>

        {/* Uniform 3-column grid — equal card heights via flex-col */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {allTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
