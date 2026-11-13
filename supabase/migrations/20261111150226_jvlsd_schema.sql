/*
# JVLSD Website Schema

1. New Tables
- `products` — Fresh Daily product catalogue (vegetables, fruits, milk). Columns:
  id, name, category (vegetable|fruit|milk), image_url, unit (e.g. kg, bunch, litre),
  available_today (bool — drives same-day grey-out), display_order, created_at.
- `enquiries` — Contact/business enquiry form submissions. Columns:
  id, name, email, phone, subject, message, created_at.
- `survey_submissions` — Fresh Daily customer survey responses. Columns:
  id, customer_name, mobile, address, family_members, delivery_preference,
  selections (jsonb — vegetables/fruits/milk picks with qty + frequency),
  notes, created_at.
- `orders` — Fresh Daily orders (same-day or next-day pre-order). Columns:
  id, customer_name, mobile, address, mode (same_day|next_day),
  items (jsonb), expected_delivery (date), notes, created_at.

2. Security
- Enable RLS on all tables.
- Grant CRUD to anon + authenticated (public, no-auth website).
- All policies use USING (true) / WITH CHECK (true) because this is a
  intentionally public single-tenant website with no sign-in.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('vegetable','fruit','milk')),
  image_url text,
  unit text NOT NULL DEFAULT 'kg',
  available_today boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS survey_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  mobile text NOT NULL,
  address text NOT NULL,
  family_members int NOT NULL DEFAULT 1,
  delivery_preference text,
  selections jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  mobile text NOT NULL,
  address text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('same_day','next_day')),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  expected_delivery date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON enquiries TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON survey_submissions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO anon, authenticated;

DROP POLICY IF EXISTS "public_products_select" ON products;
CREATE POLICY "public_products_select" ON products FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_products_insert" ON products;
CREATE POLICY "public_products_insert" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_products_update" ON products;
CREATE POLICY "public_products_update" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_products_delete" ON products;
CREATE POLICY "public_products_delete" ON products FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_enquiries_select" ON enquiries;
CREATE POLICY "public_enquiries_select" ON enquiries FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_enquiries_insert" ON enquiries;
CREATE POLICY "public_enquiries_insert" ON enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_enquiries_update" ON enquiries;
CREATE POLICY "public_enquiries_update" ON enquiries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_enquiries_delete" ON enquiries;
CREATE POLICY "public_enquiries_delete" ON enquiries FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_survey_select" ON survey_submissions;
CREATE POLICY "public_survey_select" ON survey_submissions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_survey_insert" ON survey_submissions;
CREATE POLICY "public_survey_insert" ON survey_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_survey_update" ON survey_submissions;
CREATE POLICY "public_survey_update" ON survey_submissions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_survey_delete" ON survey_submissions;
CREATE POLICY "public_survey_delete" ON survey_submissions FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_orders_select" ON orders;
CREATE POLICY "public_orders_select" ON orders FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_orders_insert" ON orders;
CREATE POLICY "public_orders_insert" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_orders_update" ON orders;
CREATE POLICY "public_orders_update" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_orders_delete" ON orders;
CREATE POLICY "public_orders_delete" ON orders FOR DELETE
  TO anon, authenticated USING (true);
