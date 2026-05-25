'use client'
import { useState } from 'react'
import {
  Search, Plus, Filter, Phone, Building2, MapPin, MoreVertical,
  LayoutDashboard, KanbanSquare, Users, MessageSquare, CheckSquare,
  Settings, ChevronRight, ShieldAlert,
} from 'lucide-react'
import { BrandMark } from '@/components/brand/BrandMark'

type Lead = {
  id: string
  name: string
  company?: string
  email?: string
  phone: string
  whatsapp: string
  type: 'atacado' | 'varejo'
  city: string
  state: string
  source: 'whatsapp' | 'instagram' | 'webchat' | 'site' | 'indicacao'
  ownerName: string
  lgpdConsent: boolean
  tag?: string
  totalValue: number
  lastInteraction: string
}

const leads: Lead[] = [
  { id: '1', name: 'José Silva',        company: 'Loja Sul Boutique',     email: 'jose@lojasul.com.br',    phone: '(11) 99876-5432', whatsapp: '(11) 99876-5432', type: 'atacado', city: 'São Paulo',      state: 'SP', source: 'whatsapp',  ownerName: 'Vitor',  lgpdConsent: true,  tag: 'VIP',         totalValue: 24580, lastInteraction: 'há 2 dias' },
  { id: '2', name: 'Maria Souza',       company: 'Moda da Mile',           email: 'maria@modadamile.com',    phone: '(31) 98765-4321', whatsapp: '(31) 98765-4321', type: 'atacado', city: 'Belo Horizonte', state: 'MG', source: 'instagram', ownerName: 'Vitor',  lgpdConsent: true,                       totalValue: 5890,  lastInteraction: 'hoje' },
  { id: '3', name: 'Pedro Costa',                                                                            phone: '(11) 91234-5678', whatsapp: '(11) 91234-5678', type: 'varejo',  city: 'Guarulhos',      state: 'SP', source: 'whatsapp',  ownerName: 'Amanda', lgpdConsent: true,                       totalValue: 245,   lastInteraction: 'há 1 hora' },
  { id: '4', name: 'Ana Paula Lima',                                       email: 'anapaula@gmail.com',     phone: '(85) 99999-1111', whatsapp: '(85) 99999-1111', type: 'varejo',  city: 'Fortaleza',      state: 'CE', source: 'site',      ownerName: 'Amanda', lgpdConsent: false,                      totalValue: 0,     lastInteraction: 'há 5 dias' },
  { id: '5', name: 'Carlos Mendes',     company: 'Esporte Total SP',       email: 'carlos@esportetotal.com.br', phone: '(11) 98888-2222', whatsapp: '(11) 98888-2222', type: 'atacado', city: 'São Paulo', state: 'SP', source: 'indicacao', ownerName: 'Vitor',  lgpdConsent: true,  tag: 'Negociação',  totalValue: 89500, lastInteraction: 'há 3 dias' },
  { id: '6', name: 'Juliana Ferreira',                                                                       phone: '(21) 97777-3333', whatsapp: '(21) 97777-3333', type: 'varejo',  city: 'Rio de Janeiro', state: 'RJ', source: 'whatsapp',  ownerName: 'Amanda', lgpdConsent: true,                       totalValue: 580,   lastInteraction: 'ontem' },
  { id: '7', name: 'Roberto Almeida',   company: 'Magazine Anjo',          email: 'roberto@magazineanjo.com.br', phone: '(41) 96666-4444', whatsapp: '(41) 96666-4444', type: 'atacado', city: 'Curitiba',      state: 'PR', source: 'webchat',   ownerName: 'Vitor',  lgpdConsent: true,                       totalValue: 12500, lastInteraction: 'há 4 dias' },
  { id: '8', name: 'Patrícia Rocha',                                       email: 'patricia@gmail.com',     phone: '(11) 95555-5555', whatsapp: '(11) 95555-5555', type: 'varejo',  city: 'São Paulo',      state: 'SP', source: 'instagram', ownerName: 'Amanda', lgpdConsent: true,                       totalValue: 320,   lastInteraction: 'há 1 semana' },
]

const sourceLabel: Record<Lead['source'], string> = {
  whatsapp: 'WhatsApp', instagram: 'Instagram', webchat: 'Webchat', site: 'Site', indicacao: 'Indicação',
}

