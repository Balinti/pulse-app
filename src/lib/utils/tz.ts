// Utility functions for timezone handling
import { toZonedTime } from 'date-fns-tz'

export function getUserLocalTime(timezone: string): Date {
  return toZonedTime(new Date(), timezone)
}

export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz })
    return true
  } catch {
    return false
  }
}
