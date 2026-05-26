'use client'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  AlertTriangle,
  Trophy,
  Clock,
  LayoutDashboard,
  KanbanSquare,
  MessageSquare,
  CheckSquare,
  Settings,
  ChevronRight,
  Search,
  Plus,
} from 'lucide-react'
import { BrandMark } from '@/components/brand/BrandMark'

const kpis = [
  { label: 'Receita do Mês', value: 'R$ 287.450', delta: '+18%', trend: 'up' as const, icon: DollarSign, accent: 'gold' },
  { label: 'Novos Leads',    value: '142',         delta: '+24%', trend: 'up' as const, icon: Users,      accent: 'sage' },
  { label: 'Taxa Conversão', value: '18,2%',       delta: '+3,1pp', trend: 'up' as const, icon: Target,    accent: 'positive' },
  { label: 'Atrasadas',      value: '7',           delta: '-12%', trend: 'down' as const, icon: AlertTriangle, accent: 'negative' },
]

const funnel = [
  { stage: 'Novo Lead',        count: 142, value: 'R$ 285.000', chip: 'stage-chip-new' },
  { stage: 'Contato Inicial',  count: 89,  value: 'R$ 234.500', chip: 'stage-chip-contact' },
  { stage: 'Proposta Enviada', count: 52,  value: 'R$ 189.200', chip: 'stage-chip-proposal' },
  { stage: 'Negociação',       count: 31,  value: 'R$ 124.800', chip: 'stage-chip-negotiation' },
  { stage: 'Ganho',            count: 26,  value: 'R$ 287.450', chip: 'stage-chip-won' },
]

const topPerformers = [
  { name: 'Vitor Vendas',  role: 'Vendedor Atacado', deals: 18, value: 156800 },
  { name: 'Amanda Atende', role: 'Atendente Varejo', deals: 31, value: 89200 },
  { name: 'Renato Gestão', role: 'Gestor',           deals: 12, value: 41450 },
]

const overdue = [
  { task: 'Enviar proposta - Magazine Anjo',        assignee: 'Vitor',  days: 3, mandatory: true },
  { task: 'Ligar de retorno - SP Mais Atacado',     assignee: 'Amanda', days: 2, mandatory: true },
  { task: 'Confirmar dados - Distribuidora MS',     assignee: 'Vitor',  days: 1, mandatory: false },
]

const NAV_ITEMS = [
  { label: 'Dashboard',    icon: LayoutDashboard, active: true  },
  { label: 'Pipeline',     icon: KanbanSquare,    active: false },
  { label: 'Leads',        icon: Users,           active: false },
  { label: 'Chat',         icon: MessageSquare,   active: false },
  { label: 'Tarefas',      icon: CheckSquare,     active: false },
  { label: 'Configurações',icon: Settings,        active: false },
]

