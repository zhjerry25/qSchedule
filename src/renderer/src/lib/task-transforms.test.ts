import { describe, it, expect } from 'vitest'
import { applyDynamicReset } from './task-transforms'
import { todayISO } from './date-utils'
import type { TaskWithTags } from '@shared/task'

// ── Helpers ──

function makeTask(overrides: Partial<TaskWithTags> = {}): TaskWithTags {
  return {
    id: 'test-1',
    title: 'Test Task',
    description: '',
    kind: 'todo',
    frequency: 'once',
    scheduled_date: null,
    deadline: null,
    completed: false,
    completed_at: null,
    counter: 0,
    start_date: null,
    end_date: null,
    milestone_date: null,
    parent_id: null,
    gantt_id: null,
    is_milestone: false,
    sort_order: 0,
    created_at: '2026-06-28T00:00:00.000Z',
    updated_at: '2026-06-28T00:00:00.000Z',
    tags: [],
    ...overrides,
  }
}

// ── "once" frequency auto-clear ──

describe('applyDynamicReset — "once" frequency', () => {
  it('keeps uncompleted once task', () => {
    const task = makeTask({ frequency: 'once', completed: false, completed_at: null })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
    expect(result[0].completed).toBe(false)
  })

  it('keeps once task completed today', () => {
    const task = makeTask({
      frequency: 'once',
      completed: true,
      completed_at: todayISO(),
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
    expect(result[0].completed).toBe(true)
  })

  it('keeps once task completed today with full UTC ISO string', () => {
    // Simulates the actual DB storage format (new Date().toISOString())
    // The UTC date may differ from local date, but isToday must parse correctly
    const now = new Date()
    const utcISO = now.toISOString() // e.g. "2026-06-29T22:00:00.000Z"
    const task = makeTask({
      frequency: 'once',
      completed: true,
      completed_at: utcISO,
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
    expect(result[0].completed).toBe(true)
  })

  it('hides once task completed yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const task = makeTask({
      frequency: 'once',
      completed: true,
      completed_at: yesterday.toISOString().slice(0, 10),
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(0)
  })

  it('hides once task completed many days ago', () => {
    const task = makeTask({
      frequency: 'once',
      completed: true,
      completed_at: '2020-01-01',
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(0)
  })
})

// ── "deadline" frequency auto-clear ──

describe('applyDynamicReset — "deadline" frequency', () => {
  it('keeps uncompleted deadline task', () => {
    const task = makeTask({ frequency: 'deadline', completed: false, completed_at: null })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
  })

  it('keeps deadline task completed today', () => {
    const task = makeTask({
      frequency: 'deadline',
      completed: true,
      completed_at: todayISO(),
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
    expect(result[0].completed).toBe(true)
  })

  it('keeps deadline task completed today with full UTC ISO string', () => {
    const now = new Date()
    const utcISO = now.toISOString()
    const task = makeTask({
      frequency: 'deadline',
      completed: true,
      completed_at: utcISO,
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
    expect(result[0].completed).toBe(true)
  })

  it('hides deadline task completed yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const task = makeTask({
      frequency: 'deadline',
      completed: true,
      completed_at: yesterday.toISOString().slice(0, 10),
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(0)
  })
})

// ── "daily" frequency (existing behavior) ──

describe('applyDynamicReset — "daily" frequency', () => {
  it('resets daily task completed before today', () => {
    const task = makeTask({
      frequency: 'daily',
      completed: true,
      completed_at: '2020-01-01',
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
    expect(result[0].completed).toBe(false)
    expect(result[0].completed_at).toBeNull()
  })

  it('keeps daily task completed today as completed', () => {
    const task = makeTask({
      frequency: 'daily',
      completed: true,
      completed_at: todayISO(),
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
    expect(result[0].completed).toBe(true)
  })

  it('keeps daily task completed today with UTC ISO string', () => {
    const now = new Date()
    const utcISO = now.toISOString()
    const task = makeTask({
      frequency: 'daily',
      completed: true,
      completed_at: utcISO,
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
    expect(result[0].completed).toBe(true)
  })

  it('keeps uncompleted daily task', () => {
    const task = makeTask({ frequency: 'daily', completed: false, completed_at: null })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
  })
})

// ── "weekly" frequency (existing behavior) ──

describe('applyDynamicReset — "weekly" frequency', () => {
  it('resets weekly task completed before this week', () => {
    const task = makeTask({
      frequency: 'weekly',
      completed: true,
      completed_at: '2020-01-01',
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
    expect(result[0].completed).toBe(false)
    expect(result[0].completed_at).toBeNull()
  })

  it('keeps weekly task completed today as completed', () => {
    const task = makeTask({
      frequency: 'weekly',
      completed: true,
      completed_at: todayISO(),
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
    expect(result[0].completed).toBe(true)
  })

  it('keeps weekly task completed this week with UTC ISO string', () => {
    const now = new Date()
    const utcISO = now.toISOString()
    const task = makeTask({
      frequency: 'weekly',
      completed: true,
      completed_at: utcISO,
    })
    const result = applyDynamicReset([task])
    expect(result).toHaveLength(1)
    expect(result[0].completed).toBe(true)
  })
})

// ── Mixed tasks ──

describe('applyDynamicReset — mixed frequencies', () => {
  it('handles a mix of all frequency types', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    const tasks: TaskWithTags[] = [
      // Stale once → hidden
      makeTask({ id: '1', frequency: 'once', completed: true, completed_at: yesterdayStr }),
      // Fresh once → kept
      makeTask({ id: '2', frequency: 'once', completed: true, completed_at: todayISO() }),
      // Uncompleted once → kept
      makeTask({ id: '3', frequency: 'once', completed: false, completed_at: null }),
      // Stale deadline → hidden
      makeTask({ id: '4', frequency: 'deadline', completed: true, completed_at: '2020-01-01' }),
      // Fresh deadline → kept
      makeTask({ id: '5', frequency: 'deadline', completed: true, completed_at: todayISO() }),
      // Stale daily → reset
      makeTask({ id: '6', frequency: 'daily', completed: true, completed_at: yesterdayStr }),
      // Fresh daily → kept
      makeTask({ id: '7', frequency: 'daily', completed: true, completed_at: todayISO() }),
      // Stale weekly → reset
      makeTask({ id: '8', frequency: 'weekly', completed: true, completed_at: '2020-01-01' }),
    ]

    const result = applyDynamicReset(tasks)

    // Should have 6 tasks (2 hidden: stale once + stale deadline)
    expect(result).toHaveLength(6)

    const ids = result.map((t) => t.id)
    expect(ids).toContain('2') // fresh once
    expect(ids).toContain('3') // uncompleted once
    expect(ids).toContain('5') // fresh deadline
    expect(ids).toContain('7') // fresh daily
    expect(ids).not.toContain('1') // stale once → hidden
    expect(ids).not.toContain('4') // stale deadline → hidden

    // Stale daily → reset
    const task6 = result.find((t) => t.id === '6')
    expect(task6!.completed).toBe(false)

    // Stale weekly → reset
    const task8 = result.find((t) => t.id === '8')
    expect(task8!.completed).toBe(false)
  })
})
