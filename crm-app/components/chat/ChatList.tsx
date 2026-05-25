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
    filter === 'todos'
      ? sessions
      : sessions.filter((s) => s.channel === filter)

  const filters: Array<{ id: Props['filter']; label: string }> = [
    { id: 'todos', label: 'Todos' },
    { id: 'webchat', label: 'Webchat' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'instagram', label: 'Instagram' },
  ]

  return (
    <div className="flex h-full w-80 flex-col border-r bg-card">
      <div className="border-b p-4">
        <h2 className="font-semibold text-foreground">Conversas</h2>
        <p className="text-xs text-muted-foreground">Multicanal · Webchat ativo</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={cn(
                'rounded-md px-2 py-1 text-xs font-medium capitalize transition-colors',
                filter === f.id
                  ? 'bg-brand-500 text-white'
                  : 'text-muted-foreground hover:bg-secondary',
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
            <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">Nenhuma conversa</p>
            <p className="text-xs text-muted-foreground">
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
                'block border-b px-4 py-3 transition-colors hover:bg-secondary/60',
                activeSessionId === session.id && 'bg-brand-50 border-l-2 border-l-brand-500',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{session.displayName}</span>
                    {session.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                        {session.unreadCount}
                      </span>
                    )}
                  </div>
                  {session.lastMessage && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {session.lastMessage}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">
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
