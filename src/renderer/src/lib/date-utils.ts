import type { TaskWithTags } from '@shared/task'
import type { SectionKey } from './constants'

/**
 * Return today's date as ISO string YYYY-MM-DD in local timezone.
 */
export function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Normalize a Date to midnight (00:00:00.000) in local timezone.
 */
export function startOfDay(d: Date): Date {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

/**
 * Add n days to a Date (mutates and returns a new Date).
 * Positive n moves forward, negative n moves backward.
 */
export function addDays(d: Date, n: number): Date {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

/**
 * Count whole days between two Dates (positive if b > a).
 */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

/**
 * Check if a Date falls on Saturday (6) or Sunday (0).
 */
export function isWeekend(d: Date): boolean {
  const day = d.getDay()
  return day === 0 || day === 6
}

/**
 * Check if a date string falls on today (local timezone).
 * Returns false for null, empty, or invalid date strings.
 */
export function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false
  // Extract date part (first 10 chars = YYYY-MM-DD) to handle
  // both date-only strings and full ISO datetime strings from DB
  return dateStr.slice(0, 10) === todayISO()
}

/**
 * Check if a date string falls within the current Mon–Sun week (local timezone).
 * Returns false for null, empty, or invalid date strings.
 */
export function isThisWeek(dateStr: string | null): boolean {
  if (!dateStr) return false

  // Extract date part to handle full ISO datetime strings from DB
  const datePart = dateStr.slice(0, 10)
  const date = new Date(datePart + 'T00:00:00')
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

// ── Smart Date Formatting ──

export type SmartDate =
  | { kind: 'today' }
  | { kind: 'tomorrow' }
  | { kind: 'yesterday' }
  | { kind: 'date'; label: string }

/**
 * Parse a date string into a structured SmartDate discriminant.
 * Callers use i18n to render "Today"/"今天" etc. — this function
 * only classifies the date, never hardcodes English strings.
 *
 * Supports both date-only (YYYY-MM-DD) and full ISO strings.
 */
export function formatSmartDate(
  dateStr: string | null,
  options?: { includeWeekday?: boolean; locale?: string },
): SmartDate | null {
  if (!dateStr) return null
  const date = new Date(dateStr.slice(0, 10) + 'T00:00:00')
  if (isNaN(date.getTime())) return { kind: 'date', label: dateStr }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays === 0) return { kind: 'today' }
  if (diffDays === 1) return { kind: 'tomorrow' }
  if (diffDays === -1) return { kind: 'yesterday' }

  const localeOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  }
  if (options?.includeWeekday) {
    localeOptions.weekday = 'short'
  }
  return { kind: 'date', label: date.toLocaleDateString(options?.locale ?? 'en-US', localeOptions) }
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

// ── Task Partitioning ──

export interface TaskSections {
  today: TaskWithTags[]
  week: TaskWithTags[]
  later: TaskWithTags[]
}

/**
 * Partition tasks into PRD-compliant sections.
 * - Today: daily tasks + once/deadline tasks due today or overdue
 * - Week: weekly tasks + once/deadline tasks due later this week (after today)
 * - Later: everything else
 *
 * Each task appears in exactly ONE section.
 */
export function partitionTasks(tasks: TaskWithTags[]): TaskSections {
  const today = todayISO()

  const todayTasks: TaskWithTags[] = []
  const weekTasks: TaskWithTags[] = []
  const laterTasks: TaskWithTags[] = []

  for (const task of tasks) {
    if (task.frequency === 'daily') {
      todayTasks.push(task)
      continue
    }

    if (task.frequency === 'weekly') {
      weekTasks.push(task)
      continue
    }

    // once / deadline: use scheduled_date (primary) or deadline (fallback)
    const refDate = task.scheduled_date ?? task.deadline

    if (refDate) {
      if (refDate <= today) {
        todayTasks.push(task)
      } else if (isThisWeek(refDate)) {
        weekTasks.push(task)
      } else {
        laterTasks.push(task)
      }
    } else {
      laterTasks.push(task)
    }
  }

  return { today: todayTasks, week: weekTasks, later: laterTasks }
}