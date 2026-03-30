

# Sold Listings + Selena Listing Intelligence

## Overview

Add sold listings display with Active/Sold tabs on `/listings`, inject active listing data into Selena's system prompt for buyer-aware property recommendations.

## Step 1: Update RLS Policy

The current RLS only allows `status = 'active' AND is_featured = true`. We need to also allow `status = 'sold'` rows to be publicly readable.

Migration: Replace the SELECT policy with `(is_featured = true AND status IN ('active', 'pending', 'sold'))`.

## Step 2: Seed Sold Listings

Insert Kasandra's recently sold properties into `featured_listings` with `status = 'sold'`. We'll need her sold history — either from homes.com or manually provided. Add `sold_price` and `sold_date` columns to the table for sold-specific data.

Migration: `ALTER TABLE featured_listings ADD COLUMN sold_price integer, ADD COLUMN sold_date date;`

## Step 3: Update V2Listings Page — Add Tabs

Modify `src/pages/v2/V2Listings.tsx`:
- Add Active / Recently Sold tabs using existing shadcn Tabs component
- Active tab (default): fetches `status = 'active'`
- Sold tab: fetches `status = 'sold'`, ordered by `sold_date DESC`
- Each tab has its own query key

## Step 4: Update PropertyCard — Sold State

Modify `src/components/v2/listings/PropertyCard.tsx`:
- When `status = 'sold'`: show cc-gold "Sold" badge, display `sold_price` if available
- If both `price` (list) and `sold_price` exist, show both: "Listed $299,000 · Sold $295,000"
- Replace "Schedule a Showing" CTA with "See Active Listings" link for sold cards
- Subtle grayscale filter on sold card photos (optional, signals unavailability)

## Step 5: Homepage Section — No Change

`FeaturedListingsSection` already filters `status = 'active'` — sold listings won't leak onto the homepage. No changes needed.

## Step 6: Selena Listing Intelligence

Modify `supabase/functions/selena-chat/systemPromptBuilder.ts`:
- Add a `buildListingsContext()` function that queries `featured_listings` where `status = 'active'`
- Format as a compact context block: address, price, beds/baths/sqft, zip, status
- Inject into system prompt as `[ACTIVE_LISTINGS]` block

Modify `supabase/functions/selena-chat/index.ts`:
- Call `buildListingsContext()` during prompt assembly
- Pass listings context into the system prompt builder

### Selena Behavior Rules (added to system prompt):
- Can reference active listings by address, price, and features
- Can compare listings when buyer mentions budget or area preference
- Must NOT say "good deal," "great value," or advise on pricing (KB-0)
- Must route to "Schedule a Showing" / booking when interest is expressed
- Can mention sold count as social proof: "Kasandra has closed X properties recently"
- Must NOT reference specific sold prices unless asked

## Step 7: Chip Governance — Listing Chip

Modify `supabase/functions/selena-chat/chipGovernance.ts`:
- Add a `browse_listings` chip for buy-intent users: "Browse Kasandra's listings" / "Ver propiedades de Kasandra"
- Phase 2+ only (after orientation)
- Intent filter: `buy` or `explore` only

## Files Summary

| Action | File |
|--------|------|
| Migration | Add `sold_price`, `sold_date` columns + update RLS |
| Seed | Insert sold listing rows |
| Edit | `src/pages/v2/V2Listings.tsx` — add tabs |
| Edit | `src/components/v2/listings/PropertyCard.tsx` — sold state |
| Edit | `supabase/functions/selena-chat/systemPromptBuilder.ts` — listings context |
| Edit | `supabase/functions/selena-chat/index.ts` — inject listings |
| Edit | `supabase/functions/selena-chat/chipGovernance.ts` — browse chip |

## What's NOT Changing

Booking system, VIP system, CRM sync, guard state hierarchy, homepage featured section.

