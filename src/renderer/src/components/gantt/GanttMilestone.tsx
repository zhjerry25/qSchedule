import type { BarPosition } from '../../hooks/useGanttLayout'
import type { TaskWithTags } from '@shared/task'

interface GanttMilestoneProps {
  task: TaskWithTags
  position: BarPosition
}

/**
 * SVG diamond marker for Gantt milestones.
 * Rendered as a rotated square (45°) at the task's start_date position.
 */
export function GanttMilestone({ task, position }: GanttMilestoneProps) {
  const cx = position.x + position.width / 2
  const cy = position.y + position.height / 2
  const r = position.width / 2

  // Diamond polygon: top, right, bottom, left
  const points = [
    `${cx},${cy - r}`,
    `${cx + r},${cy}`,
    `${cx},${cy + r}`,
    `${cx - r},${cy}`,
  ].join(' ')

  return (
    <g className="cursor-pointer group">
      <title>{task.title}</title>
      <polygon
        points={points}
        fill="#F59E0B" // amber-500
        stroke="#D97706" // amber-600
        strokeWidth={1}
        className="transition-all duration-100 hover:brightness-90"
      />
    </g>
  )
}
