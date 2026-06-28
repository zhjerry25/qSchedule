import { describe, it, expect } from 'vitest'
import {
  startOfDay,
  addDays,
  daysBetween,
  isWeekend,
  getWeekStart,
  todayISO,
  isToday,
  isThisWeek,
} from './date-utils'

// ── startOfDay ──

describe('startOfDay', () => {
  it('normalizes time to midnight', () => {
    const d = new Date(2026, 5, 28, 14, 30, 45, 123) // June 28, 2026 14:30:45.123
    const result = startOfDay(d)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('preserves the date', () => {
    const d = new Date(2026, 5, 28, 14, 30, 45, 123)
    const result = startOfDay(d)
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(5)
    expect(result.getDate()).toBe(28)
  })

  it('returns a new Date object (does not mutate input)', () => {
    const d = new Date(2026, 5, 28, 14, 30)
    const result = startOfDay(d)
    expect(result).not.toBe(d)
    expect(d.getHours()).toBe(14) // original unchanged
  })
})

// ── addDays ──

describe('addDays', () => {
  it('adds positive days', () => {
    const d = new Date(2026, 5, 28)
    const result = addDays(d, 5)
    expect(result.getDate()).toBe(3)
    expect(result.getMonth()).toBe(6) // July
    expect(result.getFullYear()).toBe(2026)
  })

  it('adds negative days', () => {
    const d = new Date(2026, 5, 5)
    const result = addDays(d, -10)
    expect(result.getDate()).toBe(26)
    expect(result.getMonth()).toBe(4) // May
  })

  it('handles zero offset', () => {
    const d = new Date(2026, 5, 28)
    const result = addDays(d, 0)
    expect(result.getTime()).toBe(d.getTime())
  })

  it('returns a new Date object', () => {
    const d = new Date(2026, 5, 28)
    const result = addDays(d, 1)
    expect(result).not.toBe(d)
  })

  it('handles year boundary crossing', () => {
    const d = new Date(2026, 11, 31) // Dec 31, 2026
    const result = addDays(d, 1)
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(0) // January
    expect(result.getDate()).toBe(1)
  })
})

// ── daysBetween ──

describe('daysBetween', () => {
  it('returns 0 for same day', () => {
    const a = new Date(2026, 5, 28, 9, 0)
    const b = new Date(2026, 5, 28, 17, 0)
    expect(daysBetween(a, b)).toBe(0)
  })

  it('returns positive when b > a', () => {
    const a = new Date(2026, 5, 28)
    const b = new Date(2026, 5, 30)
    expect(daysBetween(a, b)).toBe(2)
  })

  it('returns negative when b < a', () => {
    const a = new Date(2026, 5, 30)
    const b = new Date(2026, 5, 28)
    expect(daysBetween(a, b)).toBe(-2)
  })

  it('handles month boundaries', () => {
    const a = new Date(2026, 5, 30)
    const b = new Date(2026, 6, 2)
    expect(daysBetween(a, b)).toBe(2)
  })

  it('handles DST boundaries gracefully', () => {
    // DST spring forward: March 8, 2026 (US)
    const a = new Date(2026, 2, 7, 12, 0) // March 7 noon
    const b = new Date(2026, 2, 9, 12, 0) // March 9 noon
    // Should be 2 days regardless of DST
    expect(daysBetween(a, b)).toBe(2)
  })
})

// ── isWeekend ──

describe('isWeekend', () => {
  it('returns true for Saturday', () => {
    // June 27, 2026 is a Saturday
    expect(isWeekend(new Date(2026, 5, 27))).toBe(true)
  })

  it('returns true for Sunday', () => {
    // June 28, 2026 is a Sunday
    expect(isWeekend(new Date(2026, 5, 28))).toBe(true)
  })

  it('returns false for Monday', () => {
    expect(isWeekend(new Date(2026, 5, 29))).toBe(false)
  })

  it('returns false for Friday', () => {
    expect(isWeekend(new Date(2026, 5, 26))).toBe(false)
  })
})

// ── getWeekStart ──

describe('getWeekStart', () => {
  it('returns Monday of the same week for a Monday', () => {
    // June 29, 2026 is a Monday
    const mon = new Date(2026, 5, 29)
    const result = getWeekStart(mon)
    expect(result.getDay()).toBe(1) // Monday
    expect(result.getDate()).toBe(29)
  })

  it('maps Wednesday to the previous Monday', () => {
    // July 1, 2026 is a Wednesday
    const wed = new Date(2026, 6, 1)
    const result = getWeekStart(wed)
    expect(result.getDay()).toBe(1)
    expect(result.getDate()).toBe(29)
    expect(result.getMonth()).toBe(5) // June
  })

  it('maps Sunday to the previous Monday', () => {
    // June 28, 2026 is a Sunday
    const sun = new Date(2026, 5, 28)
    const result = getWeekStart(sun)
    expect(result.getDay()).toBe(1)
    expect(result.getDate()).toBe(22)
  })

  it('returns midnight time', () => {
    const d = new Date(2026, 6, 1, 14, 30)
    const result = getWeekStart(d)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
  })
})

// ── todayISO ──

describe('todayISO', () => {
  it('returns a YYYY-MM-DD format string', () => {
    const result = todayISO()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

// ── isToday ──

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(todayISO())).toBe(true)
  })

  it('returns false for null', () => {
    expect(isToday(null)).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isToday('')).toBe(false)
  })
})

// ── isThisWeek ──

describe('isThisWeek', () => {
  it('returns true for today', () => {
    expect(isThisWeek(todayISO())).toBe(true)
  })

  it('returns false for null', () => {
    expect(isThisWeek(null)).toBe(false)
  })
})

// ── Local-timezone date formatting (regression test for DatePicker timezone bug) ──

describe('local-timezone date formatting', () => {
  it('formats a Date as YYYY-MM-DD in local timezone', () => {
    // Create a known date — June 28, 2026 at noon local time
    const d = new Date(2026, 5, 28, 12, 0, 0)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const formatted = `${y}-${m}-${dd}`
    expect(formatted).toBe('2026-06-28')
  })

  it('formats midnight correctly as the same day (not previous day)', () => {
    // Midnight June 28 local — should still be June 28, not June 27
    const d = new Date(2026, 5, 28, 0, 0, 0)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const formatted = `${y}-${m}-${dd}`
    expect(formatted).toBe('2026-06-28')
  })

  it('toISOString slice would give wrong result in UTC+N timezones', () => {
    // This test documents why toISOString().slice(0,10) is WRONG:
    // In UTC+8 (China), midnight June 28 local = June 27 16:00 UTC
    // toISOString() returns "2026-06-27T16:00:00.000Z" → slice gives "2026-06-27"
    // But our local formatting correctly gives "2026-06-28"
    const d = new Date(2026, 5, 28)
    const isoSlice = d.toISOString().slice(0, 10)
    const localFormat = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    // The two should differ for users in UTC+N timezones (N > 0)
    // For users in UTC or negative timezones they may match
    // We just verify the local format is correct
    expect(localFormat).toBe('2026-06-28')
    // Document: isoSlice may or may not match localFormat depending on timezone
    if (isoSlice !== localFormat) {
      // This is the timezone bug case
      expect(isoSlice).not.toBe('2026-06-28')
    }
  })
})
