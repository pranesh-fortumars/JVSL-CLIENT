/*
# Customer and admin accounts with role-based data access (re-runnable)

Admins are listed in the admin_emails table (step 2).
- Existing accounts on that list are promoted to admin when this runs.
- New sign-ups on that list become admin automatically.
*/

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- 2. Admin email list (single place to manage admins)
CREATE TABLE IF NOT EXISTS admin_emails (
  email text PRIMARY KEY
);

ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;  -- no policies: website cannot read or change it
REVOKE ALL ON admin_emails FROM anon, authenticated;

INSERT INTO admin_emails (email)
VALUES ('jvlsd@gmail.com')
ON CONFLICT (email) DO NOTHING;
-- To add another admin later:
-- INSERT INTO admin_emails (email) VALUES ('other@example.com') ON CONFLICT DO NOTHING;

-- 3. Trigger: every new sign-up gets a profile; listed emails become admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'full_name',
    CASE WHEN EXISTS (
           SELECT 1 FROM public.admin_emails a
           WHERE lower(a.email) = lower(COALESCE(NEW.email, ''))
         ) THEN 'admin' ELSE 'customer' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 5. Orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid();
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders (user_id);

REVOKE SELECT, UPDATE, DELETE ON orders FROM anon;
REVOKE SELECT, UPDATE, DELETE ON survey_submissions FROM anon;
REVOKE SELECT, UPDATE, DELETE ON enquiries FROM anon;
REVOKE INSERT, UPDATE, DELETE ON products FROM anon;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;

DROP POLICY IF EXISTS "public_orders_select" ON orders;
DROP POLICY IF EXISTS "public_orders_insert" ON orders;
DROP POLICY IF EXISTS "public_orders_update" ON orders;
DROP POLICY IF EXISTS "public_orders_delete" ON orders;
DROP POLICY IF EXISTS "orders_insert_guest_or_own" ON orders;
DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_select_admin" ON orders;
DROP POLICY IF EXISTS "orders_update_admin" ON orders;
DROP POLICY IF EXISTS "orders_delete_admin" ON orders;

CREATE POLICY "orders_insert_guest_or_own" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "orders_select_admin" ON orders FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "orders_delete_admin" ON orders FOR DELETE
  TO authenticated USING (public.is_admin());

-- 6. Survey submissions
DROP POLICY IF EXISTS "public_survey_select" ON survey_submissions;
DROP POLICY IF EXISTS "public_survey_update" ON survey_submissions;
DROP POLICY IF EXISTS "public_survey_delete" ON survey_submissions;
DROP POLICY IF EXISTS "survey_select_admin" ON survey_submissions;
DROP POLICY IF EXISTS "survey_update_admin" ON survey_submissions;
DROP POLICY IF EXISTS "survey_delete_admin" ON survey_submissions;

CREATE POLICY "survey_select_admin" ON survey_submissions FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "survey_update_admin" ON survey_submissions FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "survey_delete_admin" ON survey_submissions FOR DELETE
  TO authenticated USING (public.is_admin());

-- 7. Enquiries
DROP POLICY IF EXISTS "public_enquiries_select" ON enquiries;
DROP POLICY IF EXISTS "public_enquiries_update" ON enquiries;
DROP POLICY IF EXISTS "public_enquiries_delete" ON enquiries;
DROP POLICY IF EXISTS "enquiries_select_admin" ON enquiries;
DROP POLICY IF EXISTS "enquiries_update_admin" ON enquiries;
DROP POLICY IF EXISTS "enquiries_delete_admin" ON enquiries;

CREATE POLICY "enquiries_select_admin" ON enquiries FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "enquiries_update_admin" ON enquiries FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "enquiries_delete_admin" ON enquiries FOR DELETE
  TO authenticated USING (public.is_admin());

-- 8. Products
DROP POLICY IF EXISTS "public_products_insert" ON products;
DROP POLICY IF EXISTS "public_products_update" ON products;
DROP POLICY IF EXISTS "public_products_delete" ON products;
DROP POLICY IF EXISTS "products_insert_admin" ON products;
DROP POLICY IF EXISTS "products_update_admin" ON products;
DROP POLICY IF EXISTS "products_delete_admin" ON products;

CREATE POLICY "products_insert_admin" ON products FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "products_update_admin" ON products FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "products_delete_admin" ON products FOR DELETE
  TO authenticated USING (public.is_admin());

-- 9. Create or repair profiles for ALL existing accounts,
--    and set role = admin for emails on the admin list
INSERT INTO profiles (id, email, full_name, role)
SELECT
  u.id,
  COALESCE(u.email, ''),
  u.raw_user_meta_data->>'full_name',
  CASE WHEN EXISTS (
         SELECT 1 FROM admin_emails a WHERE lower(a.email) = lower(COALESCE(u.email, ''))
       ) THEN 'admin' ELSE 'customer' END
FROM auth.users u
ON CONFLICT (id) DO UPDATE
SET role = 'admin'
WHERE EXISTS (
  SELECT 1 FROM admin_emails a WHERE lower(a.email) = lower(profiles.email)
);

-- 10. Check result: your admin row should show role = admin
SELECT u.email AS auth_email, p.email AS profile_email, p.role
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id;