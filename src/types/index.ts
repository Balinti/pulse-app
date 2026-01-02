// Database types
export interface Profile {
  id: string
  email: string | null
  timezone: string
  workday_start_local: string
  workday_end_local: string
  workdays: number[]
  checkin_reminder_time_local: string | null
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  slug: string
  label: string
  is_active: boolean
  created_at: string
}

export interface CheckIn {
  id: string
  user_id: string
  date_local: string
  energy: number
  stress: number
  tag_slugs: string[]
  note: string | null
  created_at: string
}

export interface Experiment {
  id: string
  slug: string
  title: string
  duration_seconds: number
  category: string
  steps: string[]
  is_active: boolean
  created_at: string
}

export interface ExperimentLog {
  id: string
  user_id: string
  experiment_id: string
  date_local: string
  status: 'started' | 'completed' | 'skipped'
  next_day_outcome: 'better' | 'same' | 'worse' | null
  created_at: string
}

export interface CalendarAccount {
  id: string
  user_id: string
  provider: 'google'
  google_sub: string
  access_token_enc: string
  refresh_token_enc: string
  token_expires_at: string
  scopes: string[]
  connected_at: string
  revoked_at: string | null
}

export interface CalendarDailyMetric {
  id: string
  user_id: string
  date_local: string
  meeting_count: number
  meeting_minutes: number
  after_hours_minutes: number
  longest_gap_minutes: number
  first_meeting_start_local: string | null
  last_meeting_end_local: string | null
  computed_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string | null
  plan: 'free' | 'plus'
  status: string
  current_period_end: string | null
  trial_end: string | null
  created_at: string
  updated_at: string
}

export interface AuditEvent {
  id: string
  user_id: string | null
  type: string
  meta: Record<string, any>
  created_at: string
}

// API request/response types
export interface CheckInRequest {
  date_local: string
  energy: number
  stress: number
  tag_slugs: string[]
  note?: string | null
}

export interface ExperimentLogRequest {
  experiment_slug: string
  date_local: string
  status: 'started' | 'completed' | 'skipped'
}

export interface ExperimentLogUpdateRequest {
  log_id: string
  next_day_outcome: 'better' | 'same' | 'worse'
}

export interface Recommendation {
  date_local: string
  recommended: {
    experiment_slug: string
    reason: string
  } | null
  paywalled: boolean
  reason?: string
}

export interface Insight {
  id: string
  title: string
  detail: string
  confidence: 'low' | 'medium' | 'high'
  requires_plus: boolean
}

export interface WeeklyInsights {
  range: {
    from: string
    to: string
  }
  trends: {
    energy_avg: number
    stress_avg: number
  }
  insights: Insight[]
}

export interface Entitlements {
  plan: 'free' | 'plus'
  status: string
  canAccessCalendarMetrics: boolean
  canAccessRecommendations: boolean
  experimentLimit: number | null
}

export interface MeResponse {
  user: {
    id: string
    email: string
  }
  profile: Profile
  entitlements: Entitlements
}

// UI component types
export interface ExperimentWithLogs extends Experiment {
  userLogs?: ExperimentLog[]
  recommendedToday?: boolean
  recommendationReason?: string
}

export interface ProofLoopStats {
  totalAttempts: number
  betterCount: number
  sameCount: number
  worseCount: number
  seemsHelpful: boolean
}
