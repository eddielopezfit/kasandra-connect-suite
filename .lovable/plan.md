

# Ship All Priority Items Now

## 7 Changes

### 1. Add 3-Button Intent Row to V2Home Hero
**File:** `src/pages/v2/V2Home.tsx` (after line 104)

Add three outline-style buttons below "Chat with Selena":
- "Selling: See My Options" → `/v2/sell` (with logCTAClick)
- "Buying: Check My Readiness" → `/v2/buyer-readiness`
- "Not Sure: 60-Second Quiz" → `/v2/quiz`

Styled as `variant="outline"` with `border-white/30 text-white hover:bg-white/10 rounded-full`. Row uses `flex flex-wrap gap-3 mt-4`. Each button logs CTA click before navigating via `Link`.

### 2. Add Google Reviews to /v2/sell
**File:** `src/pages/v2/V2Sell.tsx`

Import `GoogleReviewsSection` and insert `<GoogleReviewsSection />` after the seller testimonials section (after line 202, before the "Your Selling Options" section).

### 3. Add Google Reviews to /v2/cash-offer-options
**File:** `src/pages/v2/V2CashOfferOptions.tsx`

Import `GoogleReviewsSection` and insert `<GoogleReviewsSection />` after the "Cash Offer Review Service" section (after line 285, before the "Back Link" section).

### 4. Hide Empty Guide Categories
**File:** `src/pages/v2/V2Guides.tsx`

Remove three category objects from the `categories` array:
- `tips` (lines 64-71)
- `financial` (lines 81-87)
- `neighborhoods` (lines 88-95)

### 5. Brand-Align V2PrivateCashReview
**File:** `src/pages/v2/V2PrivateCashReview.tsx`

Replace generic Shadcn tokens with brand tokens across all 4 sections:
- `bg-primary/5` → `bg-cc-gold/10`, `bg-primary/20` → `bg-cc-gold/20`
- `text-primary` → `text-cc-gold`
- `text-foreground` → `text-cc-navy`
- `text-muted-foreground` → `text-cc-charcoal/80`
- `bg-background` → `bg-cc-ivory`
- `bg-muted/30` → `bg-cc-sand`
- `border-primary/30` → `border-cc-gold/30`
- `bg-primary` (solid circles) → `bg-cc-gold`
- `text-primary-foreground` → `text-cc-navy`
- `shadow-elevated` stays as-is
- Section backgrounds: Hero gradient → `from-cc-gold/5 to-cc-ivory`, Selena Entry → `bg-cc-ivory`, Kasandra Authority → `bg-cc-sand`, Scheduling → `bg-cc-ivory`

### 6. Returning Visitor Personalization on /v2/sell and /v2/buy
**Files:** `src/pages/v2/V2Sell.tsx`, `src/pages/v2/V2Buy.tsx`

In each page's content component:
- Import `getStoredUserName` from `bridgeLeadIdToV2`
- On mount, check for stored name. If found, render a "Welcome Back, [FirstName]" subtitle line below the hero h1 with `text-cc-gold font-medium`
- This is a lightweight addition — just a conditional `<p>` tag in the hero, no layout changes

### 7. Wire Dynamic YouTube Grid to Podcast Page
**File:** `src/pages/v2/V2Podcast.tsx`

Replace the static "Watch All Episodes" CTA block (lines 127-152) with a dynamic grid:
- Import `useYouTubeVideos` hook
- Render a responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`) of video cards
- Each card: thumbnail image, title, link to YouTube
- Loading state: 6 skeleton cards
- Error/empty fallback: keep the existing static "Visit Channel" CTA (3-tier fallback per custom instructions)

## Technical Notes
- No new dependencies needed
- No database migrations
- `GoogleReviewsSection` already implements 3-tier fallback (Live API → Cache → Static)
- `useYouTubeVideos` hook already exists and is tested
- All new text is bilingual via `t()` helper
- Brand tokens (`cc-navy`, `cc-gold`, `cc-ivory`, `cc-sand`, `cc-charcoal`) are already in Tailwind config

