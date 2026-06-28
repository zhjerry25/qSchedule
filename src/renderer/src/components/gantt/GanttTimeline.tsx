import { useState, useCallback, useEffect, useRef } from 'react'
import { GanttHeader } from './GanttHeader'
import { GanttBar } from './GanttBar'
import { GanttMilestone } from './GanttMilestone'
import { GanttTodayLine } from './GanttTodayLine'
import { GanttDependencyLine } from './GanttDependencyLine'
import { useGanttLayout, ROW_HEIGHT, HEADER_HEIGHT } from '../../hooks/useGanttLayout'
import type { GanttZoom, BarPosition } from '../../hooks/useGanttLayout'
import type { TaskWithTags } from '@shared/task'
import { startOfDay, daysBetween } from '../../lib/date-utils'
import { useI18n } from '../../i18n'

// ── Drag types ──

type DragState =
  | { kind: 'idle' }
  | {
      kind: 'resize-left' | 'resize-right'
      taskId: string
      origStart: string
      origEnd: string
      currentX: number
    }
  | {
      kind: 'move'
      taskId: string
      origStart: string
      origEnd: string
      startX: number
      currentX: number
    }
  | {
      kind: 'link'
      taskId: string
      startX: number
      startY: number
      currentX: number
      currentY: number
    }

// ── Helpers ──

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

interface GanttTimelineProps {
  tasks: TaskWithTags[]
  zoom: GanttZoom
  visibleStart: Date
  visibleEnd: Date
  selectedTaskId: string | null
  onSelectTask: (task: TaskWithTags | null) => void
  onUpdateTask: (id: string, input: { start_date?: string | null; end_date?: string | null }) => void
  onCreateDependency: (childId: string, parentId: string) => void
  onEditTask: (task: TaskWithTags) => void
  onDeleteTask: (task: TaskWithTags) => void
  scrollToTodaySignal: number
}

