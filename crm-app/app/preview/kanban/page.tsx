'use client'
import { useState } from 'react'
import {
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Calendar,
  ChevronDown,
  Star,
  LayoutDashboard,
  KanbanSquare,
  Users,
  MessageSquare,
  CheckSquare,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { BrandMark } from '@/components/brand/BrandMark'

type Deal = {
  id: string
  title: string
  company: string
  value: number
  owner: string
  daysInStage: number
  hasOverdueTask?: boolean
  pendingTask?: string
  channel?: 'whatsapp' | 'instagram' | 'webchat'
  hot?: boolean
}

type Stage = {
  id: string
  label: string
  chip: string
  deals: Deal[]
}

const stagesAtacado: Stage[] = [
  {
    id: 'novo', label: 'Novo Lead', chip: 'stage-chip-new',
    deals: [
      { id: '1', title: 'Pedido 50 camisetas básicas', company: 'Loja Sul Boutique', value: 2450, owner: 'V', daysInStage: 2, channel: 'whatsapp' },
      { id: '2', title: 'Avaliação Polo Masculina', company: 'Moda da Mile', value: 5890, owner: 'V', daysInStage: 1, channel: 'instagram' },
      { id: '3', title: 'Catálogo Coleção Copa 2026', company: 'Esporte Total SP', value: 8900, owner: 'A', daysInStage: 3 },
    ],
  },
  {
    id: 'contato', label: 'Contato Inicial', chip: 'stage-chip-contact',
    deals: [
      { id: '4', title: 'Pedido camisetas Dryfit', company: 'Magazine Anjo', value: 12500, owner: 'V', daysInStage: 5, hasOverdueTask: true, pendingTask: 'Enviar proposta', hot: true },
      { id: '5', title: 'Avaliação revenda', company: 'Boutique Glow', value: 8200, owner: 'V', daysInStage: 4 },
    ],
  },
  {
    id: 'proposta', label: 'Proposta Enviada', chip: 'stage-chip-proposal',
    deals: [
      { id: '6', title: 'Kit 100 Polo Masculina', company: 'SP Mais Atacado', value: 45200, owner: 'A', daysInStage: 7, hasOverdueTask: true, pendingTask: 'Ligar de retorno', hot: true, channel: 'whatsapp' },
    ],
  },
  {
    id: 'negociacao', label: 'Negociação', chip: 'stage-chip-negotiation',
    deals: [
      { id: '7', title: 'Contrato anual revenda', company: 'Distribuidora MS', value: 89500, owner: 'V', daysInStage: 10, hot: true },
    ],
  },
  {
    id: 'ganho', label: 'Ganho', chip: 'stage-chip-won',
    deals: [
      { id: '8', title: 'Pedido 200 camisetas', company: 'Loja Verão SP', value: 9800, owner: 'A', daysInStage: 1, channel: 'whatsapp' },
      { id: '9', title: 'Coleção Copa 50un', company: 'Esporte Cidade', value: 4200, owner: 'V', daysInStage: 2 },
    ],
  },
]

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, active: false },
  { label: 'Pipeline',  icon: KanbanSquare,    active: true  },
  { label: 'Leads',     icon: Users,           active: false },
  { label: 'Chat',      icon: MessageSquare,   active: false },
  { label: 'Tarefas',   icon: CheckSquare,     active: false },
  { label: 'Configurações', icon: Settings,    active: false },
]

