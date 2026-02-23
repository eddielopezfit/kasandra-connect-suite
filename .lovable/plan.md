# Guide Image System — Production-Ready

## Status: ✅ Implemented

## What Was Built

### 1. Storage Bucket: `guide-assets`
- **Public read** with path constraint: only `guides/*.jpg|jpeg|png|webp` readable
- No client INSERT/UPDATE/DELETE policies — uploads only via service role in edge functions

### 2. Edge Function: `generate-guide-image`
- Generates a single guide image via Lovable AI gateway
- Model abstracted behind `IMAGE_MODEL` env var (default: `google/gemini-3-pro-image-preview`)
- Uploads to `guide-assets` bucket with upsert
- Saves `.meta.json` alongside each image (prompt, model, timestamp)
- Base prompt enforces governance: no people, no faces, no cars, no staging, golden hour, documentary-style

### 3. Edge Function: `generate-all-guide-images`
- Batch orchestrator: generates all 9 images (Tier 1 + Tier 2)
- Calls `generate-guide-image` sequentially with per-slot variations
- Returns success/failure report

### 4. `guideMediaSlots.ts` Updates
- **Tier 1**: `src` fields point to storage public URLs
- **Tier 2**: `val-clarity` slot removed (max 1 image governance)
- **Tier 3**: All `src` fields removed from story slots
- **New function**: `getGovernedMediaSlots(guideId)` — programmatically strips `src` from Tier 3 guides at runtime (prevents drift)
- `V2GuideDetail.tsx` updated to use `getGovernedMediaSlots` instead of raw `GUIDE_MEDIA_SLOTS`

## Image Inventory (9 total)

| Guide | Slot | Variation |
|-------|------|-----------|
| first-time-buyer-guide | orientation | welcoming single-story home exterior |
| first-time-buyer-guide | checklist | shaded porch in soft light with desert plants |
| selling-for-top-dollar | orientation | well-maintained home with desert landscaping |
| selling-for-top-dollar | clarity | quiet central Tucson residential street |
| cash-offer-guide | orientation | desert foothills behind a residential street |
| cash-offer-guide | checklist | modest single-story home with stucco facade |
| inherited-probate-property | orientation | quiet neighborhood at golden hour |
| inherited-probate-property | checklist | single-story home with mature trees |
| understanding-home-valuation | orientation | street view with foothills in distance |

## Governance Enforced

- ✅ Tier 3 = text only (programmatic, not hardcoded IDs)
- ✅ Tier 2 = max 1 image (orientation only)
- ✅ No "keys", "welcome mat", or staging cues in prompts
- ✅ Model ID abstracted behind env var
- ✅ Bucket path-constrained + file-type-constrained
- ✅ Metadata saved per image for audit/reproduction

## Next Step

Run the batch generator:
```
POST /functions/v1/generate-all-guide-images
Authorization: Bearer <service_role_key>
```
