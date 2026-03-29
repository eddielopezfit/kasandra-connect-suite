CREATE TABLE public.tucson_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_es text NOT NULL,
  description_en text NOT NULL,
  description_es text NOT NULL,
  month text NOT NULL,
  season text NOT NULL,
  category text NOT NULL,
  event_date date,
  source_url text,
  scraped_month text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tucson_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny public select on tucson_events" ON public.tucson_events FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Deny public insert on tucson_events" ON public.tucson_events FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny public update on tucson_events" ON public.tucson_events FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "Deny public delete on tucson_events" ON public.tucson_events FOR DELETE TO anon, authenticated USING (false);