import { NextResponse } from 'next/server'
import { HttpError, requireAdmin } from '@/lib/auth/requireAdmin'

type Body = {
  bucket: string
  paths: string[]
  expiresIn?: number
}

const ALLOWED_BUCKETS = new Set(['contest-photos', 'certificates'])

function isValidPath(path: string) {
  if (!path || path.length > 512) return false
  if (path.includes('..')) return false
  return /^[a-zA-Z0-9_./-]+$/.test(path)
}

export async function POST(req: Request) {
  try {
    const { admin } = await requireAdmin()
    const body = (await req.json()) as Body
    const bucket = body.bucket
    const paths = Array.isArray(body.paths) ? body.paths.filter((p): p is string => typeof p === 'string' && isValidPath(p)) : []
    const expiresIn = Math.max(60, Math.min(60 * 60 * 6, body.expiresIn ?? 60 * 30))

    if (!ALLOWED_BUCKETS.has(bucket) || paths.length === 0 || paths.length > 100) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const urls: Record<string, string> = {}
    await Promise.all(
      paths.map(async (path) => {
        const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, expiresIn)
        if (!error && data?.signedUrl) {
          urls[path] = data.signedUrl
        }
      })
    )

    return NextResponse.json({ urls })
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status })
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}
