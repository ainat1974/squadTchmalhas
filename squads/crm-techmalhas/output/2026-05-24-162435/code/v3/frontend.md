# Frontend Implementation — CRM Techmalhas

> **TL;DR:** 10 páginas (Server Components por padrão), 22 componentes de domínio,
> dnd-kit para Kanban com optimistic update, Supabase Realtime para Chat ao Vivo,
> React Query para data fetching, design system Techmalhas (verde #1A6B3C, shadcn/ui).

---

## Estrutura de Arquivos

```
app/
├── globals.css
├── layout.tsx                          ← RootLayout (fonts + providers)
├── (auth)/
│   └── login/
│       └── page.tsx                    ← Login com e-mail/senha + Google OAuth
├── (dashboard)/
│   ├── layout.tsx                      ← Shell: Sidebar + Header + auth guard
│   ├── pipeline/
│   │   └── page.tsx                    ← Kanban Board (Atacado / Varejo)
│   ├── leads/
│   │   ├── page.tsx                    ← Lista de leads/contatos
│   │   └── [id]/
│   │       └── page.tsx                ← Detalhe do contato (timeline, deals)
│   ├── chat/
│   │   ├── page.tsx                    ← Inbox unificado (WA + IG + WebChat)
│   │   └── [contactId]/
│   │       └── page.tsx                ← Thread de conversa
│   ├── tasks/
│   │   └── page.tsx                    ← Tarefas e atividades
│   ├── dashboard/
│   │   └── page.tsx                    ← KPIs e métricas
│   └── settings/
│       ├── pipelines/
│       │   └── [id]/
│       │       └── page.tsx            ← Config de stages e tarefas obrigatórias
│       └── users/
│           └── page.tsx                ← Gestão de usuários (admin)
└── auth/
    └── callback/
        └── route.ts                    ← Callback OAuth Google
components/
├── ui/                                 ← shadcn primitives (gerados via CLI)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── drawer.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── select.tsx
│   ├── sheet.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── tooltip.tsx
│   ├── separator.tsx
│   ├── alert.tsx
│   └── skeleton.tsx
├── kanban/
│   ├── KanbanBoard.tsx                 ← DndContext + estado otimista
│   ├── KanbanColumn.tsx                ← Droppable column
│   ├── KanbanCard.tsx                  ← Draggable card
│   └── ObligatoryTaskBlocker.tsx       ← AlertDialog hard block
├── leads/
│   ├── LeadForm.tsx                    ← Criar / editar contato
│   ├── LeadDrawer.tsx                  ← Sheet lateral com detalhes
│   ├── LeadTimeline.tsx                ← Histórico de interações
│   └── LeadCard.tsx                    ← Card na listagem
├── chat/
│   ├── ChatList.tsx                    ← Lista de conversas (inbox)
│   ├── ChatThread.tsx                  ← Thread com Supabase Realtime
│   ├── MessageBubble.tsx               ← Bolha de mensagem
│   └── ChannelBadge.tsx                ← Badge WA / IG / WebChat
├── tasks/
│   ├── TaskCard.tsx
│   ├── TaskList.tsx
│   └── MandatoryBadge.tsx
├── dashboard/
│   ├── KPICard.tsx
│   ├── FunnelChart.tsx
│   └── OverduePanel.tsx
├── layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── NavItem.tsx
│   └── UserMenu.tsx
└── providers/
    └── QueryProvider.tsx               ← ReactQueryDevtools + QueryClientProvider
lib/
├── auth-client.ts                      ← Supabase browser client
├── api-client.ts                       ← Fetcher tipado + React Query helpers
├── utils.ts                            ← cn(), formatDate(), formatCurrency()
└── hooks/
    ├── useCurrentUser.ts
    ├── useContacts.ts
    ├── useDeals.ts
    ├── useActivities.ts
    └── useRealtimeChat.ts
```

---

## Configuração

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // ─── Techmalhas Brand ──────────────────────
        brand: {
          DEFAULT: '#1A6B3C',
          50:      '#E8F5EE',
          100:     '#C6E6D5',
          200:     '#8FCDAB',
          300:     '#59B381',
          400:     '#2E9A5C',
          500:     '#1A6B3C',    // PRIMARY
          600:     '#15572F',
          700:     '#104222',
          800:     '#0A2D16',
          900:     '#05180B',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT:    '#C97A2F',
          foreground: '#FFFFFF',
        },
        // ─── shadcn/ui tokens mapeados para brand ─
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // ─── Canais de comunicação ─────────────────
        whatsapp: {
          DEFAULT:    '#25D366',
          dark:       '#064E18',   // WCAG AA para texto (11.2:1)
        },
        instagram: {
          DEFAULT: '#E1306C',
        },
        webchat: {
          DEFAULT: '#3B82F6',
        },
      },
      borderRadius: {
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
```

---

### `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ─── Techmalhas Brand Verde ───────────────── */
    --background:   0 0% 100%;
    --foreground:   152 60% 10%;     /* verde muito escuro */

    --card:         0 0% 100%;
    --card-foreground: 152 60% 10%;

    --popover:      0 0% 100%;
    --popover-foreground: 152 60% 10%;

    /* Primary = Azul CTA (#1D4ED8) — separado do brand verde */
    --primary:      221 83% 53%;
    --primary-foreground: 0 0% 100%;

    /* Secondary = verde claro */
    --secondary:    152 44% 93%;
    --secondary-foreground: 152 60% 15%;

    --muted:        152 10% 95%;
    --muted-foreground: 152 10% 45%;

    --accent:       30 63% 49%;      /* Caramelo #C97A2F */
    --accent-foreground: 0 0% 100%;

    --destructive:  0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --border:       152 15% 88%;
    --input:        152 15% 88%;
    --ring:         152 60% 30%;     /* brand verde para focus rings */

    --radius: 0.5rem;
  }

  .dark {
    --background:   152 30% 6%;
    --foreground:   152 5% 95%;
    --card:         152 25% 9%;
    --card-foreground: 152 5% 95%;
    --popover:      152 25% 9%;
    --popover-foreground: 152 5% 95%;
    --primary:      221 83% 65%;
    --primary-foreground: 0 0% 100%;
    --secondary:    152 20% 15%;
    --secondary-foreground: 152 5% 80%;
    --muted:        152 15% 15%;
    --muted-foreground: 152 10% 60%;
    --accent:       30 55% 55%;
    --accent-foreground: 0 0% 100%;
    --destructive:  0 70% 50%;
    --destructive-foreground: 0 0% 100%;
    --border:       152 15% 20%;
    --input:        152 15% 20%;
    --ring:         152 40% 50%;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  /* Scrollbar fina (Kanban) */
  .kanban-scroll::-webkit-scrollbar { height: 6px; }
  .kanban-scroll::-webkit-scrollbar-track { @apply bg-transparent; }
  .kanban-scroll::-webkit-scrollbar-thumb { @apply bg-border rounded-full; }
}
```

---

### `components.json` (shadcn/ui)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils":      "@/lib/utils",
    "ui":         "@/components/ui",
    "lib":        "@/lib",
    "hooks":      "@/lib/hooks"
  }
}
```

