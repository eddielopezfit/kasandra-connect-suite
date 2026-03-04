
CREATE TABLE IF NOT EXISTS public.market_pulse_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  market_name text NOT NULL DEFAULT 'Tucson_Overall',
  negotiation_gap numeric NOT NULL DEFAULT 0.0236,
  days_to_close integer NOT NULL DEFAULT 68,
  holding_cost_per_day numeric NOT NULL DEFAULT 18.00,
  market_ready_prep_avg numeric NOT NULL DEFAULT 9700,
  source_type text NOT NULL DEFAULT 'manual',
  source_url text,
  last_verified_date date DEFAULT current_date,
  scrape_log jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: deny all public access (service-role only)
ALTER TABLE public.market_pulse_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny public select on market_pulse_settings" ON public.market_pulse_settings FOR SELECT USING (false);
CREATE POLICY "Deny public insert on market_pulse_settings" ON public.market_pulse_settings FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny public update on market_pulse_settings" ON public.market_pulse_settings FOR UPDATE USING (false);
CREATE POLICY "Deny public delete on market_pulse_settings" ON public.market_pulse_settings FOR DELETE USING (false);

-- Unique constraint on market_name for upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_market_pulse_settings_market_name ON public.market_pulse_settings (market_name);
