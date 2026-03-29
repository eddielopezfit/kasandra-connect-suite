

# Mobile Optimization — Scroll-to-Top, Content Drift & Eye-Level CTA Fixes

## Problems Found

### 1. Page content hidden behind sticky bars (bottom clipping)
The sticky "Book a Strategy Session" bar in V2Layout is ~70px tall. On pages with bottom CTA sections, the last CTA button gets covered. Several pages use `pb-24 sm:pb-16` to compensate, but this is inconsistent — some pages lack bottom padding entirely (Home, About, Contact, TucsonLiving, etc.). The footer content gets cut off on mobile.

### 2. `safe-area-pb` class doesn't exist
`StickyMobileBookingBar.tsx` uses `safe-area-pb` — this CSS class is never defined anywhere (not in `index.css`, not in Tailwind config). iOS notch-bar devices get no safe-area padding on this component.

### 3. ScrollManager scrolls to `block: "start"` — content lands behind fixed nav
The fixed nav (branding strip + nav bar) is ~76px on mobile (`36px + ~40px`). When `ScrollManager` or any `scrollIntoView({ block: "start" })` fires, the target element's top aligns with viewport top — which is behind the fixed nav. Users must manually scroll up to see the content they clicked to reach.

### 4. Selena floating button overlaps sticky book bar on mobile
The floating Selena button is at `bottom-[calc(5rem+env(safe-area-inset-bottom))]` (~80px). The sticky book bar is ~70px from bottom. These overlap, creating a tight, cluttered bottom corner.

### 5. Calculator results scroll to `block: "start"` — hidden behind nav
All calculators (`V2AffordabilityCalculator`, `V2BAHCalculator`, `V2BuyerClosingCosts`) use `scrollIntoView({ block: "start" })` after results render. Results header lands behind the fixed nav.

---

## Fixes (7 files)

### Fix 1: Global scroll-margin-top for fixed nav clearance
**File:** `src/index.css`
Add a CSS rule: `[id] { scroll-margin-top: 80px; }` — any element scrolled to via anchor or `scrollIntoView` will automatically clear the fixed nav. This fixes every `scrollIntoView({ block: "start" })` call site-wide in one line.

### Fix 2: ScrollManager — use scroll-margin instead of raw scrollTo
**File:** `src/components/ScrollManager.tsx`
No change needed if Fix 1 is applied — `scrollIntoView({ block: "start" })` will respect `scroll-margin-top`. But the `window.scrollTo({ top: 0 })` for route changes is correct.

### Fix 3: Add safe-area-pb utility class
**File:** `src/index.css`
Add `.safe-area-pb { padding-bottom: env(safe-area-inset-bottom, 0px); }` so `StickyMobileBookingBar` actually works on iOS notch devices.

### Fix 4: Bottom padding on V2Layout main content for sticky bar clearance
**File:** `src/components/v2/V2Layout.tsx`
Add `pb-20 lg:pb-0` to the `<main>` tag so page content never gets clipped behind the sticky mobile book bar. This replaces the inconsistent per-page `pb-24` hacks.

### Fix 5: Standardize per-page bottom padding — remove redundant pb-24
**Files:** `V2Buy.tsx`, `V2Sell.tsx`, `V2CashOfferOptions.tsx`, `V2Neighborhoods.tsx`, `V2Podcast.tsx`, `V2Guides.tsx`
Change `pb-24 sm:pb-16` → `pb-16` on bottom CTA sections since V2Layout now handles the sticky bar clearance globally.

### Fix 6: Fix Selena floating button position to not overlap sticky bar
**File:** `src/components/selena/SelenaFloatingButton.tsx`
Change mobile bottom offset from `bottom-[calc(5rem+env(safe-area-inset-bottom,0px))]` to `bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))]` — provides 8px breathing room above the sticky book bar.

### Fix 7: Selena chat drawer — ensure messages scroll to eye level
**File:** `src/components/selena/SelenaChatDrawer.tsx`
Already using `scrollIntoView({ behavior: 'smooth', block: 'end' })` — this is correct. No change needed.

---

## Summary

| # | File | Change |
|---|------|--------|
| 1 | `src/index.css` | Add `scroll-margin-top: 80px` + `.safe-area-pb` utility |
| 2 | `src/components/v2/V2Layout.tsx` | Add `pb-20 lg:pb-0` to main tag |
| 3 | `src/components/selena/SelenaFloatingButton.tsx` | Bump bottom offset by 8px |
| 4 | `src/pages/v2/V2Buy.tsx` | `pb-24 sm:pb-16` → `pb-16` |
| 5 | `src/pages/v2/V2Sell.tsx` | `pb-24 sm:pb-16` → `pb-16` |
| 6 | `src/pages/v2/V2CashOfferOptions.tsx` | `pb-24 sm:pb-16` → `pb-16` |
| 7 | `src/pages/v2/V2Neighborhoods.tsx` | `pb-24 sm:pb-16` → `pb-16` |
| 8 | `src/pages/v2/V2Podcast.tsx` | `pb-24 sm:pb-16` → `pb-16` |
| 9 | `src/pages/v2/V2Guides.tsx` | `pb-24 md:pb-16` → `pb-16` |

**Result:** Every CTA click, route change, and tool result lands at eye level. No scrolling required. No content hidden behind fixed elements. No overlap between Selena button and sticky bar. Safe-area works on all iOS devices.

