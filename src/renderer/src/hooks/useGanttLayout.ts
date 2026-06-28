import { useMemo } from 'react'
import type { TaskWithTags } from '@shared/task'
import { startOfDay, addDays, daysBetween, isWeekend, getWeekStart } from '../lib/date-utils'

export type GanttZoom = 'day' | 'week' | 'month'

const ZOOM_CONFIG: Record<GanttZoom, { daysPerCell: number; cellWidth: number }> = {
  day:   { daysPerCell: 1,  cellWidth: 96  },
  week:  { daysPerCell: 7,  cellWidth: 96  },
  month: { daysPerCell: 30, cellWidth: 160 },
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
  dayWidth: number
  totalWidth: number
  totalHeight: number
  headerCells: HeaderCell[]
  barPositions: Map<string, BarPosition>
  milestonePositions: Map<string, BarPosition>
  taskRows: Array<{ task: TaskWithTags; y: number }>
  todayX: number
  dateToX: (date: Date) => number
  xToDate: (x: number) => Date
  labelWidth: number
  rowHeight: number
  headerHeight: number
  milestoneSize: number
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
    const { daysPerCell, cellWidth } = ZOOM_CONFIG[zoom]
    const dayWidth = cellWidth / daysPerCell

    // Ensure visible range covers at least 1 cell
    const vs = startOfDay(visibleStart)
    let ve = startOfDay(visibleEnd)
    if (daysBetween(vs, ve) < daysPerCell) {
      ve = addDays(vs, daysPerCell * (zoom === 'month' ? 3 : zoom === 'week' ? 4 : 14))
    }

    const totalDays = daysBetween(vs, ve)
    const totalWidth = Math.max(totalDays * dayWidth, cellWidth)

    // Date ↔ x conversion
    const dateToX = (date: Date): number => {
      return daysBetween(vs, startOfDay(date)) * dayWidth
    }

    const xToDate = (x: number): Date => {
      const days = Math.round(x / dayWidth)
      return addDays(vs, days)
    }

    // ── Header cells ──
    // All x values include LABEL_WIDTH so the coordinate system is consistent
    // with todayX, dateToX, and xToDate. offsetX() in the timeline subtracts it.
    const headerCells: HeaderCell[] = []
    if (zoom === 'day') {
      for (let i = 0; i < totalDays; i++) {
        const d = addDays(vs, i)
        headerCells.push({
          label: formatHeaderDate(d, zoom),
          x: i * cellWidth + LABEL_WIDTH,
          width: cellWidth,
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
          x: daysBetween(vs, cursor) * dayWidth + LABEL_WIDTH,
          width: cellWidth,
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
          x: daysBetween(vs, cursor) * dayWidth + LABEL_WIDTH,
          width: cellWidth,
        })
        cursor = next
      }
    }

    // ── Lane assignment (first-fit by start date) ──

    interface Lane {
      latestEnd: Date
    }

    // Sort tasks: by start_date ASC (nulls last), then by duration DESC
    const sortedTasks = [...tasks].sort((a, b) => {
      const aStart = a.start_date ?? '9999-12-31'
      const bStart = b.start_date ?? '9999-12-31'
      if (aStart !== bStart) return aStart.localeCompare(bStart)
      // Longer duration first (better packing)
      const aDur = a.start_date && a.end_date
        ? daysBetween(new Date(a.start_date + 'T00:00:00'), new Date(a.end_date + 'T00:00:00'))
        : 0
      const bDur = b.start_date && b.end_date
        ? daysBetween(new Date(b.start_date + 'T00:00:00'), new Date(b.end_date + 'T00:00:00'))
        : 0
      return bDur - aDur
    })

    const lanes: Lane[] = []
    const taskLaneMap = new Map<string, number>() // taskId → laneIndex

    for (const task of sortedTasks) {
      const taskStart = task.start_date ? new Date(task.start_date + 'T00:00:00') : null
      const taskEnd = task.end_date ? new Date(task.end_date + 'T00:00:00') : taskStart

      if (!taskStart) {
        // No date at all — assign to a new lane
        taskLaneMap.set(task.id, lanes.length)
        lanes.push({ latestEnd: new Date(0) })
        continue
      }

      // First-fit: find existing lane where task starts after lane's latest end
      let assigned = false
      for (let li = 0; li < lanes.length; li++) {
        if (taskStart >= lanes[li].latestEnd) {
          taskLaneMap.set(task.id, li)
          if (taskEnd && taskEnd > lanes[li].latestEnd) {
            lanes[li].latestEnd = taskEnd
          }
          assigned = true
          break
        }
      }

      if (!assigned) {
        taskLaneMap.set(task.id, lanes.length)
        lanes.push({ latestEnd: taskEnd ?? taskStart })
      }
    }

    // ── Task rows (ordered by original array for label column consistency) ──
    const taskRows: Array<{ task: TaskWithTags; y: number }> = tasks.map((task) => ({
      task,
      y: HEADER_HEIGHT + (taskLaneMap.get(task.id) ?? 0) * (ROW_HEIGHT + ROW_GAP),
    }))

    const totalHeight = HEADER_HEIGHT + Math.max(lanes.length, 1) * (ROW_HEIGHT + ROW_GAP)

    // ── Bar positions ──
    // All x values include LABEL_WIDTH for consistent coordinate system.
    // offsetX() in the timeline subtracts it to map to SVG coordinates.
    const barPositions = new Map<string, BarPosition>()
    const milestonePositions = new Map<string, BarPosition>()
    for (const task of tasks) {
      const laneIdx = taskLaneMap.get(task.id) ?? lanes.length
      const y = HEADER_HEIGHT + laneIdx * (ROW_HEIGHT + ROW_GAP)

      // Compute regular bar position (from start_date to end_date) for ALL tasks
      // that have dates, even if they are milestones
      const sd = task.start_date ? new Date(task.start_date + 'T00:00:00') : null
      const ed = task.end_date ? new Date(task.end_date + 'T00:00:00') : null

      if (sd && ed) {
        const x = dateToX(sd) + LABEL_WIDTH
        const width = Math.max(dateToX(ed) - dateToX(sd), Math.max(dayWidth * 0.5, 2))
        barPositions.set(task.id, {
          x,
          y: y + 4,
          width,
          height: ROW_HEIGHT - 8,
          isMilestone: false,
        })
      }

      // For milestone tasks, also compute the diamond marker
      if (task.is_milestone) {
        const mDate = task.milestone_date ?? task.start_date
        if (mDate) {
          const cx = dateToX(new Date(mDate + 'T00:00:00')) + LABEL_WIDTH
          milestonePositions.set(task.id, {
            x: cx - MILESTONE_SIZE / 2,
            y: y + (ROW_HEIGHT - MILESTONE_SIZE) / 2,
            width: MILESTONE_SIZE,
            height: MILESTONE_SIZE,
            isMilestone: true,
          })
        }
      }
    }

    // ── Today line ──
    const today = startOfDay(new Date())
    const todayX = dateToX(today)

    return {
      dayWidth,
      totalWidth: totalWidth + LABEL_WIDTH,
      totalHeight: Math.max(totalHeight, 200),
      headerCells,
      barPositions,
      milestonePositions,
      taskRows,
      todayX: todayX + LABEL_WIDTH,
      dateToX: (d) => dateToX(d) + LABEL_WIDTH,
      xToDate: (x) => xToDate(x - LABEL_WIDTH),
      labelWidth: LABEL_WIDTH,
      rowHeight: ROW_HEIGHT,
      headerHeight: HEADER_HEIGHT,
      milestoneSize: MILESTONE_SIZE,
    }
  }, [tasks, zoom, visibleStart, visibleEnd])
}
