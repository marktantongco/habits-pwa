-- ============================================================
-- HABITS CLASS PWA - Supabase Database Schema
-- ============================================================
-- Run this SQL in the Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/hocjetqkgrptxdbsmmgx/sql
-- ============================================================

-- 1. Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Student',
  theme TEXT NOT NULL DEFAULT 'midnight-gold',
  streak INTEGER NOT NULL DEFAULT 0,
  current_week INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Daily entries table
CREATE TABLE IF NOT EXISTS daily_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  week INTEGER NOT NULL DEFAULT 1,
  day TEXT NOT NULL,
  reading_complete BOOLEAN NOT NULL DEFAULT false,
  soap_scripture TEXT NOT NULL DEFAULT '',
  soap_observation TEXT NOT NULL DEFAULT '',
  soap_application TEXT NOT NULL DEFAULT '',
  soap_prayer TEXT NOT NULL DEFAULT '',
  prayer_0 TEXT NOT NULL DEFAULT '',
  prayer_1 TEXT NOT NULL DEFAULT '',
  prayer_2 TEXT NOT NULL DEFAULT '',
  checked_by TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, week, day)
);

-- 3. Quiz history table
CREATE TABLE IF NOT EXISTS quiz_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  accuracy INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, day)
);

-- 4. Student badges table
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, badge_id)
);

-- 5. Clipboard entries table
CREATE TABLE IF NOT EXISTS clipboard_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_daily_entries_student ON daily_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_student_week ON daily_entries(student_id, week);
CREATE INDEX IF NOT EXISTS idx_quiz_history_student ON quiz_history(student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_clipboard_entries_student ON clipboard_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_clipboard_entries_created ON clipboard_entries(student_id, created_at DESC);

-- ROW LEVEL SECURITY
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE clipboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_daily_entries" ON daily_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_quiz_history" ON quiz_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_student_badges" ON student_badges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_clipboard_entries" ON clipboard_entries FOR ALL USING (true) WITH CHECK (true);

-- UPDATED_AT trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_daily_entries_updated_at ON daily_entries;
CREATE TRIGGER trg_daily_entries_updated_at BEFORE UPDATE ON daily_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at();
