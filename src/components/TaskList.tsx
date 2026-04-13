'use client'

import { ClipboardList } from 'lucide-react'
import type { Task, TaskStatus } from '@/types/task'
import TaskCard from './TaskCard'

interface Props {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: TaskStatus) => void
}

export default function TaskList({ tasks, onEdit, onDelete, onStatusChange }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <ClipboardList size={48} strokeWidth={1.2} className="mb-4" />
        <p className="text-lg font-medium">タスクがありません</p>
        <p className="text-sm mt-1">「新規タスク」ボタンから追加してください</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
