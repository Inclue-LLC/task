'use client'

import { Search, ArrowUpDown } from 'lucide-react'
import type { TaskStatus, TaskPriority } from '@/types/task'

export type SortKey = 'created_at' | 'due_date' | 'priority' | 'title'
export type SortOrder = 'asc' | 'desc'

export interface FilterState {
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
  search: string
  sortKey: SortKey
  sortOrder: SortOrder
}

interface Props {
  filter: FilterState
  onChange: (f: FilterState) => void
}

const STATUS_TABS: { value: FilterState['status']; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'todo', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'done', label: '完了' },
]

const PRIORITY_OPTIONS: { value: FilterState['priority']; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'created_at', label: '作成日' },
  { value: 'due_date', label: '期日' },
  { value: 'priority', label: '優先度' },
  { value: 'title', label: 'タイトル' },
]

export default function FilterBar({ filter, onChange }: Props) {
  const set = (patch: Partial<FilterState>) => onChange({ ...filter, ...patch })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
      {/* Status tabs */}
      <div className="flex gap-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => set({ status: tab.value })}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter.status === tab.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Second row: search + priority + sort */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="タスクを検索..."
            value={filter.search}
            onChange={e => set({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 whitespace-nowrap">優先度:</span>
          <select
            value={filter.priority}
            onChange={e => set({ priority: e.target.value as FilterState['priority'] })}
            className="pl-2 pr-6 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            {PRIORITY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown size={14} className="text-gray-400" />
          <select
            value={filter.sortKey}
            onChange={e => set({ sortKey: e.target.value as SortKey })}
            className="pl-2 pr-6 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => set({ sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' })}
            className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            title={filter.sortOrder === 'asc' ? '昇順' : '降順'}
          >
            {filter.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </div>
  )
}
