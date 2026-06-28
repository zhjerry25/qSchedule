import { Sidebar } from './Sidebar'
import { CardStream } from './CardStream'
import { GanttApp } from '../gantt/GanttApp'
import { useUIStore } from '../../stores/ui-store'

// WebkitAppRegion for Electron window dragging on macOS
const DRAG = { WebkitAppRegion: 'drag' } as React.CSSProperties
const NO_DRAG = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

export function AppShell() {
  const activeView = useUIStore((s) => s.activeView)

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Drag handle matching sidebar header height (52px) for full-width window dragging.
             Without this, the window can only be dragged from the sidebar area. */}
        <div
          className="h-[52px] shrink-0"
          style={DRAG}
        />
        <div className="flex-1 flex flex-col overflow-hidden" style={NO_DRAG}>
          {activeView === 'gantt' ? <GanttApp /> : <CardStream />}
        </div>
      </div>
    </div>
  )
}
