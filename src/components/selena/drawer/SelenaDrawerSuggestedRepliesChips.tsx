import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import type { ChatMessage, ChipMeta } from "@/contexts/SelenaChatContext";
import { type ActionSpec, isActionValid, resolveAction } from "@/lib/actions/actionSpec";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { logEvent } from "@/lib/analytics/logEvent";
import { getSessionContext, updateSessionContext } from "@/lib/analytics/selenaSession";

type SuggestedReply = string | { label: string; actionSpec?: ActionSpec };

// Sub-chip definitions for warm leads (booking engagement variants)
const SUB_CHIPS = [
  { labelEn: '15-min clarity call', labelEs: 'Llamada de 15 min', callType: 'clarity-call' },
  { labelEn: 'Virtual walkthrough', labelEs: 'Recorrido virtual', callType: 'virtual-walkthrough' },
  { labelEn: 'No-pressure review', labelEs: 'Revisión sin presión', callType: 'no-pressure-review' },
] as const;

// Expansion definitions — chips that open a secondary intent-narrowing row before navigating.
// Phase ≤ 2 only (intent still being qualified). Phase 3+ resolves immediately.
const EXPANSION_CHIPS: Record<string, {
  labelEn: string;
  labelEs: string;
  path: string;
  queryParam?: string;
}[]> = {
  'get my selling options': [
    { labelEn: 'I need to sell fast',     labelEs: 'Necesito vender rápido',     path: '/seller-decision', queryParam: 'urgency=fast'     },
    { labelEn: 'I want top dollar',       labelEs: 'Quiero el mejor precio',     path: '/seller-decision', queryParam: 'urgency=optimize' },
    { labelEn: 'Just exploring options',  labelEs: 'Solo explorando opciones',   path: '/seller-decision'                                  },
  ],
};

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
  const { language } = useLanguage();

  const [expandedChipKey, setExpandedChipKey] = useState<string | null>(null);

  // Auto-collapse expansion row when new messages arrive
  const messageCount = messages.length;
  useEffect(() => { setExpandedChipKey(null); }, [messageCount]);

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
    if (typeof reply !== 'string' && reply.actionSpec && !isActionValid(reply.actionSpec)) return false;
    return true;
  });

  if (filteredReplies.length === 0) return null;

  // ============= VISUAL WEIGHTING HELPERS =============
  const isHot = !!chipMeta && (chipMeta.mode >= 4 || chipMeta.containment || !!chipMeta.bookingCtaShown);
  const isWarm = !!chipMeta && chipMeta.phase >= 3 && !isHot;

  function isBookingChip(reply: SuggestedReply): boolean {
    return typeof reply !== 'string' && reply.actionSpec?.type === 'book';
  }

  const handleClick = (reply: SuggestedReply) => {
    const label = typeof reply === 'string' ? reply : reply.label;
    const isAction = typeof reply !== 'string';
    const isBooking = isBookingChip(reply);
    const ctx = getSessionContext();
    const phase = chipMeta?.phase ?? 0;

    // ============= EXPANSION LOGIC — Phase ≤ 2 only =============
    const chipKey = label.toLowerCase();
    const expansionEntries = EXPANSION_CHIPS[chipKey];
    if (expansionEntries && phase <= 2) {
      // Toggle: second tap on same chip collapses it (user changed mind)
      if (expandedChipKey === chipKey) {
        setExpandedChipKey(null);
      } else {
        setExpandedChipKey(chipKey);
      }
      return; // Don't resolve — wait for sub-chip selection
    }

    // If a different primary chip is clicked while an expansion is open, collapse it
    if (expandedChipKey) setExpandedChipKey(null);

    // ============= ANALYTICS: selena_chip_clicked =============
    logEvent('selena_chip_clicked', {
      chip_label: label,
      chip_type: isAction ? (reply.actionSpec ? 'action_spec' : 'text') : 'text',
      action_type: isAction && reply.actionSpec ? reply.actionSpec.type : undefined,
      phase,
      intent: ctx?.intent ?? 'unknown',
      containment_active: chipMeta?.containment ?? false,
      is_booking_chip: isBooking,
    });

    // Clear recovery state if booking chip is clicked (use null, not undefined, for reliable clearing)
    if (isBooking && ctx?.booking_chips_shown_at) {
      updateSessionContext({ booking_chips_shown_at: null } as any);
    }

    if (typeof reply === 'string') {
      onSuggestedReplyClick(reply);
    } else if (reply.actionSpec) {
      resolveAction(reply.actionSpec, navigate, (payload) => {
        openChat(payload as any);
      });
    } else {
      // Unmatched chip with label only — treat as conversational text
      onSuggestedReplyClick(reply.label);
    }
  };

  const handleExpansionSubChipClick = (entry: typeof EXPANSION_CHIPS[string][number], parentKey: string) => {
    const label = language === 'es' ? entry.labelEs : entry.labelEn;
    const ctx = getSessionContext();
    const urgencyParam = entry.queryParam?.match(/urgency=([^&]+)/)?.[1];

    logEvent('selena_chip_clicked', {
      chip_label: label,
      chip_type: 'expansion_sub',
      parent_chip: parentKey,
      urgency: urgencyParam,
      phase: chipMeta?.phase ?? 0,
      intent: ctx?.intent ?? 'unknown',
      containment_active: chipMeta?.containment ?? false,
    });

    setExpandedChipKey(null);
    const dest = entry.queryParam ? `${entry.path}?${entry.queryParam}` : entry.path;
    navigate(dest);
  };

  // Show sub-chips only for warm leads (not hot — hot keeps single bold CTA)
  const hasBookingChips = filteredReplies.some(isBookingChip);
  const showSubChips = isWarm && hasBookingChips && !isHot;

  // When sub-chips are showing, suppress the primary booking chip — sub-chips ARE the booking
  // options and having "Talk with Kasandra" + three specific call types is redundant + noisy.
  // Keep all non-booking chips in the primary row so the user still has content paths.
  const primaryReplies = showSubChips
    ? filteredReplies.filter(r => !isBookingChip(r))
    : filteredReplies;

  const handleSubChipClick = (subChip: typeof SUB_CHIPS[number]) => {
    const label = language === 'es' ? subChip.labelEs : subChip.labelEn;
    const ctx = getSessionContext();

    logEvent('selena_chip_clicked', {
      chip_label: label,
      chip_type: 'sub_chip',
      action_type: 'book',
      phase: chipMeta?.phase ?? 0,
      intent: ctx?.intent ?? 'unknown',
      containment_active: chipMeta?.containment ?? false,
      is_booking_chip: true,
      call_type: subChip.callType,
    });

    navigate(`/v2/book?callType=${subChip.callType}`);
  };

  return (
    <div className="border-t border-border px-3 py-2 shrink-0 bg-background/95">
      {/* Primary chips — booking chip removed when sub-chips are active */}
      {primaryReplies.length > 0 && (
        <div className="flex gap-2 overflow-x-auto md:flex-wrap pb-1 scrollbar-hide touch-scroll-x max-w-full">
          {primaryReplies.map((reply, index) => {
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
                "max-w-[200px] truncate min-h-[44px] min-w-[44px]",
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
      )}

      {/* Expansion sub-row — intent narrowing for expandable chips (Phase ≤ 2) */}
      {expandedChipKey && EXPANSION_CHIPS[expandedChipKey] && (
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide touch-scroll-x max-w-full pt-1.5">
          <span className="shrink-0 self-center text-[11px] text-cc-navy/50 pr-1 whitespace-nowrap">
            {language === 'es' ? '¿Qué más describe tu situación?' : 'What fits your situation?'}
          </span>
          {EXPANSION_CHIPS[expandedChipKey].map((entry, i) => (
            <button
              key={i}
              onClick={() => handleExpansionSubChipClick(entry, expandedChipKey)}
              className={cn(
                "shrink-0 text-[11px] px-2.5 py-1.5 rounded-full",
                "active:scale-95",
                "transition-all duration-200",
                "whitespace-nowrap",
                "border border-cc-gold/40 text-cc-navy/80",
                "bg-cc-ivory hover:bg-cc-sand hover:border-cc-gold/60",
              )}
            >
              {language === 'es' ? entry.labelEs : entry.labelEn}
            </button>
          ))}
        </div>
      )}

      {/* Sub-chips for warm leads — specific booking engagement options */}
      {showSubChips && (
        <div className={cn("flex gap-1.5 overflow-x-auto scrollbar-hide touch-scroll-x max-w-full", primaryReplies.length > 0 ? "pt-1.5" : "pt-0")}>
          {/* Label only when primary row is empty so sub-chips aren't orphaned */}
          {primaryReplies.length === 0 && (
            <span className="shrink-0 self-center text-[11px] text-cc-navy/50 pr-1">
              {language === 'es' ? 'Cómo conectar:' : 'How to connect:'}
            </span>
          )}
          {SUB_CHIPS.map((sub) => (
            <button
              key={sub.callType}
              onClick={() => handleSubChipClick(sub)}
              className={cn(
                "shrink-0 text-[11px] px-2.5 py-1.5 rounded-full",
                "active:scale-95",
                "transition-all duration-200",
                "whitespace-nowrap",
                "border border-cc-gold/30 text-cc-navy/80",
                "bg-cc-ivory hover:bg-cc-sand hover:border-cc-gold/50",
              )}
            >
              {language === 'es' ? sub.labelEs : sub.labelEn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
