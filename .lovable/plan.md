

# Sticky Data Layer — Session-Aware Progressive Profiling

## Problem

The system has all the infrastructure for "zero re-entry" but critical wiring is missing:

1. **Two major capture points don't persist contact data to localStorage:**
   - `LeadCaptureModal` — captures email, name, phone → sends to edge function → never stores locally
   - `ToolResultLeadCapture` — captures email → sends to edge function → never stores locally

2. **`useSessionPrePopulation` hook exists but is consumed by zero components.** It was built as a universal pre-fill bridge but never wired into any form.

3. **ToolResultLeadCapture doesn't pre-fill existing email** — if a user already provided their email on a previous tool, the next tool's capture card shows an empty field instead of auto-filling.

## Fix (3 files, surgical)

### 1. `src/components/v2/LeadCaptureModal.tsx`
**After successful submit (line ~147, after `bridgeLeadIdToV2`):**
- Add `setStoredEmail(email.trim())`, `setStoredUserName(name.trim())`, `setStoredPhone(phone.trim())`
- Import the three setters from `bridgeLeadIdToV2`

**On mount (when `isOpen` changes to true):**
- Pre-fill email/name/phone from `getStoredEmail()`, `getStoredUserName()`, `getStoredPhone()`
- If email is already known, skip to step "details" automatically

### 2. `src/components/v2/ToolResultLeadCapture.tsx`
**After successful submit (line ~142, after `logEvent`):**
- Add `setStoredEmail(email.trim())`
- Import `setStoredEmail` and `getStoredEmail` from `bridgeLeadIdToV2`
- Also call `bridgeLeadIdToV2(data.lead_id, ...)` to persist lead_id

**On mount:**
- Pre-fill email field from `getStoredEmail()` if available
- If email is pre-filled, auto-focus the submit button instead

### 3. `src/components/v2/LeadCaptureModal.tsx` (pre-fill on open)
Add a `useEffect` watching `isOpen` that reads stored values and pre-populates the form fields. If all three fields (email, name, phone) are already known, the modal can auto-submit or show a "Welcome back" confirmation instead.

## What This Enables

After these changes, the data flow becomes fully circular:

```text
User enters email on Affordability Calculator
  → stored in localStorage + lead_profiles
  → BAH Calculator pre-fills email
  → Booking Form pre-fills email + name + phone
  → Selena greets by name
  → GHL receives full dossier
```

Every form in the system becomes a read-then-write participant in the Sticky Data Layer.

## Files Changed

| # | File | Change |
|---|------|--------|
| 1 | `src/components/v2/LeadCaptureModal.tsx` | Add localStorage persistence on submit + pre-fill on open |
| 2 | `src/components/v2/ToolResultLeadCapture.tsx` | Add `setStoredEmail` + `bridgeLeadIdToV2` on submit + pre-fill email on mount |

## What We're NOT Changing

- `useSessionPrePopulation` — keeping it available but not force-wiring it into forms that already use direct `getStored*` calls (BookingIntakeForm, StepContact). Those patterns work correctly.
- `NativeBookingFlow` — already persists correctly
- SessionContext / selenaSession — already working as the intent/timeline/tool data layer
- Edge functions — no changes needed, they already receive all data

