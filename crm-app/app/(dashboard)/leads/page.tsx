import { prisma }         from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { redirect }       from 'next/navigation'
import { contactsWhereClause } from '@/lib/permissions'
import { LeadCard }       from '@/components/leads/LeadCard'
import Link               from 'next/link'
import { UserPlus, Search } from 'lucide-react'

interface Props {
  searchParams: Promise<{ search?: string; page?: string; pipeline?: string }>
}

export default async function LeadsPage({ searchParams }: Props) {
  const user   = await getCurrentUser()
  if (!user) redirect('/login')

  const { search, page: pageStr, pipeline } = await searchParams
  const page  = Math.max(1, Number(pageStr ?? 1))
  const limit = 20

  const baseWhere = contactsWhereClause(user)
  const where = {
    ...baseWhere,
    ...(pipeline && { pipelineType: pipeline as 'atacado' | 'varejo' }),
    ...(search && {
      OR: [
        { fullName:    { contains: search, mode: 'insensitive' as const } },
        { email:       { contains: search, mode: 'insensitive' as const } },
        { companyName: { contains: search, mode: 'insensitive' as const } },
        { phone:       { contains: search } },
      ],
    }),
  }

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        leadSource: true,
        owner:      { select: { id: true, fullName: true } },
        deals:      { where: { deletedAt: null, status: 'open' }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take:    limit,
      skip:    (page - 1) * limit,
    }),
    prisma.contact.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)
  const searchQs = (p: number) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (pipeline) params.set('pipeline', pipeline)
    params.set('page', String(p))
    return `/leads?${params.toString()}`
  }

  return (
    <div className="overflow-y-auto p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-fg-muted">
          <strong className="font-kpi text-fg-primary">{total}</strong> contatos encontrados
        </p>
        <Link
          href="/leads/new"
          className="btn-primary-premium inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
        >
          <UserPlus className="h-4 w-4" />
          Novo Contato
        </Link>
      </div>

      <form className="mb-6 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            name="search"
            placeholder="Buscar por nome, e-mail, empresa…"
            defaultValue={search}
            className="bg-sunken input-focus-glow h-10 w-full rounded-md border border-sutil pl-9 pr-3 text-sm text-fg-primary placeholder:text-fg-muted"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-sutil bg-elevated px-4 py-2 text-sm font-medium text-fg-secondary transition-colors hover:border-gold-soft hover:text-brand-gold"
        >
          Buscar
        </button>
      </form>

      <div className="grid gap-3">
        {contacts.length === 0 ? (
          <div className="card-default flex flex-col items-center gap-2 py-16 text-center">
            <p className="text-sm font-medium text-fg-muted">Nenhum contato encontrado</p>
            <p className="text-xs text-fg-muted">Ajuste os filtros ou cadastre um novo contato.</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <LeadCard key={contact.id} contact={contact} />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={searchQs(page - 1)}
              className="rounded-md border border-sutil bg-elevated px-3 py-1.5 text-sm text-fg-secondary hover:border-gold-soft hover:text-brand-gold"
            >
              Anterior
            </Link>
          )}
          <span className="font-kpi text-sm text-fg-muted">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={searchQs(page + 1)}
              className="rounded-md border border-sutil bg-elevated px-3 py-1.5 text-sm text-fg-secondary hover:border-gold-soft hover:text-brand-gold"
            >
              Próxima
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
