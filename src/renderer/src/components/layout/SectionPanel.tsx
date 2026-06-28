import { FrequencyCard } from './FrequencyCard'
import { EmptyState } from '../ui/EmptyState'
import { useI18n } from '../../i18n'
import type { SectionKey } from '../../lib/constants'
import type { Frequency, TaskWithTags } from '@shared/task'

interface SectionPanelProps {
  sectionKey: SectionKey
  tasks: TaskWithTags[]
  onEdit: (task: TaskWithTags) => void
  onDelete: (task: TaskWithTags) => void
  onToggleComplete: (task: TaskWithTags) => void
  isCompleting: boolean
  onCreateClick?: () => void
}

const allFrequencies: Frequency[] = ['daily', 'once', 'deadline', 'weekly']

const emptyTitleMap: Record<SectionKey, keyof ReturnType<typeof useI18n>['t']['empty']> = {
  today: 'todayTitle' as const,
  week: 'weekTitle' as const,
  later: 'laterTitle' as const,
}

const emptyDescMap: Record<SectionKey, keyof ReturnType<typeof useI18n>['t']['empty']> = {
  today: 'todayDesc' as const,
  week: 'weekDesc' as const,
  later: 'laterDesc' as const,
}

/**
 * A visual grouping of tasks for one time section (Today/This Week/Later).
 * Internally splits tasks by frequency into FrequencyCard components
 * arranged in a responsive CSS Grid.
 */
export function SectionPanel({
  sectionKey,
  tasks,
  onEdit,
  onDelete,
  onToggleComplete,
  isCompleting,
  onCreateClick,
}: SectionPanelProps) {
  const { t } = useI18n()

  // Partition by frequency
  function tasksForFreq(freq: Frequency): TaskWithTags[] {
    return tasks.filter((t) => t.frequency === freq)
  }

  // Determine which frequencies should appear in this section
  const visibleFrequencies = allFrequencies.filter((freq) => {
    const freqTasks = tasksForFreq(freq)
    // Always show daily and weekly if they have tasks
    // For once/deadline, only show if there are tasks in this section
    return freqTasks.length > 0
  })

  return (
    <section>
      {/* Section header */}
      <h2 className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-neutral-700">
          {t.section[sectionKey]}
        </span>
        <span className="text-xs text-neutral-400 tabular-nums">
          {tasks.length}
        </span>
      </h2>

      {/* Section content */}
      {tasks.length === 0 ? (
        <EmptyState
          title={t.empty[emptyTitleMap[sectionKey]]}
          description={t.empty[emptyDescMap[sectionKey]]}
          action={
            sectionKey === 'today' && onCreateClick
              ? { label: t.empty.createTask, onClick: onCreateClick }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {visibleFrequencies.map((freq) => (
            <FrequencyCard
              key={freq}
              frequency={freq}
              tasks={tasksForFreq(freq)}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              isCompleting={isCompleting}
            />
          ))}
        </div>
      )}
    </section>
  )
}
