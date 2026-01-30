
# Phase 2: Complete the Oasis Shield
## Adding Read Protection (SELECT Denial)

---

## THE ISSUE

The Phase 1 migration successfully removed INSERT/UPDATE policies, but Supabase's RLS behavior is:
- **With no policies**: Writes are denied, but reads may still be allowed
- **We need**: Explicit denial of SELECT for public access

---

## SQL MIGRATION (Phase 2)

```sql
-- ============================================
-- OASIS SHIELD PHASE 2: Read Protection
-- ============================================

-- ====================
-- DENY PUBLIC SELECT ACCESS
-- ====================
-- These tables should ONLY be readable by Edge Functions (service role)
-- No public/anon users should be able to SELECT from them

-- The simplest approach: We DON'T need to add policies.
-- RLS is already enabled and with NO policies, authenticated/anon 
-- users cannot read. But the scan is detecting the tables ARE readable.

-- The fix: Create explicit DENY policies using FALSE condition
-- This ensures zero public read access.

-- 1. LEAD_PROFILES - No public read
CREATE POLICY "Deny public read on lead_profiles" 
  ON public.lead_profiles 
  FOR SELECT 
  TO anon, authenticated 
  USING (false);

-- 2. SELLER_LEADS - No public read
CREATE POLICY "Deny public read on seller_leads" 
  ON public.seller_leads 
  FOR SELECT 
  TO anon, authenticated 
  USING (false);

-- 3. LEAD_REPORTS - No public read
CREATE POLICY "Deny public read on lead_reports" 
  ON public.lead_reports 
  FOR SELECT 
  TO anon, authenticated 
  USING (false);

-- 4. LEAD_HANDOFFS - No public read
CREATE POLICY "Deny public read on lead_handoffs" 
  ON public.lead_handoffs 
  FOR SELECT 
  TO anon, authenticated 
  USING (false);

-- 5. EVENT_LOG - Deny read (keep INSERT policy for telemetry)
CREATE POLICY "Deny public read on event_log" 
  ON public.event_log 
  FOR SELECT 
  TO anon, authenticated 
  USING (false);
```

---

## WHY THIS WORKS

1. **Service Role Bypasses RLS**: Edge Functions using `SUPABASE_SERVICE_ROLE_KEY` completely bypass these policies - they can still read and write.

2. **Explicit Denial**: The `USING (false)` condition means no row will ever match for public/authenticated users.

3. **Telemetry Preserved**: The `event_log` INSERT policy we kept allows frontend telemetry to write, but reading is now blocked.

---

## ARCHITECTURE AFTER PHASE 2

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        PUBLIC INTERNET                              │
│                                                                     │
│   ❌ Direct DB Access (PostgREST)                                   │
│      - lead_profiles: SELECT ❌ | INSERT ❌ | UPDATE ❌              │
│      - lead_reports:  SELECT ❌ | INSERT ❌ | UPDATE ❌              │
│      - seller_leads:  SELECT ❌ | INSERT ❌ | UPDATE ❌              │
│      - lead_handoffs: SELECT ❌ | INSERT ❌ | UPDATE ❌              │
│      - event_log:     SELECT ❌ | INSERT ✅ (telemetry) | UPDATE ❌  │
│                                                                     │
│   ✅ Edge Function Endpoints (Service Role bypasses ALL RLS)        │
│      └─── Full read/write access to all tables                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## EXPECTED SCAN RESULTS AFTER PHASE 2

| Finding | Before | After |
|---------|--------|-------|
| Customer Contact Information Exposed | **ERROR** | **RESOLVED** |
| Seller Contact Information Available | **ERROR** | **RESOLVED** |
| Private Conversation Summaries Leaked | **ERROR** | **RESOLVED** |
| Confidential Lead Reports Accessible | **ERROR** | **RESOLVED** |
| User Activity Tracking Visible | **WARN** | **RESOLVED** |
| RLS Enabled No Policy | **INFO** | **RESOLVED** (policies now exist) |
| RLS Policy Always True (event_log INSERT) | **WARN** | Remains (intentional) |

---

## VERIFICATION TESTS

After migration:

```javascript
// Test 1: Direct SELECT blocked (should return empty array)
const { data, error } = await supabase.from('lead_profiles').select('*');
console.log(data); // [] empty - RLS blocks it
console.log(error); // null (no error, just no access)

// Test 2: Edge function can still read (via service role)
const { data } = await supabase.functions.invoke('get-report', {
  body: { report_id: 'some-id' }
});
console.log(data); // Works - service role bypasses RLS

// Test 3: Telemetry INSERT still works
const { error } = await supabase.from('event_log').insert({
  session_id: 'test',
  event_type: 'test'
});
console.log(error); // null - INSERT policy allows it
```

---

## IMPLEMENTATION

Run the Phase 2 SQL migration to add explicit SELECT denial policies to all sensitive tables.

This completes the **Oasis Shield** - a fully locked-down database where:
- All public reads are blocked
- All public writes are blocked
- Only Edge Functions (with service role) can access data
- Telemetry (event_log INSERT) remains functional
