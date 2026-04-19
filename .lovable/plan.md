

## Goal
Adapt the Luna concierge formula to Selena, layered on top of the existing `selena-chat` edge function without breaking the GuardState hierarchy, mode system, or chip governance that already exist.

## What's already in place (don't rebuild)
- `guardState.ts` (549 lines) — KB-0/Brokerage/Conversational/STATE GUARD/Mode hierarchy. This already covers Pillar 5 (Hard Walls) and parts of Pillar 4 (Neutral Guidance — no competitor steering, no commission quotes, no specific home values).
- `modeContext.ts` — 4-mode psychological progression (Orientation→Clarity→Confidence→Handoff). This is the structural equivalent of Luna's 8-step arc, just expressed as modes rather than steps.
- `systemPromptBuilder.ts` — assembles `SYSTEM_PROMPT_EN`/`SYSTEM_PROMPT_ES` (~2,500 lines) containing KB-0, KB-1, KB-4, KB-6, KB-7, KB-7.1, KB-8, KB-12.
- `bookingLogic.ts` — `hasEarnedBookingAccess()` already enforces Luna's "Lead Capture Timing Gates."
- `chipGovernance.ts` — chip determinism, banned-phrase filtering scaffold.
- Bilingual EN/ES is enforced everywhere.

The Luna formula is **80% already implemented architecturally**. The gap is **doctrinal depth and anti-deflection enforcement**, not infrastructure.

## What's actually missing (the real work)

### 1. Anti-Deflection Doctrine (Pillar 2) — biggest gap
Selena's current `<40 words, defer to Kasandra` rule is producing the exact failure Luna explicitly forbids: punting real questions instead of leading with substance. Need a new KB layer that mandates **"answer first, hand off second"** — and a banned-phrases list to enforce it.

### 2. Identity Doctrine (Pillar 1) — needs sharpening
Current persona is "calm digital concierge, defer to Kasandra." Luna's version is a manifesto ("Not a bot. Not a receptionist."). Selena needs the same — written as absolutes.

### 3. Consultative 8-Step Arc (Pillar 3) — partially present
Modes cover the macro structure, but the **One Question Rule** and **Reflect-in-upgraded-language** patterns aren't explicit. These are the magic moments.

### 4. KB10/KB11 depth files — don't exist yet
Current prompt has KB-0 through KB-12 but no per-transaction-type 10-section depth document. This is what makes Selena sound like she's done 500 closings.

### 5. Tone Test Suite — doesn't exist
No regression harness for prompt changes.

## Proposed implementation (3 phases, surgical)

### Phase 1 — Doctrine layer (highest leverage, lowest risk)
Add 3 new KB sections to `systemPromptBuilder.ts`, injected **between Conversational Doctrine and STATE GUARD** (preserving the hierarchy):

- **KB-13 — Identity Manifesto** (~40 lines EN + 40 ES). Absolutes-only. "Not a bot. Not a lead form. Not a Zillow search box."
- **KB-14 — Anti-Deflection Doctrine** (~80 lines EN + 80 ES). Banned phrases + required pattern (substance first, handoff second). Includes 6–8 BAD/GOOD examples for Tucson real estate.
- **KB-15 — Consultative Arc & One Question Rule** (~60 lines EN + 60 ES). Explicit 8-step arc, one open question per turn, reflect-in-upgraded-language pattern.

These are **additive prompt layers** — no changes to `guardState.ts`, no changes to mode logic, no changes to the response shape. The existing 549-line guard system stays intact and continues to win on conflicts (KB-0 always wins).

**Brevity rule reconciliation**: The current `<40 words, max 2 sentences` rule conflicts with Luna's "answer with substance" pattern. Resolution: relax to **<70 words, max 3 sentences when answering a substantive question; keep <40 words for greetings/transitions**. Codified in KB-14.

### Phase 2 — Banned phrase enforcement
Add a server-side post-processor in `selena-chat/index.ts` (alongside the existing 3rd-sentence truncator) that scans the model's reply for the banned phrases list and, on match, regenerates with a stronger anti-deflection instruction. Banned list lives in a new `selena-chat/bannedPhrases.ts` module so it's editable without touching the prompt.

### Phase 3 — KB depth files (deferred — needs Kasandra interview content)
Create stub files for the 10-section templates so the structure is in place, but flag that real content requires the 6–8hr Kasandra interview from the Luna 30-day plan. Stubs:
- `selena-chat/kb/transactions.ts` — 10 transaction categories × 10 sections
- `selena-chat/kb/team.ts` — Kasandra + referral partners
- `selena-chat/kb/neighborhoods.ts` — already partially covered by `neighborhoodRegistry.ts`; map existing data into the 10-section template

These get loaded conditionally based on detected intent (already wired via `intentDetection.ts`) so we don't blow the token budget.

### What I will NOT touch
- `guardState.ts` — KB-0 hierarchy stays exactly as-is. New KBs are added BELOW Conversational Doctrine, ABOVE STATE GUARD injection point, per existing architecture rules.
- `modeContext.ts` — modes stay 4 states, one-directional.
- `journeyState.ts` — TOFU/MOFU/BOFU classifier untouched.
- Chip determinism, ActionSpec, language lock, lead capture gates — all preserved.
- Frontend `SelenaChatContext.tsx` — no changes needed; new doctrine is server-side only.

## Files to create/edit (Phase 1 + 2 only)

| File | Action | Approx. size |
|------|--------|--------------|
| `supabase/functions/selena-chat/systemPromptBuilder.ts` | Edit — add KB-13/14/15 sections to both EN and ES prompts | +400 lines |
| `supabase/functions/selena-chat/bannedPhrases.ts` | Create | ~80 lines |
| `supabase/functions/selena-chat/index.ts` | Edit — wire banned-phrase post-processor | ~30 line patch |
| `.lovable/memory/selena-luna-doctrine.md` | Create — record the doctrine + brevity reconciliation | ~40 lines |

## Open questions before I proceed

1. **Brevity rule**: OK to relax Selena from `<40 words / 2 sentences` to `<70 words / 3 sentences` when answering substantive questions? (Required for anti-deflection to work; greetings/transitions stay tight.)
2. **Phase scope**: Ship Phase 1 + Phase 2 in one pass, OR Phase 1 only first so you can review the doctrine before the post-processor goes live?
3. **Phase 3 / KB depth**: Defer until you can record the Kasandra interviews, or stub the files now with placeholder content sourced from existing guides + neighborhood registry?

