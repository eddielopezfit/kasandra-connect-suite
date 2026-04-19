-- Ensure pg_cron + pg_net extensions are available
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Wrapper function that pulls admin_secret from vault and calls sync-listings
CREATE OR REPLACE FUNCTION public.invoke_sync_listings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _admin_secret text;
  _result bigint;
BEGIN
  SELECT decrypted_secret INTO _admin_secret
  FROM vault.decrypted_secrets
  WHERE name = 'admin_secret'
  LIMIT 1;

  IF _admin_secret IS NULL THEN
    RAISE WARNING '[sync-listings] No admin_secret found in vault — skipping';
    RETURN;
  END IF;

  SELECT net.http_post(
    url := 'https://sghuhlmsrmqryfvcbqqj.supabase.co/functions/v1/sync-listings',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-admin-secret', _admin_secret
    ),
    body := '{}'::jsonb
  ) INTO _result;

  RAISE LOG '[sync-listings] Cron invoked, request_id=%', _result;
END;
$function$;

-- Unschedule any prior version, then schedule fresh: daily at 09:00 UTC (~02:00 AZ)
DO $$
BEGIN
  PERFORM cron.unschedule('sync-listings-daily');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'sync-listings-daily',
  '0 9 * * *',
  $$ SELECT public.invoke_sync_listings(); $$
);