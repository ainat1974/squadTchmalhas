'use client'
import { useRef, useEffect, useState } from 'react'
import { useRealtimeChat } from '@/lib/hooks/useRealtimeChat'
import { MessageBubble } from './MessageBubble'
import { ChannelBadge } from './ChannelBadge'
import { Send, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  sessionId:    string
  visitorName?: string | null
  channel:      'whatsapp' | 'instagram' | 'webchat'
  isOperator:   boolean
}

export function ChatThread({ sessionId, visitorName, channel, isOperator }: Props) {
  const { messages, connected, sendMessage } = useRealtimeChat(sessionId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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
    <div className="bg-canvas flex h-full flex-col">
      <div className="bg-card flex items-center justify-between border-b border-sutil px-4 py-3">
        <div className="flex items-center gap-2">
          <ChannelBadge channel={channel} />
          <span className="font-medium text-fg-primary">{visitorName ?? 'Visitante'}</span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-xs',
            connected ? 'text-metric-positive' : 'text-fg-muted',
          )}
        >
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {connected ? 'Conectado' : 'Reconectando…'}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-fg-muted">Nenhuma mensagem ainda.</p>
        )}
        {messages.map((msg) => (
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

      <form
        onSubmit={handleSend}
        className="bg-card flex items-center gap-2 border-t border-sutil px-4 py-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite uma mensagem…"
          disabled={sending || !connected}
          className="bg-sunken input-focus-glow h-10 flex-1 rounded-md border border-sutil px-3 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e)
            }
          }}
        />
        <button
          type="submit"
          className="btn-primary-premium flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-50"
          disabled={sending || !text.trim() || !connected}
          aria-label="Enviar mensagem"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
