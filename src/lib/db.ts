import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'tasks.db')

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')

  _db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT,
      status      TEXT    NOT NULL DEFAULT 'todo',
      priority    TEXT    NOT NULL DEFAULT 'medium',
      category    TEXT    NOT NULL DEFAULT 'other',
      due_date    TEXT,
      assignee    TEXT,
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime')),
      updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime'))
    )
  `)

  // マイグレーション: 既存DBにcategoryカラムがなければ追加
  const cols = _db.prepare("PRAGMA table_info(tasks)").all() as { name: string }[]
  if (!cols.some(c => c.name === 'category')) {
    _db.exec("ALTER TABLE tasks ADD COLUMN category TEXT NOT NULL DEFAULT 'other'")
  }

  return _db
}

export function getAllTasks(): Task[] {
  return getDb()
    .prepare('SELECT * FROM tasks ORDER BY created_at DESC')
    .all() as Task[]
}

export function getTaskById(id: number): Task | undefined {
  return getDb()
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(id) as Task | undefined
}

export function createTask(input: CreateTaskInput): Task {
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, category, due_date, assignee)
    VALUES (@title, @description, @status, @priority, @category, @due_date, @assignee)
  `).run({
    title: input.title,
    description: input.description ?? null,
    status: input.status,
    priority: input.priority,
    category: input.category,
    due_date: input.due_date ?? null,
    assignee: input.assignee ?? null,
  })
  return getTaskById(Number(result.lastInsertRowid))!
}

export function updateTask(id: number, input: UpdateTaskInput): Task | undefined {
  const db = getDb()
  const allowed: (keyof UpdateTaskInput)[] = [
    'title', 'description', 'status', 'priority', 'category', 'due_date', 'assignee',
  ]
  const entries = allowed
    .filter(k => k in input)
    .map(k => `${k} = @${k}`)
  if (entries.length === 0) return getTaskById(id)

  db.prepare(`
    UPDATE tasks
    SET ${entries.join(', ')},
        updated_at = strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime')
    WHERE id = @id
  `).run({ ...input, id })

  return getTaskById(id)
}

export function deleteTask(id: number): boolean {
  const result = getDb()
    .prepare('DELETE FROM tasks WHERE id = ?')
    .run(id)
  return result.changes > 0
}
