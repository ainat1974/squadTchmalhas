'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { ArrowLeft, Loader2, Send, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id:        string
  content:   string
  isOwn:     boolean
  createdAt: string
}

interface ContactInfo {
  id:            string
  fullName:      string
  whatsappPhone: string | null
  lgpdConsent:   boolean
}

interface Props {
  contactId:   string
  contactName: string
}

export function WhatsAppThread({ contactId, contactName }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [contact, setContact] = useState<ContactInfo | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/whatsapp/conversations/${contactId}/messages`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string } }
        throw new Error(body.error?.message ?? 'Falha ao carregar mensagens')
      }
      const body = await res.json() as {
        data: { contact: ContactInfo; messages: Message[] }
      }
      setContact(body.data.contact)
      setMessages(body.data.messages)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [contactId])

  useEffect(() => {
    void loadMessages()
    const interval = setInterval(() => void loadMessages(), 10_000)
    return () => clearInterval(interval)
  }, [loadMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    if (!text.trim() || sending) return

    if (contact && !contact.lgpdConsent) {
      setError('Contato sem consentimento LGPD. Confirme o consentimento antes de enviar.')
      return
    }

    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/whatsapp/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          contactId,
          type: 'text',
          text: text.trim(),
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string } }
        throw new Error(body.error?.message ?? 'Falha ao enviar')
      }
      setText('')
      await loadMessages()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="bg-card flex shrink-0 items-center gap-3 border-b border-sutil px-4 py-3">
        <Link
          href="/whatsapp"
          className="text-fg-muted transition-colors hover:text-brand-gold md:hidden"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-fg-primary">{contactName}</p>
          {contact?.whatsappPhone && (
            <p className="text-xs text-fg-muted">{contact.whatsappPhone}</p>
          )}
        </div>
        {contact && !contact.lgpdConsent && (
          <span className="tag-pill flex items-center gap-1 border-metric-negative/40 text-metric-negative">
            <ShieldAlert className="h-3 w-3" />
            LGPD pendente
          </span>
        )}
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <p className="text-center text-sm text-fg-muted">Nenhuma mensagem nesta conversa.</p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            isOwn={msg.isOwn}
            senderName={msg.isOwn ? undefined : contactName}
            createdAt={msg.createdAt}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded-md border border-metric-negative/40 bg-metric-negative-soft px-3 py-2 text-xs text-metric-negative">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="bg-card flex shrink-0 items-center gap-2 border-t border-sutil p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            contact && !contact.lgpdConsent
              ? 'LGPD pendente — não é possível enviar'
              : 'Digite sua mensagem…'
          }
          disabled={sending || (contact !== null && !contact.lgpdConsent)}
          className={cn(
            'bg-sunken input-focus-glow h-10 flex-1 rounded-md border border-sutil px-3 text-sm',
            'text-fg-primary placeholder:text-fg-muted disabled:opacity-50',
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void handleSend()
            }
          }}
        />
        <button
          type="submit"
          disabled={sending || !text.trim() || (contact !== null && !contact.lgpdConsent)}
          className="btn-primary-premium flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-50"
          aria-label="Enviar"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  )
}
