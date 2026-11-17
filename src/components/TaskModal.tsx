'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Task, TaskStatus, TaskPriority, TaskCategory, CreateTaskInput } from '@/types/task'
import { CATEGORY_LABELS, CATEGORY_GROUPS } from '@/types/task'

interface Props {
  task: Task | null
  defaultCategory?: TaskCategory
  onClose: () => void
  onSave: (data: CreateTaskInput) => void
}

export default function TaskModal({ task, defaultCategory = 'other', onClose, onSave }: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium')
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? defaultCategory)
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [assignee, setAssignee] = useState(task?.assignee ?? '')
  const [error, setError] = useState('')

  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('タイトルを入力してください')
      titleRef.current?.focus()
      return
    }
    onSave({
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      category,
      due_date: dueDate || null,
      assignee: assignee.trim() || null,
    })
  }

  const field = "w-full px-3 py-2 rounded-lg border bg-[#3c4043] border-[#5f6368] text-[#e8eaed] placeholder-[#9aa0a6] text-sm focus:outline-none focus:border-[#8ab4f8] focus:ring-1 focus:ring-[#8ab4f8] transition-colors"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#2d2e31] rounded-2xl shadow-2xl w-full max-w-lg border border-[#3c4043]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3c4043]">
          <h2 className="text-base font-semibold text-[#e8eaed]">
            {task ? 'タスクを編集' : '新規タスク作成'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#3c4043] rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#e8eaed] mb-1">
              タイトル <span className="text-red-400">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setError('') }}
              placeholder="タスクのタイトルを入力"
              className={`${field} ${error ? 'border-red-400' : ''}`}
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#e8eaed] mb-1">説明</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="タスクの詳細を入力（任意）"
              rows={3}
              className={`${field} resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#e8eaed] mb-1">カテゴリ</label>
            <select value={category} onChange={e => setCategory(e.target.value as TaskCategory)} className={field}>
              {CATEGORY_GROUPS.map(({ group, items }) => (
                <optgroup key={group} label={group}>
                  {items.map(cat => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#e8eaed] mb-1">ステータス</label>
              <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className={field}>
                <option value="todo">未着手</option>
                <option value="in_progress">進行中</option>
                <option value="done">完了</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#e8eaed] mb-1">優先度</label>
              <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className={field}>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#e8eaed] mb-1">期日</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={field} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#e8eaed] mb-1">担当者</label>
              <input
                type="text"
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                placeholder="担当者名（任意）"
                className={field}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#3c4043] rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-[#202124] bg-[#8ab4f8] hover:bg-[#93bbf9] rounded-lg transition-colors"
            >
              {task ? '更新する' : '作成する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
