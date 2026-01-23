-- Add new columns to lead_handoffs for enhanced tracking
ALTER TABLE public.lead_handoffs
ADD COLUMN IF NOT EXISTS requested_slot_start timestamptz,
ADD COLUMN IF NOT EXISTS requested_slot_label text,
ADD COLUMN IF NOT EXISTS contact_pref text,
ADD COLUMN IF NOT EXISTS convo_summary_json jsonb,
ADD COLUMN IF NOT EXISTS notified_at timestamptz,
ADD COLUMN IF NOT EXISTS notification_provider text DEFAULT 'leadconnector',
ADD COLUMN IF NOT EXISTS notification_id text;

-- Add check constraint for contact_pref
ALTER TABLE public.lead_handoffs
ADD CONSTRAINT lead_handoffs_contact_pref_check 
CHECK (contact_pref IS NULL OR contact_pref IN ('call', 'text', 'zoom'));

-- Create index on notified_at for notification tracking
CREATE INDEX IF NOT EXISTS idx_lead_handoffs_notified_at ON public.lead_handoffs(notified_at DESC) WHERE notified_at IS NOT NULL;