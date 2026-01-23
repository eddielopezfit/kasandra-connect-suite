# Digital Concierge QA Checklist

Last updated: January 2026

This document covers the critical user flows for the Corner Connect Digital Concierge Experience. Use this checklist to validate functionality after deployments.

---

## 1. Guides Personalization Flow

### Test: Anonymous → Guides Personalization → Selena Open

**Steps:**
1. Open incognito/private browser window
2. Navigate to `/v2/guides`
3. Verify PersonalizedHero shows "Your Starting Point" badge and default headline
4. Verify "Start with Selena" is primary CTA
5. Click any guide card in the grid
6. Navigate back to `/v2/guides`
7. Verify hero now shows "Welcome Back" badge
8. Verify carousel shows "Recommended For You" with the guide you clicked marked "Continue"
9. Click "Start with Selena" button
10. Verify Selena chat drawer opens

**Expected Events (check console/network):**
- `guides_page_view` (once per page load)
- `guide_open` (when clicking guide card)
- `hero_cta_click` with action "start_selena"
- `selena_open`

---

## 2. Report Generation Flow

### Test: Generate Report → View → Close

**Steps:**
1. Open Selena chat from any page
2. Say "Generate a net sheet for my home"
3. Verify loading overlay appears with "Generating Your Report"
4. Wait for report to generate (5-15 seconds)
5. Verify ReportViewer opens with rendered markdown
6. Close the report viewer
7. Verify chat drawer is still accessible

**Expected Events:**
- `report_generate_start`
- `report_generate_success`
- `report_view`

---

## 3. My Report Shortcut Flow

### Test: My Report → Lead Gate → Open Last Report

**Precondition:** User has NOT provided email yet

**Steps:**
1. Open Selena chat drawer
2. Click "My Report" button in header
3. Verify LeadCaptureModal opens (asks for email)
4. Enter valid email address
5. Complete lead capture form
6. Verify modal closes
7. Verify ReportViewer opens:
   - If reports exist: Shows the last report
   - If no reports: Shows empty state with "Generate My Report" CTA

**Expected Events:**
- `my_report_click`
- `lead_capture`
- `report_view` OR `report_empty_state_shown`

---

## 4. Priority Call - Full Booking Flow

### Test: High Intent → Priority Call → Slot Booking → GHL Notify

**Precondition:** User has provided email

**Steps:**
1. Open Selena chat
2. Say "I need to sell my house ASAP, can I talk to Kasandra?"
3. Verify AI response includes priority call action
4. Click the priority call CTA or Selena offers modal automatically
5. Verify PriorityCallModal opens with channel selection
6. Select "10-Minute Priority Zoom"
7. Verify slots load (check for spinner, then time options)
8. Click a specific time slot
9. Verify redirect to booking URL or Cal.com opens

**Expected Events:**
- `handoff_offer_shown`
- `handoff_channel_select` with channel "zoom"
- `handoff_slot_select` with slot details
- `handoff_create_success`
- `handoff_notify_success` (check edge function logs)

**Backend Verification:**
- Check `lead_handoffs` table for new record with:
  - `channel: zoom`
  - `priority: hot`
  - `status: pending`
  - `summary_md` contains conversation context

---

## 5. Priority Call - Callback Fallback Flow

### Test: No Slots → Request Callback → Handoff Created → GHL Notify

**Steps:**
1. Trigger priority call flow (see above)
2. Select a channel (call or zoom)
3. If no slots available, verify fallback UI:
   - Message: "No times available right now..."
   - "Request a Call Back" primary button
   - "Text Me Instead" secondary option
4. Click "Request a Call Back"
5. Verify modal closes

**Expected Events:**
- `handoff_request_callback` with channel and contact_pref
- `handoff_create_success`

**Backend Verification:**
- Check `lead_handoffs` table for new record with:
  - `contact_pref: call` or `text`
  - `status: pending`

**GHL Verification (manual):**
- Check GoHighLevel / LeadConnector for incoming webhook with handoff data

---

## 6. Guide Scroll Engagement

### Test: Guide Scroll → 50% → 90% Complete

**Steps:**
1. Navigate to any guide detail page (e.g., `/v2/guides/first-time-buyer-guide`)
2. Verify `guide_open` event fires on load
3. Scroll slowly to 50% of the page
4. Verify `guide_scroll_50` event fires (once only)
5. Continue scrolling to 90%+ of the page
6. Verify `guide_complete` event fires (once only)
7. Scroll back up and down - events should NOT fire again

**Expected Events:**
- `guide_open` (once)
- `guide_scroll_50` (once at 50% threshold)
- `guide_complete` (once at 90% threshold)

---

## Edge Cases & Error Handling

### Test: Network Error During Report Generation

1. Open dev tools, throttle network to "Offline"
2. Try to generate a report
3. Verify error toast appears
4. Verify `report_generate_error` event logged
5. Verify user can retry

### Test: Identity Gate for Anonymous Priority Call

1. Clear localStorage / use incognito
2. Say something high-intent to trigger priority call
3. Verify LeadCaptureModal opens BEFORE PriorityCallModal
4. Complete lead capture
5. Verify priority call flow continues automatically

---

## Mobile Specific Tests

### Test: No Horizontal Overflow

**Devices:** iPhone SE (320px), iPhone 12 (390px), Pixel 5 (393px)

1. Navigate to `/v2/guides`
2. Verify no horizontal scroll on page
3. Open Selena chat drawer
4. Verify suggested replies scroll horizontally WITHIN container
5. Verify input area is visible and usable
6. Open ReportViewer - verify it's a full-height drawer

### Test: Touch Targets

1. Verify all buttons are at least 44x44px touch targets
2. Verify suggested reply chips have adequate spacing

---

## Timezone Handling

### Test: Slot Display in America/Phoenix

1. Trigger priority call with slots
2. Verify slot times display without "AM/PM" ambiguity
3. Verify no DST-related confusion (Arizona doesn't observe DST)
4. Compare displayed time with Cal.com booking page

---

## Analytics Sanity Checks

### Verify: No Duplicate Event Firing

1. Open browser dev tools → Network tab
2. Filter by "selena-log-event"
3. Navigate to `/v2/guides`
4. Verify exactly ONE `guides_page_view` request
5. Scroll down slowly
6. Verify `journey_checkpoint_shown` fires at most once

### Verify: Events Include Context

Check that events include:
- `route` (current path)
- `language` (en/es)
- `session_id` (consistent across page views)
- `timestamp` (ISO format)

---

## Quick Smoke Test (5 minutes)

For rapid validation after deploys:

1. ✅ `/v2/guides` loads with PersonalizedHero
2. ✅ Click guide → returns → carousel shows "Continue"
3. ✅ Open Selena → send message → get response
4. ✅ Click "My Report" → shows empty state or report
5. ✅ Mobile: no horizontal scroll, drawer works

---

## Known Limitations

- Screenshot tool cannot access auth-protected pages
- Priority call slots depend on Cal.com API availability
- GHL webhook success requires valid LeadConnector configuration
