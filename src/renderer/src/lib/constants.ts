import type { Frequency } from '@shared/task'

// ── View System ──

export const VIEWS = ['today', 'week', 'all'] as const
export type View = (typeof VIEWS)[number]

export const VIEW_LABELS: Record<View, string> = {
  today: 'Today',
  week: 'This Week',
  all: 'All',
}

// ── Frequency Display ──

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  once: 'Once',
  daily: 'Daily',
  weekly: 'Weekly',
  deadline: 'Deadline',
}

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

// ── Layout ──

export const SIDEBAR_WIDTH = 'w-[280px]'
export const CONTENT_MAX_WIDTH = 'max-w-2xl'
