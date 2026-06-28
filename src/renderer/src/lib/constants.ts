import type { Frequency } from '@shared/task'

// ── Frequency Display Colors ──

export const FREQUENCY_COLORS: Record<
  Frequency,
  { bg: string; text: string; dot: string }
> = {
  once: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
  },
  daily: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  weekly: {
    bg: 'bg-violet-100',
    text: 'text-violet-800',
    dot: 'bg-violet-500',
  },
  deadline: {
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
  },
}

// ── CardStream Section Keys ──

export type SectionKey = 'today' | 'week' | 'later'

// ── Gantt Bar Colors ──
// Deterministic palette for Gantt task bars (8 distinct colors).
// Color assignment: hash task name → modulo 8 → index into palette.
// All colors are light/pastel to keep the 80-90% neutral aesthetic.

export const GANTT_COLORS = [
  '#BFDBFE', // blue-200
  '#BBF7D0', // green-200
  '#FDE68A', // amber-200
  '#DDD6FE', // violet-200
  '#FECACA', // red-200
  '#A5F3FC', // cyan-200
  '#FED7AA', // orange-200
  '#E9D5FF', // purple-200
] as const

/**
 * Deterministic color assignment for Gantt bars.
 * Uses djb2 hash (same algorithm as color-palette.ts) for consistency.
 */
export function assignGanttColor(name: string): string {
  let hash = 5381
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) + hash + name.charCodeAt(i)) | 0
  }
  return GANTT_COLORS[Math.abs(hash) % GANTT_COLORS.length]
}
