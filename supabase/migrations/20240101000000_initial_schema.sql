-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (Профили пользователей)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email TEXT,
  full_name TEXT,
  child_name TEXT,
  age INTEGER,
  city TEXT,
  phone TEXT,
  consent_terms BOOLEAN DEFAULT false,
  consent_privacy BOOLEAN DEFAULT false,
  consent_personal_data BOOLEAN DEFAULT false,
  consent_given_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONTESTS TABLE (Конкурсы)
-- =====================================================
CREATE TABLE IF NOT EXISTS contests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'finished')),
  audiences TEXT[] NOT NULL DEFAULT ARRAY['all']::TEXT[] CHECK (audiences <@ ARRAY['kids_u7','school','students','adults','all']::TEXT[]),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- CONTEST PHOTOS TABLE (Работы участников)
-- =====================================================
CREATE TABLE IF NOT EXISTS contest_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'participant' CHECK (category IN ('winner', 'participant')),
  name TEXT NOT NULL,
  surname_initial TEXT NOT NULL,
  age INTEGER NOT NULL,
  city TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- NEWS TABLE (Новости)
-- =====================================================
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FAQ TABLE (Часто задаваемые вопросы)
-- =====================================================
CREATE TABLE IF NOT EXISTS faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- NOTE: profiles contain personal data. No public read access.
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id AND role = 'user');

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (
      SELECT p.role FROM profiles p WHERE p.id = auth.uid()
    )
  );

-- CONTESTS POLICIES
CREATE POLICY "Contests are viewable by everyone"
  ON contests FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert contests"
  ON contests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update contests"
  ON contests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete contests"
  ON contests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- CONTEST PHOTOS POLICIES
CREATE POLICY "Approved photos are viewable by everyone"
  ON contest_photos FOR SELECT
  USING (approved = true OR auth.uid() = uploaded_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can upload photos"
  ON contest_photos FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own photos"
  ON contest_photos FOR UPDATE
  USING (auth.uid() = uploaded_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete photos"
  ON contest_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- NEWS POLICIES
CREATE POLICY "News are viewable by everyone"
  ON news FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage news"
  ON news FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- FAQ POLICIES
CREATE POLICY "FAQ is viewable by everyone"
  ON faq FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage FAQ"
  ON faq FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SAMPLE DATA (Optional - удалите если не нужно)
-- =====================================================

-- Insert sample FAQ
INSERT INTO faq (question, answer, "order") VALUES
  ('Как зарегистрироваться на платформе?', 'Нажмите кнопку "Регистрация" в верхнем меню и заполните необходимые данные.', 1),
  ('Как принять участие в конкурсе?', 'Выберите активный конкурс, загрузите свою работу и заполните информацию об участнике.', 2),
  ('Когда будут объявлены результаты?', 'Результаты объявляются в течение 2 недель после окончания конкурса.', 3);

-- Insert sample news
INSERT INTO news (title, content) VALUES
  ('Добро пожаловать!', 'Мы рады приветствовать вас на платформе Центра дополнительного образования "Вектор".');
