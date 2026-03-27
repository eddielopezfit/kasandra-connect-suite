

# Full Build Optimization Plan
## Synthesized from 8 Strategic Intelligence Reports + UX Audit

This plan addresses the highest-impact gaps identified across all reports and the Perplexity UX audit, organized into 4 implementation phases.

---

## Phase 1: Critical UX Fixes (Immediate)
*Addresses UX Audit Issues #1, #2, #3, #5, #8*

### 1A. Intent-Aware Footer CTA
The global `CTASection.tsx` currently shows generic copy regardless of page context. On `/sell`, the bottom CTA still defaults to buyer-oriented language.

**Change**: Read `window.location.pathname` in `CTASection` to conditionally render seller-specific CTA text on sell-intent pages (`/sell`, `/seller-*`, `/cash-*`, `/net-to-seller`) and buyer-specific text on buy-intent pages.

### 1B. Attribution Field on Booking Form
Add "How did you hear about us?" select field to `BookingIntakeForm.tsx` with options: Google Search, Social Media, YouTube/Podcast, Referral, Community Event, Other. Pass this to the lead handoff dossier.

### 1C. Neighborhood Detail MLS Links
Add an "Explore Listings" CTA on `V2NeighborhoodDetail.tsx` that links to a filtered Redfin search for the neighborhood's primary ZIP code. Pattern: `https://www.redfin.com/zipcode/{zip}`.

### 1D. Valuation Page Interactive Tool
The Home Valuation page (`V2HomeValuation.tsx`) promises an interactive tool but currently has none. Add an address-entry field at the top that opens Selena with a prefilled message like "I'd like to know what my home at [address] is worth" — converting a static page into a decision entry point.

---

## Phase 2: Context Surface Layer (High Priority)
*Addresses Report 8's primary gap: session intelligence is captured but not surfaced*

### 2A. Adaptive Homepage Hero for Returning Users
When `useJourneyProgress()` returns `isReturningUser === true`, swap the default `GlassmorphismHero` headline from the generic welcome to a personalized one reflecting their progress:
- **Exploring**: "Welcome back — pick up where you left off"
- **Engaged**: "You're making progress — here's your next step"
- **Ready**: "You've done the research. Let's talk."

The hero already has journey-aware copy in the CTA section — extend it to the hero itself.

### 2B. Hub Page Progress Reflection
On `/buy` and `/sell`, render a compact "Your Progress" card below the hero (only for returning users) showing:
- Completed tools with checkmarks
- Readiness score if available
- "Next Step" CTA from `useJourneyProgress().nextRecommendedAction`

This uses existing `useJourneyProgress` data — no new backend work needed.

### 2C. Tool Chaining Enhancement
After tool completion pages (Affordability Calculator, BAH Calculator, Seller Timeline, Net-to-Seller), ensure `ToolResultNextStep` is present and correctly maps to the next logical action. Audit all tool result pages for consistent implementation.

---

## Phase 3: Visual & Trust Upgrades
*Addresses Christie Realty competitive analysis + image/video placement strategy*

### 3A. Contextual Video Placement System
Create a reusable `ContextualVideoBlock` component that serves the right video based on page intent:
- **Homepage**: Kasandra welcome video (already exists, refine placement)
- **Sell pages**: "Todo Empieza en Casa" clip or seller success story
- **Buy pages**: First-time buyer walkthrough
- **Neighborhood pages**: Area lifestyle footage

Uses the existing `KasandraVideoBlock` component pattern but with intent-aware content selection.

### 3B. Agent Photo Upgrades
Replace small, cropped images with larger, contextual photos:
- Homepage About section: Full-width lifestyle photo with text overlay
- Sell page: Add Kasandra photo in the "How I Protect Sellers" section
- Buy page: Add photo in the guidance section
- About page: Photo grid or carousel

### 3C. Google Reviews Visual Upgrade
Move Google Reviews section higher on the homepage (currently buried). Add star rating display in the hero area (already in JSON-LD, surface it visually).

---

## Phase 4: Conversion Funnel Optimization
*Addresses Report 6/7 HiFello funnel gaps + progressive intake*

### 4A. Address-First Hero Entry (Sellers)
On the Sell page hero, add a prominent address input field: "Enter your address for a free estimate." On submit, it navigates to `/home-valuation?address={value}` and opens Selena with the address prefilled. This is the #1 conversion pattern identified in competitor analysis.

### 4B. Progressive Seller Intake
Enhance the `SellerDecision` wizard flow to capture property condition and timeline data earlier, feeding it into the booking dossier. Currently, `StepCondition` and `StepSituation` exist but their data doesn't consistently flow to the handoff.

### 4C. Enriched Agent Briefing
Update the `enrich-booking-context` edge function to pull the latest `session_snapshots` data and include:
- All tools completed with results
- Guides read (count + last 3 titles)
- Seller decision path if available
- Calculator results (estimated value, advantage)

This gives Kasandra a complete pre-call intelligence briefing.

---

## Technical Details

**Files Modified (Phase 1)**:
- `src/components/v2/CTASection.tsx` — add pathname-based intent detection
- `src/components/v2/booking/BookingIntakeForm.tsx` — add attribution field + schema update
- `src/pages/v2/V2NeighborhoodDetail.tsx` — add MLS link CTA
- `src/pages/v2/V2HomeValuation.tsx` — add address entry widget

**Files Modified (Phase 2)**:
- `src/components/v2/hero/GlassmorphismHero.tsx` — returning user headline variants
- `src/pages/v2/V2Buy.tsx` — add progress reflection card
- `src/pages/v2/V2Sell.tsx` — add progress reflection card

**Files Modified (Phase 3)**:
- `src/pages/v2/V2Home.tsx` — reorder sections, upgrade photo layout
- `src/components/v2/KasandraVideoBlock.tsx` — intent-aware video selection

**Files Modified (Phase 4)**:
- `src/pages/v2/V2Sell.tsx` — address-first hero entry
- `supabase/functions/enrich-booking-context/index.ts` — enriched dossier assembly

**No new database tables required.** All changes leverage existing `session_snapshots`, `lead_profiles`, and `lead_handoffs` tables.

**Estimated scope**: ~15-20 implementation messages across all 4 phases, executed sequentially.

