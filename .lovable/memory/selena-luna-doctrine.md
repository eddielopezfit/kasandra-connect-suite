# Selena Luna Doctrine (Phase 1 + 2)

Adapted from the Hush/Luna concierge formula. Layered onto the existing Selena edge function without touching `guardState.ts`, `modeContext.ts`, or `journeyState.ts`.

## New KB Layers (in `systemPromptBuilder.ts`)

Injected between the platform-hub awareness block and `${MODE_INSTRUCTIONS_*}`, both EN + ES:

- **KB-15 — Identity Manifesto.** Absolutes-only ("Not a bot. Not a lead form. Not a Zillow search box."). Filters every output through a clear character.
- **KB-16 — Anti-Deflection Doctrine.** Substance first, handoff second. Banned-phrase list + 3 BAD/GOOD Tucson-specific examples. **Relaxes brevity to ≤3 sentences / ~70 words for substantive questions; greetings and chip-led routing stay at ≤2 sentences / ~40 words.**
- **KB-17 — Consultative Arc & One Question Rule.** Explicit 8-step arc, one open question per turn, reflect-in-upgraded-language pattern, 2-strike discovery circuit-breaker.

## KB Hierarchy (unchanged)

KB-0 > Brokerage Truth > Conversational Doctrine > **STATE GUARD** > Mode Instructions

KB-15/16/17 sit at Conversational Doctrine level. KB-0 still wins on every conflict.

## Brevity Reconciliation

- Old rule: `<40 words / max 2 sentences` always.
- New rule (KB-16): `≤70 words / max 3 sentences` when answering a substantive question; tight rule still applies to greetings, transitions, and chip-led routing.
- The 3rd-sentence post-processor truncator in `index.ts` already aligns with this — no change needed.

## Banned-Phrase Post-Processor

- New module: `supabase/functions/selena-chat/bannedPhrases.ts`
- Regex lists for EN and ES.
- `index.ts` runs `detectBannedPhrase()` after the existing sanitizers. On hit, it appends a KB-16 override nudge and regenerates once.

## What was NOT touched

- `guardState.ts` (549 lines, KB-0 hierarchy)
- `modeContext.ts` (4-mode progression)
- `journeyState.ts` (TOFU/MOFU/BOFU)
- Chip determinism, ActionSpec, language lock, lead capture gates
- Frontend `SelenaChatContext.tsx`

## Phase 3 (deferred)

KB10 transactions / KB11 team / KB12 neighborhoods 10-section depth files require 6–8hr Kasandra interviews. Stubs not created until interview content exists.
