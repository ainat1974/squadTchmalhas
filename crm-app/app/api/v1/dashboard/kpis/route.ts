/**
 * GET /api/v1/dashboard/kpis — KPIs por vendedor e período
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const KPIsQuerySchema = z.object({
  period:     z.enum(['7d', '30d', '90d', 'custom']).default('30d'),
  startDate:  z.string().date().optional(),
  endDate:    z.string().date().optional(),
  userId:     z.string().uuid().optional(),
  pipeline:   z.enum(['atacado', 'varejo']).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const user   = await requireAuth()
    const params = KPIsQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams))

    // Calcular intervalo de datas
    const now    = new Date()
    let startAt: Date
    if (params.period === 'custom' && params.startDate) {
      startAt = new Date(params.startDate)
    } else {
      const days = params.period === '7d' ? 7 : params.period === '90d' ? 90 : 30
      startAt = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    }
    const endAt = params.endDate ? new Date(params.endDate) : now

    // Para gestor/admin: podem ver KPIs de outro vendedor
    // Para vendedor: apenas os próprios
    const targetUserId =
      ['admin', 'gestor'].includes(user.role) && params.userId
        ? params.userId
        : user.id

    const [
      totalDeals,
      wonDeals,
      lostDeals,
      totalRevenue,
      newLeads,
      activitiesDone,
      activitiesOverdue,
      avgDealValue,
    ] = await Promise.all([
      prisma.deal.count({
        where: {
          assignedTo: targetUserId,
          createdAt:  { gte: startAt, lte: endAt },
          deletedAt:  null,
          ...(params.pipeline && { pipeline: { type: params.pipeline } }),
        },
      }),
      prisma.deal.count({
        where: {
          assignedTo: targetUserId,
          status:     'won',
          closedAt:   { gte: startAt, lte: endAt },
          ...(params.pipeline && { pipeline: { type: params.pipeline } }),
        },
      }),
      prisma.deal.count({
        where: {
          assignedTo: targetUserId,
          status:     'lost',
          closedAt:   { gte: startAt, lte: endAt },
          ...(params.pipeline && { pipeline: { type: params.pipeline } }),
        },
      }),
      prisma.deal.aggregate({
        where: {
          assignedTo: targetUserId,
          status:     'won',
          closedAt:   { gte: startAt, lte: endAt },
          ...(params.pipeline && { pipeline: { type: params.pipeline } }),
        },
        _sum: { value: true },
      }),
      prisma.contact.count({
        where: {
          assignedTo: targetUserId,
          createdAt:  { gte: startAt, lte: endAt },
          deletedAt:  null,
        },
      }),
      prisma.activity.count({
        where: {
          assignedTo: targetUserId,
          isDone:     true,
          doneAt:     { gte: startAt, lte: endAt },
        },
      }),
      prisma.activity.count({
        where: {
          assignedTo: targetUserId,
          isDone:     false,
          dueDate:    { lt: now },
          deletedAt:  null,
        },
      }),
      prisma.deal.aggregate({
        where: {
          assignedTo: targetUserId,
          status:     'won',
          closedAt:   { gte: startAt, lte: endAt },
          value:      { not: null },
          ...(params.pipeline && { pipeline: { type: params.pipeline } }),
        },
        _avg: { value: true },
      }),
    ])

    const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0

    return NextResponse.json({
      data: {
        period:           { start: startAt, end: endAt },
        totalDeals,
        wonDeals,
        lostDeals,
        openDeals:        totalDeals - wonDeals - lostDeals,
        conversionRate:   Math.round(conversionRate * 10) / 10,
        totalRevenue:     Number(totalRevenue._sum.value ?? 0),
        avgDealValue:     Number(avgDealValue._avg.value ?? 0),
        newLeads,
        activitiesDone,
        activitiesOverdue,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}