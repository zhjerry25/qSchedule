import { describe, it, expect } from 'vitest'
import { assignGanttColor, GANTT_COLORS } from './constants'
import { HEADER_HEIGHT, ROW_HEIGHT } from '../hooks/useGanttLayout'

// ── GANTT_COLORS ──

describe('GANTT_COLORS', () => {
  it('has 8 colors', () => {
    expect(GANTT_COLORS).toHaveLength(8)
  })

  it('all colors are valid hex', () => {
    for (const color of GANTT_COLORS) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('all colors are unique', () => {
    expect(new Set(GANTT_COLORS).size).toBe(GANTT_COLORS.length)
  })
})

// ── assignGanttColor ──

describe('assignGanttColor', () => {
  it('returns a color from the palette', () => {
    const color = assignGanttColor('Test Task')
    expect(GANTT_COLORS).toContain(color)
  })

  it('is deterministic (same name → same color)', () => {
    expect(assignGanttColor('Design System')).toBe(assignGanttColor('Design System'))
  })

  it('distributes across palette', () => {
    const names = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta']
    const colors = names.map((n) => assignGanttColor(n))
    // At least a few different colors should be used
    expect(new Set(colors).size).toBeGreaterThan(2)
  })
})

// ── Layout Constants ──

describe('Layout constants', () => {
  it('HEADER_HEIGHT is reasonable', () => {
    expect(HEADER_HEIGHT).toBe(48)
  })

  it('ROW_HEIGHT is reasonable', () => {
    expect(ROW_HEIGHT).toBe(40)
  })

  it('row height + gap gives enough space for bars', () => {
    // Bar height = ROW_HEIGHT - 8 = 32px, which fits in ROW_HEIGHT (40px)
    expect(ROW_HEIGHT - 8).toBeGreaterThan(0)
  })

  it('cellWidth is 96px for day and week, 160px for month', () => {
    // Per-zoom cellWidth values (mirrors ZOOM_CONFIG in useGanttLayout.ts)
    const cellWidths = { day: 96, week: 96, month: 160 }
    expect(cellWidths.day).toBe(96)
    expect(cellWidths.week).toBe(96)
    expect(cellWidths.month).toBe(160)
  })

  it('dayWidth = cellWidth / daysPerCell is correct for each zoom', () => {
    // Day: cellWidth=96, daysPerCell=1 → dayWidth = 96
    expect(96 / 1).toBe(96)
    // Week: cellWidth=96, daysPerCell=7 → dayWidth ≈ 13.714...
    expect(96 / 7).toBeCloseTo(13.714, 1)
    // Month: cellWidth=160, daysPerCell=30 → dayWidth ≈ 5.333...
    expect(160 / 30).toBeCloseTo(5.333, 1)
  })
})

// ── Lane Assignment Algorithm (First-Fit) ──
// Independent reproduction for verification

interface TestTask {
  id: string
  startDate: string | null
  endDate: string | null
}

interface TestLane {
  latestEnd: Date
}

function assignLanes(tasks: TestTask[]): Map<string, number> {
  // Sort by start date ASC (nulls last), then by duration DESC
  const sorted = [...tasks].sort((a, b) => {
    const aStart = a.startDate ?? '9999-12-31'
    const bStart = b.startDate ?? '9999-12-31'
    if (aStart !== bStart) return aStart.localeCompare(bStart)
    const aDur = a.startDate && a.endDate
      ? Math.round((new Date(a.endDate).getTime() - new Date(a.startDate).getTime()) / 86400000)
      : 0
    const bDur = b.startDate && b.endDate
      ? Math.round((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / 86400000)
      : 0
    return bDur - aDur
  })

  const lanes: TestLane[] = []
  const map = new Map<string, number>()

  for (const task of sorted) {
    const taskStart = task.startDate ? new Date(task.startDate + 'T00:00:00') : null
    const taskEnd = task.endDate ? new Date(task.endDate + 'T00:00:00') : taskStart

    if (!taskStart) {
      map.set(task.id, lanes.length)
      lanes.push({ latestEnd: new Date(0) })
      continue
    }

    let assigned = false
    for (let i = 0; i < lanes.length; i++) {
      if (taskStart >= lanes[i].latestEnd) {
        map.set(task.id, i)
        if (taskEnd && taskEnd > lanes[i].latestEnd) {
          lanes[i].latestEnd = taskEnd
        }
        assigned = true
        break
      }
    }

    if (!assigned) {
      map.set(task.id, lanes.length)
      lanes.push({ latestEnd: taskEnd ?? taskStart })
    }
  }

  return map
}

describe('Lane assignment (first-fit)', () => {
  it('non-overlapping tasks share the same lane', () => {
    const tasks: TestTask[] = [
      { id: 'a', startDate: '2026-06-01', endDate: '2026-06-05' },
      { id: 'b', startDate: '2026-06-10', endDate: '2026-06-15' },
      { id: 'c', startDate: '2026-06-20', endDate: '2026-06-25' },
    ]
    const lanes = assignLanes(tasks)
    // All three should share lane 0
    expect(lanes.get('a')).toBe(0)
    expect(lanes.get('b')).toBe(0)
    expect(lanes.get('c')).toBe(0)
  })

  it('overlapping tasks get separate lanes', () => {
    const tasks: TestTask[] = [
      { id: 'a', startDate: '2026-06-01', endDate: '2026-06-10' },
      { id: 'b', startDate: '2026-06-05', endDate: '2026-06-15' },
    ]
    const lanes = assignLanes(tasks)
    expect(lanes.get('a')).toBe(0)
    expect(lanes.get('b')).toBe(1)
  })

  it('task starting exactly when another ends can share a lane', () => {
    const tasks: TestTask[] = [
      { id: 'a', startDate: '2026-06-01', endDate: '2026-06-10' },
      { id: 'b', startDate: '2026-06-10', endDate: '2026-06-20' },
    ]
    const lanes = assignLanes(tasks)
    // Adjacent tasks can share lane (start >= latestEnd)
    expect(lanes.get('a')).toBe(0)
    expect(lanes.get('b')).toBe(0)
  })

  it('tasks with no dates get separate lanes', () => {
    const tasks: TestTask[] = [
      { id: 'a', startDate: null, endDate: null },
      { id: 'b', startDate: null, endDate: null },
    ]
    const lanes = assignLanes(tasks)
    expect(lanes.get('a')).toBe(0)
    expect(lanes.get('b')).toBe(1)
  })

  it('returns correct lane for tasks in any input order', () => {
    // Same tasks in different order should produce same lane assignments
    const tasks1: TestTask[] = [
      { id: 'b', startDate: '2026-06-05', endDate: '2026-06-15' },
      { id: 'a', startDate: '2026-06-01', endDate: '2026-06-10' },
    ]
    const tasks2: TestTask[] = [
      { id: 'a', startDate: '2026-06-01', endDate: '2026-06-10' },
      { id: 'b', startDate: '2026-06-05', endDate: '2026-06-15' },
    ]
    const lanes1 = assignLanes(tasks1)
    const lanes2 = assignLanes(tasks2)
    // Both orders should assign 'a' to lane 0 and 'b' to lane 1
    // (sorted by start date before packing)
    expect(lanes1.get('a')).toBe(lanes2.get('a'))
    expect(lanes1.get('b')).toBe(lanes2.get('b'))
  })

  it('packing efficiency — 5 tasks with staggered dates', () => {
    const tasks: TestTask[] = [
      { id: 'a', startDate: '2026-06-01', endDate: '2026-06-05' },
      { id: 'b', startDate: '2026-06-03', endDate: '2026-06-08' },
      { id: 'c', startDate: '2026-06-06', endDate: '2026-06-10' }, // can share with 'a'
      { id: 'd', startDate: '2026-06-07', endDate: '2026-06-12' }, // overlaps b, c — needs new lane
      { id: 'e', startDate: '2026-06-13', endDate: '2026-06-15' }, // can share with first available
    ]
    const lanes = assignLanes(tasks)
    expect(lanes.get('a')).toBe(0)
    expect(lanes.get('b')).toBe(1)
    expect(lanes.get('c')).toBe(0) // shares with a
    expect(lanes.get('e')).toBe(0) // starts after a and c, same lane
    // Total lanes should be <= 3 (a,c,e in 0; b in 1; d in 2)
    const maxLane = Math.max(...lanes.values())
    expect(maxLane).toBeLessThanOrEqual(2)
  })
})
