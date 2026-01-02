import type { Recommendation, CheckIn, CalendarDailyMetric } from '@/types'
import { addDays, format } from 'date-fns'

export async function generateRecommendation(
  dateLocal: string,
  checkins: CheckIn[],
  tomorrowMetric: CalendarDailyMetric | null,
  isPlusUser: boolean,
  hasCalendar: boolean
): Promise<Recommendation> {
  // Rule 1: Calendar-based recommendation (Plus only)
  if (isPlusUser && hasCalendar && tomorrowMetric) {
    if (tomorrowMetric.meeting_minutes >= 180) {
      return {
        date_local: dateLocal,
        recommended: {
          experiment_slug: 'pre-meeting-reset',
          reason: 'Tomorrow has a heavy meeting load (≥ 180 minutes).',
        },
        paywalled: false,
      }
    }

    if (tomorrowMetric.after_hours_minutes > 30) {
      return {
        date_local: dateLocal,
        recommended: {
          experiment_slug: 'boundary-script',
          reason: 'Tomorrow has after-hours meetings scheduled.',
        },
        paywalled: false,
      }
    }

    if (tomorrowMetric.longest_gap_minutes >= 90) {
      return {
        date_local: dateLocal,
        recommended: {
          experiment_slug: 'focus-block-protect',
          reason: 'Tomorrow has a long gap between meetings (≥90 minutes).',
        },
        paywalled: false,
      }
    }
  }

  // Rule 2: Tag-based recommendation (Free tier)
  const recentCheckins = checkins.slice(0, 3)
  const tagCounts = new Map<string, number>()

  for (const checkin of recentCheckins) {
    for (const tag of checkin.tag_slugs) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    }
  }

  if (tagCounts.get('conflict') && tagCounts.get('conflict')! >= 2) {
    return {
      date_local: dateLocal,
      recommended: {
        experiment_slug: 'post-conflict-debrief',
        reason: 'You tagged "Conflict" multiple times recently.',
      },
      paywalled: false,
    }
  }

  if (tagCounts.get('meetings') && tagCounts.get('meetings')! >= 2) {
    return {
      date_local: dateLocal,
      recommended: {
        experiment_slug: 'pre-meeting-reset',
        reason: 'You tagged "Meetings" multiple times recently.',
      },
      paywalled: false,
    }
  }

  // Rule 3: Stress-based recommendation
  if (recentCheckins.length > 0) {
    const avgStress =
      recentCheckins.reduce((sum, c) => sum + c.stress, 0) / recentCheckins.length
    if (avgStress >= 7) {
      return {
        date_local: dateLocal,
        recommended: {
          experiment_slug: 'two-minute-downshift',
          reason: 'Your stress has been high recently (avg ≥7/10).',
        },
        paywalled: false,
      }
    }
  }

  // Default: shutdown ritual
  return {
    date_local: dateLocal,
    recommended: {
      experiment_slug: 'shutdown-ritual',
      reason: 'Try ending your day with intention.',
    },
    paywalled: false,
  }
}
