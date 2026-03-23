-- ============================================================
-- Selena OS V2 — Lead Profiles Enrichment Migration
-- Priority 1 + 4: Booking Dossier Bridge + Context Persistence
-- ============================================================
-- Adds critical columns that close the session intelligence gap.
-- All fields are nullable — no breaking changes to existing rows.
-- ============================================================

-- Priority 4: readiness_score to lead_profiles (was only in session_snapshots)
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS readiness_score INTEGER DEFAULT NULL;

-- Priority 4: tools_completed — array of canonical tool IDs completed
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS tools_completed TEXT[] DEFAULT NULL;

-- Priority 4: guides_read_count — cumulative guides engaged
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS guides_read_count INTEGER DEFAULT 0;

-- Priority 1: booking_intent_shown_at — when booking chips first shown
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS booking_intent_shown_at TIMESTAMPTZ DEFAULT NULL;

-- Priority 1: report_viewed_at — when user first viewed a report
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS report_viewed_at TIMESTAMPTZ DEFAULT NULL;

-- Priority 1+8: is_military — BAH calculator / VA loan flag
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS is_military BOOLEAN DEFAULT NULL;

-- Priority 1: estimated_budget — buyer max purchase price from affordability calc
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS estimated_budget NUMERIC DEFAULT NULL;

-- Priority 1: estimated_value — property value from home valuation / seller calc
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS estimated_value NUMERIC DEFAULT NULL;

-- Priority 1: decision_receipt_id — links to seller wizard receipt
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS decision_receipt_id UUID DEFAULT NULL;

-- Priority 1: seller_decision_path — cash | traditional | hybrid | consult
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS seller_decision_path TEXT DEFAULT NULL;

-- Priority 1: property_context — JSON blob for property address/details
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS property_context JSONB DEFAULT NULL;

-- Priority 3: voice_session_summary — ElevenLabs post-call summary
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS voice_session_summary TEXT DEFAULT NULL;

-- Priority 3: last_voice_call_at — timestamp of last ElevenLabs call
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS last_voice_call_at TIMESTAMPTZ DEFAULT NULL;

-- Indexes for new fields
CREATE INDEX IF NOT EXISTS idx_lead_profiles_readiness_score
  ON public.lead_profiles(readiness_score)
  WHERE readiness_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lead_profiles_is_military
  ON public.lead_profiles(is_military)
  WHERE is_military = true;

CREATE INDEX IF NOT EXISTS idx_lead_profiles_decision_receipt_id
  ON public.lead_profiles(decision_receipt_id)
  WHERE decision_receipt_id IS NOT NULL;

-- ============================================================
-- lead_handoffs enrichment — dossier fields for Kasandra
-- ============================================================

ALTER TABLE public.lead_handoffs
  ADD COLUMN IF NOT EXISTS readiness_score INTEGER DEFAULT NULL;

ALTER TABLE public.lead_handoffs
  ADD COLUMN IF NOT EXISTS tools_completed TEXT[] DEFAULT NULL;

ALTER TABLE public.lead_handoffs
  ADD COLUMN IF NOT EXISTS guides_read_count INTEGER DEFAULT NULL;

ALTER TABLE public.lead_handoffs
  ADD COLUMN IF NOT EXISTS calculator_data JSONB DEFAULT NULL;

ALTER TABLE public.lead_handoffs
  ADD COLUMN IF NOT EXISTS dossier_summary TEXT DEFAULT NULL;

-- ============================================================
-- market_pulse unique constraint (prevents duplicate cron runs)
-- ============================================================

ALTER TABLE public.market_pulse
  ADD CONSTRAINT IF NOT EXISTS market_pulse_month_unique UNIQUE (month);

-- ============================================================
-- Conversations table — Priority 3: Cross-device memory
-- ============================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  lead_id UUID REFERENCES public.lead_profiles(id) ON DELETE SET NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  turn_count INTEGER NOT NULL DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'en',
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_session_id
  ON public.conversations(session_id);

CREATE INDEX IF NOT EXISTS idx_conversations_lead_id
  ON public.conversations(lead_id)
  WHERE lead_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at
  ON public.conversations(last_message_at DESC)
  WHERE last_message_at IS NOT NULL;

-- RLS: service-role only
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny public select on conversations"
  ON public.conversations FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Deny public insert on conversations"
  ON public.conversations FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny public update on conversations"
  ON public.conversations FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "Deny public delete on conversations"
  ON public.conversations FOR DELETE TO anon, authenticated USING (false);

CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_conversations_updated_at') THEN
    EXECUTE 'CREATE TRIGGER set_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_conversations_updated_at()';
  END IF;
END $$;

-- ============================================================
-- voice_sessions table — Priority 9: Voice/Web Bridge
-- ============================================================

CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.lead_profiles(id) ON DELETE SET NULL,
  phone TEXT,
  session_id TEXT,
  agent_id TEXT,
  call_duration_seconds INTEGER,
  conversation_summary TEXT,
  extracted_intent TEXT,
  extracted_situation TEXT,
  extracted_address TEXT,
  extracted_name TEXT,
  raw_transcript TEXT,
  webhook_payload JSONB,
  ghl_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_lead_id
  ON public.voice_sessions(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_voice_sessions_phone
  ON public.voice_sessions(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_voice_sessions_created_at
  ON public.voice_sessions(created_at DESC);

ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny public access on voice_sessions"
  ON public.voice_sessions FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- ============================================================
-- rate_limits cleanup cron (was missing)
-- ============================================================

SELECT cron.schedule(
  'cleanup-rate-limits-hourly',
  '0 * * * *',
  $$SELECT public.cleanup_rate_limits();$$
) WHERE NOT EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-rate-limits-hourly'
);

-- ============================================================
-- Add enrich-booking-context to rate limits config
-- (actual config is in _shared/rateLimit.ts — this comment documents intent)
-- enrich-booking-context: { maxRequests: 10, windowSeconds: 3600 }
-- upsert-conversation: { maxRequests: 60, windowSeconds: 3600 }
-- get-conversation: { maxRequests: 60, windowSeconds: 3600 }
-- receive-elevenlabs-webhook: { maxRequests: 20, windowSeconds: 60 }
-- ============================================================

COMMENT ON TABLE public.conversations IS 
  'Selena OS V2: Cross-device conversation memory. Keyed by session_id (anonymous) or lead_id (identified). Enables Selena to resume context on device change once lead identity established.';

COMMENT ON TABLE public.voice_sessions IS 
  'Selena OS V2: ElevenLabs voice call records. Bridges voice Selena with web Selena. Populated by receive-elevenlabs-webhook edge function.';
