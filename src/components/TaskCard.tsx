'use client'

import { Pencil, Trash2, Calendar, User, ChevronRight } from 'lucide-react'
import type { Task, TaskStatus } from '@/types/task'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types/task'

interface Props {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: TaskStatus) => void
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
}

const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-500',
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
}

const NEXT_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: '→ 進行中に',
  in_progress: '→ 完了に',
  done: '→ 未着手に',
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return dueDate < new Date().toISOString().slice(0, 10)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${y}/${m}/${d}`
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const overdue = isOverdue(task.due_date)

  return (
    <div
      className={`bg-white rounded-xl border transition-shadow hover:shadow-md ${
        task.status === 'done' ? 'border-gray-100 opacity-75' : 'border-gray-200'
      }`}
    >
      <div className="p-4">
        {/* Top row: badges + actions */}
        <div className="flex items-start gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
            優先度: {PRIORITY_LABELS[task.priority]}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="編集"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="削除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-medium text-gray-900 mb-1 leading-snug ${
            task.status === 'done' ? 'line-through text-gray-400' : ''
          }`}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{task.description}</p>
        )}

        {/* Bottom row: meta + status change */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
          {task.due_date && (
            <span className={`flex items-center gap-1 ${overdue && task.status !== 'done' ? 'text-red-500 font-medium' : ''}`}>
              <Calendar size={11} />
              {formatDate(task.due_date)}
              {overdue && task.status !== 'done' && ' (期限超過)'}
            </span>
          )}
          {task.assignee && (
            <span className="flex items-center gap-1">
              <User size={11} />
              {task.assignee}
            </span>
          )}
          <button
            onClick={() => onStatusChange(task.id, NEXT_STATUS[task.status])}
            className="ml-auto flex items-center gap-0.5 text-blue-500 hover:text-blue-700 font-medium transition-colors"
          >
            {NEXT_STATUS_LABEL[task.status]}
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
