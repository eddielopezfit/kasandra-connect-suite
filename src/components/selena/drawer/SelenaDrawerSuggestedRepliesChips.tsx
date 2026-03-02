import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import type { ChatMessage, ChipMeta } from "@/contexts/SelenaChatContext";
import { type ActionSpec, isActionValid, resolveAction } from "@/lib/actions/actionSpec";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { logEvent } from "@/lib/analytics/logEvent";
import { getSessionContext, updateSessionContext } from "@/lib/analytics/selenaSession";

type SuggestedReply = string | { label: string; actionSpec: ActionSpec };

export function SelenaDrawerSuggestedRepliesChips({
  suggestedReplies,
  isLoading,
  activeTab,
  messages,
  onSuggestedReplyClick,
  chipMeta,
}: {
  suggestedReplies?: SuggestedReply[];
  isLoading: boolean;
  activeTab: unknown;
  messages: ChatMessage[];
  onSuggestedReplyClick: (text: string) => void;
  chipMeta?: ChipMeta;
}) {
  const navigate = useNavigate();
  const { openChat } = useSelenaChat();

  if (!suggestedReplies || suggestedReplies.length === 0 || isLoading || activeTab) {
    return null;
  }

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user")?.content?.toLowerCase().trim();

  const filteredReplies = suggestedReplies.filter((reply) => {
    const replyText = typeof reply === 'string' ? reply : reply.label;
    if (!lastUserMessage) return true;
    const normalized = replyText.toLowerCase().trim();
    if (normalized === lastUserMessage) return false;

    const replyWords = new Set(normalized.split(/\s+/).filter((w) => w.length > 2));
    const userWords = new Set(lastUserMessage.split(/\s+/).filter((w) => w.length > 2));
    if (replyWords.size === 0 || userWords.size === 0) return true;

    const intersection = [...replyWords].filter((w) => userWords.has(w)).length;
    const union = new Set([...replyWords, ...userWords]).size;
    if (union > 0 && intersection / union >= 0.7) return false;
    return true;
  }).filter((reply) => {
    if (typeof reply !== 'string' && !isActionValid(reply.actionSpec)) return false;
    return true;
  });

  if (filteredReplies.length === 0) return null;

  // ============= VISUAL WEIGHTING HELPERS =============
  const isHot = chipMeta && (chipMeta.mode >= 4 || chipMeta.containment || (chipMeta.phase >= 3 && getSessionContext()?.timeline === 'asap'));
  const isWarm = chipMeta && chipMeta.phase >= 3 && !isHot;

  function isBookingChip(reply: SuggestedReply): boolean {
    return typeof reply !== 'string' && reply.actionSpec.type === 'book';
  }

  const handleClick = (reply: SuggestedReply) => {
    const label = typeof reply === 'string' ? reply : reply.label;
    const isAction = typeof reply !== 'string';
    const isBooking = isBookingChip(reply);
    const ctx = getSessionContext();

    // ============= ANALYTICS: selena_chip_clicked =============
    logEvent('selena_chip_clicked', {
      chip_label: label,
      chip_type: isAction ? 'action_spec' : 'text',
      action_type: isAction ? reply.actionSpec.type : undefined,
      phase: chipMeta?.phase ?? 0,
      intent: ctx?.intent ?? 'unknown',
      containment_active: chipMeta?.containment ?? false,
      is_booking_chip: isBooking,
    });

    // Clear recovery state if booking chip is clicked
    if (isBooking && ctx?.booking_chips_shown_at) {
      updateSessionContext({ booking_chips_shown_at: undefined });
    }

    if (typeof reply === 'string') {
      onSuggestedReplyClick(reply);
    } else {
      resolveAction(reply.actionSpec, navigate, (payload) => {
        openChat(payload as any);
      });
    }
  };

  return (
    <div className="border-t border-border px-4 py-2.5 shrink-0 bg-background/95 backdrop-blur-sm">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide max-w-full">
        {filteredReplies.map((reply, index) => {
          const booking = isBookingChip(reply);
          return (
            <button
              key={index}
              onClick={() => handleClick(reply)}
              className={cn(
                "shrink-0 text-xs font-medium px-3 py-2 rounded-full",
                "active:scale-95",
                "transition-all duration-200",
                "whitespace-nowrap",
                "max-w-[200px] truncate",
                // Booking chip visual weighting
                booking && isHot
                  ? "bg-cc-gold text-cc-navy font-semibold border border-cc-gold shadow-sm"
                  : booking && isWarm
                  ? "bg-cc-sand text-cc-navy border border-cc-gold/60 hover:bg-cc-navy hover:text-white"
                  : "bg-cc-sand text-cc-navy border border-cc-navy/20 hover:bg-cc-navy hover:text-white",
              )}
            >
              {typeof reply === 'string' ? reply : reply.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
