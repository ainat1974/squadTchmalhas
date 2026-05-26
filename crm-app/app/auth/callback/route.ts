import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/pipeline'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get:    (n: string) => cookieStore.get(n)?.value,
          set:    (n: string, v: string, o: Parameters<typeof cookieStore.set>[2]) =>
            cookieStore.set(n, v, o),
          remove: (n: string) => cookieStore.delete(n),
        },
      },
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(next, req.url))
}