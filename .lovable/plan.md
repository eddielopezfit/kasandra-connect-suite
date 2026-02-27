

# Full Build Checkup: Clean Up + Responsive Audit

## Issues Identified

### 1. V2Home Hero — Intent Row is Messy (Cognitive Overload)
The 3 intent buttons (`Selling: See My Options`, `Buying: Check My Readiness`, `Not Sure: 60-Second Quiz`) wrap awkwardly on mobile, creating visual clutter below the already-large "Chat with Selena" button. Four clickable elements stacked in the hero = too many choices.

**Fix:** Simplify to 2 intent buttons only (Selling, Buying) styled as compact pill links — not full `Button` components. Remove the quiz button from the hero (quiz remains accessible via Selena routing and nav). This follows the Click-First philosophy: max 2 visible chips once intent is known.

### 2. V2Buy Bottom CTA — Button Too Large on Mobile
Line 264-270: `px-10 py-6 text-lg` makes the "Ask Selena to Help Me Get Started" button oversized on small screens. The long text + large padding = touch target that dominates the viewport.

**Fix:** Reduce to `px-6 py-4 text-base` on mobile, keep `sm:px-10 sm:py-6 sm:text-lg` for desktop. Shorten mobile label to "Ask Selena" with full text on `sm:` and above using hidden/block classes.

### 3. V2Sell Bottom CTA — Same Oversized Pattern
Line 307-313: Same `px-10 py-6 text-lg` pattern. Long Spanish text ("Pídale a Selena que Programe Mi Llamada") will overflow on narrow screens.

**Fix:** Same responsive sizing as V2Buy.

### 4. V2CashOfferOptions — Selena Mid-Page CTA
Line 163-169: Mid-page Selena button is fine sizing, but the bottom "Back Link" section (lines 291-304) has no visual breathing room on mobile.

**Fix:** Add `pb-24 md:pb-16` to the last content section to prevent overlap with the floating chat button.

### 5. V2Podcast — Video Grid Cards
The dynamic YouTube grid looks good on desktop. On mobile, single-column cards are fine. No sizing issues detected.

### 6. V2PrivateCashReview — Brand Alignment Check
The previous edit already applied brand tokens. Verified: `cc-gold`, `cc-navy`, `cc-ivory`, `cc-sand` are used throughout. The hero gradient, card borders, and icon circles all use brand tokens. No issues.

### 7. V2Guides — Empty Categories Already Removed
Confirmed: `tips`, `financial`, `neighborhoods` are removed. Only `all`, `buying`, `selling`, `valuation`, `stories`, `probate` remain. Clean.

### 8. V2BuyerReadiness — Hero Title Too Small
Line 108: `text-3xl md:text-4xl` is inconsistent with the site-wide typography standard (`text-5xl md:text-6xl lg:text-7xl` for heroes). This page should match.

**Fix:** Increase to `text-4xl md:text-5xl font-bold` to match other page heroes while keeping it appropriate for a tool page.

### 9. V2Book — Hero Title Sizing
Line 39: Already uses `text-5xl md:text-6xl lg:text-7xl`. Consistent. No issue.

### 10. Floating Chat Button — Mobile Overlap Risk
The floating button at `bottom-4 right-4` (mobile) / `bottom-6 right-6` (desktop) can overlap bottom CTA sections on pages with full-width bottom bars.

**Fix:** Already handled by existing `pb-24 md:pb-16` on guides page. Add similar bottom padding to V2Buy and V2Sell bottom CTA sections.

---

## Implementation Steps

1. **Simplify V2Home hero intent row** — Replace 3 outline buttons with 2 compact text links styled as subtle pills. Remove quiz link from hero.

2. **Fix oversized CTA buttons on mobile** — Apply responsive sizing to bottom CTAs on V2Buy (`px-6 py-3 text-sm sm:px-10 sm:py-6 sm:text-lg`) and V2Sell (same pattern). Shorten mobile-only labels.

3. **Fix V2BuyerReadiness hero title** — Increase from `text-3xl md:text-4xl` to `text-4xl md:text-5xl`.

4. **Add bottom padding for floating button clearance** — Add `pb-24 md:pb-16` to the last section on V2Buy and V2Sell to prevent overlap with the Selena floating button on mobile.

5. **Verify V2CashOfferOptions bottom spacing** — Ensure the "Back Link" section has adequate padding below for the floating button.

