-- Lock down guide_queue: service-role-only access via edge functions
-- No public/anon/authenticated access needed; service role bypasses RLS entirely

ALTER TABLE public.guide_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny public select on guide_queue"
  ON public.guide_queue FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny public insert on guide_queue"
  ON public.guide_queue FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny public update on guide_queue"
  ON public.guide_queue FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny public delete on guide_queue"
  ON public.guide_queue FOR DELETE
  TO anon, authenticated
  USING (false);

COMMENT ON TABLE public.guide_queue IS 'Service-role-only table. All access via edge functions using SUPABASE_SERVICE_ROLE_KEY. RLS denies all public/anon/authenticated access.';