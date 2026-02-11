/**
 * Selena Floating Chat Button
 * Bottom-right FAB for opening the chat drawer
 * 
 * On guide pages: always uses openChat with full guide context (never toggleChat)
 * On other pages: uses openChat with page path context
 */

import { MessageCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getGuideById } from '@/lib/guides/guideRegistry';
import { cn } from '@/lib/utils';

export function SelenaFloatingButton() {
  const { isOpen, toggleChat, openChat, messages } = useSelenaChat();
  const location = useLocation();
  const { language } = useLanguage();
  
  const hasMessages = messages.length > 0;
  
  const handleClick = () => {
    // Close action is always toggle
    if (isOpen) {
      toggleChat();
      return;
    }
    
    // Guide pages: always openChat with full guide context
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
    
    // All other pages: openChat with page path (never bare toggleChat)
    openChat({
      source: 'floating',
    });
  };
  
  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "w-14 h-14 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-lg hover:shadow-xl",
        "flex items-center justify-center",
        "transition-all duration-300 ease-out",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        "sm:bottom-6 sm:right-6"
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
}
