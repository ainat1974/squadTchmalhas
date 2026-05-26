'use client'

import { useEffect, useRef, useState } from 'react'
import { useRealtimeChat } from '@/lib/hooks/useRealtimeChat'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { BrandMark } from '@/components/brand/BrandMark'
import { Send, ShieldCheck, X, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  initialSessionId: string | null
  pageUrl:          string | null
}

interface FormState {
  name:    string
  email:   string
  message: string
  consent: boolean
}

const SESSION_STORAGE_KEY = 'tm_webchat_session'
const SESSION_TTL_MS = 30 * 60 * 1000

interface StoredSession {
  sessionId:  string
  createdAt:  number
  visitorName?: string
}

function loadStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredSession
    if (Date.now() - parsed.createdAt > SESSION_TTL_MS) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function postToParent(payload: object) {
  if (typeof window === 'undefined' || window.parent === window) return
  try {
    window.parent.postMessage({ source: 'techmalhas-chat', ...payload }, '*')
  } catch {
    /* ignore */
  }
}

export function ChatEmbed({ initialSessionId, pageUrl }: Props) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    if (initialSessionId) return initialSessionId
    return loadStoredSession()?.sessionId ?? null
  })
  const [visitorName, setVisitorName] = useState<string>(
    () => loadStoredSession()?.visitorName ?? '',
  )

  if (!activeSessionId) {
    return (
      <ChatRegistration
        pageUrl={pageUrl}
        onSessionCreated={(sessionId, name) => {
          setActiveSessionId(sessionId)
          setVisitorName(name)
          try {
            localStorage.setItem(
              SESSION_STORAGE_KEY,
              JSON.stringify({ sessionId, createdAt: Date.now(), visitorName: name }),
            )
          } catch {
            /* storage full or disabled */
          }
        }}
      />
    )
  }

  return <ChatConversation sessionId={activeSessionId} visitorName={visitorName} />
}

function ChatRegistration({
  pageUrl,
  onSessionCreated,
}: {
  pageUrl: string | null
  onSessionCreated: (sessionId: string, name: string) => void
}) {
  const [form, setForm] = useState<FormState>({
    name:    '',
    email:   '',
    message: '',
    consent: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.consent) {
      setError('Você precisa aceitar os termos para iniciar a conversa.')
      return
    }
    if (form.message.trim().length < 2) {
      setError('Digite uma mensagem inicial para começarmos.')
      return
    }

    setSubmitting(true)
    try {
      const sessionRes = await fetch('/api/v1/webchat/sessions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          visitorName:  form.name.trim() || undefined,
          visitorEmail: form.email.trim() || undefined,
          pageUrl:      pageUrl ?? undefined,
          lgpdConsent:  true,
        }),
      })
      if (!sessionRes.ok) {
        const body = await sessionRes.json().catch(() => ({ error: 'Falha ao iniciar conversa' }))
        throw new Error(body.error ?? 'Falha ao iniciar conversa')
      }
      const sessionBody = await sessionRes.json() as { data: { sessionId: string } }
      const newSessionId = sessionBody.data.sessionId

      await fetch('/api/v1/webchat/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          sessionId:     newSessionId,
          content:       form.message.trim(),
          isFromVisitor: true,
        }),
      })

      postToParent({ type: 'session_started', sessionId: newSessionId })
      onSessionCreated(newSessionId, form.name.trim() || 'Visitante')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar conversa')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <EmbedHeader subtitle="Olá! Como podemos ajudar hoje?" />

      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
      >
        <FormField label="Seu nome" htmlFor="name">
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            placeholder="Como gostaria de ser chamado(a)?"
            maxLength={120}
            className="bg-sunken input-focus-glow h-10 w-full rounded-md border border-sutil px-3 text-sm text-fg-primary placeholder:text-fg-muted"
          />
        </FormField>

        <FormField label="Seu e-mail" htmlFor="email">
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            placeholder="email@exemplo.com.br"
            maxLength={200}
            className="bg-sunken input-focus-glow h-10 w-full rounded-md border border-sutil px-3 text-sm text-fg-primary placeholder:text-fg-muted"
          />
        </FormField>

        <FormField label="Como podemos ajudar?" htmlFor="message" required>
          <textarea
            id="message"
            required
            value={form.message}
            onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
            placeholder="Escreva sua dúvida ou pedido…"
            maxLength={2000}
            rows={3}
            className="bg-sunken input-focus-glow w-full rounded-md border border-sutil px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted"
          />
        </FormField>

        <label className="flex cursor-pointer items-start gap-2 text-xs text-fg-secondary">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm((s) => ({ ...s, consent: e.target.checked }))}
            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-sutil bg-sunken text-brand-gold focus:ring-brand-gold"
          />
          <span>
            Ao iniciar a conversa, concordo com a{' '}
            <a
              href="/politica-de-privacidade"
              target="_top"
              className="text-brand-gold hover:underline"
            >
              Política de Privacidade
            </a>{' '}
            da Techmalhas.
          </span>
        </label>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-metric-negative/40 bg-metric-negative-soft px-3 py-2 text-xs text-metric-negative">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary-premium mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-md text-sm font-semibold disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Iniciando…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Iniciar conversa
            </>
          )}
        </button>

        <p className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest text-fg-muted">
          <ShieldCheck className="h-3 w-3" />
          Atendimento seguro · Techmalhas
        </p>
      </form>
    </div>
  )
}

