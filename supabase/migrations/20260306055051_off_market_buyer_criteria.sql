-- Off-Market Buyer Capture — buyer_criteria column on lead_profiles
-- Stores structured buyer preferences for off-market property matching.
-- JSONB to stay flexible as criteria evolve without schema migrations.

ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS buyer_criteria JSONB DEFAULT NULL;

COMMENT ON COLUMN public.lead_profiles.buyer_criteria IS
  'Structured off-market buyer preferences. Schema:
   {
     areas: string[],           -- Tucson sub-markets / neighborhoods
     budget_min: number,        -- USD
     budget_max: number,        -- USD  
     bedrooms_min: number,
     property_type: string,     -- single_family | condo | townhome | any
     timeline: string,          -- ready_now | 1_3_months | 3_6_months | exploring
     must_haves: string[],      -- pool, single_story, garage, etc.
     additional_notes: string
   }';
