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
  const { isOpen, toggleChat, openChat, messages } = useSelenaChat();
  const location = useLocation();
  const { language } = useLanguage();
  
  const hasMessages = messages.length > 0;
  
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
        "fixed bottom-24 right-4 z-50 lg:bottom-6",
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
          {!hasMessages && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
          )}
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
          {language === 'es' ? 'Hablar con Selena' : 'Chat with Selena'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
