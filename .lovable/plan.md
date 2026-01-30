
# Database Hardening: The Oasis Shield
## Complete RLS Security Migration Plan

---

## EXECUTIVE SUMMARY

Your architectural intuition was correct. The current RLS policies have critical security vulnerabilities that allow public modification of lead data. This plan implements a **"Deny-by-Default"** architecture where:

1. **All public write policies are removed** from sensitive tables
2. **All data mutations flow exclusively through Edge Functions** using `SUPABASE_SERVICE_ROLE_KEY`
3. **Telemetry (event_log) remains public** for analytics
4. **Frontend code requires no changes** - it already calls edge functions correctly

---

## SECURITY AUDIT FINDINGS

### Current RLS Policies (The Leak)

| Table | Policy | Risk Level | Issue |
|-------|--------|------------|-------|
| `lead_profiles` | "Anyone can update" (UPDATE / true) | **CRITICAL** | Any actor can modify any lead's email, phone, name |
| `lead_profiles` | "Anyone can create" (INSERT / true) | **HIGH** | Bot spam, injection attacks |
| `lead_reports` | "Anyone can insert" (INSERT / true) | **HIGH** | Fake reports could be injected |
| `seller_leads` | "Anyone can submit" (INSERT / true) | **HIGH** | Bot spam, fake leads |
| `lead_handoffs` | "Allow insert" (INSERT / true) | **HIGH** | Unauthorized handoff creation |
| `event_log` | "Allow anonymous insert" (INSERT / true) | **ACCEPTABLE** | Telemetry - intentionally public |

### Edge Function Verification (All Clear)

Every edge function that writes to these tables already uses `SUPABASE_SERVICE_ROLE_KEY`:

| Edge Function | Tables Written | Uses Service Role |
|--------------|----------------|-------------------|
| `upsert-lead-profile` | `lead_profiles` | ✅ Yes |
| `submit-seller` | `seller_leads`, `event_log` | ✅ Yes |
| `submit-consultation-intake` | `lead_profiles`, `event_log` | ✅ Yes |
| `generate-report` | `lead_reports` | ✅ Yes |
| `create-handoff` | `lead_handoffs` | ✅ Yes |
| `notify-handoff` | `lead_handoffs` | ✅ Yes |
| `selena-chat` | `lead_profiles` | ✅ Yes |
| `selena-log-event` | `event_log` | ✅ Yes |

---

## IMPLEMENTATION: SQL MIGRATION

### Migration Script

This migration will:
1. Drop all permissive public INSERT/UPDATE policies on sensitive tables
2. Keep the `event_log` telemetry policy (intentionally public)
3. Edge Functions will continue working because they use `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS entirely

```sql
-- ============================================
-- OASIS SHIELD: Database Hardening Migration
-- ============================================

-- ====================
-- 1. LEAD_PROFILES
-- ====================
-- Drop the dangerous public UPDATE policy
DROP POLICY IF EXISTS "Anyone can update lead profiles" ON public.lead_profiles;

-- Drop the public INSERT policy 
DROP POLICY IF EXISTS "Anyone can create a lead profile" ON public.lead_profiles;

-- NOTE: We do NOT create replacement policies because:
-- - All writes go through edge functions with service role
-- - Service role bypasses RLS entirely
-- - No public access = maximum security

-- ====================
-- 2. LEAD_REPORTS
-- ====================
-- Drop the public INSERT policy
DROP POLICY IF EXISTS "Anyone can insert reports" ON public.lead_reports;

-- ====================
-- 3. SELLER_LEADS  
-- ====================
-- Drop the public INSERT policy
DROP POLICY IF EXISTS "Anyone can submit a seller lead" ON public.seller_leads;

-- ====================
-- 4. LEAD_HANDOFFS
-- ====================
-- Drop the public INSERT policy
DROP POLICY IF EXISTS "Allow insert for handoffs" ON public.lead_handoffs;

-- ====================
-- 5. EVENT_LOG (KEEP)
-- ====================
-- This policy remains INTENTIONALLY for telemetry
-- No action needed - "Allow anonymous insert" stays in place

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check remaining policies on lead_profiles (should be empty)
-- SELECT * FROM pg_policies WHERE tablename = 'lead_profiles';

-- Check remaining policies on lead_reports (should be empty)
-- SELECT * FROM pg_policies WHERE tablename = 'lead_reports';

-- Check remaining policies on seller_leads (should be empty)
-- SELECT * FROM pg_policies WHERE tablename = 'seller_leads';

-- Check remaining policies on lead_handoffs (should be empty)
-- SELECT * FROM pg_policies WHERE tablename = 'lead_handoffs';

