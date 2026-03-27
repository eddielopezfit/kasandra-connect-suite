

# Selena Intelligence Audit — Critical Issues Found

## Evidence from the Live Conversation

I traced the exact network requests from your test session. Here's what went wrong:

### Issue 1: Intent Detection Returns "sell" When User Says "I'm looking to buy" (CRITICAL)

Every response from the edge function returned `"detected_intent": "sell"` — even after the user explicitly said "I'm looking to buy". 

**Root cause**: The context being sent has `"intent": "cash"` (from a previous session activity — the user visited `/net-to-seller` and cash readiness pages). Line 237 of `index.ts`:
```
const effectiveIntent = primaryIntent !== 'explore' ? primaryIntent : (context.intent || 'explore');
```
`detectIntent("I'm looking to buy")` returns `["buy"]`, so `primaryIntent = "buy"`. But the response returns `detected_intent: primaryIntent` which should be "buy", not "sell". Yet the response says "sell".

**Actual root cause**: `detectIntent` on "I'm looking to buy" does match "buy" via the pattern `/buy|comprar|purchase|busco casa|looking for a home/`. But the **response field** `detected_intent` at line 1492 only returns `primaryIntent` when it's not "explore". Since the message DOES match "buy", `primaryIntent` should be "buy". However, the context has `intent: "cash"` and `effectiveIntent` becomes "buy" (since "buy" !== "explore"). But the **chip governance** uses `effectiveIntent` which correctly becomes "buy" — yet the chips returned are seller chips.

**Real problem**: The chip phase floor (`chip_phase_floor: 2`) was already set from the previous seller session. When the floor pushes phase past `getGovernedChips` result, the fallback logic at lines 636-644 correctly checks `effectiveIntent === 'buy'` and returns buyer chips. But the **PROGRESSION_MAP** at line 1355 matches first: `"i'm looking to buy"` maps to `["Take readiness check", "View first-time buyer guide", "What should I prepare?"]`. That IS correct for turn 1.

But on turn 2 ("move in ready") and turn 3 ("yes"), `getSuggestedReplies` finds no keyword match, falls through to journey chips or governed chips. The governed chips use `effectiveIntent` which is "buy" (correct), but **`suggestedReplies` came back empty `[]`** on turns 2 and 3. The only chip that eventually appeared was `"talk_with_kasandra"`.

**The empty chips bug**: After turn 2, `getGovernedChips("buy", ...)` returns Phase 2 buyer chips correctly. But `filterChipsForCompletedTools` or the journey awareness filter strips them. The `journey_state` is "decide" and `guard_escalation_level` is "suggest" — so the journey engine's `stageChips` may be returning empty arrays.

### Issue 2: "What should I prepare?" Chip Has No ActionSpec (MEDIUM)

Logged as `selena_chip_unmatched` — this chip is in PROGRESSION_MAP but has no entry in CHIP_DESTINATION or CHIP_KEY_DESTINATION. It gets sent as plain text, not a deterministic action. This violates the Zero-Drift chip policy.

### Issue 3: Selena Talks About the Affordability Tool But Never Routes To It (HIGH)

Across 4 turns, Selena kept describing the affordability calculator ("our affordability tool factors in...") but never provided a chip to actually open it. The `AFFORDABILITY_CALCULATOR` chip key exists in `getGovernedChips` for buyer Phase 2 turn 2, but the conversation never reached that rotation because the PROGRESSION_MAP short-circuited chip selection.

### Issue 4: Phase Floor Ratchet Prevents Tool Discovery (MEDIUM)

The `chip_phase_floor` ratcheted to 3 by turn 3 (from seller session context + escalation). Once at Phase 3, the only chips are "Estimate my net proceeds" + "Talk with Kasandra" — both are seller chips. A buyer at Phase 3 gets seller-path chips because Phase 3 logic doesn't branch by intent.

## Fixes Required

### Fix 1: Intent-aware Phase 3 chips (index.ts, lines 632-633)
Phase 3 chips are hardcoded to seller path. Add buyer-specific Phase 3 chips:
- Buyer Phase 3: `["Check my buying power", "Talk with Kasandra"]` / `["Verificar poder de compra", "Hablar con Kasandra"]`
- Current seller Phase 3 stays: `["Estimate my net proceeds", "Talk with Kasandra"]`

### Fix 2: Reset chip_phase_floor on intent switch (index.ts)
When `primaryIntent` differs from `context.intent` AND `primaryIntent !== 'explore'`, reset `effectiveChipPhase` to the governed phase (not the floor). A user switching from sell→buy should not carry seller Phase 3 forward.

### Fix 3: Register "What should I prepare?" in chip maps (chipGovernance.ts)
Add to `CHIP_DESTINATION` and `CHIP_KEY_DESTINATION` → routes to `/guides/first-time-buyer-guide` or a general buyer prep destination.

### Fix 4: Ensure PROGRESSION_MAP chips route to tools, not just text (chipGovernance.ts)
The "I'm looking to buy" progression returns `["Take readiness check", "View first-time buyer guide", "What should I prepare?"]`. The first two have actionSpecs. The third doesn't. Replace "What should I prepare?" with `"Check my buying power"` (has actionSpec → `/affordability-calculator`).

### Fix 5: Buyer Phase 2 turn rotation should surface affordability earlier (chipGovernance.ts, line 178-183)
Move `AFFORDABILITY_CALCULATOR` from turn 2 to turn 1 in the buyer chip rotation. Buyers care about numbers first.

### Fix 6: Journey State chip fallback should never return empty (index.ts)
Add guard: if `journey.stageChips.length === 0`, fall through to governed phase chips instead of using empty array.

## Files Modified
1. **`supabase/functions/selena-chat/index.ts`** — Intent-aware Phase 3, phase floor reset on intent switch, empty stageChips guard
2. **`supabase/functions/selena-chat/chipGovernance.ts`** — Register "What should I prepare?", fix buyer PROGRESSION_MAP, reorder buyer Phase 2 rotation

## What This Achieves
- Buyer saying "I'm looking to buy" gets buyer chips, not seller chips
- Affordability calculator is surfaced within first 2 turns for buyers
- No more empty chip arrays (dead-end conversations)
- Intent switches reset the chip floor so users aren't locked into wrong funnels
- Every chip resolves to a deterministic destination — zero unmatched chips

