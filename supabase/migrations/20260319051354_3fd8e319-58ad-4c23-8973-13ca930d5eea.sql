CREATE OR REPLACE FUNCTION public.invoke_refresh_market_pulse()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _service_role_key text;
  _admin_secret text;
  _result bigint;
BEGIN
  -- Try service role key from vault first (auto-provisioned by Supabase)
  SELECT decrypted_secret INTO _service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_service_role_key'
  LIMIT 1;

  IF _service_role_key IS NOT NULL THEN
    SELECT net.http_post(
      url := 'https://sghuhlmsrmqryfvcbqqj.supabase.co/functions/v1/refresh-market-pulse',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || _service_role_key
      ),
      body := '{}'::jsonb
    ) INTO _result;

    RAISE LOG '[refresh-market-pulse] Cron invoked via service_role_key, request_id=%', _result;
    RETURN;
  END IF;

  -- Fallback: try admin_secret from vault
  SELECT decrypted_secret INTO _admin_secret
  FROM vault.decrypted_secrets
  WHERE name = 'admin_secret'
  LIMIT 1;

  IF _admin_secret IS NOT NULL THEN
    SELECT net.http_post(
      url := 'https://sghuhlmsrmqryfvcbqqj.supabase.co/functions/v1/refresh-market-pulse',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-admin-secret', _admin_secret
      ),
      body := '{}'::jsonb
    ) INTO _result;

    RAISE LOG '[refresh-market-pulse] Cron invoked via admin_secret, request_id=%', _result;
    RETURN;
  END IF;

  RAISE WARNING '[refresh-market-pulse] No service_role_key or admin_secret found in vault — skipping';
END;
$function$;