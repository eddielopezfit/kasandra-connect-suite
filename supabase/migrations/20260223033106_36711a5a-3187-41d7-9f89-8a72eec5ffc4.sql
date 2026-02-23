-- Create guide-assets bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('guide-assets', 'guide-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read ONLY for expected guide asset paths (images only)
CREATE POLICY "Guide assets public read (guides folder only)"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'guide-assets'
  AND name LIKE 'guides/%'
  AND (name LIKE '%.jpg' OR name LIKE '%.jpeg' OR name LIKE '%.png' OR name LIKE '%.webp')
);