import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatAction, ChatMessage } from "@/contexts/SelenaChatContext";

export function SelenaDrawerMessagesArea({
  messages,
  isLoading,
  onActionClick,
  onMessagesAreaClick,
  scrollRef,
  bottomRef,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  onActionClick: (action: ChatAction) => void;
  onMessagesAreaClick: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  bottomRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    // ⚠️ SCROLL STABILITY: This ScrollArea MUST persist across renders.
    // NEVER wrap in conditional rendering or add key={...} that changes during chat.
    // The bottomRef at the end anchors scroll position after new messages.
    <ScrollArea
      className="flex-1 p-4"
      ref={scrollRef}
      onClick={onMessagesAreaClick}
    >
      <div className="space-y-4 pb-2">
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
