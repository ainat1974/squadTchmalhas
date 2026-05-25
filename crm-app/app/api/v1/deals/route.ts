import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { dealsWhereClause } from '@/lib/permissions'
import { handleApiError } from '@/lib/errors'
import { logAudit } from '@/lib/audit'
import { CreateDealSchema, ListDealsSchema } from '@/lib/validators/deal'

export async function GET(req: NextRequest) {
  try {
    const user   = await requireAuth()
    const params = ListDealsSchema.parse(Object.fromEntries(req.nextUrl.searchParams))

    const baseWhere = dealsWhereClause(user)
    const where = {
      ...baseWhere,
      ...(params.pipelineId && { pipelineId: params.pipelineId }),
      ...(params.stageId    && { stageId: params.stageId }),
      ...(params.status     && { status: params.status }),
      ...(params.assignedTo && { assignedTo: params.assignedTo }),
      ...(params.search     && {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' as const } },
          { contact: { fullName: { contains: params.search, mode: 'insensitive' as const } } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          contact:  { select: { id: true, fullName: true, phone: true, companyName: true } },
          stage:    { select: { id: true, name: true, color: true, probability: true } },
          pipeline: { select: { id: true, name: true, type: true } },
          owner:    { select: { id: true, fullName: true } },
          activities: {
            where:   { isDone: false, isMandatory: true, deletedAt: null },
            select:  { id: true, title: true, dueDate: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take:    params.limit,
        skip:    (params.page - 1) * params.limit,
      }),
      prisma.deal.count({ where }),
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
    const input = CreateDealSchema.parse(await req.json())

    // Verificar acesso ao pipeline
    const pipeline = await prisma.pipeline.findUnique({ where: { id: input.pipelineId } })
    if (!pipeline) throw { status: 422, code: 'INVALID_PIPELINE', message: 'Pipeline não encontrado' }

    const deal = await prisma.deal.create({
      data: {
        ...input,
        value:     input.value,
        assignedTo: user.id,
        createdBy:  user.id,
      },
      include: { stage: true, pipeline: true, contact: true },
    })

    await logAudit({ user, action: 'CREATE', tableName: 'deals', recordId: deal.id })

    return NextResponse.json({ data: deal }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}