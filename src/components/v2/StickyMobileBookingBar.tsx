import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { logCTAClick } from "@/lib/analytics/ctaDefaults";

interface StickyMobileBookingBarProps {
  intent: "buy" | "sell";
  source: string;
}

const StickyMobileBookingBar = ({ intent, source }: StickyMobileBookingBarProps) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isMobile) return;
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  if (!isMobile || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[40] bg-cc-navy/95 backdrop-blur-sm border-t border-cc-gold/20 px-4 py-3 safe-area-pb">
      <Link
        to={`/book?intent=${intent}&source=${source}`}
        onClick={() => logCTAClick({ cta_name: `sticky_mobile_book_${intent}`, destination: '/book', page_path: `/${intent === 'sell' ? 'sell' : 'buy'}`, intent })}
        className="flex items-center justify-center gap-2 w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-3 text-base shadow-gold transition-colors active:scale-[0.98] touch-action-manipulation"
      >
        <Calendar className="w-5 h-5" />
        {t("Book a Strategy Call", "Agenda una Llamada de Estrategia")}
      </Link>
    </div>
  );
};

export default StickyMobileBookingBar;
