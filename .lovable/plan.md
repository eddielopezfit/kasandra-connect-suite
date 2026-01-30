# Chat UI Optimization & Submission Error Fix
## Desktop Right-Panel, Modal Polish, Submission Fix & Guide-Aware Greeting

**Status: ✅ IMPLEMENTED**

---

## IMPLEMENTATION COMPLETE

All four enhancements have been implemented:

1. **Desktop UI Optimization** ✅
   - Selena now appears as right-side Sheet (30-35% width) on desktop (≥768px)
   - Minimize button collapses to floating "Selena is active" bar
   - Mobile bottom drawer behavior unchanged

2. **Modal Polish** ✅
   - `LeadCaptureModal.tsx` now calls `bridgeLeadIdToV2` for full dossier sync on success

3. **Submission Fix** ✅
   - CORS headers updated in previous implementation
   - Session dossier sanitized to filter undefined values

4. **Guide-Aware Greeting** ✅
   - `openChat` in `SelenaChatContext.tsx` detects guide context
   - Shows guide title in greeting when on guide pages
   - Contextual suggested replies based on guide category (buying/selling/stories)

---

## FILES CHANGED

| File | Change |
|------|--------|
| `src/components/selena/SelenaChatDrawer.tsx` | Desktop Sheet, minimize state, refactored into shared components |
| `src/contexts/SelenaChatContext.tsx` | Guide-aware greeting with `getGuideById` |
| `src/components/v2/LeadCaptureModal.tsx` | Added `bridgeLeadIdToV2` call |
| `src/lib/analytics/logEvent.ts` | Added `selena_minimized` and `selena_restored` events |

---

## VERIFICATION TESTS

1. **Desktop UI Test**:
   - Open browser on desktop (>768px)
   - Click Selena FAB → right-side panel appears
   - Click minimize button → floating bar appears
   - Click floating bar → panel restores

2. **Guide-Aware Greeting Test**:
   - Navigate to `/v2/guides/first-time-buyer-guide`
   - Open Selena Chat
   - Verify greeting mentions the guide title
   - Verify contextual suggested replies

3. **Form Submission Test**:
   - Navigate to any guide page
   - Fill out NativeGuideLeadCapture form
   - Submit and verify success (no errors)
