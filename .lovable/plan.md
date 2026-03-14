

# Implementation Plan: Social Proof & Credibility Signals

## Overview
Create two new components and modify two existing files to add credibility stats, live Google Reviews, a "Why Corner Connect" section, and dynamic TrustBar count to the homepage.

---

## 1. Create `CredibilityStats.tsx` (New)
**Path:** `src/components/v2/CredibilityStats.tsx`

Horizontal stats band with 4 items:
- **6,000+** Pima County Transactions
- **126+** Five-Star Reviews (dynamic from `useGoogleReviews` → `reviews.length`)
- **20+** Years in Tucson
- **Bilingual** EN/ES Service

Technical:
- `IntersectionObserver` triggers animated count-up (reuse the `requestAnimationFrame` + `easeOut` pattern from `GlassmorphismHero.tsx` `StatItem`)
- `data-section="credibility-stats"` attribute for analytics
- Background: `bg-cc-ivory` with `cc-navy` text, `cc-gold` accent numbers
- Responsive: 2x2 grid on mobile, 4-col on `md+`
- Bilingual via `useLanguage().t()`

## 2. Create `WhyCornerConnect.tsx` (New)
**Path:** `src/components/v2/WhyCornerConnect.tsx`

Trust section with brokerage credibility signals:
- 6,000+ Pima County residential transactions
- 9 years operating history
- Realty Executives Arizona Territory backing
- A+ BBB rating
- Multi-language team

Style: `bg-cc-sand` section following existing pattern (gold label, serif heading, icon+text grid). Bilingual.

## 3. Modify `TrustBar.tsx`
**Path:** `src/components/v2/TrustBar.tsx`

- Import `useGoogleReviews`
- Replace hardcoded `"126+"` with `data?.reviews?.length ?? 126` suffixed with `+`
- Fallback to `126+` if hook is loading or returns no data

## 4. Modify `V2Home.tsx`
**Path:** `src/pages/v2/V2Home.tsx`

Insert three new sections into the homepage layout:

| Position | Component | After |
|----------|-----------|-------|
| After `GlassmorphismHero` (line 97) | `<CredibilityStats />` | Hero, before Buyer/Seller fork |
| After `TestimonialColumns` (line 572) | `<GoogleReviewsSection />` | Testimonials, before Podcast |
| Before `CTASection` (line 663) | `<WhyCornerConnect />` | Community section, before final CTA |

New imports: `CredibilityStats`, `WhyCornerConnect`, `GoogleReviewsSection`

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/v2/CredibilityStats.tsx` | **Create** |
| `src/components/v2/WhyCornerConnect.tsx` | **Create** |
| `src/components/v2/TrustBar.tsx` | **Modify** — dynamic review count |
| `src/pages/v2/V2Home.tsx` | **Modify** — add 3 section imports + placements |

No database changes. No new edge functions. No new dependencies.

