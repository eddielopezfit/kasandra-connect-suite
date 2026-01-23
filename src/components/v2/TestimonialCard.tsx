import { Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Testimonial } from "@/data/testimonials";

interface TestimonialCardProps {
  testimonial: Testimonial;
  variant?: "primary" | "secondary" | "compact";
}

const TestimonialCard = ({ testimonial, variant = "primary" }: TestimonialCardProps) => {
  const { language } = useLanguage();
  
  const content = testimonial.content[language];
  const role = testimonial.role[language];

  if (variant === "compact") {
    return (
      <div className="bg-white p-5 rounded-xl shadow-soft h-full">
        <p className="text-cc-text-muted italic text-sm mb-4">
          "{content}"
        </p>
        <div className="flex items-center justify-between">
          <span className="text-cc-blue font-semibold text-xs">— {role}</span>
          <span className="text-[10px] text-muted-foreground">{testimonial.source}</span>
        </div>
      </div>
    );
  }

  if (variant === "secondary") {
    return (
      <div className="bg-white rounded-xl p-6 border border-cc-sand-dark/30 shadow-soft">
        <p className="text-cc-charcoal italic text-sm mb-4">
          "{content}"
        </p>
        <div className="flex items-center justify-between">
          <span className="text-cc-navy font-semibold text-sm">— {role}</span>
          <span className="text-xs text-cc-slate">{testimonial.source}</span>
        </div>
      </div>
    );
  }

  // Primary variant (default)
  return (
    <div className="bg-cc-blue-bg p-6 rounded-xl relative">
      <Quote className="w-8 h-8 text-cc-gold/30 absolute top-4 left-4" />
      <div className="pt-8">
        <p className="text-cc-text-muted italic mb-6 leading-relaxed">
          "{content}"
        </p>
        <div className="border-t border-cc-blue/10 pt-4">
          <span className="text-cc-blue font-semibold text-sm block">— {role}</span>
          <span className="text-xs text-muted-foreground">{testimonial.source}</span>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
