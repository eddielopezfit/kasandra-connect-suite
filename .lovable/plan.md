

## Plan: Animated Vertical Buying Timeline

**New file:** `src/components/v2/BuyingTimeline.tsx`

A vertical timeline with gold connector line, numbered gold circle nodes, and scroll-triggered fade-up animation via IntersectionObserver.

- Gold (`bg-cc-gold`) 2px vertical line running down the left side (mobile) / center (desktop)
- 4 nodes: gold circle with white number, title in `font-serif text-cc-navy`, description in `text-cc-charcoal`
- Each node starts `opacity-0 translate-y-6` and transitions to `opacity-100 translate-y-0` when intersecting viewport (threshold 0.2, staggered 150ms delays)
- Uses `useRef` + `IntersectionObserver` in a `useEffect`
- All text bilingual via `t()`
- Mobile: single column, line on left, content right
- Desktop: alternating left/right with centered line

**Updated steps content:**
1. Get Pre-Approved / Obtén tu Preaprobación — "Know your budget before you fall in love with a home"
2. Find Your Home / Encuentra tu Hogar — "Selena helps you explore neighborhoods 24/7 before you meet Kasandra"
3. Make Your Offer / Haz tu Oferta — "Kasandra negotiates hard so you don't leave money on the table"
4. Get Your Keys / Llaves en Mano — "Close with confidence — bilingual support through every signature"

**Modified file:** `src/pages/v2/V2Buy.tsx`
- Import `BuyingTimeline`
- Replace lines 145–179 (the entire Process Steps section including the navy header box and white cards container) with `<BuyingTimeline />`
- Remove unused `steps` array (lines 62–93) and unused icon imports (`Home`, `Search`, `DollarSign`, `FileCheck`) if no longer referenced elsewhere

