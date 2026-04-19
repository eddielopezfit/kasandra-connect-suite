-- ---------------------------------------------------------------------------
-- 1. Read-only freshness check (callable from app, dashboards, debugging)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_market_pulse_freshness()
RETURNS TABLE (
  has_current_month_data boolean,
  latest_month text,
  latest_inserted_at timestamptz,
  days_since_last_insert integer,
  current_month_label text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_label text;
  _latest_row record;
BEGIN
  _current_label := to_char(now(), 'FMMonth YYYY');

  SELECT month, created_at
  INTO _latest_row
  FROM public.market_pulse
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN QUERY SELECT
    EXISTS (
      SELECT 1 FROM public.market_pulse
      WHERE month = _current_label
    ) AS has_current_month_data,
    _latest_row.month AS latest_month,
    _latest_row.created_at AS latest_inserted_at,
    GREATEST(0, EXTRACT(DAY FROM (now() - COALESCE(_latest_row.created_at, now() - interval '999 days')))::integer) AS days_since_last_insert,
    _current_label AS current_month_label;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Self-healing monitor (runs daily via cron)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.monitor_market_pulse_freshness()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _freshness record;
BEGIN
  SELECT * INTO _freshness FROM public.check_market_pulse_freshness();

  IF _freshness.has_current_month_data THEN
    RAISE LOG '[market-pulse-monitor] OK — current month (%) has data', _freshness.current_month_label;
    RETURN;
  END IF;

  -- Stale: log warning to event_log so it surfaces in dashboards/QA
  INSERT INTO public.event_log (session_id, event_type, event_payload)
  VALUES (
    'system-monitor',
    'market_pulse_stale',
    jsonb_build_object(
      'current_month_label', _freshness.current_month_label,
      'latest_month', _freshness.latest_month,
      'days_since_last_insert', _freshness.days_since_last_insert,
      'auto_refresh_triggered', true,
      'detected_at', now()
    )
  );

  RAISE WARNING '[market-pulse-monitor] STALE — current month (%) missing. Latest=% (% days ago). Triggering refresh.',
    _freshness.current_month_label,
    _freshness.latest_month,
    _freshness.days_since_last_insert;

  -- Self-heal: invoke refresh
  PERFORM public.invoke_refresh_market_pulse();
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. Daily cron at 04:00 UTC (1 hour after the monthly refresh window so
--    it catches a failed May 1 run on May 2 morning, not too noisy)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  -- Drop any existing schedule to keep this idempotent
  PERFORM cron.unschedule('monitor-market-pulse-freshness');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'monitor-market-pulse-freshness',
  '0 4 * * *',
  $$ SELECT public.monitor_market_pulse_freshness(); $$
);