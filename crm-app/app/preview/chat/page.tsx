'use client'
import { useState } from 'react'
import { Send, Paperclip, Smile, Search, Phone, Video, MoreVertical, Instagram, MessageCircle, Globe } from 'lucide-react'

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
  avatarColor: string
}

type Message = {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
  read?: boolean
}

const conversations: Conversation[] = [
  { id: '1', channel: 'whatsapp', contactName: 'José Silva — Loja Sul Boutique', lastMessage: 'Vou conferir os modelos disponíveis...', time: '14:23', unread: 2, online: true, avatar: 'J', avatarColor: 'bg-blue-500' },
  { id: '2', channel: 'whatsapp', contactName: 'Maria Souza — Moda da Mile', lastMessage: 'Pode me enviar o catálogo de Polo?', time: '13:50', unread: 1, online: true, avatar: 'M', avatarColor: 'bg-pink-500' },
  { id: '3', channel: 'instagram', contactName: 'patriciarocha_', lastMessage: 'oi, vcs entregam pra Salvador?', time: '13:15', unread: 0, avatar: 'P', avatarColor: 'bg-purple-500' },
  { id: '4', channel: 'webchat', contactName: 'Visitante Anônimo', lastMessage: 'Quanto fica o kit 3 camisetas?', time: '12:48', unread: 1, online: true, avatar: '?', avatarColor: 'bg-slate-400' },
  { id: '5', channel: 'whatsapp', contactName: 'Pedro Costa', lastMessage: 'Obrigado! Já fiz o PIX', time: '11:30', unread: 0, avatar: 'P', avatarColor: 'bg-green-500' },
  { id: '6', channel: 'instagram', contactName: 'esporte.total.sp', lastMessage: 'Mensagem do Instagram (foto)', time: 'ontem', unread: 0, avatar: 'E', avatarColor: 'bg-orange-500' },
]

const messages: Message[] = [
  { id: '1', from: 'them', text: 'Boa tarde! Vi o catálogo de vocês no Instagram.', time: '14:05' },
  { id: '2', from: 'them', text: 'Tenho uma loja em Curitiba e queria fazer um pedido grande de camisetas básicas.', time: '14:06' },
  { id: '3', from: 'me', text: 'Olá José! Que ótimo, bem-vindo à Techmalhas! 🟢', time: '14:10', read: true },
  { id: '4', from: 'me', text: 'Sou o Vitor, do atacado. Posso te ajudar com o pedido. Quantas peças você está pensando?', time: '14:10', read: true },
  { id: '5', from: 'them', text: 'Inicialmente uns 50 a 100 peças. Tem desconto progressivo?', time: '14:18' },
  { id: '6', from: 'me', text: 'Sim! A partir de 50 peças o preço cai 20%. E a partir de 100 são 25% off.', time: '14:20', read: true },
  { id: '7', from: 'me', text: 'Vou te enviar nossa tabela completa de atacado.', time: '14:20', read: true },
  { id: '8', from: 'them', text: 'Vou conferir os modelos disponíveis e te retorno em 1h. Pode separar 50 unidades das camisetas básicas pretas tam M e G?', time: '14:23' },
]

const channelConfig = {
  whatsapp: { icon: MessageCircle, label: 'WhatsApp', color: 'text-green-600', bg: 'bg-green-100' },
  instagram: { icon: Instagram, label: 'Instagram', color: 'text-pink-600', bg: 'bg-pink-100' },
  webchat: { icon: Globe, label: 'Webchat', color: 'text-blue-600', bg: 'bg-blue-100' },
}

export default function PreviewChatPage() {
  const [filter, setFilter] = useState<'todos' | Channel>('todos')
  const [activeId, setActiveId] = useState('1')
  const filtered = filter === 'todos' ? conversations : conversations.filter((c) => c.channel === filter)
  const active = conversations.find((c) => c.id === activeId)!

  return (
    <div className="h-[calc(100vh-40px)] flex bg-white">
      {/* ─── Sidebar de conversas ──────────────────────────── */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h1 className="font-bold text-slate-900 mb-3">Chat Multicanal</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Buscar conversa..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-1 mt-3 text-xs">
            {(['todos', 'whatsapp', 'instagram', 'webchat'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 rounded font-medium capitalize ${
                  filter === f
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => {
            const Ch = channelConfig[c.channel].icon
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left p-3 border-b border-slate-100 hover:bg-slate-50 flex items-start gap-3 ${
                  activeId === c.id ? 'bg-emerald-50' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full ${c.avatarColor} text-white font-bold text-sm flex items-center justify-center`}>
                    {c.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${channelConfig[c.channel].bg} flex items-center justify-center border-2 border-white`}>
                    <Ch className={`w-2.5 h-2.5 ${channelConfig[c.channel].color}`} />
                  </div>
                  {c.online && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm text-slate-900 truncate">{c.contactName}</div>
                    <div className="text-[10px] text-slate-400 flex-shrink-0">{c.time}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <div className="text-xs text-slate-500 truncate">{c.lastMessage}</div>
                    {c.unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {c.unread}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Thread ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Header da thread */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-full ${active.avatarColor} text-white font-bold flex items-center justify-center`}>
                {active.avatar}
              </div>
            </div>
            <div>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                {active.contactName}
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${channelConfig[active.channel].bg} ${channelConfig[active.channel].color} font-medium uppercase`}>
                  {channelConfig[active.channel].label}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {active.online ? '🟢 Online agora' : 'Última vez há 2h'} · LGPD ✅
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          <div className="text-center text-xs text-slate-400 mb-4">
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200">Hoje</span>
          </div>
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-md px-4 py-2 rounded-2xl ${
                  m.from === 'me'
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-white text-slate-900 rounded-bl-sm border border-slate-200'
                }`}
              >
                <div className="text-sm">{m.text}</div>
                <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${m.from === 'me' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {m.time}
                  {m.from === 'me' && m.read && <span>✓✓</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-slate-200 p-3">
          <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-3 py-2">
            <button className="text-slate-500 hover:text-emerald-700">
              <Smile className="w-5 h-5" />
            </button>
            <button className="text-slate-500 hover:text-emerald-700">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              placeholder="Digite sua mensagem... (modo preview)"
              className="flex-1 bg-transparent focus:outline-none text-sm text-slate-900 placeholder:text-slate-400"
            />
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] text-slate-400 text-center mt-1">
            ⚠️ Modo preview · sem envio real. Configure WhatsApp Cloud API para enviar mensagens.
          </div>
        </div>
      </div>
    </div>
  )
}
