/**
 * POST /api/v1/whatsapp/send — Enviar mensagem WhatsApp (outbound)
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { logAudit } from '@/lib/audit'
import { sendWhatsAppText, sendWhatsAppTemplate } from '@/lib/whatsapp'

const SendMessageSchema = z.object({
  contactId:    z.string().uuid(),
  type:         z.enum(['text', 'template']),
  text:         z.string().max(4096).optional(),
  templateName: z.string().optional(),
  templateLang: z.string().default('pt_BR'),
}).refine(
  (d) => (d.type === 'text' && d.text) || (d.type === 'template' && d.templateName),
  { message: 'Informe text para tipo "text" ou templateName para tipo "template"' },
)

export async function POST(req: NextRequest) {
  try {
    const user  = await requireAuth()
    const input = SendMessageSchema.parse(await req.json())

    const contact = await prisma.contact.findUnique({
      where: { id: input.contactId, deletedAt: null },
    })
    if (!contact?.whatsappPhone) {
      throw { status: 422, code: 'NO_WHATSAPP', message: 'Contato sem número WhatsApp cadastrado' }
    }
    if (!contact.lgpdConsent) {
      throw { status: 422, code: 'NO_LGPD_CONSENT', message: 'Contato sem consentimento LGPD para comunicações' }
    }

    let metaMessageId: string
    if (input.type === 'text') {
      metaMessageId = await sendWhatsAppText(contact.whatsappPhone, input.text!)
    } else {
      metaMessageId = await sendWhatsAppTemplate(contact.whatsappPhone, input.templateName!, input.templateLang)
    }

    // Registrar no banco
    const waMsg = await prisma.whatsappMessage.create({
      data: {
        contactId:         contact.id,
        metaMessageId,
        metaPhoneNumberId: process.env.META_PHONE_NUMBER_ID!,
        direction:         'outbound',
        status:            'sent',
        contentType:       input.type,
        contentText:       input.text,
        templateName:      input.templateName,
        metaRawPayload:    { sent_by: user.id, type: input.type } as object,
      },
    })

    await prisma.interaction.create({
      data: {
        contactId:         contact.id,
        userId:            user.id,
        channel:           'whatsapp',
        direction:         'outbound',
        content:           input.text ?? `[template: ${input.templateName}]`,
        whatsappMessageId: waMsg.id,
      },
    })

    await logAudit({
      user,
      action:    'CREATE',
      tableName: 'whatsapp_messages',
      recordId:  waMsg.id,
    })

    return NextResponse.json({ data: { messageId: metaMessageId } })
  } catch (err) {
    return handleApiError(err)
  }
}