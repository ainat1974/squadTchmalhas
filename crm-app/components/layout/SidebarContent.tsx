'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserMenu } from './UserMenu'
import { BrandMark } from '@/components/brand/BrandMark'
import type { User } from '@prisma/client'
import {
  LayoutDashboard, KanbanSquare, Users, MessageSquare,
  CheckSquare, Settings, ChevronRight,
} from 'lucide-react'

interface NavItem {
  href:   string
  label:  string
  icon:   React.ReactNode
  roles?: string[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',          label: 'Dashboard',     icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/pipeline',           label: 'Pipeline',      icon: <KanbanSquare    className="h-5 w-5" /> },
  { href: '/leads',              label: 'Leads',         icon: <Users           className="h-5 w-5" /> },
  { href: '/chat',               label: 'Chat',          icon: <MessageSquare   className="h-5 w-5" /> },
  { href: '/tasks',              label: 'Tarefas',       icon: <CheckSquare     className="h-5 w-5" /> },
  { href: '/settings/pipelines', label: 'Configurações', icon: <Settings        className="h-5 w-5" />, roles: ['admin', 'gestor'] },
]

interface Props {
  user:        User
  onNavigate?: () => void
}

export function SidebarContent({ user, onNavigate }: Props) {
  const pathname = usePathname()
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role))

  return (
    <div className="bg-card flex h-full w-60 flex-col border-r border-sutil">
      <div className="flex h-20 items-center justify-center border-b border-sutil px-6">
        <Link href="/dashboard" aria-label="Ir para Dashboard" onClick={onNavigate}>
          <BrandMark variant="sidebar" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-base',
                isActive
                  ? 'border border-gold-soft bg-brand-gold/10 text-brand-gold shadow-[inset_0_1px_0_hsla(0,0%,100%,0.04)]'
                  : 'border border-transparent text-fg-muted hover:border-sutil hover:bg-elevated hover:text-fg-primary',
              )}
            >
              <span
                className={cn(
                  'transition-transform duration-base group-hover:scale-[1.05]',
                  isActive && 'text-brand-gold',
                )}
              >
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <ChevronRight className="ml-auto h-4 w-4 text-brand-gold opacity-80" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sutil p-3">
        <UserMenu user={user} />
      </div>
    </div>
  )
}
