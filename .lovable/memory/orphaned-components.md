# Architecture: Orphaned Components — RESOLVED

## Cleanup Completed

The following orphaned components were **deleted** (no imports, no routes):

1. ~~`ConsultationIntakeForm.tsx`~~ — deleted
2. ~~`GHLCalendarEmbed.tsx`~~ — deleted (was only used inside ConsultationIntakeForm)
3. ~~`GoHighLevelForm.tsx`~~ — deleted
4. ~~`GoogleSignInButton.tsx`~~ — deleted

## NOT Orphaned (Kept)

- **`PhoneVerificationGate.tsx`** — actively imported and rendered in `V2PrivateCashReview.tsx`. Do NOT delete.

## Dead Code Removed

- `hasReports` state removed from `SelenaChatContext.tsx` and all consuming components (SelenaChatDrawer, SelenaDrawerBottomSection, ConciergeTabPanels). The "View My Latest Report" button in MyOptionsPanel is now gated behind `{false && ...}` until a proper report-tracking mechanism is implemented.

## Supporting Files Kept

- `useConsultationForm.ts` hook — still exists but no longer imported. Can be deleted if ConsultationIntakeForm is not rebuilt.
- `ConsultationFormFields.tsx` — same status as above.
- Edge functions `submit-consultation-intake` and `verify-lead-phone` are kept (server-side, may be reused).
