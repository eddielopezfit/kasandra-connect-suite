

## Plan: Remove WhyCornerConnect from Homepage + Fix Review Count

### What & Why

1. **Remove WhyCornerConnect from homepage** — This is Kasandra's personal brand hub. Corner Connect brokerage content belongs on a separate dedicated page, not in the homepage narrative arc.

2. **Fix review count showing "5+"** — The `useGoogleReviews` hook returns only the reviews fetched from the edge function (likely 5). The `data?.reviews?.length` is accurate to what's cached, but visually wrong. The fix: hardcode `126` as the credibility stat (this is Kasandra's verified count across platforms) and keep the dynamic pull only in `TrustBar` where the fallback already handles it.

### Changes

**1. `src/pages/v2/V2Home.tsx`**
- Remove `WhyCornerConnect` import (line 30)
- Remove `<WhyCornerConnect />` render (line 668)

**2. `src/components/v2/CredibilityStats.tsx`**
- Remove `useGoogleReviews` import and hook call
- Hardcode review count to `126` — this is the verified cross-platform count (Google + Realtor.com + Zillow), not a single-source API number. The edge function only returns a handful of recent Google reviews, making `.length` misleading.

**3. `src/components/v2/WhyCornerConnect.tsx`**
- Keep the file — it will be used later when we create a dedicated `/why-corner-connect` page

### No other changes needed
- `TrustBar.tsx` already has `?? 126` fallback and works correctly
- No route changes, no database changes

