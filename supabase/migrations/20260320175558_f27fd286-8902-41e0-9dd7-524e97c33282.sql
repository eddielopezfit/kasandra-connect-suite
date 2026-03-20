
-- Create conversation_memory table for persistent Selena memory
CREATE TABLE public.conversation_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  lead_id uuid,
  memory_key text NOT NULL,
  memory_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text NOT NULL DEFAULT 'fact',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Indexes for fast recall
CREATE INDEX idx_conversation_memory_session ON public.conversation_memory (session_id);
CREATE INDEX idx_conversation_memory_lead ON public.conversation_memory (lead_id);
CREATE INDEX idx_conversation_memory_category ON public.conversation_memory (category);

-- Enable RLS
ALTER TABLE public.conversation_memory ENABLE ROW LEVEL SECURITY;

-- Deny all public access (edge functions use service role)
CREATE POLICY "Deny public select on conversation_memory"
  ON public.conversation_memory FOR SELECT
  TO anon, authenticated USING (false);

CREATE POLICY "Deny public insert on conversation_memory"
  ON public.conversation_memory FOR INSERT
  TO anon, authenticated WITH CHECK (false);

CREATE POLICY "Deny public update on conversation_memory"
  ON public.conversation_memory FOR UPDATE
  TO anon, authenticated USING (false);

CREATE POLICY "Deny public delete on conversation_memory"
  ON public.conversation_memory FOR DELETE
  TO anon, authenticated USING (false);
