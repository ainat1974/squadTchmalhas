/**
 * Vercel Cron: WhatsApp Retry — a cada 5 minutos
 * Reprocessa mensagens com status 'failed' e retryNextAt <= now
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireCronSecret } from '@/lib/auth'
import { sendWhatsAppText } from '@/lib/whatsapp'

export const runtime    = 'nodejs'
export const maxDuration = 30

const MAX_RETRIES = 5

export async function GET(req: NextRequest) {
  try {
    requireCronSecret(req)

    const pending = await prisma.whatsappMessage.findMany({
      where: {
        status:      'failed',
        direction:   'outbound',
        retryCount:  { lt: MAX_RETRIES },
        retryNextAt: { lte: new Date() },
      },
      include: { contact: true },
      take:    20,
    })

    let retried = 0, failed = 0
    for (const msg of pending) {
      if (!msg.contact?.whatsappPhone || !msg.contentText) {
        await prisma.whatsappMessage.update({
          where: { id: msg.id },
          data:  { retryCount: MAX_RETRIES, status: 'failed' },
        })
        continue
      }

      try {
        const newMsgId = await sendWhatsAppText(msg.contact.whatsappPhone, msg.contentText)

        await prisma.whatsappMessage.update({
          where: { id: msg.id },
          data:  {
            status:       'sent',
            metaMessageId: newMsgId,
            errorCode:    null,
            errorMessage: null,
          },
        })
        retried++
      } catch (err) {
        const nextDelay = Math.pow(2, msg.retryCount) * 5 * 60 * 1000 // exponential backoff
        await prisma.whatsappMessage.update({
          where: { id: msg.id },
          data:  {
            retryCount:   { increment: 1 },
            retryNextAt:  new Date(Date.now() + nextDelay),
            errorMessage: err instanceof Error ? err.message : String(err),
          },
        })
        failed++
      }
    }

    return NextResponse.json({ retried, failed, total: pending.length })
  } catch (err) {
    console.error('[WA Retry] Erro:', err)
    return NextResponse.json({ error: 'Retry falhou' }, { status: 500 })
  }
}