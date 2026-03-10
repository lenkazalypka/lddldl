-- V5: contest moderation + contest submission email + results publishing

-- Add fields to contests
ALTER TABLE contests
  ADD COLUMN IF NOT EXISTS submission_email TEXT,
  ADD COLUMN IF NOT EXISTS results_published BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS results_date TIMESTAMP WITH TIME ZONE;

-- Add fields to contest_photos (works)
ALTER TABLE contest_photos
  ADD COLUMN IF NOT EXISTS work_title TEXT,
  ADD COLUMN IF NOT EXISTS place INTEGER,
  ADD COLUMN IF NOT EXISTS nomination TEXT;

-- Tighten RLS for contest_photos: only admins can insert/update/delete.
-- Public can only view approved works.

DROP POLICY IF EXISTS "Approved photos are viewable by everyone" ON contest_photos;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON contest_photos;
DROP POLICY IF EXISTS "Users can update their own photos" ON contest_photos;
DROP POLICY IF EXISTS "Only admins can delete photos" ON contest_photos;

CREATE POLICY "Approved works are viewable by everyone"
  ON contest_photos FOR SELECT
  USING (approved = true);

CREATE POLICY "Only admins can insert works"
  ON contest_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update works"
  ON contest_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete works"
  ON contest_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
