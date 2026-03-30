CREATE TABLE public.featured_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  city text NOT NULL DEFAULT 'Tucson',
  state text NOT NULL DEFAULT 'AZ',
  zip_code text,
  price integer NOT NULL,
  beds integer,
  baths numeric,
  sqft integer,
  status text NOT NULL DEFAULT 'active',
  description_en text,
  description_es text,
  photo_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  mls_number text,
  listing_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.featured_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active listings"
  ON public.featured_listings FOR SELECT
  TO anon, authenticated
  USING (status = 'active' AND is_featured = true);

CREATE POLICY "Deny public insert" ON public.featured_listings FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Deny public update" ON public.featured_listings FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "Deny public delete" ON public.featured_listings FOR DELETE TO anon, authenticated USING (false);