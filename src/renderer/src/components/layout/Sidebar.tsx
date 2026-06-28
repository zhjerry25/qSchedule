import { useUIStore } from '../../stores/ui-store'
import { useTaskCounts } from '../../hooks/useTasks'
import { VIEWS, VIEW_LABELS } from '../../lib/constants'
import type { View } from '../../lib/constants'

export function Sidebar() {
  const activeView = useUIStore((s) => s.activeView)
  const setActiveView = useUIStore((s) => s.setActiveView)
  const openSettings = useUIStore((s) => s.openSettings)

  const { today, week, all } = useTaskCounts()

  const counts: Record<View, number> = {
    today,
    week,
    all,
  }

  const activeStyle =
    'bg-neutral-100 text-neutral-900 font-medium'
  const inactiveStyle =
    'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'

  return (
    <aside className="w-[280px] h-screen flex flex-col bg-white border-r border-neutral-200 select-none">
      {/* Header — safe area for macOS traffic lights */}
      <header
        className="h-[52px] flex items-center px-5 border-b border-neutral-100"
        style={{ paddingLeft: '80px' }}
      >
        <span className="text-sm font-semibold text-neutral-800">
          Time Planner
        </span>
      </header>

      {/* View navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {VIEWS.map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={[
              'w-full flex items-center justify-between px-3 py-2 rounded-smooth text-sm transition-colors',
              activeView === view ? activeStyle : inactiveStyle,
            ].join(' ')}
          >
            <span>{VIEW_LABELS[view]}</span>
            <span className="text-xs text-neutral-400 tabular-nums">
              {counts[view]}
            </span>
          </button>
        ))}

        <hr className="my-3 border-neutral-100" />

        {/* Tag filter placeholder */}
        <div className="px-3 py-1">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Tags
          </p>
          <p className="mt-2 text-xs text-neutral-300 italic">No tags yet</p>
        </div>
      </nav>

      {/* Bottom section */}
      <footer className="px-3 py-3 border-t border-neutral-100 space-y-1">
        <button
          onClick={openSettings}
          className="w-full text-left px-3 py-2 rounded-smooth text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 transition-colors"
        >
          Settings
        </button>
      </footer>
    </aside>
  )
}
