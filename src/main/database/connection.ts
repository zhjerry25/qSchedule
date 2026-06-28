import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'qschedule.db')
  db = new Database(dbPath)

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL')

  // Enable foreign key enforcement (critical for CASCADE deletes)
  db.pragma('foreign_keys = ON')

  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
