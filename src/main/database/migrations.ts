import { getDatabase } from './connection'

const MIGRATIONS: Record<number, string[]> = {
  1: [
    `CREATE TABLE tasks (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      description     TEXT NOT NULL DEFAULT '',
      kind            TEXT NOT NULL CHECK (kind IN ('todo', 'gantt')),
      frequency       TEXT NOT NULL CHECK (frequency IN ('once', 'daily', 'weekly', 'deadline')),
      scheduled_date  TEXT,
      deadline        TEXT,
      start_date      TEXT,
      end_date        TEXT,
      is_milestone    INTEGER NOT NULL DEFAULT 0,
      completed       INTEGER NOT NULL DEFAULT 0,
      completed_at    TEXT,
      counter         INTEGER NOT NULL DEFAULT 0,
      parent_id       TEXT REFERENCES tasks(id) ON DELETE SET NULL,
      gantt_id        TEXT,
      sort_order      INTEGER NOT NULL DEFAULT 0,
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    )`,

    `CREATE TABLE tags (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE,
      color      TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,

    `CREATE TABLE task_tags (
      task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      tag_id  TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (task_id, tag_id)
    )`,

    `CREATE INDEX idx_tasks_kind ON tasks(kind)`,
    `CREATE INDEX idx_tasks_frequency ON tasks(frequency)`,
    `CREATE INDEX idx_tasks_scheduled_date ON tasks(scheduled_date)`,
    `CREATE INDEX idx_tasks_completed ON tasks(completed)`,
    `CREATE INDEX idx_tasks_sort_order ON tasks(sort_order)`,
    `CREATE INDEX idx_task_tags_tag_id ON task_tags(tag_id)`,
  ],

  2: [
    `CREATE INDEX idx_tasks_parent_id ON tasks(parent_id)`,
    `CREATE INDEX idx_tasks_gantt_id ON tasks(gantt_id)`,
  ],

  3: [
    `CREATE TABLE settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`,
    `INSERT INTO settings (key, value) VALUES ('language', 'en')`,
  ],

  4: [
    `ALTER TABLE tasks ADD COLUMN milestone_date TEXT`,
  ],
}

export function runMigrations(): void {
  const db = getDatabase()

  // Ensure migration tracking table exists
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`)

  // Find which migrations have already been applied
  const applied = db.prepare(
    'SELECT version FROM _migrations ORDER BY version'
  ).all() as { version: number }[]
  const appliedSet = new Set(applied.map((r) => r.version))

  for (const [versionStr, statements] of Object.entries(MIGRATIONS)) {
    const version = Number(versionStr)
    if (appliedSet.has(version)) continue

    const migrate = db.transaction(() => {
      for (const sql of statements) {
        db.exec(sql)
      }
      db.prepare(
        'INSERT INTO _migrations (version, applied_at) VALUES (?, ?)'
      ).run(version, new Date().toISOString())
    })

    migrate()
  }
}
