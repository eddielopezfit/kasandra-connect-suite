-- Provision vault secrets so invoke_refresh_market_pulse() can authenticate the edge function
-- without manual intervention. Pulls values from edge function secrets via current_setting (set transiently).
-- Since pg can't read edge function secrets directly, we insert placeholder rows that the user
-- will populate via the Supabase dashboard Vault UI.

DO $$
DECLARE
  _existing_admin uuid;
  _existing_srv uuid;
BEGIN
  -- admin_secret slot
  SELECT id INTO _existing_admin FROM vault.secrets WHERE name = 'admin_secret' LIMIT 1;
  IF _existing_admin IS NULL THEN
    PERFORM vault.create_secret(
      'PLACEHOLDER_REPLACE_IN_VAULT_UI',
      'admin_secret',
      'Mirrors ADMIN_SECRET edge function secret. Used by pg_cron to authenticate refresh-market-pulse.'
    );
    RAISE NOTICE 'Created admin_secret vault placeholder — replace value via Vault UI.';
  END IF;

  -- supabase_service_role_key slot (preferred auth path)
  SELECT id INTO _existing_srv FROM vault.secrets WHERE name = 'supabase_service_role_key' LIMIT 1;
  IF _existing_srv IS NULL THEN
    PERFORM vault.create_secret(
      'PLACEHOLDER_REPLACE_IN_VAULT_UI',
      'supabase_service_role_key',
      'Mirrors SUPABASE_SERVICE_ROLE_KEY. Preferred auth for pg_cron → edge function calls.'
    );
    RAISE NOTICE 'Created supabase_service_role_key vault placeholder — replace value via Vault UI.';
  END IF;
END $$;