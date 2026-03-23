import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { logCTAClick } from "@/lib/analytics/ctaDefaults";

interface StickyMobileBookingBarProps {
  intent: "buy" | "sell";
  source: string;
}

const StickyMobileBookingBar = ({ intent, source }: StickyMobileBookingBarProps) => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
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
      <div className="flex items-center gap-2">
        <Link
          to={`/book?intent=${intent}&source=${source}`}
          onClick={() => logCTAClick({ cta_name: `sticky_mobile_book_${intent}`, destination: '/book', page_path: `/${intent === 'sell' ? 'sell' : 'buy'}`, intent })}
          className="flex-1 flex items-center justify-center gap-2 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-3 text-sm shadow-gold transition-colors active:scale-[0.98] touch-action-manipulation"
        >
          <Calendar className="w-4 h-4" />
          {t("Book a Strategy Call", "Agenda Llamada")}
        </Link>
        <button
          onClick={() => openChat({ source: intent === 'buy' ? 'sticky_mobile_buy' : 'sticky_mobile_sell', intent })}
          className="flex items-center justify-center gap-1.5 border border-cc-gold/40 text-cc-gold rounded-full py-3 px-4 text-sm font-medium hover:bg-cc-gold/10 transition-colors active:scale-[0.98] touch-action-manipulation"
        >
          <MessageCircle className="w-4 h-4" />
          {t("Selena", "Selena")}
        </button>
      </div>
    </div>
  );
};

export default StickyMobileBookingBar;
