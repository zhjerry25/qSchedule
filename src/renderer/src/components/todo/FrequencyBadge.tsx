import { FREQUENCY_COLORS } from '../../lib/constants'
import { useI18n } from '../../i18n'
import type { Frequency } from '@shared/task'

interface FrequencyBadgeProps {
  frequency: Frequency
  className?: string
}

export function FrequencyBadge({ frequency, className = '' }: FrequencyBadgeProps) {
  const colors = FREQUENCY_COLORS[frequency]
  const { t } = useI18n()

  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
        className,
      ].join(' ')}
    >
      {t.frequency[frequency]}
    </span>
  )
}
