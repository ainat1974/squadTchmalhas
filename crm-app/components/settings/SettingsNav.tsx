'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/settings/pipelines', label: 'Pipelines' },
  { href: '/settings/users',      label: 'Usuários' },
] as const

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-sunken inline-flex rounded-lg border border-sutil p-0.5">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-brand-gold/15 text-brand-gold'
                : 'text-fg-muted hover:text-fg-primary',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
