-- Fixes for deployment:
-- 1) Add helper function is_admin() to avoid RLS recursion and simplify admin checks.
-- 2) Harden profiles against role escalation (revoke UPDATE(role) for anon/authenticated).
-- 3) Add missing tables: courses, course_applications + RLS policies.
--
-- Run in Supabase SQL editor OR as a migration.

-- =====================================================
-- 1) Admin helper (bypasses RLS safely)
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin(p_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
SET row_security = off
AS $$
  select exists (
    select 1
    from public.profiles
    where id = p_uid
      and role = 'admin'
  );
$$;

-- Allow anon/authenticated to call; function itself is safe (returns boolean only).
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon, authenticated;

-- =====================================================
-- 2) Profiles: prevent role escalation + simplify policies
-- =====================================================

-- Column-level privilege hardening: users must not be able to update their own role.
-- NOTE: role changes should be done only via SQL (postgres) or service_role on the server.
REVOKE UPDATE (role) ON TABLE public.profiles FROM anon, authenticated;

-- Replace policies to remove self-referential subqueries (RLS recursion risk).
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- SELECT: user sees self; admins see all
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- INSERT: user can create only their own profile, only as 'user'
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id AND role = 'user');

-- UPDATE: user can update only their own profile (role column is protected by REVOKE above)
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 3) Missing tables: courses + course_applications
-- =====================================================

CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  format text NOT NULL DEFAULT 'online' CHECK (format IN ('online','offline')),
  formats text[] NOT NULL DEFAULT ARRAY[]::text[],
  price_type text NOT NULL DEFAULT 'free' CHECK (price_type IN ('free','paid')),
  price numeric NULL,
  location text NULL,
  starts_at timestamptz NULL,
  ends_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NULL,
  city text NULL,
  selected_format text NOT NULL CHECK (selected_format IN ('online','offline')),
  comment text NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','done')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_applications ENABLE ROW LEVEL SECURITY;

-- Courses policies
DROP POLICY IF EXISTS "Courses published are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Admins can view all courses" ON public.courses;
DROP POLICY IF EXISTS "Only admins can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Only admins can update courses" ON public.courses;
DROP POLICY IF EXISTS "Only admins can delete courses" ON public.courses;

-- Everyone can view published; admins can view all
CREATE POLICY "Courses published are viewable by everyone"
  ON public.courses FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can view all courses"
  ON public.courses FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can insert courses"
  ON public.courses FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update courses"
  ON public.courses FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete courses"
  ON public.courses FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Course applications policies
DROP POLICY IF EXISTS "Anyone can create course application" ON public.course_applications;
DROP POLICY IF EXISTS "Admins can view course applications" ON public.course_applications;
DROP POLICY IF EXISTS "Admins can update course applications" ON public.course_applications;
DROP POLICY IF EXISTS "Admins can delete course applications" ON public.course_applications;

-- Anyone (even anon) can submit an application
CREATE POLICY "Anyone can create course application"
  ON public.course_applications FOR INSERT
  WITH CHECK (true);

-- Only admins can read/manage applications
CREATE POLICY "Admins can view course applications"
  ON public.course_applications FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update course applications"
  ON public.course_applications FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete course applications"
  ON public.course_applications FOR DELETE
  USING (public.is_admin(auth.uid()));

-- =====================================================
-- 4) Optional: switch other admin policies to is_admin() (safer + faster)
-- =====================================================

-- contests
DROP POLICY IF EXISTS "Only admins can insert contests" ON public.contests;
DROP POLICY IF EXISTS "Only admins can update contests" ON public.contests;
DROP POLICY IF EXISTS "Only admins can delete contests" ON public.contests;

CREATE POLICY "Only admins can insert contests"
  ON public.contests FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update contests"
  ON public.contests FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete contests"
  ON public.contests FOR DELETE
  USING (public.is_admin(auth.uid()));

-- contest_photos
DROP POLICY IF EXISTS "Only admins can approve photos" ON public.contest_photos;

CREATE POLICY "Only admins can approve photos"
  ON public.contest_photos FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- news
DROP POLICY IF EXISTS "Only admins can insert news" ON public.news;
DROP POLICY IF EXISTS "Only admins can update news" ON public.news;
DROP POLICY IF EXISTS "Only admins can delete news" ON public.news;

CREATE POLICY "Only admins can insert news"
  ON public.news FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update news"
  ON public.news FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete news"
  ON public.news FOR DELETE
  USING (public.is_admin(auth.uid()));

-- faq
DROP POLICY IF EXISTS "Only admins can insert faq" ON public.faq;
DROP POLICY IF EXISTS "Only admins can update faq" ON public.faq;
DROP POLICY IF EXISTS "Only admins can delete faq" ON public.faq;

CREATE POLICY "Only admins can insert faq"
  ON public.faq FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update faq"
  ON public.faq FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete faq"
  ON public.faq FOR DELETE
  USING (public.is_admin(auth.uid()));
