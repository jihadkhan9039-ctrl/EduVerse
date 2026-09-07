-- EduVerse Initial Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  thumbnail TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail TEXT,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_price NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  student_count INT NOT NULL DEFAULT 0,
  class_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  thumbnail TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHAPTERS
-- ============================================================
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  thumbnail TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LESSONS
-- ============================================================
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  youtube_video_id TEXT, -- stored as ID only
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  duration_minutes INT,
  comments_enabled BOOLEAN NOT NULL DEFAULT true,
  reactions_enabled BOOLEAN NOT NULL DEFAULT true,
  published BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LESSON RESOURCES (Google Drive lecture sheets)
-- ============================================================
CREATE TABLE public.lesson_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  google_drive_url TEXT NOT NULL,
  show_resource BOOLEAN NOT NULL DEFAULT true,
  allow_download BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ENROLLMENTS
-- ============================================================
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'purchase' CHECK (source IN ('purchase', 'token', 'admin', 'free')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- ============================================================
-- ACCESS TOKENS
-- ============================================================
CREATE TABLE public.access_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  usage_limit INT NOT NULL DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'used')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LESSON REACTIONS
-- ============================================================
CREATE TABLE public.lesson_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'helpful')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lesson_id, user_id)
);

-- ============================================================
-- LESSON COMMENTS
-- ============================================================
CREATE TABLE public.lesson_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.lesson_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LESSON VIEWS
-- ============================================================
CREATE TABLE public.lesson_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lesson_id, user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_courses_category ON public.courses(category_id);
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_subjects_course ON public.subjects(course_id);
CREATE INDEX idx_chapters_subject ON public.chapters(subject_id);
CREATE INDEX idx_lessons_chapter ON public.lessons(chapter_id);
CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX idx_access_tokens_token ON public.access_tokens(token);
CREATE INDEX idx_access_tokens_course ON public.access_tokens(course_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_lesson_reactions_lesson ON public.lesson_reactions(lesson_id);
CREATE INDEX idx_lesson_comments_lesson ON public.lesson_comments(lesson_id);
CREATE INDEX idx_lesson_views_lesson ON public.lesson_views(lesson_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER chapters_updated_at BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER lesson_comments_updated_at BEFORE UPDATE ON public.lesson_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_views ENABLE ROW LEVEL SECURITY;

-- Helper: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is_instructor_or_admin
CREATE OR REPLACE FUNCTION public.is_instructor_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'instructor')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is_enrolled
CREATE OR REPLACE FUNCTION public.is_enrolled(p_course_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = auth.uid() AND course_id = p_course_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- CATEGORIES
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- COURSES
CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT USING (status = 'published' OR public.is_admin() OR instructor_id = auth.uid());
CREATE POLICY "Admins and instructors can manage courses" ON public.courses
  FOR ALL USING (public.is_admin() OR instructor_id = auth.uid());

-- SUBJECTS
CREATE POLICY "Anyone can view subjects of published courses" ON public.subjects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND (c.status = 'published' OR public.is_admin() OR c.instructor_id = auth.uid())
    )
  );
CREATE POLICY "Admins and instructors can manage subjects" ON public.subjects
  FOR ALL USING (public.is_admin() OR public.is_instructor_or_admin());

-- CHAPTERS
CREATE POLICY "Anyone can view chapters of published courses" ON public.chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subjects s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = subject_id AND (c.status = 'published' OR public.is_admin() OR c.instructor_id = auth.uid())
    )
  );
CREATE POLICY "Admins and instructors can manage chapters" ON public.chapters
  FOR ALL USING (public.is_admin() OR public.is_instructor_or_admin());

-- LESSONS
CREATE POLICY "Anyone can view published lessons of published courses" ON public.lessons
  FOR SELECT USING (
    published = true AND EXISTS (
      SELECT 1 FROM public.chapters ch
      JOIN public.subjects s ON s.id = ch.subject_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE ch.id = chapter_id AND (c.status = 'published' OR public.is_admin() OR c.instructor_id = auth.uid())
    )
  );
CREATE POLICY "Admins and instructors can manage lessons" ON public.lessons
  FOR ALL USING (public.is_admin() OR public.is_instructor_or_admin());

-- LESSON RESOURCES (only enrolled or admin)
CREATE POLICY "Enrolled users can view resources" ON public.lesson_resources
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.chapters ch ON ch.id = l.chapter_id
      JOIN public.subjects s ON s.id = ch.subject_id
      JOIN public.enrollments e ON e.course_id = s.course_id
      WHERE l.id = lesson_id AND e.user_id = auth.uid()
    )
  );
CREATE POLICY "Admins can manage resources" ON public.lesson_resources
  FOR ALL USING (public.is_admin());

-- ENROLLMENTS
CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can insert own enrollment via token/purchase" ON public.enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins can manage enrollments" ON public.enrollments
  FOR ALL USING (public.is_admin());

-- ACCESS TOKENS (students can only redeem, not read freely)
CREATE POLICY "Admins can manage tokens" ON public.access_tokens
  FOR ALL USING (public.is_admin());
CREATE POLICY "Authenticated users can read active tokens for redemption check" ON public.access_tokens
  FOR SELECT USING (auth.uid() IS NOT NULL AND status = 'active');

-- ORDERS
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL USING (public.is_admin());

-- LESSON REACTIONS
CREATE POLICY "Enrolled users can view reactions" ON public.lesson_reactions
  FOR SELECT USING (true);
CREATE POLICY "Enrolled users can manage own reactions" ON public.lesson_reactions
  FOR ALL USING (
    user_id = auth.uid() AND (
      public.is_admin() OR EXISTS (
        SELECT 1 FROM public.lessons l
        JOIN public.chapters ch ON ch.id = l.chapter_id
        JOIN public.subjects s ON s.id = ch.subject_id
        JOIN public.enrollments e ON e.course_id = s.course_id
        WHERE l.id = lesson_id AND e.user_id = auth.uid()
      )
    )
  );

-- LESSON COMMENTS
CREATE POLICY "Enrolled users can view visible comments" ON public.lesson_comments
  FOR SELECT USING (status = 'visible' OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Enrolled users can insert comments" ON public.lesson_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (
      public.is_admin() OR EXISTS (
        SELECT 1 FROM public.lessons l
        JOIN public.chapters ch ON ch.id = l.chapter_id
        JOIN public.subjects s ON s.id = ch.subject_id
        JOIN public.enrollments e ON e.course_id = s.course_id
        WHERE l.id = lesson_id AND e.user_id = auth.uid() AND l.comments_enabled = true
      )
    )
  );
CREATE POLICY "Users can update own comments" ON public.lesson_comments
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can delete own comments" ON public.lesson_comments
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- LESSON VIEWS
CREATE POLICY "Users can manage own views" ON public.lesson_views
  FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- ============================================================
-- SEED DATA (demo)
-- ============================================================
-- Note: After running this migration, create an admin user via Auth
-- then update profiles set role = 'admin' where email = 'your@email.com';
