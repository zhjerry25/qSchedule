import { useEffect } from 'react'
import { AppShell } from './components/layout/AppShell'
import { TodoForm } from './components/todo/TodoForm'
import { GanttForm } from './components/gantt/GanttForm'
import { SettingsDialog } from './components/settings/SettingsDialog'
import { useUIStore } from './stores/ui-store'

export default function App() {
  const isCreateDialogOpen = useUIStore((s) => s.isCreateDialogOpen)
  const closeCreateDialog = useUIStore((s) => s.closeCreateDialog)
  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen)
  const closeSettings = useUIStore((s) => s.closeSettings)
  const openCreateDialog = useUIStore((s) => s.openCreateDialog)
  const isGanttFormOpen = useUIStore((s) => s.isGanttFormOpen)
  const editingGanttTask = useUIStore((s) => s.editingGanttTask)
  const closeGanttForm = useUIStore((s) => s.closeGanttForm)
  const setActiveView = useUIStore((s) => s.setActiveView)

  // Global keyboard shortcut: Cmd+N / Ctrl+N → new task
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        openCreateDialog()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openCreateDialog])

  // Global keyboard shortcut: Cmd+Shift+G / Ctrl+Shift+G → toggle Gantt view
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault()
        setActiveView('gantt')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveView])

  return (
    <>
      <AppShell />
      <TodoForm
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeCreateDialog()
        }}
      />
      <GanttForm
        open={isGanttFormOpen}
        onOpenChange={(open) => {
          if (!open) closeGanttForm()
        }}
        task={editingGanttTask}
      />
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={(open) => {
          if (!open) closeSettings()
        }}
      />
    </>
  )
}
