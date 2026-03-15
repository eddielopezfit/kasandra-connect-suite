-- Store ADMIN_SECRET in vault for pg_cron access
-- The actual value will be inserted separately via SQL insert
-- This creates the infrastructure for vault-backed cron auth

-- Create a wrapper function that reads the secret from vault and calls the edge function
CREATE OR REPLACE FUNCTION public.invoke_refresh_market_pulse()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_secret text;
  _result bigint;
BEGIN
  -- Read ADMIN_SECRET from vault
  SELECT decrypted_secret INTO _admin_secret
  FROM vault.decrypted_secrets
  WHERE name = 'admin_secret'
  LIMIT 1;

  IF _admin_secret IS NULL THEN
    RAISE WARNING '[refresh-market-pulse] No admin_secret found in vault — skipping invocation';
    RETURN;
  END IF;

  -- Fire the edge function with the secret as x-admin-secret header
  SELECT net.http_post(
    url := 'https://sghuhlmsrmqryfvcbqqj.supabase.co/functions/v1/refresh-market-pulse',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-admin-secret', _admin_secret
    ),
    body := '{}'::jsonb
  ) INTO _result;

  RAISE LOG '[refresh-market-pulse] Cron invoked, request_id=%', _result;
END;
$$;