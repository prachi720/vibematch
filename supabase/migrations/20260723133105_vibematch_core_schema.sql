/*
# VibeMatch Core Schema

## Overview
Creates the complete database schema for VibeMatch, a hackathon preparation platform.
All tables are owner-scoped to authenticated users via RLS.

## New Tables
1. `profiles` — 1:1 with auth.users, stores developer profile (name, experience, preferences)
2. `skills` — master list of skills (name, category)
3. `profile_skills` — join table for many-to-many Profile↔Skill
4. `projects` — a project belongs to a user (optionally a team), stores brief/idea
5. `teams` — a team has a name and owner
6. `team_members` — join table Users↔Teams
7. `ai_outputs` — unified table for ALL AI module outputs (skill analysis, team suggestions, validations, architectures, roadmaps, features, pitches, judge sessions, documentation). Stores input payload, output payload, provider/model, timestamp, regeneration count, module type, and optional project link.

## Security
- RLS enabled on every table.
- Owner-scoped CRUD policies using auth.uid() for user-owned tables.
- Team members can access team-scoped data via membership checks.
- ai_outputs scoped to the owning user.
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  experience_level text NOT NULL DEFAULT 'beginner',
  preferences jsonb DEFAULT '{}'::jsonb,
  profile_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ SKILLS ============
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'general'
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_skills" ON skills;
CREATE POLICY "read_all_skills" ON skills FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_skill" ON skills;
CREATE POLICY "insert_own_skill" ON skills FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============ PROFILE_SKILLS ============
CREATE TABLE IF NOT EXISTS profile_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency integer NOT NULL DEFAULT 3 CHECK (proficiency >= 1 AND proficiency <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE (profile_id, skill_id)
);

ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile_skills" ON profile_skills;
CREATE POLICY "select_own_profile_skills" ON profile_skills FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = profile_skills.profile_id AND profiles.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_profile_skills" ON profile_skills;
CREATE POLICY "insert_own_profile_skills" ON profile_skills FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = profile_skills.profile_id AND profiles.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_profile_skills" ON profile_skills;
CREATE POLICY "delete_own_profile_skills" ON profile_skills FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = profile_skills.profile_id AND profiles.user_id = auth.uid())
  );

-- ============ TEAMS ============
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_teams" ON teams;
CREATE POLICY "select_own_teams" ON teams FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_teams" ON teams;
CREATE POLICY "insert_own_teams" ON teams FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_teams" ON teams;
CREATE POLICY "update_own_teams" ON teams FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_teams" ON teams;
CREATE POLICY "delete_own_teams" ON teams FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- ============ TEAM_MEMBERS ============
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE (team_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_team_members" ON team_members;
CREATE POLICY "select_own_team_members" ON team_members FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_team_members" ON team_members;
CREATE POLICY "insert_own_team_members" ON team_members FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_team_members" ON team_members;
CREATE POLICY "delete_own_team_members" ON team_members FOR DELETE
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid()
    )
  );

-- ============ PROJECTS ============
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  target_users text NOT NULL DEFAULT '',
  tech_approach text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_projects" ON projects;
CREATE POLICY "select_own_projects" ON projects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_projects" ON projects;
CREATE POLICY "insert_own_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_projects" ON projects;
CREATE POLICY "update_own_projects" ON projects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_projects" ON projects;
CREATE POLICY "delete_own_projects" ON projects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ AI_OUTPUTS (unified for all AI modules) ============
CREATE TABLE IF NOT EXISTS ai_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  module_type text NOT NULL,
  input_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider text NOT NULL DEFAULT 'vibematch-simulated',
  model text NOT NULL DEFAULT 'vibe-1',
  regeneration_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_outputs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_outputs" ON ai_outputs;
CREATE POLICY "select_own_ai_outputs" ON ai_outputs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_outputs" ON ai_outputs;
CREATE POLICY "insert_own_ai_outputs" ON ai_outputs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ai_outputs" ON ai_outputs;
CREATE POLICY "update_own_ai_outputs" ON ai_outputs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_outputs" ON ai_outputs;
CREATE POLICY "delete_own_ai_outputs" ON ai_outputs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ USER_SETTINGS ============
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'dark',
  ai_api_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_settings" ON user_settings;
CREATE POLICY "select_own_settings" ON user_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_settings" ON user_settings;
CREATE POLICY "insert_own_settings" ON user_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_settings" ON user_settings;
CREATE POLICY "update_own_settings" ON user_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_settings" ON user_settings;
CREATE POLICY "delete_own_settings" ON user_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_user_id ON ai_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_module_type ON ai_outputs(module_type);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_project_id ON ai_outputs(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);

-- ============ SEED SKILLS ============
INSERT INTO skills (name, category) VALUES
  ('JavaScript', 'language'),
  ('TypeScript', 'language'),
  ('Python', 'language'),
  ('Rust', 'language'),
  ('Go', 'language'),
  ('Java', 'language'),
  ('C++', 'language'),
  ('React', 'frontend'),
  ('Next.js', 'frontend'),
  ('Vue', 'frontend'),
  ('Svelte', 'frontend'),
  ('Tailwind CSS', 'frontend'),
  ('CSS', 'frontend'),
  ('HTML', 'frontend'),
  ('Node.js', 'backend'),
  ('FastAPI', 'backend'),
  ('Express', 'backend'),
  ('Django', 'backend'),
  ('Flask', 'backend'),
  ('GraphQL', 'backend'),
  ('PostgreSQL', 'database'),
  ('MongoDB', 'database'),
  ('Redis', 'database'),
  ('Supabase', 'database'),
  ('Docker', 'devops'),
  ('Kubernetes', 'devops'),
  ('AWS', 'devops'),
  ('GCP', 'devops'),
  ('CI/CD', 'devops'),
  ('Machine Learning', 'ai'),
  ('Deep Learning', 'ai'),
  ('NLP', 'ai'),
  ('Computer Vision', 'ai'),
  ('LLM Integration', 'ai'),
  ('Prompt Engineering', 'ai'),
  ('UI/UX Design', 'design'),
  ('Figma', 'design'),
  ('Product Management', 'product'),
  ('Agile', 'product'),
  ('Git', 'tools'),
  ('Linux', 'tools')
ON CONFLICT (name) DO NOTHING;