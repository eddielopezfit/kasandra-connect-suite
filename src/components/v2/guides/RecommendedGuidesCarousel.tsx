import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { GuideCardBadge } from "./GuideCardBadge";
import type { RecommendedGuide } from "@/lib/guides/personalization";
import { useRef, useState } from "react";

interface RecommendedGuidesCarouselProps {
  items: RecommendedGuide[];
  onGuideClick: (guideId: string) => void;
  headingEn?: string;
  headingEs?: string;
}

export function RecommendedGuidesCarousel({
  items,
  onGuideClick,
  headingEn = "Recommended For You",
  headingEs = "Recomendado Para Ti",
}: RecommendedGuidesCarouselProps) {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320; // Card width + gap
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 300);
  };
  
  if (items.length === 0) return null;
  
  return (
    <section className="bg-cc-sand py-12 w-full overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
          <h2 className="font-serif text-2xl md:text-3xl text-cc-navy mb-2">
              {t(headingEn, headingEs)}
            </h2>
            <p className="text-cc-slate text-sm">
              {t(
                "Based on what you've explored…",
                "Basado en lo que has explorado…"
              )}
            </p>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-cc-sand-dark hover:bg-white"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-cc-sand-dark hover:bg-white"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Carousel */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4"
        >
          {items.map(({ guide, badgeType }) => (
            <Link
              key={guide.id}
              to={`/guides/${guide.id}`}
              onClick={() => onGuideClick(guide.id)}
              className={cn(
                "group flex-shrink-0 w-[280px] sm:w-[300px] bg-white rounded-xl p-5 border border-cc-sand-dark/50 snap-start",
                "hover:border-cc-gold/50 hover:shadow-elevated transition-all duration-300",
                // Soft gold glow for recommended badge
                badgeType === 'recommended' && "ring-2 ring-cc-gold/20 shadow-[0_0_20px_-5px_rgba(227,178,60,0.3)]"
              )}
            >
              {/* Badge */}
              <div className="mb-3">
                <GuideCardBadge badgeType={badgeType} />
              </div>
              
              {/* Title */}
              <h3 className="font-serif text-lg text-cc-charcoal mb-2 line-clamp-2 group-hover:text-cc-navy transition-colors">
                {t(guide.title, guide.titleEs)}
              </h3>
              
              {/* Description */}
              <p className="text-cc-slate text-sm leading-relaxed mb-4 line-clamp-2">
                {t(guide.description, guide.descriptionEs)}
              </p>
              
              {/* CTA */}
              <div className="flex items-center justify-end mt-auto">
                <span className="flex items-center text-cc-gold font-medium text-sm group-hover:gap-2 transition-all">
                  {t("Get Clarity", "Obtener Claridad")}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
