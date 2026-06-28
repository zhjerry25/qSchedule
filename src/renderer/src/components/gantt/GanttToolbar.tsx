import { useI18n } from '../../i18n'
import type { GanttZoom } from '../../hooks/useGanttLayout'

interface GanttToolbarProps {
  zoom: GanttZoom
  onZoomChange: (zoom: GanttZoom) => void
  onNavigate: (direction: 'prev' | 'next') => void
  onToday: () => void
  onAddTask: () => void
  dateRangeLabel: string
}

const ZOOM_OPTIONS: { value: GanttZoom; i18nKey: 'zoomDay' | 'zoomWeek' | 'zoomMonth' }[] = [
  { value: 'day', i18nKey: 'zoomDay' },
  { value: 'week', i18nKey: 'zoomWeek' },
  { value: 'month', i18nKey: 'zoomMonth' },
]

export function GanttToolbar({
  zoom,
  onZoomChange,
  onNavigate,
  onToday,
  onAddTask,
  dateRangeLabel,
}: GanttToolbarProps) {
  const { t } = useI18n()

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 bg-white">
      {/* Left: zoom + navigation */}
      <div className="flex items-center gap-2">
        {/* Zoom segmented control */}
        <div className="inline-flex rounded-smooth border border-neutral-200 overflow-hidden">
          {ZOOM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onZoomChange(opt.value)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                zoom === opt.value
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {t.gantt[opt.i18nKey]}
            </button>
          ))}
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-0.5 ml-2">
          <button
            onClick={() => onNavigate('prev')}
            className="inline-flex items-center justify-center w-7 h-7 rounded-smooth text-neutral-500 hover:bg-neutral-100 transition-colors"
            title="Previous"
          >
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
            </svg>
          </button>
          <button
            onClick={onToday}
            className="px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 rounded-smooth transition-colors"
          >
            {t.gantt.today}
          </button>
          <button
            onClick={() => onNavigate('next')}
            className="inline-flex items-center justify-center w-7 h-7 rounded-smooth text-neutral-500 hover:bg-neutral-100 transition-colors"
            title="Next"
          >
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <path d="M6.15818 3.13514C5.95673 3.32401 5.94652 3.64042 6.13538 3.84188L9.56479 7.49991L6.13538 11.1579C5.94652 11.3594 5.95673 11.6758 6.15818 11.8647C6.35964 12.0535 6.67606 12.0433 6.86492 11.8419L10.6149 7.84188C10.7952 7.64955 10.7952 7.35027 10.6149 7.15794L6.86492 3.15794C6.67606 2.95648 6.35964 2.94628 6.15818 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* Date range label */}
        <span className="text-xs text-neutral-400 ml-3 select-none">
          {dateRangeLabel}
        </span>
      </div>

      {/* Right: add button */}
      <button
        onClick={onAddTask}
        className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium text-white bg-neutral-900 rounded-smooth hover:bg-neutral-800 transition-colors"
      >
        + {t.gantt.newTask}
      </button>
    </div>
  )
}
