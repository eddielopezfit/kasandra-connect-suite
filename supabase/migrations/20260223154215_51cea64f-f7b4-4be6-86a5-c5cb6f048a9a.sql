-- Fix 1: Drop the overly permissive UPDATE policy on lead_profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'lead_profiles' AND policyname = 'Anyone can update lead profiles'
  ) THEN
    DROP POLICY "Anyone can update lead profiles" ON public.lead_profiles;
  END IF;
END $$;

-- Fix 2: Add explicit RESTRICTIVE deny DELETE policy for defense in depth
CREATE POLICY "Deny public delete on lead_profiles"
  ON public.lead_profiles
  FOR DELETE
  TO anon, authenticated
  USING (false);