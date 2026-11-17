'use client'

import type { Task, TaskCategory } from '@/types/task'
import { CATEGORY_LABELS, CATEGORY_GROUPS } from '@/types/task'

const CAT_DOT: Record<TaskCategory, string> = {
  sato: 'bg-blue-400',
  nishiguchi: 'bg-purple-400',
  announcement: 'bg-orange-400',
  shopping: 'bg-green-400',
  other: 'bg-gray-300',
}

interface Props {
  tasks: Task[]
  selected: TaskCategory | 'all'
  onSelect: (cat: TaskCategory | 'all') => void
}

export default function CategorySidebar({ tasks, selected, onSelect }: Props) {
  const count = (cat: TaskCategory | 'all') =>
    cat === 'all' ? tasks.length : tasks.filter(t => t.category === cat).length

  return (
    <aside className="w-48 shrink-0 bg-white border-r border-gray-200 py-3">
      {/* すべて */}
      <button
        onClick={() => onSelect('all')}
        className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors rounded-none ${
          selected === 'all'
            ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span>すべて</span>
        <span className={`text-xs rounded-full px-1.5 ${selected === 'all' ? 'text-blue-600' : 'text-gray-400'}`}>
          {count('all')}
        </span>
      </button>

      {CATEGORY_GROUPS.map(({ group, items }) => (
        <div key={group} className="mt-5">
          <p className="px-4 mb-1 text-xs font-bold text-gray-400 tracking-widest uppercase">
            {group}
          </p>
          {items.map(cat => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                selected === cat
                  ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${CAT_DOT[cat]}`} />
                <span className="truncate">{CATEGORY_LABELS[cat]}</span>
              </span>
              <span className={`text-xs ml-1 shrink-0 ${selected === cat ? 'text-blue-500' : 'text-gray-400'}`}>
                {count(cat)}
              </span>
            </button>
          ))}
        </div>
      ))}
    </aside>
  )
}
