import { getDatabase } from '../database/connection'
import type {
  Task,
  TaskWithTags,
  TaskFilter,
  CreateTaskInput,
  UpdateTaskInput,
  TagBasic,
} from '@shared/task'
import { randomUUID } from 'crypto'

// ── Row types (as stored in SQLite) ──

interface TaskRow {
  id: string
  title: string
  description: string
  kind: string
  frequency: string
  scheduled_date: string | null
  deadline: string | null
  start_date: string | null
  end_date: string | null
  is_milestone: number
  completed: number
  completed_at: string | null
  counter: number
  parent_id: string | null
  gantt_id: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

interface TagRow {
  id: string
  name: string
  color: string
  created_at: string
}

interface TaskTagRow {
  task_id: string
  tag_id: string
}

// ── Helpers ──

/**
 * Format a Date as YYYY-MM-DD in local timezone.
 * Defaults to today if no argument is provided.
 */
function localDateISO(date?: Date): string {
  const d = date ?? new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    kind: row.kind as Task['kind'],
    frequency: row.frequency as Task['frequency'],
    scheduled_date: row.scheduled_date,
    deadline: row.deadline,
    start_date: row.start_date,
    end_date: row.end_date,
    is_milestone: row.is_milestone === 1,
    completed: row.completed === 1,
    completed_at: row.completed_at,
    counter: row.counter,
    parent_id: row.parent_id,
    gantt_id: row.gantt_id,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function taskToRow(
  input: CreateTaskInput | UpdateTaskInput,
  now: string,
): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if ('title' in input && input.title !== undefined) row.title = input.title
  if ('description' in input && input.description !== undefined) row.description = input.description
  if ('kind' in input && input.kind !== undefined) row.kind = input.kind
  if ('frequency' in input && input.frequency !== undefined) row.frequency = input.frequency
  if ('scheduled_date' in input) row.scheduled_date = input.scheduled_date ?? null
  if ('deadline' in input) row.deadline = input.deadline ?? null
  if ('start_date' in input) row.start_date = input.start_date ?? null
  if ('end_date' in input) row.end_date = input.end_date ?? null
  if ('is_milestone' in input && input.is_milestone !== undefined) {
    row.is_milestone = input.is_milestone ? 1 : 0
  }
  if ('completed' in input && input.completed !== undefined) {
    row.completed = input.completed ? 1 : 0
  }
  if ('parent_id' in input) row.parent_id = input.parent_id ?? null
  if ('gantt_id' in input) row.gantt_id = input.gantt_id ?? null
  if ('sort_order' in input && input.sort_order !== undefined) row.sort_order = input.sort_order
  row.updated_at = now
  return row
}

/** Batch-load tags for multiple tasks, returns Map<taskId, TagBasic[]>. */
function batchLoadTags(taskIds: string[]): Map<string, TagBasic[]> {
  const result = new Map<string, TagBasic[]>()
  if (taskIds.length === 0) return result

  // Initialize empty arrays for all requested IDs
  for (const id of taskIds) {
    result.set(id, [])
  }

  const db = getDatabase()
  const placeholders = taskIds.map(() => '?').join(', ')
  const rows = db
    .prepare(
      `SELECT tt.task_id, t.id, t.name, t.color
       FROM task_tags tt
       JOIN tags t ON tt.tag_id = t.id
       WHERE tt.task_id IN (${placeholders})`,
    )
    .all(...taskIds) as (TaskTagRow & TagRow)[]

  for (const row of rows) {
    result.get(row.task_id)!.push({
      id: row.id,
      name: row.name,
      color: row.color,
    })
  }

  return result
}

/** Load tags for a single task. */
function loadTags(taskId: string): TagBasic[] {
  const db = getDatabase()
  const rows = db
    .prepare(
      `SELECT t.id, t.name, t.color
       FROM task_tags tt
       JOIN tags t ON tt.tag_id = t.id
       WHERE tt.task_id = ?`,
    )
    .all(taskId) as TagRow[]

  return rows.map((r) => ({ id: r.id, name: r.name, color: r.color }))
}

// ── Repository ──

export const taskRepository = {
  findAll(filter: TaskFilter = {}): TaskWithTags[] {
    const db = getDatabase()
    const conditions: string[] = []
    const params: unknown[] = []

    if (filter.kind) {
      conditions.push('kind = ?')
      params.push(filter.kind)
    }

    if (filter.frequency) {
      conditions.push('frequency = ?')
      params.push(filter.frequency)
    }

    if (filter.view === 'today') {
      const today = localDateISO()
      // Include tasks scheduled for today AND daily tasks (always due today)
      conditions.push('(scheduled_date = ? OR frequency = ?)')
      params.push(today)
      params.push('daily')
    } else if (filter.view === 'week') {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const monday = new Date(now)
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      // Include once/deadline tasks scheduled this week AND weekly tasks
      conditions.push(
        '((scheduled_date >= ? AND scheduled_date <= ?) OR frequency = ?)',
      )
      params.push(localDateISO(monday))
      params.push(localDateISO(sunday))
      params.push('weekly')
    }

    if (filter.tagIds && filter.tagIds.length > 0) {
      const tagPlaceholders = filter.tagIds.map(() => '?').join(', ')
      conditions.push(
        `id IN (SELECT task_id FROM task_tags WHERE tag_id IN (${tagPlaceholders}))`,
      )
      params.push(...filter.tagIds)
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const rows = db
      .prepare(
        `SELECT * FROM tasks ${whereClause} ORDER BY sort_order ASC, created_at DESC`,
      )
      .all(...params) as TaskRow[]

    const tasks = rows.map(rowToTask)
    const taskIds = tasks.map((t) => t.id)
    const tagMap = batchLoadTags(taskIds)

    return tasks.map((task) => ({
      ...task,
      tags: tagMap.get(task.id) ?? [],
    }))
  },

  findById(id: string): TaskWithTags | null {
    const db = getDatabase()
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as
      | TaskRow
      | undefined
    if (!row) return null

    const task = rowToTask(row)
    const tags = loadTags(id)
    return { ...task, tags }
  },

  create(input: CreateTaskInput): Task {
    const db = getDatabase()
    const id = input.id ?? randomUUID()
    const now = new Date().toISOString()

    db.prepare(
      `INSERT INTO tasks (
        id, title, description, kind, frequency,
        scheduled_date, deadline, start_date, end_date,
        is_milestone, completed, completed_at, counter,
        parent_id, gantt_id, sort_order,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, 0, NULL, 0,
        ?, ?, 0,
        ?, ?
      )`,
    ).run(
      id,
      input.title,
      input.description ?? '',
      input.kind,
      input.frequency,
      input.scheduled_date ?? null,
      input.deadline ?? null,
      input.start_date ?? null,
      input.end_date ?? null,
      input.is_milestone ? 1 : 0,
      input.parent_id ?? null,
      input.gantt_id ?? null,
      now,
      now,
    )

    // Return the created task
    return rowToTask(
      db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow,
    )
  },

  update(id: string, input: UpdateTaskInput): Task {
    const db = getDatabase()
    const now = new Date().toISOString()

    const row = taskToRow(input, now)

    if (Object.keys(row).length === 1 && 'updated_at' in row) {
      // Nothing to update besides the timestamp — just return current state
      const current = db
        .prepare('SELECT * FROM tasks WHERE id = ?')
        .get(id) as TaskRow | undefined
      if (!current) throw new Error(`Task not found: ${id}`)
      return rowToTask(current)
    }

    const setClauses: string[] = []
    const params: unknown[] = []

    for (const [key, value] of Object.entries(row)) {
      setClauses.push(`${key} = ?`)
      params.push(value)
    }

    params.push(id)

    const result = db
      .prepare(`UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`)
      .run(...params)

    if (result.changes === 0) {
      throw new Error(`Task not found: ${id}`)
    }

    return rowToTask(
      db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow,
    )
  },

  remove(id: string): void {
    const db = getDatabase()
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
    if (result.changes === 0) {
      throw new Error(`Task not found: ${id}`)
    }
  },

  complete(id: string): Task {
    const db = getDatabase()
    const now = new Date().toISOString()

    const completeTask = db.transaction(() => {
      const row = db
        .prepare('SELECT * FROM tasks WHERE id = ?')
        .get(id) as TaskRow | undefined
      if (!row) throw new Error(`Task not found: ${id}`)

      // Single completion lock: any completed task cannot be re-completed
      // Daily/weekly tasks are unlocked by dynamic reset in the next cycle
      if (row.completed === 1) {
        throw new Error('This task has already been completed')
      }

      db.prepare(
        `UPDATE tasks
         SET completed = 1, completed_at = ?, counter = counter + 1, updated_at = ?
         WHERE id = ?`,
      ).run(now, now, id)

      return db
        .prepare('SELECT * FROM tasks WHERE id = ?')
        .get(id) as TaskRow
    })

    return rowToTask(completeTask())
  },

  uncomplete(id: string): Task {
    const db = getDatabase()
    const now = new Date().toISOString()

    const result = db.prepare(
      `UPDATE tasks
       SET completed = 0, completed_at = NULL, updated_at = ?
       WHERE id = ?`,
    ).run(now, id)

    if (result.changes === 0) {
      throw new Error(`Task not found: ${id}`)
    }

    return rowToTask(
      db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow,
    )
  },

  getTodayTasks(): TaskWithTags[] {
    const db = getDatabase()
    const today = localDateISO()

    // Aligned with partitionTasks().today logic (see date-utils.ts):
    // - All daily tasks (regardless of completed — renderer handles dynamic reset)
    // - Incomplete once/deadline tasks due today or overdue
    // - Weekly tasks excluded (they belong in the Week section)
    const rows = db
      .prepare(
        `SELECT * FROM tasks
         WHERE kind = 'todo'
           AND (
             frequency = 'daily'
             OR (
               frequency IN ('once', 'deadline')
               AND completed = 0
               AND (
                 scheduled_date <= ?
                 OR (scheduled_date IS NULL AND deadline <= ?)
               )
             )
           )
         ORDER BY sort_order ASC, created_at DESC`,
      )
      .all(today, today) as TaskRow[]

    const tasks = rows.map(rowToTask)
    const taskIds = tasks.map((t) => t.id)
    const tagMap = batchLoadTags(taskIds)

    return tasks.map((task) => ({
      ...task,
      tags: tagMap.get(task.id) ?? [],
    }))
  },
}
