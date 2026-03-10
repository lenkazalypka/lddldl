import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(normalized, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes.user

  if (!user) {
    throw new HttpError(401, 'Unauthorized')
  }

  const { data: sessionRes } = await supabase.auth.getSession()
  const accessToken = sessionRes.session?.access_token
  const claims = accessToken ? decodeJwtPayload(accessToken) : null
  const jwtRole = (claims?.user_role as string | undefined) ?? null

  if (jwtRole === 'admin') {
    return { user, supabase, admin: createAdminClient() }
  }

  // Fallback while JWT hook is not enabled in Supabase project yet.
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || profile?.role !== 'admin') {
    throw new HttpError(403, 'Forbidden')
  }

  return { user, supabase, admin: createAdminClient() }
}
