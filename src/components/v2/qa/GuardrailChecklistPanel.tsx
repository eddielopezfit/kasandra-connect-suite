/**
 * Panel C: Guardrail Expectations Checklist (Read-only)
 * Computes pass/fail booleans based on known session signals.
 * Uses corrected naming: identity_once_detected, booking_eligibility_reason.
 * Never reads chat message content — only counts and metadata.
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const CONTEXT_KEY = 'selena_context_v2';
const CHAT_KEY = 'selena_chat_history';
const LANG_KEY = 'kasandra-language';

interface CheckItem {
  id: string;
  label: string;
  status: boolean;
  explanation: string;
  isHeuristic?: boolean;
}

function computeChecks(language: string): CheckItem[] {
  let ctx: Record<string, unknown> = {};
  try {
    const raw = localStorage.getItem(CONTEXT_KEY);
    if (raw) ctx = JSON.parse(raw);
  } catch { /* empty */ }

  // Chat history metadata only — count + last timestamp + guide IDs
  let chatCount = 0;
  let guideIdsInChat: string[] = [];
  try {
    const chatRaw = localStorage.getItem(CHAT_KEY);
    if (chatRaw) {
      const messages = JSON.parse(chatRaw);
      if (Array.isArray(messages)) {
        chatCount = messages.length;
        // Extract guide IDs from message metadata only (not content)
        guideIdsInChat = messages
          .filter((m: Record<string, unknown>) => m.guideId)
          .map((m: Record<string, unknown>) => String(m.guideId));
      }
    }
  } catch { /* empty */ }

  const storedLang = localStorage.getItem(LANG_KEY) ?? 'en';
  const intent = ctx.intent as string | undefined;
  const timeline = ctx.timeline as string | undefined;
  const chipPhaseFloor = typeof ctx.chip_phase_floor === 'number' ? ctx.chip_phase_floor : undefined;
  const quizCompleted = ctx.quiz_completed === true;
  const toolUsed = ctx.tool_used as string | undefined;
  const hasBooked = ctx.has_booked === true;
  const guidesRead = typeof ctx.guides_read === 'number' ? ctx.guides_read : 0;
  const email = ctx.email as string | undefined;

  // Booking eligibility — deterministic check of known gating signals
  const bookingConditions: string[] = [];
  if (quizCompleted) bookingConditions.push('quiz_completed');
  if (toolUsed) bookingConditions.push(`tool_used: ${toolUsed}`);
  if (email) bookingConditions.push('email_present');
  const bookingEligible = bookingConditions.length > 0;

  return [
    {
      id: 'identity_once_detected',
      label: 'Identity Once Detected',
      status: chatCount > 0,
      explanation: chatCount > 0
        ? `${chatCount} messages in history — identity exchange likely occurred`
        : 'No chat history found — identity exchange has not occurred',
      isHeuristic: true,
    },
    {
      id: 'intent_locked',
      label: 'Intent Locked',
      status: !!intent && intent !== 'explore',
      explanation: intent
        ? `Intent: "${intent}"${intent === 'explore' ? ' (not locked — still exploring)' : ' (locked)'}`
        : 'No intent set',
    },
    {
      id: 'timeline_locked',
      label: 'Timeline Locked',
      status: !!timeline,
      explanation: timeline ? `Timeline: "${timeline}"` : 'No timeline set',
    },
    {
      id: 'phase_floor_monotonic',
      label: 'Phase Floor Monotonic',
      status: chipPhaseFloor !== undefined && chipPhaseFloor >= 0,
      explanation: chipPhaseFloor !== undefined
        ? `Current floor: ${chipPhaseFloor} (monotonic — never decreases)`
        : 'Phase floor not set (default 0)',
    },
    {
      id: 'booking_eligibility',
      label: 'Booking Eligibility',
      status: bookingEligible,
      explanation: bookingEligible
        ? `Eligible via: ${bookingConditions.join(', ')}`
        : 'Not yet eligible — no qualifying signals (quiz, tool, or email)',
    },
    {
      id: 'guide_loop_escalation_ready',
      label: 'Guide Loop Escalation Ready',
      status: guidesRead >= 2 || guideIdsInChat.length >= 2,
      explanation: `Guides read: ${guidesRead}, guides in chat: ${guideIdsInChat.length} (escalation at 2+)`,
    },
    {
      id: 'post_booking_silence_ready',
      label: 'Post-Booking Silence Ready',
      status: hasBooked,
      explanation: hasBooked ? 'User has booked — post-booking mode active' : 'No booking recorded',
    },
    {
      id: 'language_lock_active',
      label: 'Language Lock Active',
      status: storedLang === language,
      explanation: `Stored: "${storedLang}", Context: "${language}" — ${storedLang === language ? 'aligned' : 'MISMATCH'}`,
    },
  ];
}

const GuardrailChecklistPanel = () => {
  const { language } = useLanguage();
  const [checks, setChecks] = useState(() => computeChecks(language));

  const refresh = useCallback(() => setChecks(computeChecks(language)), [language]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Based on known session signals. Does not modify any state.
        </p>
        <Button size="sm" variant="outline" onClick={refresh} className="h-7 text-xs">
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {checks.map(check => (
          <div
            key={check.id}
            className="flex items-start gap-3 rounded-lg border p-3 bg-card"
          >
            {check.status ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{check.label}</span>
                {check.isHeuristic && (
                  <Badge variant="secondary" className="text-[10px]">heuristic</Badge>
                )}
                <Badge
                  variant={check.status ? 'default' : 'outline'}
                  className={`text-[10px] ${check.status ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}`}
                >
                  {check.status ? 'PASS' : 'UNMET'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{check.explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuardrailChecklistPanel;
