/**
 * GET /api/v1/whatsapp/conversations/[contactId]/messages — Thread de mensagens
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { handleApiError, Errors } from '@/lib/errors'

interface RouteParams {
  params: Promise<{ contactId: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()
    const { contactId } = await params

    const contact = await prisma.contact.findFirst({
      where: { id: contactId, deletedAt: null },
      select: { id: true, fullName: true, whatsappPhone: true, lgpdConsent: true },
    })
    if (!contact) throw Errors.NOT_FOUND('Contato')

    const messages = await prisma.whatsappMessage.findMany({
      where: { contactId },
      orderBy: { createdAt: 'asc' },
      take: 200,
      select: {
        id: true,
        direction: true,
        contentText: true,
        contentType: true,
        status: true,
        createdAt: true,
      },
    })

    // Marcar inbound como lidas
    await prisma.whatsappMessage.updateMany({
      where: {
        contactId,
        direction: 'inbound',
        status: { in: ['pending', 'delivered'] },
      },
      data: { status: 'read' },
    })

    return NextResponse.json({
      data: {
        contact,
        messages: messages.map((m) => ({
          id:        m.id,
          content:   m.contentText ?? `[${m.contentType}]`,
          isOwn:     m.direction === 'outbound',
          status:    m.status,
          createdAt: m.createdAt.toISOString(),
        })),
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
