import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser, requireDealOwnership } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ApiError } from '@/lib/errors'
import { DealStatusActions } from '@/components/deals/DealStatusActions'
import { formatCurrency, formatDate, formatRelative } from '@/lib/utils'
import { ArrowLeft, Building2, Kanban } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_LABEL: Record<string, string> = {
  open:     'Aberto',
  won:      'Ganho',
  lost:     'Perdido',
  archived: 'Arquivado',
}

export default async function DealDetailPage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { id } = await params

  const deal = await prisma.deal.findUnique({
    where: { id, deletedAt: null },
    include: {
      contact:  true,
      stage:    true,
      pipeline: true,
      owner:    { select: { fullName: true } },
      activities: {
        where:   { deletedAt: null },
        orderBy: [{ isDone: 'asc' }, { dueDate: 'asc' }],
      },
      interactions: {
        orderBy: { createdAt: 'desc' },
        take:    40,
        include: { user: { select: { fullName: true } } },
      },
    },
  })

  if (!deal) notFound()

  try {
    requireDealOwnership(user, deal.assignedTo)
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) notFound()
    throw err
  }

  return (
    <div className="overflow-y-auto p-6">
      <Link
        href="/pipeline"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-brand-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Pipeline
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card-default p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-fg-primary">{deal.title}</h1>
                <p className="mt-1 text-sm text-fg-muted">
                  {deal.pipeline.name} · {deal.stage.name}
                </p>
              </div>
              <span className="tag-pill-warm font-kpi">{STATUS_LABEL[deal.status] ?? deal.status}</span>
            </div>

            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-fg-muted">Valor</dt>
                <dd className="font-kpi text-lg text-brand-gold">
                  {deal.value != null ? formatCurrency(Number(deal.value)) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-fg-muted">Responsável</dt>
                <dd className="text-fg-primary">{deal.owner?.fullName ?? '—'}</dd>
              </div>
              {deal.closedAt && (
                <div>
                  <dt className="text-fg-muted">Encerrado em</dt>
                  <dd>{formatDate(deal.closedAt)}</dd>
                </div>
              )}
              {deal.lostReason && (
                <div className="sm:col-span-2">
                  <dt className="text-fg-muted">Motivo da perda</dt>
                  <dd>{deal.lostReason}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 border-t border-sutil pt-6">
              <DealStatusActions dealId={deal.id} dealStatus={deal.status} />
            </div>
          </div>

          <section className="card-default p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-fg-secondary">
              Timeline
            </h2>
            <ul className="space-y-3">
              {deal.interactions.length === 0 && (
                <li className="text-sm text-fg-muted">Nenhuma interação registrada.</li>
              )}
              {deal.interactions.map((i) => (
                <li
                  key={i.id}
                  className="rounded-lg border border-sutil bg-sunken px-4 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium capitalize text-brand-gold">{i.channel}</span>
                    <span className="font-kpi text-[10px] text-fg-muted">
                      {formatRelative(i.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-fg-secondary">{i.content ?? '—'}</p>
                  {i.user && (
                    <p className="mt-1 text-xs text-fg-muted">por {i.user.fullName}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="card-default p-5">
            <h2 className="mb-3 text-sm font-semibold text-fg-primary">Contato</h2>
            <p className="font-medium">{deal.contact.fullName}</p>
            {deal.contact.companyName && (
              <p className="mt-1 flex items-center gap-1 text-sm text-fg-muted">
                <Building2 className="h-3.5 w-3.5" />
                {deal.contact.companyName}
              </p>
            )}
            <Link
              href={`/leads/${deal.contact.id}`}
              className="mt-3 inline-block text-sm text-brand-gold hover:underline"
            >
              Ver ficha do lead
            </Link>
          </div>

          <div className="card-default p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg-primary">
              <Kanban className="h-4 w-4 text-brand-gold" />
              Tarefas ({deal.activities.length})
            </h2>
            <ul className="space-y-2">
              {deal.activities.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-2 rounded-md border border-sutil px-3 py-2 text-sm"
                >
                  <span
                    className={
                      a.isDone
                        ? 'text-metric-positive'
                        : a.isMandatory
                          ? 'text-metric-negative'
                          : 'text-fg-muted'
                    }
                  >
                    {a.isDone ? '✓' : a.isMandatory ? '!' : '○'}
                  </span>
                  <div>
                    <p className={a.isDone ? 'text-fg-muted line-through' : 'text-fg-primary'}>
                      {a.title}
                    </p>
                    {a.dueDate && (
                      <p className="text-xs text-fg-muted">até {formatDate(a.dueDate)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
