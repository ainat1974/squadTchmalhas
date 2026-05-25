'use client'
import { useState } from 'react'
import {
  Send, Paperclip, Smile, Search, Phone, Video, MoreVertical,
  Instagram, MessageCircle, Globe,
  LayoutDashboard, KanbanSquare, Users, MessageSquare, CheckSquare,
  Settings, ChevronRight, ShieldCheck,
} from 'lucide-react'
import { BrandMark } from '@/components/brand/BrandMark'

type Channel = 'whatsapp' | 'instagram' | 'webchat'

type Conversation = {
  id: string
  channel: Channel
  contactName: string
  lastMessage: string
  time: string
  unread: number
  online?: boolean
  avatar: string
}

type Message = {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
  read?: boolean
}

const conversations: Conversation[] = [
  { id: '1', channel: 'whatsapp',  contactName: 'José Silva — Loja Sul Boutique', lastMessage: 'Vou conferir os modelos disponíveis…',  time: '14:23', unread: 2, online: true,  avatar: 'JS' },
  { id: '2', channel: 'whatsapp',  contactName: 'Maria Souza — Moda da Mile',     lastMessage: 'Pode me enviar o catálogo de Polo?',    time: '13:50', unread: 1, online: true,  avatar: 'MS' },
  { id: '3', channel: 'instagram', contactName: 'patriciarocha_',                  lastMessage: 'oi, vcs entregam pra Salvador?',        time: '13:15', unread: 0,                 avatar: 'PR' },
  { id: '4', channel: 'webchat',   contactName: 'Visitante Anônimo',              lastMessage: 'Quanto fica o kit 3 camisetas?',        time: '12:48', unread: 1, online: true,  avatar: '?'  },
  { id: '5', channel: 'whatsapp',  contactName: 'Pedro Costa',                     lastMessage: 'Obrigado! Já fiz o PIX',                time: '11:30', unread: 0,                 avatar: 'PC' },
  { id: '6', channel: 'instagram', contactName: 'esporte.total.sp',               lastMessage: 'Mensagem do Instagram (foto)',          time: 'ontem', unread: 0,                 avatar: 'ET' },
]

const messages: Message[] = [
  { id: '1', from: 'them', text: 'Boa tarde! Vi o catálogo de vocês no Instagram.', time: '14:05' },
  { id: '2', from: 'them', text: 'Tenho uma loja em Curitiba e queria fazer um pedido grande de camisetas básicas.', time: '14:06' },
  { id: '3', from: 'me',   text: 'Olá José! Que ótimo, bem-vindo à Techmalhas.', time: '14:10', read: true },
  { id: '4', from: 'me',   text: 'Sou o Vitor, do atacado. Posso te ajudar com o pedido. Quantas peças você está pensando?', time: '14:10', read: true },
  { id: '5', from: 'them', text: 'Inicialmente uns 50 a 100 peças. Tem desconto progressivo?', time: '14:18' },
  { id: '6', from: 'me',   text: 'Sim! A partir de 50 peças o preço cai 20%. E a partir de 100, são 25% off.', time: '14:20', read: true },
  { id: '7', from: 'me',   text: 'Vou te enviar nossa tabela completa de atacado.', time: '14:20', read: true },
  { id: '8', from: 'them', text: 'Vou conferir os modelos disponíveis e te retorno em 1h. Pode separar 50 unidades das camisetas básicas pretas tam M e G?', time: '14:23' },
]

const channelConfig: Record<Channel, { icon: React.ComponentType<{ className?: string }>; label: string; dot: string; textColor: string }> = {
  whatsapp:  { icon: MessageCircle, label: 'WhatsApp',  dot: 'channel-dot-whatsapp',  textColor: 'text-channel-whatsapp'  },
  instagram: { icon: Instagram,     label: 'Instagram', dot: 'channel-dot-instagram', textColor: 'text-channel-instagram' },
  webchat:   { icon: Globe,         label: 'Webchat',   dot: 'channel-dot-webchat',   textColor: 'text-channel-webchat'   },
}

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, active: false },
  { label: 'Pipeline',  icon: KanbanSquare,    active: false },
  { label: 'Leads',     icon: Users,           active: false },
  { label: 'Chat',      icon: MessageSquare,   active: true  },
  { label: 'Tarefas',   icon: CheckSquare,     active: false },
  { label: 'Configurações', icon: Settings,    active: false },
]

