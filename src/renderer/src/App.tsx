import { AppShell } from './components/layout/AppShell'
import { TodoForm } from './components/todo/TodoForm'
import { useUIStore } from './stores/ui-store'

export default function App() {
  const isCreateDialogOpen = useUIStore((s) => s.isCreateDialogOpen)
  const closeCreateDialog = useUIStore((s) => s.closeCreateDialog)

  return (
    <>
      <AppShell />
      <TodoForm
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeCreateDialog()
        }}
      />
    </>
  )
}
