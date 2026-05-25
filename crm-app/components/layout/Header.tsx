'use client'

import { usePathname } from 'next/navigation'
import type { User } from '@prisma/client'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pipeline': 'Pipeline',
  '/leads': 'Leads',
  '/chat': 'Chat',
  '/tasks': 'Tarefas',
  '/settings': 'Configurações',
  '/settings/pipelines': 'Configurações',
}

function getPageTitle(pathname: string): string {
  const match = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => pathname.startsWith(path))
  return match?.[1] ?? 'CRM Techmalhas'
}

interface Props {
  user: User
}

export function Header({ user }: Props) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  })()

  const firstName = user.fullName.split(' ')[0]

  return (
    <header className="filter-bar-sticky flex h-16 shrink-0 items-center justify-between px-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-fg-muted">
          {greeting}, {firstName}
        </p>
        <h1 className="text-lg font-semibold tracking-tight text-fg-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            type="search"
            placeholder="Buscar…"
            className="bg-sunken input-focus-glow h-9 w-56 rounded-md border border-sutil pl-9 pr-3 text-sm text-fg-primary placeholder:text-fg-muted"
            aria-label="Buscar no CRM"
          />
        </div>
        <span className="hidden items-center gap-1.5 text-xs text-fg-muted md:flex">
          <span className="pulse-live" aria-hidden />
          ao vivo
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-fg-muted hover:text-brand-gold"
          aria-label="Notificações"
          title="Notificações (em breve)"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
