'use client'
import { useRef, useEffect, useState } from 'react'
import { useRealtimeChat }  from '@/lib/hooks/useRealtimeChat'
import { MessageBubble }    from './MessageBubble'
import { ChannelBadge }     from './ChannelBadge'
import { Input }            from '@/components/ui/input'
import { Button }           from '@/components/ui/button'
import { Send, Wifi, WifiOff } from 'lucide-react'
import { cn }               from '@/lib/utils'

interface Props {
  sessionId:    string
  visitorName?: string | null
  channel:      'whatsapp' | 'instagram' | 'webchat'
  isOperator:   boolean
}

export function ChatThread({ sessionId, visitorName, channel, isOperator }: Props) {
  const { messages, connected, sendMessage } = useRealtimeChat(sessionId)
  const [text,      setText]     = useState('')
  const [sending,   setSending]  = useState(false)
  const bottomRef                = useRef<HTMLDivElement>(null)

  // Auto-scroll ao receber mensagem
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ChannelBadge channel={channel} />
          <span className="font-medium">{visitorName ?? 'Visitante'}</span>
        </div>
        <div className={cn('flex items-center gap-1 text-xs', connected ? 'text-green-600' : 'text-muted-foreground')}>
          {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {connected ? 'Conectado' : 'Reconectando…'}
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
        )}
        {messages.map(msg => (
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

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t px-4 py-3"
      >
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Digite uma mensagem…"
          disabled={sending || !connected}
          className="flex-1"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
        />
        <Button
          type="submit"
          size="icon"
          className="bg-brand-500 hover:bg-brand-600"
          disabled={sending || !text.trim() || !connected}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  )
}