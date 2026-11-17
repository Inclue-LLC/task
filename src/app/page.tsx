'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, ClipboardList } from 'lucide-react'
import type { Task, TaskStatus, TaskPriority, CreateTaskInput } from '@/types/task'
import FilterBar, { FilterState, SortKey } from '@/components/FilterBar'
import TaskList from '@/components/TaskList'
import TaskModal from '@/components/TaskModal'
import CategorySidebar from '@/components/CategorySidebar'

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }

const DEFAULT_FILTER: FilterState = {
  status: 'all',
  priority: 'all',
  category: 'all',
  search: '',
  sortKey: 'created_at',
  sortOrder: 'desc',
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    if (filter.status !== 'all') {
      result = result.filter(t => t.status === filter.status)
    }
    if (filter.priority !== 'all') {
      result = result.filter(t => t.priority === filter.priority)
    }
    if (filter.category !== 'all') {
      result = result.filter(t => t.category === filter.category)
    }
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase()
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false),
      )
    }

    result.sort((a, b) => {
      let cmp = 0
      const key = filter.sortKey as SortKey
      if (key === 'priority') {
        cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      } else if (key === 'due_date') {
        cmp = (a.due_date ?? '9999-12-31').localeCompare(b.due_date ?? '9999-12-31')
      } else if (key === 'title') {
        cmp = a.title.localeCompare(b.title, 'ja')
      } else {
        cmp = a.created_at.localeCompare(b.created_at)
      }
      return filter.sortOrder === 'asc' ? cmp : -cmp
    })

    return result
  }, [tasks, filter])

  const stats = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      done: tasks.filter(t => t.status === 'done').length,
    }),
    [tasks],
  )

  const openCreate = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('このタスクを削除してもよいですか？')) return
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    fetchTasks()
  }

  const handleStatusChange = async (id: number, status: TaskStatus) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchTasks()
  }

  const handleSave = async (data: CreateTaskInput) => {
    if (editingTask) {
      await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } else {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    setIsModalOpen(false)
    fetchTasks()
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <ClipboardList size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">タスク管理</h1>
              <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                <span>全 <strong className="text-gray-700">{stats.total}</strong> 件</span>
                <span className="text-amber-600">未着手 <strong>{stats.todo}</strong></span>
                <span className="text-blue-600">進行中 <strong>{stats.in_progress}</strong></span>
                <span className="text-green-600">完了 <strong>{stats.done}</strong></span>
              </div>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            新規タスク
          </button>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Category sidebar */}
        <div className="shrink-0 overflow-y-auto">
          <CategorySidebar
            tasks={tasks}
            selected={filter.category}
            onSelect={cat => setFilter(f => ({ ...f, category: cat }))}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <FilterBar filter={filter} onChange={setFilter} />

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {filteredTasks.length !== tasks.length && (
                <p className="text-xs text-gray-400 mb-3">
                  {filteredTasks.length} 件を表示中（全 {tasks.length} 件中）
                </p>
              )}
              <TaskList
                tasks={filteredTasks}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            </>
          )}
        </main>
      </div>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
