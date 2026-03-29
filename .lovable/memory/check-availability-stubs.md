# Architecture: check-availability

## Current State (LIVE — Real GHL Calendar API)

`supabase/functions/check-availability/index.ts` calls the **real GHL Calendar API**.

- Calendar ID: `N7himS3BLf5KxaVbQPz6` (Kasandra Prieto | Real Estate Consultation)
- Location ID: `kGfxAFqz1M7sxRFm52L1`
- Required env var: `GHL_PRIVATE_KEY` (Supabase project secret — confirmed set)
- Returns up to 8 real free slots for the requested time window
- Graceful fallback: if GHL API fails or key missing, returns `source: "booking_page_fallback"` with direct contact options
- `source` field in response: `"ghl_calendar"` (real) or `"booking_page_fallback"`
- Health check endpoint: `{ action: "health" }` — validates API key + connectivity

## Phase 1 Booking Integrity (Completed)

- ✅ Real GHL Calendar API integration (was already wired)
- ✅ BookingHydrationPanel — "What Kasandra Already Knows" shows intent, timeline, readiness, budget, tools, guides, neighborhoods from SessionContext
- ✅ AvailableSlots fallback UX — shows call + email options when no slots available (not dead-end)
- ✅ Form prefill from Sticky Data Layer (getStoredEmail, getStoredName, getStoredPhone)
- ✅ Session-derived intent prefill on BookingIntakeForm
