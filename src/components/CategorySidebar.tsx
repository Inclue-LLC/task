'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, X, Pencil } from 'lucide-react'
import type { Task, TaskCategory, Subcategory, SidebarSelection } from '@/types/task'
import { CATEGORY_LABELS, CATEGORY_GROUPS } from '@/types/task'

const CAT_DOT: Record<TaskCategory, string> = {
  sato: 'bg-blue-400',
  nishiguchi: 'bg-purple-400',
  announcement: 'bg-orange-400',
  shopping: 'bg-green-400',
  other: 'bg-gray-500',
}

function sameSel(a: SidebarSelection, b: SidebarSelection): boolean {
  if (typeof a === 'string' && typeof b === 'string') return a === b
  if (typeof a === 'object' && typeof b === 'object') return a.id === b.id
  return false
}

interface Props {
  tasks: Task[]
  subcategories: Subcategory[]
  selected: SidebarSelection
  onSelect: (sel: SidebarSelection) => void
  onSubcategoriesChange: () => void
}

export default function CategorySidebar({ tasks, subcategories, selected, onSelect, onSubcategoriesChange }: Props) {
  const [addingFor, setAddingFor] = useState<TaskCategory | null>(null)
  const [addName, setAddName] = useState('')
  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameText, setRenameText] = useState('')

  const addInputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (addingFor) addInputRef.current?.focus() }, [addingFor])
  useEffect(() => { if (renamingId !== null) renameInputRef.current?.focus() }, [renamingId])

  const countCat = (cat: TaskCategory) => tasks.filter(t => t.category === cat).length
  const countSub = (id: number) => tasks.filter(t => t.subcategory_id === id).length

  const handleAddSub = async (cat: TaskCategory) => {
    const name = addName.trim()
    setAddingFor(null)
    setAddName('')
    if (!name) return
    await fetch('/api/subcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category: cat }),
    })
    onSubcategoriesChange()
  }

  const handleDelete = async (sub: Subcategory) => {
    await fetch(`/api/subcategories/${sub.id}`, { method: 'DELETE' })
    if (typeof selected === 'object' && selected.id === sub.id) onSelect(sub.category)
    onSubcategoriesChange()
  }

  const handleRename = async (id: number) => {
    const name = renameText.trim()
    setRenamingId(null)
    if (!name) return
    await fetch(`/api/subcategories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    onSubcategoriesChange()
  }

  const isSel = (sel: SidebarSelection) => sameSel(selected, sel)
  const active = 'bg-[#3c4043] text-[#e8eaed] font-medium'
  const inactive = 'text-[#9aa0a6] hover:bg-[#363636] hover:text-[#e8eaed]'
  const row = 'w-full flex items-center justify-between text-sm transition-colors'

  return (
    <aside className="w-52 shrink-0 bg-[#292929] border-r border-[#3c4043] py-3 overflow-y-auto">
      {/* すべてのタスク */}
      <button
        onClick={() => onSelect('all')}
        className={`${row} px-4 py-2.5 ${isSel('all') ? active : inactive}`}
      >
        <span>すべてのタスク</span>
        <span className={`text-xs rounded px-1.5 py-0.5 ${isSel('all') ? 'bg-[#4a4a4a] text-[#e8eaed]' : 'text-[#5f6368]'}`}>
          {tasks.length}
        </span>
      </button>

      {CATEGORY_GROUPS.map(({ group, items }) => (
        <div key={group} className="mt-5">
          <p className="px-4 mb-1 text-xs font-semibold text-[#5f6368] tracking-wider uppercase">{group}</p>

          {items.map(cat => {
            const catSubs = subcategories.filter(s => s.category === cat)
            return (
              <div key={cat}>
                {/* メインカテゴリ行 */}
                <button
                  onClick={() => onSelect(cat)}
                  className={`${row} px-4 py-2.5 ${isSel(cat) ? active : inactive}`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${CAT_DOT[cat]}`} />
                    <span className="truncate">{CATEGORY_LABELS[cat]}</span>
                  </span>
                  <span className={`text-xs ml-1 shrink-0 ${isSel(cat) ? 'text-[#9aa0a6]' : 'text-[#5f6368]'}`}>
                    {countCat(cat)}
                  </span>
                </button>

                {/* サブカテゴリ一覧 */}
                {catSubs.map(sub => (
                  <div key={sub.id} className="relative group/sub">
                    {renamingId === sub.id ? (
                      <div className="pl-9 pr-4 py-1">
                        <input
                          ref={renameInputRef}
                          type="text"
                          value={renameText}
                          onChange={e => setRenameText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRename(sub.id)
                            if (e.key === 'Escape') setRenamingId(null)
                          }}
                          onBlur={() => handleRename(sub.id)}
                          className="w-full px-2 py-1 text-sm bg-[#3c4043] border border-[#8ab4f8] rounded text-[#e8eaed] outline-none"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelect({ type: 'sub', id: sub.id, cat })}
                        className={`${row} pl-9 pr-10 py-2 ${isSel({ type: 'sub', id: sub.id, cat }) ? active : inactive}`}
                      >
                        <span className="truncate text-xs">{sub.name}</span>
                        <span className={`text-xs shrink-0 ${isSel({ type: 'sub', id: sub.id, cat }) ? 'text-[#9aa0a6]' : 'text-[#5f6368]'}`}>
                          {countSub(sub.id)}
                        </span>
                      </button>
                    )}
                    {/* ホバーアクション（名前変更 / 削除） */}
                    {renamingId !== sub.id && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/sub:opacity-100 flex items-center gap-0.5 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); setRenamingId(sub.id); setRenameText(sub.name) }}
                          className="p-0.5 text-[#5f6368] hover:text-[#e8eaed] rounded"
                          title="名前を変更"
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(sub) }}
                          className="p-0.5 text-[#5f6368] hover:text-red-400 rounded"
                          title="削除"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* リスト追加 */}
                {addingFor === cat ? (
                  <div className="pl-9 pr-4 py-1">
                    <input
                      ref={addInputRef}
                      type="text"
                      value={addName}
                      onChange={e => setAddName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddSub(cat)
                        if (e.key === 'Escape') setAddingFor(null)
                      }}
                      onBlur={() => handleAddSub(cat)}
                      placeholder="リスト名を入力..."
                      className="w-full px-2 py-1 text-sm bg-[#3c4043] border border-[#8ab4f8] rounded text-[#e8eaed] placeholder-[#5f6368] outline-none"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingFor(cat); setAddName('') }}
                    className="w-full flex items-center gap-1.5 pl-9 pr-4 py-1.5 text-xs text-[#5f6368] hover:text-[#8ab4f8] transition-colors"
                  >
                    <Plus size={11} />
                    リストを追加
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </aside>
  )
}
