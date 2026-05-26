import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ArrowLeft } from 'lucide-react'

export default async function SettingsPipelinesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const pipelines = await prisma.pipeline.findMany({
    include: {
      stages: {
        orderBy: { position: 'asc' },
        include: {
          requiredTasks: {
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="overflow-y-auto p-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-brand-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-fg-primary">Pipelines e tarefas obrigatórias</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Visualização das regras ativas. Edição completa (drag & drop) em v5.1.
        </p>
        <span className="tag-pill-warm mt-3 inline-block font-kpi">Somente leitura · Sprint Recovery</span>
      </div>

      <div className="space-y-6">
        {pipelines.map((pipeline) => (
          <section key={pipeline.id} className="card-default p-6">
            <h2 className="text-lg font-semibold capitalize text-brand-gold">{pipeline.name}</h2>
            <p className="text-xs text-fg-muted">{pipeline.type}</p>

            <ul className="mt-4 space-y-4">
              {pipeline.stages.map((stage) => (
                <li key={stage.id} className="rounded-lg border border-sutil bg-sunken p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: stage.color ?? '#C9A84C' }}
                    />
                    <span className="font-medium text-fg-primary">{stage.name}</span>
                    <span className="font-kpi text-xs text-fg-muted">pos. {stage.position}</span>
                  </div>

                  {stage.requiredTasks.length === 0 ? (
                    <p className="mt-2 text-xs text-fg-muted">Sem tarefas obrigatórias nesta etapa.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {stage.requiredTasks.map((task) => (
                        <li
                          key={task.id}
                          className="flex items-start gap-2 rounded-md border border-gold-soft/30 bg-card px-3 py-2 text-sm"
                        >
                          <span className="text-brand-gold">●</span>
                          <div>
                            <p className="font-medium text-fg-primary">{task.title}</p>
                            <p className="text-xs text-fg-muted">
                              {task.activityType} · prazo +{task.dueDaysOffset} dia(s)
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