export default function PreviewChatPage() {
  const [filter, setFilter] = useState<'todos' | Channel>('todos')
  const [activeId, setActiveId] = useState('1')
  const filtered = filter === 'todos' ? conversations : conversations.filter((c) => c.channel === filter)
  const active = conversations.find((c) => c.id === activeId)!
  const ActiveChannelIcon = channelConfig[active.channel].icon

  return (
    <div className="bg-canvas flex h-screen text-fg-primary">
      {/* Sidebar nav */}
      <aside className="bg-card hidden w-60 flex-shrink-0 flex-col border-r border-sutil md:flex">
        <div className="flex h-20 items-center justify-center border-b border-sutil px-6">
          <BrandMark variant="sidebar" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={[
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                item.active
                  ? 'border border-gold-soft bg-brand-gold/10 text-brand-gold shadow-[inset_0_1px_0_hsla(0,0%,100%,0.04)]'
                  : 'border border-transparent text-fg-muted hover:border-sutil hover:bg-elevated hover:text-fg-primary',
              ].join(' ')}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {item.active && <ChevronRight className="ml-auto h-4 w-4 text-brand-gold opacity-80" />}
            </button>
          ))}
        </nav>
        <div className="border-t border-sutil p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-elevated"
          >
            <span className="brand-tm-avatar">TM</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg-primary">Tania Maria</p>
              <p className="truncate text-xs text-fg-muted">Administrador</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Coluna de conversas */}
      <div className="bg-card flex w-80 flex-shrink-0 flex-col border-r border-sutil">
        <div className="border-b border-sutil p-4">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-base font-semibold tracking-tight text-fg-primary">Chat Multicanal</h1>
            <span className="pulse-live" aria-label="Conexão ativa" />
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
            <input
              placeholder="Buscar conversa…"
              className="bg-sunken input-focus-glow h-9 w-full rounded-md border border-sutil pl-9 pr-3 text-sm text-fg-primary placeholder:text-fg-muted"
            />
          </div>
          <div className="mt-3 flex gap-1 text-[11px]">
            {(['todos', 'whatsapp', 'instagram', 'webchat'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={[
                  'rounded px-2 py-1 font-medium capitalize transition-all',
                  filter === f
                    ? 'bg-brand-gold/15 text-brand-gold'
                    : 'text-fg-muted hover:bg-elevated hover:text-fg-primary',
                ].join(' ')}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => {
            const ChIcon = channelConfig[c.channel].icon
            const isActive = activeId === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={[
                  'flex w-full items-start gap-3 border-b border-sutil p-3 text-left transition-all',
                  isActive
                    ? 'bg-brand-gold/8 border-l-2 border-l-brand-gold'
                    : 'hover:bg-elevated',
                ].join(' ')}
              >
                <div className="relative flex-shrink-0">
                  <span className="brand-tm-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>
                    {c.avatar}
                  </span>
                  <span
                    className={[
                      'channel-dot absolute -bottom-0.5 -right-0.5 ring-2 ring-card',
                      channelConfig[c.channel].dot,
                    ].join(' ')}
                    style={{ width: 12, height: 12 }}
                    aria-label={channelConfig[c.channel].label}
                  />
                  {c.online && (
                    <span
                      className="pulse-live absolute -top-0.5 -right-0.5 ring-2 ring-card"
                      aria-label="Online"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-medium text-fg-primary">{c.contactName}</div>
                    <div className="font-kpi flex-shrink-0 text-[10px] text-fg-muted">{c.time}</div>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <div className="truncate text-xs text-fg-muted">{c.lastMessage}</div>
                    {c.unread > 0 && (
                      <span className="font-kpi flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-ink">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Thread */}
      <div className="bg-canvas flex flex-1 flex-col">
        {/* Header da thread */}
        <div className="bg-card flex items-center justify-between border-b border-sutil px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="brand-tm-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>
              {active.avatar}
            </span>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-fg-primary">
                {active.contactName}
                <span className={['inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-elevated', channelConfig[active.channel].textColor].join(' ')}>
                  <ActiveChannelIcon className="h-3 w-3" />
                  {channelConfig[active.channel].label}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-fg-muted">
                {active.online ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="pulse-live" /> Online agora
                  </span>
                ) : (
                  <span>Última vez há 2h</span>
                )}
                <span className="text-fg-disabled">·</span>
                <span className="inline-flex items-center gap-1 text-metric-positive">
                  <ShieldCheck className="h-3 w-3" /> LGPD
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" className="rounded-md p-2 text-fg-muted transition-colors hover:bg-elevated hover:text-brand-gold">
              <Phone className="h-4 w-4" />
            </button>
            <button type="button" className="rounded-md p-2 text-fg-muted transition-colors hover:bg-elevated hover:text-brand-gold">
              <Video className="h-4 w-4" />
            </button>
            <button type="button" className="rounded-md p-2 text-fg-muted transition-colors hover:bg-elevated hover:text-brand-gold">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 space-y-2 overflow-y-auto p-5">
          <div className="mb-4 text-center text-xs text-fg-muted">
            <span className="bg-card rounded-full border border-sutil px-3 py-1 uppercase tracking-wider">
              Hoje
            </span>
          </div>
          {messages.map((m) => (
            <div key={m.id} className={['flex', m.from === 'me' ? 'justify-end' : 'justify-start'].join(' ')}>
              <div
                className={[
                  'max-w-md rounded-2xl px-4 py-2',
                  m.from === 'me'
                    ? 'rounded-br-sm bg-brand-gold text-brand-ink shadow-gold'
                    : 'bg-card rounded-bl-sm border border-sutil text-fg-primary',
                ].join(' ')}
              >
                <div className="text-sm leading-relaxed">{m.text}</div>
                <div
                  className={[
                    'font-kpi mt-1 flex items-center justify-end gap-1 text-[10px]',
                    m.from === 'me' ? 'text-brand-ink/60' : 'text-fg-muted',
                  ].join(' ')}
                >
                  {m.time}
                  {m.from === 'me' && m.read && <span>✓✓</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-card border-t border-sutil p-3">
          <div className="bg-sunken flex items-center gap-2 rounded-2xl border border-sutil px-3 py-2">
            <button type="button" className="text-fg-muted transition-colors hover:text-brand-gold">
              <Smile className="h-5 w-5" />
            </button>
            <button type="button" className="text-fg-muted transition-colors hover:text-brand-gold">
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              placeholder="Digite sua mensagem… (modo preview)"
              className="flex-1 bg-transparent text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none"
            />
            <button type="button" className="btn-primary-premium flex h-9 w-9 items-center justify-center rounded-full">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-1 text-center text-[10px] uppercase tracking-wider text-fg-muted">
            Modo preview · sem envio real. Configure WhatsApp Cloud API para enviar mensagens.
          </div>
        </div>
      </div>
    </div>
  )
}
