-- ============================================================
-- Teneffüs — Initial Schema Migration
-- ============================================================

-- Enable the pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- profiles: one row per auth.users entry, stores role + display info
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY,  -- matches auth.users.id
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_profiles_user FOREIGN KEY (id)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

-- students: extended profile data for students
CREATE TABLE IF NOT EXISTS public.students (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID NOT NULL UNIQUE,
  grade_level       TEXT,
  package_name      TEXT,
  remaining_lessons INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'active',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_students_profile FOREIGN KEY (profile_id)
    REFERENCES public.profiles (id) ON DELETE CASCADE
);

-- teachers: extended profile data for teachers
CREATE TABLE IF NOT EXISTS public.teachers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID NOT NULL UNIQUE,
  branch           TEXT,
  bio              TEXT,
  experience_years INTEGER,
  rating           NUMERIC(3, 2),
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_teachers_profile FOREIGN KEY (profile_id)
    REFERENCES public.profiles (id) ON DELETE CASCADE
);

-- teacher_assignments: links a teacher to a student
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  status     TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_ta_student FOREIGN KEY (student_id)
    REFERENCES public.students (id) ON DELETE CASCADE,
  CONSTRAINT fk_ta_teacher FOREIGN KEY (teacher_id)
    REFERENCES public.teachers (id) ON DELETE CASCADE
);

-- lessons: individual lesson sessions
CREATE TABLE IF NOT EXISTS public.lessons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL,
  teacher_id   UUID NOT NULL,
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ NOT NULL,
  subject      TEXT,
  status       TEXT NOT NULL DEFAULT 'scheduled'
                 CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  lesson_notes TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_lessons_student FOREIGN KEY (student_id)
    REFERENCES public.students (id) ON DELETE CASCADE,
  CONSTRAINT fk_lessons_teacher FOREIGN KEY (teacher_id)
    REFERENCES public.teachers (id) ON DELETE CASCADE
);

-- lesson_packages: purchased lesson bundles for a student
CREATE TABLE IF NOT EXISTS public.lesson_packages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL,
  package_name      TEXT NOT NULL,
  total_lessons     INTEGER NOT NULL,
  used_lessons      INTEGER NOT NULL DEFAULT 0,
  remaining_lessons INTEGER NOT NULL,
  starts_at         TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'active',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_lp_student FOREIGN KEY (student_id)
    REFERENCES public.students (id) ON DELETE CASCADE
);

-- messages: in-platform messaging between users
CREATE TABLE IF NOT EXISTS public.messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_profile_id   UUID NOT NULL,
  receiver_profile_id UUID NOT NULL,
  lesson_id           UUID,
  body                TEXT NOT NULL,
  flagged             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_profile_id)
    REFERENCES public.profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_profile_id)
    REFERENCES public.profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_lesson FOREIGN KEY (lesson_id)
    REFERENCES public.lessons (id) ON DELETE SET NULL
);

-- audit_logs: immutable event trail for compliance / moderation
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id UUID,
  action           TEXT NOT NULL,
  entity_type      TEXT NOT NULL,
  entity_id        UUID,
  metadata         JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_profile_id)
    REFERENCES public.profiles (id) ON DELETE SET NULL
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_packages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES — profiles
-- ============================================================

-- Users can read their own profile
CREATE POLICY "profiles: user reads own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles: user updates own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles: admin reads all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "profiles: admin updates all"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- RLS POLICIES — students
-- ============================================================

-- Students can read their own record
CREATE POLICY "students: student reads own"
  ON public.students FOR SELECT
  USING (profile_id = auth.uid());

-- Teachers can read records of their assigned students
CREATE POLICY "students: teacher reads assigned"
  ON public.students FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.teacher_assignments ta
      JOIN public.teachers t ON t.id = ta.teacher_id
      WHERE ta.student_id = students.id
        AND t.profile_id = auth.uid()
        AND ta.status = 'active'
    )
  );

-- Admins can read all student records
CREATE POLICY "students: admin reads all"
  ON public.students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can modify all student records
CREATE POLICY "students: admin all"
  ON public.students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- RLS POLICIES — teachers
-- ============================================================

-- Any authenticated user can read active teacher public info
CREATE POLICY "teachers: authenticated reads active"
  ON public.teachers FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND status = 'active'
  );

