-- =====================================================================
-- Audit Fix: Missing DB Indexes
-- CRIT-05: seller_leads has zero indexes (full table scans on all queries)
-- PERF-01: session_snapshots missing session_id index (snapshot restore queries by session_id)
-- =====================================================================

-- seller_leads: Add email, created_at, session_id indexes
-- All three are queried in deduplication, recent-leads admin views, and session continuity flows
CREATE INDEX IF NOT EXISTS idx_seller_leads_email
  ON public.seller_leads(email);

CREATE INDEX IF NOT EXISTS idx_seller_leads_created_at
  ON public.seller_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_seller_leads_session_id
  ON public.seller_leads(session_id);

-- session_snapshots: Add session_id index
-- V2Layout restore path queries by session_id before lead_id is known.
-- Without this index, every anonymous page load does a full table scan.
CREATE INDEX IF NOT EXISTS idx_session_snapshots_session_id
  ON public.session_snapshots(session_id);
