import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { contactsWhereClause } from '@/lib/permissions'
import { NewDealForm } from '@/components/forms/NewDealForm'

export default async function NewDealPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const [contacts, pipelines] = await Promise.all([
    prisma.contact.findMany({
      where:  contactsWhereClause(user),
      select: { id: true, fullName: true, companyName: true },
      orderBy: { fullName: 'asc' },
      take: 200,
    }),
    prisma.pipeline.findMany({
      include: {
        stages: { orderBy: { position: 'asc' }, select: { id: true, name: true, position: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="overflow-y-auto p-6">
      <NewDealForm contacts={contacts} pipelines={pipelines} />
    </div>
  )
}
