

# Revised Journey Breadcrumb — Compliant Insight Labels

## The Compliance Issue
Three proposed labels from the previous plan are directional advice that violates KB-0/KB-4:
- ~~"Traditional sale looks like your best path"~~ — recommends a path
- ~~"A cash offer could work for your timeline"~~ — implies outcome
- ~~"The numbers lean toward cash"~~ — directional recommendation

These must be rewritten as **neutral reflections of what the user explored**, not recommendations.

## Corrected Label Table

| Signal | Old (Violating) | New (Compliant) | ES |
|--------|-----------------|-----------------|-----|
| Seller decision: traditional | "Traditional sale looks like your best path" | "You explored the traditional listing path" | "Exploraste la ruta de venta tradicional" |
| Seller decision: cash | "A cash offer could work for your timeline" | "You explored the cash offer path" | "Exploraste la ruta de oferta en efectivo" |
| Calculator: cash advantage | "The numbers lean toward cash" | "You compared cash vs. traditional numbers" | "Comparaste números: efectivo vs. tradicional" |
| Readiness score 70+ | (unchanged) "You're closer to ready than you think" | OK — emotional reassurance, not directional | OK |
| Readiness score <50 | (unchanged) "A few things to sort out first — that's normal" | OK — normalizing, not advisory | OK |
| Guides 6+ | (unchanged) "You've done more research than most" | OK — reflects effort, not outcome | OK |

## Legal Standard Applied
All labels must pass this test: **Does this tell the user what they DID, or what they SHOULD DO?**
- ✅ "You explored..." — reflects action taken
- ✅ "You compared..." — reflects action taken  
- ❌ "...looks like your best path" — directional advice
- ❌ "...could work for your timeline" — outcome prediction

## Next Step CTA Labels — Also Checked
- "Let's sit down and talk through this" → ✅ OK (invitation, not recommendation)
- "See where you stand as a buyer" → ✅ OK (self-assessment framing)
- "Figure out your best selling path" → ⚠️ Borderline — change to **"Walk through your selling options"** / "Revisa tus opciones de venta"
- "Find the right area for you" → ✅ OK (exploration framing)

## Implementation
Same 2 files as the approved plan, with corrected copy:
- `src/components/v2/JourneyBreadcrumb.tsx` — insight labels + header + styling
- `src/hooks/useJourneyProgress.ts` — CTA label updates

**1 implementation message. Copy + styling only.**

