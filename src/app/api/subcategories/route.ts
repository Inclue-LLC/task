import { NextRequest, NextResponse } from 'next/server'
import { getAllSubcategories, createSubcategory } from '@/lib/db'
import type { TaskCategory } from '@/types/task'

export async function GET() {
  try {
    return NextResponse.json(getAllSubcategories())
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = String(body.name ?? '').trim()
    const category = body.category as TaskCategory

    const validCategories = ['sato', 'nishiguchi', 'announcement', 'shopping', 'other']
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!validCategories.includes(category)) return NextResponse.json({ error: 'Invalid category' }, { status: 400 })

    const sub = createSubcategory(name, category)
    return NextResponse.json(sub, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
