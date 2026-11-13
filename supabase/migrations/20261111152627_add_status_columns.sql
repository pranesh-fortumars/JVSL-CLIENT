/*
# Add status columns for admin management

1. Modified Tables
- `orders` — add `status` text column (new | confirmed | delivered | cancelled), default 'new'.
- `enquiries` — add `status` text column (new | resolved), default 'new'.
- `survey_submissions` — add `status` text column (new | reviewed), default 'new'.

2. Security
- No RLS policy changes. Existing anon,authenticated CRUD policies already cover UPDATE.
- No new grants needed: existing table-level UPDATE grants cover the new columns.
*/

ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new'
  CHECK (status IN ('new','confirmed','delivered','cancelled'));

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new'
  CHECK (status IN ('new','resolved'));

ALTER TABLE survey_submissions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new'
  CHECK (status IN ('new','reviewed'));
