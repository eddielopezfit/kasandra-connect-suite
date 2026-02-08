# Selena Digital Concierge - Decision Certainty Engine
## Implementation Status: ✅ COMPLETE (v2 - 2026-02-08)

---

## Executive Summary

Selena has been transformed from a generic AI assistant into a **Decision Certainty Engine** — a digital concierge that guides users through psychological comfort zones until booking feels like a formality, not a sales event.

---

## 1. Core Architecture: 4-Mode System

### Mode Definitions

| Mode | Name | Trigger | Behavior | Booking CTA |
|------|------|---------|----------|-------------|
| 1 | ORIENTATION | First contact | Reduce anxiety, ONE question | ❌ Never |
| 2 | CLARITY BUILDING | Intent declared OR 1+ guides | Reference journey, suggest tools | ❌ Never |
| 3 | CONFIDENCE | 3+ guides OR tool completed | Summarize progress, position Kasandra | ❌ Never |
| 4 | HANDOFF | Earned access gate passed | Frame booking as clarity continuation | ✅ Show CTA |

### Earned Access Gate (Mode 4 Triggers)
1. **Explicit Ask**: User message contains booking keywords
2. **Tool Completion**: `context.tool_used` OR `context.quiz_completed`
3. **Email Provided**: Commitment signal detected in message
4. **Engaged Turns**: 2+ user turns AND intent ≠ "explore"

---

## 2. Files Implemented

### Edge Function (Backend)

| File | Purpose |
|------|---------|
| `supabase/functions/selena-chat/index.ts` | Main handler with MODE_CONTEXT integration |
| `supabase/functions/selena-chat/modeContext.ts` | Mode detection, suggested replies, system prompt additions |
| `supabase/functions/selena-chat/entryGreetings.ts` | Context-aware greeting generation (exported for reference) |

### Frontend (Context)

| File | Purpose |
|------|---------|
| `src/contexts/SelenaChatContext.tsx` | Updated with `EntrySource` types and context-aware greetings |
| `src/lib/analytics/logEvent.ts` | Added telemetry events: `selena_entry`, `selena_mode_transition`, `handoff_deferred` |

---

## 3. System Prompt Enhancements

### Voice Rules (Hardened)
- ❌ Never "our team", "we", or "someone from the office"
- ❌ No exclamation points, no emojis
- ❌ Never compare Kasandra to other agents
- ✅ "Kasandra will personally..." (ownership)
- ✅ "Based on what you've shared..." (listening)
- ✅ "Most people in your situation..." (normalization)

### Kasandra Framing (Busy Professional)
- "Kasandra personally handles every client — no handoffs."
- "Her schedule fills up, but I can help you find a time."
- "She'll review your situation before your call."

### Mode Instructions
- **Mode 1**: Acknowledge uncertainty, ONE question only
- **Mode 2**: Reflection Sentence Formula, reference journey
- **Mode 3**: Summarize progress, subtle Kasandra positioning
- **Mode 4**: Booking as continuation, always offer "keep chatting"

### Stall Recovery (Mode 3.5)
After 5+ turns without forward motion:
> "Would it be helpful if I summarized where you are and what usually helps people move forward from here — or would you rather keep exploring on your own?"

### Post-Booking Reassurance
> "You've already done the hard part — thinking this through carefully. Kasandra will personally review your situation before your call."

---

## 4. Context-Aware Greetings

### Entry Source Priority
0. **Post-Booking** (highest) — Identity reinforcement, seals the decision
1. **Calculator** — References advantage and difference
2. **Guide Handoff** — Acknowledges specific guide read
3. **Synthesis** — Offers to summarize guides read
4. **Hero** — Welcome with orientation
5. **Floating** (default) — Standard greeting

### Entry Types Supported
```typescript
type EntrySource = 
  | 'calculator' 
  | 'guide_handoff' 
  | 'synthesis' 
  | 'hero' 
  | 'floating' 
  | 'proactive'
  | 'question'
  | 'post_booking'; // ✅ NEW - Identity reinforcement

interface EntryContext {
  source: EntrySource;
  calculatorAdvantage?: 'cash' | 'traditional' | 'consult';
  calculatorDifference?: number;
  guideId?: string;
  guideTitle?: string;
  guideCategory?: string;
  guidesReadCount?: number;
  prefillMessage?: string;
  intent?: string; // For post-booking
  userName?: string; // For post-booking personalization
}
```

### Post-Booking Identity Reinforcement
When user clicks Selena on the thank-you page after booking:

**English:**
> "You're all set. You've already done the hard part — thinking this through carefully.
> 
> Kasandra will personally review what you shared before your call so you get complete clarity in 10 minutes.
> 
> If you'd like, tell me one thing you want to be 100% certain about when you two talk."

**Spanish (formal Usted):**
> "Listo. Usted ya hizo lo más difícil — pensar esto con cuidado.
>
> Kasandra revisará personalmente lo que compartió antes de su llamada para que tenga claridad completa en 10 minutos.
>
> Si gusta, dígame una cosa sobre la que quiera estar 100% seguro/a cuando hablen."

---

## 5. Mode-Specific Suggested Replies (Behavioral Rails)

| Mode | Replies (EN) |
|------|--------------|
| 1 | "I'm thinking about selling", "I'm looking to buy", "Just exploring for now" |
| 2 | Intent-aware: Tools + Guides (e.g., "Take the readiness check", "What's my home worth?") |
| 3 | "Summarize what I've learned", "What should I prepare?", "What's my next step?" |
| 4 | "Review strategy with Kasandra", "I have more questions first", "What happens on the call?" |

Stall recovery overrides replies with:
- "Yes, summarize where I am"
- "I'd rather keep exploring"
- "I have a specific question"

---

## 6. Telemetry Events Added

| Event | Trigger |
|-------|---------|
| `selena_entry` | Chat opened with entry context |
| `selena_mode_transition` | Mode detected on each message |
| `handoff_deferred` | User declines booking (future) |

---

## 7. Integration Points

### How to Use Entry Context

```tsx
// From calculator completion
openChat({
  source: 'calculator',
  calculatorAdvantage: 'traditional',
  calculatorDifference: 47250,
});

// From guide handoff
openChat({
  source: 'guide_handoff',
  guideId: 'cash-offer-guide',
  guideTitle: 'Cash Offer Guide',
  guideCategory: 'valuation',
});

// From synthesis footer
openChat({
  source: 'synthesis',
  guidesReadCount: 5,
  prefillMessage: 'Summarize what I\'ve learned',
});

// Simple click handler (works as before)
<Button onClick={openChat}>Start with Selena</Button>
```

---

## 8. Success Criteria

| Metric | Target | Status |
|--------|--------|--------|
| Mode-based responses | Dynamic per turn | ✅ Implemented |
| Reflection sentences | Modes 2 & 3 | ✅ Implemented |
| Stall recovery | 5+ turns detection | ✅ Implemented |
| Context-aware greetings | 5 entry sources | ✅ Implemented |
| Earned access gating | Booking only Mode 4 | ✅ Implemented |
| Voice compliance | No "we/team", formal ES | ✅ Implemented |
| Telemetry | 3 new event types | ✅ Implemented |

---

## 9. Future Enhancements (P3+)

- [ ] Memory Acknowledgment Pattern: Standardize reflection sentence across all components
- [ ] Stall recovery analytics: Track `handoff_deferred` events
- [ ] Post-booking identity reinforcement in chat confirmation
- [ ] Calculator integration: Pass `calculator_advantage` in request context
- [ ] A/B test Mode 3 → Mode 4 transition timing

---

*Selena v2 is now a Decision Certainty Engine. Booking feels like a formality.*
