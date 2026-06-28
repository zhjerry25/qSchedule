import { useState } from 'react'
import { useUIStore } from '../../stores/ui-store'
import { useTasks } from '../../hooks/useTasks'
import { useTaskMutations } from '../../hooks/useTaskMutations'
import { useCompleteTask } from '../../hooks/useCompleteTask'
import {
  SECTION_LABELS,
  SECTION_EMPTY_TITLES,
  SECTION_EMPTY_DESCRIPTIONS,
} from '../../lib/constants'
import type { SectionKey } from '../../lib/constants'
import { partitionTasks } from '../../lib/date-utils'
import { TodoCard } from '../todo/TodoCard'
import { TodoForm } from '../todo/TodoForm'
import { QuickAddInput } from '../todo/QuickAddInput'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { EmptyState } from '../ui/EmptyState'
import type { TaskWithTags } from '@shared/task'

export function CardStream() {
  const selectedTagIds = useUIStore((s) => s.selectedTagIds)
  const openCreateDialog = useUIStore((s) => s.openCreateDialog)

  const { tasks, isLoading, isError, error } = useTasks(selectedTagIds)
  const { deleteTask } = useTaskMutations()
  const { toggleComplete, isPending: isCompleting } = useCompleteTask()

  // ── Local UI state ──
  const [editingTask, setEditingTask] = useState<TaskWithTags | null>(null)
  const [deletingTask, setDeletingTask] = useState<TaskWithTags | null>(null)

  // ── Loading ──
  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-400">Loading...</p>
      </main>
    )
  }

  // ── Error ──
  if (isError) {
    return (
      <main className="flex-1 flex items-center justify-center bg-neutral-50">
        <EmptyState
          title="Something went wrong"
          description={error?.message || 'An unexpected error occurred'}
        />
      </main>
    )
  }

  // ── Partition tasks into sections ──
  const sections = partitionTasks(tasks)
  const sectionEntries: { key: SectionKey; tasks: TaskWithTags[] }[] = [
    { key: 'today', tasks: sections.today },
    { key: 'week', tasks: sections.week },
    { key: 'later', tasks: sections.later },
  ]

  // ── Render ──
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-4 space-y-6">
        {/* Quick-add input — always visible at top */}
        <QuickAddInput />

        {/* Sections */}
        {sectionEntries.map(({ key, tasks: sectionTasks }) => (
          <section key={key}>
            {/* Section header */}
            <h2 className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-neutral-700">
                {SECTION_LABELS[key]}
              </span>
              <span className="text-xs text-neutral-400 tabular-nums">
                {sectionTasks.length}
              </span>
            </h2>

            {/* Section content */}
            {sectionTasks.length === 0 ? (
              <EmptyState
                title={SECTION_EMPTY_TITLES[key]}
                description={SECTION_EMPTY_DESCRIPTIONS[key]}
                action={
                  key === 'today'
                    ? {
                        label: 'Create Task',
                        onClick: openCreateDialog,
                      }
                    : undefined
                }
              />
            ) : (
              <div className="space-y-2">
                {sectionTasks.map((task) => (
                  <TodoCard
                    key={task.id}
                    task={task}
                    onEdit={setEditingTask}
                    onDelete={setDeletingTask}
                    onToggleComplete={toggleComplete}
                    isCompleting={isCompleting}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
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
        title="Delete Task"
        description={
          deletingTask
            ? `Delete "${deletingTask.title}"? This action cannot be undone.`
            : ''
        }
        variant="danger"
        confirmLabel="Delete"
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
