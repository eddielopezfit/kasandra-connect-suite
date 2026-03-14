

## NeighborhoodIndexCard — Premium Hover-Reveal Overhaul

### Single file: `src/components/v2/neighborhood/NeighborhoodIndexCard.tsx`

**Full rewrite** of the card JSX. Keep all existing state, imports, constants, and types.

**Import changes (line 3-5):**
- Remove `Card, CardContent` import
- Replace `ArrowRight, MapPin` with `ArrowRight, MapPin, Home, Clock, Star`

**Card structure** — replace lines 37-80:

```text
┌──────────────────────────────┐
│ [Region Badge]    [ZIP pill] │  ← absolute top
│                              │
│     Full-bleed hero image    │  ← h-72, group-hover:scale-110
│     (gradient overlay)       │
│                              │
│ Name (serif 2xl)  Explore →  │  ← absolute bottom
└──────────────────────────────┘

HOVER OVERLAY (opacity-0 → opacity-100):
┌──────────────────────────────┐
│                              │
│   Neighborhood Name          │
│   [Median $365K] [38 days]   │  ← stat pills
│   [Top Tucson area]          │
│   Tagline text...            │
│   [ Explore Name → ]        │  ← gold button
│                              │
└──────────────────────────────┘
```

**Key implementation details:**
- Outer: `div.group.relative.h-72.rounded-2xl.overflow-hidden.cursor-pointer` with shadow + hover scale
- Image: full bleed with `group-hover:scale-110 duration-700`, keep shimmer/error fallback
- Gradient: `from-black/80 via-black/20 to-transparent`
- Hover overlay: `absolute inset-0 bg-cc-navy/92 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300`
- Mobile touch: use `@media (hover: hover)` via Tailwind arbitrary variant `[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100` — on touch devices overlay shows at `opacity-100` permanently with `bg-cc-navy/60`
- 3 stat pills: Home/Clock/Star icons with placeholder data ("Median $365K", "38 days avg", "Top Tucson area")
- Bottom gold CTA button: `bg-cc-gold text-cc-navy font-semibold rounded-full py-2 text-sm`

