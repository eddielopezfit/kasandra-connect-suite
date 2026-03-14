-- Migration: create guide_queue table
-- Purpose: stores AI-generated guides pending Kasandra's review
-- NEVER auto-publishes — status must be manually changed to 'published'

CREATE TABLE IF NOT EXISTS guide_queue (
  id uuid primary key default gen_random_uuid(),
  guide_id text unique not null,
  topic text not null,
  title_en text not null,
  title_es text not null,
  content_json jsonb not null,
  research_context text,
  status text default 'pending_review'
    check (status in ('pending_review', 'approved', 'rejected', 'published')),
  generated_at timestamptz default now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  notes text
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_guide_queue_status
  ON guide_queue(status);

CREATE INDEX IF NOT EXISTS idx_guide_queue_generated
  ON guide_queue(generated_at desc);

CREATE INDEX IF NOT EXISTS idx_guide_queue_guide_id
  ON guide_queue(guide_id);

-- Comment
COMMENT ON TABLE guide_queue IS
  'AI-generated guide drafts pending Kasandra Prieto review. Never auto-publish — always requires manual approval.';

COMMENT ON COLUMN guide_queue.content_json IS
  'Full GuideContentData JSON (title, titleEs, intro, sections, faqItems). Matches src/data/guides/types.ts structure.';

COMMENT ON COLUMN guide_queue.status IS
  'pending_review = awaiting Kasandra review | approved = approved not yet live | rejected = rejected | published = live on site';