---

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target":                  "ES2022",
    "lib":                     ["dom", "dom.iterable", "esnext"],
    "allowJs":                 false,
    "skipLibCheck":            true,
    "strict":                  true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride":      true,
    "forceConsistentCasingInFileNames": true,
    "noEmit":                  true,
    "esModuleInterop":         true,
    "module":                  "esnext",
    "moduleResolution":        "bundler",
    "resolveJsonModule":       true,
    "isolatedModules":         true,
    "jsx":                     "preserve",
    "incremental":             true,
    "plugins":                 [{ "name": "next" }],
    "paths":                   { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Lib Helpers

### `lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge de classes Tailwind (elimina conflitos) */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Formatar moeda BRL */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style:    'currency',
    currency: 'BRL',
  }).format(value)
}

/** Formatar data relativa (ex: "há 2 dias") */
export function formatRelative(date: Date | string): string {
  const d     = typeof date === 'string' ? new Date(date) : date
  const diff  = Date.now() - d.getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins  < 1)  return 'agora mesmo'
  if (mins  < 60) return `há ${mins} min`
  if (hours < 24) return `há ${hours}h`
  if (days  < 7)  return `há ${days} dias`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d)
}

/** Formatar data pt-BR */
export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', opts ?? { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

/** Iniciais do nome (para Avatar) */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

/** Truncar texto */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '…'
}
```

---

### `lib/auth-client.ts`

```typescript
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
```

---

### `lib/api-client.ts`

```typescript
/**
 * lib/api-client.ts — Fetcher tipado para React Query
 */

interface ApiError extends Error {
  code:    string
  status:  number
  details?: unknown
}

class ApiClient {
  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res  = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })

    // 204 No Content
    if (res.status === 204) return undefined as T

    const json = await res.json() as { data?: T; error?: { code: string; message: string; details?: unknown } }

    if (!res.ok) {
      const err = new Error(json.error?.message ?? 'Erro desconhecido') as ApiError
      err.code    = json.error?.code ?? 'UNKNOWN'
      err.status  = res.status
      err.details = json.error?.details
      throw err
    }

    return json.data as T
  }

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = new URL(path, window.location.origin)
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v))
      }
    }
    return this.request<T>(url.pathname + url.search)
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) })
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' })
  }
}

export const api = new ApiClient()

