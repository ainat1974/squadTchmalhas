'use client'

import { useState } from 'react'
import { ChatList, type ChatSessionItem } from './ChatList'
import { ChatThread } from './ChatThread'
import { MessageSquare, Smartphone } from 'lucide-react'

interface Props {
  sessions: ChatSessionItem[]
  initialSessionId?: string | null
}

export function ChatInbox({ sessions, initialSessionId }: Props) {
  const [filter, setFilter] = useState<'todos' | 'webchat' | 'whatsapp' | 'instagram'>('todos')

  const activeId =
    initialSessionId && sessions.some((s) => s.id === initialSessionId)
      ? initialSessionId
      : sessions[0]?.id ?? null

  const activeSession = sessions.find((s) => s.id === activeId)

  return (
    <div className="flex h-full min-h-[480px] overflow-hidden rounded-lg border bg-card">
      <ChatList
        sessions={sessions}
        activeSessionId={activeId}
        filter={filter}
        onFilterChange={setFilter}
      />

      <div className="flex flex-1 flex-col bg-background">
        {activeSession ? (
          <ChatThread
            sessionId={activeSession.id}
            visitorName={activeSession.displayName}
            channel={activeSession.channel}
            isOperator
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
              <MessageSquare className="h-8 w-8 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Chat Multicanal</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Selecione uma conversa na lista ou aguarde novas mensagens do webchat do site.
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs text-amber-900">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <strong>WhatsApp e Instagram:</strong> serão exibidos aqui após configurar a Meta
                Cloud API no <code className="rounded bg-amber-100 px-1">.env.local</code>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
