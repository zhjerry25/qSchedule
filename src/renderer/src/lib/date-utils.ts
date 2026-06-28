/**
 * Return today's date as ISO string YYYY-MM-DD in local timezone.
 */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Check if a date string falls on today (local timezone).
 * Returns false for null, empty, or invalid date strings.
 */
export function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false
  return dateStr === todayISO()
}

/**
 * Check if a date string falls within the current Mon–Sun week (local timezone).
 * Returns false for null, empty, or invalid date strings.
 */
export function isThisWeek(dateStr: string | null): boolean {
  if (!dateStr) return false

  const date = new Date(dateStr + 'T00:00:00')
  if (isNaN(date.getTime())) return false

  const today = new Date()
  const dayOfWeek = today.getDay()
  // Monday = 1 in ISO, Sunday = 7 — convert from 0=Sun JS convention
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return date >= monday && date <= sunday
}

/**
 * Get the Monday 00:00:00.000 of the week containing `date`.
 * Defaults to today if no date provided.
 */
export function getWeekStart(date?: Date): Date {
  const d = date ?? new Date()
  const dayOfWeek = d.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(d)
  monday.setDate(d.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  return monday
}
