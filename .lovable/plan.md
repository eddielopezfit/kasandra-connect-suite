

# Tool Optimization Audit — Full Analysis & Fix Plan

## Tools Audited

| Tool | Page | Status |
|------|------|--------|
| Affordability Calculator | `/affordability-calculator` | 2 issues |
| BAH Calculator | `/bah-calculator` | 1 issue |
| Buyer Closing Costs | `/buyer-closing-costs` | Clean |
| Cash Offer Calculator | `/cash-offer-options` | Clean (already wired to live data) |
| Seller Timeline | `/seller-timeline` | Fixed (previous message) |
| Home Valuation CMA | `/home-valuation` | Clean |
| Buyer Readiness Check | `/buyer-readiness` | Clean |
| Seller Readiness Check | `/seller-readiness` | Clean |
| Cash Readiness Check | `/cash-readiness` | Clean |
| Seller Decision Wizard | `/seller-decision` | Clean |
| Off-Market Buyer | `/off-market` | Clean |
| Market Intelligence | `/market-intelligence` | Clean (uses `useMarketPulse`) |
| Neighborhood Compare | `/neighborhood-compare` | 1 issue |

---

## Issues Found

### Issue 1: Hardcoded Tucson Median Price ($370K)
**File**: `src/lib/calculator/affordabilityAlgorithm.ts` line 33
**Impact**: Affordability Calculator and BAH Calculator both show comparisons against `$370,000` as the "Tucson median." The real March 2026 median is stored in the `market_pulse` table but never pulled into these calculators.

**Fix**: The `market_pulse` table has `median_sale_price`. The `useMarketPulse` hook already returns this data. Update the Affordability Calculator page to use the live median instead of the hardcoded `TUCSON_MEDIAN_PRICE = 370000`.

### Issue 2: Inconsistent Analytics Event Schema
**Impact**: Some tools use `{ tool: "name" }` while others use `{ tool_id: "name" }`. This makes analytics dashboards unreliable.

| Tool | Event Key |
|------|-----------|
| Affordability Calculator | `tool: "affordability_calculator"` |
| BAH Calculator | `tool: "bah_calculator"` |
| Buyer Closing Costs | `tool: "buyer_closing_costs"` |
| Seller Timeline | `tool: "seller_timeline"` |
| Neighborhood Compare | `tool: "neighborhood_compare"` |
| Buyer Readiness | `tool_id: "buyer_readiness"` |
| Seller Readiness | `tool_id: "seller_readiness"` |
| Cash Readiness | `tool_id: "cash_readiness"` |
| Cash Offer Calculator | `tool_id: "tucson_alpha_calculator"` |

**Fix**: Standardize all to use `tool_id` key (the newer, correct pattern). Add `page_path` where missing.

### Issue 3: Missing `tools_completed` Session Context Enrichment
**Impact**: Several tools fire `tool_completed` events but do NOT update `SessionContext.tools_completed[]`. Only the Cash Offer Calculator does this properly. This means Selena does not know which tools the user has completed.

**Affected tools**: Affordability Calculator, BAH Calculator, Buyer Closing Costs, Seller Timeline, Home Valuation, Neighborhood Compare.

**Fix**: Add `tools_completed` array update after each tool completion, matching the pattern from TucsonAlphaCalculator.

### Issue 4: Missing Snapshot Persistence
**Impact**: Only the three Readiness Checks and the Cash Offer Calculator call `saveSnapshot()` after completion. Other tools (Affordability, BAH, Buyer Closing Costs) do not persist the session snapshot, so if the user returns later, their tool data is lost.

**Fix**: Add the `saveSnapshot()` fire-and-forget call after tool completion in: Affordability Calculator, BAH Calculator, Buyer Closing Costs.

---

## What's Already Good (No Changes Needed)

- **Cash Offer Calculator**: Already wired to live market data via `useMarketPulse` + `get-market-pulse`. Has proper `tools_completed` enrichment and snapshot persistence.
- **Seller Timeline**: Just fixed in the previous message. Uses `useMarketPulse` for real DOM data.
- **Market Intelligence page**: Already uses `useMarketPulse` hook for all displayed stats.
- **All Readiness Checks**: Clean scoring algorithms, proper lead capture flow, correct analytics, snapshot persistence.
- **Home Valuation CMA**: Proper 3-step intake with server-side submission, lead bridging, TCPA consent.
- **Seller Decision Wizard**: Proper 5-step flow with session context enrichment at every step.
- **Off-Market Buyer**: Proper multi-step criteria capture with lead save.

---

## Implementation Plan

### 1. Wire live median price into Affordability Calculator
- Import `useMarketPulse` in `V2AffordabilityCalculator.tsx`
- Use `data.medianSalePrice` (with fallback to 370000) instead of `TUCSON_MEDIAN_PRICE`
- BAH Calculator does not display median comparison, so no change needed there

### 2. Standardize analytics event schema
- Update `V2AffordabilityCalculator.tsx`, `V2BAHCalculator.tsx`, `V2BuyerClosingCosts.tsx`, `V2SellerTimeline.tsx`, `V2NeighborhoodCompare.tsx` to use `tool_id` instead of `tool`
- Add `page_path` to events where missing

### 3. Add `tools_completed` session enrichment
- Add `tools_completed` array update in: Affordability Calculator, BAH Calculator, Buyer Closing Costs, Seller Timeline
- Pattern: `updateSessionContext({ tools_completed: [...new Set([...(ctx?.tools_completed ?? []), 'tool_name'])] })`

### 4. Add snapshot persistence
- Add `saveSnapshot()` fire-and-forget in: Affordability Calculator, BAH Calculator, Buyer Closing Costs

**Files changed**:
- `src/pages/v2/V2AffordabilityCalculator.tsx`
- `src/pages/v2/V2BAHCalculator.tsx`
- `src/pages/v2/V2BuyerClosingCosts.tsx`
- `src/pages/v2/V2SellerTimeline.tsx` (analytics key only)
- `src/pages/v2/V2NeighborhoodCompare.tsx` (analytics key only)

No database changes or new edge functions needed.

