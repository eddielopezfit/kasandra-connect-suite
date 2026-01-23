/**
 * Selena Floating Chat Button
 * Bottom-right FAB for opening the chat drawer
 */

import { MessageCircle, X } from 'lucide-react';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { cn } from '@/lib/utils';

export function SelenaFloatingButton() {
  const { isOpen, toggleChat, messages } = useSelenaChat();
  
  // Show notification dot if there are unread messages
  const hasMessages = messages.length > 0;
  
  return (
    <button
      onClick={toggleChat}
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "w-14 h-14 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-lg hover:shadow-xl",
        "flex items-center justify-center",
        "transition-all duration-300 ease-out",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        // Avoid overlap with other widgets
        "sm:bottom-6 sm:right-6"
      )}
      aria-label={isOpen ? "Close chat" : "Open chat with Selena"}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <>
          <MessageCircle className="w-6 h-6" />
          {/* Pulse animation for attention */}
          {!hasMessages && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
          )}
        </>
      )}
    </button>
  );
}
