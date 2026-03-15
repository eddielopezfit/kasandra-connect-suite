

# Analytics Coverage Audit

## Coverage Matrix

### Guide Opens — STRONG
- `guide_open` fires on mount in `V2GuideDetail.tsx` with `guide_id` + `guide_title`
- `guide_scroll_50` and `guide_complete` (90%) tracked via `useGuideScrollTracking` hook
- `guide_synthesis_cta_shown` fires at 60% scroll depth
- `guide_category_selected`, `guide_authority_cta_click`, `guide_mid_cta_clicked`, `guide_exit_ramp_clicked` all instrumented
- **No gaps.**

### Tool Usage — 3 GAPS

| Tool | `tool_started` | `tool_completed` | `tool_abandoned` |
|---|---|---|---|
| Tucson Alpha Calculator | Yes | Yes | No |
| Buyer Readiness | Yes | Yes | Yes |
| Seller Readiness | Yes | Yes | Yes |
| Cash Readiness | Yes | Yes | Yes |
| **Buyer Closing Costs** | **NO** | **NO** | **NO** |
| **Seller Timeline** | **NO** | **NO** | **NO** |
| **Neighborhood Compare** | **NO** | **NO** | **NO** |
| Seller Decision Path | Has own events | Has own events | No |

**Gap 1:** `V2BuyerClosingCosts` fires `calculator_complete` but not the standard `tool_started`/`tool_completed`/`tool_abandoned` lifecycle events. This breaks the unified tool funnel in analytics.

**Gap 2:** `V2SellerTimeline` updates session context with `last_tool_completed` but never fires `tool_started`, `tool_completed`, or `tool_abandoned` events.

**Gap 3:** `V2NeighborhoodCompare` fires `neighborhood_profile_generated` but has no `tool_started`/`tool_completed` lifecycle tracking.

### Quiz Completion — GOOD
- `quiz_start` / `quiz_complete` used by all 3 readiness checks
- `neighborhood_quiz_started` / `neighborhood_quiz_completed` tracked
- `seller_decision_started` / `seller_decision_completed` tracked
- **No gaps.**

### Booking Clicks — 1 GAP
- `booking_started` fires on `/book` mount
- `booking_completed` fires on `/thank-you` and `/book/confirmed`
- `book_click` fires from Selena chat actions
- **Gap 4:** `booking_submitted` is defined as an EventType but **never fired anywhere**. There's no tracking for the actual GHL calendar submission moment — only the page load (`booking_started`) and redirect (`booking_completed`). If a user loads `/book` but never submits, there's no way to distinguish that from a submission that didn't redirect.

### CTA Interactions — 1 GAP
- `logCTAClick` used consistently across all hub pages (Sell, Buy, Community, Contact)
- `CTA_NAMES` constants prevent naming drift
- Dev-time validation warns on non-prefixed names
- **Gap 5:** `LanguageToggle` component (used in nav + guide pages) has **no analytics**. The only language toggle tracking is inside `SelenaChatDrawer`. Nav/guide-level language switches are invisible to analytics.

### Selena Conversation Events — GOOD
- `selena_open`, `selena_close`, `selena_minimized`, `selena_restored` tracked
- `selena_message_user`, `selena_message_ai` tracked with truncated content
- `selena_entry` fires with source context
- `selena_chip_clicked`, `selena_chip_unmatched` tracked
- `concierge_tab_open`, `concierge_intent_click` tracked
- Handoff lifecycle fully instrumented (8 event types)
- **No gaps.**

---

## Summary of Gaps (5 issues)

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | HIGH | `V2BuyerClosingCosts` missing `tool_started`/`tool_completed`/`tool_abandoned` | Add lifecycle events matching readiness check pattern |
| 2 | HIGH | `V2SellerTimeline` missing `tool_started`/`tool_completed`/`tool_abandoned` | Add lifecycle events |
| 3 | MEDIUM | `V2NeighborhoodCompare` missing `tool_started`/`tool_completed` | Add lifecycle events |
| 4 | MEDIUM | `booking_submitted` defined but never fired | Cannot fix without GHL iframe postMessage — document as known limitation |
| 5 | LOW | `LanguageToggle` component missing `ui_language_toggle` event | Add `logEvent` call on language switch |

## Implementation Plan

### P1 — Add tool lifecycle to `V2BuyerClosingCosts`
**File:** `src/pages/v2/V2BuyerClosingCosts.tsx`
- Fire `tool_started` when user enters first input (or on calculate click)
- Fire `tool_completed` alongside existing `calculator_complete`
- Add `tool_abandoned` via `beforeunload` or "Finish Later" if present

### P2 — Add tool lifecycle to `V2SellerTimeline`
**File:** `src/pages/v2/V2SellerTimeline.tsx`
- Fire `tool_started` on step 1 entry
- Fire `tool_completed` alongside existing session update
- Fire `tool_abandoned` on early exit

### P3 — Add tool lifecycle to `V2NeighborhoodCompare`
**File:** `src/pages/v2/V2NeighborhoodCompare.tsx`
- Fire `tool_started` on first ZIP submit
- Fire `tool_completed` when 2+ neighborhoods loaded (comparison achieved)

### P4 — Document `booking_submitted` limitation
The GHL calendar is an opaque iframe — no postMessage API is available to detect form submission. `booking_started` (page load) and `booking_completed` (redirect to `/thank-you`) remain the only trackable moments. No code change needed — this is a known third-party limitation.

### P5 — Add analytics to `LanguageToggle`
**File:** `src/components/v2/LanguageToggle.tsx`
- Import `logEvent` and fire `ui_language_toggle` with `{ from, to, source: 'nav' }` on each switch

**Total: 4 files changed. All follow existing patterns.**

