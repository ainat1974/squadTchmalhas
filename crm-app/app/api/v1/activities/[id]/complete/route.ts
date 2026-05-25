/**
 * POST /api/v1/activities/:id/complete — Marcar atividade como concluída
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { handleApiError, Errors } from '@/lib/errors'
import { logAudit } from '@/lib/audit'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user   = await requireAuth()
    const { id } = await params

    const activity = await prisma.activity.findUnique({
      where: { id, deletedAt: null },
    })
    if (!activity) throw Errors.NOT_FOUND('Atividade')
    if (activity.isDone) throw Errors.CONFLICT('Atividade já está concluída')

    // Apenas assignee ou admin/gestor pode concluir
    if (!['admin', 'gestor'].includes(user.role) && activity.assignedTo !== user.id) {
      throw Errors.FORBIDDEN('Você não é o responsável por esta atividade')
    }

    const updated = await prisma.activity.update({
      where: { id },
      data:  { isDone: true, doneAt: new Date() },
    })

    await logAudit({ user, action: 'UPDATE', tableName: 'activities', recordId: id, changedFields: ['is_done'] })

    return NextResponse.json({ data: updated })
  } catch (err) {
    return handleApiError(err)
  }
}