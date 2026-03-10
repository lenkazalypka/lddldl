-- V11: tighten contest_photos permissions for moderated workflow

-- Only admins can insert/update contest photos (works are added from email by admins)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contest_photos' AND policyname = 'Authenticated users can upload photos'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can upload photos" ON public.contest_photos';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contest_photos' AND policyname = 'Users can update their own photos'
  ) THEN
    EXECUTE 'DROP POLICY "Users can update their own photos" ON public.contest_photos';
  END IF;
END $$;

CREATE POLICY IF NOT EXISTS "Only admins can insert works"
  ON public.contest_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Only admins can update works"
  ON public.contest_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
