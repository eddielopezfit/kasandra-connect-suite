import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryColor, type GuideColorCategory } from "@/lib/guides/categoryColors";
import { useLanguage } from "@/contexts/LanguageContext";

export interface CategoryItem {
  id: string;
  label: string;
  labelEs: string;
  icon: React.ComponentType<{ className?: string }>;
  desc?: string;
  descEs?: string;
}

interface ResponsiveCategoryNavProps {
  categories: CategoryItem[];
  activeCategory: string;
  onCategorySelect: (categoryId: string) => void;
  className?: string;
}

/**
 * Responsive Category Navigation
 * 
 * Behavior by breakpoint:
 * - Desktop (≥1024px): Chips wrap to second row if needed, centered
 * - Tablet (768-1023px): Horizontal scroll with fade affordances
 * - Mobile (<768px): Horizontal scroll with fade, touch-optimized
 * 
 * Features:
 * - Color-coded chips using CATEGORY_COLORS
 * - Scroll fade gradients for discoverability
 * - Touch-friendly 44px+ tap targets
 * - Keyboard accessible
 */
export function ResponsiveCategoryNav({
  categories,
  activeCategory,
  onCategorySelect,
  className,
}: ResponsiveCategoryNavProps) {
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to show/hide fade gradients
  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  // Scroll by a fixed amount when clicking chevrons
  const scrollBy = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = direction === "left" ? -200 : 200;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Scroll active chip into view on mount or change
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const activeChip = container.querySelector(`[data-category="${activeCategory}"]`);
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeCategory]);

  return (
    <nav 
      className={cn(
        "relative w-full",
        className
      )}
      role="navigation"
      aria-label={t("Guide categories", "Categorías de guías")}
    >
      {/* Desktop: Wrapped flex layout */}
      <div className="hidden lg:flex flex-wrap gap-2 sm:gap-3 justify-center">
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            onClick={() => onCategorySelect(category.id)}
          />
        ))}
      </div>

      {/* Tablet & Mobile: Horizontal scroll with affordances */}
      <div className="lg:hidden relative">
        {/* Left fade gradient */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-cc-sand to-transparent z-10 pointer-events-none transition-opacity duration-200",
            canScrollLeft ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        />
        
        {/* Left scroll button (tablet only) */}
        <button
          onClick={() => scrollBy("left")}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-md border border-cc-sand-dark/30 transition-opacity duration-200",
            canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-label={t("Scroll left", "Desplazar a la izquierda")}
          tabIndex={canScrollLeft ? 0 : -1}
        >
          <ChevronLeft className="w-4 h-4 text-cc-charcoal" />
        </button>

        {/* Scrollable chip container */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth",
            "pb-2 -mb-2", // Extra padding for touch & shadow visibility
            "px-1 md:px-8", // Padding for fade/chevrons on tablet
            "snap-x snap-mandatory" // Smooth snap scrolling
          )}
          style={{ 
            WebkitOverflowScrolling: "touch",
            scrollPaddingLeft: "8px",
            scrollPaddingRight: "8px",
          }}
        >
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onClick={() => onCategorySelect(category.id)}
              className="snap-start flex-shrink-0"
            />
          ))}
        </div>

        {/* Right fade gradient */}
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-cc-sand to-transparent z-10 pointer-events-none transition-opacity duration-200",
            canScrollRight ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        />

        {/* Right scroll button (tablet only) */}
        <button
          onClick={() => scrollBy("right")}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-md border border-cc-sand-dark/30 transition-opacity duration-200",
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-label={t("Scroll right", "Desplazar a la derecha")}
          tabIndex={canScrollRight ? 0 : -1}
        >
          <ChevronRight className="w-4 h-4 text-cc-charcoal" />
        </button>
      </div>
    </nav>
  );
}

/**
 * Individual category chip with color-coding
 */
interface CategoryChipProps {
  category: CategoryItem;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

function CategoryChip({ category, isActive, onClick, className }: CategoryChipProps) {
  const { t } = useLanguage();
  const Icon = category.icon;
  const colors = getCategoryColor(category.id as GuideColorCategory);

  return (
    <button
      data-category={category.id}
      onClick={onClick}
      className={cn(
        // Base styles
        "inline-flex items-center gap-1.5 sm:gap-2",
        "px-3 sm:px-4 py-2.5", // 44px+ touch target
        "rounded-full text-xs sm:text-sm font-medium",
        "transition-all duration-200 whitespace-nowrap",
        "border focus:outline-none focus:ring-2 focus:ring-cc-gold/50 focus:ring-offset-2",
        // Color states
        isActive ? colors.strong + " shadow-md" : colors.subtle,
        className
      )}
      aria-pressed={isActive}
      aria-label={t(category.label, category.labelEs)}
    >
      <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isActive ? "" : colors.icon)} />
      <span>{t(category.label, category.labelEs)}</span>
    </button>
  );
}

export default ResponsiveCategoryNav;
