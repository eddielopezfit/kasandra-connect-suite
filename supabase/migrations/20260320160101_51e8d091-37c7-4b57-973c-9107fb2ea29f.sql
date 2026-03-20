-- Add delivery tracking columns to lead_handoffs for retry pipeline
ALTER TABLE public.lead_handoffs
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error text;

-- Index for retry query performance
CREATE INDEX IF NOT EXISTS idx_lead_handoffs_delivery_retry
  ON public.lead_handoffs (delivery_status, retry_count)
  WHERE delivery_status = 'failed' AND retry_count < 5;