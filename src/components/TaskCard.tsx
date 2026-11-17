'use client'

import { Check, Pencil, Trash2, Calendar, User } from 'lucide-react'
import type { Task, TaskStatus } from '@/types/task'
import { PRIORITY_LABELS } from '@/types/task'

interface Props {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: TaskStatus) => void
}

const PRIORITY_COLOR = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: '',
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return dueDate < new Date().toISOString().slice(0, 10)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const [, m, d] = dateStr.split('-')
  return `${Number(m)}月${Number(d)}日`
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const isDone = task.status === 'done'
  const isInProgress = task.status === 'in_progress'
  const overdue = isOverdue(task.due_date)

  return (
    <div className="flex items-start gap-3 px-3 py-2.5 hover:bg-[#3c4043] group cursor-default transition-colors">
      {/* Circle checkbox */}
      <button
        onClick={() => onStatusChange(task.id, isDone ? 'todo' : 'done')}
        title={isDone ? '未着手に戻す' : '完了にする'}
        className={`mt-0.5 w-[18px] h-[18px] rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
          isDone
            ? 'bg-[#8ab4f8] border-[#8ab4f8]'
            : isInProgress
            ? 'border-[#8ab4f8]'
            : 'border-[#5f6368] hover:border-[#8ab4f8]'
        }`}
      >
        {isDone && <Check size={10} className="text-[#202124]" strokeWidth={3} />}
        {isInProgress && <span className="w-2 h-2 rounded-full bg-[#8ab4f8]" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-5 break-words ${isDone ? 'line-through text-[#5f6368]' : 'text-[#e8eaed]'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-[#9aa0a6] mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
          {task.due_date && (
            <span className={`flex items-center gap-1 text-xs ${overdue && !isDone ? 'text-red-400' : 'text-[#9aa0a6]'}`}>
              <Calendar size={10} />
              {formatDate(task.due_date)}
            </span>
          )}
          {task.priority !== 'low' && (
            <span className={`text-xs ${PRIORITY_COLOR[task.priority]}`}>
              優先度: {PRIORITY_LABELS[task.priority]}
            </span>
          )}
          {task.assignee && (
            <span className="flex items-center gap-1 text-xs text-[#9aa0a6]">
              <User size={10} />
              {task.assignee}
            </span>
          )}
        </div>
      </div>

      {/* Actions (hover only) */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#4a4a4a] rounded-lg transition-colors"
          title="編集"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 text-[#9aa0a6] hover:text-red-400 hover:bg-[#4a4a4a] rounded-lg transition-colors"
          title="削除"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
