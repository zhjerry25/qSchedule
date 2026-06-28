import { useUIStore, type ActiveView } from '../../stores/ui-store'
import { TagFilter } from '../tags/TagFilter'
import { useI18n } from '../../i18n'

// WebkitAppRegion is a macOS Electron property not in React's CSSProperties
const DRAG = { WebkitAppRegion: 'drag' } as React.CSSProperties
const NO_DRAG = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

export function Sidebar() {
  const activeView = useUIStore((s) => s.activeView)
  const setActiveView = useUIStore((s) => s.setActiveView)
  const openCreateDialog = useUIStore((s) => s.openCreateDialog)
  const openGanttForm = useUIStore((s) => s.openGanttForm)
  const openSettings = useUIStore((s) => s.openSettings)
  const selectedTagIds = useUIStore((s) => s.selectedTagIds)
  const clearTagFilters = useUIStore((s) => s.clearTagFilters)
  const { t } = useI18n()

  const navItems: { view: ActiveView; label: string }[] = [
    { view: 'tasks', label: t.nav.tasks },
    { view: 'gantt', label: t.nav.gantt },
  ]

  const handleCreateClick = () => {
    if (activeView === 'gantt') {
      openGanttForm()
    } else {
      openCreateDialog()
    }
  }

  return (
    <aside className="w-[280px] h-screen flex flex-col bg-white border-r border-neutral-200 select-none">
      {/* Header — safe area for macOS traffic lights */}
      <header
        className="h-[52px] flex items-center px-5 border-b border-neutral-100"
        style={{ paddingLeft: '80px', ...DRAG }}
      >
        <span className="text-sm font-semibold text-neutral-800">
          {t.app.name}
        </span>
      </header>

      {/* View navigation */}
      <nav className="px-3 pt-4 pb-2 space-y-0.5" style={NO_DRAG}>
        <p className="px-3 py-1 text-xs font-medium text-neutral-400 uppercase tracking-wider">
          {t.app.name}
        </p>
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setActiveView(item.view)}
            className={`w-full text-left px-3 py-2 rounded-smooth text-sm transition-colors ${
              activeView === item.view
                ? 'bg-neutral-100 font-semibold text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Tag filter area */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" style={NO_DRAG}>
        <div className="px-3 py-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              {t.todo.tags}
            </p>
            {selectedTagIds.length > 0 && (
              <button
                onClick={clearTagFilters}
                className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {t.tag.clear}
              </button>
            )}
          </div>
          <TagFilter />
        </div>
      </nav>

      {/* Bottom section */}
      <footer className="px-3 py-3 border-t border-neutral-100 space-y-1" style={NO_DRAG}>
        <button
          onClick={handleCreateClick}
          className="w-full text-left px-3 py-2 rounded-smooth text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          + {activeView === 'gantt' ? t.gantt.newTask : t.todo.newTask}
        </button>
        <button
          onClick={openSettings}
          className="w-full text-left px-3 py-2 rounded-smooth text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 transition-colors"
        >
          {t.settings.title}
        </button>
      </footer>
    </aside>
  )
}
