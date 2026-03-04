
CREATE TABLE IF NOT EXISTS public.session_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE,
  lead_id uuid,
  intent text DEFAULT 'explore',
  last_page text,
  tools_used text[] DEFAULT '{}'::text[],
  guides_read text[] DEFAULT '{}'::text[],
  readiness_score integer,
  primary_priority text,
  calculator_data jsonb DEFAULT '{}'::jsonb,
  context_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_snapshots_lead_id
  ON public.session_snapshots(lead_id);

ALTER TABLE public.session_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny public select on session_snapshots"
  ON public.session_snapshots FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny public insert on session_snapshots"
  ON public.session_snapshots FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny public update on session_snapshots"
  ON public.session_snapshots FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny public delete on session_snapshots"
  ON public.session_snapshots FOR DELETE
  TO anon, authenticated
  USING (false);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_session_snapshots_updated_at') THEN
    EXECUTE 'CREATE TRIGGER set_session_snapshots_updated_at BEFORE UPDATE ON public.session_snapshots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();';
  END IF;
END $$;