export default function PreviewDashboardPage() {
  const maxFunnel = funnel[0].count

  return (
    <div className="bg-canvas flex min-h-screen text-fg-primary">
      {/* ─── Sidebar com BrandMark (decisão Tania 2026-05-25) ── */}
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

      {/* ─── Conteúdo principal ───────────────────────────── */}
      <main className="flex-1 overflow-x-hidden">
        {/* Top bar */}
        <div className="filter-bar-sticky flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
              <input
                type="text"
                placeholder="Buscar leads, deals, tarefas…"
                className="bg-sunken input-focus-glow h-10 w-72 rounded-md border border-sutil pl-9 pr-3 text-sm text-fg-primary placeholder:text-fg-muted"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="pulse-live" aria-label="Sincronizando ao vivo" />
            <span className="text-xs uppercase tracking-wider text-fg-muted">ao vivo</span>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-fg-muted">Visão geral · Maio 2026</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg-primary">Dashboard</h1>
            </div>
            <select className="bg-sunken h-9 rounded-md border border-sutil px-3 text-sm text-fg-primary">
              <option>Últimos 30 dias</option>
              <option>Últimos 7 dias</option>
              <option>Últimos 90 dias</option>
              <option>Este ano</option>
            </select>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <KPICard key={kpi.label} {...kpi} />
            ))}
          </div>

          {/* Funil + Performers */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Funnel */}
            <div className="card-default lg:col-span-2 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-fg-primary">Funil de Vendas — Atacado</h3>
                <button className="text-xs font-medium text-brand-gold hover:underline">
                  Ver Varejo →
                </button>
              </div>
              <div className="space-y-3">
                {funnel.map((stage) => {
                  const widthPct = (stage.count / maxFunnel) * 100
                  return (
                    <div key={stage.stage}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className={['rounded-full px-2 py-0.5 text-xs font-medium', stage.chip].join(' ')}>
                          {stage.stage}
                        </span>
                        <span className="text-fg-muted">
                          <strong className="font-kpi text-fg-primary">{stage.count}</strong>
                          {' · '}
                          <span className="font-kpi">{stage.value}</span>
                        </span>
                      </div>
                      <div className="bg-sunken h-2 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-brand-gold/70 transition-all"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-sutil pt-4 text-center">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-fg-muted">Lead → Ganho</div>
                  <div className="font-kpi mt-1 text-lg font-semibold text-metric-positive">18,3%</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-fg-muted">Ticket Médio</div>
                  <div className="font-kpi mt-1 text-lg font-semibold text-fg-primary">R$ 11.055</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-fg-muted">Ciclo Médio</div>
                  <div className="font-kpi mt-1 text-lg font-semibold text-fg-primary">14 dias</div>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="card-default p-5">
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-brand-gold" />
                <h3 className="font-semibold text-fg-primary">Top Performers</h3>
              </div>
              <div className="space-y-4">
                {topPerformers.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="font-kpi w-4 text-xs font-semibold text-fg-muted">#{i + 1}</div>
                    <span className="brand-tm-avatar" style={{ width: 36, height: 36, fontSize: 12 }}>
                      {p.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-fg-primary">{p.name}</div>
                      <div className="text-xs text-fg-muted">{p.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-kpi text-sm font-semibold text-brand-gold">
                        R$ {(p.value / 1000).toFixed(1)}k
                      </div>
                      <div className="font-kpi text-xs text-fg-muted">{p.deals} deals</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overdue Activities */}
          <div className="card-feature p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-brand-gold" />
                <h3 className="font-semibold text-fg-primary">Atividades Atrasadas</h3>
                <span className="tag-pill-warm font-kpi">{overdue.length}</span>
              </div>
              <button className="text-xs font-medium text-brand-gold hover:underline">Ver todas →</button>
            </div>
            <div className="space-y-2">
              {overdue.map((task, i) => (
                <div
                  key={i}
                  className="bg-sunken flex items-center gap-3 rounded-lg border border-sutil p-3"
                >
                  <Clock className="h-4 w-4 flex-shrink-0 text-brand-gold" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-fg-primary">
                      {task.task}
                      {task.mandatory && (
                        <span className="rounded bg-metric-negative-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-metric-negative">
                          Obrigatória
                        </span>
                      )}
                    </div>
                    <div className="font-kpi text-xs text-fg-muted">
                      {task.assignee} · {task.days} dia{task.days > 1 ? 's' : ''} de atraso
                    </div>
                  </div>
                  <button className="rounded border border-sutil bg-elevated px-3 py-1 text-xs font-medium text-fg-primary hover:border-gold-soft hover:text-brand-gold">
                    Ver
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAB gold */}
        <button type="button" className="fab-gold" aria-label="Criar novo">
          <Plus className="h-6 w-6" />
        </button>
      </main>
    </div>
  )
}

function KPICard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
  icon: React.ComponentType<{ className?: string }>
  accent: 'gold' | 'sage' | 'positive' | 'negative'
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown
  const trendColor = trend === 'up' ? 'text-metric-positive' : 'text-metric-negative'
  const iconBg: Record<typeof accent, string> = {
    gold:     'bg-brand-gold/15 text-brand-gold',
    sage:     'bg-chart-primary/15 text-chart-primary',
    positive: 'bg-metric-positive-soft text-metric-positive',
    negative: 'bg-metric-negative-soft text-metric-negative',
  }

  return (
    <div className="card-interactive group p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className={['flex h-10 w-10 items-center justify-center rounded-lg', iconBg[accent]].join(' ')}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={['font-kpi flex items-center gap-0.5 text-xs font-medium', trendColor].join(' ')}>
          <TrendIcon className="h-3 w-3" /> {delta}
        </div>
      </div>
      <div className="font-kpi font-kpi-glow text-2xl font-semibold text-fg-primary">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wider text-fg-muted">{label}</div>
    </div>
  )
}
