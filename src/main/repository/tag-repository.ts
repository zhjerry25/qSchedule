import { getDatabase } from '../database/connection'
import type { Tag } from '@shared/tag'
import { randomUUID } from 'crypto'

interface TagRow {
  id: string
  name: string
  color: string
  created_at: string
}

function rowToTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    created_at: row.created_at,
  }
}

export const tagRepository = {
  findAll(): Tag[] {
    const db = getDatabase()
    const rows = db
      .prepare('SELECT * FROM tags ORDER BY name ASC')
      .all() as TagRow[]
    return rows.map(rowToTag)
  },

  findById(id: string): Tag | null {
    const db = getDatabase()
    const row = db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as
      | TagRow
      | undefined
    return row ? rowToTag(row) : null
  },

  create(name: string, color: string): Tag {
    const db = getDatabase()
    const id = randomUUID()
    const now = new Date().toISOString()

    db.prepare(
      'INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)',
    ).run(id, name, color, now)

    return rowToTag(
      db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as TagRow,
    )
  },

  update(id: string, name: string): Tag {
    const db = getDatabase()

    // Verify exists
    const existing = db
      .prepare('SELECT * FROM tags WHERE id = ?')
      .get(id) as TagRow | undefined
    if (!existing) throw new Error(`Tag not found: ${id}`)

    db.prepare('UPDATE tags SET name = ? WHERE id = ?').run(name, id)

    return rowToTag(
      db.prepare('SELECT * FROM tags WHERE id = ?').get(id) as TagRow,
    )
  },

  remove(id: string): void {
    const db = getDatabase()
    db.prepare('DELETE FROM tags WHERE id = ?').run(id)
    // CASCADE handles task_tags cleanup
  },

  addTagToTask(taskId: string, tagId: string): void {
    const db = getDatabase()
    // INSERT OR IGNORE to handle duplicate assignments gracefully
    db.prepare(
      'INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)',
    ).run(taskId, tagId)
  },

  removeTagFromTask(taskId: string, tagId: string): void {
    const db = getDatabase()
    db.prepare(
      'DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?',
    ).run(taskId, tagId)
  },

  getTagsForTask(taskId: string): Tag[] {
    const db = getDatabase()
    const rows = db
      .prepare(
        `SELECT t.* FROM tags t
         JOIN task_tags tt ON t.id = tt.tag_id
         WHERE tt.task_id = ?
         ORDER BY t.name ASC`,
      )
      .all(taskId) as TagRow[]
    return rows.map(rowToTag)
  },
}
