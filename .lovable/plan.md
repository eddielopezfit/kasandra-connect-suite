

# Optimize and Test Every Chip and Conversation Flow — Brand Voice Alignment

## Summary

A comprehensive audit of Selena's chip governance, greeting system, conversation flows, and brand voice consistency across edge function, frontend context, entry greetings, guard state, mode context, concierge tabs, and suggested reply chips. Three categories of issues found: **title inconsistency**, **guide-loop escalation gap**, and **re-introduction bug** (session boundary). Plus several brand voice micro-violations.

---

## Issue 1: Title Inconsistency — "concierge" vs. "guide"

**Problem:** Selena's title is inconsistent across surfaces.

| Location | Current Title |
|---|---|
| `entryGreetings.ts` line 358 (hero EN) | "digital real estate **guide**" |
| `entryGreetings.ts` line 348 (hero ES) | "guia digital de bienes raices" |
| `entryGreetings.ts` line 448 (default EN) | "digital real estate **concierge**" |
| `entryGreetings.ts` line 438 (default ES) | "**concierge** digital de bienes raices" |
| `SelenaChatContext.tsx` line 754 (hero EN) | "digital real estate **guide**" |
| `SelenaChatContext.tsx` line 755 (hero ES) | "guia digital de bienes raices" |
| `SelenaChatContext.tsx` line 860 (default EN) | "digital real estate **concierge**" |
| `SelenaChatContext.tsx` line 861 (default ES) | "**concierge** digital de bienes raices" |
| `index.ts` KB-0 Doctrine line 707 | "digital real estate **concierge**" |
| `index.ts` KB-0 line 723 | "digital **concierge**" |

**Decision:** The approved title is **"digital real estate concierge"** / **"concierge digital de bienes raices"** per KB-0 Doctrine. The word "guide" is too generic and conflicts with the Guide Hub naming.

**Fix:** 4 replacements:
- `entryGreetings.ts` hero EN (line 358): "guide" to "concierge"
- `entryGreetings.ts` hero ES (line 348): "guia" to "concierge"
- `SelenaChatContext.tsx` hero EN (line 754): "guide" to "concierge"
- `SelenaChatContext.tsx` hero ES (line 755): "guia" to "concierge"

Also update the closing phrase from "I'm here to guide you" to "I'm here to help" (avoids self-referential "guide" wording).

---

## Issue 2: Guide-Loop Escalation Gap

**Problem:** From the test chat thread, Selena offers guides repeatedly after the user accepted them multiple times ("guide" -> accepted -> "guide" -> accepted -> still offers another "guide"). The edge function's `detectLoop()` catches word-level repetition but does not detect guide-acceptance patterns specifically.

**Current behavior:**
- `detectLoop()` in `index.ts` (line 368-382) checks word overlap in last 4 messages
- `guardState.ts` Rule 3 (line 183-188) blocks **re-suggesting the same guide** but does NOT escalate after 2+ consecutive guide acceptances

**Fix:** Add a guide-acceptance escalation rule in `guardState.ts`:
- New Rule 12: GUIDE LOOP ESCALATION
- If `guide_history.length >= 2` AND the last system action was `guide` AND the current message is an acceptance pattern ("yes", "guide", "show me", "si", "muestrame"), inject a governance hint forcing escalation to a decisive action (calculator, booking) instead of offering a third guide
- This aligns with the memory: "If a user repeats the same choice twice, she must escalate"

---

## Issue 3: Session Boundary Re-Introduction Bug

**Problem:** From the test thread, Selena re-introduced herself mid-conversation with "Hello, I'm Selena -- Kasandra's digital real estate guide." This happened when a guide page changed the entry context, triggering a new greeting injection despite `identity_disclosed` being true in history.

**Root cause:** The `shouldInjectGreeting` logic in `SelenaChatContext.tsx` (lines 531-548) allows greeting injection for `guide_handoff` source when the entry signature is new, even if the user already has an active conversation. The guide handoff greeting template at line 712 does NOT include an identity statement, but the hero/default templates do. The re-introduction happens when:
1. User navigates to a new guide page
2. Entry signature changes (new guide ID)
3. System selects the default or hero greeting template instead of the guide-handoff template

