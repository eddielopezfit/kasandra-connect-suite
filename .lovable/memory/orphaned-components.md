# Architecture: Orphaned Components

## Unmounted Components in `src/components/v2/`

1. **`ConsultationIntakeForm.tsx`** — full TCPA-compliant intake form with Zod validation. Has consent checkboxes. Calls `submit-consultation-intake`.
2. **`GHLCalendarEmbed.tsx`** — GHL calendar with pre-fill capability. Only rendered inside ConsultationIntakeForm (also unmounted).
3. **`GoHighLevelForm.tsx`** — native GHL form embed (form ID `y3N8kzV03nx4q4NamSX4`). Not mounted.
4. **`PhoneVerificationGate.tsx`** — phone verification component. Calls `verify-lead-phone`. Not mounted.
5. **`GoogleSignInButton.tsx`** — Supabase Auth Google sign-in. Not wired to any page.

## Dead Code

- `hasReports` state in `SelenaChatContext.tsx` — initialized to `false`, never updated anywhere.

## Decision Needed

Either mount these components on appropriate routes or remove them to reduce codebase noise.
