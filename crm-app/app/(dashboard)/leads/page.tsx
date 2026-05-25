import { prisma }         from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { redirect }       from 'next/navigation'
import { contactsWhereClause } from '@/lib/permissions'
import { LeadCard }       from '@/components/leads/LeadCard'
import { Button }         from '@/components/ui/button'
import { Input }          from '@/components/ui/input'
import Link               from 'next/link'
import { UserPlus }       from 'lucide-react'

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Leads & Contatos</h1>
          <p className="text-sm text-muted-foreground">{total} contatos encontrados</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/leads/new">
            <UserPlus className="h-4 w-4" />
            Novo Contato
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <form className="flex gap-3">
        <Input
          name="search"
          placeholder="Buscar por nome, e-mail, empresa…"
          defaultValue={search}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">Buscar</Button>
      </form>

      {/* Lista */}
      <div className="grid gap-3">
        {contacts.length === 0 ? (
          <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
            Nenhum contato encontrado.
          </div>
        ) : (
          contacts.map(contact => (
            <LeadCard key={contact.id} contact={contact} />
          ))
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/leads?page=${page - 1}${search ? `&search=${search}` : ''}`}>Anterior</Link>
            </Button>
          )}
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          {page < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/leads?page=${page + 1}${search ? `&search=${search}` : ''}`}>Próxima</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}