import { useState } from 'react'
import { useUIStore } from '../../stores/ui-store'
import { useTasks } from '../../hooks/useTasks'
import { useTaskMutations } from '../../hooks/useTaskMutations'
import { useCompleteTask } from '../../hooks/useCompleteTask'
import { partitionTasks } from '../../lib/date-utils'
import { SectionPanel } from './SectionPanel'
import { TodoForm } from '../todo/TodoForm'
import { QuickAddInput } from '../todo/QuickAddInput'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import { useI18n } from '../../i18n'
import type { TaskWithTags } from '@shared/task'

export function CardStream() {
  const selectedTagIds = useUIStore((s) => s.selectedTagIds)
  const openCreateDialog = useUIStore((s) => s.openCreateDialog)

  const { tasks, isLoading, isError, error } = useTasks(selectedTagIds)
  const { deleteTask } = useTaskMutations()
  const { toggleComplete, isPending: isCompleting } = useCompleteTask()
  const { t } = useI18n()

  // ── Local UI state ──
  const [editingTask, setEditingTask] = useState<TaskWithTags | null>(null)
  const [deletingTask, setDeletingTask] = useState<TaskWithTags | null>(null)

  // ── Loading ──
  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-400">{t.app.loading}</p>
      </main>
    )
  }

  // ── Error ──
  if (isError) {
    return (
      <main className="flex-1 flex items-center justify-center bg-neutral-50">
        <EmptyState
          title={t.error.somethingWentWrong}
          description={error?.message || t.error.unknown}
        />
      </main>
    )
  }

  // ── Partition tasks into sections ──
  const sections = partitionTasks(tasks)

  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50">
      <div className="px-6 py-4 space-y-8">
        {/* Quick-add input — always visible at top */}
        <QuickAddInput />

        {/* Whiteboard sections */}
        <SectionPanel
          sectionKey="today"
          tasks={sections.today}
          onEdit={setEditingTask}
          onDelete={setDeletingTask}
          onToggleComplete={toggleComplete}
          isCompleting={isCompleting}
          onCreateClick={openCreateDialog}
        />
        <SectionPanel
          sectionKey="week"
          tasks={sections.week}
          onEdit={setEditingTask}
          onDelete={setDeletingTask}
          onToggleComplete={toggleComplete}
          isCompleting={isCompleting}
        />
        <SectionPanel
          sectionKey="later"
          tasks={sections.later}
          onEdit={setEditingTask}
          onDelete={setDeletingTask}
          onToggleComplete={toggleComplete}
          isCompleting={isCompleting}
        />
      </div>

      {/* Edit dialog */}
      <TodoForm
        open={editingTask !== null}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null)
        }}
        task={editingTask ?? undefined}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deletingTask !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingTask(null)
        }}
        title={t.todo.deleteTitle}
        description={
          deletingTask
            ? t.todo.deleteConfirm.replace('{title}', deletingTask.title)
            : ''
        }
        variant="danger"
        confirmLabel={t.todo.delete}
        loading={deleteTask.isPending}
        onConfirm={() => {
          if (deletingTask) {
            deleteTask.mutate(deletingTask.id)
            setDeletingTask(null)
          }
        }}
      />
    </main>
  )
}
