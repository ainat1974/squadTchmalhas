/**
 * PATCH /api/v1/deals/:id/status — Fechar deal como Ganho ou Perdido
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAuth, requireDealOwnership } from '@/lib/auth'
import { handleApiError, Errors } from '@/lib/errors'
import { logAudit } from '@/lib/audit'

const UpdateDealStatusSchema = z.object({
  status:     z.enum(['won', 'lost']),
  lostReason: z.string().min(3).max(500).optional(),
}).refine(
  (d) => d.status !== 'lost' || (d.lostReason && d.lostReason.trim().length >= 3),
  { message: 'Motivo da perda é obrigatório', path: ['lostReason'] },
)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user   = await requireAuth()
    const { id } = await params
    const input  = UpdateDealStatusSchema.parse(await req.json())

    const deal = await prisma.deal.findUnique({
      where: { id, deletedAt: null },
      include: {
        stage: true,
        activities: {
          where: { isMandatory: true, isDone: false, deletedAt: null },
        },
      },
    })
    if (!deal) throw Errors.NOT_FOUND('Deal')
    requireDealOwnership(user, deal.assignedTo)

    if (deal.status !== 'open') {
      throw Errors.CONFLICT('Este deal já foi encerrado')
    }

    if (deal.activities.length > 0) {
      throw Errors.CONFLICT(
        'Existem tarefas obrigatórias pendentes. Conclua-as antes de fechar o deal.',
        {
          pendingMandatoryTasks: deal.activities.map((a) => ({
            id:      a.id,
            title:   a.title,
            dueDate: a.dueDate,
          })),
        },
      )
    }

    let targetStageId = deal.stageId
    if (input.status === 'won' && !deal.stage.isWonStage) {
      const wonStage = await prisma.stage.findFirst({
        where: { pipelineId: deal.pipelineId, isWonStage: true },
      })
      if (wonStage) targetStageId = wonStage.id
    }
    if (input.status === 'lost' && !deal.stage.isLostStage) {
      const lostStage = await prisma.stage.findFirst({
        where: { pipelineId: deal.pipelineId, isLostStage: true },
      })
      if (lostStage) targetStageId = lostStage.id
    }

    const updated = await prisma.deal.update({
      where: { id },
      data: {
        status:     input.status,
        closedAt:   new Date(),
        lostReason: input.status === 'lost' ? input.lostReason : null,
        stageId:    targetStageId,
      },
      include: {
        stage:    true,
        contact:  { select: { id: true, fullName: true } },
        pipeline: { select: { name: true, type: true } },
        owner:    { select: { fullName: true } },
      },
    })

    await logAudit({
      user,
      action:        'UPDATE',
      tableName:     'deals',
      recordId:      id,
      changedFields: ['status', 'closed_at'],
      oldValues:     { status: deal.status },
    })

    return NextResponse.json({ data: updated })
  } catch (err) {
    return handleApiError(err)
  }
}