const sourceDot: Record<Lead['source'], string> = {
  whatsapp:  'bg-channel-whatsapp',
  instagram: 'bg-channel-instagram',
  webchat:   'bg-channel-webchat',
  site:      'bg-chart-tertiary',
  indicacao: 'bg-brand-gold',
}

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, active: false },
  { label: 'Pipeline',  icon: KanbanSquare,    active: false },
  { label: 'Leads',     icon: Users,           active: true  },
  { label: 'Chat',      icon: MessageSquare,   active: false },
  { label: 'Tarefas',   icon: CheckSquare,     active: false },
  { label: 'Configurações', icon: Settings,    active: false },
]

export default function PreviewLeadsPage() {
  const [filter, setFilter] = useState<'todos' | 'atacado' | 'varejo'>('todos')
  const filtered = leads.filter((l) => filter === 'todos' || l.type === filter)
  const lgpdCount = leads.filter((l) => l.lgpdConsent).length

  return (
    <div className="bg-canvas flex min-h-screen text-fg-primary">
      {/* Sidebar */}
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

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">
        <div className="space-y-5 p-6">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-fg-muted">Base de contatos</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg-primary">Leads &amp; Contatos</h1>
              <p className="mt-1 text-sm text-fg-muted">
                <span className="font-kpi text-fg-secondary">{filtered.length}</span> contatos ·
                {' '}<span className="font-kpi text-metric-positive">{lgpdCount}</span> com consentimento LGPD
              </p>
            </div>
            <button type="button" className="btn-primary-premium flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold">
              <Plus className="h-4 w-4" /> Novo Contato
            </button>
          </div>

          {/* Toolbar */}
          <div className="card-default flex flex-wrap items-center gap-3 p-3">
            <div className="bg-sunken flex rounded-lg border border-sutil p-0.5">
              {(['todos', 'atacado', 'varejo'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={[
                    'rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-all',
                    filter === f
                      ? 'bg-brand-gold/15 text-brand-gold'
                      : 'text-fg-muted hover:text-fg-primary',
                  ].join(' ')}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
              <input
                placeholder="Buscar por nome, e-mail, telefone, empresa…"
                className="bg-sunken input-focus-glow h-10 w-full rounded-md border border-sutil pl-9 pr-3 text-sm text-fg-primary placeholder:text-fg-muted"
              />
            </div>
            <button type="button" className="flex items-center gap-1.5 rounded-md border border-sutil bg-sunken px-3 py-2 text-sm text-fg-secondary hover:border-gold-soft hover:text-brand-gold">
              <Filter className="h-4 w-4" /> Filtros
            </button>
          </div>

          {/* Tabela */}
          <div className="card-default overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-sutil bg-elevated">
                <tr className="text-left text-[10px] uppercase tracking-widest text-fg-muted">
                  <th className="px-4 py-3 font-semibold">Contato</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Origem</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Cidade</th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Responsável</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="hidden px-4 py-3 font-semibold lg:table-cell">Última interação</th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-sutil)]">
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    className="cursor-pointer transition-colors hover:bg-elevated"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="brand-tm-avatar" style={{ width: 36, height: 36, fontSize: 12 }}>
                          {lead.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium text-fg-primary">
                            {lead.name}
                            {lead.tag && (
                              <span className={[
                                'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                                lead.tag === 'VIP'
                                  ? 'tag-pill-warm'
                                  : 'bg-stage-negotiation-bg text-stage-negotiation',
                              ].join(' ')}>
                                {lead.tag}
                              </span>
                            )}
                            {!lead.lgpdConsent && (
                              <span title="Sem consentimento LGPD" className="text-brand-gold">
                                <ShieldAlert className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 truncate text-xs text-fg-muted">
                            {lead.company ? (
                              <>
                                <Building2 className="h-3 w-3" /> {lead.company}
                              </>
                            ) : (
                              <>
                                <Phone className="h-3 w-3" />
                                <span className="font-kpi">{lead.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs text-fg-secondary">
                        <span className={['channel-dot', sourceDot[lead.source]].join(' ')} />
                        {sourceLabel[lead.source]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-fg-secondary lg:table-cell">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-fg-muted" />
                        {lead.city}/{lead.state}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="brand-tm-avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                          {lead.ownerName[0]}
                        </span>
                        <span className="text-sm text-fg-secondary">{lead.ownerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-kpi text-sm font-semibold text-brand-gold">
                        {lead.totalValue > 0
                          ? lead.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : '—'}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-fg-muted lg:table-cell">{lead.lastInteraction}</td>
                    <td className="px-4 py-3">
                      <button type="button" className="rounded p-1 text-fg-muted transition-colors hover:bg-elevated hover:text-brand-gold">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button type="button" className="fab-gold" aria-label="Novo lead">
          <Plus className="h-6 w-6" />
        </button>
      </main>
    </div>
  )
}
