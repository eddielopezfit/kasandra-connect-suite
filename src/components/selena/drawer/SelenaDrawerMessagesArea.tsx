import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home, DollarSign, HelpCircle, MapPin } from "lucide-react";
import type { ChatAction, ChatMessage } from "@/contexts/SelenaChatContext";

const EXAMPLE_QUESTIONS = [
  { en: "What's my home worth?", es: "¿Cuánto vale mi casa?", icon: DollarSign },
  { en: "Am I ready to buy?", es: "¿Estoy listo para comprar?", icon: Home },
  { en: "How do cash offers work?", es: "¿Cómo funcionan las ofertas en efectivo?", icon: HelpCircle },
  { en: "What neighborhoods fit my budget?", es: "¿Qué vecindarios se ajustan a mi presupuesto?", icon: MapPin },
];

export function SelenaDrawerMessagesArea({
  messages,
  isLoading,
  onActionClick,
  onMessagesAreaClick,
  onSendMessage,
  scrollRef,
  bottomRef,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  onActionClick: (action: ChatAction) => void;
  onMessagesAreaClick: () => void;
  onSendMessage?: (text: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
}) {
  const { language } = useLanguage();
  const t = (en: string, es: string) => language === 'es' ? es : en;

  return (
    // ⚠️ SCROLL STABILITY: This ScrollArea MUST persist across renders.
    // NEVER wrap in conditional rendering or add key={...} that changes during chat.
    // The bottomRef at the end anchors scroll position after new messages.
    <ScrollArea
      className="flex-1 min-h-0 p-4"
      ref={scrollRef}
      onClick={onMessagesAreaClick}
      style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      <div className="space-y-4 pb-2">
        {/* Empty-state example questions (P4) */}
        {messages.length === 0 && !isLoading && onSendMessage && (
          <div className="space-y-3 py-4">
            <p className="text-xs text-muted-foreground text-center mb-3">
              {t("Try asking:", "Intenta preguntar:")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EXAMPLE_QUESTIONS.map((q) => {
                const Icon = q.icon;
                return (
                  <button
                    key={q.en}
                    onClick={() => onSendMessage(t(q.en, q.es))}
                    className={cn(
                      "flex items-start gap-2 p-3 rounded-xl text-left",
                      "bg-muted/50 hover:bg-muted border border-border/50 hover:border-border",
                      "transition-all duration-200 group"
                    )}
                  >
                    <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs text-foreground leading-snug">
                      {t(q.en, q.es)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} onActionClick={onActionClick} />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function MessageBubble({
  message,
  onActionClick,
}: {
  message: ChatMessage;
  onActionClick: (action: ChatAction) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => onActionClick(action)}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-full",
                  "bg-background/20 hover:bg-background/30",
                  "transition-colors duration-200",
                  "border border-current/20"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
