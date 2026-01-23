-- Create lead_handoffs table for priority call tracking
CREATE TABLE public.lead_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.lead_profiles(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('call', 'zoom')),
  priority text NOT NULL CHECK (priority IN ('hot', 'warm')),
  reason text,
  summary_md text NOT NULL,
  recommended_next_step text,
  booking_url text,
  calendar_event_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'booked', 'notified', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_handoffs ENABLE ROW LEVEL SECURITY;

-- Allow INSERT only (edge function writes via service role, but anon can insert for flexibility)
CREATE POLICY "Allow insert for handoffs"
  ON public.lead_handoffs
  FOR INSERT
  WITH CHECK (true);

-- No SELECT policy - private table

-- Create indexes for performance
CREATE INDEX idx_lead_handoffs_lead_id ON public.lead_handoffs(lead_id);
CREATE INDEX idx_lead_handoffs_status ON public.lead_handoffs(status);
CREATE INDEX idx_lead_handoffs_created_at ON public.lead_handoffs(created_at DESC);