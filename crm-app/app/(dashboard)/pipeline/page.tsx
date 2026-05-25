import { prisma }         from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { redirect }       from 'next/navigation'
import { KanbanBoard }    from '@/components/kanban/KanbanBoard'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function PipelinePage({ searchParams }: Props) {
  const user   = await getCurrentUser()
  if (!user) redirect('/login')

  const { type } = await searchParams
  const pipelineType = (type === 'varejo' ? 'varejo' : 'atacado') as 'atacado' | 'varejo'

  if (user.role === 'vendedor_atacado' && pipelineType === 'varejo') redirect('/pipeline?type=atacado')
  if (user.role === 'atendente_varejo' && pipelineType === 'atacado') redirect('/pipeline?type=varejo')

  const pipeline = await prisma.pipeline.findFirst({
    where:   { type: pipelineType },
    include: {
      stages: {
        orderBy: { position: 'asc' },
        include: {
          deals: {
            where: {
              deletedAt: null,
              status:    'open',
              ...(['vendedor_atacado', 'atendente_varejo'].includes(user.role)
                ? { assignedTo: user.id }
                : {}),
            },
            include: {
              contact:    { select: { id: true, fullName: true, companyName: true, avatarUrl: true } },
              owner:      { select: { id: true, fullName: true } },
              activities: { where: { isMandatory: true, isDone: false, deletedAt: null } },
            },
            orderBy: { updatedAt: 'desc' },
          },
        },
      },
    },
  })

  if (!pipeline) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-fg-muted">
        Pipeline não configurado.
      </div>
    )
  }

  const pipelineForBoard = {
    id:     pipeline.id,
    name:   pipeline.name,
    type:   pipeline.type,
    stages: pipeline.stages.map((stage) => ({
      id:          stage.id,
      name:        stage.name,
      color:       stage.color,
      probability: stage.probability,
      isWonStage:  stage.isWonStage,
      isLostStage: stage.isLostStage,
      deals:       stage.deals.map((deal) => ({
        id:         deal.id,
        title:      deal.title,
        value:      deal.value != null ? Number(deal.value) : null,
        stageId:    deal.stageId,
        contact:    deal.contact,
        owner:      deal.owner,
        activities: deal.activities.map((a) => ({
          id:      a.id,
          title:   a.title,
          dueDate: a.dueDate?.toISOString() ?? null,
        })),
      })),
    })),
  }

  const showTabs = ['admin', 'gestor'].includes(user.role)
  const totalDeals = pipeline.stages.reduce((sum, s) => sum + s.deals.length, 0)
  const totalValue = pipeline.stages
    .flatMap((s) => s.deals)
    .reduce((sum, d) => sum + Number(d.value ?? 0), 0)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sutil bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          {showTabs && (
            <div className="bg-sunken flex rounded-lg border border-sutil p-0.5">
              {(['atacado', 'varejo'] as const).map((t) => (
                <Link
                  key={t}
                  href={`/pipeline?type=${t}`}
                  className={[
                    'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                    pipelineType === t
                      ? 'bg-brand-gold/15 text-brand-gold'
                      : 'text-fg-muted hover:text-fg-primary',
                  ].join(' ')}
                >
                  {t === 'atacado' ? 'Atacado' : 'Varejo'}
                </Link>
              ))}
            </div>
          )}
          <span className="text-sm text-fg-muted">
            <strong className="font-kpi text-fg-primary">{totalDeals}</strong> oportunidades
          </span>
        </div>
        <div className="text-sm text-fg-muted">
          Total:{' '}
          <strong className="font-kpi text-brand-gold">{formatCurrency(totalValue)}</strong>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-4">
        <KanbanBoard pipeline={pipelineForBoard} currentUser={{ id: user.id, role: user.role }} />
      </div>
    </div>
  )
}
