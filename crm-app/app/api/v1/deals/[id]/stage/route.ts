/**
 * PATCH /api/v1/deals/:id/stage — Mover deal para outro stage
 * HARD BLOCK: se existirem atividades obrigatórias não concluídas, retorna 409.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireDealOwnership } from '@/lib/auth'
import { handleApiError, Errors } from '@/lib/errors'
import { logAudit } from '@/lib/audit'
import { MoveDealStageSchema } from '@/lib/validators/deal'
import { ensureStageRequiredActivities } from '@/lib/deal-stage-tasks'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user   = await requireAuth()
    const { id } = await params
    const input  = MoveDealStageSchema.parse(await req.json())

    const deal = await prisma.deal.findUnique({
      where: { id, deletedAt: null },
      include: {
        activities: {
          where: { isMandatory: true, isDone: false, deletedAt: null },
        },
      },
    })
    if (!deal) throw Errors.NOT_FOUND('Deal')
    requireDealOwnership(user, deal.assignedTo)

    // ── HARD BLOCK ─────────────────────────────────────────
    if (deal.activities.length > 0) {
      throw Errors.CONFLICT(
        'Existem tarefas obrigatórias pendentes. Conclua-as antes de mover o deal.',
        {
          pendingMandatoryTasks: deal.activities.map(a => ({
            id:    a.id,
            title: a.title,
            dueDate: a.dueDate,
          })),
        },
      )
    }

    const targetStage = await prisma.stage.findUnique({ where: { id: input.stageId } })
    if (!targetStage || targetStage.pipelineId !== deal.pipelineId) {
      throw Errors.UNPROCESSABLE('Stage não pertence ao pipeline deste deal')
    }

    const updated = await prisma.deal.update({
      where: { id },
      data:  {
        stageId:    input.stageId,
        ...(targetStage.isLostStage && {
          status:     'lost',
          closedAt:   new Date(),
          lostReason: input.lostReason,
        }),
        ...(targetStage.isWonStage && {
          status:   'won',
          closedAt: new Date(),
        }),
      },
      include: { stage: true },
    })

    if (input.stageId !== deal.stageId && !targetStage.isWonStage && !targetStage.isLostStage) {
      await ensureStageRequiredActivities(id, input.stageId, user)
    }

    await logAudit({
      user,
      action:        'UPDATE',
      tableName:     'deals',
      recordId:      id,
      changedFields: ['stage_id'],
      oldValues:     { stage_id: deal.stageId },
    })

    return NextResponse.json({ data: updated })
  } catch (err) {
    return handleApiError(err)
  }
}