**Fix:** Two-layer defense:
1. In `SelenaChatContext.tsx`, add a check: if `messages.length > 3` (active conversation), NEVER inject a full identity greeting. Only contextual guide-handoff greetings ("I see you're reading...") are allowed.
2. In `entryGreetings.ts`, ensure `generateGuideHandoffGreeting()` never includes "I'm Selena" phrasing (already correct, but add a comment-guard).

---

## Issue 4: Brand Voice Micro-Violations in Chips

Several chip labels violate the "no exclamation points" and "calm authority" brand rules:

| File | Line | Violation |
|---|---|---|
| `SelenaChatContext.tsx` | 1043 | Fallback uses exclamation: "I'm here to help**!**" |
| `SelenaChatContext.tsx` | 1065 | Error fallback informal "don't worry" + "te preocupes" (should be "no se preocupe" for formal register, though the chat uses informal "tu" for Spanish) |

**Fix:**
- Line 1043: Remove exclamation from fallback
- Line 1065: Verify the Spanish register matches the "tu" standard (currently correct per KB-7)

---

## Issue 5: Concierge Tab Panel — Missing ActionSpec Mapping

The `ConciergeTabPanels.tsx` Start Here panel chips ("I'm thinking about selling", etc.) fire `onSendMessage()` which triggers an AI round-trip. Per the ActionSpec governance, intent declaration should be deterministic. However, these specific chips legitimately need AI processing (first-turn seller intercept), so no change needed here.

The "Talk to Kasandra" panel navigates directly to `/v2/book` via `handleBookWithKasandra()`. This is within the allowlist per the "Selena as Router" memory. No change needed.

---

## Issue 6: `entryGreetings.ts` / `SelenaChatContext.tsx` Greeting Duplication

There are two parallel greeting systems:
1. `entryGreetings.ts` (used by the edge function for server-side greetings)
2. `SelenaChatContext.tsx` (client-side greeting injection)

The client-side version is the active one (the edge function's `entryGreetings.ts` is not called from the main handler). This creates a maintenance burden but is not a functional bug. No change in this scope, but noted for future consolidation.

---

## Implementation Plan

### File 1: `src/contexts/SelenaChatContext.tsx`

1. **Title fix (hero greeting):** Lines 754-755 -- replace "digital real estate guide" with "digital real estate concierge" and "guia digital" with "concierge digital". Remove "I'm here to guide you" phrasing.
2. **Session boundary guard:** Around line 531 -- add condition: if `messages.length > 3`, restrict greeting injection to only contextual templates (guide_handoff, calculator, synthesis), never full identity greetings.
3. **Fallback exclamation fix:** Line 1043 -- remove exclamation mark.

### File 2: `supabase/functions/selena-chat/entryGreetings.ts`

4. **Title fix (hero greeting):** Lines 348, 358 -- same "guide" to "concierge" replacement.
5. **Add comment-guard:** Note that guide_handoff greetings must never include identity statements.

### File 3: `supabase/functions/selena-chat/guardState.ts`

6. **Rule 12 (Guide Loop Escalation):** After Rule 11 (~line 271), add a new rule that detects `guide_history.length >= 2 AND last_system_action === 'guide'` and injects an escalation hint forcing a decisive next step instead of another guide.

### File 4: `supabase/functions/selena-chat/index.ts`

7. No prompt content changes needed (KB-7 is already in place). Only redeploy after guardState update.

### Deployment

- Redeploy `selena-chat` edge function after all changes.

---

## Verification Tests

After deploy, run these tests manually:

1. **Title consistency:** Open Selena from the hero CTA -- verify "concierge" (never "guide") in both EN and ES
2. **Title consistency (default):** Open Selena from the floating button -- verify "concierge" in both languages
3. **Guide loop escalation:** Accept 2 guide suggestions consecutively -- verify Selena escalates to calculator/booking on the third turn instead of offering another guide
4. **Session boundary:** Mid-conversation, navigate to a new guide page and open Selena -- verify no re-introduction ("I'm Selena"), only contextual "I see you're reading..." message
5. **Brand voice:** Check all chip labels for exclamation points, emojis, or urgency language
6. **Phase governance:** Verify chips never regress after intent is declared (sell -> Phase 2 chips, not Phase 1)
7. **ActionSpec determinism:** Click "Estimate my net proceeds" chip -- verify it navigates directly to the calculator without sending a message
8. **Overwhelm gate:** Send "I'm panicking about losing my home" -- verify chips switch to "Connect with Kasandra" / "Keep chatting" only

