

# Page Inventory + Pruning Audit

## STEP 1 & 2 — Complete Page Inventory Table

### All Routed Pages (26 total)

| # | Route | Page File | Purpose (Observed) | Original Intent | Current Role | Status | Action |
|---|-------|-----------|--------------------|--------------------|-------------|--------|--------|
| 1 | `/` | — (redirect) | 301 to `/v2` | Legacy V1 home | Redirect | — | KEEP AS-IS |
| 2 | `/cash-offer` | `CashOffer.tsx` | 301 to `/v2/cash-offer-options` | Legacy V1 cash offer page | Redirect only; **file still exists and is never rendered** | DEAD | DELETE file `CashOffer.tsx` |
| 3 | `/podcast/episodes` | `PodcastEpisodes.tsx` | 301 to `/v2/podcast` | Legacy V1 podcast listing | Redirect only; **file still exists and is never rendered** | DEAD | DELETE file `PodcastEpisodes.tsx` |
| 4 | `/v2` | `V2Home.tsx` | Brand lobby — Kasandra intro, video, testimonials, services overview | Primary trust surface | Hub entry point | CORE | KEEP AS-IS |
| 5 | `/v2/buy` | `V2Buy.tsx` | Buyer orientation — process steps, neighborhood quiz, testimonials, featured guide | Orientation room for buyers | Active buyer funnel entry | CORE | KEEP AS-IS |
| 6 | `/v2/sell` | `V2Sell.tsx` | Seller orientation — protection steps, selling options, Google reviews, featured guide, links to decision tool + readiness | Orientation room for sellers | Active seller funnel entry | CORE | KEEP AS-IS |
| 7 | `/v2/cash-offer-options` | `V2CashOfferOptions.tsx` | Education page — calculator, cash vs traditional comparison, wholesaler warning, Selena prompt, cash readiness CTA | Cash offer education surface | Decision room with calculator tool | CORE | KEEP AS-IS |
| 8 | `/v2/guides` | `V2Guides.tsx` | Guide index — lists all 12 guides by category | Guide hub | Primary educational surface | CORE | KEEP AS-IS |
| 9 | `/v2/guides/:guideId` | `V2GuideDetail.tsx` | Individual guide renderer — registry-driven, tier-aware CTA logic | Guide reading page | Core content delivery | CORE | KEEP AS-IS |
| 10 | `/v2/podcast` | `V2Podcast.tsx` | Podcast listing with YouTube integration | Brand/trust surface | Active | CORE | KEEP AS-IS |
| 11 | `/v2/community` | `V2Community.tsx` | Community involvement showcase | Brand/trust surface | Active | CORE | KEEP AS-IS |
| 12 | `/v2/book` | `V2Book.tsx` | GHL calendar embed — terminal booking action | Commitment gate | Active terminal action | CORE | KEEP AS-IS |
| 13 | `/v2/thank-you` | `V2ThankYou.tsx` | Post-booking confirmation — intent-specific next steps, Selena prompt | Post-commitment reinforcement | Active | SUPPORT | KEEP BUT HIDE FROM NAV |
| 14 | `/v2/buyer-readiness` | `V2BuyerReadiness.tsx` | Tap-only buyer diagnostic quiz → score → lead capture modal | Buyer readiness tool | Active, linked from `/v2/buy` hero | SUPPORT | KEEP BUT HIDE FROM NAV |
| 15 | `/v2/seller-readiness` | `V2SellerReadiness.tsx` | Tap-only seller diagnostic quiz → score → lead capture modal | Seller readiness tool | Active, linked from `/v2/sell` | SUPPORT | KEEP BUT HIDE FROM NAV |
| 16 | `/v2/cash-readiness` | `V2CashReadiness.tsx` | Tap-only cash offer fit diagnostic → score → lead capture modal | Cash readiness tool | Active, linked from `/v2/cash-offer-options` | SUPPORT | KEEP BUT HIDE FROM NAV |
| 17 | `/v2/seller-decision` | `V2SellerDecision.tsx` | 7-step wizard — situation, property, condition, neighborhood, dual-path recommendation, contact, receipt | Seller decision room | Active, linked from `/v2/sell` | CORE | KEEP AS-IS |
| 18 | `/v2/quiz` | `V2HomePathQuiz.tsx` | 4-question general intent quiz + contact form → path-specific results | Organic path-sorting quiz | **Not linked from any page in the hub**. Zero inbound links. Uses `QuizFunnelLayout`. | DEAD | DEPRECATE |
| 19 | `/v2/seller-quiz` | `V2SellerQuiz.tsx` | 4-question seller-only quiz + contact form → seller-specific results | Isolated seller quiz for paid traffic | **Not linked from any page in the hub**. Zero inbound links. Near-identical structure to `/v2/quiz`. | REDUNDANT | DEPRECATE |
| 20 | `/v2/private-cash-review` | `V2PrivateCashReview.tsx` | Phone-gated returning-lead page — view report, chat with Selena, schedule review | Private cash review for returning leads | Active but gated; niche use case | SUPPORT | KEEP BUT HIDE FROM NAV |
| 21 | `/v2/qa-cta` | `V2CTAQualityAssurance.tsx` | Dev-only CTA test runner | Internal QA tool | DEV-only (returns null in prod) | DEAD (for production) | KEEP (dev-only, already gated) |
| 22 | `/v2/qa-determinism` | `V2QADeterminism.tsx` | Dev-only diagnostics — session, guardrails, registry, ActionSpec | Internal QA tool | DEV-only (redirects to /v2 in prod) | DEAD (for production) | KEEP (dev-only, already gated) |
| 23 | `/ad/seller` | `SellerLanding.tsx` | Facebook ad landing page — seller-focused, Meta Pixel tracking | Paid traffic landing | Active ad funnel entry | SUPPORT | KEEP BUT HIDE FROM NAV |
| 24 | `/ad/seller-quiz` | `SellerQuiz.tsx` | 4-step seller quiz for ad traffic — address, value, timeline, condition | Paid traffic quiz | Active ad funnel step | SUPPORT | KEEP BUT HIDE FROM NAV |
| 25 | `/ad/seller-result` | `SellerResult.tsx` | Ad quiz results — net proceeds chart, lead capture form, Selena handoff | Paid traffic conversion | Active ad funnel terminal | SUPPORT | KEEP BUT HIDE FROM NAV |
| 26 | `*` | `NotFound.tsx` | 404 catch-all | Error handling | Active | SUPPORT | KEEP AS-IS |