// ─── Query Keys centralizados ─────────────────────────────
export const queryKeys = {
  contacts:      (params?: Record<string, unknown>) => ['contacts', params] as const,
  contact:       (id: string) => ['contacts', id] as const,
  deals:         (params?: Record<string, unknown>) => ['deals', params] as const,
  deal:          (id: string) => ['deals', id] as const,
  pipeline:      (type: string) => ['pipeline', type] as const,
  activities:    (params?: Record<string, unknown>) => ['activities', params] as const,
  interactions:  (contactId: string) => ['interactions', contactId] as const,
  notifications: () => ['notifications'] as const,
  kpis:          (params?: Record<string, unknown>) => ['kpis', params] as const,
  webchatSessions: () => ['webchat-sessions'] as const,
}
```

---

### `lib/hooks/useCurrentUser.ts`

```typescript
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
```

---

### `lib/hooks/useRealtimeChat.ts`

```typescript
'use client'
import { useEffect, useRef, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/auth-client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface ChatMessage {
  id:           string
  sessionId:    string
  content:      string
  isFromVisitor: boolean
  visitorName?: string | null
  userId?:      string | null
  createdAt:    string
  readAt?:      string | null
}

export function useRealtimeChat(sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connected, setConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const supabase = getSupabaseBrowserClient()

    // Carregar histórico inicial
    supabase
      .from('webchat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as ChatMessage[])
      })

    // Subscribir a novas mensagens via Postgres Changes
    const channel = supabase
      .channel(`webchat:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'webchat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage])
        },
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  const sendMessage = async (content: string, isFromVisitor: boolean) => {
    if (!sessionId) return
    await fetch('/api/v1/webchat/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ sessionId, content, isFromVisitor }),
    })
  }

  return { messages, connected, sendMessage }
}
```

---

## Providers

### `components/providers/QueryProvider.tsx`

```tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime:            60 * 1000,    // 1 minuto
          retry:                1,
          refetchOnWindowFocus: false,
        },
      },
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
```

---

## Layouts

### `app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/components/providers/QueryProvider'
import './globals.css'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       'CRM Techmalhas',
  description: 'Sistema de gestão de relacionamento — Techmalhas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <QueryProvider>
          {children}
          <Toaster
            richColors
            position="top-right"
            toastOptions={{ duration: 4000 }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}
```

---

### `app/(dashboard)/layout.tsx`

```tsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## Páginas

### `app/auth/callback/route.ts`

```typescript
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
          get:    (n) => cookieStore.get(n)?.value,
          set:    (n, v, o) => cookieStore.set(n, v, o),
          remove: (n, o) => cookieStore.delete({ name: n, ...o }),
        },
      },
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(next, req.url))
}
```

---

### `app/(auth)/login/page.tsx`

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signInWithEmail, signInWithGoogle } from '@/lib/auth-client'
import { toast } from 'sonner'

export default function LoginPage() {
  const router   = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await signInWithEmail(email, password)
      if (error) throw error
      router.push('/pipeline')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
      // Redirect é feito pelo OAuth callback
    } catch (err) {
      toast.error('Erro ao conectar com Google')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1 text-center">
          {/* Logo */}
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          <CardTitle className="text-2xl font-bold text-brand-500">CRM Techmalhas</CardTitle>
          <CardDescription>Entre com sua conta para continuar</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@techmalhas.com.br"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-2">ou continue com</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### `app/(dashboard)/pipeline/page.tsx`

```tsx
import { prisma }         from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { redirect }       from 'next/navigation'
import { KanbanBoard }    from '@/components/kanban/KanbanBoard'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function PipelinePage({ searchParams }: Props) {
  const user   = await getCurrentUser()
  if (!user) redirect('/login')

  const { type } = await searchParams
  const pipelineType = (type === 'varejo' ? 'varejo' : 'atacado') as 'atacado' | 'varejo'

  // Verificar acesso ao pipeline
  if (user.role === 'vendedor_atacado' && pipelineType === 'varejo') redirect('/pipeline?type=atacado')
  if (user.role === 'atendente_varejo' && pipelineType === 'atacado') redirect('/pipeline?type=varejo')

  const pipeline = await prisma.pipeline.findFirst({
    where:   { type: pipelineType },
    include: {
      stages: {
        orderBy: { position: 'asc' },
        include: {
          deals: {
            where: {
              deletedAt: null,
              status:    'open',
              ...(['vendedor_atacado', 'atendente_varejo'].includes(user.role)
                ? { assignedTo: user.id }
                : {}),
            },
            include: {
              contact:    { select: { id: true, fullName: true, companyName: true, avatarUrl: true } },
              owner:      { select: { id: true, fullName: true } },
              activities: { where: { isMandatory: true, isDone: false, deletedAt: null } },
            },
            orderBy: { updatedAt: 'desc' },
          },
        },
      },
    },
  })

  if (!pipeline) return <div className="p-8 text-muted-foreground">Pipeline não configurado.</div>

  const showTabs = ['admin', 'gestor'].includes(user.role)

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{pipeline.name}</h1>
          <p className="text-sm text-muted-foreground">
            {pipeline.stages.reduce((sum, s) => sum + s.deals.length, 0)} oportunidades abertas
          </p>
        </div>
        {showTabs && (
          <Tabs value={pipelineType}>
            <TabsList>
              <TabsTrigger value="atacado" asChild>
                <Link href="/pipeline?type=atacado">🏭 Atacado</Link>
              </TabsTrigger>
              <TabsTrigger value="varejo" asChild>
                <Link href="/pipeline?type=varejo">🛍️ Varejo</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      <KanbanBoard pipeline={pipeline} currentUser={{ id: user.id, role: user.role }} />
    </div>
  )
}
```

---

### `app/(dashboard)/leads/page.tsx`

```tsx
import { prisma }         from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { redirect }       from 'next/navigation'
import { contactsWhereClause } from '@/lib/permissions'
import { LeadCard }       from '@/components/leads/LeadCard'
import { Button }         from '@/components/ui/button'
import { Input }          from '@/components/ui/input'
import Link               from 'next/link'
import { UserPlus }       from 'lucide-react'

interface Props {
  searchParams: Promise<{ search?: string; page?: string; pipeline?: string }>
}

export default async function LeadsPage({ searchParams }: Props) {
  const user   = await getCurrentUser()
  if (!user) redirect('/login')

  const { search, page: pageStr, pipeline } = await searchParams
  const page  = Math.max(1, Number(pageStr ?? 1))
  const limit = 20

  const baseWhere = contactsWhereClause(user)
  const where = {
    ...baseWhere,
    ...(pipeline && { pipelineType: pipeline as 'atacado' | 'varejo' }),
    ...(search && {
      OR: [
        { fullName:    { contains: search, mode: 'insensitive' as const } },
        { email:       { contains: search, mode: 'insensitive' as const } },
        { companyName: { contains: search, mode: 'insensitive' as const } },
        { phone:       { contains: search } },
      ],
    }),
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        leadSource: true,
        owner:      { select: { id: true, fullName: true } },
        deals:      { where: { deletedAt: null, status: 'open' }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take:    limit,
      skip:    (page - 1) * limit,
    }),
    prisma.contact.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads & Contatos</h1>
          <p className="text-sm text-muted-foreground">{total} contatos encontrados</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/leads/new">
            <UserPlus className="h-4 w-4" />
            Novo Contato
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <form className="flex gap-3">
        <Input
          name="search"
          placeholder="Buscar por nome, e-mail, empresa…"
          defaultValue={search}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">Buscar</Button>
      </form>

      {/* Lista */}
      <div className="grid gap-3">
        {contacts.length === 0 ? (
          <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
            Nenhum contato encontrado.
          </div>
        ) : (
          contacts.map(contact => (
            <LeadCard key={contact.id} contact={contact} />
          ))
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/leads?page=${page - 1}${search ? `&search=${search}` : ''}`}>Anterior</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/leads?page=${page + 1}${search ? `&search=${search}` : ''}`}>Próxima</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
```

---

### `app/(dashboard)/dashboard/page.tsx`

```tsx
import { getCurrentUser } from '@/lib/auth'
import { redirect }       from 'next/navigation'
import { prisma }         from '@/lib/db'
import { KPICard }        from '@/components/dashboard/KPICard'
import { OverduePanel }   from '@/components/dashboard/OverduePanel'
import { FunnelChart }    from '@/components/dashboard/FunnelChart'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const now      = new Date()
  const start30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const targetFilter = ['admin', 'gestor'].includes(user.role)
    ? {}
    : { assignedTo: user.id }

  const [wonDeals, totalDeals, newLeads, activitiesOverdue, pipelineStages] = await Promise.all([
    prisma.deal.findMany({
      where:  { ...targetFilter, status: 'won', closedAt: { gte: start30d } },
      select: { value: true },
    }),
    prisma.deal.count({ where: { ...targetFilter, status: 'open', deletedAt: null } }),
    prisma.contact.count({ where: { ...targetFilter, createdAt: { gte: start30d }, deletedAt: null } }),
    prisma.activity.count({
      where: { assignedTo: user.id, isDone: false, dueDate: { lt: now }, deletedAt: null },
    }),
    // Funil: contagem por stage no pipeline do usuário
    prisma.stage.findMany({
      where:   {
        pipeline: {
          type: user.role === 'atendente_varejo' ? 'varejo' : 'atacado',
        },
      },
      include: {
        _count: {
          select: { deals: { where: { ...targetFilter, status: 'open', deletedAt: null } } },
        },
      },
      orderBy: { position: 'asc' },
    }),
  ])

  const totalRevenue    = wonDeals.reduce((sum, d) => sum + Number(d.value ?? 0), 0)
  const conversionRate  = totalDeals > 0 ? (wonDeals.length / (totalDeals + wonDeals.length)) * 100 : 0

  const overdueActivities = await prisma.activity.findMany({
    where:   { assignedTo: user.id, isDone: false, dueDate: { lt: now }, deletedAt: null },
    include: { deal: { select: { id: true, title: true } }, contact: { select: { id: true, fullName: true } } },
    orderBy: { dueDate: 'asc' },
    take:    10,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Receita (30d)"
          value={formatCurrency(totalRevenue)}
          icon="💰"
          trend={wonDeals.length > 0 ? 'up' : 'neutral'}
        />
        <KPICard
          title="Deals Abertos"
          value={totalDeals.toString()}
          icon="📋"
        />
        <KPICard
          title="Novos Leads (30d)"
          value={newLeads.toString()}
          icon="👤"
          trend="up"
        />
        <KPICard
          title="Taxa de Conversão"
          value={`${conversionRate.toFixed(1)}%`}
          icon="🎯"
          trend={conversionRate >= 30 ? 'up' : 'down'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funil */}
        <FunnelChart stages={pipelineStages.map(s => ({
          name:  s.name,
          color: s.color,
          count: s._count.deals,
        }))} />

        {/* Atividades atrasadas */}
        <OverduePanel
          activities={overdueActivities.map(a => ({
            id:          a.id,
            title:       a.title,
            type:        a.type,
            dueDate:     a.dueDate?.toISOString() ?? '',
            isMandatory: a.isMandatory,
            dealTitle:   a.deal?.title ?? null,
            contactName: a.contact?.fullName ?? null,
          }))}
          total={activitiesOverdue}
        />
      </div>
    </div>
  )
}
```

---

## Componentes

### `components/layout/Sidebar.tsx`

```tsx
'use client'
import Link       from 'next/link'
import { usePathname } from 'next/navigation'
import { cn }     from '@/lib/utils'
import { UserMenu } from './UserMenu'
import type { User } from '@prisma/client'
import {
  LayoutDashboard, KanbanSquare, Users, MessageSquare,
  CheckSquare, Settings, ChevronRight,
} from 'lucide-react'

interface NavItem {
  href:     string
  label:    string
  icon:     React.ReactNode
  roles?:   string[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',  label: 'Dashboard',  icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/pipeline',   label: 'Pipeline',   icon: <KanbanSquare    className="h-5 w-5" /> },
  { href: '/leads',      label: 'Leads',      icon: <Users           className="h-5 w-5" /> },
  { href: '/chat',       label: 'Chat',        icon: <MessageSquare   className="h-5 w-5" /> },
  { href: '/tasks',      label: 'Tarefas',    icon: <CheckSquare     className="h-5 w-5" /> },
  { href: '/settings/pipelines', label: 'Configurações', icon: <Settings className="h-5 w-5" />, roles: ['admin', 'gestor'] },
]

interface Props { user: User }

export function Sidebar({ user }: Props) {
  const pathname = usePathname()

  const items = NAV_ITEMS.filter(item =>
    !item.roles || item.roles.includes(user.role)
  )

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
          <span className="text-sm font-bold text-white">T</span>
        </div>
        <span className="font-semibold text-brand-500">Techmalhas CRM</span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {item.icon}
              {item.label}
              {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User Menu */}
      <div className="border-t p-3">
        <UserMenu user={user} />
      </div>
    </aside>
  )
}
```

---

### `components/layout/UserMenu.tsx`

```tsx
'use client'
import { useRouter }    from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu' // gerado via shadcn add dropdown-menu
import { getInitials } from '@/lib/utils'
import { signOut }      from '@/lib/auth-client'
import type { User }    from '@prisma/client'
import { LogOut, User as UserIcon } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  admin:            'Administrador',
  gestor:           'Gestor',
  vendedor_atacado: 'Vendedor Atacado',
  atendente_varejo: 'Atendente Varejo',
}

export function UserMenu({ user }: { user: User }) {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
            <AvatarFallback className="bg-brand-200 text-brand-700 text-xs">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{ROLE_LABELS[user.role] ?? user.role}</p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{user.fullName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="mr-2 h-4 w-4" />
          Meu Perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

### `components/kanban/KanbanBoard.tsx`

```tsx
'use client'
import { useState, useCallback } from 'react'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast }         from 'sonner'
import { api, queryKeys } from '@/lib/api-client'
import { KanbanColumn }  from './KanbanColumn'
import { KanbanCard }    from './KanbanCard'
import { ObligatoryTaskBlocker } from './ObligatoryTaskBlocker'

