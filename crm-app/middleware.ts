/**
 * middleware.ts — Proteção de rotas Next.js
 * Rotas /app/* exigem autenticação via Supabase SSR
 * Rotas /api/v1/public/* e /api/v1/webhooks/* são públicas
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PREVIEW_MODE =
  process.env.PREVIEW_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Rotas públicas — sem proteção
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/preview') ||
    pathname.startsWith('/api/v1/public/') ||
    pathname.startsWith('/api/v1/webhooks/') ||
    pathname.startsWith('/api/cron/') ||
    pathname === '/login' ||
    pathname === '/auth/callback'

  if (isPublic) return res

  // Em modo preview (sem Supabase real), libera tudo
  if (PREVIEW_MODE) return res

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get:    (name) => req.cookies.get(name)?.value,
        set:    (name, value, opts) => { res.cookies.set(name, value, opts) },
        remove: (name, opts) => { res.cookies.delete({ name, ...opts }) },
      },
    },
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Redirecionar para /login se não autenticado
  if (!session) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}