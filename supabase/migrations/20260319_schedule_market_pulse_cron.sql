-- Schedule monthly Market Pulse refresh via pg_cron
-- Runs on the 1st of every month at 3:00 AM UTC
-- Uses invoke_refresh_market_pulse() wrapper function (created in 20260315220135 migration)
-- The wrapper reads ADMIN_SECRET from vault and calls the refresh-market-pulse edge function
-- Pipeline: Firecrawl (Redfin + Realtor.com + Zillow) → Perplexity verification → market_pulse table

-- Remove any existing schedule with this name (idempotent)
SELECT cron.unschedule('monthly-market-pulse-refresh')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'monthly-market-pulse-refresh'
);

-- Schedule: 3:00 AM UTC on the 1st of every month
SELECT cron.schedule(
  'monthly-market-pulse-refresh',
  '0 3 1 * *',
  $$SELECT public.invoke_refresh_market_pulse();$$
);

-- Also schedule a safety check on the 2nd (in case 1st run fails)
-- This verifies market_pulse has a current-month row; if not, retries
SELECT cron.unschedule('monthly-market-pulse-safety-retry')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'monthly-market-pulse-safety-retry'
);

SELECT cron.schedule(
  'monthly-market-pulse-safety-retry',
  '0 3 2 * *',
  $$
    DO $$
    DECLARE
      current_month text := to_char(CURRENT_DATE, 'Month YYYY');
      has_current boolean;
    BEGIN
      SELECT EXISTS (
        SELECT 1 FROM public.market_pulse
        WHERE TRIM(month) = TRIM(current_month)
          AND created_at >= date_trunc('month', CURRENT_TIMESTAMP)
      ) INTO has_current;

      IF NOT has_current THEN
        RAISE LOG '[market-pulse] No data for % — triggering retry', current_month;
        PERFORM public.invoke_refresh_market_pulse();
      ELSE
        RAISE LOG '[market-pulse] Data verified for %', current_month;
      END IF;
    END;
    $$;
  $$
);

COMMENT ON FUNCTION public.invoke_refresh_market_pulse() IS
  'Called by pg_cron on the 1st and 2nd of each month at 3 AM UTC to refresh Tucson market data. Reads ADMIN_SECRET from vault, calls refresh-market-pulse edge function. Pipeline: Firecrawl scrape (Redfin + Realtor.com + Zillow) → Perplexity cross-verification → market_pulse table insert.';
