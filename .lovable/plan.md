

# Add `buyer_criteria` column to `lead_profiles`

No need to go to any dashboard — I can run this migration directly through Lovable Cloud.

## Migration SQL

```sql
ALTER TABLE public.lead_profiles
  ADD COLUMN IF NOT EXISTS buyer_criteria jsonb DEFAULT NULL;

COMMENT ON COLUMN public.lead_profiles.buyer_criteria IS
  'Structured off-market buyer preferences: { areas, budget_min, budget_max, bedrooms_min, property_type, timeline, must_haves, additional_notes }';
```

One column, nullable, idempotent. No RLS changes needed — `lead_profiles` already has deny-by-default policies and the `save-buyer-criteria` edge function uses service role.

## Result

The full off-market chain goes live: V2OffMarketBuyer form → `save-buyer-criteria` edge function → `lead_profiles.buyer_criteria` JSONB → Selena handoff.

