

## Analysis: "Your Situation Matters" Section

**Verdict: Remove it entirely. It's redundant and messy.**

### Why it should go:

1. **Duplicates the category nav.** "Inherited Property" = the "Inherited Property" category filter below. "First-Time Buyer" = the "Buying" category. The user scrolls past situation cards only to see the same taxonomy repeated as filter pills.

2. **"Relocating to Tucson" links to a guide that doesn't exist** (`tucson-neighborhood-guide`). That's a dead link — it will 404 or show a "guide not found" state.

3. **"Prefiero Español" is not a situation — it's a language preference.** The language toggle in the nav already handles this. Putting it as a "situation" card conflates UI controls with content routing.

4. **Mobile layout is bad.** 4 full-width stacked cards consume ~500px of vertical scroll before the user sees any actual guide content. That's a wall of navigation before the content. On a guides page, content should come fast.

5. **Cognitive load.** The page already has: Hero (3 CTAs) → Start Here Lane (conditionally) → Situation Lane → Recommended Carousel → Progress Bar → Category Nav → Grid. That's 6 layers before the actual guides. Removing Situation Lane drops it to 5.

### What changes:

**File: `src/pages/v2/V2Guides.tsx`**
- Remove the `SituationLane` import and the `<SituationLane>` render block (~4 lines)
- Remove the `handleSituationClick` callback (~3 lines)
- Remove `SituationLane` from the guides index export if present

**File: `src/components/v2/guides/index.ts`**
- Remove `SituationLane` export (cleanup)

The component file itself (`SituationLane.tsx`) can stay — no harm in dead code for now, and it could be repurposed later if needed.

