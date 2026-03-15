

# Performance Audit Report

## 1. JS Bundle — Critical Issues

### 1A. Duplicate Sticky Mobile Booking Bars (BUG)
`V2Layout.tsx` renders a **global** sticky booking bar on every mobile page (lines 139–156). Meanwhile, `V2Sell.tsx` and `V2Buy.tsx` each render their own `StickyMobileBookingBar` component. On `/sell` and `/buy`, mobile users see **two overlapping fixed-bottom bars** — one from the layout, one from the page. The page-level component is now redundant.

**Fix:** Remove `StickyMobileBookingBar` imports and usage from `V2Sell.tsx` and `V2Buy.tsx`. The global one in `V2Layout` already covers them.

### 1B. YouTube iframe Eager-Loading
Homepage and Podcast page both embed a YouTube iframe with no lazy-loading. Each iframe loads ~800KB of YouTube JS + CSS on page load. On the homepage, this iframe is buried 13 sections deep — most users never scroll to it.

**Fix:** Replace direct `<iframe>` with a "click-to-play" thumbnail pattern: show a static image + play button, load the iframe only on click. This eliminates ~800KB from initial load on two pages.

### 1C. Homepage Video Eager-Loading
The homepage has a `<video src="/videos/kasandra-welcome.mp4">` without `preload="none"`. The browser begins downloading the MP4 immediately. This video is in the "About" section (section 5 of 13) — most users never reach it.

**Fix:** Add `preload="none"` to all three video instances on the homepage (desktop, tablet, mobile layouts).

### 1D. Hero Images Are PNGs
Eight hero images are imported as `.png` files (200-500KB each). These are above-the-fold background images loaded on every hub page.

**Fix:** Convert to WebP (60-70% smaller). This is a manual asset step — flag for future but don't block on it.

## 2. Component Hydration

### 2A. `framer-motion` Loaded on 3 Components
`framer-motion` (~45KB gzipped) is imported by `ReadinessSnapshot`, `GoogleReviewsSection`, and `EquityPulseSection`. `GoogleReviewsSection` is already lazy-loaded. The other two are not.

**Status:** Acceptable — framer-motion is already in the `ui-heavy-vendor` chunk (shared with recharts). No action needed.

### 2B. `SelenaChatContext` — Double Snapshot Restoration
Both `V2Layout.tsx` (lines 31-96) and `SelenaChatContext.tsx` (lines 134-160) independently call `get-session-snapshot` on mount. This fires **two identical edge function calls** per page load.

**Fix:** Remove the snapshot restoration from `SelenaChatContext.tsx` — `V2Layout` already handles it and runs first.

### 2C. `QueryClient` Created Outside Component
`QueryClient` is instantiated at module scope (line 54 of `App.tsx`): `const queryClient = new QueryClient()`. This is correct and avoids re-creation on re-renders. No issue.

## 3. Supabase Query Efficiency

### 3A. `useMarketPulse` — No Caching
`useMarketPulse` calls `get-market-pulse` via `supabase.functions.invoke()` with raw `useEffect` — no React Query caching. Every component mounting this hook fires a fresh edge function call. The `GlassmorphismHero` uses it, meaning every page load triggers this call.

**Fix:** Migrate `useMarketPulse` to use `useQuery` from `@tanstack/react-query` with a 30-minute `staleTime` (same pattern as `useYouTubeVideos`). This eliminates redundant calls across navigation.

### 3B. `get-session-snapshot` — Called Twice (see 2B above)

## 4. Image Loading

### 4A. Hero Background Pattern
`GlassmorphismHero` uses `background-image: url(...)` via inline style. This bypasses `loading="lazy"` — the image downloads immediately regardless of viewport position. For sub-pages this is correct (hero is always visible). For the homepage, the hero image is a ~300KB JPG that loads correctly as above-fold content.

**Status:** Correct behavior. No change needed.

### 4B. Missing `fetchpriority="high"` on Hero Images
The hero `<img>` tags on internal sections (headshots, lifestyle photos) correctly use `loading="lazy"`. No above-fold `<img>` elements are missing lazy loading.

**Status:** Good. No change needed.

## 5. Lazy Loading Opportunities

### 5A. `TestimonialColumns` — Not Lazy-Loaded
`TestimonialColumns` is imported eagerly on the homepage but renders as section 11 of 13. It should be lazy-loaded.

**Fix:** `const TestimonialColumns = lazy(() => import("@/components/v2/TestimonialColumns"));`

### 5B. `HomepageNeighborhoodCards` — Not Lazy-Loaded
Section 8 of 13 on homepage. Renders 6 neighborhood cards with images.

**Fix:** `const HomepageNeighborhoodCards = lazy(() => import("@/components/v2/neighborhood/HomepageNeighborhoodCards"));`

### 5C. `InstantAnswerWidget` — Not Lazy-Loaded
Section 4 of 13. Contains calculator logic and recharts dependency.

**Fix:** `const InstantAnswerWidget = lazy(() => import("@/components/v2/calculator/InstantAnswerWidget"));` — Note: this is already imported via the barrel `calculator/index.ts`. Need to convert to direct lazy import.

## 6. Mobile Performance

### 6A. Dual Sticky Bars (see 1A) — Z-Index Collision
Both sticky bars use `z-[40]` / `z-40`. On `/sell` mobile, they stack on top of each other. The Selena FAB uses `z-50` with a bottom offset of `calc(5rem + env(safe-area-inset-bottom))` which accounts for one bar, not two.

**Fix:** Removing the page-level `StickyMobileBookingBar` from Sell/Buy resolves this entirely.

### 6B. Homepage Scroll Depth — 13 Sections
On mobile, the homepage is 15+ screen heights. No mid-page conversion anchors until the very bottom `CTASection`.

**Status:** Already addressed in the conversion optimization work. No additional change needed.

---

## Implementation Plan (6 changes)

### P0 — Remove Duplicate Sticky Bars (bug)
**Files:** `src/pages/v2/V2Sell.tsx`, `src/pages/v2/V2Buy.tsx`
Remove `StickyMobileBookingBar` import and usage from both files. Delete `src/components/v2/StickyMobileBookingBar.tsx`.

### P1 — Migrate `useMarketPulse` to React Query
**File:** `src/hooks/useMarketPulse.ts`
Wrap the edge function call in `useQuery` with 30-min `staleTime`. Eliminates redundant calls across page navigations.

### P2 — Remove Duplicate Snapshot Restoration
**File:** `src/contexts/SelenaChatContext.tsx`
Remove lines 134-160 (the `get-session-snapshot` call). `V2Layout` already handles this.

### P3 — Add `preload="none"` to Homepage Videos
**File:** `src/pages/v2/V2Home.tsx`
Add `preload="none"` to all 3 `<video>` elements (desktop, tablet, mobile layouts).

### P4 — YouTube Click-to-Play
**Files:** `src/pages/v2/V2Home.tsx`, `src/pages/v2/V2Podcast.tsx`
Replace direct YouTube `<iframe>` with a thumbnail + play button that loads the iframe on click. Saves ~800KB per page.

### P5 — Lazy-Load Below-Fold Homepage Sections
**File:** `src/pages/v2/V2Home.tsx`
Convert `TestimonialColumns`, `HomepageNeighborhoodCards`, and `InstantAnswerWidget` to `lazy()` imports with `<Suspense>` wrappers.

