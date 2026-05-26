import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/pipeline',
  '/leads',
  '/chat',
  '/whatsapp',
  '/tasks',
  '/settings',
  '/deals',
]

const WEBCHAT_API_PREFIX = '/api/v1/webchat'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith(WEBCHAT_API_PREFIX) && request.method !== 'GET') {
    const origin = request.headers.get('origin')
    const referer = request.headers.get('referer')
    const allowedOrigins = (process.env.WEBCHAT_ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)

    if (allowedOrigins.length > 0) {
      const requestOrigin = origin ?? (referer ? new URL(referer).origin : null)
      if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
        return NextResponse.json(
          { error: { code: 'FORBIDDEN', message: 'Origin não permitida' } },
          { status: 403 },
        )
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pipeline/:path*',
    '/leads/:path*',
    '/chat/:path*',
    '/whatsapp/:path*',
    '/tasks/:path*',
    '/settings/:path*',
    '/deals/:path*',
    '/api/v1/webchat/:path*',
  ],
}
