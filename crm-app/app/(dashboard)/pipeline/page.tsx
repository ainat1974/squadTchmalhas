import { prisma }         from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { redirect }       from 'next/navigation'
import { KanbanBoard }    from '@/components/kanban/KanbanBoard'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function PipelinePage({ searchParams }: Props) {
  const user   = await getCurrentUser()
  if (!user) redirect('/login')

  const { type } = await searchParams
  const pipelineType = (type === 'varejo' ? 'varejo' : 'atacado') as 'atacado' | 'varejo'

  // Verificar acesso ao pipeline
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

  if (!pipeline) return <div className="p-8 text-muted-foreground">Pipeline não configurado.</div>

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

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{pipeline.name}</h1>
          <p className="text-sm text-muted-foreground">
            {pipeline.stages.reduce((sum, s) => sum + s.deals.length, 0)} oportunidades abertas
          </p>
        </div>
        {showTabs && (
          <Tabs value={pipelineType}>
            <TabsList>
              <TabsTrigger value="atacado" asChild>
                <Link href="/pipeline?type=atacado">🏭 Atacado</Link>
              </TabsTrigger>
              <TabsTrigger value="varejo" asChild>
                <Link href="/pipeline?type=varejo">🛍️ Varejo</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      <KanbanBoard pipeline={pipelineForBoard} currentUser={{ id: user.id, role: user.role }} />
    </div>
  )
}