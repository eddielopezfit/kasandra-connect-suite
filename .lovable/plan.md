

# DCOS Audit Response — Prioritized Fix Plan

## Audit Summary

The Perplexity Comet audit validated the platform's intelligence layer as best-in-class but flagged 10 critical issues. After cross-referencing the codebase, here's what's real, what's already fixed, and what needs work — prioritized by conversion impact.

---

## Issue Triage

| # | Audit Finding | Status | Action |
|---|---|---|---|
| 1 | Page load performance (5-15s spinner) | **Real but overstated** — Route-level lazy loading already implemented (30+ `lazy()` imports in App.tsx). The spinner is `RouteFallback` shown during chunk download. The auditor was likely on a throttled network. | **Fix: Add skeleton screens to RouteFallback** |
| 2 | Spanish chips disappear after language switch | **Real bug** — `PROGRESSION_MAP` returns display strings, but `Guard 4` (journey_state !== 'decide') strips chips via `BOOKING_KEYWORDS` regex. When Spanish display strings like "Hablar con Kasandra" pass through the filter, they get stripped. Meanwhile, semantic keys like `talk_with_kasandra` don't match the regex and survive. **Mixed key types cause inconsistent filtering.** | **Fix: Normalize PROGRESSION_MAP to semantic keys** |
| 3 | "Welcome back" shown to first-time visitors | **False positive** — The auditor had localStorage from a previous session. The detection logic is correct (checks `selena_context_v2` for meaningful data). | **No fix needed** |
| 4 | Affordability calculator placeholder UX | **Valid UX concern** — Placeholder "85,000" looks like a filled value | **Fix: Style placeholders distinctly** |
| 5 | No skeleton screens beyond spinner | **Real** — `RouteFallback` is a plain spinner with no content skeleton | **Fix: Improve RouteFallback** |
| 6 | Mixed-language chips in ES mode | **Related to #2** — PROGRESSION_MAP emits display strings; some are EN-only when `language` param resolves wrong | **Fixed by #2** |
| 7 | Sell page CTA redundancy | **Already fixed** — Previous audit pass consolidated CTAs across all tool pages |  **No fix needed** |
| 8 | Selena doesn't reference calculator data | **Partially true** — SessionContext carries `estimated_value`, `calculator_advantage`, etc. and the edge function receives it. But the system prompt doesn't explicitly instruct Selena to reference these values in greetings. | **Fix: Add calculator-aware context block to system prompt** |
| 9 | Booking page doesn't pre-fill | **Already fixed** — Sticky Data Layer implementation (previous session) wired `BookingIntakeForm` to read from `getStoredEmail()`, `getStoredName()`, `getStoredPhone()` | **Verify only** |
| 10 | Lead capture modal timing | **Design choice** — Modal appears after scroll, which is intentional progressive profiling | **No fix needed** |

---

## Implementation Plan (4 fixes, ranked by impact)

### Fix 1: Skeleton RouteFallback (perceived performance)
**File:** `src/App.tsx`
Replace the navy spinner `RouteFallback` with a skeleton screen showing the nav bar shape, hero placeholder, and content blocks. This dramatically reduces perceived load time even if actual chunk download takes the same time.

### Fix 2: PROGRESSION_MAP Spanish Chip Bug (critical bilingual fix)
**File:** `supabase/functions/selena-chat/chipGovernance.ts`
The root cause: `PROGRESSION_MAP` entries emit **display strings** (e.g., "Comparar efectivo vs. listado") while the chip governance pipeline (`filterChipsForCompletedTools`, `filterSuggestionsForEarnedAccess`, Guard 4 booking filter) uses regex patterns that only match English strings like "Talk with Kasandra" but miss Spanish equivalents like "Hablar con Kasandra".

**The fix:** Update `Guard 4` in `selena-chat/index.ts` to also match Spanish booking keywords. Currently `BOOKING_KEYWORDS` and `BOOKING_PHRASES` only check English patterns — Spanish booking chips pass through the earned-access filter but get stripped by Guard 4's journey-state filter because the regex catches "Kasandra" but misses the full Spanish pattern.

Specifically:
- Add Spanish patterns to the `BOOKING_KEYWORDS` and `BOOKING_PHRASES` regexes used in Guard 4
- Ensure `filterSuggestionsForEarnedAccess` also recognizes Spanish booking strings

### Fix 3: Calculator-Aware Selena Context
**File:** `supabase/functions/selena-chat/modeContext.ts` or `systemPromptBuilder.ts`
Add a context injection block that surfaces calculator results when present:
```
If the user has completed the affordability calculator:
- Max purchase price: $262,969
- Monthly payment: $1,983
Reference this naturally when discussing buying options.
```
This data already flows via `context.estimated_value` and `context.calculator_advantage` — it just needs to be formatted into the system prompt.

### Fix 4: Calculator Input Placeholder Styling
**File:** `src/pages/v2/V2AffordabilityCalculator.tsx`
Change the income input placeholder from `"85,000"` to `"e.g. 85,000"` and add `placeholder:text-muted-foreground/50 placeholder:italic` to distinguish it from actual input.

---

## Files Changed

| # | File | Change |
|---|---|---|
| 1 | `src/App.tsx` | Replace `RouteFallback` spinner with skeleton layout |
| 2 | `supabase/functions/selena-chat/index.ts` | Add Spanish patterns to Guard 4 booking keyword regexes |
| 3 | `supabase/functions/selena-chat/systemPromptBuilder.ts` | Add calculator-data context block to system prompt |
| 4 | `src/pages/v2/V2AffordabilityCalculator.tsx` | Improve placeholder styling on income field |

## What's NOT Changing
- Route-level code splitting — already optimal (30+ lazy imports)
- Sticky Data Layer — already wired in previous session
- CTA consolidation — already done in previous audit pass
- First-time vs returning detection — working correctly
- Lead capture modal timing — intentional design

