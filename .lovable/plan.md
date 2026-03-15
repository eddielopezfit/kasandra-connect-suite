

# Security Audit Report

## 1. RLS Policies — Status: STRONG

All 10 tables have RLS enabled with restrictive policies. Sensitive tables (`lead_profiles`, `lead_handoffs`, `lead_reports`, `seller_leads`, `decision_receipts`, `market_pulse_settings`, `neighborhood_profiles`, `guide_queue`, `session_snapshots`) deny all public SELECT/INSERT/UPDATE/DELETE. Data access is exclusively through edge functions using `SUPABASE_SERVICE_ROLE_KEY`.

`event_log` correctly allows anonymous INSERT (telemetry) but denies public SELECT (no data leakage). `rate_limits` denies all public access.

**No issues found.**

---

## 2. Exposed API Keys — Status: LOW RISK

| Location | Key Type | Risk |
|---|---|---|
| `src/integrations/supabase/client.ts` | Anon/publishable key | Expected — this is a public key by design |
| `src/lib/guides/guideMediaSlots.ts` | Hardcoded project ID in storage URL | Low — public bucket, no secret |
| `.env` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Expected — Vite env vars are client-side by design |

All service-role keys are server-side only (`Deno.env.get`). No secrets leaked to client bundle.

**No issues found.**

---

## 3. Webhook Endpoints — Status: 2 ISSUES

### CRITICAL: `create-handoff` — No Rate Limiting, No Auth
This function accepts any POST request, validates a UUID format for `lead_id`, then writes to `lead_handoffs` AND fires a background call to `notify-handoff` (which triggers the GHL webhook to Kasandra). An attacker who guesses or obtains a valid `lead_id` UUID can:
- Spam Kasandra's phone/inbox with fake handoff notifications
- Flood the `lead_handoffs` table
- Trigger unlimited GHL webhook calls

**Fix:** Add `checkRateLimit` (5 req/hour per IP) and validate that `lead_id` exists in `lead_profiles` before creating the handoff record.

### MEDIUM: `selena-log-event` — No Rate Limiting
Accepts any POST with a `sessionId` and `eventType`. While it only inserts to `event_log` (low-cost), the HANDOFF_EVENTS (`book_click`, `priority_call_click`) trigger GHL webhook calls without any rate limiting. An attacker could flood GHL with booking intent notifications.

**Fix:** Add `checkRateLimit` (30 req/hour per IP).

---

## 4. Authentication Flows — Status: 2 ISSUES

### HIGH: `lead_id` Stored in localStorage — UUID-Based Access Control
The entire authorization model for private pages (`PhoneVerificationGate`, `ReportViewer`, readiness checks) relies on a `lead_id` UUID stored in `localStorage`. This UUID is:
- Returned in plaintext from `verify-lead-phone`, `upsert-lead-profile`, `submit-seller`, `submit-consultation-intake`
- Used as the sole credential to access reports (`get-report`), session snapshots, and lead data
- Guessable if an attacker brute-forces UUIDs (mitigated by UUID v4 entropy, but still a design smell)

The `get-report` function has a partial fix (SEC-05: optional `session_id` cross-check), but `session_id` is also a client-generated UUID stored in localStorage — it provides no real additional security.

**Risk:** If a `lead_id` is leaked (e.g., via shared URL with `?lead_id=` parameter, browser extension, or XSS), the attacker gets full access to that lead's reports and data.

**Fix (P2):** This is an architectural limitation of the no-auth design. Document as accepted risk. For future hardening, consider short-lived signed tokens from the backend instead of raw UUIDs.

### MEDIUM: `get-report` — No Rate Limiting
No rate limiting on report retrieval. An attacker could enumerate report UUIDs.

**Fix:** Add `checkRateLimit` (30 req/hour per IP).

---

## 5. Form Abuse — Status: GOOD (with 1 gap)

### Rate Limiting Coverage

| Function | Rate Limited | Limit |
|---|---|---|
| `selena-chat` | Yes | 30/min |
| `submit-consultation-intake` | Yes | 5/hour |
| `submit-seller` | Yes | 5/hour |
| `upsert-lead-profile` | Yes | 10/hour |
| `verify-lead-phone` | Yes | 5/min |
| `generate-report` | Yes | 5/hour |
| `update-lead-score` | Yes | 10/min |
| `neighborhood-profile` | Yes | 10/hour |
| `upsert-session-snapshot` | Yes | 60/hour |
| `get-session-snapshot` | Yes | 60/hour |
| `get-decision-receipt` | Yes | 30/hour |
| `save-decision-receipt` | Yes | 10/hour |
| **`create-handoff`** | **NO** | — |
| **`selena-log-event`** | **NO** | — |
| **`get-report`** | **NO** | — |
| **`get-last-report-id`** | **NO** | — |
| **`save-buyer-criteria`** | Check needed | — |

### Input Validation
All form-handling functions validate email format, sanitize inputs (`.trim()`, `.slice()` length limits), and use parameterized queries via Supabase SDK (no SQL injection risk).

### `dangerouslySetInnerHTML`
Only used in `JsonLd.tsx` (developer-controlled schema data) and `chart.tsx` (theme CSS). No user-supplied content is rendered unsafely.

---

## 6. Cost-Bearing Function Protection — Status: GOOD

All 5 cost-bearing functions are protected with `x-admin-secret`:
- `scrape-market-pulse` ✅
- `generate-guide-image` ✅
- `generate-all-guide-images` ✅
- `generate-neighborhood-heroes` ✅
- `generate-daily-guide` ✅

---

## Implementation Plan (Priority Order)

### P0 — Rate-limit `create-handoff` + validate `lead_id` exists (CRITICAL)
**File:** `supabase/functions/create-handoff/index.ts`
- Add `checkRateLimit` import and enforce 5 req/hour per IP
- Before inserting handoff, verify `lead_id` exists in `lead_profiles` (already fetched at line 148 — just add a guard if `!leadProfile`)

### P1 — Rate-limit `selena-log-event` (MEDIUM)
**File:** `supabase/functions/selena-log-event/index.ts`
- Add `checkRateLimit` (30 req/hour per IP/session)

### P2 — Rate-limit `get-report` and `get-last-report-id` (MEDIUM)
**Files:** `supabase/functions/get-report/index.ts`, `supabase/functions/get-last-report-id/index.ts`
- Add `checkRateLimit` (30 req/hour per IP)

### P3 — Rate-limit `save-buyer-criteria` (verify first)
**File:** `supabase/functions/save-buyer-criteria/index.ts`
- Verify and add rate limiting if missing

**Total: 4-5 files changed. All changes follow the existing `checkRateLimit` pattern — copy from any rate-limited function.**

