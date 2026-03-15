

# CTA Density Simplification Plan

## Current Problem

Multiple pages stack 3-4 Selena buttons across sections, creating cognitive overload. The hero defaults to "Talk to Selena" as primary instead of "Book a Strategy Call."

### CTA audit summary

| Page | Selena CTAs found | Booking CTAs found | Issue |
|------|------------------|--------------------|-------|
| Homepage | 4 (hero, banner, Selena section, CTASection) | 1 (CTASection) | Selena overload, booking underrepresented |
| Buy | 2 (hero, bottom ghost) | 1 (bottom primary) | Hero primary is Selena, should be Book |
| Sell | 4 (hero, listing card, callout, bottom ghost) | 1 (bottom primary) | Same hero issue + Selena button on comparison card |
| Cash Offer | 2 (hero, mid-page section) | 2 (review section, bottom) | Duplicate Selena mid-page, duplicate booking bottom |

## Desired Structure (per section)

```text
HERO
  [Primary]  Book a Strategy Call  →  /book
  [Text]     Not ready? Talk to Selena

MID-PAGE (one instance per page)
  [Primary]  Chat with Selena  (the one Selena moment)

STICKY FOOTER (already exists — no change)
  [Primary]  Book a Strategy Session
```

## Changes by File

### 1. GlassmorphismHero.tsx
- Swap the two CTAs: make "Book a Strategy Call" (Link to /book) the primary gold button, make "Talk to Selena" a ghost text link beneath it
- Add `primaryLink` prop (defaults to `/book`) so hub pages can override
- Keep existing `secondaryLabel` / `secondaryLink` for quiz links on Buy/Sell pages
- When a secondaryLink is provided (Buy/Sell heroes), show: Primary = Book, Secondary = Quiz link, Ghost text = "Or talk to Selena"

### 2. V2Home.tsx
- **Hero**: Now shows "Book a Strategy Call" as primary (from hero change above). The Selena prompt banner at line 170 stays — it's the one mid-page Selena touch
- **Selena AI Section** (line 583-597): Keep "Talk to Selena Now" button (this is the dedicated Selena showcase section — its single CTA is appropriate). Remove the "Learn more about Selena" link (redundant)
- No other changes needed on homepage

### 3. CTASection.tsx (homepage bottom)
- "Book a Consultation" stays as primary gold button
- Convert "Talk to Selena First" from a styled button to a plain text link: `text-cc-ivory/60 hover:text-cc-gold underline` — no icon, no border, no button styling

### 4. V2Buy.tsx
- **Hero**: Primary becomes "Book a Strategy Call" (automatic from hero change). "Buyer Readiness Quiz" stays as secondary link
- **Bottom CTA** (line 266-288): Already correct pattern — Book primary + Selena ghost. Convert Selena ghost button to text link (no MessageCircle icon, just underlined text)

### 5. V2Sell.tsx
- **Hero**: Primary becomes "Book a Strategy Call". "Seller Readiness Quiz" stays as secondary
- **Comparison cards** (line 329-338): Change "Talk to Selena About Listing" button to a text link: `text-cc-gold underline text-sm` — not a full-width button
- **Bottom callout** (line 402-411): Already a text link style — keep as-is
- **Bottom CTA** (line 429-449): Convert Selena ghost button to text link

### 6. V2CashOfferOptions.tsx
- **Hero** (line 54-59): Convert "Ask Selena a Question" from a bordered button to a text link
- **Mid-page Selena section** (lines 178-195): Remove entirely — it duplicates the hero Selena text link and the calculator's built-in Step 4
- **Complimentary Review + Bottom Booking** (lines 303-362): Merge into one section. Keep "Book a Strategy Call" as the single bottom booking CTA. Remove the duplicate "Book a Cash Offer Review" section — the `/book` URL params already carry intent

## Files changed

| File | Change type |
|------|------------|
| `src/components/v2/hero/GlassmorphismHero.tsx` | Swap CTA order: Book primary, Selena text |
| `src/components/v2/CTASection.tsx` | Demote Selena button to text link |
| `src/pages/v2/V2Home.tsx` | Pass updated hero props |
| `src/pages/v2/V2Buy.tsx` | Update hero props, demote bottom Selena to text |
| `src/pages/v2/V2Sell.tsx` | Update hero props, demote comparison + bottom Selena to text |
| `src/pages/v2/V2CashOfferOptions.tsx` | Demote hero Selena, remove mid-page Selena section, merge bottom bookings |

## What stays unchanged

- Floating Selena chat bubble (SelenaFloatingButton)
- Sticky mobile "Book a Strategy Session" bar (V2Layout)
- Homepage Selena prompt banner (the one mid-page Selena moment)
- Homepage Selena AI showcase section (dedicated section, single CTA)
- All analytics/tracking calls (logCTAClick preserved on every CTA)
- ContextualChatPrompt component (used in guides — not affected)

## Implementation order

1. GlassmorphismHero (core change — cascades to all pages)
2. V2Home + CTASection
3. V2Buy
4. V2Sell
5. V2CashOfferOptions

