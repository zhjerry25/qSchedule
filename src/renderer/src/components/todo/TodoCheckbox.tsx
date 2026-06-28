import * as Checkbox from '@radix-ui/react-checkbox'
import type { Frequency } from '@shared/task'

interface TodoCheckboxProps {
  checked: boolean
  frequency: Frequency
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function TodoCheckbox({
  checked,
  frequency,
  onChange,
  disabled = false,
}: TodoCheckboxProps) {
  // Once tasks that are completed cannot be unchecked (single-completion lock)
  const isLocked = checked && frequency === 'once'
  const isDisabled = disabled || isLocked

  return (
    <Checkbox.Root
      checked={checked}
      onCheckedChange={() => onChange(!checked)}
      disabled={isDisabled}
      className={[
        'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2',
        checked
          ? 'border-neutral-900 bg-neutral-900'
          : 'border-neutral-300 hover:border-neutral-400',
        isDisabled && !checked && 'opacity-50 pointer-events-none',
        isLocked && 'opacity-70 cursor-not-allowed',
      ].join(' ')}
    >
      <Checkbox.Indicator forceMount className="text-white">
        <svg
          width="14"
          height="14"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </Checkbox.Indicator>
    </Checkbox.Root>
  )
}
