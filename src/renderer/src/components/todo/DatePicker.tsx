import * as Popover from '@radix-ui/react-popover'
import { DayPicker } from 'react-day-picker'
import { formatSmartDate } from '../../lib/date-utils'
import { useI18n } from '../../i18n'
import 'react-day-picker/style.css'

interface DatePickerProps {
  value: string | null
  onChange: (date: string | null) => void
  placeholder?: string
  disabled?: boolean
  /** Earliest selectable date. Defaults to today (past dates disabled). */
  minDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  minDate,
}: DatePickerProps) {
  const { t, locale } = useI18n()
  const selected = value ? new Date(value + 'T00:00:00') : undefined
  const defaultPlaceholder = placeholder ?? t.todo.pickDate
  const displayText = (() => {
    if (!value) return defaultPlaceholder
    const sd = formatSmartDate(value, { includeWeekday: true, locale })
    if (!sd) return value
    switch (sd.kind) {
      case 'today': return t.todo.today
      case 'tomorrow': return t.todo.tomorrow
      case 'yesterday': return t.todo.yesterday
      case 'date': return sd.label
    }
  })()
  const disableBefore = minDate ?? new Date(new Date().setHours(0, 0, 0, 0))

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={[
            'inline-flex items-center gap-2 h-9 px-3 text-sm rounded-smooth border transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:border-transparent',
            value
              ? 'border-neutral-200 text-neutral-900 bg-white'
              : 'border-neutral-200 text-neutral-400 bg-white',
            !disabled && 'hover:border-neutral-300',
            disabled && 'opacity-50 pointer-events-none',
          ].join(' ')}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-neutral-400 flex-shrink-0"
          >
            <path
              d="M4.5 1C4.77614 1 5 1.22386 5 1.5V2H10V1.5C10 1.22386 10.2239 1 10.5 1C10.7761 1 11 1.22386 11 1.5V2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H4V1.5C4 1.22386 4.22386 1 4.5 1ZM2.5 3C2.22386 3 2 3.22386 2 3.5V5H13V3.5C13 3.22386 12.7761 3 12.5 3H2.5ZM2 6V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6H2Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
          <span>{displayText}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          align="start"
          className="z-50 bg-white rounded-smooth shadow-lg border border-neutral-200 p-3 animate-in fade-in-0 zoom-in-95"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (!date) { onChange(null); return }
              const y = date.getFullYear()
              const m = String(date.getMonth() + 1).padStart(2, '0')
              const d = String(date.getDate()).padStart(2, '0')
              onChange(`${y}-${m}-${d}`)
            }}
            disabled={{ before: disableBefore }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
