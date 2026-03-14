

## TrustBar → Premium Social Proof Bar

### Current State
The component renders a marquee-scrolling list of 6 community organizations (Arizona Diaper Bank, Greater Tucson Leadership, etc.) on a white background. It's a "trusted by" bar with entity names and roles.

### New Design
Replace entirely with a single-line dark navy bar showing consolidated review social proof:

```text
┌────────────────────────────────────────────────────────────────────┐
│  ★★★★★ 4.9 · 126+ reviews  │  Verified: Google Realtor.com Zillow  │  Bilingual · Tucson, AZ  │
└────────────────────────────────────────────────────────────────────┘
```

### Changes to `src/components/v2/TrustBar.tsx`

**Full rewrite** — remove all existing content (marquee, entities array, duplicated list).

Replace with:
- `<section className="bg-cc-navy py-2.5 px-6">`
- Inner: `flex items-center justify-center gap-6 overflow-x-auto whitespace-nowrap text-sm`
- **Left cluster**: 5 gold star characters (`★`) in `text-cc-gold`, bold "4.9" in `text-cc-ivory`, "· 126+ reviews" in `text-cc-ivory/70`
- **Divider**: `<span className="w-px h-4 bg-cc-ivory/20" />`
- **Middle cluster**: Small "Verified" label in `text-cc-gold/80 text-xs uppercase tracking-wider` above a row of 3 platform pills — each pill: `bg-white/10 text-cc-ivory rounded-full px-2.5 py-0.5 text-xs font-medium`
- **Divider**: same vertical line
- **Right cluster**: "Bilingual Service" in `text-cc-ivory/70`, "· Tucson, AZ" in `text-cc-ivory/50`
- Bilingual via `t()` for "reviews", "Verified", "Bilingual Service"
- Mobile: horizontal scroll, no wrapping — `overflow-x-auto whitespace-nowrap`, hide scrollbar with `scrollbar-hide` or `-webkit-scrollbar: none`

Single file change. No new dependencies.

