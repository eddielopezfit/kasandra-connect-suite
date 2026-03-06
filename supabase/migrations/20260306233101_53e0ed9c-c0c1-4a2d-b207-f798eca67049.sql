ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS buyer_criteria jsonb DEFAULT NULL;

COMMENT ON COLUMN public.lead_profiles.buyer_criteria IS
  'Structured off-market buyer preferences: { areas, budget_min, budget_max, bedrooms_min, property_type, timeline, must_haves, additional_notes }';