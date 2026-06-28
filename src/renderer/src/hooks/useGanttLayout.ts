import { useMemo } from 'react'
import type { TaskWithTags } from '@shared/task'

export type GanttZoom = 'day' | 'week' | 'month'

const ZOOM_CONFIG: Record<GanttZoom, { columnWidth: number; daysPerCell: number }> = {
  day: { columnWidth: 36, daysPerCell: 1 },
  week: { columnWidth: 64, daysPerCell: 7 },
  month: { columnWidth: 120, daysPerCell: 30 },
}

export const HEADER_HEIGHT = 48
export const ROW_HEIGHT = 40
const ROW_GAP = 2
const LABEL_WIDTH = 200
const MILESTONE_SIZE = 14

interface UseGanttLayoutInput {
  tasks: TaskWithTags[]
  zoom: GanttZoom
  visibleStart: Date
  visibleEnd: Date
}

export interface HeaderCell {
  label: string
  x: number
  width: number
  isWeekend?: boolean
}

export interface BarPosition {
  x: number
  y: number
  width: number
  height: number
  isMilestone: boolean
}

export interface UseGanttLayoutOutput {
  columnWidth: number
  totalWidth: number
  totalHeight: number
  headerCells: HeaderCell[]
  barPositions: Map<string, BarPosition>
  taskRows: Array<{ task: TaskWithTags; y: number }>
  todayX: number | null
  dateToX: (date: Date) => number
  xToDate: (x: number) => Date
  labelWidth: number
  rowHeight: number
  headerHeight: number
  milestoneSize: number
}

// ── Pure date helpers ──

function startOfDay(d: Date): Date {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

function isWeekend(d: Date): boolean {
  const day = d.getDay()
  return day === 0 || day === 6
}

function getWeekStart(d: Date): Date {
  const c = startOfDay(d)
  const day = c.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday start
  c.setDate(c.getDate() + diff)
  return c
}

function formatHeaderDate(d: Date, zoom: GanttZoom): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  switch (zoom) {
    case 'day':
      return `${days[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`
    case 'week': {
      const ws = getWeekStart(d)
      const monthName = months[ws.getMonth()]
      return `${monthName} W${Math.ceil((ws.getDate() + 6 - ws.getDay()) / 7) || 1}`
    }
    case 'month': {
      const year = d.getFullYear()
      const monthName = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()]
      return `${monthName} ${year}`
    }
  }
}

// ── Hook ──

export function useGanttLayout({
  tasks,
  zoom,
  visibleStart,
  visibleEnd,
}: UseGanttLayoutInput): UseGanttLayoutOutput {
  return useMemo(() => {
    const { columnWidth, daysPerCell } = ZOOM_CONFIG[zoom]

    // Ensure visible range covers at least 1 cell
    const vs = startOfDay(visibleStart)
    let ve = startOfDay(visibleEnd)
    if (daysBetween(vs, ve) < daysPerCell) {
      ve = addDays(vs, daysPerCell * (zoom === 'month' ? 3 : zoom === 'week' ? 4 : 14))
    }

    const totalDays = daysBetween(vs, ve)
    const totalWidth = Math.max(totalDays * columnWidth, columnWidth)

    // Date ↔ x conversion
    const dateToX = (date: Date): number => {
      return daysBetween(vs, startOfDay(date)) * columnWidth
    }

    const xToDate = (x: number): Date => {
      const days = Math.round(x / columnWidth)
      return addDays(vs, days)
    }

    // ── Header cells ──
    const headerCells: HeaderCell[] = []
    if (zoom === 'day') {
      for (let i = 0; i < totalDays; i++) {
        const d = addDays(vs, i)
        headerCells.push({
          label: formatHeaderDate(d, zoom),
          x: i * columnWidth,
          width: columnWidth,
          isWeekend: isWeekend(d),
        })
      }
    } else if (zoom === 'week') {
      const ws = getWeekStart(vs)
      let cursor = new Date(ws)
      while (cursor < ve) {
        const next = addDays(cursor, 7)
        headerCells.push({
          label: formatHeaderDate(cursor, zoom),
          x: daysBetween(vs, cursor) * columnWidth,
          width: 7 * columnWidth,
        })
        cursor = next
      }
    } else {
      // month
      let cursor = new Date(vs.getFullYear(), vs.getMonth(), 1)
      while (cursor < ve) {
        const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
        headerCells.push({
          label: formatHeaderDate(cursor, zoom),
          x: daysBetween(vs, cursor) * columnWidth,
          width: daysBetween(cursor, next) * columnWidth,
        })
        cursor = next
      }
    }

    // ── Task rows ──
    const taskRows: Array<{ task: TaskWithTags; y: number }> = tasks.map((task, idx) => ({
      task,
      y: HEADER_HEIGHT + idx * (ROW_HEIGHT + ROW_GAP),
    }))

    const totalHeight = HEADER_HEIGHT + tasks.length * (ROW_HEIGHT + ROW_GAP)

    // ── Bar positions ──
    const barPositions = new Map<string, BarPosition>()
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      const y = HEADER_HEIGHT + i * (ROW_HEIGHT + ROW_GAP)
      const isMilestone = task.is_milestone

      if (isMilestone) {
        // Only need start_date; center the diamond on that date
        if (task.start_date) {
          const cx = dateToX(new Date(task.start_date + 'T00:00:00'))
          barPositions.set(task.id, {
            x: cx - MILESTONE_SIZE / 2,
            y: y + (ROW_HEIGHT - MILESTONE_SIZE) / 2,
            width: MILESTONE_SIZE,
            height: MILESTONE_SIZE,
            isMilestone: true,
          })
        }
      } else {
        // Bar from start_date to end_date
        const sd = task.start_date ? new Date(task.start_date + 'T00:00:00') : null
        const ed = task.end_date ? new Date(task.end_date + 'T00:00:00') : null

        if (sd && ed) {
          const x = dateToX(sd)
          const width = Math.max(dateToX(ed) - x, columnWidth * 0.5) // minimum visible bar
          barPositions.set(task.id, {
            x,
            y: y + 4,
            width,
            height: ROW_HEIGHT - 8,
            isMilestone: false,
          })
        }
      }
    }

    // ── Today line ──
    const today = startOfDay(new Date())
    const todayX = today >= vs && today <= ve ? dateToX(today) + columnWidth / 2 : null

    return {
      columnWidth,
      totalWidth: totalWidth + LABEL_WIDTH,
      totalHeight: Math.max(totalHeight, 200),
      headerCells,
      barPositions,
      taskRows,
      todayX: todayX !== null ? todayX + LABEL_WIDTH : null,
      dateToX: (d) => dateToX(d) + LABEL_WIDTH,
      xToDate: (x) => xToDate(x - LABEL_WIDTH),
      labelWidth: LABEL_WIDTH,
      rowHeight: ROW_HEIGHT,
      headerHeight: HEADER_HEIGHT,
      milestoneSize: MILESTONE_SIZE,
    }
  }, [tasks, zoom, visibleStart, visibleEnd])
}
