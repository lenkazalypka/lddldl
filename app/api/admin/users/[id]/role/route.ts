import { NextResponse } from 'next/server'
import { HttpError, requireAdmin } from '@/lib/auth/requireAdmin'

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const { admin, user } = await requireAdmin()
    const body = await req.json().catch(() => ({})) as { role?: 'user' | 'admin' }
    const role = body.role

    if (role !== 'user' && role !== 'admin') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    if (ctx.params.id === user.id && role !== 'admin') {
      return NextResponse.json({ error: 'Нельзя снять роль администратора с самого себя' }, { status: 400 })
    }

    const { error } = await admin.rpc('set_user_role', {
      target_user: ctx.params.id,
      new_role: role,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}
