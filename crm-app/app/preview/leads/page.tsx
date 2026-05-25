'use client'
import { useState } from 'react'
import { Search, Plus, Filter, MessageSquare, Phone, Mail, Building2, MapPin, MoreVertical } from 'lucide-react'

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
  ownerColor: string
  lgpdConsent: boolean
  tag?: string
  totalValue: number
  lastInteraction: string
}

const leads: Lead[] = [
  { id: '1', name: 'José Silva', company: 'Loja Sul Boutique', email: 'jose@lojasul.com.br', phone: '(11) 99876-5432', whatsapp: '(11) 99876-5432', type: 'atacado', city: 'São Paulo', state: 'SP', source: 'whatsapp', ownerName: 'Vitor', ownerColor: 'bg-blue-500', lgpdConsent: true, tag: 'VIP', totalValue: 24580, lastInteraction: 'há 2 dias' },
  { id: '2', name: 'Maria Souza', company: 'Moda da Mile', email: 'maria@modadamile.com', phone: '(31) 98765-4321', whatsapp: '(31) 98765-4321', type: 'atacado', city: 'Belo Horizonte', state: 'MG', source: 'instagram', ownerName: 'Vitor', ownerColor: 'bg-blue-500', lgpdConsent: true, totalValue: 5890, lastInteraction: 'hoje' },
  { id: '3', name: 'Pedro Costa', phone: '(11) 91234-5678', whatsapp: '(11) 91234-5678', type: 'varejo', city: 'Guarulhos', state: 'SP', source: 'whatsapp', ownerName: 'Amanda', ownerColor: 'bg-orange-500', lgpdConsent: true, totalValue: 245, lastInteraction: 'há 1 hora' },
  { id: '4', name: 'Ana Paula Lima', email: 'anapaula@gmail.com', phone: '(85) 99999-1111', whatsapp: '(85) 99999-1111', type: 'varejo', city: 'Fortaleza', state: 'CE', source: 'site', ownerName: 'Amanda', ownerColor: 'bg-orange-500', lgpdConsent: false, totalValue: 0, lastInteraction: 'há 5 dias' },
  { id: '5', name: 'Carlos Mendes', company: 'Esporte Total SP', email: 'carlos@esportetotal.com.br', phone: '(11) 98888-2222', whatsapp: '(11) 98888-2222', type: 'atacado', city: 'São Paulo', state: 'SP', source: 'indicacao', ownerName: 'Vitor', ownerColor: 'bg-blue-500', lgpdConsent: true, tag: 'Negociação', totalValue: 89500, lastInteraction: 'há 3 dias' },
  { id: '6', name: 'Juliana Ferreira', phone: '(21) 97777-3333', whatsapp: '(21) 97777-3333', type: 'varejo', city: 'Rio de Janeiro', state: 'RJ', source: 'whatsapp', ownerName: 'Amanda', ownerColor: 'bg-orange-500', lgpdConsent: true, totalValue: 580, lastInteraction: 'ontem' },
  { id: '7', name: 'Roberto Almeida', company: 'Magazine Anjo', email: 'roberto@magazineanjo.com.br', phone: '(41) 96666-4444', whatsapp: '(41) 96666-4444', type: 'atacado', city: 'Curitiba', state: 'PR', source: 'webchat', ownerName: 'Vitor', ownerColor: 'bg-blue-500', lgpdConsent: true, totalValue: 12500, lastInteraction: 'há 4 dias' },
  { id: '8', name: 'Patrícia Rocha', email: 'patricia@gmail.com', phone: '(11) 95555-5555', whatsapp: '(11) 95555-5555', type: 'varejo', city: 'São Paulo', state: 'SP', source: 'instagram', ownerName: 'Amanda', ownerColor: 'bg-orange-500', lgpdConsent: true, totalValue: 320, lastInteraction: 'há 1 semana' },
]

const sourceColors = {
  whatsapp: 'bg-green-100 text-green-800',
  instagram: 'bg-pink-100 text-pink-800',
  webchat: 'bg-blue-100 text-blue-800',
  site: 'bg-purple-100 text-purple-800',
  indicacao: 'bg-amber-100 text-amber-800',
}

const sourceLabels = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  webchat: 'Webchat',
  site: 'Site',
  indicacao: 'Indicação',
}

export default function PreviewLeadsPage() {
  const [filter, setFilter] = useState<'todos' | 'atacado' | 'varejo'>('todos')
  const filtered = leads.filter((l) => filter === 'todos' || l.type === filter)

  return (
    <div className="min-h-[calc(100vh-40px)] bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leads & Contatos</h1>
            <p className="text-sm text-slate-600">{filtered.length} contatos · {leads.filter((l) => l.lgpdConsent).length} com consentimento LGPD</p>
          </div>
          <button className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Novo Contato
          </button>
        </div>

        {/* ─── Toolbar ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex items-center gap-3 flex-wrap">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {(['todos', 'atacado', 'varejo'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                  filter === f
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f === 'todos' ? '👥 Todos' : f === 'atacado' ? '🏢 Atacado' : '🛍️ Varejo'}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Buscar por nome, e-mail, telefone, empresa..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button className="text-sm text-slate-600 hover:text-emerald-700 flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>

        {/* ─── Table ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Contato</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Origem</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Cidade</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Responsável</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Última interação</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {lead.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 text-sm flex items-center gap-2">
                          {lead.name}
                          {lead.tag && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                              {lead.tag}
                            </span>
                          )}
                          {!lead.lgpdConsent && (
                            <span title="Sem consentimento LGPD" className="text-amber-600">⚠️</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 truncate flex items-center gap-2">
                          {lead.company ? (
                            <><Building2 className="w-3 h-3" /> {lead.company}</>
                          ) : (
                            <><Phone className="w-3 h-3" /> {lead.phone}</>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${sourceColors[lead.source]}`}>
                      {sourceLabels[lead.source]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {lead.city}/{lead.state}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${lead.ownerColor} text-white text-[10px] font-bold flex items-center justify-center`}>
                        {lead.ownerName[0]}
                      </div>
                      <span className="text-sm text-slate-700">{lead.ownerName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-semibold text-emerald-700">
                      {lead.totalValue > 0
                        ? lead.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500">{lead.lastInteraction}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-slate-200 rounded">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
