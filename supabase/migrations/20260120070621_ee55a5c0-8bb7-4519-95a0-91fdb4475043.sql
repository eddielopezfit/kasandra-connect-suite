-- Create lead_reports table for AI-generated reports
CREATE TABLE public.lead_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.lead_profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  report_content JSONB,
  report_markdown TEXT,
  requires_verification BOOLEAN DEFAULT true,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lead_reports ENABLE ROW LEVEL SECURITY;

-- Allow anonymous INSERT (reports written by edge functions)
CREATE POLICY "Anyone can insert reports"
ON public.lead_reports
FOR INSERT
WITH CHECK (true);

-- No SELECT policy (reports are private, accessed via service role only)

-- Create index on lead_id for fast lookups
CREATE INDEX idx_lead_reports_lead_id ON public.lead_reports(lead_id);

-- Create index on report_type for filtering
CREATE INDEX idx_lead_reports_type ON public.lead_reports(report_type);