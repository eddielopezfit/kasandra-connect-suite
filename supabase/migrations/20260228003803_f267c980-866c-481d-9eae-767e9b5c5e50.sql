
-- Create decision_receipts table
CREATE TABLE public.decision_receipts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  receipt_type text NOT NULL DEFAULT 'seller_decision',
  receipt_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  lead_id uuid NULL,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, receipt_type)
);

-- Enable RLS
ALTER TABLE public.decision_receipts ENABLE ROW LEVEL SECURITY;

-- Deny all public access (service-role only via edge functions)
CREATE POLICY "Deny public select on decision_receipts" ON public.decision_receipts FOR SELECT USING (false);
CREATE POLICY "Deny public insert on decision_receipts" ON public.decision_receipts FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny public update on decision_receipts" ON public.decision_receipts FOR UPDATE USING (false);
CREATE POLICY "Deny public delete on decision_receipts" ON public.decision_receipts FOR DELETE USING (false);

-- updated_at trigger (reuses existing function)
CREATE TRIGGER update_decision_receipts_updated_at
  BEFORE UPDATE ON public.decision_receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Optional: partial index for future lead-based lookups
CREATE INDEX decision_receipts_lead_id_idx ON public.decision_receipts (lead_id) WHERE lead_id IS NOT NULL;
