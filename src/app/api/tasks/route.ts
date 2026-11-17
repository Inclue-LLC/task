import { NextRequest, NextResponse } from 'next/server'
import { getAllTasks, createTask } from '@/lib/db'
import type { CreateTaskInput } from '@/types/task'

export async function GET() {
  try {
    const tasks = getAllTasks()
    return NextResponse.json(tasks)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<CreateTaskInput>

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 })
    }

    const validStatuses = ['todo', 'in_progress', 'done']
    const validPriorities = ['high', 'medium', 'low']
    const validCategories = ['sato', 'nishiguchi', 'announcement', 'shopping', 'other']

    const input: CreateTaskInput = {
      title: body.title.trim(),
      description: body.description ?? null,
      status: validStatuses.includes(body.status ?? '') ? body.status! : 'todo',
      priority: validPriorities.includes(body.priority ?? '') ? body.priority! : 'medium',
      category: validCategories.includes(body.category ?? '') ? body.category! : 'other',
      due_date: body.due_date ?? null,
      assignee: body.assignee ?? null,
    }

    const task = createTask(input)
    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
