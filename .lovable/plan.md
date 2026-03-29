

# Monthly Tucson Events Pipeline — Piggyback on Market Pulse Cron

## Architecture

Extend the existing `refresh-market-pulse` edge function to also scrape VisitTucson.org for upcoming events. Store in a new `tucson_events` table. The frontend reads live data with static fallback.

```text
Monthly Cron (1st of month, 3 AM UTC)
  └── refresh-market-pulse (existing)
        ├── Firecrawl → Redfin/Zillow/Realtor.com → market_pulse table (existing)
        └── Firecrawl → VisitTucson.org → Gemini curation → tucson_events table (NEW)
```

## Step 1: Create `tucson_events` Table

New migration:

```sql
CREATE TABLE public.tucson_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_es text NOT NULL,
  description_en text NOT NULL,
  description_es text NOT NULL,
  month text NOT NULL,
  season text NOT NULL,
  category text NOT NULL,
  event_date date,
  source_url text,
  scraped_month text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tucson_events ENABLE ROW LEVEL SECURITY;

-- Deny all public access (edge functions use service role)
CREATE POLICY "Deny public select" ON public.tucson_events FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Deny public insert" ON public.tucson_events FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny public update" ON public.tucson_events FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "Deny public delete" ON public.tucson_events FOR DELETE TO anon, authenticated USING (false);
```

## Step 2: Create `refresh-tucson-events` Edge Function

Separate function (not merged into market pulse — keeps concerns clean):
1. Scrape `visittucson.org/events` via Firecrawl markdown extraction
2. Send scraped markdown to Gemini (via Lovable AI Gateway) with a structured prompt to extract top 8-10 events, translate to ES, categorize by season
3. Delete old rows for this month, insert new ones
4. Protected by `x-admin-secret` (same as other cost-bearing functions)

**File:** `supabase/functions/refresh-tucson-events/index.ts`

## Step 3: Create `get-tucson-events` Edge Function

Simple read function — queries `tucson_events` table ordered by `event_date`, returns JSON. No auth needed (public data, no cost).

**File:** `supabase/functions/get-tucson-events/index.ts`

## Step 4: Create `useTucsonEvents` Hook

TanStack Query hook (mirrors `useMarketPulse` pattern):
- Fetches from `get-tucson-events`
- 30-min stale time
- Falls back to static `TUCSON_EVENTS` from `tucsonEvents.ts` on error
- Returns `{ events, isLive, loading }`

**File:** `src/hooks/useTucsonEvents.ts`

## Step 5: Update `V2TucsonLiving.tsx`

- Import `useTucsonEvents` instead of static `TUCSON_EVENTS`
- Add a subtle "Updated [month]" badge near the calendar heading when live data is active
- Keep static fallback seamless — no loading spinners, no empty states

## Step 6: Add to Monthly Cron

Insert a second cron job (or chain call) to invoke `refresh-tucson-events` on the 1st of each month at 3:15 AM UTC (15 min after market pulse to avoid parallel Firecrawl load).

## Step 7: Config & Registration

- Add `[functions.refresh-tucson-events]` and `[functions.get-tucson-events]` with `verify_jwt = false` to `supabase/config.toml`

## Files Changed

| # | File | Action |
|---|------|--------|
| 1 | Migration SQL | Create `tucson_events` table with RLS |
| 2 | `supabase/functions/refresh-tucson-events/index.ts` | Firecrawl + Gemini pipeline |
| 3 | `supabase/functions/get-tucson-events/index.ts` | Public read endpoint |
| 4 | `src/hooks/useTucsonEvents.ts` | TanStack Query hook with static fallback |
| 5 | `src/pages/v2/V2TucsonLiving.tsx` | Use live events, add "Updated" badge |
| 6 | `supabase/config.toml` | Register new functions |
| 7 | Cron SQL (insert tool) | Schedule monthly invocation |

**Cost:** ~2 Firecrawl credits + 1 Gemini call per month. Negligible.

