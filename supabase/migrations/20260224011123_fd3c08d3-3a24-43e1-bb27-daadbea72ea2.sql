
-- Rate limiting table for edge function abuse prevention
CREATE TABLE public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,
  endpoint text NOT NULL,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1
);

-- Index for fast lookups
CREATE INDEX idx_rate_limits_key_endpoint ON public.rate_limits (key, endpoint, window_start);

-- Enable RLS and deny all public access
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny public read on rate_limits"
  ON public.rate_limits
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny public insert on rate_limits"
  ON public.rate_limits
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny public update on rate_limits"
  ON public.rate_limits
  FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny public delete on rate_limits"
  ON public.rate_limits
  FOR DELETE
  TO anon, authenticated
  USING (false);

-- Cleanup function to purge old rate limit entries (older than 2 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE window_start < now() - interval '2 hours';
END;
$$;
