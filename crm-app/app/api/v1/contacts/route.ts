import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { contactsWhereClause } from '@/lib/permissions'
import { handleApiError } from '@/lib/errors'
import { logAudit } from '@/lib/audit'
import { CreateContactSchema, ListContactsSchema } from '@/lib/validators/contact'
import type { LeadSourceType } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const user   = await requireAuth()
    const params = ListContactsSchema.parse(Object.fromEntries(req.nextUrl.searchParams))

    const baseWhere = contactsWhereClause(user)
    const where = {
      ...baseWhere,
      ...(params.isB2b !== undefined && { isB2b: params.isB2b }),
      ...(params.pipeline && { pipelineType: params.pipeline }),
      ...(params.source && { leadSource: { type: params.source as LeadSourceType } }),
      ...(params.search && {
        OR: [
          { fullName:    { contains: params.search, mode: 'insensitive' as const } },
          { email:       { contains: params.search, mode: 'insensitive' as const } },
          { phone:       { contains: params.search } },
          { companyName: { contains: params.search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: { leadSource: true, owner: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take:    params.limit,
        skip:    (params.page - 1) * params.limit,
      }),
      prisma.contact.count({ where }),
    ])

    return NextResponse.json({
      data: items,
      meta: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user  = await requireAuth()
    const input = CreateContactSchema.parse(await req.json())

    const contact = await prisma.contact.create({
      data: {
        ...input,
        assignedTo:   user.id,
        lgpdConsentAt: input.lgpdConsent ? new Date() : undefined,
      },
      include: { leadSource: true },
    })

    await logAudit({ user, action: 'CREATE', tableName: 'contacts', recordId: contact.id })

    return NextResponse.json({ data: contact }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}