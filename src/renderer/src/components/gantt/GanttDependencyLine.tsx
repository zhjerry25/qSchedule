interface GanttDependencyLineProps {
  fromX: number
  fromY: number
  toX: number
  toY: number
}

/**
 * SVG curved path connecting two Gantt bars for a dependency relationship.
 * Arrow points from parent (right edge) to child (left edge).
 */
export function GanttDependencyLine({ fromX, fromY, toX, toY }: GanttDependencyLineProps) {
  // Control point offsets for a smooth bezier curve
  const dx = Math.max(Math.abs(toX - fromX) * 0.4, 20)
  const cx1 = fromX + dx
  const cy1 = fromY
  const cx2 = toX - dx
  const cy2 = toY

  const d = `M ${fromX} ${fromY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toX} ${toY}`

  // Arrowhead at the child end
  const arrowSize = 6
  // Approximate angle at the end of the bezier
  const angle = Math.atan2(toY - cy2, toX - cx2)
  const ax1 = toX - arrowSize * Math.cos(angle - Math.PI / 6)
  const ay1 = toY - arrowSize * Math.sin(angle - Math.PI / 6)
  const ax2 = toX - arrowSize * Math.cos(angle + Math.PI / 6)
  const ay2 = toY - arrowSize * Math.sin(angle + Math.PI / 6)

  return (
    <g>
      {/* Curved line */}
      <path
        d={d}
        fill="none"
        stroke="#A3A3A3"
        strokeWidth={1.5}
        opacity={0.7}
      />
      {/* Arrowhead */}
      <polygon
        points={`${toX},${toY} ${ax1},${ay1} ${ax2},${ay2}`}
        fill="#A3A3A3"
        opacity={0.7}
      />
    </g>
  )
}
