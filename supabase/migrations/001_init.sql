-- Pulse Database Schema
-- Migration 001: Initial schema

-- 1. profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  timezone text NOT NULL DEFAULT 'UTC',
  workday_start_local time NOT NULL DEFAULT '09:00:00',
  workday_end_local time NOT NULL DEFAULT '17:00:00',
  workdays smallint[] NOT NULL DEFAULT '{1,2,3,4,5}',
  checkin_reminder_time_local time,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. tags table (predefined only in MVP)
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. checkins table
CREATE TABLE checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date_local date NOT NULL,
  energy smallint NOT NULL CHECK (energy BETWEEN 0 AND 10),
  stress smallint NOT NULL CHECK (stress BETWEEN 0 AND 10),
  tag_slugs text[] NOT NULL DEFAULT '{}',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date_local)
);

CREATE INDEX idx_checkins_user_date ON checkins(user_id, date_local DESC);

-- 4. experiments table (static catalog)
CREATE TABLE experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  duration_seconds int NOT NULL DEFAULT 120,
  category text NOT NULL,
  steps jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. experiment_logs table
CREATE TABLE experiment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE RESTRICT,
  date_local date NOT NULL,
  status text NOT NULL CHECK (status IN ('started', 'completed', 'skipped')),
  next_day_outcome text CHECK (next_day_outcome IN ('better', 'same', 'worse')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, experiment_id, date_local)
);

CREATE INDEX idx_experiment_logs_user_date ON experiment_logs(user_id, date_local DESC);

-- 6. calendar_accounts table
CREATE TABLE calendar_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('google')),
  google_sub text NOT NULL,
  access_token_enc text NOT NULL,
  refresh_token_enc text NOT NULL,
  token_expires_at timestamptz NOT NULL,
  scopes text[] NOT NULL DEFAULT '{}',
  connected_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE(provider, google_sub)
);

CREATE INDEX idx_calendar_accounts_user_provider ON calendar_accounts(user_id, provider);

-- 7. calendar_daily_metrics table
CREATE TABLE calendar_daily_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date_local date NOT NULL,
  meeting_count int NOT NULL DEFAULT 0,
  meeting_minutes int NOT NULL DEFAULT 0,
  after_hours_minutes int NOT NULL DEFAULT 0,
  longest_gap_minutes int NOT NULL DEFAULT 0,
  first_meeting_start_local time,
  last_meeting_end_local time,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date_local)
);

CREATE INDEX idx_calendar_daily_metrics_user_date ON calendar_daily_metrics(user_id, date_local DESC);

-- 8. subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE NOT NULL,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL CHECK (plan IN ('free', 'plus')),
  status text NOT NULL,
  current_period_end timestamptz,
  trial_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- 9. audit_events table
CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  type text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_events_user ON audit_events(user_id, created_at DESC);
CREATE INDEX idx_audit_events_type ON audit_events(type, created_at DESC);
