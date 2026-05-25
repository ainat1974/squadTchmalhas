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