import { useState, useMemo } from 'react'
import { GanttToolbar } from './GanttToolbar'
import { GanttTimeline } from './GanttTimeline'
import type { GanttZoom } from '../../hooks/useGanttLayout'
import type { TaskWithTags } from '@shared/task'
import { startOfDay, addDays } from '../../lib/date-utils'
import { useI18n } from '../../i18n'

interface GanttPanelProps {
  tasks: TaskWithTags[]
  onAddTask: () => void
  onEditTask: (task: TaskWithTags) => void
  onDeleteTask: (task: TaskWithTags) => void
  onUpdateTask: (id: string, input: { start_date?: string | null; end_date?: string | null }) => void
  onCreateDependency: (childId: string, parentId: string) => void
}

function formatRange(start: Date, end: Date, locale?: string): string {
  const loc = locale ?? 'en-US'
  const s = start.toLocaleDateString(loc, { month: 'short', day: 'numeric' })
  const e = end.toLocaleDateString(loc, { month: 'short', day: 'numeric', year: 'numeric' })
  return `${s} – ${e}`
}

const ZOOM_SPAN: Record<GanttZoom, number> = {
  day:   60,   // ~2 months → SVG ≈ 5,760px
  week:  210,  // ~7 months → SVG ≈ 2,878px
  month: 720,  // ~2 years  → SVG ≈ 3,840px
}

export function GanttPanel({ tasks, onAddTask, onEditTask, onDeleteTask, onUpdateTask, onCreateDependency }: GanttPanelProps) {
  const { t, locale } = useI18n()
  const [zoom, setZoom] = useState<GanttZoom>('week')
  const [visibleStart, setVisibleStart] = useState<Date>(() => {
    // Center today in the viewport (same behavior as the "Today" button)
    return addDays(startOfDay(new Date()), -Math.floor(ZOOM_SPAN['week'] / 2))
  })
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [scrollToTodaySignal, setScrollToTodaySignal] = useState(0)

  const visibleEnd = useMemo(
    () => addDays(visibleStart, ZOOM_SPAN[zoom]),
    [visibleStart, zoom],
  )

  const dateRangeLabel = useMemo(
    () => formatRange(visibleStart, visibleEnd, locale),
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
    setVisibleStart(addDays(startOfDay(new Date()), -Math.floor(ZOOM_SPAN[zoom] / 2)))
    setScrollToTodaySignal((prev) => prev + 1)
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
          <p className="text-sm text-neutral-400">{t.gantt.noTasks}</p>
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
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          scrollToTodaySignal={scrollToTodaySignal}
        />
      )}
    </div>
  )
}
