export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskCategory =
  | 'sato'
  | 'nishiguchi'
  | 'announcement'
  | 'shopping'
  | 'other'

export type CategoryGroup = '仕事' | 'プライベート'

export interface Subcategory {
  id: number
  name: string
  category: TaskCategory
  sort_order: number
  created_at: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  category: TaskCategory
  subcategory_id: number | null
  due_date: string | null
  assignee: string | null
  created_at: string
  updated_at: string
}

export type CreateTaskInput = Omit<Task, 'id' | 'created_at' | 'updated_at'>
export type UpdateTaskInput = Partial<CreateTaskInput>

// サイドバーの選択状態
export type SidebarSelection =
  | 'all'
  | TaskCategory
  | { type: 'sub'; id: number; cat: TaskCategory }

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '未着手',
  in_progress: '進行中',
  done: '完了',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  sato: '佐藤個人',
  nishiguchi: '西口個人',
  announcement: '告知',
  shopping: '買い物',
  other: 'その他',
}

export const CATEGORY_GROUP: Record<TaskCategory, CategoryGroup> = {
  sato: '仕事',
  nishiguchi: '仕事',
  announcement: '仕事',
  shopping: 'プライベート',
  other: 'プライベート',
}

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  sato: 'bg-blue-100 text-blue-700',
  nishiguchi: 'bg-purple-100 text-purple-700',
  announcement: 'bg-orange-100 text-orange-700',
  shopping: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-500',
}

export const CATEGORY_GROUPS: { group: CategoryGroup; items: TaskCategory[] }[] = [
  { group: '仕事', items: ['sato', 'nishiguchi', 'announcement'] },
  { group: 'プライベート', items: ['shopping', 'other'] },
]
