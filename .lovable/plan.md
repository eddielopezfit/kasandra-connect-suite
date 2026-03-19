

# Fix Seller Timeline — Readability & Real Data

## Problems Identified

From the screenshots:

1. **Phase cards 1 & 2 are nearly unreadable** — text appears washed out / invisible on the dark navy background. The `opacity-60` on past phases plus low-contrast border colors make content disappear.

2. **Hardcoded "38 days"** — Phase 3 shows "Tucson median: 38 days" but the real market data is now 42 days. This value is hardcoded in `buildPhases()` instead of pulling from market pulse.

3. **Card contrast issues** — Cards use `bg-cc-navy/5` and `bg-white/60` which become nearly transparent on the dark V2Layout background, making all inner text hard to distinguish.

4. **Selection step cards** (close window, readiness) — white cards look decent but the overall wizard lacks a hero header or context framing. It jumps straight into options with minimal visual hierarchy.

## Fix Plan

### 1. Wire real market DOM into the timeline (`V2SellerTimeline.tsx`)
- Import `useMarketPulse` hook
- Pass `medianDaysOnMarket` into `buildPhases()` instead of hardcoded `38`
- Use it for the Phase 3 week calculation and label

### 2. Fix phase card readability (`V2SellerTimeline.tsx`)
- Give all phase cards solid white backgrounds (`bg-white`) instead of transparent tints
- Remove `opacity-60` from past phases — use a subtle left-border or muted icon instead
- Ensure text colors are always `text-cc-navy` / `text-cc-charcoal` on white
- Add subtle `shadow-sm` to each card for depth separation from the dark background

### 3. Improve wizard container framing
- Wrap the wizard content in a `bg-white/95 backdrop-blur rounded-2xl p-6` card so the entire wizard has a light surface against the dark layout background
- This instantly fixes all contrast issues for both input steps and result steps

### 4. Minor polish
- Phase date range badges: ensure solid `bg-white` not `bg-white/50`
- Active phase ring: use `ring-2 ring-cc-gold` for stronger "You Are Here" signal
- Compressed timeline warning: ensure amber background is opaque

**Files changed**: `src/pages/v2/V2SellerTimeline.tsx` only

