

# Plan: Make Lovable Site Pop — Font Standardization, Faster TrustBar, and Hero Images

## Three Changes

### 1. Speed Up TrustBar Marquee Animation
**File:** `src/index.css`
- Change `.animate-marquee` from `25s` to `12s` for a noticeably faster, more dynamic scroll
- This matches the energy of the Google Studio build

### 2. Standardize Font Sizes to Match /sell Page Scale
The Google Studio /sell page uses larger, bolder typography. The current Lovable /sell page uses `text-4xl md:text-5xl` for h1 and `text-3xl md:text-4xl` for section h2s. The target is to bump everything up one tier across all pages.

**Target scale:**
- Hero h1: `text-5xl md:text-6xl lg:text-7xl`
- Section h2: `text-4xl md:text-5xl`
- Hero body: `text-xl`

**Files to update (8 total):**

| File | Current h1 | Current h2s |
|------|-----------|-------------|
| `V2Sell.tsx` (line 46) | `text-4xl md:text-5xl` | `text-3xl md:text-4xl` (lines 71, 175, 242) |
| `V2Buy.tsx` (line 81) | `text-4xl md:text-5xl` | `text-3xl md:text-4xl` (lines 116, 167, 243) |
| `V2Home.tsx` (line 76) | `text-4xl md:text-5xl lg:text-6xl` | `text-3xl md:text-4xl` (lines 145, 203, 272, 360, 437, 497, 559, 614, 634) |
| `V2CashOfferOptions.tsx` (line 23) | `text-4xl md:text-5xl` | `text-3xl md:text-4xl` (lines 41, 61, 254) |
| `V2Community.tsx` (line 26) | `text-4xl md:text-5xl` | `text-3xl md:text-4xl` (lines 51, 103, 141, 183) |
| `V2Podcast.tsx` (line 18) | `text-4xl md:text-5xl` | `text-3xl md:text-4xl` (lines 52, 113, 154) |
| `V2Guides.tsx` — uses PersonalizedHero | (handled below) | N/A |
| `PersonalizedHero.tsx` (line 134) | `text-4xl md:text-5xl lg:text-6xl` | N/A |

**Specific changes per file:**
- All hero h1: replace `text-4xl md:text-5xl` with `text-5xl md:text-6xl lg:text-7xl`
- V2Home h1: replace `text-4xl md:text-5xl lg:text-6xl` with `text-5xl md:text-6xl lg:text-7xl`
- PersonalizedHero h1: replace `text-4xl md:text-5xl lg:text-6xl` with `text-5xl md:text-6xl lg:text-7xl`
- All section h2 inside navy bands: replace `text-3xl md:text-4xl` with `text-4xl md:text-5xl`
- All hero body `text-lg`: replace with `text-xl`
- V2Home mobile about h2 (line 272): `text-2xl` to `text-3xl`

### 3. Surreal Tucson Hero Images — Recommendation

Currently only `/v2` (Home) has a hero background image (`hero-bg.jpg`). The other pages (Sell, Buy, Cash Offer, Community, Podcast, Guides) use flat `bg-cc-navy` with no image.

**Recommendation: Yes, add surreal Tucson images — but with constraints.**

Per the visual governance mandate (Documentary Realism: desert light, quiet streetscapes, no people/faces/agents), each page should get a unique Tucson-themed background. However, since generating or sourcing these images requires external assets, the implementation would be:

1. Create placeholder slots in each hero section (add background image layer with gradient overlay, matching the Home page pattern)
2. Use the existing `hero-bg.jpg` as a temporary fallback for all pages
3. Once custom images are provided/generated, swap them per-page

**Files affected:** `V2Sell.tsx`, `V2Buy.tsx`, `V2CashOfferOptions.tsx`, `V2Community.tsx`, `V2Podcast.tsx`, `PersonalizedHero.tsx`

Each hero section would change from:
```
<section className="bg-cc-navy pt-32 pb-16">
```
To the Home page pattern:
```
<section className="relative min-h-[50vh] flex items-end w-full overflow-hidden">
  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}>
    <div className="absolute inset-0 bg-gradient-to-r from-cc-blue/90 to-cc-blue/75" />
  </div>
  <div className="relative container mx-auto px-4 pt-32 pb-16">
```

## Execution Order
1. Speed up TrustBar animation (1 line in CSS)
2. Standardize font sizes across all 8 files
3. Add hero image backgrounds to 6 pages