-- Admins can read all teacher records (including inactive)
CREATE POLICY "teachers: admin reads all"
  ON public.teachers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can modify all teacher records
CREATE POLICY "teachers: admin all"
  ON public.teachers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- RLS POLICIES — teacher_assignments
-- ============================================================

-- Students can see their own assignments
CREATE POLICY "teacher_assignments: student reads own"
  ON public.teacher_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = teacher_assignments.student_id
        AND s.profile_id = auth.uid()
    )
  );

-- Teachers can see their own assignments
CREATE POLICY "teacher_assignments: teacher reads own"
  ON public.teacher_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = teacher_assignments.teacher_id
        AND t.profile_id = auth.uid()
    )
  );

-- Admins can read and modify all assignments
CREATE POLICY "teacher_assignments: admin all"
  ON public.teacher_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- RLS POLICIES — lessons
-- ============================================================

-- Students can see their own lessons
CREATE POLICY "lessons: student reads own"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = lessons.student_id
        AND s.profile_id = auth.uid()
    )
  );

-- Teachers can see their own lessons
CREATE POLICY "lessons: teacher reads own"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = lessons.teacher_id
        AND t.profile_id = auth.uid()
    )
  );

-- Admins can read and modify all lessons
CREATE POLICY "lessons: admin all"
  ON public.lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- RLS POLICIES — lesson_packages
-- ============================================================

-- Students can see their own packages
CREATE POLICY "lesson_packages: student reads own"
  ON public.lesson_packages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = lesson_packages.student_id
        AND s.profile_id = auth.uid()
    )
  );

-- Admins can read and modify all packages
CREATE POLICY "lesson_packages: admin all"
  ON public.lesson_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- RLS POLICIES — messages
-- ============================================================

-- Sender can see messages they sent
CREATE POLICY "messages: sender reads own"
  ON public.messages FOR SELECT
  USING (sender_profile_id = auth.uid());

-- Receiver can see messages sent to them
CREATE POLICY "messages: receiver reads own"
  ON public.messages FOR SELECT
  USING (receiver_profile_id = auth.uid());

-- Sender can insert messages
CREATE POLICY "messages: sender inserts"
  ON public.messages FOR INSERT
  WITH CHECK (sender_profile_id = auth.uid());

-- Admins can read all messages (moderation)
CREATE POLICY "messages: admin reads all"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can modify messages (e.g. flag/unflag)
CREATE POLICY "messages: admin all"
  ON public.messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- RLS POLICIES — audit_logs
-- ============================================================

-- Only admins can read audit logs
CREATE POLICY "audit_logs: admin reads all"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- System/service role inserts only (no direct user insert)
-- Inserts should be performed via service_role key or trusted functions

-- ============================================================
-- VIEW — public_teacher_cards
-- Exposes only safe, public-facing teacher fields (no PII)
-- ============================================================

CREATE OR REPLACE VIEW public.public_teacher_cards AS
SELECT
  t.id,
  p.full_name,
  p.avatar_url,
  t.branch,
  t.bio,
  t.experience_years,
  t.rating,
  t.status
FROM public.teachers t
JOIN public.profiles p ON p.id = t.profile_id
WHERE t.status = 'active';

-- ============================================================
-- FUNCTION + TRIGGER — handle_new_user
-- Creates a profile row when a new user signs up via Supabase Auth
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INDEXES (performance)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_students_profile_id   ON public.students (profile_id);
CREATE INDEX IF NOT EXISTS idx_teachers_profile_id   ON public.teachers (profile_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student_id    ON public.lessons (student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id    ON public.lessons (teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_starts_at     ON public.lessons (starts_at);
CREATE INDEX IF NOT EXISTS idx_ta_student_id         ON public.teacher_assignments (student_id);
CREATE INDEX IF NOT EXISTS idx_ta_teacher_id         ON public.teacher_assignments (teacher_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender       ON public.messages (sender_profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver     ON public.messages (receiver_profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_flagged      ON public.messages (flagged) WHERE flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_audit_entity          ON public.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor           ON public.audit_logs (actor_profile_id);
CREATE INDEX IF NOT EXISTS idx_lp_student_id         ON public.lesson_packages (student_id);
