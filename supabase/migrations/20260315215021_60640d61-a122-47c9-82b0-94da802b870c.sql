
-- Create market_pulse table for automated market data pipeline
CREATE TABLE public.market_pulse (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  sale_to_list_ratio NUMERIC NOT NULL,
  median_days_on_market INTEGER NOT NULL,
  holding_cost_per_day NUMERIC NOT NULL DEFAULT 42,
  prep_avg INTEGER NOT NULL DEFAULT 4800,
  source_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: deny all public access (edge functions use service role)
ALTER TABLE public.market_pulse ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny public select on market_pulse"
  ON public.market_pulse FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny public insert on market_pulse"
  ON public.market_pulse FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny public update on market_pulse"
  ON public.market_pulse FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE POLICY "Deny public delete on market_pulse"
  ON public.market_pulse FOR DELETE
  TO anon, authenticated
  USING (false);