// Tipos mínimos (Prisma types podem ser importados do @prisma/client)
interface ContactMin { id: string; fullName: string; companyName?: string | null; avatarUrl?: string | null }
interface ActivityMin { id: string; title: string; dueDate?: string | null }
interface DealWithRelations {
  id:         string
  title:      string
  value?:     number | null
  stageId:    string
  contact:    ContactMin
  owner?:     { id: string; fullName: string } | null
  activities: ActivityMin[]  // mandatory + not done
}
interface StageWithDeals {
  id:          string
  name:        string
  color:       string
  probability: number
  isWonStage:  boolean
  isLostStage: boolean
  deals:       DealWithRelations[]
}
interface PipelineData {
  id:     string
  name:   string
  type:   string
  stages: StageWithDeals[]
}

interface BlockerState {
  dealId:   string
  stageId:  string
  tasks:    Array<{ id: string; title: string; dueDate?: string | null }>
}

interface Props {
  pipeline:    PipelineData
  currentUser: { id: string; role: string }
}

export function KanbanBoard({ pipeline, currentUser }: Props) {
  const [stages,  setStages]  = useState<StageWithDeals[]>(pipeline.stages)
  const [dragging, setDragging] = useState<DealWithRelations | null>(null)
  const [blocker,  setBlocker]  = useState<BlockerState | null>(null)

  const queryClient = useQueryClient()
  const sensors     = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const moveMutation = useMutation({
    mutationFn: ({ dealId, stageId }: { dealId: string; stageId: string }) =>
      api.patch(`/api/v1/deals/${dealId}/stage`, { stageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pipeline(pipeline.type) })
      toast.success('Deal movido com sucesso')
    },
    onError: (err: { code?: string; status?: number; details?: { pendingMandatoryTasks?: Array<{ id: string; title: string; dueDate?: string | null }> } }, vars) => {
      if (err.status === 409 && err.details?.pendingMandatoryTasks) {
        // Hard block: mostrar dialog de tarefas obrigatórias
        setBlocker({
          dealId:  vars.dealId,
          stageId: vars.stageId,
          tasks:   err.details.pendingMandatoryTasks,
        })
      } else {
        toast.error('Erro ao mover deal')
      }
      // Reverter otimismo
      setStages(pipeline.stages)
    },
  })

  const applyOptimisticMove = useCallback((dealId: string, toStageId: string) => {
    setStages(prev => {
      const deal = prev.flatMap(s => s.deals).find(d => d.id === dealId)
      if (!deal) return prev
      return prev.map(s => {
        if (s.id === deal.stageId) return { ...s, deals: s.deals.filter(d => d.id !== dealId) }
        if (s.id === toStageId)   return { ...s, deals: [...s.deals, { ...deal, stageId: toStageId }] }
        return s
      })
    })
  }, [])

  function handleDragStart(event: DragStartEvent) {
    const deal = stages.flatMap(s => s.deals).find(d => d.id === event.active.id)
    if (deal) setDragging(deal)
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const dealId   = String(active.id)
    const toStageId = String(over.id)
    const currentStageId = stages.flatMap(s => s.deals).find(d => d.id === dealId)?.stageId
    if (currentStageId === toStageId) return

    applyOptimisticMove(dealId, toStageId)
    moveMutation.mutate({ dealId, stageId: toStageId })
  }

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="kanban-scroll flex h-full gap-4 overflow-x-auto pb-4">
          {stages.map(stage => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              currentUserId={currentUser.id}
            />
          ))}
        </div>

        <DragOverlay>
          {dragging && (
            <KanbanCard
              deal={dragging}
              isDragging
              currentUserId={currentUser.id}
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Hard Block Dialog */}
      {blocker && (
        <ObligatoryTaskBlocker
          tasks={blocker.tasks}
          onClose={() => setBlocker(null)}
        />
      )}
    </>
  )
}
```

---

### `components/kanban/KanbanColumn.tsx`

```tsx
'use client'
import { useDroppable }  from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn }            from '@/lib/utils'
import { KanbanCard }    from './KanbanCard'
import { Badge }         from '@/components/ui/badge'

