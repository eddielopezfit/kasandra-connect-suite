ALTER TABLE public.neighborhood_profiles ADD COLUMN neighborhood_name text;

CREATE UNIQUE INDEX idx_neighborhood_profiles_zip_name 
ON public.neighborhood_profiles (zip_code, COALESCE(neighborhood_name, ''));