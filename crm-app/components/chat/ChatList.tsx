'use client'

import Link from 'next/link'
import { cn, formatRelative } from '@/lib/utils'
import { ChannelBadge } from './ChannelBadge'
import { MessageSquare } from 'lucide-react'

export type ChatSessionItem = {
  id: string
  status: string
  displayName: string
  lastMessage: string | null
  lastActivityAt: string
  unreadCount: number
  channel: 'webchat' | 'whatsapp' | 'instagram'
}

interface Props {
  sessions: ChatSessionItem[]
  activeSessionId?: string | null
  filter: 'todos' | 'webchat' | 'whatsapp' | 'instagram'
  onFilterChange: (f: Props['filter']) => void
}

export function ChatList({ sessions, activeSessionId, filter, onFilterChange }: Props) {
  const filtered =
    filter === 'todos' ? sessions : sessions.filter((s) => s.channel === filter)

  const filters: Array<{ id: Props['filter']; label: string }> = [
    { id: 'todos', label: 'Todos' },
    { id: 'webchat', label: 'Webchat' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'instagram', label: 'Instagram' },
  ]

  return (
    <div className="bg-card flex h-full w-80 flex-col border-r border-sutil">
      <div className="border-b border-sutil p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-fg-primary">Conversas</h2>
          <span className="pulse-live" aria-label="Conexão ativa" />
        </div>
        <p className="text-xs text-fg-muted">Multicanal · Webchat ativo</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={cn(
                'rounded px-2 py-1 text-xs font-medium capitalize transition-all',
                filter === f.id
                  ? 'bg-brand-gold/15 text-brand-gold'
                  : 'text-fg-muted hover:bg-elevated hover:text-fg-primary',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <MessageSquare className="h-10 w-10 text-fg-muted/40" />
            <p className="text-sm font-medium text-fg-muted">Nenhuma conversa</p>
            <p className="text-xs text-fg-muted">
              {filter === 'webchat'
                ? 'Sessões do chat do site aparecem aqui quando um visitante iniciar conversa.'
                : 'Configure a API oficial da Meta para ativar este canal.'}
            </p>
          </div>
        ) : (
          filtered.map((session) => (
            <Link
              key={session.id}
              href={`/chat?session=${session.id}`}
              className={cn(
                'block border-b border-sutil px-4 py-3 transition-all hover:bg-elevated',
                activeSessionId === session.id &&
                  'border-l-2 border-l-brand-gold bg-brand-gold/8',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-fg-primary">
                      {session.displayName}
                    </span>
                    {session.unreadCount > 0 && (
                      <span className="font-kpi flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-ink">
                        {session.unreadCount}
                      </span>
                    )}
                  </div>
                  {session.lastMessage && (
                    <p className="mt-0.5 truncate text-xs text-fg-muted">{session.lastMessage}</p>
                  )}
                </div>
                <span className="font-kpi shrink-0 text-[10px] text-fg-muted">
                  {formatRelative(session.lastActivityAt)}
                </span>
              </div>
              <div className="mt-1.5">
                <ChannelBadge channel={session.channel} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
