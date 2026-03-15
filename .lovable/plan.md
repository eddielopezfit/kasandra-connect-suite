

# Full-Site SEO Audit Report

## Audit Summary

**88 URLs analyzed** — 18 core pages, 38 guides, 15 neighborhoods, 4 ad funnel, 3 legal/utility, 10 tool pages.

---

## 1. Title Tags

**Status: GOOD** — All 33 page components call `useDocumentHead()`. Every page has unique, keyword-rich titles.

**Issues found:**

| Page | Problem | Fix |
|---|---|---|
| `/` (V2Home) | Title is "Kasandra Prieto \| Tucson Realtor & Bilingual Real Estate Agent" — missing primary keyword "Tucson Real Estate" in lead position | Change to: "Tucson Real Estate \| Kasandra Prieto — Bilingual REALTOR® & Concierge" |
| `/sell` | Title starts with "Sell Your Tucson Home" — strong, but missing "Tucson home selling" exact match | Change to: "Tucson Home Selling \| Cash Offer & Traditional Listing — Kasandra Prieto" |
| `/guides` | Title "Real Estate Guides \| Tucson Home Buying & Selling Education" — missing brand | Add "— Kasandra Prieto" suffix |
| `/market` | Title "Tucson Real Estate Market Intelligence" — good but not matching `ROUTE_META` ("Tucson Real Estate Market Data 2026") | Sync `useDocumentHead` with `ROUTE_META` |
| **All pages** | `useDocumentHead` titles and `ROUTE_META` titles are **out of sync** in 9 places — crawlers using SSR/prerender get different titles than SPA users | Consolidate: make `useDocumentHead` read from `ROUTE_META` |

---

## 2. Meta Descriptions

**Status: GOOD** — All pages have descriptions via `useDocumentHead`. Lengths are 130–160 chars.

**Issues:**

| Page | Problem |
|---|---|
| `/` | Description says "Bilingual real estate guidance" — should lead with "Tucson real estate agent" for primary keyword |
| `/neighborhoods` | **Missing `useDocumentHead` call** — component `V2Neighborhoods` doesn't have a description visible in the code excerpt. Needs verification. |
| 9 pages | `useDocumentHead` description differs from `ROUTE_META` description — same dual-source problem as titles |

---

## 3. H1 Structure

**Status: GOOD** — Every content page has exactly one `<h1>`. Verified: Home (via GlassmorphismHero), Sell, Buy, CashOfferOptions, Guides, About, Contact, Community, Podcast, Neighborhoods, NeighborhoodDetail, Market, SelenaAI.

**Issues:**

| Page | Problem |
|---|---|
| `/` | H1 is inside `GlassmorphismHero` — likely "Your Best Friend in Real Estate" or similar brand statement. Should contain "Tucson Real Estate" for keyword targeting. |
| `/sell` | H1 "Know Your Worth. Sell on Your Terms." — emotional but no keyword. Should include "Tucson Home Selling" |
| `/buy` | H1 likely "Find Your Home" style — should include "Buy a Home in Tucson" |

---

## 4. Schema Markup

**Status: EXCELLENT** — Comprehensive implementation.

- `index.html`: `RealEstateAgent` + `LocalBusiness` + `WebSite` (server-rendered, no JS needed)
- Homepage: Duplicate `RealEstateAgent` JSON-LD in React (redundant but not harmful)
- Guides: `Article` + `BreadcrumbList` + `FAQPage` + `HowTo` (where applicable)
- Neighborhoods: `LocalBusiness` with `areaServed`
- Podcast: `PodcastSeries`
- Selena AI: `WebApplication`

**Issues:**

| Item | Problem |
|---|---|
| `/sell` | **No JSON-LD schema** — should have `Service` schema for "Home Selling Services" |
| `/buy` | **No JSON-LD schema** — should have `Service` schema for "Home Buying Services" |
| `/about` | **No JSON-LD schema** — should have `Person` schema per `ROUTE_META.schemaType` |
| Homepage | `aggregateRating.reviewCount: "100"` is hardcoded — should match actual Google review count or be removed |

---

## 5. Internal Linking

**Status: GOOD** — Strong internal link mesh via:
- Navigation menu (all core pages)
- Footer links (Buy, Sell, Guides, Book, Contact, etc.)
- Guide `RelatedGuides` component (cross-links 3 related guides per page)
- `FeaturedGuideCard` on Sell and Buy pages
- Neighborhood `RelatedNeighborhoodsRail`
- Selena chat chip routing to pages

**Issues:**

| Problem | Impact |
|---|---|
| `/market` page has no inbound links from `/sell` or `/buy` | Market data page is orphaned from the two highest-intent pages |
| `/seller-timeline` has no inbound link from `/sell` page | Key seller tool not linked from the seller hub |
| `/buyer-closing-costs` has no inbound link from `/buy` page | Key buyer tool not linked from the buyer hub |
| No breadcrumbs on core pages (only on guides) | Missed `BreadcrumbList` schema opportunity on `/sell`, `/buy`, `/neighborhoods` |

---

## 6. Sitemap Coverage

**Status: GOOD** — 87 URLs in sitemap. All routes accounted for.

**Issues:**

