import { NextResponse } from 'next/server'
import { HttpError, requireAdmin } from '@/lib/auth/requireAdmin'

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  try {
    const { admin } = await requireAdmin()
    const id = ctx.params.id

    const { data: doc, error: findError } = await admin
      .from('contest_documents')
      .select('certificate_path')
      .eq('work_id', id)
      .maybeSingle()

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 })
    }

    if (doc?.certificate_path) {
      await admin.storage.from('certificates').remove([doc.certificate_path])
    }

    const { error: deleteError } = await admin
      .from('contest_documents')
      .delete()
      .eq('work_id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}
