CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE,
  lead_id uuid,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  turn_count integer NOT NULL DEFAULT 0,
  language text NOT NULL DEFAULT 'en',
  last_message_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny public select on conversations" ON public.conversations FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Deny public insert on conversations" ON public.conversations FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny public update on conversations" ON public.conversations FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "Deny public delete on conversations" ON public.conversations FOR DELETE TO anon, authenticated USING (false);