

# Selena Chat Thread Analysis — Issues & Fixes

## Issues Found in This Conversation

### 1. RESPONSE TRUNCATION (Critical)
Selena got cut off twice: "...some buyers are able to negotiate for the seller to cover a portion of those closing costs..." and "Kasandra can personally review your numbers to see which programs or strategies make that..."

**Root cause**: `max_tokens: 100` (line 1202) for Phase 2+ conversations. With 100 tokens, the model runs out mid-sentence. The post-processing sentence truncator (line 1251) only fires when there are 3+ complete sentences — but if the model exhausts tokens mid-sentence, truncation produces an incomplete fragment.

**Fix**: Add a **sentence-completeness guard** in post-processing. After receiving the reply, if the last sentence doesn't end with punctuation (`[.?!]`), drop it entirely. This way the user never sees a fragment — they get 2 clean sentences instead of 2.5 broken ones.

### 2. "I APOLOGIZE" VIOLATION (Critical)
Selena said: *"I apologize—I was saying that..."* This is a **banned phrase** per KB-9 (line 630 of systemPromptBuilder.ts). The phrase is already in the BANNED_PHRASES list, but the model generated it anyway because:
- The banned list is in the system prompt, but with 100 tokens and 14+ context blocks, the model's attention budget is stretched thin
- No **post-processing filter** exists for banned phrases

**Fix**: Add a server-side post-processing step (after line 1255) that regex-replaces banned openers. If `reply` starts with "I apologize" or "I'm sorry", strip it and start from the next sentence. This is a deterministic safety net — doesn't rely on the model following instructions.

### 3. "OK" RESPONSE HANDLING (Medium)
User said "ok" — Selena responded with a long paragraph about seller net calculator and home valuation guide. "ok" is an acknowledgment, not a question. Selena should have asked a clarifying question or advanced the journey, not repeated tool suggestions.

**Fix**: Add a **low-signal detection** block in the handler. When the user message is ≤3 words AND matches `/^(ok|okay|sure|got it|alright|ya|sí|vale|entendido)$/i`, inject a governance hint: "User gave a brief acknowledgment. Do NOT re-summarize tools. Ask ONE clarifying question to advance: 'What would help most right now — seeing your specific numbers, or talking through your timeline with Kasandra?'"

### 4. INTENT SWITCH NOT ESCALATING (Medium)
User switched from selling to buying mid-conversation ("What about buying?"). Selena handled the topic but:
- Didn't acknowledge the dual intent explicitly
- Didn't update chips to reflect dual-path
- Got cut off again because the response was too long for 100 tokens

**Fix**: The intent detection already detects `dual` intent, but the chip governance path for dual (line 140-149) requires `phase2TurnCount` thresholds. By turn 6+ in this conversation, the user should already be in Phase 3 with "Talk with Kasandra" surfaced. The real issue is that `phase2TurnCount` is counting all non-Phase-1 messages, not dual-specific turns. No code change needed here — the truncation fix (issue #1) solves the visible symptom.

### 5. "BROWSE GUIDES" CHIP AT END (Low-Medium)
After 29 guides read and 6+ turns of selling conversation, the final chip was "Browse guides." This user has read 29 guides — suggesting more guides is counterproductive.

**Fix**: In `getGovernedChips()`, add a guard: if `context.guides_read >= 10`, **never** include `BROWSE_GUIDES` or `SELLING_GUIDES` chips. Replace with `TALK_WITH_KASANDRA`. The user is past the education phase.

### 6. MARKET STATS INJECTED MID-CONVERSATION (Low)
"Tucson homes are averaging 42 days on market..." appeared as an unsolicited stat block mid-conversation. The user didn't ask for market data — it was injected by the `marketPulseHint` context block because the user has seller intent.

**Fix**: This is working as designed (market context helps Selena reference stats). The problem is the model is choosing to dump the stat as a standalone paragraph instead of weaving it into the response. The sentence truncator (issue #1 fix) will naturally cut this excess. No additional change needed.

## Implementation Plan

### File: `supabase/functions/selena-chat/index.ts`

**Fix 1 — Sentence completeness guard** (after line 1254):
- After truncating to 3 sentences, check if the final character is punctuation
- If not, drop the last incomplete sentence
- Fallback: if only 1 incomplete sentence remains, append "..."

**Fix 2 — Banned phrase post-filter** (after the completeness guard):
- Regex strip: `/^(I apologize[—\-,.]?\s*|I'm sorry[—\-,.]?\s*|Me disculpo[—\-,.]?\s*)/i`
- If the entire reply was just the banned phrase, replace with a neutral reframe

**Fix 3 — Low-signal acknowledgment handler** (before messagesPayload assembly, ~line 1060):
- Detect messages ≤3 words matching acknowledgment patterns
- Inject governance hint: "Brief acknowledgment detected. Ask ONE forward-moving question. Do NOT re-summarize."

**Fix 4 — High-guide-count chip suppression** (in `chipGovernance.ts`, inside `getGovernedChips`):
- Add parameter for `guidesReadCount`
- If `guidesReadCount >= 10`, replace any `BROWSE_GUIDES` / `SELLING_GUIDES` chip with `TALK_WITH_KASANDRA`

### Files Modified
1. `supabase/functions/selena-chat/index.ts` — 3 post-processing additions (~20 lines total)
2. `supabase/functions/selena-chat/chipGovernance.ts` — guide-count suppression in `getGovernedChips` (~8 lines)

**Estimated scope**: 1 implementation message.

