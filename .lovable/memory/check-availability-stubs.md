# Architecture: check-availability

## Current State (RESOLVED)

`supabase/functions/check-availability/index.ts` now calls the **real GHL Calendar API**.

- Calendar ID: `N7himS3BLf5KxaVbQPz6` (Kasandra Prieto | Real Estate Consultation)
- Location ID: `kGfxAFqz1M7sxRFm52L1`
- Required env var: `GHL_PRIVATE_KEY` (Supabase project secret)
- Returns up to 8 real free slots for the requested time window
- Falls back gracefully to booking page URL if GHL_PRIVATE_KEY is not set
- `source` field in response: `"ghl_calendar"` (real) or `"booking_page_fallback"`

## Required Supabase Secret

Add to Supabase project secrets:
- Key: `GHL_PRIVATE_KEY`
- Value: `pit-7bf39053-9ee0-43e4-8682-1926650a7445`

## GHL Calendar API Reference

```
GET https://services.leadconnectorhq.com/calendars/{calendarId}/free-slots
  ?locationId=kGfxAFqz1M7sxRFm52L1
  &startDate={ISO}
  &endDate={ISO}
  &timezone=America/Phoenix
Headers:
  Authorization: Bearer {GHL_PRIVATE_KEY}
  Version: 2021-07-28
```

Response shape: `{ _dates_: { "YYYY-MM-DD": { slots: ["ISO_datetime", ...] } } }`
