

# Comprehensive Hub UX Optimization Audit

A full-system review identifying 12 actionable optimizations across 5 categories. Prioritized by impact.

---

## Category 1: CTA Redundancy & Cognitive Overload

### 1.1 Remove Footer CTA Strip (Previously approved — not yet implemented)
**File:** `src/components/v2/V2Footer.tsx` (lines 14-40)
The navy "Not sure where to start? Talk to Selena" bar appears on every page above the footer. It duplicates the sticky mobile bar and page-level terminal CTAs. Remove the entire block and unused imports (`MessageCircle`, `Calendar`, `useSelenaChat`).

### 1.2 Clean Up V2CashOfferOptions Bottom CTA Stacking
**File:** `src/pages/v2/V2CashOfferOptions.tsx` (lines 129-186)
Currently has THREE actions stacked vertically: Book button, Cash Readiness link, AND "talk to Selena" link, followed by a SECOND navy section (lines 174-186) with yet another link back to `/sell`. Remove the second navy section entirely — the `/sell` cross-link belongs in the footer navigation, not as a redundant terminal block. Also remove the "Or talk to Selena first" text link (line 160-164) since the floating Selena button handles that.

### 1.3 V2About: Remove Redundant Selena Section at Bottom
**File:** `src/pages/v2/V2About.tsx` (lines 366-378)
"My Team Includes AI" heading + compact `SelenaShowcase` at the bottom of the About page adds another CTA layer after the "Beyond Real Estate" personal touch section. The floating Selena button and the homepage showcase already handle Selena discovery. Remove this section — it breaks the emotional close of the page (personal touch → footer is the right termination).

---

## Category 2: Visual & Layout Consistency

### 2.1 Standardize Hero Patterns Across Pages
**Problem:** The homepage and Buy/Sell pages use `GlassmorphismHero` (full-bleed, min-h-[85dvh]), but About, Cash Offer Options, and Contact use inconsistent hero patterns — About uses a static background with `min-h-[50vh]`, Cash uses the same, Contact uses a flat `bg-cc-navy` with no background image.

**Fix:** Update Cash Offer Options and Contact heroes to use `GlassmorphismHero` for visual consistency. The About page hero can stay unique (editorial feel), but Contact should match the system.

**Files:**
- `src/pages/v2/V2Contact.tsx` — Replace flat navy hero with `GlassmorphismHero` using `showMarketPulse={false}`
- `src/pages/v2/V2CashOfferOptions.tsx` — Replace custom hero with `GlassmorphismHero`

### 2.2 Fix Navigation Phone Number Visibility on Scroll
**File:** `src/components/v2/V2Navigation.tsx` (line 182)
The phone number link has `text-white/70` class which becomes invisible when the nav scrolls to the light sand background. Add scroll-aware color:
```
className={`hidden lg:flex items-center gap-1.5 text-sm transition-colors ${
  isScrolled ? 'text-cc-navy/70 hover:text-cc-navy' : 'text-white/70 hover:text-white'
}`}
```

### 2.3 Unused Imports Cleanup
**Files with dead imports after previous changes:**
- `V2About.tsx`: `Button`, `logCTAClick`, `CTA_NAMES` — no longer used after CTA removal
- `V2Home.tsx`: `CheckCircle` — not used in current homepage
- `V2Footer.tsx`: After CTA strip removal — `MessageCircle`, `Calendar`, `useSelenaChat`

---

## Category 3: Mobile UX Polish

### 3.1 V2CashOfferOptions: Add Sticky Mobile Bar
**Problem:** Cash Offer Options page has no `StickyMobileBookingBar` like Buy and Sell pages do. On mobile, the only terminal CTA is far below the calculator — users who run their numbers have no persistent action available.

**Fix:** Add `<StickyMobileBookingBar intent="sell" source="cash_offer_sticky" />` to V2CashOfferOptions and add `'/cash-offer-options'` to `SUPPRESS_STICKY_BOOK` in V2Layout so the generic bar doesn't stack.

### 3.2 Fix Contact Page Mobile Email Overflow
**File:** `src/components/v2/V2Footer.tsx` (line 131)
The email `kasandra@prietorealestategroup.com` uses `break-all` which creates ugly mid-word breaks. Change to `break-words` or use `truncate` with a `title` attribute for the full address.

### 3.3 Consistent Bottom Padding on Terminal CTAs
**Problem:** Several pages use `pb-24 sm:pb-16` on the last navy CTA section to account for the sticky bar, but this is inconsistent. Buy page (line 337) has it, Sell page handles it via `KasandraBookingCTA`, Cash Offer has it (line 130), but some pages don't account for the 64px sticky bar overlap at all.

**Fix:** Create a utility class or apply `pb-[calc(4rem+env(safe-area-inset-bottom))]` consistently to the last content section on all pages where the sticky mobile bar appears.

---

## Category 4: Performance & Loading

### 4.1 Lazy-Load Google Reviews on Sell & Cash Pages
**File:** `src/pages/v2/V2CashOfferOptions.tsx` (line 171)
Google Reviews is eagerly imported (`import GoogleReviewsSection from ...`). Wrap in `lazy()` + `Suspense` as is done on the homepage. Same applies to V2Sell (already lazy — confirmed).

### 4.2 Construction Video Poster Frame
**File:** `src/pages/v2/V2About.tsx` (line 259)
The construction video uses `preload="none"` but has no `poster` attribute, showing a black rectangle until play. Add a poster frame from the existing Kasandra assets to provide visual context.

---

## Category 5: Content & Journey Logic

### 5.1 Homepage Sections Reordering
**Current order (after compressed bio):**
1. Hero → 2. Journey Breadcrumb → 3. Intent Cards → 4. Selena Banner → 5. Instant Answer Widget → 6. Meet Kasandra (compressed) → 7. TrustBar → 8. Services → 9. Selena Showcase → 10. Neighborhoods → 11. Testimonials → 12. Google Reviews → 13. Corner Connect Advantage → 14. Podcast → 15. Community

**Optimized order:** Move the Instant Answer Widget (step 5) to AFTER Selena Showcase (step 9). Rationale: new visitors need orientation before tools. The current flow puts a calculator immediately after the intent fork, before they've even seen Kasandra's value proposition or Selena. Better flow: Intent Cards → Selena Banner → Meet Kasandra → TrustBar → Services → Selena Showcase → Calculator → Neighborhoods → Social Proof → Corner Connect → Podcast → Community.

---

## Summary — Files Changed

| # | File | Action |
|---|------|--------|
| 1 | `V2Footer.tsx` | Remove CTA strip + unused imports |
| 2 | `V2CashOfferOptions.tsx` | Remove second terminal section, remove "talk to Selena" link, add StickyMobileBookingBar, lazy-load Google Reviews |
| 3 | `V2About.tsx` | Remove bottom Selena section, clean unused imports, add video poster |
| 4 | `V2Contact.tsx` | Upgrade hero to GlassmorphismHero |
| 5 | `V2Navigation.tsx` | Fix phone number visibility on scroll |
| 6 | `V2Layout.tsx` | Add `/cash-offer-options` to SUPPRESS_STICKY_BOOK |
| 7 | `V2Home.tsx` | Reorder sections (move calculator below Selena Showcase), clean unused imports |

Total: 7 files, 12 optimizations. No new components needed.

