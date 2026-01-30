-- ============================================
-- OASIS SHIELD PHASE 2: Read Protection
-- ============================================

-- ====================
-- DENY PUBLIC SELECT ACCESS
-- ====================
-- These tables should ONLY be readable by Edge Functions (service role)
-- No public/anon users should be able to SELECT from them

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