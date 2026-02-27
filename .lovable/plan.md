

# Neighborhood Intelligence — Phase 1 Build Plan

## Database

Create `neighborhood_profiles` table:
- `id` uuid PK
- `zip_code` text unique indexed
- `profile_en` jsonb (lifestyle_feel, buyer_fit[], seller_context, market_framing, not_ideal_for, fun_fact, confidence_level, source_scope[])
- `profile_es` jsonb (same structure)
- `profile_hash` text (lightweight hash of AI output for future delta detection)
- `generated_at` timestamptz
- `created_at` timestamptz default now()
- RLS: deny all (SELECT, INSERT, UPDATE, DELETE) — edge-function-only via SERVICE_ROLE_KEY

## Edge Function: `neighborhood-profile`

**File:** `supabase/functions/neighborhood-profile/index.ts`

- Accepts `{ zip_code: string }`
- Validates 5-digit ZIP format
- Cache check: query `neighborhood_profiles` by zip_code, return if `generated_at` < 30 days
- On miss: call Lovable AI (google/gemini-2.5-flash) with structured tool-calling prompt
- Prompt requests bilingual JSON with: lifestyle_feel, buyer_fit[], seller_context, market_framing, not_ideal_for, fun_fact, confidence_level, source_scope[]
- For non-Tucson ZIPs (not 856xx/857xx): still generate but set confidence_level to "exploratory" and add a regional disclaimer
- Store both EN/ES profiles + hash in DB
- Rate limit: reuse `_shared/rateLimit.ts`, add `'neighborhood-profile'` config (10 req/hr)
- Returns `{ profile_en, profile_es, zip_code, cached: boolean }`

**Config:** Add `[functions.neighborhood-profile]` with `verify_jwt = false` to `supabase/config.toml`

## Frontend Components

### `src/components/v2/neighborhood/NeighborhoodCard.tsx`
- Renders AI profile: lifestyle feel, buyer fit tags, seller context, market framing, "not ideal for" section, fun fact
- Reads LanguageContext to pick profile_en/profile_es
- Uses cc-navy/cc-gold/cc-ivory design tokens
- For exploratory confidence: shows subtle disclaimer banner

### `src/components/v2/neighborhood/NeighborhoodExplorer.tsx`
- ZIP input (5-digit validation, no hard-block on non-Tucson)
- Calls edge function via `supabase.functions.invoke`
- Skeleton loading state
- Renders NeighborhoodCard on success
- Enriches SessionContext: `last_neighborhood_zip`, `neighborhood_explored: true`
- Emits analytics: `neighborhood_profile_generated` or `neighborhood_profile_cached`

### `src/components/v2/neighborhood/index.ts`
- Barrel export

## SessionContext Extension

Add to `SessionContext` interface in `src/lib/analytics/selenaSession.ts`:
- `last_neighborhood_zip?: string`
- `neighborhood_explored?: boolean`

## V2Buy Integration

Insert `NeighborhoodExplorer` section between "The Buying Process" steps and "Buyer Testimonials" sections. Section header: "Explore Tucson Neighborhoods" / "Explora los Vecindarios de Tucson".

## Analytics Events

Split into two distinct events (not generic `tool_completed`):
- `neighborhood_profile_generated` — fresh AI generation
- `neighborhood_profile_cached` — served from cache

## Files Created
- `supabase/functions/neighborhood-profile/index.ts`
- `src/components/v2/neighborhood/NeighborhoodCard.tsx`
- `src/components/v2/neighborhood/NeighborhoodExplorer.tsx`
- `src/components/v2/neighborhood/index.ts`

## Files Modified
- `src/lib/analytics/selenaSession.ts` — add 2 fields to SessionContext
- `src/pages/v2/V2Buy.tsx` — add NeighborhoodExplorer section
- `supabase/functions/_shared/rateLimit.ts` — add endpoint config

## Database Migration
- Create `neighborhood_profiles` table with deny-all RLS

