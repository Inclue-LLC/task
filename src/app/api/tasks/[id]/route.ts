import { NextRequest, NextResponse } from 'next/server'
import { getTaskById, updateTask, deleteTask } from '@/lib/db'
import type { UpdateTaskInput } from '@/types/task'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const task = getTaskById(id)
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(task)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }
    if (!getTaskById(id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await req.json() as Partial<UpdateTaskInput>
    const validStatuses = ['todo', 'in_progress', 'done']
    const validPriorities = ['high', 'medium', 'low']
    const validCategories = ['sato', 'nishiguchi', 'announcement', 'shopping', 'other']

    const input: UpdateTaskInput = {}
    if (body.title !== undefined) input.title = String(body.title).trim() || undefined
    if (body.description !== undefined) input.description = body.description
    if (body.status !== undefined && validStatuses.includes(body.status)) input.status = body.status
    if (body.priority !== undefined && validPriorities.includes(body.priority)) input.priority = body.priority
    if (body.category !== undefined && validCategories.includes(body.category)) input.category = body.category
    if (body.due_date !== undefined) input.due_date = body.due_date
    if (body.assignee !== undefined) input.assignee = body.assignee

    const updated = updateTask(id, input)
    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const deleted = deleteTask(id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
