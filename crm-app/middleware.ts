/**
 * middleware.ts — Proteção de rotas (Next.js 16)
 * Usar middleware.ts (não proxy.ts): Turbopack 16.2.x gera manifest vazio com proxy.ts → 404 na Vercel.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

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
