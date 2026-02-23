
# Wire /v2/thank-you as GHL Post-Booking Destination

## Verification Summary

**A) File path:** `src/pages/v2/V2ThankYou.tsx` (453 lines, fully implemented)
**B) Route:** `src/App.tsx` line 61 -- `<Route path="/v2/thank-you" element={<V2ThankYou />} />`
**C) TY1 (PDF link):** ZERO hits for `tucson-buyers-guide.pdf` anywhere in the codebase. All guide links use `/v2/guides/...` routes. Already clean.
**D) Selena post-booking CTA:** Already implemented correctly at line 33-46. User-initiated `openChat({ source: 'post_booking', intent, userName })`. Not auto-opening.
**E) Query params:** Page already reads `intent`, `name`, and `slot_time` from `searchParams`. UTMs are not yet read.

## What Needs to Change

Only one file needs editing: `src/pages/v2/V2ThankYou.tsx`

### 1. Add `booking_completed` event on mount

Add a `useEffect` that fires once on mount, reading all query params and logging `booking_completed` with the correct payload:

```text
useEffect(() => {
  const intent = searchParams.get("intent") || "direct";
  const name = searchParams.get("name") || undefined;
  const utm_source = searchParams.get("utm_source");
  const utm_campaign = searchParams.get("utm_campaign");
  const utm_medium = searchParams.get("utm_medium");
  const utm_content = searchParams.get("utm_content");
  const utm_term = searchParams.get("utm_term");

  logEvent('booking_completed', {
    intent,
    source: 'ghl_calendar_redirect',
    ...(name && { name }),
    ...(utm_source && { utm_source }),
    ...(utm_campaign && { utm_campaign }),
    ...(utm_medium && { utm_medium }),
    ...(utm_content && { utm_content }),
    ...(utm_term && { utm_term }),
  });
}, [searchParams]);
```

This uses the same spread-wins pattern already fixed in `logEvent.ts` so query param values are never overwritten by session defaults.

### 2. Add `booking_completed` to EventType union

In `src/lib/analytics/logEvent.ts`, add `'booking_completed'` to the `EventType` union type (near the other booking events around line 97).

### 3. Import `logEvent`

Add `import { logEvent } from "@/lib/analytics/logEvent"` to `V2ThankYou.tsx` (currently only imports `logCTAClick` from ctaDefaults).

## No Changes Needed

- Route registration: already in App.tsx
- PDF links: none exist (TY1 already clean)
- Selena CTA: already correct (user-initiated, passes post_booking context)
- No new dependencies
- No database changes
- No new edge functions

## GHL Redirect URL

Paste this into GoHighLevel Calendar Settings > Confirmation > Redirect URL:

```text
https://<your-published-domain>/v2/thank-you?intent=sell
```

For different calendars or intents, swap the intent param:
- Buyer calendar: `?intent=buy`
- Cash offer calendar: `?intent=cash`
- General: `?intent=explore`

UTMs will pass through if GHL appends them (or if your ad links include them in the original booking URL and GHL preserves them on redirect).

## File Change Summary

| File | Change |
|------|--------|
| `src/pages/v2/V2ThankYou.tsx` | Add `useEffect` with `logEvent('booking_completed', ...)` on mount; add `logEvent` import |
| `src/lib/analytics/logEvent.ts` | Add `'booking_completed'` to `EventType` union |