export function GanttTimeline({
  tasks,
  zoom,
  visibleStart,
  visibleEnd,
  selectedTaskId,
  onSelectTask,
  onUpdateTask,
  onCreateDependency,
  onEditTask,
  onDeleteTask,
  scrollToTodaySignal,
}: GanttTimelineProps) {
  const { t } = useI18n()
  const layout = useGanttLayout({ tasks, zoom, visibleStart, visibleEnd })
  const svgRef = useRef<SVGSVGElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<DragState>({ kind: 'idle' })
  const dragRef = useRef<DragState>({ kind: 'idle' })

  // ── Scroll to center today line ──
  useEffect(() => {
    if (scrollToTodaySignal === 0) return // skip initial mount
    const container = scrollContainerRef.current
    if (!container) return

    const today = startOfDay(new Date())
    const daysFromStart = daysBetween(visibleStart, today)
    const todayPx = daysFromStart * layout.dayWidth
    const targetScrollLeft = todayPx - container.clientWidth / 2

    container.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' })
  }, [scrollToTodaySignal])

  // Keep ref in sync for event listeners
  dragRef.current = drag

  // ── Global mouse handlers ──
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const d = dragRef.current
      if (d.kind === 'idle' || !svgRef.current) return

      const svgRect = svgRef.current.getBoundingClientRect()
      const x = e.clientX - svgRect.left + layout.labelWidth

      if (d.kind === 'resize-left' || d.kind === 'resize-right') {
        const snapped = layout.xToDate(x)
        setDrag({ ...d, currentX: layout.dateToX(snapped) })
      } else if (d.kind === 'move') {
        setDrag({ ...d, currentX: x })
      } else if (d.kind === 'link') {
        setDrag({ ...d, currentX: x, currentY: e.clientY - svgRect.top })
      }
    },
    [layout],
  )

  const handleMouseUp = useCallback(() => {
    const d = dragRef.current
    if (d.kind === 'idle') return

    if (d.kind === 'resize-left') {
      const snapped = layout.xToDate(d.currentX)
      onUpdateTask(d.taskId, { start_date: toISODate(snapped) })
    } else if (d.kind === 'resize-right') {
      const snapped = layout.xToDate(d.currentX)
      onUpdateTask(d.taskId, { end_date: toISODate(snapped) })
    } else if (d.kind === 'move') {
      const deltaDays = Math.round((d.currentX - d.startX) / layout.dayWidth)
      const origStart = new Date(d.origStart + 'T00:00:00')
      const origEnd = new Date(d.origEnd + 'T00:00:00')
      origStart.setDate(origStart.getDate() + deltaDays)
      origEnd.setDate(origEnd.getDate() + deltaDays)
      onUpdateTask(d.taskId, {
        start_date: toISODate(origStart),
        end_date: toISODate(origEnd),
      })
    }
    // Link mode handled by drop target detection in SVG

    setDrag({ kind: 'idle' })
  }, [layout, onUpdateTask])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // ── Bar drag handlers ──

  const getDragHandlers = (task: TaskWithTags, pos: BarPosition) => {
    const RESIZE_ZONE = 6

    const onMouseDown = (e: React.MouseEvent) => {
      if (pos.isMilestone) return

      const svgRect = svgRef.current?.getBoundingClientRect()
      if (!svgRect) return

      const x = e.clientX - svgRect.left + layout.labelWidth
      const relX = x - pos.x

      // Determine drag type by position within bar
      if (relX < RESIZE_ZONE) {
        // Left edge resize
        const state: DragState = {
          kind: 'resize-left',
          taskId: task.id,
          origStart: task.start_date ?? toISODate(new Date()),
          origEnd: task.end_date ?? toISODate(new Date()),
          currentX: x,
        }
        setDrag(state)
        dragRef.current = state
        e.stopPropagation()
      } else if (relX > pos.width - RESIZE_ZONE) {
        // Right edge resize
        const state: DragState = {
          kind: 'resize-right',
          taskId: task.id,
          origStart: task.start_date ?? toISODate(new Date()),
          origEnd: task.end_date ?? toISODate(new Date()),
          currentX: x,
        }
        setDrag(state)
        dragRef.current = state
        e.stopPropagation()
      } else {
        // Middle — drag to move
        const state: DragState = {
          kind: 'move',
          taskId: task.id,
          origStart: task.start_date ?? toISODate(new Date()),
          origEnd: task.end_date ?? toISODate(new Date()),
          startX: x,
          currentX: x,
        }
        setDrag(state)
        dragRef.current = state
        e.stopPropagation()
      }
    }

    // Link handle drag start (small circle at right edge)
    const onLinkMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      const svgRect = svgRef.current?.getBoundingClientRect()
      if (!svgRect) return

      const state: DragState = {
        kind: 'link',
        taskId: task.id,
        startX: pos.x + pos.width,
        startY: pos.y + pos.height / 2,
        currentX: e.clientX - svgRect.left + layout.labelWidth,
        currentY: e.clientY - svgRect.top,
      }
      setDrag(state)
      dragRef.current = state
    }

    // Drop target for dependency linking
    const onBarMouseUp = (e: React.MouseEvent) => {
      const d = dragRef.current
      if (d.kind === 'link' && d.taskId !== task.id) {
        e.stopPropagation()
        onCreateDependency(d.taskId, task.id)
        setDrag({ kind: 'idle' })
        dragRef.current = { kind: 'idle' }
      }
    }

    return { onMouseDown, onLinkMouseDown, onBarMouseUp }
  }

  // ── Compute drag-modified bar positions ──

  const getDragPosition = (taskId: string, basePos: BarPosition): BarPosition | null => {
    if (drag.kind === 'idle' || drag.taskId !== taskId) return null

    if (drag.kind === 'resize-left') {
      const newX = drag.currentX
      const newWidth = basePos.x + basePos.width - newX
      if (newWidth < layout.dayWidth * 0.5) return null
      return { ...basePos, x: newX, width: newWidth }
    }

    if (drag.kind === 'resize-right') {
      const newWidth = drag.currentX - basePos.x
      if (newWidth < layout.dayWidth * 0.5) return null
      return { ...basePos, width: newWidth }
    }

    if (drag.kind === 'move') {
      const deltaX = drag.currentX - drag.startX
      return { ...basePos, x: basePos.x + deltaX }
    }

    return null
  }

  // ── Dependency lines (existing, from parent_id) ──
  const dependencyLines: Array<{ from: BarPosition; to: BarPosition; fromId: string; toId: string }> = []
  for (const task of tasks) {
    if (!task.parent_id) continue
    const childPos = layout.barPositions.get(task.id)
    // Find the parent task by parent_id
    const parentTask = tasks.find((t) => t.id === task.parent_id)
    if (!parentTask) continue
    const parentPos = layout.barPositions.get(parentTask.id)
    if (!childPos || !parentPos) continue

    dependencyLines.push({
      from: parentPos,
      to: childPos,
      fromId: parentTask.id,
      toId: task.id,
    })
  }

  const handleSvgClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as SVGElement).tagName === 'svg') {
      onSelectTask(null)
    }
  }

  // Adjust x coords for label column offset
  const offsetX = (x: number) => x - layout.labelWidth

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Task name column (fixed left) */}
      <div
        className="shrink-0 border-r border-neutral-200 bg-white overflow-hidden"
        style={{ width: layout.labelWidth }}
      >
        <div
          className="flex items-center px-3 border-b border-neutral-100 bg-neutral-50 text-xs font-medium text-neutral-400 uppercase tracking-wider"
          style={{ height: HEADER_HEIGHT }}
        >
          {t.gantt.columnTask}
        </div>
        {layout.taskRows.map(({ task }) => (
          <div
            key={task.id}
            onClick={() => onSelectTask(task)}
            className={`group flex items-center px-3 border-b border-neutral-50 text-sm cursor-pointer transition-colors ${
              selectedTaskId === task.id
                ? 'bg-neutral-100 text-neutral-900 font-medium'
                : 'text-neutral-700 hover:bg-neutral-50'
            }`}
            style={{ height: ROW_HEIGHT + 2 }}
            title={task.title}
          >
            <span className="truncate flex-1 min-w-0">{task.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteTask(task)
              }}
              className="shrink-0 ml-1 w-5 h-5 flex items-center justify-center rounded-full text-neutral-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
              title={`Delete ${task.title}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* SVG timeline */}
      <div className="flex-1 overflow-auto" ref={scrollContainerRef}>
        <svg
          ref={svgRef}
          width={layout.totalWidth - layout.labelWidth}
          height={layout.totalHeight}
          onClick={handleSvgClick}
        >
          {/* Header */}
          <GanttHeader
            cells={layout.headerCells.map((c) => ({
              ...c,
              x: offsetX(c.x),
            }))}
            labelWidth={0}
          />

          {/* Grid lines */}
          {layout.headerCells.map((cell, idx) => (
            <line
              key={`grid-${idx}`}
              x1={offsetX(cell.x + (idx === 0 ? 0 : cell.width))}
              y1={HEADER_HEIGHT}
              x2={offsetX(cell.x + (idx === 0 ? 0 : cell.width))}
              y2={layout.totalHeight}
              stroke={cell.isWeekend ? '#F0F0F0' : '#F5F5F5'}
              strokeWidth={0.5}
            />
          ))}

          {layout.taskRows.map(({ y }) => (
            <line
              key={`row-${y}`}
              x1={0}
              y1={y + ROW_HEIGHT}
              x2={layout.totalWidth - layout.labelWidth}
              y2={y + ROW_HEIGHT}
              stroke="#F5F5F5"
              strokeWidth={0.5}
            />
          ))}

          {/* Today line */}
          <GanttTodayLine
            x={offsetX(layout.todayX)}
            y1={HEADER_HEIGHT}
            y2={layout.totalHeight}
            label={t.gantt.today}
          />

          {/* Existing dependency lines */}
          {dependencyLines.map(({ from, to, fromId, toId }) => (
            <GanttDependencyLine
              key={`dep-${fromId}-${toId}`}
              fromX={offsetX(from.x + from.width)}
              fromY={from.y + from.height / 2}
              toX={offsetX(to.x)}
              toY={to.y + to.height / 2}
            />
          ))}

          {/* Bars + Milestones */}
          {tasks.map((task) => {
            const basePos = layout.barPositions.get(task.id)
            if (!basePos) return null

            const dragPos = getDragPosition(task.id, basePos)
            const pos = dragPos ?? basePos
            const adjustedPos = { ...pos, x: offsetX(pos.x) }
            const handlers = getDragHandlers(task, adjustedPos)

            if (pos.isMilestone) {
              return (
                <GanttMilestone
                  key={task.id}
                  task={task}
                  position={adjustedPos}
                />
              )
            }

            // Highlight as potential drop target during link drag
            const isLinkTarget =
              drag.kind === 'link' && drag.taskId !== task.id

            return (
              <g key={task.id}>
                {/* Drop target highlight */}
                {isLinkTarget && (
                  <rect
                    x={adjustedPos.x - 2}
                    y={adjustedPos.y - 2}
                    width={adjustedPos.width + 4}
                    height={adjustedPos.height + 4}
                    rx={7}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    onMouseUp={handlers.onBarMouseUp}
                  />
                )}
                <GanttBar
                  task={task}
                  position={adjustedPos}
                  isSelected={selectedTaskId === task.id}
                  onSelect={onSelectTask}
                  onDoubleClick={onEditTask}
                />
                {/* Invisible hit area for drag */}
                <rect
                  x={adjustedPos.x}
                  y={adjustedPos.y}
                  width={adjustedPos.width}
                  height={adjustedPos.height}
                  fill="transparent"
                  style={{ cursor: drag.kind === 'idle' ? 'grab' : 'grabbing' }}
                  onMouseDown={handlers.onMouseDown}
                  onMouseUp={handlers.onBarMouseUp}
                />
                {/* Link handle — small circle at right edge */}
                {!pos.isMilestone && pos.width > 20 && (
                  <circle
                    cx={adjustedPos.x + adjustedPos.width}
                    cy={adjustedPos.y + adjustedPos.height / 2}
                    r={5}
                    fill="white"
                    stroke="#A3A3A3"
                    strokeWidth={1}
                    className="cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity hover:stroke-neutral-600"
                    onMouseDown={handlers.onLinkMouseDown}
                  />
                )}
              </g>
            )
          })}

          {/* Drag link line (while in link mode) */}
          {drag.kind === 'link' && (
            <line
              x1={offsetX(drag.startX)}
              y1={drag.startY}
              x2={drag.currentX - layout.labelWidth}
              y2={drag.currentY}
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray="6 3"
              opacity={0.7}
            />
          )}
        </svg>
      </div>
    </div>
  )
}
