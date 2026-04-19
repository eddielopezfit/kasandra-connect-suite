# Google Places API Key — Action Required

**Status:** ⚠️ Invalid / rejected by Google
**Symptom:** Every call to `fetch-google-reviews` logs `API key not valid. Please pass a valid API key.` Reviews silently fall back to the curated static set (3-tier resilience working as designed), so the user never sees a broken state — but live reviews are not loading.

## Fix (user action required in Google Cloud Console)

The current `GOOGLE_PLACES_API_KEY` secret needs ONE of:

1. **Enable "Places API (New)"** for the existing key
   - https://console.cloud.google.com/apis/library/places.googleapis.com
   - Select the project tied to the current key → Enable
   - The key may have been issued for legacy Places API only; the edge function uses the *new* `places.googleapis.com/v1/...` endpoints

2. **Rotate the key**
   - Create a new API key restricted to "Places API (New)"
   - Update the `GOOGLE_PLACES_API_KEY` secret in Lovable Cloud
   - Optionally restrict by HTTP referrer / IP

## Verification

After fix, hit the homepage or any page using `GoogleReviewsSection`. You should see real review payloads in the network tab and no `API key not valid` warnings in edge function logs.

## Code health

The edge function (`supabase/functions/fetch-google-reviews/index.ts`) handles this gracefully:
- Returns `{ ok: false, status: 'SEARCH_ERROR', reviews: [] }` on key failure
- Frontend falls through to curated static reviews via `useGoogleReviews` hook
- No user-visible breakage — this is a quality-of-data issue, not a stability issue
