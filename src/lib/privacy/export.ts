import { createClient } from '@/lib/supabase/server'

export async function exportUserData(userId: string) {
  const supabase = await createClient()

  const [
    { data: profile },
    { data: checkins },
    { data: experimentLogs },
    { data: calendarMetrics },
    { data: subscription },
    { data: auditEvents },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('checkins').select('*').eq('user_id', userId).order('date_local', { ascending: false }),
    supabase.from('experiment_logs').select('*').eq('user_id', userId).order('date_local', { ascending: false }),
    supabase.from('calendar_daily_metrics').select('*').eq('user_id', userId).order('date_local', { ascending: false }),
    supabase.from('subscriptions').select('*').eq('user_id', userId).single(),
    supabase.from('audit_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ])

  return {
    exported_at: new Date().toISOString(),
    profile,
    checkins: checkins || [],
    experiment_logs: experimentLogs || [],
    calendar_metrics: calendarMetrics || [],
    subscription,
    audit_events: auditEvents || [],
  }
}
