import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/contexts/SelenaChatContext";

export function SelenaDrawerSuggestedRepliesChips({
  suggestedReplies,
  isLoading,
  activeTab,
  messages,
  onSuggestedReplyClick,
}: {
  suggestedReplies?: string[];
  isLoading: boolean;
  activeTab: unknown; // tab type lives in SelenaChatDrawer; we just treat it as truthy/falsy
  messages: ChatMessage[];
  onSuggestedReplyClick: (text: string) => void;
}) {
  if (!suggestedReplies || suggestedReplies.length === 0 || isLoading || activeTab) {
    return null;
  }

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user")?.content?.toLowerCase().trim();

  const filteredReplies = suggestedReplies.filter((reply) => {
    if (!lastUserMessage) return true;
    const normalized = reply.toLowerCase().trim();
    if (normalized === lastUserMessage) return false;

    const replyWords = new Set(normalized.split(/\s+/).filter((w) => w.length > 2));
    const userWords = new Set(lastUserMessage.split(/\s+/).filter((w) => w.length > 2));
    if (replyWords.size === 0 || userWords.size === 0) return true;

    const intersection = [...replyWords].filter((w) => userWords.has(w)).length;
    const union = new Set([...replyWords, ...userWords]).size;
    if (union > 0 && intersection / union >= 0.7) return false;
    return true;
  });

  if (filteredReplies.length === 0) return null;

  return (
    <div className="border-t border-border px-4 py-2.5 shrink-0 bg-background/95 backdrop-blur-sm">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide max-w-full">
        {filteredReplies.map((reply, index) => (
          <button
            key={index}
            onClick={() => onSuggestedReplyClick(reply)}
            className={cn(
              "shrink-0 text-xs font-medium px-3 py-2 rounded-full",
              "bg-cc-sand text-cc-navy border border-cc-navy/20",
              "hover:bg-cc-navy hover:text-white",
              "active:scale-95",
              "transition-all duration-200",
              "whitespace-nowrap",
              "max-w-[200px] truncate"
            )}
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}
