'use client'
import { useState } from 'react'
import {
  Search,
  Plus,
  Filter,
  AlertTriangle,
  MessageSquare,
  Phone,
  Calendar,
  ChevronDown,
} from 'lucide-react'

type Deal = {
  id: string
  title: string
  company: string
  value: number
  owner: string
  ownerColor: string
  daysInStage: number
  hasOverdueTask?: boolean
  pendingTask?: string
  channel?: 'whatsapp' | 'instagram' | 'webchat'
}

const stagesAtacado: { id: string; label: string; color: string; deals: Deal[] }[] = [
  {
    id: 'novo',
    label: 'Novo Lead',
    color: 'bg-slate-100 border-slate-300',
    deals: [
      { id: '1', title: 'Pedido 50 camisetas básicas', company: 'Loja Sul Boutique', value: 2450, owner: 'V', ownerColor: 'bg-blue-500', daysInStage: 2, channel: 'whatsapp' },
      { id: '2', title: 'Avaliação Polo Masculina', company: 'Moda da Mile', value: 5890, owner: 'V', ownerColor: 'bg-blue-500', daysInStage: 1, channel: 'instagram' },
      { id: '3', title: 'Catálogo Coleção Copa 2026', company: 'Esporte Total SP', value: 8900, owner: 'A', ownerColor: 'bg-orange-500', daysInStage: 3 },
    ],
  },
  {
    id: 'contato',
    label: 'Contato Inicial',
    color: 'bg-blue-50 border-blue-200',
    deals: [
      { id: '4', title: 'Pedido camisetas Dryfit', company: 'Magazine Anjo', value: 12500, owner: 'V', ownerColor: 'bg-blue-500', daysInStage: 5, hasOverdueTask: true, pendingTask: 'Enviar proposta por WhatsApp' },
      { id: '5', title: 'Avaliação revenda', company: 'Boutique Glow', value: 8200, owner: 'V', ownerColor: 'bg-blue-500', daysInStage: 4 },
    ],
  },
  {
    id: 'proposta',
    label: 'Proposta Enviada',
    color: 'bg-amber-50 border-amber-200',
    deals: [
      { id: '6', title: 'Kit 100 Polo Masculina', company: 'SP Mais Atacado', value: 45200, owner: 'A', ownerColor: 'bg-orange-500', daysInStage: 7, hasOverdueTask: true, pendingTask: 'Ligar de retorno' },
    ],
  },
  {
    id: 'negociacao',
    label: 'Negociação',
    color: 'bg-orange-50 border-orange-200',
    deals: [
      { id: '7', title: 'Contrato anual revenda', company: 'Distribuidora MS', value: 89500, owner: 'V', ownerColor: 'bg-blue-500', daysInStage: 10 },
    ],
  },
  {
    id: 'ganho',
    label: 'Ganho',
    color: 'bg-emerald-100 border-emerald-300',
    deals: [
      { id: '8', title: 'Pedido 200 camisetas', company: 'Loja Verão SP', value: 9800, owner: 'A', ownerColor: 'bg-orange-500', daysInStage: 1 },
      { id: '9', title: 'Coleção Copa 2026 50un', company: 'Esporte Cidade', value: 4200, owner: 'V', ownerColor: 'bg-blue-500', daysInStage: 2 },
    ],
  },
]

export default function PreviewKanbanPage() {
  const [pipelineType, setPipelineType] = useState<'atacado' | 'varejo'>('atacado')
  const totalDeals = stagesAtacado.reduce((s, stage) => s + stage.deals.length, 0)
  const totalValue = stagesAtacado.flatMap((s) => s.deals).reduce((s, d) => s + d.value, 0)

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">T</div>
            <h1 className="font-bold text-slate-900">Pipeline</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-sm text-slate-600 hover:text-emerald-700 flex items-center gap-1">
              <Filter className="w-4 h-4" /> Filtros
            </button>
            <button className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium px-4 py-1.5 rounded-lg flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Novo Deal
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              {(['atacado', 'varejo'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPipelineType(t)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    pipelineType === t
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t === 'atacado' ? '🏢 Atacado' : '🛍️ Varejo'}
                </button>
              ))}
            </div>
            <button className="text-sm text-slate-600 flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">
              Meus deals <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-slate-600">
              <strong className="text-slate-900">{totalDeals}</strong> deals
            </div>
            <div className="text-slate-600">
              Total: <strong className="text-emerald-700">
                {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                placeholder="Buscar..."
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Kanban ──────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto bg-slate-50 p-4">
        <div className="flex gap-3 min-w-max h-full">
          {stagesAtacado.map((stage) => (
            <div key={stage.id} className="w-72 flex-shrink-0 flex flex-col">
              <div className={`${stage.color} border rounded-t-lg p-3 flex items-center justify-between`}>
                <div className="font-semibold text-sm text-slate-800">{stage.label}</div>
                <div className="text-xs bg-white/60 px-2 py-0.5 rounded-full font-medium text-slate-700">
                  {stage.deals.length}
                </div>
              </div>
              <div className="flex-1 bg-slate-100/60 p-2 space-y-2 rounded-b-lg overflow-y-auto">
                {stage.deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
                <button className="w-full py-2 text-xs text-slate-500 hover:bg-white rounded-lg flex items-center justify-center gap-1 border border-dashed border-slate-300">
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DealCard({ deal }: { deal: Deal }) {
  const channels = {
    whatsapp: { icon: MessageSquare, color: 'text-green-600' },
    instagram: { icon: MessageSquare, color: 'text-pink-600' },
    webchat: { icon: MessageSquare, color: 'text-blue-600' },
  }
  return (
    <div className={`bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow cursor-grab ${
      deal.hasOverdueTask ? 'border-amber-300' : 'border-slate-200'
    }`}>
      <div className="flex items-start justify-between mb-1.5">
        <div className="font-medium text-sm text-slate-900 leading-tight">{deal.title}</div>
        {deal.hasOverdueTask && (
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 ml-1" />
        )}
      </div>
      <div className="text-xs text-slate-500 mb-2">{deal.company}</div>

      {deal.pendingTask && (
        <div className="mb-2 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[10px] text-amber-900 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          <span className="font-medium">Obrigatória:</span> {deal.pendingTask}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-emerald-700">
          {deal.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
        <div className="flex items-center gap-1.5">
          {deal.channel && (() => {
            const Ch = channels[deal.channel].icon
            return <Ch className={`w-3 h-3 ${channels[deal.channel].color}`} />
          })()}
          <div className={`w-5 h-5 rounded-full ${deal.ownerColor} text-white text-[10px] font-bold flex items-center justify-center`}>
            {deal.owner}
          </div>
        </div>
      </div>
      <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
        <Calendar className="w-2.5 h-2.5" />
        {deal.daysInStage}d nesta etapa
      </div>
    </div>
  )
}
