
# Selena Phase Governance & Session Continuity Fix

**Status:** ✅ IMPLEMENTED (2026-02-23)

---

## Problem Diagnosis

Five concrete regression vectors cause phase resets:

1. **Greeting injection on navigation:** `openChat()` injects new greetings when entry signature changes during normal navigation, producing Phase 0/1 text even when intent is declared.
2. **Fallback greeting resets chips to Phase 1:** Guide handoff fallback and error handler both produce Phase 1 chips ("I'm thinking about selling"), re-triggering the first-seller-turn intercept.
3. **Edge function mode detection has no floor:** `detectMode()` re-derives mode from scratch every turn. Modes 2/3 can regress to Mode 1 if context signals are lost.
4. **Chip governance and mode governance are decoupled:** Mode could be 3 while chips are Phase 1 if `effectiveIntent` is "explore" and engagement signals are low.
5. **Error fallback resets to orientation:** `sendMessage` error handler always offers Phase 1 chips regardless of current phase.

---

## 1. Phase Governance Model

### Phase Definitions

| Phase | Name | Entry Condition | Locked Questions |
|-------|------|----------------|-----------------|
| 0 | First Contact | `messages.length === 0` AND no `sessionContext.intent` | "What brings you here?" |
| 1 | Intent Declaration | Messages exist but `intent` is null/explore | "Are you buying, selling, or exploring?" |
| 2 | Discovery | `intent` is set (buy/sell/cash/dual) | Timeline, situation, tool suggestions |
| 3 | Evaluation | `tool_used` OR `quiz_completed` OR `guides_read >= 3` | Net proceeds, comparison, synthesis |
| 4 | Handoff | Email provided OR explicit booking ask OR `tool_used + 2+ turns` | Booking CTA only |

### Anti-Regression Rule (monotonic floor)

Implement `chip_phase_floor` in SessionContext (renamed from `phase_floor` per Refinement 1):

- On every edge function response, compute `effectiveChipPhase = max(client_chip_phase_floor, detected_phase)`
- Write `effectiveChipPhase` back to both the response and SessionContext
- The client persists `chip_phase_floor` and sends it on every request

### Phase-Locked Questions

- "What brings you here?" — Phase 0 only
- "Are you looking to buy, sell, or explore?" — Phase 0-1 only
- "What kind of timeline are you working with?" — Phase 1-2, re-askable per Refinement 3 rules
- "Would you like to explore your options?" — Phase 2 only

---

## 2. Entry Greeting Guard

### Greeting Injection Conditions

A greeting may be injected ONLY when ALL are true:

1. Entry signature is genuinely new
2. Source is in allowed set: `calculator`, `guide_handoff`, `synthesis`, `hero`, `quiz_result`, `post_booking`
3. Generated greeting matches current `chip_phase_floor`
4. **Refinement 5:** `hasStoredHistory` is false (check localStorage before React state hydration)

### Phase-Aware Greeting Selection

- If generated greeting contains Phase 1 chips AND `sessionContext.intent` exists → replace with phase-appropriate chips
- If greeting text asks "buy, sell, or explore?" AND intent is known → suppress greeting entirely

### greeting_phase_seen

Track the highest phase greeting shown. Never show a greeting from phase ≤ `greeting_phase_seen` unless source is `post_booking` or `calculator`.

### Refinement 6: Server-Side Hard Block

If `intent` exists OR `chip_phase_floor >= 2`, the edge function must never output literal onboarding prompt variants. If it would, replace with "Welcome back—pick up where we left off" + governed chips.

---

## 3. Session Continuity Specification

### Required Persistent Fields

| Field | Survives All Events |
|-------|:---:|
| `intent` | ✅ |
| `timeline` | ✅ |
| `current_mode` | ✅ |
| `chip_phase_floor` (NEW) | ✅ |
| `greeting_phase_seen` (NEW) | ✅ |
| `tool_used` / `last_tool_result` | ✅ |
| `quiz_completed` / `guides_read` | ✅ |

### Refinement 2: Chat History Persistence

History persistence is **optional**. Persist only:
- `history_tail` (last 10-20 messages)
- `last_chips` or `last_chip_phase`
- All SessionContext fields above

Governance must work correctly with **empty chat history** as long as SessionContext exists.

### Refinement 3: Timeline Re-Ask Rules

Add `timeline_last_asked_turn` (or timestamp) to SessionContext. Timeline question can be re-asked if:
- `timeline` is missing, OR
- User explicitly says it changed, OR
- `timeline_last_asked_turn` is older than 8-12 turns

