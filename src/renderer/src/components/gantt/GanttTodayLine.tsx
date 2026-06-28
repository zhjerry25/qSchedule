interface GanttTodayLineProps {
  x: number
  y1: number
  y2: number
}

/**
 * Dashed vertical line marking today's date on the Gantt timeline.
 */
export function GanttTodayLine({ x, y1, y2 }: GanttTodayLineProps) {
  return (
    <g>
      <line
        x1={x}
        y1={y1}
        x2={x}
        y2={y2}
        stroke="#EF4444" // rose-500
        strokeWidth={1.5}
        strokeDasharray="4 3"
        opacity={0.6}
      />
      {/* "Today" label */}
      <rect
        x={x - 20}
        y={y1 - 16}
        width={40}
        height={16}
        rx={3}
        fill="#EF4444"
        opacity={0.85}
      />
      <text
        x={x}
        y={y1 - 5}
        textAnchor="middle"
        fontSize={10}
        fill="white"
        className="select-none pointer-events-none"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}
      >
        Today
      </text>
    </g>
  )
}
