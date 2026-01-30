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