-- Check event_log still has telemetry policy (should have 1 INSERT policy)
-- SELECT * FROM pg_policies WHERE tablename = 'event_log';
```

---

## SECURITY ARCHITECTURE AFTER MIGRATION

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        PUBLIC INTERNET                              │
│                                                                     │
│   ❌ Direct DB Access (PostgREST)                                   │
│      - lead_profiles: BLOCKED (no RLS policies)                     │
│      - lead_reports:  BLOCKED (no RLS policies)                     │
│      - seller_leads:  BLOCKED (no RLS policies)                     │
│      - lead_handoffs: BLOCKED (no RLS policies)                     │
│      - event_log:     ✅ OPEN (telemetry only)                      │
│                                                                     │
│   ✅ Edge Function Endpoints                                        │
│      └─── Validate inputs                                           │
│           └─── Use SUPABASE_SERVICE_ROLE_KEY                        │
│                └─── Bypass RLS, perform mutations                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                              │
                              ▼

┌─────────────────────────────────────────────────────────────────────┐
│                       SUPABASE DATABASE                             │
│                                                                     │
│   lead_profiles     │ lead_reports │ seller_leads │ lead_handoffs  │
│   ─────────────────────────────────────────────────────────────────│
│   RLS: ENABLED      │ RLS: ENABLED │ RLS: ENABLED │ RLS: ENABLED   │
│   Policies: NONE    │ Policies:NONE│ Policies:NONE│ Policies: NONE │
│   Access: SVC ONLY  │ Access: SVC  │ Access: SVC  │ Access: SVC    │
│                                                                     │
│   event_log                                                         │
│   ──────────────────                                                │
│   RLS: ENABLED                                                      │
│   Policy: "Allow anonymous insert" (FOR INSERT)                     │
│   Access: PUBLIC for telemetry                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## FRONTEND INTEGRATION CHECK

### All Forms Already Use Edge Functions

No frontend code changes required. The existing forms already call edge functions:

| Component | Edge Function Called | Status |
|-----------|---------------------|--------|
| `LeadCaptureModal.tsx` | `upsert-lead-profile` | ✅ Correct |
| `ConsultationIntakeForm.tsx` | `submit-consultation-intake` | ✅ Correct |
| `SellerResult.tsx` | `submit-seller` | ✅ Correct |
| `SelenaChatDrawer.tsx` | `selena-chat` (internal upsert) | ✅ Correct |
| `ReportViewer.tsx` | `get-report` (read only) | ✅ Correct |
| `PriorityCallModal.tsx` | `create-handoff` | ✅ Correct |
| `logEvent.ts` | `selena-log-event` | ✅ Correct |

### Event Logging Still Works

The `event_log` table keeps its public INSERT policy, so:
- `logEvent()` from the frontend still works
- Analytics telemetry is unaffected
- No code changes needed

---

## POST-MIGRATION VERIFICATION

After running the migration, verify security with these tests:

### Test 1: Direct Insert Blocked (Should Fail)
```javascript
// From browser console - should return error
const { error } = await supabase.from('lead_profiles').insert({
  email: 'attacker@evil.com',
  name: 'Hacker'
});
console.log(error); // Should show RLS violation
```

### Test 2: Direct Update Blocked (Should Fail)
```javascript
// From browser console - should return error
const { error } = await supabase.from('lead_profiles')
  .update({ email: 'stolen@evil.com' })
  .eq('id', 'some-uuid');
console.log(error); // Should show RLS violation
```

### Test 3: Edge Function Still Works (Should Succeed)
```javascript
// This should still work - goes through edge function
const { data } = await supabase.functions.invoke('upsert-lead-profile', {
  body: { email: 'legit@test.com', name: 'Test User' }
});
console.log(data); // { success: true, lead_id: '...' }
```

### Test 4: Telemetry Still Works (Should Succeed)
```javascript
// This should still work - event_log keeps its public policy
const { error } = await supabase.from('event_log').insert({
  session_id: 'test',
  event_type: 'test_event',
  event_payload: {}
});
console.log(error); // Should be null (success)
```

---

## SECURITY SCAN RESOLUTION

After implementing this migration, the security scan should show:

| Finding | Before | After |
|---------|--------|-------|
| "Customer Contact Information Could Be Stolen" | **CRITICAL** | **RESOLVED** |
| "RLS Policy Always True" on lead_profiles | **HIGH** | **RESOLVED** |
| "RLS Policy Always True" on lead_reports | **HIGH** | **RESOLVED** |
| "RLS Policy Always True" on seller_leads | **HIGH** | **RESOLVED** |
| "RLS Policy Always True" on lead_handoffs | **HIGH** | **RESOLVED** |

---

## EXECUTION ORDER

1. **Run the SQL migration** using the database migration tool
2. **Wait for confirmation** that migration completed successfully
3. **Run verification tests** (Tests 1-4 above)
4. **Trigger new security scan** to confirm findings resolved
5. **Monitor edge function logs** for the next 24 hours to ensure normal operation

---

## RISK MITIGATION

### Rollback Plan

If any edge function stops working after migration:

```sql
-- Emergency rollback (DO NOT RUN unless issues arise)
-- Re-enable public INSERT on lead_profiles
CREATE POLICY "Edge function insert backup" ON public.lead_profiles
  FOR INSERT TO anon WITH CHECK (true);

-- Re-enable public UPDATE on lead_profiles  
CREATE POLICY "Edge function update backup" ON public.lead_profiles
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
```

**Note:** This rollback should NOT be needed because edge functions use `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS entirely.

### Why This Is Safe

1. **All edge functions already use service role** - verified in audit above
2. **Service role bypasses RLS** - documented Supabase behavior
3. **No frontend direct writes exist** - all go through edge functions
4. **Telemetry is preserved** - event_log policy unchanged

---

## SUCCESS CRITERIA

After implementation:

1. ✅ No public INSERT/UPDATE policies on `lead_profiles`, `lead_reports`, `seller_leads`, `lead_handoffs`
2. ✅ All edge functions continue operating normally
3. ✅ Security scan shows "Customer Contact Information" finding as RESOLVED
4. ✅ Event logging (telemetry) continues working
5. ✅ Form submissions through edge functions work without issues

This is the "Oasis Shield" - a deny-by-default security architecture where the database is locked down and all mutations flow through validated, rate-limited edge functions.
