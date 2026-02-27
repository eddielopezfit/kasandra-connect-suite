
CREATE TABLE public.neighborhood_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zip_code text NOT NULL UNIQUE,
  profile_en jsonb NOT NULL,
  profile_es jsonb NOT NULL,
  profile_hash text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_neighborhood_profiles_zip ON public.neighborhood_profiles (zip_code);

ALTER TABLE public.neighborhood_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny public select on neighborhood_profiles" ON public.neighborhood_profiles FOR SELECT USING (false);
CREATE POLICY "Deny public insert on neighborhood_profiles" ON public.neighborhood_profiles FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny public update on neighborhood_profiles" ON public.neighborhood_profiles FOR UPDATE USING (false);
CREATE POLICY "Deny public delete on neighborhood_profiles" ON public.neighborhood_profiles FOR DELETE USING (false);
