/**
 * Selena Floating Chat Button
 * Bottom-right FAB for opening the chat drawer
 * Gold bubble with bilingual hover tooltip
 */

import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getGuideById } from '@/lib/guides/guideRegistry';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SelenaFloatingButton() {
  const { isOpen, toggleChat, openChat } = useSelenaChat();
  const location = useLocation();
  const { language } = useLanguage();

  const handleClick = () => {
    if (isOpen) {
      toggleChat();
      return;
    }
    
    const guideMatch = location.pathname.match(/^\/v2\/guides\/(.+)$/);
    if (guideMatch) {
      const guideId = guideMatch[1];
      const entry = getGuideById(guideId);
      if (entry) {
        openChat({
          source: 'guide_handoff',
          guideId,
          guideTitle: language === 'es' ? entry.titleEs : entry.titleEn,
          guideCategory: entry.category,
        });
        return;
      }
    }
    
    openChat({
      source: 'floating',
    });
  };

  const buttonEl = (
    <button
      onClick={handleClick}
      className={cn(
        "fixed right-4 z-50 lg:bottom-6",
        "bottom-[calc(6rem+env(safe-area-inset-bottom,0px))]",
        "w-14 h-14 rounded-full",
        "bg-cc-gold text-cc-navy",
        "shadow-lg hover:shadow-xl",
        "flex items-center justify-center",
        "transition-all duration-300 ease-out",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-cc-gold/50 focus:ring-offset-2",
        "sm:right-6"
      )}
      aria-label={isOpen ? "Close chat" : "Open chat with Selena"}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <>
          <MessageCircle className="w-6 h-6" />
          {/* Live presence indicator — Selena is a 24/7 system, signal it visually */}
          <span
            className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5"
            aria-label="Selena is available now"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-cc-gold" />
          </span>
        </>
      )}
    </button>
  );

  if (isOpen) return buttonEl;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonEl}
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-cc-navy text-white border-cc-navy">
          <span className="block text-sm">{language === 'es' ? 'Hablar con Selena' : 'Chat with Selena'}</span>
          <span className="flex items-center gap-1.5 text-[10px] text-white/70 mt-0.5">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {language === 'es' ? 'En línea ahora' : 'Online now'}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
