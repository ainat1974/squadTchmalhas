/**
 * Cria atividades obrigatórias a partir de StageRequiredTask ao entrar em um stage.
 */
import { prisma } from '@/lib/db'
import type { User } from '@prisma/client'

export async function ensureStageRequiredActivities(
  dealId: string,
  stageId: string,
  user: User,
): Promise<number> {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { contactId: true, assignedTo: true },
  })
  if (!deal) return 0

  const templates = await prisma.stageRequiredTask.findMany({
    where: { stageId, isActive: true },
  })

  let created = 0
  for (const tmpl of templates) {
    const exists = await prisma.activity.findFirst({
      where: {
        dealId,
        fromTemplateId: tmpl.id,
        deletedAt: null,
      },
    })
    if (exists) continue

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + tmpl.dueDaysOffset)

    await prisma.activity.create({
      data: {
        dealId,
        contactId:    deal.contactId,
        assignedTo:   deal.assignedTo ?? user.id,
        createdBy:    user.id,
        type:         tmpl.activityType,
        title:        tmpl.title,
        description:  tmpl.description,
        isMandatory:  true,
        isDone:       false,
        dueDate,
        fromTemplateId: tmpl.id,
      },
    })
    created++
  }

  return created
}