Optional: `timeline_confidence` (low/med/high).

### sendMessage Payload (must always include)

`current_mode`, `chip_phase_floor`, `tool_used`, `last_tool_result`, `quiz_completed`, `guides_read`, `intent`, `timeline`

---

## 4. Chip Behavior Rules

### Phase Advancement

- Phase 1 chips set `intent` and advance `chip_phase_floor` to 2
- Phase 2 chips are ActionSpec-mapped where possible
- Phase 3/4 chips are ALWAYS ActionSpec — never trigger edge function

### Refinement 4: Phase-Biased (Not Phase-Blocked)

- `chip_phase_floor` sets the **default** chip band
- Phase-2 chips allowed when user's last message matches Phase-2 intent (valuation, preparation, process), even if floor is 3+
- **Never** regress to Phase 1 once intent is known

### Error Fallback Chips (Phase-Aware)

```
chip_phase_floor >= 3: ["Estimate my net proceeds", "Talk with Kasandra"]
chip_phase_floor >= 2 + sell: ["Compare cash vs. listing", "What's my home worth?"]
chip_phase_floor >= 2 + buy: ["Take the readiness check", "Browse buyer guides"]
chip_phase_floor < 2: Phase 1 chips (current behavior)
```

---

## 5. Soft Reset vs Hard Reset

### Soft Reset (all of these)
- Drawer close/reopen
- Page navigation
- Page refresh
- Language toggle

Behavior: Load history from localStorage, no greeting injection, chips from last AI response.

### Hard Reset (explicit only)
- User clicks "Clear History"
- `clearSession()` called programmatically
- User clears browser localStorage

Behavior: Clear chat history + `chip_phase_floor` + `greeting_phase_seen`. Keep `intent`, `timeline`, `tool_used` (real user data).

---

## 6. QA Checklist

| # | Test | Expected |
|---|------|----------|
| 1 | Fresh session, open from floating | Phase 0 greeting + Phase 1 chips |
| 2 | Click "I'm thinking about selling" | `intent=sell` set, Phase 2+ chips |
| 3 | Select "ASAP" | Phase advances, chips NOT Phase 1 |
| 4 | Close drawer, navigate, reopen | No new greeting, history intact |
| 5 | Close drawer, go to /v2/cash-offer-options, reopen | No "buy, sell, explore?" greeting |
| 6 | Use calculator, open from handoff | Calculator greeting, Phase 2/3 chips |
| 7 | Network error | Error chips match current phase |
| 8 | Page refresh, reopen | History loads, no duplicate greeting |
| 9 | Complete quiz, open from quiz_result | Quiz greeting, no Phase 1 regression |
| 10 | Mode 4, close and reopen | Mode 4 persists, handoff chips only |
| 11 | `chip_phase_floor` never decreases | Verify in SessionContext after each action |
| 12 | "Are you looking to buy, sell, or explore?" never appears when intent is set | String search in transcript |
| 13 | ActionSpec chips (Phase 3/4) produce zero `selena-chat` calls | Network tab verification |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/analytics/selenaSession.ts` | Add `chip_phase_floor`, `greeting_phase_seen`, `timeline_last_asked_turn`, optional `timeline_confidence` to SessionContext |
| `src/contexts/SelenaChatContext.tsx` | 1) `hasStoredHistory` check in `openChat()`. 2) Phase-aware error fallback chips. 3) Send `chip_phase_floor` in payload. 4) Monotonic mode floor for all modes. |
| `supabase/functions/selena-chat/index.ts` | 1) Accept `chip_phase_floor`. 2) Phase-biased `getGovernedChips()`. 3) Return `chip_phase_floor`. 4) Server-side onboarding hard block. 5) Monotonic mode floor. |

No new dependencies. No database changes. No new edge functions.

---

## Operational Decisions (Confirmed)

- **GHL Form:** Step 2 (time selection first, then form)
- **Confirmation Page:** Redirect URL to `/v2/thank-you` (already wired with `booking_completed` event)

---

## Previous Completed Work

### ✅ Wire /v2/thank-you as GHL Post-Booking Destination (Done)

- Added `booking_completed` event logging on mount with intent + name + UTM params
- Added `booking_completed` to `EventType` union in `logEvent.ts`
- GHL redirect URL format: `https://<domain>/v2/thank-you?intent=sell`
