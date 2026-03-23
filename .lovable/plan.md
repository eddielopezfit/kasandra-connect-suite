

# Forensic Audit 2026 — Implementation Plan

This plan addresses all remaining actionable items from the 35-page forensic audit, organized by the audit's own priority framework. Items already implemented are noted as complete.

---

## Already Implemented (No Action Needed)

| Audit Item | Status |
|---|---|
| P0: Rate limiting on 3 form endpoints | Done — all 3 have `checkRateLimit` |
| P0: Booking dossier bridge | Done — V2Book calls `enrich-booking-context` |
| P1: Conversations table + persistence | Done — table created, `upsert-conversation` + `get-conversation` deployed |
| P1: Selena memory (cross-session) | Done — `selena-memory` edge function + `conversation_memory` table |
| Seller leads FK to lead_profiles | Done — migration applied |
| Event log 90-day retention cron | Done — `cleanup_old_events` scheduled |
| Performance indexes | Done — 6 indexes added |
| `updated_at` triggers | Done — conversations trigger added |

---

## Remaining Work — 10 Tasks

### WEEK 1: P0 Fixes

**Task 1: Fix ReadinessSnapshot `/community` bug**
- File: `src/components/v2/ReadinessSnapshot.tsx` line 198
- Change `path: "/community"` to `path: "/neighborhoods"`
- 1-line fix

**Task 2: Elevate "Talk to Selena First" micro-CTAs**
- Across 6 files: `V2Buy.tsx`, `V2Sell.tsx`, `V2CashOfferOptions.tsx`, `CTASection.tsx`, `GlassmorphismHero.tsx`, `V2Guides.tsx`
- Currently: tiny low-contrast text links (`text-white/60 text-sm underline`)
- Change to: styled inline button with Selena avatar icon, gold text, larger hit target
- Pattern: replace the `<button className="text-white/60...">` with a proper secondary-style button using `MessageCircle` icon + gold styling

### WEEK 2: P1 Conversion Wins

**Task 3: Add LeadCaptureModal to Affordability Calculator result**
- File: `src/pages/v2/V2AffordabilityCalculator.tsx`
- After calculator completes and shows results, trigger `LeadCaptureModal` (same pattern as readiness quizzes)
- Source: `"affordability_calculator"`

**Task 4: Add LeadCaptureModal to BAH Calculator result**
- File: `src/pages/v2/V2BAHCalculator.tsx`
- Same pattern as Task 3, source: `"bah_calculator"`

**Task 5: Add LeadCaptureModal to Buyer Closing Costs result**
- File: `src/pages/v2/V2BuyerClosingCosts.tsx`
- Same pattern as Task 3, source: `"buyer_closing_costs"`

**Task 6: Personalize `/thank-you` page**
- File: `src/pages/v2/V2ThankYou.tsx`
- Already reads `intent` from query params — extend to show:
  - Intent-specific recommended guides (buy → first-time-buyer-guide, sell → selling-for-top-dollar, cash → cash-offer-guide)
  - "While you wait" section with 2-3 relevant guide cards
  - Selena invitation CTA (already partially there)

**Task 7: Personalize `/book/confirmed` page**
- File: `src/pages/v2/V2BookConfirmed.tsx`
- Add intent-aware next steps section
- Add "Prepare for your call" content with relevant guide links
- Strengthen Selena post-booking greeting trigger

### WEEK 3-4: P1/P2 Intelligence

**Task 8: Add booking CTA to `/market` page**
- File: `src/pages/v2/V2MarketIntelligence.tsx`
- Add bottom section: "Discuss these numbers with Kasandra" → `/book?intent=explore&source=market`
- Add secondary: "Or ask Selena" → `openChat()`

**Task 9: Add booking pivot to neighborhood detail pages**
- File: `src/pages/v2/V2NeighborhoodDetail.tsx`
- Add bottom CTA section: "Ready to explore [neighborhood name]?" → `/book?intent=buy&source=neighborhood_detail`

**Task 10: Strengthen "Ask Selena about listing" on /sell page**
- File: `src/pages/v2/V2Sell.tsx`
- The traditional listing comparison card's Selena CTA is a text trigger — upgrade to a proper secondary button with `MessageCircle` icon matching visual weight of "See My Cash Options"

---

## Out of Scope for This Sprint

These items from the audit require external integrations or major architectural changes:
- IDX/MLS integration (requires iHomefinder/Showcase IDX account)
- AVM instant home estimate (requires data provider)
- GA4 integration (requires GA4 property setup)
- ElevenLabs → web session bridge (requires ElevenLabs webhook config)
- Guide CMS migration (major refactor — 41 static files to DB)
- White-label multi-tenant (platform-level change)
- Exit-intent lead capture (UX design decision needed)
- Email newsletter infrastructure (requires email service provider)

---

## Technical Approach

- All changes are frontend-only (React components) — no new edge functions or migrations needed
- `LeadCaptureModal` is already a reusable component with `source`, `title`, `subtitle` props — drop-in for Tasks 3-5
- CTA elevation (Task 2) follows existing Button component patterns with `variant="ghost"` or custom gold styling
- Thank-you/confirmed personalization (Tasks 6-7) extends existing query param reading logic

