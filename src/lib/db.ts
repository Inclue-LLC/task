import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import type { Task, CreateTaskInput, UpdateTaskInput, Subcategory, TaskCategory } from '@/types/task'

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
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      title          TEXT    NOT NULL,
      description    TEXT,
      status         TEXT    NOT NULL DEFAULT 'todo',
      priority       TEXT    NOT NULL DEFAULT 'medium',
      category       TEXT    NOT NULL DEFAULT 'other',
      subcategory_id INTEGER,
      due_date       TEXT,
      assignee       TEXT,
      created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime')),
      updated_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime'))
    )
  `)

  _db.exec(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      category   TEXT    NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime'))
    )
  `)

  // マイグレーション: tasks に不足カラムを追加
  const cols = _db.prepare('PRAGMA table_info(tasks)').all() as { name: string }[]
  if (!cols.some(c => c.name === 'category')) {
    _db.exec("ALTER TABLE tasks ADD COLUMN category TEXT NOT NULL DEFAULT 'other'")
  }
  if (!cols.some(c => c.name === 'subcategory_id')) {
    _db.exec('ALTER TABLE tasks ADD COLUMN subcategory_id INTEGER')
  }

  // 旧カテゴリ値を正規化
  const validCategories = ['sato', 'nishiguchi', 'announcement', 'shopping', 'other']
  _db.prepare(`
    UPDATE tasks SET category = 'other'
    WHERE category NOT IN (${validCategories.map(() => '?').join(',')})
  `).run(...validCategories)

  return _db
}

// ── Tasks ────────────────────────────────────────────────────────────────────

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
    INSERT INTO tasks (title, description, status, priority, category, subcategory_id, due_date, assignee)
    VALUES (@title, @description, @status, @priority, @category, @subcategory_id, @due_date, @assignee)
  `).run({
    title: input.title,
    description: input.description ?? null,
    status: input.status,
    priority: input.priority,
    category: input.category,
    subcategory_id: input.subcategory_id ?? null,
    due_date: input.due_date ?? null,
    assignee: input.assignee ?? null,
  })
  return getTaskById(Number(result.lastInsertRowid))!
}

export function updateTask(id: number, input: UpdateTaskInput): Task | undefined {
  const db = getDb()
  const allowed: (keyof UpdateTaskInput)[] = [
    'title', 'description', 'status', 'priority', 'category', 'subcategory_id', 'due_date', 'assignee',
  ]
  const entries = allowed.filter(k => k in input).map(k => `${k} = @${k}`)
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
  const result = getDb().prepare('DELETE FROM tasks WHERE id = ?').run(id)
  return result.changes > 0
}

// ── Subcategories ─────────────────────────────────────────────────────────────

export function getAllSubcategories(): Subcategory[] {
  return getDb()
    .prepare('SELECT * FROM subcategories ORDER BY category, sort_order, created_at')
    .all() as Subcategory[]
}

export function getSubcategoryById(id: number): Subcategory | undefined {
  return getDb()
    .prepare('SELECT * FROM subcategories WHERE id = ?')
    .get(id) as Subcategory | undefined
}

export function createSubcategory(name: string, category: TaskCategory): Subcategory {
  const db = getDb()
  const result = db
    .prepare('INSERT INTO subcategories (name, category) VALUES (?, ?)')
    .run(name.trim(), category)
  return getSubcategoryById(Number(result.lastInsertRowid))!
}

export function updateSubcategory(id: number, name: string): Subcategory | undefined {
  const db = getDb()
  db.prepare('UPDATE subcategories SET name = ? WHERE id = ?').run(name.trim(), id)
  return getSubcategoryById(id)
}

export function deleteSubcategory(id: number): boolean {
  const db = getDb()
  // サブカテゴリに属するタスクを「未分類」に戻す
  db.prepare('UPDATE tasks SET subcategory_id = NULL WHERE subcategory_id = ?').run(id)
  const result = db.prepare('DELETE FROM subcategories WHERE id = ?').run(id)
  return result.changes > 0
}
