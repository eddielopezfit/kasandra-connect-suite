

# UI/UX Audit Analysis — What is Real vs. False Positive

After reading every file referenced in the audit, here is the triage.

---

## CONFIRMED REAL ISSUES — 4 items

### 1. CRITICAL: Market Data is Corrupted (BUG 4)
The `market_pulse_settings` table contains garbage data from a failed Firecrawl scrape of Redfin:
- `negotiation_gap: 0` (implies 100% sale-to-list — wrong)
- `holding_cost_per_day: $18` (calculated from `median_list_price: $75` which is a parse error)
- `days_to_close: 145` (DOM 115 + 30 escrow — 115 DOM is also suspect)
- The scraper grabbed `"Sale Price\n\n$75"` and `"Over List Price\n\n0%"` as literal values

This is why the Market Intelligence page shows `62.1%` sale-to-list on some loads (fallback math) and different numbers elsewhere. Pages using `useMarketPulse` get the live (garbage) data; the fallback constants are `negotiation_gap: 0.024, days_to_close: 68, holding_cost_per_day: 42`.

**Fix:** Reset the `market_pulse_settings` row to verified fallback values, then fix the scraper's Redfin HTML parser in `scrape-market-pulse` to handle Redfin's current DOM layout correctly. Until the scraper is fixed, the fallback should be authoritative.

### 2. HIGH: Citation Markers `[n]` in Neighborhood Profiles (BUG 3)
Perplexity Sonar returns citation markers like `[2][5]` in its responses. The `neighborhood-profile` edge function passes these straight through to `lifestyle_feel`, `seller_context`, etc. The `CompareColumn` component renders them raw.

**Fix:** Add a `stripCitations` utility that removes `/\[\d+\]/g` from all profile text fields before rendering in `CompareColumn` and `NeighborhoodCard`.

### 3. MEDIUM: Contact Page Has No Contact Form (BUG 11)
V2Contact shows phone, address, social links, and CTA buttons to Book or Talk to Selena. No async message form exists. Users who want to reach out without calling have no path besides Selena.

**Fix:** Add a simple Name / Email / Message form that invokes the existing `upsert-lead-profile` edge function.

### 4. MEDIUM: LeadCaptureModal TCPA Consent Text Has No Linked Privacy/Terms
The consent checkbox text at line 338-342 references receiving communications but does not link to `/privacy` or `/terms`. The footer links are correct (pointing to `/privacy` and `/terms` routes). The GHL booking iframe has its own privacy links that we don't control.

**Fix:** Add inline links to `/privacy` and `/terms` within the TCPA consent label text.

---

## FALSE POSITIVES — Issues That Don't Exist in Code

