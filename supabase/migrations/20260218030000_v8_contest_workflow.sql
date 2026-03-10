-- V8: contest workflow fields (draft/active/closed/results) + safer defaults

ALTER TABLE contests
  ADD COLUMN IF NOT EXISTS phase TEXT NOT NULL DEFAULT 'draft'
    CHECK (phase IN ('draft','active','closed','results')),
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS results_text TEXT;

-- Optional: when results are published, phase can be set to 'results'
-- The app can keep using dates too; this gives you a manual override.

