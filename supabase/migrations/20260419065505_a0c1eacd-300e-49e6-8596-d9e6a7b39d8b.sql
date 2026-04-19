-- Provision admin_secret in vault so invoke_refresh_market_pulse() can authenticate the edge function call.
-- This was the root cause of April market data not appearing: vault was empty, cron silently exited.
DO $$
DECLARE
  _existing_id uuid;
BEGIN
  SELECT id INTO _existing_id FROM vault.secrets WHERE name = 'admin_secret' LIMIT 1;
  IF _existing_id IS NULL THEN
    PERFORM vault.create_secret(
      current_setting('app.admin_secret_value', true),
      'admin_secret',
      'Admin secret for invoking cost-bearing edge functions from pg_cron'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Vault provisioning skipped: %', SQLERRM;
END $$;

-- Re-invoke immediately so April data populates without waiting for May 1st.
SELECT public.invoke_refresh_market_pulse();