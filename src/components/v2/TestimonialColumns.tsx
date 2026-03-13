import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import {
  column1Testimonials,
  column2Testimonials,
  column3Testimonials,
  type Testimonial,
} from "@/data/testimonials";

/* ─── Single testimonial card ────────────────────────────── */
function TestimonialColumnCard({ testimonial }: { testimonial: Testimonial }) {
  const { language } = useLanguage();
  const content = testimonial.content[language];

  return (
    <div className="group rounded-2xl border border-cc-gold/20 bg-white/[0.06] p-6 backdrop-blur-sm transition-all duration-300 hover:border-cc-gold/40 hover:bg-white/[0.10] hover:shadow-[0_0_24px_rgba(225,181,74,0.08)]">
      {/* Stars */}
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: testimonial.stars }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-cc-gold text-cc-gold"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="mb-5 font-serif text-[15px] italic leading-relaxed text-white/90">
        "{content}"
      </p>

      {/* Attribution */}
      <div className="flex items-center justify-between">
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

/* ─── Column wrapper ─────────────────────────────────────── */
function Column({
  testimonials,
  className = "",
}: {
  testimonials: Testimonial[];
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      {testimonials.map((t) => (
        <TestimonialColumnCard key={t.id} testimonial={t} />
      ))}
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

        {/* 3-column staggered masonry */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Column testimonials={column1Testimonials} />
          <Column testimonials={column2Testimonials} className="lg:mt-10" />
          <Column testimonials={column3Testimonials} className="md:col-span-2 lg:col-span-1" />
        </div>
      </div>
    </section>
  );
}
