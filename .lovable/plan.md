

# Perplexity Comet Audit — Fix All Flagged Issues

## Issues to Fix (5 items)

### 1. "Talk to Selena" CTA on /buy and /sell Links to /book (Promise Mismatch)

On `/buy` and `/sell`, the hero primary CTA says "Talk to Selena" / "Habla con Selena" but the `GlassmorphismHero` always renders `primaryLink = /book?intent=...` as a `<Link>`. The button below ("Not ready to book? Start with Selena") correctly opens chat.

**Fix**: When `primaryLabel` contains "Selena", the primary CTA should call `openChat()` instead of navigating to `/book`. Two options:

- **Option A (recommended)**: Change the label on `/buy` and `/sell` heroes from "Talk to Selena" to "Book a Strategy Call" — matching the semantic honesty standard. The existing "Not ready to book? Start with Selena" link below already handles chat entry.
- **Option B**: Make the hero component detect when the label says "Selena" and render a `<button onClick={handleTalkToSelena}>` instead of a `<Link>`.

Going with **Option A** — it's simpler and respects the CTA hierarchy (gold button = booking, text link = Selena).

**Files**: `src/pages/v2/V2Buy.tsx` (line 96), `src/pages/v2/V2Sell.tsx` (line 261)

### 2. /network Footer Link → Dead End ("Coming Soon")

The footer links to `/network` on every page, but it only shows a placeholder card.

**Fix**: Remove the `/network` link from the footer until the page has real content. Keep the page and route — just hide the navigation to it.

**File**: `src/components/v2/V2Footer.tsx` (line 89-91)

### 3. Missing Pages in sitemap.xml

`/affordability-calculator`, `/bah-calculator`, `/home-valuation`, `/network` are live routes not in the sitemap.

**Fix**: Add them (except `/network` since it's placeholder).

**File**: `public/sitemap.xml`

### 4. Intent Badge in Nav Shows on Wrong Pages

The "Buying" / "Selling" badge in the nav reflects session intent, not current page. Audit says it's confusing to see "Buying" while on `/sell`.

**Fix**: This is actually correct behavior — it shows *the user's* journey intent, not the page topic. However, to reduce confusion, suppress the badge when the current page's obvious intent contradicts it (e.g., hide "Buying" badge on `/sell`, hide "Selling" badge on `/buy`).

**File**: `src/components/v2/V2Navigation.tsx` (lines 148-163) — add `useLocation()` check

### 5. "Welcome Back" Hero for First-Time Visitors

The hero's returning-user detection uses `isReturningVisitor()` from `personalization.ts`. The audit says it shows "Welcome back" on fresh visits.

**Root cause**: `isReturningVisitor()` checks `localStorage` for *any* prior session data. If the user visited once and bounced (creating a session context), they're flagged as returning on their second pageview even within the same first session.

**Fix**: This is working as designed — "returning" means they have prior session data. The audit likely saw this because their Perplexity browser had leftover localStorage from a previous crawl. No code change needed, but worth noting.

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/pages/v2/V2Buy.tsx` | Change primaryLabel from "Talk to Selena" to "Book a Strategy Call" |
| `src/pages/v2/V2Sell.tsx` | Same — already conditional on `depth === 'ready'`, just update the else branch |
| `src/components/v2/V2Footer.tsx` | Remove `/network` link |
| `public/sitemap.xml` | Add 3 missing tool URLs |
| `src/components/v2/V2Navigation.tsx` | Suppress intent badge when it contradicts current page intent |

**Estimated scope**: 1 implementation message, 5 files, all small edits.

