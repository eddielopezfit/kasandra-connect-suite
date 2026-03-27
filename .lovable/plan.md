

# Cash Offer Options Page Audit — CTA Overload & Cross-Page Pattern Review

## The Problem (Visible in Screenshots)

The `/cash-offer-options` page has **11 distinct action points** competing for attention across 7 scrollable viewport heights:

```text
VIEWPORT 1 (Hero):
  1. "Run My Numbers" button (scroll anchor)
  2. "Or ask Selena a question" (opens chat)

VIEWPORT 2 (Journey Breadcrumb):
  3. "Check Your Buyer Readiness →" ← WRONG INTENT (shows buy on a cash/sell page)

VIEWPORT 3 (Calculator):
  4. Calculator's own CTA ("Calculate My Options")

VIEWPORT 4 (Proactive Selena Prompt — persists):
  5. "Let Selena guide you ✨" (floating toast, visible in ALL viewports)

VIEWPORT 5-6 (Two back-to-back navy sections):
  6. "Take the Cash Readiness Check →" (/cash-readiness)
  7. "Book a Strategy Call" (/book)
  8. "Or talk to Selena first" (opens chat)

VIEWPORT 7 (Below booking CTA):
  9. ToolResultNextStep: "Check Your Buyer Readiness →" ← WRONG INTENT AGAIN
  10. "View Seller Services →" (/sell) — back link

ALWAYS VISIBLE:
  11. Floating Selena bubble (bottom-right)
  12. Nav "Book a Consultation" button
```

**That's 12 clickable action points on a single page.** The user is being pulled in 6 different directions simultaneously.

## Critical Issues

### 1. WRONG INTENT ROUTING (Critical)
Both the `JourneyBreadcrumb` (viewport 2) and `ToolResultNextStep` (viewport 7) show **"Check Your Buyer Readiness"** on a page where the user's intent is clearly **cash/sell**. This happens because the session has `intent: 'buy'` set from earlier navigation. The page itself should override the session intent for its own CTA logic — or at minimum, the `deriveNextAction` function should consider the current page context, not just stored intent.

### 2. TWO BACK-TO-BACK NAVY CTA SECTIONS (High)
Lines 272-326 render two consecutive full-width navy sections:
- "Not Sure Which Path Fits?" → Cash Readiness Check
- "Want Expert Guidance?" → Book a Strategy Call

These visually merge into one giant navy block (screenshot 5 confirms this). The user sees a wall of CTAs with no visual separation.

**Fix**: Merge into ONE section with a primary CTA (Book) and a secondary link (Cash Readiness Check).

### 3. PROACTIVE SELENA PROMPT NEVER DISMISSES (Medium)
The floating "You've done great research" toast appears in every single screenshot (viewports 2-7). It overlaps content, covers the "Traditional Listing" scenarios column, and competes with both the floating Selena bubble AND the page's own Selena CTAs.

### 4. TOOL RESULT NEXT STEP APPEARS AFTER BOOKING CTA (Medium)
The `ToolResultNextStep` card renders BELOW the terminal booking CTA. This is backwards — the user already saw the booking CTA and scrolled past it. Showing a lower-intent action (readiness check) after the highest-intent action (book) creates cognitive regression.

---

## The Fix — Reduce 12 Action Points to 5

### Page Structure (Optimized)
```text
HERO:
  1. "Run My Numbers" (scroll anchor — stays)
  2. "Or ask Selena" (secondary — stays)

CALCULATOR (interactive tool — stays as-is)

EDUCATION (Static comparison + Wholesaler warning + When Cash Makes Sense)
  — Pure education, NO CTAs in this zone

SINGLE TERMINAL CTA SECTION:
  3. Primary: "Book a Strategy Call" → /book
  4. Secondary text: "Or take the Cash Readiness Check first" → /cash-readiness
  5. Tertiary: "Or talk to Selena" → opens chat

SOCIAL PROOF (Google Reviews)

BACK LINK ("View Seller Services" → /sell)
```

### Implementation

**File: `src/pages/v2/V2CashOfferOptions.tsx`**
1. **Remove the standalone Cash Readiness CTA section** (lines 272-295). Fold it into the bottom CTA as a secondary link.
2. **Move ToolResultNextStep ABOVE the terminal CTA**, not below it. Or remove it entirely since the page itself IS the tool — the terminal CTA handles the next step.
3. **Set page-level intent override**: Call `setFieldIfEmpty('intent', 'cash')` in a `useEffect` so that `deriveNextAction` returns cash-intent actions, not buyer-intent actions.

**File: `src/hooks/useJourneyProgress.ts`**
4. No changes needed — the `cash` intent path already correctly returns "Check Your Cash Readiness". The bug is that the page doesn't set its own intent.

**File: `src/components/v2/ProactiveSelenaPrompt.tsx`**
5. Ensure it respects the `suppressOnPages` list or add `/cash-offer-options` to it — this page already has 2 explicit Selena entry points, the proactive prompt is redundant.

### Cross-Page Pattern Check
This same CTA overload pattern likely exists on other hub pages. After fixing `/cash-offer-options`, I'll audit `/buy` and `/sell` for the same issues:
- Double navy CTA sections
- ToolResultNextStep placement below terminal CTAs
- Intent mismatch in JourneyBreadcrumb/ToolResultNextStep

**Estimated scope**: 1 implementation message. Primarily editing `V2CashOfferOptions.tsx` (merge CTAs, set intent, reorder sections) plus a minor check on ProactiveSelenaPrompt suppression.

