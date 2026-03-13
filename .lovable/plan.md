

# Neighborhood Card Shimmer Fix

Single-file edit to `src/components/v2/neighborhood/NeighborhoodIndexCard.tsx`.

## Change

Replace the static `bg-gradient-to-br from-cc-navy/80 to-cc-slate/60` background in the image container (line 42) with an animated shimmer placeholder that shows while the image loads. Use a `loaded` state flag — when the `<img>` fires `onLoad`, flip to true and hide the shimmer.

```text
┌─────────────────────────┐
│  Before img loads:      │
│  ┌───────────────────┐  │
│  │ ░░░▓▓░░░▓▓░░░▓▓░ │  ← animated gradient shimmer
│  │ ░░░▓▓░░░▓▓░░░▓▓░ │
│  └───────────────────┘  │
│  After onLoad:          │
│  ┌───────────────────┐  │
│  │   actual image     │  ← shimmer hidden
│  └───────────────────┘  │
└─────────────────────────┘
```

## Implementation

1. Add `const [loaded, setLoaded] = useState(false)` alongside existing `imgError` state
2. Add a shimmer `<div>` inside the image container that's visible when `!loaded && !imgError`:
   - Uses `@keyframes shimmer` via inline style or a Tailwind class: `animate-pulse` with a `bg-gradient-to-r from-cc-sand via-white/40 to-cc-sand bg-[length:200%_100%]`
3. On the `<img>`, add `onLoad={() => setLoaded(true)}` — shimmer fades out when image is ready
4. Fallback path (imgError) remains unchanged

**1 file modified, ~10 lines changed.**

