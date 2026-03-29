

# Net-to-Seller Page: Remove Redundant CTA Section

## Problem
After completing the calculator, the user sees 3 separate CTA clusters stacked vertically — the calculator's own terminal CTAs, the "Want a Personalized Number?" section, and the ToolResultNextStep card. The middle section is redundant.

## Fix
**Delete the entire "Want a Personalized Number?" section** (lines 63-100 in `V2NetToSeller.tsx`). The calculator results already provide "Walk Through This with Kasandra" (primary) and "Ask Selena" (secondary). Adding "Get a Free CMA" is the same intent with different words.

**Keep ToolResultNextStep** — it's journey-aware and only shows after completion, recommending the *next logical tool* (not a duplicate booking CTA).

## Result
Post-calculation flow becomes:
1. Calculator results with recommendation
2. "Walk Through This with Kasandra" + "Ask Selena" (terminal pair)
3. ToolResultNextStep (contextual journey nudge)
4. Footer

Clean. No stacking. No cognitive overload.

## File Changed
| File | Action |
|------|--------|
| `src/pages/v2/V2NetToSeller.tsx` | Remove lines 63-100 ("Want a Personalized Number?" section) |

