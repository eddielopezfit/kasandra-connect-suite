

# Make Buyer Planning Tools Dynamic & Intent-Aware

## The Problem

The "Buyer Planning Tools" strip on `/buy` is a static 4-item grid:
1. Estimate Closing Costs
2. Compare Neighborhoods
3. Check Buying Power (Affordability)
4. BAH Calculator (Military)

Every visitor — first-time, returning, military, civilian — sees the same tools in the same order. This creates three issues:

- **BAH Calculator is irrelevant** for 85%+ of visitors (non-military). It adds noise.
- **Completed tools still show identically** — a user who already ran affordability sees no acknowledgment.
- **No prioritization** — the strip doesn't reflect what the user actually needs next based on their journey state.

The `AreaDecisionTools` component already implements this pattern (intent-aware filtering + completed-tool suppression). The `/buy` page should follow the same logic.

## The Fix

### Dynamic tool selection using `useJourneyProgress`

**Rules:**
1. **Suppress completed tools** — if `toolsCompleted` includes a tool's ID, mark it with a checkmark and move it to the end (don't hide — it validates their progress)
2. **Hide BAH Calculator** unless `isMilitary` is true in session context
3. **Promote Buyer Readiness** to the strip if the user hasn't completed it (it's currently only in the hero — the most important buyer tool should also appear here)
4. **Reorder by relevance** — incomplete tools first, completed tools last (greyed with checkmark)
5. **Show max 4 tools** — curated, not exhaustive

**Tool priority order (non-military):**
1. Buyer Readiness Check (if not completed)
2. Check Buying Power / Affordability
3. Estimate Closing Costs
4. Compare Neighborhoods

**Tool priority order (military):**
1. BAH Calculator (surfaces only for military)
2. Buyer Readiness Check (if not completed)
3. Check Buying Power
4. Estimate Closing Costs

**Completed tool treatment:**
- Faded styling (`opacity-60`) with a green checkmark icon replacing the tool icon
- Label changes from action verb to past tense: "Check Buying Power" → "✓ Buying Power Checked"
- Still clickable (user may want to re-run)

### Section header becomes contextual

| Journey Depth | Header (EN) | Header (ES) |
|---------------|-------------|-------------|
| `new` | "Start here — your buyer toolkit" | "Empieza aquí — tu kit de comprador" |
| `exploring` | "Pick up where you left off" | "Continúa donde te quedaste" |
| `engaged` | "You're making progress" | "Vas avanzando" |
| `ready` | (hide strip — they've used the tools) | (hide strip) |

### Files Modified
- `src/pages/v2/V2Buy.tsx` — replace static tool grid with dynamic rendering using `useJourneyProgress` data (`toolsCompleted`, `isMilitary`, journey depth). Add Buyer Readiness to the tool list. Apply completed-tool styling and contextual header.

**Estimated scope**: 1 implementation message. Single file, logic + copy changes only.

