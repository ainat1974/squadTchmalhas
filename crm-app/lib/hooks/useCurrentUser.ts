'use client'
import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/auth-client'
import type { User } from '@prisma/client'

export function useCurrentUser() {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setLoading(false); return }

      fetch('/api/v1/users/me')
        .then(r => r.json())
        .then(({ data }) => { setUser(data as User); setLoading(false) })
        .catch(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}