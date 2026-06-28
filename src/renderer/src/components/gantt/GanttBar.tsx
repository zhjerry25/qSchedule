import { assignGanttColor } from '../../lib/constants'
import type { BarPosition } from '../../hooks/useGanttLayout'
import type { TaskWithTags } from '@shared/task'

interface GanttBarProps {
  task: TaskWithTags
  position: BarPosition
  isSelected: boolean
  onSelect: (task: TaskWithTags) => void
  onDoubleClick?: (task: TaskWithTags) => void
}

const TAG_DOT_RADIUS = 4
const TAG_DOT_GAP = 3

export function GanttBar({ task, position, isSelected, onSelect, onDoubleClick }: GanttBarProps) {
  const color = assignGanttColor(task.title)
  const textColor = '#525252' // neutral-600
  const selectedClass = isSelected
    ? 'stroke-neutral-800 stroke-[1.5]'
    : 'stroke-transparent stroke-1'

  // Compute available space for tag dots on the right
  const minTitleWidth = 48
  const tagDotsWidth =
    task.tags.length > 0
      ? task.tags.length * (TAG_DOT_RADIUS * 2 + TAG_DOT_GAP) + 4
      : 0
  const showTitle = position.width > minTitleWidth
  const titleMaxWidth = position.width - 12 - tagDotsWidth
  const showTagDots = tagDotsWidth > 0 && position.width > minTitleWidth + tagDotsWidth

  return (
    <g
      className="cursor-pointer group"
      onClick={(e) => {
        e.stopPropagation()
        onSelect(task)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onDoubleClick?.(task)
      }}
    >
      {/* Bar body */}
      <rect
        x={position.x}
        y={position.y}
        width={position.width}
        height={position.height}
        rx={5}
        ry={5}
        fill={color}
        className={`${selectedClass} transition-all duration-100 hover:brightness-95`}
      />
      {/* Task title */}
      {showTitle && (
        <text
          x={position.x + 6}
          y={position.y + position.height / 2 + 1}
          dominantBaseline="middle"
          fontSize={11}
          fill={textColor}
          className="select-none pointer-events-none"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          clipPath={`url(#clip-${task.id})`}
        >
          {titleMaxWidth > 100
            ? task.title
            : titleMaxWidth > 40
              ? task.title.slice(0, Math.floor(titleMaxWidth / 8)) + '…'
              : ''}
        </text>
      )}
      {/* Hidden clip path for truncation */}
      <defs>
        <clipPath id={`clip-${task.id}`}>
          <rect
            x={position.x + 6}
            y={position.y}
            width={Math.max(titleMaxWidth, 0)}
            height={position.height}
          />
        </clipPath>
      </defs>
      {/* Tag dots */}
      {showTagDots &&
        task.tags.slice(0, 3).map((tag, idx) => (
          <circle
            key={tag.id}
            cx={position.x + position.width - 8 - idx * (TAG_DOT_RADIUS * 2 + TAG_DOT_GAP) - TAG_DOT_RADIUS}
            cy={position.y + position.height / 2}
            r={TAG_DOT_RADIUS}
            fill={tag.color}
            stroke="white"
            strokeWidth={0.5}
          />
        ))}
    </g>
  )
}
