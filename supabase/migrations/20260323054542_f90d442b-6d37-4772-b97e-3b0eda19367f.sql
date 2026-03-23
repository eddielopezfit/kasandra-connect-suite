
-- P16: Add lead_id FK column to seller_leads for unified lead tracking
ALTER TABLE public.seller_leads ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.lead_profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_seller_leads_lead_id ON public.seller_leads(lead_id);

-- P17: event_log 90-day retention cron
CREATE OR REPLACE FUNCTION public.cleanup_old_events()
  RETURNS void
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.event_log WHERE created_at < now() - interval '90 days';
END;
$$;

SELECT cron.schedule(
  'cleanup-old-events-daily',
  '0 3 * * *',
  $$SELECT public.cleanup_old_events()$$
);

-- Appendix: Missing performance indexes
CREATE INDEX IF NOT EXISTS idx_lead_profiles_ghl_contact_id ON public.lead_profiles(ghl_contact_id);
CREATE INDEX IF NOT EXISTS idx_lead_profiles_created_at ON public.lead_profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_profiles_lead_score ON public.lead_profiles(lead_score);
CREATE INDEX IF NOT EXISTS idx_saved_scenarios_lead_id ON public.saved_scenarios(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON public.conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations(updated_at);

-- Conversations: add updated_at trigger (was missing from creation)
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
