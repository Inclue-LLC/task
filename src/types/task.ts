export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskCategory =
  | 'goods'
  | 'procurement'
  | 'offline_sales'
  | 'online_sales'
  | 'agent'
  | 'sns'
  | 'new_business'
  | 'other'

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  category: TaskCategory
  due_date: string | null
  assignee: string | null
  created_at: string
  updated_at: string
}

export type CreateTaskInput = Omit<Task, 'id' | 'created_at' | 'updated_at'>
export type UpdateTaskInput = Partial<CreateTaskInput>

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
  goods: 'グッズ製造',
  procurement: '仕入れ',
  offline_sales: 'オフライン販売',
  online_sales: 'オンライン販売',
  agent: 'エージェント',
  sns: 'SNS',
  new_business: '新規事業',
  other: 'その他',
}

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  goods: 'bg-purple-100 text-purple-700',
  procurement: 'bg-teal-100 text-teal-700',
  offline_sales: 'bg-orange-100 text-orange-700',
  online_sales: 'bg-sky-100 text-sky-700',
  agent: 'bg-pink-100 text-pink-700',
  sns: 'bg-yellow-100 text-yellow-700',
  new_business: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-500',
}
