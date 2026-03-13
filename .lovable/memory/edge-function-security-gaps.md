# Architecture: Edge Function Security Gaps

## Unprotected Cost-Bearing Functions

3 edge functions accept requests **without JWT authentication** and trigger paid external APIs:

1. **`scrape-market-pulse`** — calls Firecrawl API (costs per scrape). Manually triggered for Redfin data refresh.
2. **`generate-guide-image`** — calls Lovable AI Gateway (Gemini image model). Manually triggered for guide asset generation.
3. **`generate-all-guide-images`** — batch version of above. Highest cost risk.

## Low-Risk Public Functions (no external API costs)

- `upsert-session-snapshot`
- `get-session-snapshot`
- `save-decision-receipt`
- `get-decision-receipt`

## Fix

Add JWT validation (`Authorization: Bearer <anon_key>`) to the 3 cost-bearing functions. ~10 minutes per function.
