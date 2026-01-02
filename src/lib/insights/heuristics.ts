import type { Insight } from '@/types'
import { analyzeCorrelation } from './metrics'
import type { CheckIn, CalendarDailyMetric } from '@/types'

export function generateInsights(
  checkins: CheckIn[],
  calendarMetrics: CalendarDailyMetric[],
  isPlusUser: boolean
): Insight[] {
  const insights: Insight[] = []

  if (!isPlusUser || calendarMetrics.length === 0) {
    return insights
  }

  const combined = analyzeCorrelation(checkins, calendarMetrics)

  if (combined.length < 3) {
    return insights
  }

  // Heuristic: meeting load correlation
  const heavyMeetingDays = combined.filter((d) => d.meeting_minutes >= 180)
  const lightMeetingDays = combined.filter((d) => d.meeting_minutes < 180)

  if (heavyMeetingDays.length >= 2 && lightMeetingDays.length >= 2) {
    const heavyAvgEnergy =
      heavyMeetingDays.reduce((sum, d) => sum + d.energy, 0) / heavyMeetingDays.length
    const lightAvgEnergy =
      lightMeetingDays.reduce((sum, d) => sum + d.energy, 0) / lightMeetingDays.length

    if (lightAvgEnergy - heavyAvgEnergy >= 1.0) {
      insights.push({
        id: 'meeting-load-correlation',
        title: 'Meeting-heavy days correlate with lower next-day energy',
        detail: `On days with ≥180 meeting minutes, your next-day energy averaged ${heavyAvgEnergy.toFixed(1)} vs ${lightAvgEnergy.toFixed(1)} on lighter days.`,
        confidence: combined.length >= 7 ? 'medium' : 'low',
        requires_plus: true,
      })
    }
  }

  // Heuristic: after-hours correlation
  const afterHoursDays = calendarMetrics.filter((m) => m.after_hours_minutes > 30)
  if (afterHoursDays.length >= 2) {
    const afterHoursCheckins = checkins.filter((c) =>
      afterHoursDays.some((m) => m.date_local === c.date_local)
    )
    if (afterHoursCheckins.length >= 2) {
      const avgStress =
        afterHoursCheckins.reduce((sum, c) => sum + c.stress, 0) / afterHoursCheckins.length
      if (avgStress >= 6) {
        insights.push({
          id: 'after-hours-stress',
          title: 'After-hours meetings linked to higher stress',
          detail: `You averaged ${avgStress.toFixed(1)}/10 stress on days with >30 minutes of after-hours meetings.`,
          confidence: 'low',
          requires_plus: true,
        })
      }
    }
  }

  return insights
}