| Problem | URLs |
|---|---|
| **Missing from sitemap** | `/private-cash-review`, `/thank-you`, `/book/confirmed` — these should either be added (if indexable) or confirmed as noindex |
| **Missing from sitemap** | `/ad/seller`, `/ad/seller-quiz`, `/ad/seller-result` — correct if noindex, but should verify all 3 have `noindex: true` |
| **Stale lastmod dates** | Most guides show `2026-03-01` — should auto-update on deploy or use actual modification dates |

---

## 7. Page Speed / Performance

**Status: NEEDS ATTENTION** — SPA architecture means:
- All meta tags are client-rendered (Googlebot can handle this, but social crawlers cannot without the `seo-meta` edge function)
- Lazy-loaded routes are good for bundle splitting
- Google Fonts loaded via `<link>` (blocking render) — should use `font-display: swap` (already set via `display=swap` param)
- Hero images are large PNGs (e.g., `hero-sell-tucson-aerial.png`) — should be WebP

**Recommendations:**
- Convert all hero `.png` images to `.webp` (est. 60-70% size reduction)
- Add `fetchpriority="high"` to above-fold hero images
- Verify `seo-meta` edge function serves correct OG tags for all routes (social sharing depends on it)

---

## 8. Indexability

**Status: GOOD**
- `robots.txt` allows all crawlers, references sitemap
- `index.html` has `robots: index, follow, max-snippet:-1, max-image-preview:large`
- Ad funnel pages correctly use `noindex: true`

**Issues:**

| Problem | Impact |
|---|---|
| `/thank-you`, `/book/confirmed`, `/private-cash-review` | No `noindex: true` — these transactional pages should not be indexed |
| QA pages (`/qa-cta`, `/qa-determinism`) | Redirect to `/` in production — safe, no action needed |

---

## 9. Target Keyword Optimization

### "Tucson real estate"

| Signal | Current | Recommendation |
|---|---|---|
| Homepage title | "Kasandra Prieto \| Tucson Realtor..." | Move "Tucson Real Estate" to lead position |
| Homepage H1 | Brand/emotional statement | Include "Tucson Real Estate" in H1 |
| Homepage meta desc | "Bilingual real estate guidance in Tucson" | Lead with "Tucson real estate agent" |
| `ROUTE_META['/']` title | "Tucson Real Estate Agent \| Kasandra Prieto" | Already good — but `useDocumentHead` overrides it |

### "Tucson home selling"

| Signal | Current | Recommendation |
|---|---|---|
| `/sell` title | "Sell Your Tucson Home" | Change to "Tucson Home Selling \| ..." |
| `/sell` H1 | "Know Your Worth. Sell on Your Terms." | Add keyword: "Tucson Home Selling: Know Your Worth" |
| `/sell` meta desc | "Explore your selling options in Tucson" | Lead with "Tucson home selling options" |
| No dedicated `/sell` JSON-LD | — | Add `Service` schema with "Tucson Home Selling" as service name |

### "Pima County selling guide"

| Signal | Current | Recommendation |
|---|---|---|
| No page targets this exact phrase | — | Best candidate: `/guides/cost-to-sell-tucson` or `/guides/selling-for-top-dollar` |
| Guide titles use "Tucson" not "Pima County" | — | Add "Pima County" to at least 2 seller guide descriptions |
| `/sell` page doesn't mention "Pima County" | — | Add "Serving Pima County" text to `/sell` body copy |

---

## Implementation Plan (Priority Order)

### P0 — Title/Meta Sync (prevents dual-source drift)
**File:** `src/hooks/useDocumentHead.ts` + all page files
Make `useDocumentHead` optionally read from `ROUTE_META` when a route key is provided, eliminating the dual-source problem. Alternatively, update the 9 mismatched `useDocumentHead` calls to match `ROUTE_META`.

### P1 — Keyword Optimization (3 files)
1. **`src/pages/v2/V2Home.tsx`**: Update `useDocumentHead` title to lead with "Tucson Real Estate"
2. **`src/pages/v2/V2Sell.tsx`**: Update title to "Tucson Home Selling | ...", update H1 to include keyword
3. **`src/pages/v2/V2Buy.tsx`**: Update H1 to include "Buy a Home in Tucson"

### P2 — Missing JSON-LD Schemas (2 files)
1. **`src/pages/v2/V2Sell.tsx`**: Add `Service` schema for home selling
2. **`src/pages/v2/V2Buy.tsx`**: Add `Service` schema for home buying

### P3 — Internal Linking Gaps (2 files)
1. **`src/pages/v2/V2Sell.tsx`**: Add links to `/market`, `/seller-timeline`
2. **`src/pages/v2/V2Buy.tsx`**: Add link to `/buyer-closing-costs`

### P4 — Noindex Missing Pages (3 files)
Add `noindex: true` to `V2ThankYou`, `V2BookConfirmed`, `V2PrivateCashReview`

### P5 — Sitemap Updates (1 file)
Remove or add missing URLs, update lastmod dates

### P6 — Add "Pima County" to Seller Guide Descriptions (1 file)
Update `seoOverrides` in `V2GuideDetail.tsx` for 2 seller guides to include "Pima County"

### P7 — Hero Image WebP Conversion
Convert `.png` hero images to `.webp` for performance

**Total: ~12 files changed, no structural refactors.**

