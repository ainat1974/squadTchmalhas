/**
 * middleware.ts — Proteção de rotas (Edge Runtime)
 * Código autocontido: imports de @/lib/* quebram o bundle Edge na Vercel.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PREVIEW_MODE =
  process.env.PREVIEW_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/preview') ||
    pathname.startsWith('/api/v1/public/') ||
    pathname.startsWith('/api/v1/webhooks/') ||
    pathname.startsWith('/api/cron/') ||
    pathname === '/login' ||
    pathname === '/auth/callback'
  )
}

async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.includes('placeholder')) {
    return { response, user: null }
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname) || PREVIEW_MODE) {
    return NextResponse.next({ request })
  }

  try {
    const { response, user } = await updateSession(request)

    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return response
  } catch (err) {
    console.error('[middleware] auth check failed:', err)
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
