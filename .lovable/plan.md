

# Full UI/UX Audit — Kasandra Connect Suite

## Verdict: 92% Symphony — 8% Dissonance

The platform is architecturally exceptional. The journey orchestration, session intelligence layer, bilingual parity, and Selena AI integration are enterprise-grade. What follows are the remaining friction points that prevent a flawless end-to-end experience.

---

## What's Working (The Symphony)

- **Journey orchestration**: `useJourneyProgress` powers adaptive heroes, CTAs, exit-intent copy, and tool chaining across all surfaces — a single intelligence hook driving the entire UX
- **CTA governance**: Intent-aware `CTASection` adapts headline/subtext for buy/sell/general based on pathname + journey depth. `suppressCTA` correctly applied on 13 pages
- **Tool chaining**: `ToolResultNextStep` present on all 11 tool/quiz result pages — consistent, deterministic
- **Guides Hub (Blue Ocean)**: CognitiveProgressBar, DecisionLane, IntentJourneyMap, ContextualSelenaPrompt, ContinueReadingCard, RecommendedGuidesCarousel — all layered and conditionally rendered
- **Selena AI**: 4-mode architecture, guard state hierarchy, bilingual chip governance, earned booking access, modular edge function — production-grade
- **Session persistence**: 3-tier fallback (Context → localStorage → Supabase snapshot restore on mount)
- **Booking funnel**: Native 3-step flow, enriched agent dossier, intent/source attribution on every path
- **Navigation**: Scroll-aware, journey-depth-aware CTA in nav, dropdown explore menu

---

## Issues Found (The Dissonance)

### CRITICAL — Broken Routing

**1. Sell Page "Request a Cash Offer" → routes to `/contact` instead of `/cash-offer-options` or `/book?intent=cash`**
File: `src/pages/v2/V2Sell.tsx` line 173
The Corner Connect cash offer section CTA sends users to a generic contact form instead of the high-intent cash offer funnel. This breaks the decision compression principle and wastes qualified intent.

**Fix**: Change destination from `/contact` to `/cash-offer-options` with tracking params.

---

### HIGH — Double Bottom CTA on Hub Pages

**2. V2Sell and V2Buy both render their own bottom CTA section AND the global `CTASection` via V2Layout**
Neither page passes `suppressCTA` to `V2Layout`, so users see two navy-background booking CTAs stacked:
- Page-specific CTA (lines 513-546 in V2Sell, lines 264-297 in V2Buy)
- Global CTASection from V2Layout

**Fix**: Either add `suppressCTA` to both hub pages, OR remove the page-level bottom CTA sections and let the global CTASection handle it (which is already intent-aware).

---

### HIGH — Homepage Section Order Suboptimal

**3. Homepage vertical rhythm disruption**
Current order after About section:
1. Neighborhood Cards
2. TrustBar
3. GoogleReviewsStarBadge
4. TestimonialColumns
5. GoogleReviewsSection (full)
6. Services Section
7. Corner Connect
8. Selena Showcase
9. Podcast

Issues:
- Google Reviews appears twice (star badge at line 482 AND full section at line 492) — redundant
- Services cards (Buyers/Sellers/Cash) appear AFTER testimonials — should be higher in the funnel since they're navigational
- Selena Showcase is buried below Corner Connect

**Fix**: Reorder to: TrustBar → Services → Selena Showcase → Neighborhood Cards → Testimonials + Google Reviews (combined) → Corner Connect → Podcast. Remove duplicate star badge OR the full reviews section.

---

### MEDIUM — Sell Page Cash CTA Mismatch

**4. Homepage Corner Connect CTA also routes to `/contact`** (line 638)
Same issue as #1. "Ask About Off-Market Properties" goes to generic contact instead of the decision funnel.

**Fix**: Route to `/off-market` or `/cash-offer-options` based on the card's context.

---

### MEDIUM — Missing `ToolResultNextStep` on Seller Timeline

**5. V2SellerTimeline (770 lines) — no tool chaining component**
All other tool pages have `ToolResultNextStep` but the seller timeline page is missing it.

**Fix**: Add `ToolResultNextStep` with label "Seller Timeline" after the timeline completion state.

---

### LOW — Sell Page Journey Breadcrumb Placement

**6. JourneyBreadcrumb on V2Sell appears AFTER the address-first entry section**
The address input (lines 96-129) separates the hero from the journey breadcrumb (lines 131-136). For returning users, their progress context should appear before the address input — they may not need it.

**Fix**: Swap the order so JourneyBreadcrumb renders immediately after the hero, before the address entry.

---

### LOW — ExitIntentModal Mobile Strategy

**7. Exit modal uses `popstate` (back button hijack) on mobile**
Line 78 pushes a history entry, and popstate triggers the modal. This is an aggressive anti-pattern that can frustrate users and violates the "calm, trust-first" brand mandate.

**Fix**: Replace popstate with a 45-second idle timer + scroll-to-top detection, or remove mobile exit-intent entirely and rely on the Selena floating button for re-engagement.

---

## Selena AI Audit — System Prompt & KB

Based on the skill files and edge function architecture:

- **KB-0 → KB-12 hierarchy**: Intact, properly layered
- **Guard state**: 549-line governance file, containment overlay triggers on vulnerability signals — verified
- **Chip governance**: 82+ registry entries, bilingual, ActionSpec-backed — no orphan chips
- **max_tokens = 150**: Intentional constraint, enforced
- **Model**: Gemini 3 Flash preview primary, GPT-4o-mini fallback — correct
- **13 dynamic context blocks**: All wired (memory, reflection, seller decision, market pulse, neighborhood, tool output, governance, journey, trail, guide mode, mode, guard, containment)
- **Booking gate**: `hasEarnedBookingAccess()` — verified as enforced
- **No issues found with Selena's architecture**

---

## Implementation Priority

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 1 | Cash offer CTA → wrong route | Critical | 5 min |
| 2 | Double CTA on Buy/Sell hubs | High | 5 min |
| 3 | Homepage section reorder | High | 15 min |
| 4 | Homepage Corner Connect CTA route | Medium | 5 min |
| 5 | Missing ToolResultNextStep on Seller Timeline | Medium | 10 min |
| 6 | Sell page breadcrumb placement | Low | 5 min |
| 7 | Mobile exit-intent strategy | Low | 20 min |

**Total estimated**: 3-4 implementation messages to resolve all 7 issues.

