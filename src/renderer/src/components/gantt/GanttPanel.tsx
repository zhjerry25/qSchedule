import { useState, useMemo } from 'react'
import { GanttToolbar } from './GanttToolbar'
import { GanttTimeline } from './GanttTimeline'
import type { GanttZoom } from '../../hooks/useGanttLayout'
import type { TaskWithTags } from '@shared/task'

interface GanttPanelProps {
  tasks: TaskWithTags[]
  onAddTask: () => void
  onEditTask: (task: TaskWithTags) => void
  onDeleteTask: (task: TaskWithTags) => void
  onUpdateTask: (id: string, input: { start_date?: string | null; end_date?: string | null }) => void
  onCreateDependency: (childId: string, parentId: string) => void
}

function todayStart(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d)
  c.setDate(c.getDate() + n)
  return c
}

function formatRange(start: Date, end: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const s = `${months[start.getMonth()]} ${start.getDate()}`
  const e = `${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
  return `${s} – ${e}`
}

const ZOOM_SPAN: Record<GanttZoom, number> = {
  day: 14,
  week: 8 * 7, // 8 weeks
  month: 6 * 30, // ~6 months
}

export function GanttPanel({ tasks, onAddTask, onUpdateTask, onCreateDependency }: GanttPanelProps) {
  const [zoom, setZoom] = useState<GanttZoom>('week')
  const [visibleStart, setVisibleStart] = useState<Date>(() => {
    // Start 2 weeks before today for week view
    return addDays(todayStart(), -14)
  })
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const visibleEnd = useMemo(
    () => addDays(visibleStart, ZOOM_SPAN[zoom]),
    [visibleStart, zoom],
  )

  const dateRangeLabel = useMemo(
    () => formatRange(visibleStart, visibleEnd),
    [visibleStart, visibleEnd],
  )

  const handleZoomChange = (newZoom: GanttZoom) => {
    // Keep the center date when changing zoom
    const midDate = addDays(visibleStart, Math.floor(ZOOM_SPAN[zoom] / 2))
    setVisibleStart(addDays(midDate, -Math.floor(ZOOM_SPAN[newZoom] / 2)))
    setZoom(newZoom)
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    const span = ZOOM_SPAN[zoom]
    const step = Math.floor(span / 3) // move by 1/3 of visible range
    setVisibleStart((prev) => addDays(prev, direction === 'prev' ? -step : step))
  }

  const handleToday = () => {
    setVisibleStart(addDays(todayStart(), -Math.floor(ZOOM_SPAN[zoom] / 3)))
  }

  const handleSelectTask = (task: TaskWithTags | null) => {
    setSelectedTaskId(task?.id ?? null)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <GanttToolbar
        zoom={zoom}
        onZoomChange={handleZoomChange}
        onNavigate={handleNavigate}
        onToday={handleToday}
        onAddTask={onAddTask}
        dateRangeLabel={dateRangeLabel}
      />
      {tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-neutral-400">No tasks in this date range</p>
        </div>
      ) : (
        <GanttTimeline
          tasks={tasks}
          zoom={zoom}
          visibleStart={visibleStart}
          visibleEnd={visibleEnd}
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask}
          onUpdateTask={onUpdateTask}
          onCreateDependency={onCreateDependency}
        />
      )}
    </div>
  )
}
