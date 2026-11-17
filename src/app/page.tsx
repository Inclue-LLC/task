'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Search, ClipboardList } from 'lucide-react'
import type { Task, TaskStatus, TaskPriority, TaskCategory, CreateTaskInput } from '@/types/task'
import { CATEGORY_LABELS, CATEGORY_GROUPS } from '@/types/task'
import CategorySidebar from '@/components/CategorySidebar'
import TaskCard from '@/components/TaskCard'
import TaskModal from '@/components/TaskModal'

const CAT_DOT: Record<TaskCategory, string> = {
  sato: 'bg-blue-400',
  nishiguchi: 'bg-purple-400',
  announcement: 'bg-orange-400',
  shopping: 'bg-green-400',
  other: 'bg-gray-500',
}

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }

const STATUS_TABS = [
  { value: 'all' as const, label: 'すべて' },
  { value: 'todo' as const, label: '未着手' },
  { value: 'in_progress' as const, label: '進行中' },
  { value: 'done' as const, label: '完了' },
]

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [defaultCategory, setDefaultCategory] = useState<TaskCategory>('other')

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

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const getColumnTasks = useCallback((cat: TaskCategory) => {
    let result = tasks.filter(t => t.category === cat)
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) || (t.description?.toLowerCase().includes(q) ?? false)
      )
    }
    return result.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority]
      const pb = PRIORITY_ORDER[b.priority]
      return pa !== pb ? pa - pb : b.created_at.localeCompare(a.created_at)
    })
  }, [tasks, statusFilter, search])

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }), [tasks])

  const categoriesToShow: TaskCategory[] = selectedCategory === 'all'
    ? CATEGORY_GROUPS.flatMap(g => g.items)
    : [selectedCategory]

  const openCreate = (cat?: TaskCategory) => {
    setDefaultCategory(cat ?? (selectedCategory !== 'all' ? selectedCategory : 'other'))
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
    <div className="h-screen flex flex-col bg-[#202124]">
      {/* Header */}
      <header className="shrink-0 bg-[#202124] border-b border-[#3c4043] px-5 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 mr-auto">
          <div className="bg-[#8ab4f8] text-[#202124] p-1.5 rounded-lg">
            <ClipboardList size={18} />
          </div>
          <h1 className="text-base font-semibold text-[#e8eaed]">タスク管理</h1>
          <div className="hidden sm:flex gap-3 ml-4 text-xs text-[#9aa0a6]">
            <span>全 <span className="text-[#e8eaed] font-medium">{stats.total}</span></span>
            <span className="text-amber-400">未着手 <span className="font-medium">{stats.todo}</span></span>
            <span className="text-[#8ab4f8]">進行中 <span className="font-medium">{stats.in_progress}</span></span>
            <span className="text-green-400">完了 <span className="font-medium">{stats.done}</span></span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          <input
            type="text"
            placeholder="検索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-[#3c4043] border border-transparent focus:border-[#8ab4f8] rounded-full text-sm text-[#e8eaed] placeholder-[#9aa0a6] focus:outline-none w-44 transition-colors"
          />
        </div>

        <button
          onClick={() => openCreate()}
          className="flex items-center gap-2 bg-[#8ab4f8] hover:bg-[#93bbf9] text-[#202124] px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          新規タスク
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <CategorySidebar
          tasks={tasks}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Status filter */}
          <div className="shrink-0 flex items-center gap-1 px-4 pt-3 pb-2">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-[#8ab4f8] text-[#202124]'
                    : 'text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#3c4043]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Board */}
          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <div className="w-6 h-6 border-2 border-[#3c4043] border-t-[#8ab4f8] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 pb-4">
              <div className={`flex gap-3 h-full ${categoriesToShow.length > 1 ? 'w-max' : 'w-full'}`}>
                {categoriesToShow.map(cat => {
                  const colTasks = getColumnTasks(cat)
                  return (
                    <div
                      key={cat}
                      className={`flex flex-col bg-[#2d2e31] rounded-xl overflow-hidden shrink-0 ${
                        categoriesToShow.length === 1 ? 'w-full max-w-2xl' : 'w-72'
                      }`}
                    >
                      {/* Column header */}
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#3c4043] shrink-0">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${CAT_DOT[cat]}`} />
                        <h2 className="font-medium text-[#e8eaed] text-sm">{CATEGORY_LABELS[cat]}</h2>
                        <span className="ml-auto text-xs text-[#5f6368]">{colTasks.length}</span>
                      </div>

                      {/* Tasks */}
                      <div className="flex-1 overflow-y-auto py-1">
                        {colTasks.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                          />
                        ))}
                        {colTasks.length === 0 && (
                          <p className="text-xs text-[#5f6368] text-center py-8">タスクなし</p>
                        )}
                      </div>

                      {/* Add task */}
                      <button
                        onClick={() => openCreate(cat)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-[#9aa0a6] hover:text-[#8ab4f8] hover:bg-[#3c4043] transition-colors border-t border-[#3c4043] shrink-0"
                      >
                        <Plus size={15} />
                        タスクを追加
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          defaultCategory={defaultCategory}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
