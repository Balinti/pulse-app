-- Pulse Row Level Security Policies
-- Migration 002: RLS policies

-- Enable RLS on all user data tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Checkins policies
CREATE POLICY "Users can view own checkins"
  ON checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins"
  ON checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins"
  ON checkins FOR DELETE
  USING (auth.uid() = user_id);

-- Experiment logs policies
CREATE POLICY "Users can view own experiment logs"
  ON experiment_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiment logs"
  ON experiment_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiment logs"
  ON experiment_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiment logs"
  ON experiment_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Calendar accounts policies
CREATE POLICY "Users can view own calendar accounts"
  ON calendar_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar accounts"
  ON calendar_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar accounts"
  ON calendar_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar accounts"
  ON calendar_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Calendar daily metrics policies
CREATE POLICY "Users can view own calendar metrics"
  ON calendar_daily_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar metrics"
  ON calendar_daily_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar metrics"
  ON calendar_daily_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar metrics"
  ON calendar_daily_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Note: Subscriptions insert/update handled by service role via Stripe webhook

-- Audit events policies
CREATE POLICY "Users can view own audit events"
  ON audit_events FOR SELECT
  USING (auth.uid() = user_id);

-- Tags policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view tags"
  ON tags FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Experiments policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view experiments"
  ON experiments FOR SELECT
  TO authenticated
  USING (is_active = true);
