import { NextRequest, NextResponse } from 'next/server'
import { getSubcategoryById, updateSubcategory, deleteSubcategory } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id: rawId } = await params
    const id = Number(rawId)
    if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    if (!getSubcategoryById(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const name = String(body.name ?? '').trim()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    return NextResponse.json(updateSubcategory(id, name))
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const deleted = deleteSubcategory(id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
