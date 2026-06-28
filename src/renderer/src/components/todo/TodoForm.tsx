import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { FrequencySelector } from './FrequencySelector'
import { DatePicker } from './DatePicker'
import { useTaskMutations } from '../../hooks/useTaskMutations'
import { todayISO } from '../../lib/date-utils'
import type { Frequency, TaskWithTags } from '@shared/task'

interface TodoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: TaskWithTags
}

export function TodoForm({ open, onOpenChange, task }: TodoFormProps) {
  const isEdit = task !== undefined
  const { createTask, updateTask } = useTaskMutations()

  // ── Form state ──
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('once')
  const [scheduledDate, setScheduledDate] = useState<string | null>(null)
  const [deadlineDate, setDeadlineDate] = useState<string | null>(null)
  const [description, setDescription] = useState('')

  // ── Reset form on open / task change ──
  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? '')
      setFrequency(task?.frequency ?? 'once')
      setScheduledDate(task?.scheduled_date ?? null)
      setDeadlineDate(task?.deadline ?? null)
      setDescription(task?.description ?? '')
    }
  }, [open, task])

  // ── Derived ──
  const titleValid = title.trim().length > 0
  const isPending = createTask.isPending || updateTask.isPending

  // ── Submit ──
  const handleSubmit = () => {
    if (!titleValid) return

    if (isEdit) {
      updateTask.mutate({
        id: task!.id,
        input: {
          title: title.trim(),
          description: description.trim() || undefined,
          frequency,
          scheduled_date: frequency === 'once' ? scheduledDate : null,
          deadline: frequency === 'deadline' ? deadlineDate : null,
        },
      })
    } else {
      createTask.mutate({
        id: crypto.randomUUID(),
        title: title.trim(),
        kind: 'todo',
        frequency,
        description: description.trim() || undefined,
        scheduled_date:
          frequency === 'once' ? (scheduledDate ?? todayISO()) : null,
        deadline: frequency === 'deadline' ? deadlineDate : null,
      })
    }

    onOpenChange(false)
  }

  // ── Error display ──
  const mutationError =
    createTask.error?.message ?? updateTask.error?.message ?? null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-smooth shadow-lg p-6 focus:outline-none max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-semibold text-neutral-900">
            {isEdit ? 'Edit Task' : 'New Task'}
          </Dialog.Title>

          <div className="mt-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && titleValid) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Frequency
              </label>
              <FrequencySelector
                value={frequency}
                onChange={setFrequency}
                disabled={isPending}
              />
            </div>

            {/* Date picker — shown for once and deadline */}
            {frequency === 'once' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Scheduled Date
                </label>
                <DatePicker
                  value={scheduledDate}
                  onChange={setScheduledDate}
                  placeholder="Today (default)"
                  disabled={isPending}
                />
              </div>
            )}

            {frequency === 'deadline' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Deadline
                </label>
                <DatePicker
                  value={deadlineDate}
                  onChange={setDeadlineDate}
                  placeholder="Pick a deadline"
                  disabled={isPending}
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Description{' '}
                <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details..."
                disabled={isPending}
              />
            </div>

            {/* Mutation error */}
            {mutationError && (
              <p className="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-smooth">
                {mutationError}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-smooth hover:bg-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!titleValid || isPending}
              className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-white bg-neutral-900 rounded-smooth hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
