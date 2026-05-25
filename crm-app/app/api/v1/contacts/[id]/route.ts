import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireContactAccess } from '@/lib/auth'
import { handleApiError, Errors } from '@/lib/errors'
import { logAudit } from '@/lib/audit'
import { UpdateContactSchema } from '@/lib/validators/contact'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user   = await requireAuth()
    const { id } = await params

    const contact = await prisma.contact.findUnique({
      where:   { id, deletedAt: null },
      include: { leadSource: true, owner: true, deals: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } } },
    })
    if (!contact) throw Errors.NOT_FOUND('Contato')
    requireContactAccess(user, contact)

    return NextResponse.json({ data: contact })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user   = await requireAuth()
    const { id } = await params
    const input  = UpdateContactSchema.parse(await req.json())

    const existing = await prisma.contact.findUnique({ where: { id, deletedAt: null } })
    if (!existing) throw Errors.NOT_FOUND('Contato')
    requireContactAccess(user, existing)

    const updated = await prisma.contact.update({
      where: { id },
      data:  input,
    })

    await logAudit({
      user,
      action:        'UPDATE',
      tableName:     'contacts',
      recordId:      id,
      changedFields: Object.keys(input),
      oldValues:     Object.fromEntries(
        Object.keys(input).map(k => [k, (existing as Record<string, unknown>)[k]])
      ),
    })

    return NextResponse.json({ data: updated })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user   = await requireAuth()
    const { id } = await params

    const existing = await prisma.contact.findUnique({ where: { id, deletedAt: null } })
    if (!existing) throw Errors.NOT_FOUND('Contato')
    requireContactAccess(user, existing)

    // Soft delete (LGPD — dados preservados para audit)
    await prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } })
    await logAudit({ user, action: 'DELETE', tableName: 'contacts', recordId: id })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}