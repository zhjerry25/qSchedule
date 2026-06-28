import { useState } from 'react'
import { useTaskMutations } from '../../hooks/useTaskMutations'
import { todayISO } from '../../lib/date-utils'
import { useI18n } from '../../i18n'

interface QuickAddInputProps {
  className?: string
}

export function QuickAddInput({ className = '' }: QuickAddInputProps) {
  const [value, setValue] = useState('')
  const { createTask } = useTaskMutations()
  const { t } = useI18n()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      createTask.mutate({
        id: crypto.randomUUID(),
        title: value.trim(),
        kind: 'todo',
        frequency: 'once',
        scheduled_date: todayISO(),
      })
      setValue('')
    }
  }

  return (
    <div className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t.todo.quickAddPlaceholder}
        disabled={createTask.isPending}
        className={[
          'w-full h-10 px-4 text-sm rounded-smooth border transition-colors',
          'placeholder:text-neutral-400',
          'focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent',
          'border-neutral-200 bg-white',
          createTask.isPending && 'opacity-50',
        ].join(' ')}
      />
    </div>
  )
}
