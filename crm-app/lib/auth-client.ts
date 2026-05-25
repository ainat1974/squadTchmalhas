/**
 * lib/auth-client.ts — Supabase client para uso no browser (Client Components)
 * Singleton para não criar múltiplas instâncias.
 */
import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return client
}

/** Login com e-mail/senha */
export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.signInWithPassword({ email, password })
}

/** Login com Google OAuth */
export async function signInWithGoogle() {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.signInWithOAuth({
    provider:  'google',
    options:   { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

/** Logout */
export async function signOut() {
  const supabase = getSupabaseBrowserClient()
  return supabase.auth.signOut()
}