### Legacy Files (exist but never routed in App.tsx)

| File | Status | Action |
|------|--------|--------|
| `src/pages/Index.tsx` | DEAD — uses V1 components (Navigation, HeroSection, etc.). Route `/` redirects to `/v2`, never renders this file. | DELETE |
| `src/pages/CashOffer.tsx` | DEAD — uses V1 layout. Route `/cash-offer` redirects to `/v2/cash-offer-options`. Contains a placeholder GHL form. | DELETE |
| `src/pages/PodcastEpisodes.tsx` | DEAD — uses V1 layout. Route `/podcast/episodes` redirects to `/v2/podcast`. | DELETE |

---

## STEP 3 — Classification Summary

| Status | Count | Pages |
|--------|-------|-------|
| CORE | 11 | V2Home, V2Buy, V2Sell, V2CashOfferOptions, V2Guides, V2GuideDetail, V2Podcast, V2Community, V2Book, V2SellerDecision, NotFound |
| SUPPORT | 8 | V2ThankYou, V2BuyerReadiness, V2SellerReadiness, V2CashReadiness, V2PrivateCashReview, ad/SellerLanding, ad/SellerQuiz, ad/SellerResult |
| REDUNDANT | 1 | V2SellerQuiz (duplicates V2SellerDecision's seller sorting + ad/SellerQuiz's ad sorting) |
| DEAD | 5 | V2HomePathQuiz (zero inbound links), Index.tsx, CashOffer.tsx, PodcastEpisodes.tsx, + 2 QA pages (kept but dev-gated) |

### Redundancy Analysis

**The Quiz Problem**: Three separate quiz implementations exist with overlapping purpose:

1. `/v2/quiz` (V2HomePathQuiz) — General 4Q intent quiz. **Zero inbound links anywhere in the codebase**. Was presumably meant for organic traffic sorting but never wired into the hub. Uses `QuizFunnelLayout` (suppressed nav).

2. `/v2/seller-quiz` (V2SellerQuiz) — Seller-only 4Q quiz. **Zero inbound links**. Nearly identical to V2HomePathQuiz but seller-restricted. Overlaps heavily with `/v2/seller-decision` which is a richer 7-step wizard already linked from `/v2/sell`.

3. `/ad/seller-quiz` (SellerQuiz) — Ad funnel quiz. Different questions (address, value, timeline, condition). **Correctly isolated** for paid traffic with Meta Pixel integration. This one is architecturally clean and should stay.

**The Readiness Problem**: Three readiness checks exist (buyer, seller, cash). These are NOT redundant — each asks different questions for different intents and is linked from its respective orientation page. All three should stay.

---

## STEP 4 — Pruned Final Sitemap

### Final Recommended Sitemap (Post-Cleanup)

