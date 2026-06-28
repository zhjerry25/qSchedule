import { useI18n } from '../../i18n'
import type { Frequency } from '@shared/task'

const FREQUENCIES: Frequency[] = ['once', 'daily', 'weekly', 'deadline']

interface FrequencySelectorProps {
  value: Frequency
  onChange: (f: Frequency) => void
  disabled?: boolean
}

export function FrequencySelector({
  value,
  onChange,
  disabled = false,
}: FrequencySelectorProps) {
  const { t } = useI18n()

  return (
    <div className="inline-flex" role="radiogroup" aria-label={t.todo.frequency}>
      {FREQUENCIES.map((freq, i) => {
        const isActive = value === freq
        const isFirst = i === 0
        const isLast = i === FREQUENCIES.length - 1

        return (
          <button
            key={freq}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => onChange(freq)}
            className={[
              'px-3 py-1.5 text-xs font-medium transition-colors border border-neutral-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:z-10',
              isFirst && 'rounded-l-smooth',
              isLast && 'rounded-r-smooth',
              !isFirst && 'border-l-0',
              isActive
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 hover:bg-neutral-100',
              disabled && 'opacity-50 pointer-events-none',
            ].join(' ')}
          >
            {t.frequency[freq]}
          </button>
        )
      })}
    </div>
  )
}
