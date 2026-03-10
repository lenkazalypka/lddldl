import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { data: sessionRes } = await supabase.auth.getSession()
  const accessToken = sessionRes.session?.access_token
  const claims = accessToken ? decodeJwtPayload(accessToken) : null
  const jwtRole = (claims?.user_role as string | undefined) ?? null

  if (!user && request.nextUrl.pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (user && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url)
      if (request.nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(loginUrl)
    }

    let isAdmin = jwtRole === 'admin'
    if (!isAdmin) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      isAdmin = !error && profile?.role === 'admin'
    }

    if (!isAdmin) {
      if (request.nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/profile', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/profile/:path*', '/auth/:path*', '/login', '/register', '/admin/:path*', '/api/admin/:path*'],
}
