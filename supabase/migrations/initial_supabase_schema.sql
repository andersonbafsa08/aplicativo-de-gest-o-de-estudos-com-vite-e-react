/*
  # Supabase Full Integration Schema
  1. New Tables: subjects, tasks, user_settings
  2. Security: Enable RLS and add policies for authenticated users.
*/

-- 1. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  edital TEXT,
  weekly_frequency INTEGER NOT NULL,
  hours_per_day NUMERIC NOT NULL,
  max_hours_per_session NUMERIC NOT NULL,
  days_until_exam INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view subjects"
ON subjects FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to manage subjects"
ON subjects FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  planned_duration_minutes INTEGER NOT NULL,
  scheduled_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  actual_duration_minutes INTEGER,
  questions_made INTEGER,
  questions_hit INTEGER,
  score_percentage NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy for tasks: Check if the subject belongs to the current user
CREATE POLICY "Allow authenticated users to manage tasks"
ON tasks FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM subjects
    WHERE subjects.id = tasks.subject_id AND subjects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM subjects
    WHERE subjects.id = tasks.subject_id AND subjects.user_id = auth.uid()
  )
);

-- 3. User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  study_start_time TIME NOT NULL,
  study_end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage settings"
ON user_settings FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_subject_id ON tasks(subject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
