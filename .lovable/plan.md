

# Full Tool Integrity Audit — Bloomberg-Grade Verification

## Audit Results: 13 Tools Reviewed, 3 Critical Fixes Needed

### Tools That Work Correctly (No Changes)
| Tool | Page | Status | Notes |
|------|------|--------|-------|
| Net-to-Seller Calculator | `/net-to-seller` | OK | Pulls live market pulse (holding cost, negotiation gap, days to close) |
| Buyer Closing Cost Estimator | `/buyer-closing-costs` | OK | Arizona-specific percentages, pure math, no external deps |
| Buyer Readiness Quiz | `/buyer-readiness` | OK | Client-side scoring, session persistence, lead capture |
| Seller Readiness Quiz | `/seller-readiness` | OK | Same architecture as buyer, properly wired |
| Cash Readiness Quiz | `/cash-readiness` | OK | Same architecture, session + lead score sync working |
| Seller Decision Wizard | `/seller-decision` | OK | 5-step wizard, receipt persistence, GHL handoff |
| Seller Timeline Builder | `/seller-timeline` | OK | Uses `useMarketPulse()` for live data |
| Home Valuation Request | `/home-valuation` | OK | Form → `submit-valuation-request` edge function, lead capture |
| Off-Market Registration | `/off-market-buyer` | OK | Multi-step form, edge function submission |
| Neighborhood Compare | `/neighborhood-compare` | OK | Perplexity Sonar profiles, dual-language |
| Contact Form | `/contact` | OK | Submits to `upsert-lead-profile` |
| Booking Flow | `/book` | OK | GHL Calendar API connected (GHL_PRIVATE_KEY set), real slots |

### 3 Critical Fixes

#### Fix 1: Affordability Calculator Uses Stale Hardcoded Rate (HIGH)
`affordabilityAlgorithm.ts` line 30: `BASE_INTEREST_RATE = 0.0625` — hardcoded, never overridden. The `V2AffordabilityCalculator` page imports `useMarketPulse()` but **never passes the live rate to the algorithm**. The market pulse pipeline already scrapes current mortgage rates, but the calculator ignores them.

**Fix**: Add optional `rateOverride` parameter to `calculateAffordability()`. In `V2AffordabilityCalculator`, extract live rate from market pulse and pass it through.

#### Fix 2: BAH Calculator Uses Stale Hardcoded Rate (HIGH)
`bahMortgageAlgorithm.ts` line 70: `VA_INTEREST_RATE = 0.0575` — hardcoded. Same problem: the page doesn't fetch or pass live rates.

**Fix**: Add optional `rateOverride` parameter to `calculateBAHMortgage()`. In `V2BAHCalculator`, add `useMarketPulse()` and pass live rate (with VA-specific adjustment of ~-0.50% from conventional).

#### Fix 3: Median Price Comparison Shows Wrong Data (MEDIUM)
`V2AffordabilityCalculator` line 76: `(marketData as any)?.median_sale_price` — this field **does not exist** in the `get-market-pulse` response. It always falls back to `TUCSON_MEDIAN_PRICE = 370000`. Meanwhile the scraped Zillow data shows $326,550 and Redfin shows $125,000 (clearly incorrect). The comparison text ("X% above/below Tucson median") is misleading.

**Fix**: The `get-market-pulse` edge function should extract median price from the scraped source links (Zillow's `326550` is the most reliable). Add `median_sale_price` to the response. Update the affordability page to use it.

#### Bonus: InstantAnswerWidget (Homepage)
Already refactored to single-purpose affordability check, but still uses hardcoded `0.0625` rate. Same fix as #1 — wire to `useMarketPulse()`.

## Implementation Plan

### Files Modified
1. **`src/lib/calculator/affordabilityAlgorithm.ts`** — Add optional `rateOverride?: number` param to `calculateAffordability()`
2. **`src/lib/calculator/bahMortgageAlgorithm.ts`** — Add optional `rateOverride?: number` param to `calculateBAHMortgage()`
3. **`src/pages/v2/V2AffordabilityCalculator.tsx`** — Extract rate from market pulse, pass to algorithm, fix median price display
4. **`src/pages/v2/V2BAHCalculator.tsx`** — Add `useMarketPulse()`, pass VA-adjusted rate
5. **`src/components/v2/calculator/InstantAnswerWidget.tsx`** — Use `useMarketPulse()` rate instead of hardcoded constant
6. **`supabase/functions/get-market-pulse/index.ts`** — Extract and return `median_sale_price` from scraped source links

### What This Achieves
Every calculator on the hub will use the same live, verified rates from the automated market pulse pipeline. The "Live Rates" badge will be truthful. No stale numbers undermining Kasandra's credibility.

**Estimated scope**: 1 implementation message.

