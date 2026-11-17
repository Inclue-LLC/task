'use client'

import type { Task, TaskCategory } from '@/types/task'
import { CATEGORY_LABELS, CATEGORY_GROUPS } from '@/types/task'

const CAT_DOT: Record<TaskCategory, string> = {
  sato: 'bg-blue-400',
  nishiguchi: 'bg-purple-400',
  announcement: 'bg-orange-400',
  shopping: 'bg-green-400',
  other: 'bg-gray-500',
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
    <aside className="w-52 shrink-0 bg-[#292929] border-r border-[#3c4043] py-3 overflow-y-auto">
      <button
        onClick={() => onSelect('all')}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
          selected === 'all'
            ? 'bg-[#3c4043] text-[#e8eaed] font-medium'
            : 'text-[#9aa0a6] hover:bg-[#363636] hover:text-[#e8eaed]'
        }`}
      >
        <span>すべてのタスク</span>
        <span className={`text-xs rounded px-1.5 py-0.5 ${selected === 'all' ? 'bg-[#4a4a4a] text-[#e8eaed]' : 'text-[#5f6368]'}`}>
          {count('all')}
        </span>
      </button>

      {CATEGORY_GROUPS.map(({ group, items }) => (
        <div key={group} className="mt-5">
          <p className="px-4 mb-1 text-xs font-semibold text-[#5f6368] tracking-wider uppercase">
            {group}
          </p>
          {items.map(cat => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                selected === cat
                  ? 'bg-[#3c4043] text-[#e8eaed] font-medium'
                  : 'text-[#9aa0a6] hover:bg-[#363636] hover:text-[#e8eaed]'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${CAT_DOT[cat]}`} />
                <span className="truncate">{CATEGORY_LABELS[cat]}</span>
              </span>
              <span className={`text-xs ml-1 shrink-0 ${selected === cat ? 'text-[#9aa0a6]' : 'text-[#5f6368]'}`}>
                {count(cat)}
              </span>
            </button>
          ))}
        </div>
      ))}
    </aside>
  )
}