```text
CORE HUB PAGES (in navigation)
├── /v2                          Home (Lobby)
├── /v2/buy                      Buyer Orientation
├── /v2/sell                     Seller Orientation
├── /v2/cash-offer-options       Cash Offer Education + Calculator
├── /v2/guides                   Guide Hub
├── /v2/guides/:guideId          Guide Detail (12 guides)
├── /v2/podcast                  Podcast
├── /v2/community                Community
└── /v2/book                     Booking (terminal action)

SUPPORT PAGES (not in nav, linked contextually)
├── /v2/seller-decision          Seller Decision Wizard (7-step)
├── /v2/buyer-readiness          Buyer Readiness Diagnostic
├── /v2/seller-readiness         Seller Readiness Diagnostic
├── /v2/cash-readiness           Cash Readiness Diagnostic
├── /v2/private-cash-review      Phone-Gated Cash Review (returning leads)
└── /v2/thank-you                Post-Booking Confirmation

PAID TRAFFIC (isolated, never in nav)
├── /ad/seller                   FB Ad Landing
├── /ad/seller-quiz              FB Ad Quiz
└── /ad/seller-result            FB Ad Result + Lead Capture

DEV-ONLY (gated, invisible in production)
├── /v2/qa-cta                   CTA Test Runner
└── /v2/qa-determinism           Determinism Diagnostics

REDIRECTS (kept for SEO preservation)
├── /                → /v2
├── /cash-offer      → /v2/cash-offer-options
└── /podcast/episodes → /v2/podcast
```

### Pages to Remove

| File | Route | Reason |
|------|-------|--------|
| `src/pages/Index.tsx` | None (dead file) | V1 legacy, never rendered. Uses V1 components. |
| `src/pages/CashOffer.tsx` | None (dead file) | V1 legacy, never rendered. Has placeholder GHL form. |
| `src/pages/PodcastEpisodes.tsx` | None (dead file) | V1 legacy, never rendered. |
| `src/pages/v2/V2HomePathQuiz.tsx` | `/v2/quiz` | Zero inbound links. General quiz that was never integrated into the hub. Seller sorting is handled better by `/v2/seller-decision`. Buyer sorting is handled by `/v2/buy` hero CTA. |
| `src/pages/v2/V2SellerQuiz.tsx` | `/v2/seller-quiz` | Zero inbound links. Duplicates `/v2/seller-decision` (richer 7-step wizard) and `/ad/seller-quiz` (paid traffic). No unique value. |

### Pages to Merge

None required. The remaining pages each serve a distinct architectural role.

---

## STEP 5 — Architectural Guardrails for Future Builds

### Hard Rules

1. **Maximum Decision Pages**: No more than one decision wizard per intent (buy/sell/cash). Currently: `seller-decision` is the only wizard. If a buyer decision wizard is needed, it replaces `buyer-readiness`, not supplements it.

2. **No Duplicate Readiness Flows**: Each intent (buy/sell/cash) gets exactly one readiness diagnostic. Adding a second readiness check for the same intent requires deprecating the first.

3. **No Orphaned Pages**: Every new page must be linked from at least one existing page within 48 hours of creation. If a page has zero inbound links, it is a candidate for deletion.

4. **No Guide-Internal CTAs**: The Guide-First model is enforced. No mid-guide CTAs, no exit ramps. `AuthorityCTABlock` is the only terminal CTA for T1/T2. T3 stories end in silence. The `GuideCTAGuardrail` enforces this at runtime.

5. **Quiz Isolation Rule**: Quizzes that suppress navigation (using `QuizFunnelLayout`) must be explicitly tagged as either `organic` or `paid`. Organic quizzes must be linked from a hub page. Paid quizzes must have Meta Pixel tracking. A quiz that is neither linked nor tracked is dead.

6. **Ad Funnel Containment**: All `/ad/*` pages must use `SellerFunnelLayout`, never `V2Layout`. They must never appear in `V2Navigation` links. Cross-linking from `/ad/*` to `/v2/*` is allowed only on result screens.

7. **One Terminal Action**: `/v2/book` is the only booking page. No new booking pages. Other pages route TO it, never duplicate it.

8. **New Page Checklist**: Before creating any new page, answer:
   - Does this page's function already exist in another page?
   - Is this page linked from at least one existing page?
   - Does this page have a clear tier assignment (Core/Support/Paid/Dev)?
   - Does this page match the Guide-First architecture?

### V1 Component Cleanup (Triggered by Deletion)

When `Index.tsx`, `CashOffer.tsx`, and `PodcastEpisodes.tsx` are deleted, the following V1 components become orphaned and should also be deleted:

- `src/components/Navigation.tsx` (V1 nav — replaced by `V2Navigation`)
- `src/components/HeroSection.tsx`
- `src/components/SocialProofTicker.tsx`
- `src/components/AboutSection.tsx`
- `src/components/ServicesSection.tsx`
- `src/components/PodcastSection.tsx`
- `src/components/CommunitySection.tsx`
- `src/components/ContactSection.tsx`
- `src/components/Footer.tsx` (V1 footer — replaced by `V2Footer`)
- `src/components/NavLink.tsx`

This removes ~10 dead component files that are no longer imported anywhere after the page deletions.

