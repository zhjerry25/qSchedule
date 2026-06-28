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
