import type { HeaderCell } from '../../hooks/useGanttLayout'
import { HEADER_HEIGHT } from '../../hooks/useGanttLayout'

interface GanttHeaderProps {
  cells: HeaderCell[]
  labelWidth: number
}

/**
 * Calendar time axis header for the Gantt timeline.
 * Renders day/week/month columns with labels.
 */
export function GanttHeader({ cells, labelWidth }: GanttHeaderProps) {
  return (
    <g>
      {/* Label column header background */}
      <rect
        x={0}
        y={0}
        width={labelWidth}
        height={HEADER_HEIGHT}
        fill="#FAFAFA"
        stroke="#E5E5E5"
        strokeWidth={0.5}
      />

      {cells.map((cell, idx) => (
        <g key={idx}>
          {/* Column background */}
          <rect
            x={cell.x}
            y={0}
            width={cell.width}
            height={HEADER_HEIGHT}
            fill={cell.isWeekend ? '#F5F5F5' : '#FAFAFA'}
            stroke="#E5E5E5"
            strokeWidth={0.5}
          />
          {/* Column label */}
          <text
            x={cell.x + cell.width / 2}
            y={HEADER_HEIGHT / 2 + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill="#737373"
            className="select-none"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {cell.label}
          </text>
        </g>
      ))}
    </g>
  )
}
