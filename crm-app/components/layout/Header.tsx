'use client'

import { usePathname } from 'next/navigation'
import type { User } from '@prisma/client'
import { Bell } from 'lucide-react'
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
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground">
          {greeting}, {firstName}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          aria-label="Notificações"
          title="Notificações (em breve)"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
