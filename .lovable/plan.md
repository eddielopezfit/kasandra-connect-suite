

# Remove Global Footer CTA from All Pages

## Problem
Every page renders a generic "Not sure where to start? Talk to Selena — free, bilingual, no pressure" section with two buttons ("Chat with Selena" + "Book a Consultation") between the page content and the footer. This is redundant — every page already has its own contextual CTAs, plus the floating Selena bubble and the nav "Book a Consultation" button.

## Fix
Remove the `CTASection` render from `V2Layout.tsx` entirely. This eliminates it from all 34 pages in one edit.

### File: `src/components/v2/V2Layout.tsx`
- Remove the `CTASection` import
- Remove the `{!suppressCTA && <CTASection />}` render line
- Remove the `suppressCTA` prop from the interface (cleanup)

### Cleanup across 15 pages
Remove the now-unnecessary `suppressCTA` prop from all pages that pass it:
- `V2Buy.tsx`, `V2Sell.tsx`, `V2About.tsx`, `V2Book.tsx`, `V2BookConfirmed.tsx`, `V2Contact.tsx`, `V2Community.tsx`, `V2MarketIntelligence.tsx`, `V2Neighborhoods.tsx`, `V2NeighborhoodDetail.tsx`, `V2Podcast.tsx`, `V2SelenaAI.tsx`, `V2ThankYou.tsx`, `V2TrustedNetwork.tsx`

**Estimated scope**: 1 implementation message. All changes are prop/import removals — no logic changes.

