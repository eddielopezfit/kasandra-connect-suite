-- Manually invoke market pulse refresh to populate April 2026 data now.
-- The function uses vault-stored credentials to authenticate the edge function call.
SELECT public.invoke_refresh_market_pulse();