function FormField({
  label,
  htmlFor,
  required,
  children,
}: {
  label:    string
  htmlFor:  string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs uppercase tracking-wider text-fg-secondary"
      >
        {label}
        {required && <span className="ml-1 text-brand-gold">*</span>}
      </label>
      {children}
    </div>
  )
}

function ChatConversation({
  sessionId,
  visitorName,
}: {
  sessionId:   string
  visitorName: string
}) {
  const { messages, connected, sendMessage } = useRealtimeChat(sessionId)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    const unread = messages.filter((m) => !m.isFromVisitor && !m.readAt).length
    postToParent({ type: 'unread_count', count: unread })
  }, [messages])

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await sendMessage(text.trim(), true)
      setText('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <EmbedHeader
        subtitle={
          connected ? `Conectado como ${visitorName}` : 'Reconectando…'
        }
        connected={connected}
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {messages.length === 0 && (
          <p className="text-center text-xs text-fg-muted">
            Aguardando próximo atendente…
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            isOwn={msg.isFromVisitor}
            senderName={msg.isFromVisitor ? visitorName : 'Atendente Techmalhas'}
            createdAt={msg.createdAt}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="bg-card flex items-center gap-2 border-t border-sutil p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua mensagem…"
          disabled={sending || !connected}
          className="bg-sunken input-focus-glow h-10 flex-1 rounded-md border border-sutil px-3 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <button
          type="submit"
          className="btn-primary-premium flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-50"
          disabled={sending || !text.trim() || !connected}
          aria-label="Enviar mensagem"
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

function EmbedHeader({
  subtitle,
  connected,
}: {
  subtitle:   string
  connected?: boolean
}) {
  return (
    <header className="bg-card flex items-center justify-between border-b border-sutil px-4 py-3">
      <div className="flex items-center gap-3">
        <BrandMark variant="avatar" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
            CRM Techmalhas
          </p>
          <p
            className={cn(
              'flex items-center gap-1.5 text-[11px]',
              connected === undefined && 'text-fg-muted',
              connected === true && 'text-metric-positive',
              connected === false && 'text-fg-muted',
            )}
          >
            {connected !== undefined && (
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  connected ? 'bg-metric-positive' : 'bg-fg-muted',
                )}
              />
            )}
            {subtitle}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => postToParent({ type: 'close_panel' })}
        className="text-fg-muted transition-colors hover:text-brand-gold"
        aria-label="Fechar chat"
      >
        <X className="h-4 w-4" />
      </button>
    </header>
  )
}
