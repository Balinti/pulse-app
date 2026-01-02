import { createClient } from '@/lib/supabase/server'
import type { Profile, Subscription, Entitlements } from '@/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data
}

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const subscription = await getSubscription(userId)

  if (!subscription) {
    // No subscription record yet, create free tier
    return {
      plan: 'free',
      status: 'active',
      canAccessCalendarMetrics: false,
      canAccessRecommendations: false,
      experimentLimit: 3,
    }
  }

  const isPlusActive =
    subscription.plan === 'plus' &&
    ['active', 'trialing'].includes(subscription.status)

  return {
    plan: subscription.plan,
    status: subscription.status,
    canAccessCalendarMetrics: isPlusActive,
    canAccessRecommendations: isPlusActive,
    experimentLimit: isPlusActive ? null : 3,
  }
}

export async function hasCalendarConnected(userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('calendar_accounts')
    .select('id')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .single()

  return !error && !!data
}

export async function getExperimentBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('experiments')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data
}
