

# Plan: Mortgage Rate Auto-Scraping via Firecrawl

## What & Why

The `affordabilityAlgorithm.ts` has a hardcoded `INTEREST_RATE = 0.065` (6.5%). When rates change, the calculator gives wrong max-price estimates. We'll scrape current AZ mortgage rates weekly using Firecrawl and store them in the existing `market_pulse_settings` table (via `scrape_log` jsonb), then pipe them into both calculators.

## Architecture

```text
Firecrawl (weekly)          market_pulse_settings
    │                            │
    ▼                            ▼
scrape-market-pulse ──────► scrape_log.mortgage_rate_30yr
    (already exists)             │
                                 ▼
                         get-market-pulse
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
          affordabilityAlgorithm    netToSellerAlgorithm
          (INTEREST_RATE dynamic)   (already dynamic)
```

## Changes

### 1. Extend `scrape-market-pulse` edge function
Add a second Firecrawl scrape targeting a mortgage rate source (e.g., Bankrate AZ rates page or Freddie Mac PMMS). Parse the 30-year fixed rate from the scraped markdown. Store in `scrape_log.mortgage_rate_30yr` alongside existing market metrics. No new DB columns needed — `scrape_log` is already jsonb.

### 2. Extend `get-market-pulse` edge function
Add `scrape_log` to the SELECT query (or extract `mortgage_rate_30yr` from it). Return a new `mortgage_rate_30yr` field in the response.

### 3. Update `useMarketPulse` hook
Expose `mortgageRate30yr` in `MarketStats` (fallback: `0.065`). Sanity check: reject rates outside 3%–12% range.

### 4. Update `affordabilityAlgorithm.ts`
Change `INTEREST_RATE` from hardcoded constant to a parameter with `0.065` default. Export a new function signature: `calculateAffordability(income, debts, downPercent, interestRate?)`.

### 5. Update `TucsonAlphaCalculator.tsx`
Already fetches `get-market-pulse`. Pass the live mortgage rate into `calculateAffordability` when available.

### 6. Update `CalculatorInputs.tsx`
Display the current rate as a read-only badge (e.g., "Current rate: 6.8%") so users see the calculator is using live data.

## Files Summary

| File | Action |
|------|--------|
| `supabase/functions/scrape-market-pulse/index.ts` | **Modify** — add mortgage rate scrape + parse |
| `supabase/functions/get-market-pulse/index.ts` | **Modify** — return mortgage rate from scrape_log |
| `src/hooks/useMarketPulse.ts` | **Modify** — expose mortgageRate30yr |
| `src/lib/calculator/affordabilityAlgorithm.ts` | **Modify** — parameterize interest rate |
| `src/components/v2/calculator/TucsonAlphaCalculator.tsx` | **Modify** — pass live rate |
| `src/components/v2/calculator/CalculatorInputs.tsx` | **Modify** — show current rate badge |

No new tables. No new edge functions. No new secrets. Uses existing Firecrawl connector + ADMIN_SECRET auth.

