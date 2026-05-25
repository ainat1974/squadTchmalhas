import { getCurrentUser } from '@/lib/auth'
import { redirect }       from 'next/navigation'
import { prisma }         from '@/lib/db'
import { KPICard }        from '@/components/dashboard/KPICard'
import { OverduePanel }   from '@/components/dashboard/OverduePanel'
import { FunnelChart }    from '@/components/dashboard/FunnelChart'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const now      = new Date()
  const start30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const targetFilter = ['admin', 'gestor'].includes(user.role)
    ? {}
    : { assignedTo: user.id }

  const [wonDeals, totalDeals, newLeads, activitiesOverdue, pipelineStages] = await Promise.all([
    prisma.deal.findMany({
      where:  { ...targetFilter, status: 'won', closedAt: { gte: start30d } },
      select: { value: true },
    }),
    prisma.deal.count({ where: { ...targetFilter, status: 'open', deletedAt: null } }),
    prisma.contact.count({ where: { ...targetFilter, createdAt: { gte: start30d }, deletedAt: null } }),
    prisma.activity.count({
      where: { assignedTo: user.id, isDone: false, dueDate: { lt: now }, deletedAt: null },
    }),
    prisma.stage.findMany({
      where:   {
        pipeline: {
          type: user.role === 'atendente_varejo' ? 'varejo' : 'atacado',
        },
      },
      include: {
        _count: {
          select: { deals: { where: { ...targetFilter, status: 'open', deletedAt: null } } },
        },
      },
      orderBy: { position: 'asc' },
    }),
  ])

  const totalRevenue    = wonDeals.reduce((sum, d) => sum + Number(d.value ?? 0), 0)
  const conversionRate  = totalDeals > 0 ? (wonDeals.length / (totalDeals + wonDeals.length)) * 100 : 0

  const overdueActivities = await prisma.activity.findMany({
    where:   { assignedTo: user.id, isDone: false, dueDate: { lt: now }, deletedAt: null },
    include: { deal: { select: { id: true, title: true } }, contact: { select: { id: true, fullName: true } } },
    orderBy: { dueDate: 'asc' },
    take:    10,
  })

  return (
    <div className="overflow-y-auto p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Receita (30d)"
          value={formatCurrency(totalRevenue)}
          icon="💰"
          trend={wonDeals.length > 0 ? 'up' : 'neutral'}
          accent="gold"
        />
        <KPICard
          title="Deals Abertos"
          value={totalDeals.toString()}
          icon="📋"
          accent="sage"
        />
        <KPICard
          title="Novos Leads (30d)"
          value={newLeads.toString()}
          icon="👤"
          trend="up"
          accent="sage"
        />
        <KPICard
          title="Taxa de Conversão"
          value={`${conversionRate.toFixed(1)}%`}
          icon="🎯"
          trend={conversionRate >= 30 ? 'up' : 'down'}
          accent={conversionRate >= 30 ? 'positive' : 'negative'}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <FunnelChart stages={pipelineStages.map(s => ({
          name:  s.name,
          color: s.color,
          count: s._count.deals,
        }))} />

        <OverduePanel
          activities={overdueActivities.map(a => ({
            id:          a.id,
            title:       a.title,
            type:        a.type,
            dueDate:     a.dueDate?.toISOString() ?? '',
            isMandatory: a.isMandatory,
            dealTitle:   a.deal?.title ?? null,
            contactName: a.contact?.fullName ?? null,
          }))}
          total={activitiesOverdue}
        />
      </div>
    </div>
  )
}
