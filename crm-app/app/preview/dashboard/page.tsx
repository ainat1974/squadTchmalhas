import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  AlertTriangle,
  Trophy,
  Clock,
} from 'lucide-react'

const kpis = [
  { label: 'Receita do Mês', value: 'R$ 287.450', delta: '+18%', trend: 'up' as const, icon: DollarSign, color: 'emerald' },
  { label: 'Novos Leads', value: '142', delta: '+24%', trend: 'up' as const, icon: Users, color: 'blue' },
  { label: 'Taxa de Conversão', value: '18,2%', delta: '+3,1pp', trend: 'up' as const, icon: Target, color: 'orange' },
  { label: 'Atividades Atrasadas', value: '7', delta: '-12%', trend: 'down' as const, icon: AlertTriangle, color: 'amber' },
]

const funnel = [
  { stage: 'Novo Lead', count: 142, value: 'R$ 285.000', color: 'bg-slate-200', textColor: 'text-slate-700' },
  { stage: 'Contato Inicial', count: 89, value: 'R$ 234.500', color: 'bg-blue-200', textColor: 'text-blue-900' },
  { stage: 'Proposta Enviada', count: 52, value: 'R$ 189.200', color: 'bg-amber-200', textColor: 'text-amber-900' },
  { stage: 'Negociação', count: 31, value: 'R$ 124.800', color: 'bg-orange-200', textColor: 'text-orange-900' },
  { stage: 'Ganho', count: 26, value: 'R$ 287.450', color: 'bg-emerald-300', textColor: 'text-emerald-900' },
]

const topPerformers = [
  { name: 'Vitor Vendas', role: 'Vendedor Atacado', deals: 18, value: 156800, color: 'bg-blue-500' },
  { name: 'Amanda Atende', role: 'Atendente Varejo', deals: 31, value: 89200, color: 'bg-orange-500' },
  { name: 'Renato Gestão', role: 'Gestor', deals: 12, value: 41450, color: 'bg-purple-500' },
]

const overdue = [
  { task: 'Enviar proposta - Magazine Anjo', assignee: 'Vitor', days: 3, mandatory: true },
  { task: 'Ligar de retorno - SP Mais Atacado', assignee: 'Amanda', days: 2, mandatory: true },
  { task: 'Confirmar dados - Distribuidora MS', assignee: 'Vitor', days: 1, mandatory: false },
]

export default function PreviewDashboardPage() {
  const maxFunnel = funnel[0].count
  return (
    <div className="min-h-[calc(100vh-40px)] bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-600">Visão geral · Maio 2026</p>
          </div>
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
            <option>Últimos 30 dias</option>
            <option>Últimos 7 dias</option>
            <option>Últimos 90 dias</option>
            <option>Este ano</option>
          </select>
        </div>

        {/* ─── KPIs ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* ─── Funil + Performers ──────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {/* Funnel */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Funil de Vendas — Atacado</h3>
              <button className="text-xs text-emerald-700 hover:underline">Ver Varejo →</button>
            </div>
            <div className="space-y-3">
              {funnel.map((stage) => {
                const widthPct = (stage.count / maxFunnel) * 100
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1.5 text-sm">
                      <span className={`font-medium ${stage.textColor}`}>{stage.stage}</span>
                      <span className="text-slate-600">
                        <strong className="text-slate-900">{stage.count}</strong> · {stage.value}
                      </span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${stage.color} rounded-full transition-all`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-500">Lead → Ganho</div>
                <div className="text-lg font-bold text-emerald-700">18,3%</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Ticket Médio</div>
                <div className="text-lg font-bold text-slate-900">R$ 11.055</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Ciclo Médio</div>
                <div className="text-lg font-bold text-slate-900">14 dias</div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900">Top Performers</h3>
            </div>
            <div className="space-y-4">
              {topPerformers.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <div className="text-xs font-bold text-slate-400 w-4">#{i + 1}</div>
                  <div className={`w-9 h-9 rounded-full ${p.color} text-white font-bold text-sm flex items-center justify-center`}>
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900 truncate">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-emerald-700">
                      R$ {(p.value / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-slate-500">{p.deals} deals</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Overdue Activities ───────────────────────────── */}
        <div className="bg-white rounded-xl border border-amber-200 border-l-4 border-l-amber-500 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-slate-900">Atividades Atrasadas</h3>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium">
                {overdue.length}
              </span>
            </div>
            <button className="text-xs text-emerald-700 hover:underline">Ver todas →</button>
          </div>
          <div className="space-y-2">
            {overdue.map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    {task.task}
                    {task.mandatory && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase tracking-wide font-bold">
                        Obrigatória
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600">
                    {task.assignee} · {task.days} dia{task.days > 1 ? 's' : ''} de atraso
                  </div>
                </div>
                <button className="text-xs text-emerald-700 hover:bg-white px-3 py-1 rounded font-medium">
                  Ver
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown
  const trendColor = trend === 'up' ? 'text-emerald-600' : 'text-red-600'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`text-xs font-medium ${trendColor} flex items-center gap-0.5`}>
          <TrendIcon className="w-3 h-3" /> {delta}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  )
}
