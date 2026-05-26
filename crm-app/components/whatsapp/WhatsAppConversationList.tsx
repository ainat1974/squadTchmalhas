'use client'

import Link from 'next/link'
import { cn, formatRelative } from '@/lib/utils'
import { MessageCircle, ShieldAlert } from 'lucide-react'

export interface WhatsAppConversationItem {
  contactId:     string
  displayName:   string
  companyName:   string | null
  whatsappPhone: string | null
  lgpdConsent:   boolean
  lastMessage:   string | null
  lastMessageAt: string | null
  unreadCount:   number
}

interface Props {
  conversations: WhatsAppConversationItem[]
  activeContactId?: string | null
}

export function WhatsAppConversationList({ conversations, activeContactId }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <MessageCircle className="h-10 w-10 text-fg-muted" />
        <p className="text-sm text-fg-muted">
          Nenhuma conversa WhatsApp ainda.
          <br />
          Configure a Meta Cloud API ou aguarde mensagens recebidas.
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-sutil overflow-y-auto">
      {conversations.map((c) => {
        const isActive = c.contactId === activeContactId
        return (
          <li key={c.contactId}>
            <Link
              href={`/whatsapp/${c.contactId}`}
              className={cn(
                'flex items-start gap-3 px-4 py-3 transition-colors',
                isActive
                  ? 'bg-brand-gold/10 border-l-2 border-brand-gold'
                  : 'hover:bg-elevated border-l-2 border-transparent',
              )}
            >
              <div className="brand-tm-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {c.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-fg-primary">
                    {c.displayName}
                  </p>
                  {c.lastMessageAt && (
                    <span className="font-kpi shrink-0 text-[10px] text-fg-muted">
                      {formatRelative(c.lastMessageAt)}
                    </span>
                  )}
                </div>
                {c.companyName && (
                  <p className="truncate text-xs text-fg-muted">{c.companyName}</p>
                )}
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="truncate text-xs text-fg-secondary">
                    {c.lastMessage ?? 'Sem mensagens'}
                  </p>
                  {!c.lgpdConsent && (
                    <ShieldAlert
                      className="h-3.5 w-3.5 shrink-0 text-metric-negative"
                      aria-label="LGPD pendente"
                    />
                  )}
                  {c.unreadCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-ink">
                      {c.unreadCount > 9 ? '9+' : c.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
