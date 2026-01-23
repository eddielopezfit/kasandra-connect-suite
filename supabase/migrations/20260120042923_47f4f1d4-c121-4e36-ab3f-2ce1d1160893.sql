-- Create event_log table for Selena analytics
CREATE TABLE public.event_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_log ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts only (no read/update/delete)
CREATE POLICY "Allow anonymous insert" 
  ON public.event_log 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- Create index for session lookups
CREATE INDEX idx_event_log_session_id ON public.event_log(session_id);
CREATE INDEX idx_event_log_event_type ON public.event_log(event_type);
CREATE INDEX idx_event_log_created_at ON public.event_log(created_at DESC);