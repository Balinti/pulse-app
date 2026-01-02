import { google } from 'googleapis'
import { getOAuth2Client } from './oauth'
import { parseISO, format, addDays, startOfDay, endOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { Profile } from '@/types'

export interface CalendarEvent {
  start: string
  end: string
}

export async function fetchCalendarEvents(
  accessToken: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: accessToken,
  })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    fields: 'items(start,end)',
  })

  const events: CalendarEvent[] = []

  for (const item of response.data.items || []) {
    if (item.start?.dateTime && item.end?.dateTime) {
      events.push({
        start: item.start.dateTime,
        end: item.end.dateTime,
      })
    }
  }

  return events
}

export interface DailyMetrics {
  meeting_count: number
  meeting_minutes: number
  after_hours_minutes: number
  longest_gap_minutes: number
  first_meeting_start_local: string | null
  last_meeting_end_local: string | null
}

export function computeDailyMetrics(
  events: CalendarEvent[],
  dateLocal: Date,
  profile: Profile
): DailyMetrics {
  const timezone = profile.timezone
  const workdayStart = profile.workday_start_local // e.g., "09:00:00"
  const workdayEnd = profile.workday_end_local // e.g., "17:00:00"
  const workdays = profile.workdays

  const dayOfWeek = dateLocal.getDay() === 0 ? 7 : dateLocal.getDay() // Convert to ISO: 1=Mon
  const isWorkday = workdays.includes(dayOfWeek)

  if (!isWorkday) {
    return {
      meeting_count: 0,
      meeting_minutes: 0,
      after_hours_minutes: 0,
      longest_gap_minutes: 0,
      first_meeting_start_local: null,
      last_meeting_end_local: null,
    }
  }

  const dayStart = startOfDay(dateLocal)
  const dayEnd = endOfDay(dateLocal)

  const [workStartHour, workStartMin] = workdayStart.split(':').map(Number)
  const [workEndHour, workEndMin] = workdayEnd.split(':').map(Number)

  const workdayStartTime = new Date(dayStart)
  workdayStartTime.setHours(workStartHour, workStartMin, 0, 0)

  const workdayEndTime = new Date(dayStart)
  workdayEndTime.setHours(workEndHour, workEndMin, 0, 0)

  let meetingCount = 0
  let meetingMinutes = 0
  let afterHoursMinutes = 0
  let firstMeetingStart: Date | null = null
  let lastMeetingEnd: Date | null = null
  const meetingTimes: Array<{ start: Date; end: Date }> = []

  for (const event of events) {
    const eventStart = parseISO(event.start)
    const eventEnd = parseISO(event.end)
    const eventStartLocal = toZonedTime(eventStart, timezone)
    const eventEndLocal = toZonedTime(eventEnd, timezone)

    // Check if event is on this day
    if (
      eventStartLocal < dayStart ||
      eventStartLocal >= addDays(dayStart, 1)
    ) {
      continue
    }

    const durationMinutes = Math.round((eventEndLocal.getTime() - eventStartLocal.getTime()) / 60000)

    // Only count meetings >= 10 minutes
    if (durationMinutes < 10) continue

    meetingCount++
    meetingMinutes += durationMinutes
    meetingTimes.push({ start: eventStartLocal, end: eventEndLocal })

    if (!firstMeetingStart || eventStartLocal < firstMeetingStart) {
      firstMeetingStart = eventStartLocal
    }
    if (!lastMeetingEnd || eventEndLocal > lastMeetingEnd) {
      lastMeetingEnd = eventEndLocal
    }

    // Compute after-hours minutes
    if (eventStartLocal < workdayStartTime) {
      const overlapEnd = eventEndLocal < workdayStartTime ? eventEndLocal : workdayStartTime
      afterHoursMinutes += Math.round((overlapEnd.getTime() - eventStartLocal.getTime()) / 60000)
    }
    if (eventEndLocal > workdayEndTime) {
      const overlapStart = eventStartLocal > workdayEndTime ? eventStartLocal : workdayEndTime
      afterHoursMinutes += Math.round((eventEndLocal.getTime() - overlapStart.getTime()) / 60000)
    }
  }

  // Compute longest gap
  let longestGap = 0
  if (meetingTimes.length > 1) {
    meetingTimes.sort((a, b) => a.start.getTime() - b.start.getTime())
    for (let i = 0; i < meetingTimes.length - 1; i++) {
      const gapStart = meetingTimes[i].end
      const gapEnd = meetingTimes[i + 1].start

      // Only count gaps within work hours
      if (gapStart >= workdayStartTime && gapEnd <= workdayEndTime) {
        const gapMinutes = Math.round((gapEnd.getTime() - gapStart.getTime()) / 60000)
        if (gapMinutes > longestGap) {
          longestGap = gapMinutes
        }
      }
    }
  }

  return {
    meeting_count: meetingCount,
    meeting_minutes: meetingMinutes,
    after_hours_minutes: afterHoursMinutes,
    longest_gap_minutes: longestGap,
    first_meeting_start_local: firstMeetingStart ? format(firstMeetingStart, 'HH:mm:ss') : null,
    last_meeting_end_local: lastMeetingEnd ? format(lastMeetingEnd, 'HH:mm:ss') : null,
  }
}
