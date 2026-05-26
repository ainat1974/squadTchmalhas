/**
 * GET /api/v1/whatsapp/conversations — Lista conversas WhatsApp agrupadas por contato
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'

export async function GET() {
  try {
    await requireAuth()

    const contacts = await prisma.contact.findMany({
      where: {
        deletedAt: null,
        whatsappMessages: { some: {} },
      },
      select: {
        id: true,
        fullName: true,
        companyName: true,
        whatsappPhone: true,
        lgpdConsent: true,
        whatsappMessages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            contentText: true,
            direction: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    })

    const conversations = await Promise.all(
      contacts.map(async (c) => {
        const last = c.whatsappMessages[0]
        const unreadCount = await prisma.whatsappMessage.count({
          where: {
            contactId: c.id,
            direction: 'inbound',
            status: { in: ['pending', 'delivered'] },
          },
        })

        return {
          contactId:       c.id,
          displayName:     c.fullName,
          companyName:     c.companyName,
          whatsappPhone:   c.whatsappPhone,
          lgpdConsent:     c.lgpdConsent,
          lastMessage:     last?.contentText ?? null,
          lastMessageAt:   last?.createdAt.toISOString() ?? null,
          lastDirection:   last?.direction ?? null,
          unreadCount,
        }
      }),
    )

    conversations.sort((a, b) => {
      const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return tb - ta
    })

    return NextResponse.json({ data: conversations })
  } catch (err) {
    return handleApiError(err)
  }
}
