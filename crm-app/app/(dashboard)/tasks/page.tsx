import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckSquare, Clock } from 'lucide-react'

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tarefas & Atividades</h1>
        <p className="text-sm text-muted-foreground">
          {pending.length} pendentes · {done.length} concluídas
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <CheckSquare className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="font-medium text-muted-foreground">Nenhuma tarefa pendente</p>
          <p className="mt-1 text-sm text-muted-foreground">
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
                  'flex items-start gap-4 rounded-lg border bg-card p-4',
                  overdue && 'border-amber-300 bg-amber-50/50',
                )}
              >
                <div className="mt-0.5">
                  {overdue ? (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{activity.title}</span>
                    {activity.isMandatory && (
                      <Badge variant="destructive" className="text-[10px]">
                        Obrigatória
                      </Badge>
                    )}
                    {overdue && (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px]">
                        Atrasada
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
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
                    <p className="mt-1 text-xs text-muted-foreground">
                      Prazo: {formatDate(activity.dueDate)}
                    </p>
                  )}
                </div>
                {activity.dealId && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/pipeline`}>Ver deal</Link>
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-muted-foreground">Concluídas recentemente</h2>
          <div className="space-y-2 opacity-70">
            {done.slice(0, 10).map((activity) => (
              <div key={activity.id} className="rounded-lg border bg-card p-3 text-sm">
                <span className="line-through">{activity.title}</span>
                {activity.doneAt && (
                  <span className="ml-2 text-xs text-muted-foreground">
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
