
-- Step 1: Add sold_price and sold_date columns
ALTER TABLE public.featured_listings ADD COLUMN sold_price integer;
ALTER TABLE public.featured_listings ADD COLUMN sold_date date;

-- Step 2: Drop old SELECT RLS policy and create expanded one
DROP POLICY IF EXISTS "Public can read active listings" ON public.featured_listings;
CREATE POLICY "Public can read featured listings" ON public.featured_listings
  FOR SELECT TO anon, authenticated
  USING (is_featured = true AND status IN ('active', 'pending', 'sold'));
