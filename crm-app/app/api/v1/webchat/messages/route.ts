/**
 * POST /api/v1/webchat/messages — Enviar mensagem em sessão webchat
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { handleApiError, Errors } from '@/lib/errors'
import { z } from 'zod'

const SendMessageSchema = z.object({
  sessionId:     z.string().uuid(),
  content:       z.string().min(1).max(4000),
  isFromVisitor: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const body = SendMessageSchema.parse(await req.json())

    const session = await prisma.webchatSession.findUnique({
      where: { id: body.sessionId },
    })
    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
    }

    if (body.isFromVisitor) {
      const token = req.headers.get('x-session-token')
      if (!token || token !== session.sessionToken) {
        throw Errors.FORBIDDEN('Token de sessão inválido')
      }
    } else {
      const user = await getCurrentUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.status === 'closed' || session.status === 'abandoned') {
      return NextResponse.json({ error: 'Sessão encerrada' }, { status: 400 })
    }

    const user = body.isFromVisitor ? null : await getCurrentUser()

    const message = await prisma.webchatMessage.create({
      data: {
        sessionId:     body.sessionId,
        content:       body.content,
        isFromVisitor: body.isFromVisitor,
        userId:        user?.id,
        visitorName:   body.isFromVisitor ? session.visitorName : user?.fullName,
      },
    })

    await prisma.webchatSession.update({
      where: { id: body.sessionId },
      data: {
        lastActivityAt: new Date(),
        status: session.status === 'waiting' ? 'active' : session.status,
      },
    })

    return NextResponse.json({ data: message }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
