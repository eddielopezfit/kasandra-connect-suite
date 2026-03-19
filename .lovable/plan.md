

# Fix Market Pulse Pipeline — Get Real Scraped Data

## Problem
The Firecrawl scrapers in `refresh-market-pulse` are broken:
- Redfin: parsed 115 DOM / 100% STL (wrong elements)
- Zillow: parsed 15.7% STL (nonsensical)  
- Realtor.com: parsed nothing

Perplexity provided a best-guess (96.6% / 36 DOM) but flagged `consensus: false`. The UI falls back to hardcoded config values (97.6% / 38 days). Users see stale estimates, not live verified data.

## Root Cause
The `refresh-market-pulse` edge function uses Firecrawl to scrape housing market pages, but the parsing logic doesn't handle the current page structures of Redfin, Zillow, and Realtor.com. These sites change their layouts frequently.

## Fix Plan

### 1. Rewrite the scraping + parsing logic in `refresh-market-pulse`

**Current approach**: Scrapes HTML/markdown and tries to regex-parse stats → fragile.

**New approach**: Use Firecrawl's **JSON extraction mode** (`formats: [{ type: 'json', schema: {...} }]`) which uses LLM-powered structured extraction. This is resilient to layout changes.

For each source, request:
```json
{
  "url": "https://www.redfin.com/city/18510/AZ/Tucson/housing-market",
  "formats": [{ 
    "type": "json", 
    "schema": {
      "type": "object",
      "properties": {
        "median_sale_price": { "type": "number" },
        "median_days_on_market": { "type": "number" },
        "sale_to_list_ratio": { "type": "number" },
        "month_year": { "type": "string" }
      }
    }
  }]
}
```

This lets Firecrawl's AI extract the right numbers regardless of HTML structure.

### 2. Improve the reconciliation logic

- Require at least 2 of 3 sources to agree within 15% deviation
- If JSON extraction fails for a source, skip it gracefully
- Only use Perplexity as tiebreaker when exactly 2 sources disagree

### 3. Re-trigger the pipeline after fix

- Call `refresh-market-pulse` to seed real March 2026 data
- Verify the `market_pulse` row has `consensus: true` and real numbers
- Confirm the UI displays the LIVE badge with verified data

### 4. Update the fallback config

Update `src/config/marketPulse.ts` with whatever the verified March 2026 numbers turn out to be, so even cold-start users see accurate data.

---

**Files changed**: 
- `supabase/functions/refresh-market-pulse/index.ts` (rewrite scraping to use JSON extraction)
- `src/config/marketPulse.ts` (update fallback after verification)

**No new tables or migrations needed.**

