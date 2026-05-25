/**
 * middleware.ts — Proteção leve de rotas (Edge Runtime)
 * Sem @supabase/ssr aqui: createServerClient quebra no Edge da Vercel em produção.
 * Sessão real é validada em Server Components via lib/auth.ts.
 */
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

/** Cookie de sessão Supabase (sb-<ref>-auth-token) */
function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (c) => c.name.includes('-auth-token') && Boolean(c.value),
  )
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    if (isPublicPath(pathname) || PREVIEW_MODE) {
      return NextResponse.next({ request })
    }

    if (!hasAuthCookie(request)) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next({ request })
  } catch (err) {
    console.error('[middleware] unexpected error:', err)
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
