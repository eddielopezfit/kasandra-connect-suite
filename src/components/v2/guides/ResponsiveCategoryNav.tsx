import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryColor, type GuideColorCategory } from "@/lib/guides/categoryColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

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

// Primary categories to show on mobile (order matters)
const PRIMARY_CATEGORY_IDS = ["all", "buying", "selling", "valuation"];

/**
 * Responsive Category Navigation
 * 
 * Behavior by breakpoint:
 * - Desktop (≥1024px): Chips wrap to second row if needed, centered
 * - Tablet (768-1023px): Horizontal scroll with fade affordances + chevrons
 * - Mobile (<768px): 4 primary chips + "More" button → bottom sheet
 * 
 * Features:
 * - Color-coded chips using CATEGORY_COLORS
 * - 2-tier mobile nav with bottom sheet
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
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Build primary categories list for mobile
  // If active category is not in primary set, replace the 4th slot with it
  const getPrimaryCategories = useCallback(() => {
    const primaryCats = categories.filter(c => PRIMARY_CATEGORY_IDS.includes(c.id));
    const activeIsInPrimary = PRIMARY_CATEGORY_IDS.includes(activeCategory);
    
    if (!activeIsInPrimary && activeCategory !== "all") {
      const activeCat = categories.find(c => c.id === activeCategory);
      if (activeCat) {
        // Replace the last primary (valuation) with active category
        return [...primaryCats.slice(0, 3), activeCat];
      }
    }
    return primaryCats;
  }, [categories, activeCategory]);

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

  // Scroll active chip into view on mount or change (tablet only)
  useEffect(() => {
    if (isMobile) return; // Don't scroll on mobile (uses sheet)
    
    const container = scrollContainerRef.current;
    if (!container) return;

    const activeChip = container.querySelector(`[data-category="${activeCategory}"]`);
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeCategory, isMobile]);

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
    setIsSheetOpen(false);
  };

  const primaryCategories = getPrimaryCategories();

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

      {/* Tablet: Horizontal scroll with affordances */}
      <div className="hidden md:block lg:hidden relative">
        {/* Left fade gradient */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-cc-sand via-cc-sand/80 to-transparent z-10 pointer-events-none transition-opacity duration-200",
            canScrollLeft ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        />
        
        {/* Left scroll button */}
        <button
          onClick={() => scrollBy("left")}
          className={cn(
            "absolute left-1 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/95 shadow-md border border-cc-sand-dark/30 transition-opacity duration-200",
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
            "py-2 px-10", // Padding for fade/chevrons
            "snap-x snap-mandatory"
          )}
          style={{ 
            WebkitOverflowScrolling: "touch",
            scrollPaddingLeft: "40px",
            scrollPaddingRight: "40px",
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
            "absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-cc-sand via-cc-sand/80 to-transparent z-10 pointer-events-none transition-opacity duration-200",
            canScrollRight ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        />

        {/* Right scroll button */}
        <button
          onClick={() => scrollBy("right")}
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white/95 shadow-md border border-cc-sand-dark/30 transition-opacity duration-200",
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-label={t("Scroll right", "Desplazar a la derecha")}
          tabIndex={canScrollRight ? 0 : -1}
        >
          <ChevronRight className="w-4 h-4 text-cc-charcoal" />
        </button>
      </div>

      {/* Mobile: 2-Tier Nav with Primary Row + More Sheet */}
      <div className="md:hidden">
        {/* Primary chips row */}
        <div className="flex items-center gap-2 justify-center flex-wrap">
          {primaryCategories.map((category) => (
            <CategoryChip
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onClick={() => onCategorySelect(category.id)}
              compact
            />
          ))}
          
          {/* More button */}
          <button
            onClick={() => setIsSheetOpen(true)}
            className={cn(
              "inline-flex items-center gap-1.5",
              "px-3 py-2.5 min-h-[44px]",
              "rounded-full text-xs font-medium",
              "bg-white text-cc-charcoal border border-cc-sand-dark/50",
              "hover:bg-cc-sand hover:border-cc-sand-dark",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-cc-gold/50 focus:ring-offset-2"
            )}
            aria-label={t("More categories", "Más categorías")}
            aria-haspopup="dialog"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>{t("More", "Más")}</span>
          </button>
        </div>
        
        {/* Microcopy hint */}
        <p className="text-center text-xs text-cc-slate/70 mt-2">
          {t(
            "Tap More to see all categories",
            "Toca Más para ver todas las categorías"
          )}
        </p>

        {/* Category Sheet (Bottom Drawer) */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent 
            side="bottom" 
            className="rounded-t-2xl max-h-[70vh] overflow-y-auto"
          >
            <SheetHeader className="pb-4 border-b border-cc-sand-dark/30">
              <SheetTitle className="text-lg font-semibold text-cc-charcoal">
                {t("All Categories", "Todas las Categorías")}
              </SheetTitle>
            </SheetHeader>
            
            <div className="py-4">
              {/* 2-column grid of all categories */}
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <CategorySheetItem
                    key={category.id}
                    category={category}
                    isActive={activeCategory === category.id}
                    onClick={() => handleCategorySelect(category.id)}
                  />
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
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
  compact?: boolean;
}

function CategoryChip({ category, isActive, onClick, className, compact = false }: CategoryChipProps) {
  const { t } = useLanguage();
  const Icon = category.icon;
  const colors = getCategoryColor(category.id as GuideColorCategory);

  return (
    <button
      type="button"
      data-category={category.id}
      onClick={onClick}
      className={cn(
        // Base styles
        "inline-flex items-center gap-1.5",
        compact ? "px-2.5 py-2 min-h-[44px]" : "px-3 sm:px-4 py-2.5 min-h-[44px]",
        "rounded-full text-xs font-medium",
        "transition-all duration-200 whitespace-nowrap",
        "border focus:outline-none focus:ring-2 focus:ring-cc-gold/50 focus:ring-offset-2",
        // Color states
        isActive ? colors.strong + " shadow-md" : colors.subtle,
        className
      )}
      aria-pressed={isActive}
      aria-label={t(category.label, category.labelEs)}
    >
      <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", isActive ? "" : colors.icon)} />
      <span className="truncate max-w-[80px] sm:max-w-none">
        {compact && category.id === "all" 
          ? t("All", "Todo")
          : compact && category.id === "buying"
          ? t("Buying", "Comprar")
          : compact && category.id === "selling"
          ? t("Selling", "Vender")
          : compact && category.id === "valuation"
          ? t("Value", "Valor")
          : t(category.label, category.labelEs)
        }
      </span>
    </button>
  );
}

/**
 * Category item for the bottom sheet (larger touch target)
 */
interface CategorySheetItemProps {
  category: CategoryItem;
  isActive: boolean;
  onClick: () => void;
}

function CategorySheetItem({ category, isActive, onClick }: CategorySheetItemProps) {
  const { t } = useLanguage();
  const Icon = category.icon;
  const colors = getCategoryColor(category.id as GuideColorCategory);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 p-3 rounded-xl text-left w-full min-h-[52px]",
        "border transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-cc-gold/50 focus:ring-offset-2",
        isActive 
          ? colors.strong + " shadow-md" 
          : "bg-white border-cc-sand-dark/50 hover:bg-cc-sand/50"
      )}
      aria-pressed={isActive}
    >
      <Icon className={cn(
        "w-5 h-5 flex-shrink-0",
        isActive ? "" : colors.icon
      )} />
      <span className={cn(
        "text-sm font-medium leading-tight",
        isActive ? "" : "text-cc-charcoal"
      )}>
        {t(category.label, category.labelEs)}
      </span>
    </button>
  );
}

export default ResponsiveCategoryNav;
