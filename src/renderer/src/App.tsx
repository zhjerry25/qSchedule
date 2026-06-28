import { useEffect } from 'react'
import { AppShell } from './components/layout/AppShell'
import { TodoForm } from './components/todo/TodoForm'
import { SettingsDialog } from './components/settings/SettingsDialog'
import { useUIStore } from './stores/ui-store'

export default function App() {
  const isCreateDialogOpen = useUIStore((s) => s.isCreateDialogOpen)
  const closeCreateDialog = useUIStore((s) => s.closeCreateDialog)
  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen)
  const closeSettings = useUIStore((s) => s.closeSettings)
  const openCreateDialog = useUIStore((s) => s.openCreateDialog)

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

  return (
    <>
      <AppShell />
      <TodoForm
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeCreateDialog()
        }}
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
