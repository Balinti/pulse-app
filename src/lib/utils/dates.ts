import { format, parseISO } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export function formatLocalDate(date: Date, timezone: string): string {
  const zonedDate = toZonedTime(date, timezone)
  return format(zonedDate, 'yyyy-MM-dd')
}

export function parseLocalDate(dateStr: string, timezone: string): Date {
  const parsed = parseISO(dateStr)
  return fromZonedTime(parsed, timezone)
}

export function getTodayLocal(timezone: string): string {
  return formatLocalDate(new Date(), timezone)
}