| Audit Claim | Reality |
|---|---|
| **BUG 1**: Closing Cost Estimator produces no output | Code is correct: `handleCalculate` sets `calculated=true`, results render via `{calculated && lines.length > 0 && ...}`, and `scrollIntoView` fires. Works when price >= $50,000. |
| **BUG 2**: "Estimate Value" button non-functional | `handleEstimate` calls `neighborhood-profile` edge function. Default ZIP 85718 is valid. Button works — but relies on the edge function returning `median_home_price` in the profile. If that field is missing, no result shows (silent fail). |
| **BUG 5**: Quiz card renders faded | `animate-fade-in` in CSS starts at `opacity: 0` and animates to `1` via `@keyframes fadeIn` with `forwards`. This works correctly. The auditor may have seen the 0.6s fade-in mid-animation. |
| **BUG 6**: Privacy/Terms link to example.com | Only `example.com` references in the codebase are email placeholder text (`you@example.com`). The GHL booking iframe is a third-party embed we don't control. Our footer links point to `/privacy` and `/terms` correctly. |
| **BUG 8**: Selena auto-opens uninvited | No proactive homepage trigger exists in V2Home.tsx. The `proactive_homepage` source type is defined in types but no code in the pages directory implements the trigger. The ad funnel (`SellerResult.tsx`) has a proactive trigger but the main site does not. |
| **BUG 10**: Orphaned "10" button in down payment | The down payment section shows chip buttons (`3%, 3.5%, 5%, 10%, 20%` — all with `{p}%`) plus a custom input field. The input shows the raw number. There is no duplicate or orphaned entry. |
| **BUG 12**: No CTA after closing cost result | Lines 434-475 show a Selena CTA card: "Questions about these numbers?" with a chat button AND a "Book a Strategy Session" link. |
| **BUG 13**: Bracket artifacts in CTA section | These are intentional architectural crosshair corner marks (lines 19-37 of CTASection.tsx) — gold `div` elements creating an L-shaped corner accent. Design element, not a glitch. |
| **BUG 15**: Wrong page title on Buyer Readiness | `useDocumentHead` is correctly set to "Buyer Readiness Quiz \| Are You Ready to Buy in Tucson?" |
| **BUG 16**: Market Intelligence has no CTA | The page has TWO CTAs: a mid-page "Ask Selena About My Market" button (line 308) and a bottom section "Talk to Kasandra About This" (line 352-357). |
| **BUG 17**: No auto-scroll in Compare tool | Line 207: `setTimeout(() => resultsRef.current?.scrollIntoView(...)`, 150)` — scroll is implemented. |
| **BUG 22**: "You've Read 9 Guides" counter misleading | This is tracked via localStorage in `useGuideScrollTracking` — it reflects the actual user's session data, not a hardcoded number. |

---

## PARTIALLY TRUE — Needs Nuance

| Claim | Status |
|---|---|
| **BUG 7**: Pages render as blank for 3-6s | V2Sell lazy-loads `GoogleReviewsSection`. Other pages are not lazy-loaded. The GHL booking iframe on `/book` has a loading skeleton. Blank screens are likely network-dependent, not structural. Could add `Suspense` fallbacks to the lazy components. |
| **BUG 9**: Sell page H1 wraps to 5 lines | GlassmorphismHero uses responsive `text-4xl sm:text-5xl md:text-6xl lg:text-7xl`. At 1366px this is `text-7xl` (72px) which does wrap long headlines. Could reduce to `lg:text-6xl` for the Sell page specifically. |
| **BUG 14**: "Explore" nav label is ambiguous | Subjective UX opinion. Current implementation groups secondary pages under a dropdown, which is a standard pattern. Could rename to "More" or split. |
| **BUG 19**: Podcast YouTube embed is a black rectangle | YouTube iframes show black until thumbnail loads. Standard behavior. Could set a poster/thumbnail background. |
| **BUG 20**: Intent cards don't navigate | By design — they open Selena chat with buyer/seller intent context, not navigate to `/buy` or `/sell`. This is the intended funnel flow. Could add a visual indicator that they open chat. |

---

## Implementation Plan — Priority Order

### Sprint 1: Critical (do now)

**1. Fix corrupted market data**
- SQL migration: UPDATE `market_pulse_settings` to restore verified fallback values
- Fix `scrape-market-pulse` edge function's HTML parser for current Redfin DOM
- Until scraper is fixed, `useMarketPulse` should validate data sanity (e.g. reject `median_list_price < 1000`)

**2. Strip citation markers from neighborhood profiles**
- Add utility: `const stripCitations = (text: string) => text.replace(/\[\d+\]/g, '').trim()`
- Apply in `CompareColumn` component to all rendered text fields
- Also apply in `NeighborhoodCard` and `NeighborhoodIntelligencePanel`

### Sprint 2: High (this week)

**3. Add Privacy/Terms links to TCPA consent text**
- In `LeadCaptureModal.tsx` line 338, add `<Link to="/privacy">` and `<Link to="/terms">` within the consent label

**4. Add sanity checks to useMarketPulse**
- Reject live data if `holding_cost_per_day < 5` or `negotiation_gap === 0` (obviously wrong)
- Fall back to `MARKET_FALLBACK` constants when data fails sanity check

### Sprint 3: Medium (this month)

**5. Add contact form to V2Contact**
**6. Add `Suspense` fallback for lazy-loaded components (GoogleReviewsSection)**
**7. Add visual chat-open indicator to homepage intent cards**

