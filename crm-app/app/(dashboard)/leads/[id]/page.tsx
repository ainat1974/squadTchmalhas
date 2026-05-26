import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser, requireContactAccess } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { LeadTimeline } from '@/components/leads/LeadTimeline'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  Kanban,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { ApiError } from '@/lib/errors'
import type { DealStatus } from '@prisma/client'

interface Props {
  params: Promise<{ id: string }>
}

const DEAL_STATUS = {
  open:     { label: 'Aberto', variant: 'default' as const },
  won:      { label: 'Ganho', variant: 'secondary' as const },
  lost:     { label: 'Perdido', variant: 'destructive' as const },
  archived: { label: 'Arquivado', variant: 'outline' as const },
} satisfies Record<DealStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }>

function dealStatusInfo(status: DealStatus) {
  return DEAL_STATUS[status]
}

export default async function LeadDetailPage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { id } = await params

  const contact = await prisma.contact.findUnique({
    where: { id, deletedAt: null },
    include: {
      leadSource: true,
      owner:      { select: { id: true, fullName: true } },
      deals: {
        where:   { deletedAt: null },
        include: {
          stage:    { select: { name: true, color: true } },
          pipeline: { select: { name: true, type: true } },
          owner:    { select: { fullName: true } },
        },
        orderBy: { updatedAt: 'desc' },
      },
      activities: {
        where:   { deletedAt: null },
        orderBy: [{ isDone: 'asc' }, { dueDate: 'asc' }],
        take:    15,
      },
      interactions: {
        orderBy: { createdAt: 'desc' },
        take:    30,
        include: { user: { select: { fullName: true } } },
      },
    },
  })

  if (!contact) notFound()

  try {
    requireContactAccess(user, contact)
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      notFound()
    }
    throw err
  }

  const pendingActivities = contact.activities.filter((a) => !a.isDone)
  const now = new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href="/leads">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-brand-100 text-brand-700 text-lg font-semibold">
            {getInitials(contact.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{contact.fullName}</h1>
            <Badge variant={contact.isB2b ? 'default' : 'secondary'}>
              {contact.isB2b ? 'Atacado (B2B)' : 'Varejo (B2C)'}
            </Badge>
            {contact.lgpdConsent ? (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                LGPD ✓
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-300 text-amber-800">
                Sem consentimento LGPD
              </Badge>
            )}
          </div>
          {contact.companyName && (
            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {contact.companyName}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastrado em {formatDate(contact.createdAt)}
            {contact.leadSource && ` · Origem: ${contact.leadSource.name}`}
            {contact.owner && ` · Responsável: ${contact.owner.fullName}`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna esquerda — dados */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${contact.phone}`} className="hover:underline">{contact.phone}</a>
                </div>
              )}
              {contact.whatsappPhone && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                  <span>{contact.whatsappPhone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                </div>
              )}
              {contact.instagramUsername && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">@</span>
                  <span>{contact.instagramUsername}</span>
                </div>
              )}
              {contact.notes && (
                <div className="rounded-lg bg-secondary/50 p-3 text-muted-foreground">
                  {contact.notes}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tarefas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tarefas pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente.</p>
              ) : (
                <ul className="space-y-2">
                  {pendingActivities.map((activity) => {
                    const overdue = activity.dueDate && activity.dueDate < now
                    return (
                      <li
                        key={activity.id}
                        className="flex items-start gap-2 rounded-lg border p-2 text-sm"
                      >
                        {overdue ? (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <div>
                          <span className="font-medium">{activity.title}</span>
                          {activity.isMandatory && (
                            <Badge variant="destructive" className="ml-2 text-[10px]">
                              Obrigatória
                            </Badge>
                          )}
                          {activity.dueDate && (
                            <p className="text-xs text-muted-foreground">
                              Prazo: {formatDate(activity.dueDate)}
                            </p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
              <Button variant="link" size="sm" className="mt-2 px-0" asChild>
                <Link href="/tasks">Ver todas as tarefas</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna direita — deals + timeline */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Deals</CardTitle>
              <Button variant="outline" size="sm" asChild className="gap-1">
                <Link href={`/pipeline?type=${contact.isB2b ? 'atacado' : 'varejo'}`}>
                  <Kanban className="h-4 w-4" />
                  Ver pipeline
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {contact.deals.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum deal associado.</p>
              ) : (
                <ul className="space-y-2">
                  {contact.deals.map((deal) => {
                    const status = dealStatusInfo(deal.status)
                    return (
                      <li
                        key={deal.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{deal.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {deal.pipeline.name} · {deal.stage.name}
                            {deal.owner && ` · ${deal.owner.fullName}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-brand-600">
                            {formatCurrency(deal.value ? Number(deal.value) : null)}
                          </p>
                          <Badge variant={status.variant} className="mt-1 text-[10px]">
                            {status.label}
                          </Badge>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico de interações</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadTimeline interactions={contact.interactions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
