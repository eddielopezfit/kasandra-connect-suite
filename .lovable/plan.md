

# Phase 1: SEO Infrastructure — Make the Hub Discoverable

The strategy analysis is correct. SEO is the foundation that compounds. Here's the implementation plan.

## What Gets Built

### 1. `useDocumentHead` Hook
A reusable hook that sets `document.title`, `<meta name="description">`, and `<meta property="og:*">` tags dynamically per route. Called at the top of each page component.

**File:** `src/hooks/useDocumentHead.ts`

Parameters: `{ title, description, ogTitle?, ogDescription?, ogImage?, canonical? }`

On mount/update: sets `document.title`, upserts meta tags via `document.querySelector` + `setAttribute`. Cleanup restores defaults on unmount.

### 2. `JsonLd` Component
A simple component that renders a `<script type="application/ld+json">` tag in the DOM.

**File:** `src/components/seo/JsonLd.tsx`

### 3. Per-Route SEO Data
Each V2 page gets a `useDocumentHead` call with route-specific metadata. Key pages and their target keywords:

| Route | Title | Target Keywords |
|-------|-------|----------------|
| `/v2` | "Kasandra Prieto \| Tucson Realtor & Bilingual Real Estate Agent" | bilingual realtor tucson |
| `/v2/sell` | "Sell Your Tucson Home \| Cash Offer & Traditional Listing Options" | sell my house tucson, cash offer tucson |
| `/v2/buy` | "Buy a Home in Tucson \| First-Time Buyer & Relocation Guide" | buy home tucson, first time buyer tucson |
| `/v2/cash-offer-options` | "Cash Offer vs. Traditional Listing \| Tucson Home Sale Calculator" | cash offer tucson, sell house fast tucson |
| `/v2/guides` | "Real Estate Guides \| Tucson Home Buying & Selling Education" | tucson real estate guide |
| `/v2/guides/:id` | Dynamic from guide registry `titleEn` / `titleEs` | per-guide keywords |
| `/v2/podcast` | "Rumbo Al Éxito Podcast \| Tucson Real Estate & Community" | tucson real estate podcast |
| `/v2/community` | "Tucson Community Impact \| Kasandra Prieto Gives Back" | tucson community realtor |
| `/v2/book` | "Book a Consultation \| Kasandra Prieto, Tucson Realtor" | book realtor tucson |

### 4. JSON-LD Structured Data
Added to specific pages via the `JsonLd` component:

- **V2Home:** `RealEstateAgent` + `LocalBusiness` schema (name, address, phone, image, areaServed: Tucson)
- **V2Guides:** `FAQPage` schema (top 3-5 common questions from guide topics)
- **V2GuideDetail:** `Article` schema (headline, author, datePublished, description)
- **V2Podcast:** `PodcastSeries` schema

### 5. Static `sitemap.xml`
**File:** `public/sitemap.xml`

Lists all canonical `/v2/*` routes with `<lastmod>`, `<changefreq>`, and `<priority>`. Guide detail pages included statically from registry.

### 6. Updated `robots.txt`
Add `Sitemap: https://[domain]/sitemap.xml` directive.

### 7. OG Image Update
Replace the Lovable placeholder OG image in `index.html` with Kasandra's headshot (`/src/assets/kasandra-headshot.jpg`). Move the headshot to `public/og-kasandra.jpg` so it's publicly accessible.

### 8. Language-Aware Titles
The `useDocumentHead` hook accepts both `titleEn` and `titleEs`. It reads from `LanguageContext` and sets the appropriate title. When language toggles, the document title updates reactively.

## Files Created
- `src/hooks/useDocumentHead.ts`
- `src/components/seo/JsonLd.tsx`
- `public/sitemap.xml`
- `public/og-kasandra.jpg` (copy of headshot)

## Files Modified
- `index.html` — update OG image URL, keep as fallback defaults
- `public/robots.txt` — add Sitemap directive
- `src/pages/v2/V2Home.tsx` — add `useDocumentHead` + `JsonLd` (RealEstateAgent)
- `src/pages/v2/V2Sell.tsx` — add `useDocumentHead`
- `src/pages/v2/V2Buy.tsx` — add `useDocumentHead`
- `src/pages/v2/V2CashOfferOptions.tsx` — add `useDocumentHead`
- `src/pages/v2/V2Guides.tsx` — add `useDocumentHead` + `JsonLd` (FAQPage)
- `src/pages/v2/V2GuideDetail.tsx` — add `useDocumentHead` + `JsonLd` (Article)
- `src/pages/v2/V2Podcast.tsx` — add `useDocumentHead`
- `src/pages/v2/V2Community.tsx` — add `useDocumentHead`
- `src/pages/v2/V2Book.tsx` — add `useDocumentHead`

No database changes. No edge functions. Pure frontend SEO infrastructure.

