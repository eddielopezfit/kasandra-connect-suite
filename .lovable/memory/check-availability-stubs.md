# Architecture: check-availability Stubs

## Current State

`supabase/functions/check-availability/index.ts` returns **stub data** — not real calendar slots.

- Generates 6 fake 30-minute slots starting from current time
- Contains explicit `TODO: Integrate with real calendar provider`
- The `/book` page uses a native GHL calendar iframe (separate from this function)
- `SlotPicker.tsx` calls this function but renders stub slots

## Action Needed

Either:
1. Integrate with a real calendar API (Google Calendar, Cal.com), OR
2. Remove SlotPicker in favor of the GHL iframe exclusively
