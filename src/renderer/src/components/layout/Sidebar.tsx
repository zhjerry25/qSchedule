import { useUIStore } from '../../stores/ui-store'

// WebkitAppRegion is a macOS Electron property not in React's CSSProperties
const DRAG = { WebkitAppRegion: 'drag' } as React.CSSProperties
const NO_DRAG = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

export function Sidebar() {
  const openCreateDialog = useUIStore((s) => s.openCreateDialog)
  const openSettings = useUIStore((s) => s.openSettings)

  return (
    <aside className="w-[280px] h-screen flex flex-col bg-white border-r border-neutral-200 select-none">
      {/* Header — safe area for macOS traffic lights */}
      <header
        className="h-[52px] flex items-center px-5 border-b border-neutral-100"
        style={{ paddingLeft: '80px', ...DRAG }}
      >
        <span className="text-sm font-semibold text-neutral-800">
          Time Planner
        </span>
      </header>

      {/* Tag filter area — Phase 5 will expand this */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" style={NO_DRAG}>
        <div className="px-3 py-1">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Tags
          </p>
          <p className="mt-2 text-xs text-neutral-300 italic">No tags yet</p>
        </div>
      </nav>

      {/* Bottom section */}
      <footer className="px-3 py-3 border-t border-neutral-100 space-y-1" style={NO_DRAG}>
        <button
          onClick={openCreateDialog}
          className="w-full text-left px-3 py-2 rounded-smooth text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          + New Task
        </button>
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
