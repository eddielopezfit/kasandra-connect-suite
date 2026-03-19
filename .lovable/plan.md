

# Seed Live Market Data — Trigger Pipeline Now

## Problem
The market pulse card shows legacy fallback data from `market_pulse_settings` (manually entered). The `market_pulse` table is empty — no automated scrape has ever run. The pg_cron job won't fire until April 1st.

## Solution
Trigger the `refresh-market-pulse` edge function manually to seed the `market_pulse` table with real March 2026 data from Firecrawl + Perplexity.

### What the pipeline does (already built)
1. **Firecrawl** scrapes 3 sources in parallel: Redfin, Realtor.com, Zillow
2. **Parses** sale-to-list ratio, median DOM, median sale price from each
3. **Perplexity** cross-verifies the scraped data, flags deviations >10%
4. **Inserts** verified row into `market_pulse` table with month, source links, verified timestamp
5. `get-market-pulse` edge function then returns this row instead of the legacy fallback

### What I need from you
Your `ADMIN_SECRET` value so I can call:
```
POST /functions/v1/refresh-market-pulse
Header: x-admin-secret: <your value>
```

### After triggering
- The `market_pulse` table gets its first row with real March 2026 data
- `get-market-pulse` returns `source: "market_pulse"` instead of `"market_pulse_settings"`
- The hero card shows verified numbers with source attribution
- The LIVE badge and month label update automatically

### No code changes needed
Everything is already wired. We just need to pull the trigger.