interface Deal {
  id:         string
  title:      string
  value?:     number | null
  stageId:    string
  contact:    { id: string; fullName: string; companyName?: string | null; avatarUrl?: string | null }
  owner?:     { id: string; fullName: string } | null
  activities: Array<{ id: string; title: string; dueDate?: string | null }>
}
interface Stage {
  id:          string
  name:        string
  color:       string
  probability: number
  isWonStage:  boolean
  isLostStage: boolean
  deals:       Deal[]
}

interface Props {
  stage:         Stage
  currentUserId: string
}

export function KanbanColumn({ stage, currentUserId }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })
  const dealIds = stage.deals.map(d => d.id)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-xl border bg-muted/40 transition-colors',
        isOver && 'bg-secondary border-brand-300',
      )}
    >
      {/* Header da coluna */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: stage.color }}
            aria-hidden
          />
          <span className="text-sm font-medium">{stage.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{stage.probability}%</span>
          <Badge variant="secondary" className="text-xs tabular-nums">
            {stage.deals.length}
          </Badge>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {stage.deals.map(deal => (
            <KanbanCard
              key={deal.id}
              deal={deal}
              currentUserId={currentUserId}
            />
          ))}
          {stage.deals.length === 0 && (
            <div className="flex h-16 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
              Arraste um card aqui
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
```

---

### `components/kanban/KanbanCard.tsx`

```tsx
'use client'
import { useSortable }  from '@dnd-kit/sortable'
import { CSS }          from '@dnd-kit/utilities'
import Link             from 'next/link'
import { cn, formatCurrency } from '@/lib/utils'
import { Badge }        from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials }  from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

interface Deal {
  id:         string
  title:      string
  value?:     number | null
  stageId:    string
  contact:    { id: string; fullName: string; companyName?: string | null; avatarUrl?: string | null }
  owner?:     { id: string; fullName: string } | null
  activities: Array<{ id: string; title: string; dueDate?: string | null }>
}

interface Props {
  deal:          Deal
  currentUserId: string
  isDragging?:   boolean
}

export function KanbanCard({ deal, isDragging = false }: Props) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: isBeingDragged,
  } = useSortable({ id: deal.id })

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isBeingDragged ? 0.3 : 1,
  }

  const hasMandatoryPending = deal.activities.length > 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group cursor-grab rounded-lg border bg-card p-3 shadow-sm',
        'active:cursor-grabbing hover:shadow-md transition-shadow',
        isDragging && 'shadow-xl ring-2 ring-brand-500 rotate-2',
        hasMandatoryPending && 'border-amber-400',
      )}
    >
      {/* Alerta tarefas obrigatórias */}
      {hasMandatoryPending && (
        <div className="mb-2 flex items-center gap-1.5 text-amber-600">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">
            {deal.activities.length} tarefa{deal.activities.length > 1 ? 's' : ''} obrigatória{deal.activities.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Título do deal */}
      <Link
        href={`/leads/${deal.contact.id}`}
        className="line-clamp-2 text-sm font-medium hover:text-brand-500"
        onClick={e => e.stopPropagation()}
      >
        {deal.title}
      </Link>

      {/* Empresa */}
      {deal.contact.companyName && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{deal.contact.companyName}</p>
      )}

      {/* Footer: valor + avatar */}
      <div className="mt-3 flex items-center justify-between">
        {deal.value != null ? (
          <span className="text-sm font-semibold text-brand-500">
            {formatCurrency(deal.value)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Sem valor</span>
        )}

        {deal.owner && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={undefined} />
            <AvatarFallback className="bg-brand-100 text-brand-700 text-[10px]">
              {getInitials(deal.owner.fullName)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}
```

---

### `components/kanban/ObligatoryTaskBlocker.tsx`

```tsx
'use client'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog' // shadcn add alert-dialog
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatRelative } from '@/lib/utils'

interface Task {
  id:      string
  title:   string
  dueDate?: string | null
}

interface Props {
  tasks:   Task[]
  onClose: () => void
}

export function ObligatoryTaskBlocker({ tasks, onClose }: Props) {
  return (
    <AlertDialog defaultOpen onOpenChange={(open) => { if (!open) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Tarefas Obrigatórias Pendentes</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Conclua as tarefas abaixo antes de mover este deal para a próxima etapa.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="my-2 space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-start gap-2 rounded-lg border bg-amber-50 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium">{task.title}</p>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    Vence {formatRelative(task.dueDate)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Entendido</AlertDialogCancel>
          <AlertDialogAction
            className="bg-brand-500 hover:bg-brand-600"
            onClick={onClose}
          >
            Ver Tarefas
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

---

### `components/chat/ChatThread.tsx`

```tsx
'use client'
import { useRef, useEffect, useState } from 'react'
import { useRealtimeChat }  from '@/lib/hooks/useRealtimeChat'
import { MessageBubble }    from './MessageBubble'
import { ChannelBadge }     from './ChannelBadge'
import { Input }            from '@/components/ui/input'
import { Button }           from '@/components/ui/button'
import { Send, Wifi, WifiOff } from 'lucide-react'
import { cn }               from '@/lib/utils'

interface Props {
  sessionId:    string
  visitorName?: string | null
  channel:      'whatsapp' | 'instagram' | 'webchat'
  isOperator:   boolean
}

export function ChatThread({ sessionId, visitorName, channel, isOperator }: Props) {
  const { messages, connected, sendMessage } = useRealtimeChat(sessionId)
  const [text,      setText]     = useState('')
  const [sending,   setSending]  = useState(false)
  const bottomRef                = useRef<HTMLDivElement>(null)

  // Auto-scroll ao receber mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await sendMessage(text.trim(), !isOperator)
      setText('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ChannelBadge channel={channel} />
          <span className="font-medium">{visitorName ?? 'Visitante'}</span>
        </div>
        <div className={cn('flex items-center gap-1 text-xs', connected ? 'text-green-600' : 'text-muted-foreground')}>
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {connected ? 'Conectado' : 'Reconectando…'}
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
        )}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            isOwn={isOperator ? !msg.isFromVisitor : msg.isFromVisitor}
            senderName={msg.isFromVisitor ? (visitorName ?? 'Visitante') : 'Operador'}
            createdAt={msg.createdAt}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t px-4 py-3"
      >
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Digite uma mensagem…"
          disabled={sending || !connected}
          className="flex-1"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
        />
        <Button
          type="submit"
          size="icon"
          className="bg-brand-500 hover:bg-brand-600"
          disabled={sending || !text.trim() || !connected}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  )
}
```

---

### `components/chat/MessageBubble.tsx`

```tsx
import { cn, formatRelative } from '@/lib/utils'

interface Props {
  content:     string
  isOwn:       boolean
  senderName?: string
  createdAt:   string
}

export function MessageBubble({ content, isOwn, senderName, createdAt }: Props) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[75%] space-y-0.5', isOwn ? 'items-end' : 'items-start')}>
        {senderName && !isOwn && (
          <p className="px-1 text-xs text-muted-foreground">{senderName}</p>
        )}
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2 text-sm',
            isOwn
              ? 'rounded-br-sm bg-brand-500 text-white'
              : 'rounded-bl-sm bg-secondary text-foreground',
          )}
        >
          {content}
        </div>
        <p className={cn('px-1 text-[10px] text-muted-foreground', isOwn && 'text-right')}>
          {formatRelative(createdAt)}
        </p>
      </div>
    </div>
  )
}
```

---

### `components/chat/ChannelBadge.tsx`

```tsx
import { Badge } from '@/components/ui/badge'
import { cn }    from '@/lib/utils'

const CONFIG = {
  whatsapp:  { label: 'WhatsApp', bg: 'bg-[#25D366]', text: 'text-white' },
  instagram: { label: 'Instagram', bg: 'bg-[#E1306C]', text: 'text-white' },
  webchat:   { label: 'Chat Site', bg: 'bg-blue-500',  text: 'text-white' },
} as const

type Channel = keyof typeof CONFIG

export function ChannelBadge({ channel }: { channel: Channel }) {
  const c = CONFIG[channel]
  return (
    <Badge className={cn('text-[10px] font-semibold uppercase tracking-wide', c.bg, c.text, 'hover:opacity-90')}>
      {c.label}
    </Badge>
  )
}
```

---

### `components/leads/LeadCard.tsx`

```tsx
import Link  from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getInitials, formatRelative } from '@/lib/utils'
import { Building2, Phone, Mail } from 'lucide-react'

interface Contact {
  id:           string
  fullName:     string
  email?:       string | null
  phone?:       string | null
  companyName?: string | null
  isB2b:        boolean
  pipelineType?: string | null
  createdAt:    Date
  leadSource?:  { name: string } | null
  owner?:       { fullName: string } | null
  deals:        Array<{ id: string }>
}

export function LeadCard({ contact }: { contact: Contact }) {
  return (
    <Link
      href={`/leads/${contact.id}`}
      className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/50"
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-brand-100 text-brand-700 text-sm font-semibold">
          {getInitials(contact.fullName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{contact.fullName}</span>
          <Badge variant={contact.isB2b ? 'default' : 'secondary'} className="shrink-0 text-[10px]">
            {contact.isB2b ? 'B2B' : 'B2C'}
          </Badge>
          {contact.deals.length > 0 && (
            <Badge variant="outline" className="shrink-0 text-[10px] text-brand-600 border-brand-300">
              {contact.deals.length} deal{contact.deals.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {contact.companyName && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />{contact.companyName}
            </span>
          )}
          {contact.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />{contact.phone}
            </span>
          )}
          {contact.email && (
            <span className="flex items-center gap-1 truncate max-w-[180px]">
              <Mail className="h-3 w-3" />{contact.email}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs text-muted-foreground">{formatRelative(contact.createdAt)}</p>
        {contact.leadSource && (
          <p className="mt-0.5 text-xs text-muted-foreground">{contact.leadSource.name}</p>
        )}
      </div>
    </Link>
  )
}
```

---

### `components/dashboard/KPICard.tsx`

```tsx
import { Card, CardContent } from '@/components/ui/card'
import { cn }                from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  title:  string
  value:  string
  icon:   string
  trend?: 'up' | 'down' | 'neutral'
}

const trendConfig = {
  up:      { icon: TrendingUp,   color: 'text-green-600',   bg: 'bg-green-50'   },
  down:    { icon: TrendingDown, color: 'text-red-600',     bg: 'bg-red-50'     },
  neutral: { icon: Minus,        color: 'text-muted-foreground', bg: 'bg-muted' },
}

export function KPICard({ title, value, icon, trend }: Props) {
  const cfg = trend ? trendConfig[trend] : null
  const TrendIcon = cfg?.icon

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-2xl" role="img" aria-hidden>{icon}</span>
            {TrendIcon && (
              <div className={cn('flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium', cfg.bg, cfg.color)}>
                <TrendIcon className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

### `components/dashboard/FunnelChart.tsx`

```tsx
interface Stage { name: string; color: string; count: number }

export function FunnelChart({ stages }: { stages: Stage[] }) {
  const maxCount = Math.max(...stages.map(s => s.count), 1)

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="mb-4 text-base font-semibold">Funil de Vendas</h2>
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const width = (stage.count / maxCount) * 100
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="w-28 truncate text-sm text-muted-foreground text-right pr-2">
                {stage.name}
              </span>
              <div className="flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-6 rounded-full transition-all duration-500"
                  style={{ width: `${width}%`, backgroundColor: stage.color }}
                />
              </div>
              <span className="w-8 text-sm font-semibold tabular-nums text-right">
                {stage.count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

### `components/dashboard/OverduePanel.tsx`

```tsx
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock } from 'lucide-react'
import { formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Activity {
  id:          string
  title:       string
  type:        string
  dueDate:     string
  isMandatory: boolean
  dealTitle?:  string | null
  contactName?: string | null
}

interface Props {
  activities: Activity[]
  total:      number
}

export function OverduePanel({ activities, total }: Props) {
  if (total === 0) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-base font-semibold">Atividades Atrasadas</h2>
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <span className="text-3xl">✅</span>
          <p className="text-sm">Nenhuma atividade atrasada!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Atividades Atrasadas</h2>
        <Badge variant="destructive" className="tabular-nums">{total}</Badge>
      </div>

      <div className="space-y-2">
        {activities.map(activity => (
          <Link
            key={activity.id}
            href="/tasks"
            className="flex items-start gap-3 rounded-lg border bg-red-50 p-3 transition-colors hover:bg-red-100"
          >
            <AlertCircle className={cn('mt-0.5 h-4 w-4 shrink-0', activity.isMandatory ? 'text-red-600' : 'text-amber-500')} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium line-clamp-1">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {activity.dealTitle ?? activity.contactName}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-xs text-red-600">
              <Clock className="h-3 w-3" />
              {formatRelative(activity.dueDate)}
            </div>
          </Link>
        ))}
      </div>

      {total > activities.length && (
        <Link href="/tasks" className="mt-3 block text-center text-xs text-brand-500 hover:underline">
          Ver todas ({total - activities.length} a mais)
        </Link>
      )}
    </div>
  )
}
```

---

## Comandos

```bash
# ─── Setup inicial ───────────────────────────────────────────
pnpm create next-app@latest crm-techmalhas \
  --typescript --tailwind --eslint --app \
  --src-dir=false --import-alias='@/*'

cd crm-techmalhas

# ─── Instalar dependências ───────────────────────────────────
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add @tanstack/react-query @tanstack/react-query-devtools
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
pnpm add sonner
pnpm add clsx tailwind-merge
pnpm add lucide-react
pnpm add tailwindcss-animate
pnpm add class-variance-authority

# ─── shadcn/ui (primitivos) ──────────────────────────────────
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card dialog drawer form input
pnpm dlx shadcn@latest add label select sheet badge avatar tabs
pnpm dlx shadcn@latest add textarea tooltip separator alert skeleton
pnpm dlx shadcn@latest add dropdown-menu alert-dialog

# ─── Desenvolvimento ─────────────────────────────────────────
pnpm dev          # http://localhost:3000

# ─── Build de produção ───────────────────────────────────────
pnpm build
pnpm start

# ─── Qualidade de código ─────────────────────────────────────
pnpm lint
pnpm type-check   # adicionar no package.json: "type-check": "tsc --noEmit"

# ─── Login de teste ──────────────────────────────────────────
# 1. Crie os usuários no Supabase Dashboard > Authentication > Users
#    Email: admin@techmalhas.com.br / senha: (qualquer)
# 2. Acesse http://localhost:3000/login
# 3. O trigger 003 sincronizará automaticamente o usuário para public.users
# 4. Via Prisma Studio (pnpm prisma studio), ajuste o role para 'admin'
#    na tabela users
```

---

## Notas Técnicas

### 1. Server vs Client Components
- **Server Components** (padrão): todas as páginas (`page.tsx`), layouts, componentes de apresentação pura, acesso direto ao Prisma
- **Client Components** (`'use client'`): KanbanBoard (dnd-kit + estado), ChatThread (Supabase Realtime), UserMenu (DropdownMenu), formulários com estado

### 2. Kanban — Otimismo + Hard Block
O `KanbanBoard` aplica a mudança de stage otimisticamente antes da API responder. Se a API retornar `409` (tarefas obrigatórias pendentes), o estado é revertido e o `ObligatoryTaskBlocker` é exibido com a lista de tarefas bloqueando a ação.

### 3. Supabase Realtime no Chat
O hook `useRealtimeChat` usa `postgres_changes` para receber INSERT em `webchat_messages`. Isso funciona tanto para o operador (autenticado) quanto para o visitante (que usa o `realtimeChannel` do widget). O widget JS externo no site `techmalhas.com.br` usa o mesmo SDK `@supabase/supabase-js`.

### 4. Acesso por RBAC no lado servidor
Páginas Server Component verificam `user.role` antes da query Prisma para filtrar dados conforme RBAC. Isso evita depender apenas do RLS do Supabase no nível de página, adicionando uma camada defensiva.

### 5. Fonte Inter via `next/font`
`next/font/google` carrega a fonte Inter com `display: swap` e injeta a variável CSS `--font-inter` sem layout shift. Sem CDN externo — next.js serve a fonte dos servidores Vercel.

### 6. Design System fiel ao Step 05
`tailwind.config.ts` define `brand.500 = #1A6B3C` (verde Techmalhas), `accent = #C97A2F` (caramelo), e os tokens de canal (whatsapp `#25D366`, instagram `#E1306C`). A variável `--primary` mapeia para o azul CTA `#1D4ED8` — separado do verde para não conflitar com o brand em botões de ação.
