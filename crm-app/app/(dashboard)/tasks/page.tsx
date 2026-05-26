import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, formatRelative, cn } from '@/lib/utils'
import { AlertTriangle, CheckSquare, Clock, KanbanSquare } from 'lucide-react'

export default async function TasksPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const isManager = ['admin', 'gestor'].includes(user.role)
  const now = new Date()

  const activities = await prisma.activity.findMany({
    where: {
      deletedAt: null,
      ...(isManager ? {} : { assignedTo: user.id }),
    },
    include: {
      assignee: { select: { fullName: true } },
      contact:  { select: { id: true, fullName: true } },
      deal:     { select: { id: true, title: true } },
    },
    orderBy: [{ isDone: 'asc' }, { dueDate: 'asc' }],
    take: 100,
  })

  const pending = activities.filter((a) => !a.isDone)
  const done = activities.filter((a) => a.isDone)
  const overdueCount = pending.filter((a) => a.dueDate && a.dueDate < now).length

  return (
    <div className="overflow-y-auto p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-fg-muted">
          <strong className="font-kpi text-fg-primary">{pending.length}</strong> pendentes
          {' · '}
          <strong className="font-kpi text-fg-primary">{done.length}</strong> concluídas
          {overdueCount > 0 && (
            <>
              {' · '}
              <strong className="font-kpi text-metric-negative">{overdueCount}</strong> atrasadas
            </>
          )}
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="card-default flex flex-col items-center gap-3 py-16 text-center">
          <CheckSquare className="h-12 w-12 text-fg-muted/40" />
          <p className="font-medium text-fg-primary">Nenhuma tarefa pendente</p>
          <p className="max-w-sm text-sm text-fg-muted">
            Tarefas obrigatórias do pipeline aparecem aqui quando criadas nos deals.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pending.map((activity) => {
            const overdue = activity.dueDate && activity.dueDate < now
            return (
              <div
                key={activity.id}
                className={cn(
                  'card-interactive flex items-start gap-4 p-4',
                  overdue && 'border-metric-negative/40',
                )}
              >
                <div className="mt-0.5 shrink-0">
                  {overdue ? (
                    <AlertTriangle className="h-5 w-5 text-metric-negative" />
                  ) : (
                    <Clock className="h-5 w-5 text-brand-gold" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-fg-primary">{activity.title}</span>
                    {activity.isMandatory && (
                      <span className="rounded bg-metric-negative-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-metric-negative">
                        Obrigatória
                      </span>
                    )}
                    {overdue && (
                      <span className="tag-pill-warm font-kpi text-[10px]">Atrasada</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-fg-muted">
                    {activity.contact?.fullName && (
                      <span>Contato: {activity.contact.fullName}</span>
                    )}
                    {activity.deal?.title && (
                      <span>
                        {activity.contact ? ' · ' : ''}
                        Deal: {activity.deal.title}
                      </span>
                    )}
                    {isManager && activity.assignee && (
                      <span> · {activity.assignee.fullName}</span>
                    )}
                  </p>
                  {activity.dueDate && (
                    <p className="font-kpi mt-1 text-xs text-fg-muted">
                      Prazo: {formatDate(activity.dueDate)}
                      {overdue && (
                        <span className="text-metric-negative">
                          {' '}
                          · {formatRelative(activity.dueDate)}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                {activity.dealId && (
                  <Link
                    href="/pipeline"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-sutil bg-elevated px-3 py-1.5 text-sm text-fg-secondary transition-colors hover:border-gold-soft hover:text-brand-gold"
                  >
                    <KanbanSquare className="h-4 w-4" />
                    Ver deal
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}

      {done.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-fg-muted">
            Concluídas recentemente
          </h2>
          <div className="space-y-2 opacity-80">
            {done.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="bg-sunken rounded-lg border border-sutil p-3 text-sm"
              >
                <span className="text-fg-muted line-through">{activity.title}</span>
                {activity.doneAt && (
                  <span className="font-kpi ml-2 text-xs text-fg-muted">
                    — {formatDate(activity.doneAt)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
