import type { CheckIn, CalendarDailyMetric } from '@/types'

export interface TrendData {
  energy_avg: number
  stress_avg: number
}

export function calculateTrends(checkins: CheckIn[]): TrendData {
  if (checkins.length === 0) {
    return {
      energy_avg: 0,
      stress_avg: 0,
    }
  }

  const totalEnergy = checkins.reduce((sum, c) => sum + c.energy, 0)
  const totalStress = checkins.reduce((sum, c) => sum + c.stress, 0)

  return {
    energy_avg: Math.round((totalEnergy / checkins.length) * 10) / 10,
    stress_avg: Math.round((totalStress / checkins.length) * 10) / 10,
  }
}

export function analyzeCorrelation(
  checkins: CheckIn[],
  calendarMetrics: CalendarDailyMetric[]
): Array<{ date_local: string; energy: number; stress: number; meeting_minutes: number }> {
  const metricsMap = new Map<string, CalendarDailyMetric>()
  for (const metric of calendarMetrics) {
    metricsMap.set(metric.date_local, metric)
  }

  const combined = []
  for (const checkin of checkins) {
    const metric = metricsMap.get(checkin.date_local)
    if (metric) {
      combined.push({
        date_local: checkin.date_local,
        energy: checkin.energy,
        stress: checkin.stress,
        meeting_minutes: metric.meeting_minutes,
      })
    }
  }

  return combined
}