export default function PreviewKanbanPage() {
  const [pipelineType, setPipelineType] = useState<'atacado' | 'varejo'>('atacado')
  const totalDeals = stagesAtacado.reduce((s, stage) => s + stage.deals.length, 0)
  const totalValue = stagesAtacado.flatMap((s) => s.deals).reduce((s, d) => s + d.value, 0)

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
      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="filter-bar-sticky flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-fg-primary">Pipeline</h1>
            <span className="text-xs uppercase tracking-wider text-fg-muted">· {pipelineType === 'atacado' ? 'Atacado' : 'Varejo'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-1.5 rounded-md border border-sutil bg-sunken px-3 py-2 text-sm text-fg-secondary hover:border-gold-soft hover:text-brand-gold">
              <Filter className="h-4 w-4" /> Filtros
            </button>
            <button type="button" className="btn-primary-premium flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold">
              <Plus className="h-4 w-4" /> Novo Deal
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sutil bg-card px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="bg-sunken flex rounded-lg border border-sutil p-0.5">
              {(['atacado', 'varejo'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPipelineType(t)}
                  className={[
                    'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                    pipelineType === t
                      ? 'bg-brand-gold/15 text-brand-gold'
                      : 'text-fg-muted hover:text-fg-primary',
                  ].join(' ')}
                >
                  {t === 'atacado' ? 'Atacado' : 'Varejo'}
                </button>
              ))}
            </div>
            <button type="button" className="flex items-center gap-1 rounded-md border border-sutil bg-sunken px-3 py-1.5 text-sm text-fg-secondary hover:border-gold-soft">
              Meus deals <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <div className="text-fg-muted">
              <strong className="font-kpi text-fg-primary">{totalDeals}</strong> deals
            </div>
            <div className="text-fg-muted">
              Total: <strong className="font-kpi text-brand-gold">
                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-muted" />
              <input
                placeholder="Buscar…"
                className="bg-sunken input-focus-glow h-9 w-48 rounded-md border border-sutil pl-8 pr-3 text-sm text-fg-primary placeholder:text-fg-muted"
              />
            </div>
          </div>
        </div>

        {/* Kanban */}
        <div className="kanban-scroll flex-1 overflow-x-auto p-4">
          <div className="flex h-full min-w-max gap-3">
            {stagesAtacado.map((stage) => (
              <div key={stage.id} className="flex w-72 flex-shrink-0 flex-col">
                <div className="bg-card mb-2 flex items-center justify-between rounded-lg border border-sutil px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={['rounded-full px-2 py-0.5 text-xs font-medium', stage.chip].join(' ')}>
                      {stage.label}
                    </span>
                  </div>
                  <span className="font-kpi text-xs text-fg-muted">{stage.deals.length}</span>
                </div>
                <div className="bg-sunken flex-1 space-y-2 overflow-y-auto rounded-lg border border-sutil p-2">
                  {stage.deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-sutil py-2 text-xs text-fg-muted transition-colors hover:border-gold-soft hover:text-brand-gold"
                  >
                    <Plus className="h-3 w-3" /> Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="button" className="fab-gold" aria-label="Novo deal">
          <Plus className="h-6 w-6" />
        </button>
      </main>
    </div>
  )
}

function DealCard({ deal }: { deal: Deal }) {
  const channelDot: Record<NonNullable<Deal['channel']>, string> = {
    whatsapp:  'channel-dot-whatsapp',
    instagram: 'channel-dot-instagram',
    webchat:   'channel-dot-webchat',
  }

  return (
    <div className="card-interactive group cursor-grab p-3">
      <div className="mb-1.5 flex items-start justify-between gap-1">
        <div className="flex items-start gap-1.5">
          {deal.hot && <Star className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 fill-brand-gold text-brand-gold" />}
          <div className="text-sm font-medium leading-tight text-fg-primary">{deal.title}</div>
        </div>
        {deal.hasOverdueTask && (
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-metric-negative" />
        )}
      </div>
      <div className="mb-2 text-xs text-fg-muted">{deal.company}</div>

      {deal.pendingTask && (
        <div className="mb-2 flex items-center gap-1 rounded border border-metric-negative-soft bg-metric-negative-soft px-2 py-1 text-[10px] text-metric-negative">
          <AlertTriangle className="h-3 w-3" />
          <span className="font-medium">Obrigatória:</span> {deal.pendingTask}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="font-kpi text-sm font-semibold text-brand-gold">
          {deal.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
        <div className="flex items-center gap-1.5">
          {deal.channel && <span className={['channel-dot', channelDot[deal.channel]].join(' ')} />}
          <span
            className="brand-tm-avatar"
            style={{ width: 22, height: 22, fontSize: 10 }}
          >
            {deal.owner}
          </span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-fg-muted">
        <Calendar className="h-2.5 w-2.5" />
        <span className="font-kpi">{deal.daysInStage}d nesta etapa</span>
      </div>
    </div>
  )
}
