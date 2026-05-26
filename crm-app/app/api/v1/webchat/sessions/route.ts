/**
 * GET  /api/v1/webchat/sessions — Lista sessões ativas (operadores)
 * POST /api/v1/webchat/sessions — Iniciar sessão de chat (visitante — público)
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { StartWebchatSchema } from '@/lib/validators/webchat'
import { checkWebchatRateLimit } from '@/lib/ratelimit'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { Errors } from '@/lib/errors'
import { randomUUID } from 'node:crypto'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const status = req.nextUrl.searchParams.get('status') ?? 'waiting,active'
    const statuses = status.split(',') as ('waiting' | 'active' | 'closed')[]

    const sessions = await prisma.webchatSession.findMany({
      where: {
        status: { in: statuses },
        ...(user.role === 'atendente_varejo' && { assignedTo: user.id }),
      },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        operator: { select: { id: true, fullName: true } },
        contact:  { select: { id: true, fullName: true } },
      },
      orderBy: { lastActivityAt: 'desc' },
      take:    50,
    })

    return NextResponse.json({ data: sessions })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const input  = StartWebchatSchema.parse(await req.json())
    const ip     = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()

    const { allowed } = await checkWebchatRateLimit(req)
    if (!allowed) throw Errors.RATE_LIMITED()

    const turnstileOk = await verifyTurnstileToken(input.turnstileToken, ip)
    if (!turnstileOk) {
      throw Errors.FORBIDDEN('Verificação de segurança falhou. Recarregue a página.')
    }

    const ua     = req.headers.get('user-agent') ?? undefined

    const sessionId       = randomUUID()
    const sessionToken    = randomUUID()
    const realtimeChannel = `webchat:${sessionId}`

    const session = await prisma.webchatSession.create({
      data: {
        id:              sessionId,
        sessionToken,
        visitorName:     input.visitorName,
        visitorEmail:    input.visitorEmail,
        visitorPhone:    input.visitorPhone,
        visitorIp:       ip,
        visitorUserAgent: ua,
        lgpdConsent:     input.lgpdConsent,
        lgpdConsentAt:   input.lgpdConsent ? new Date() : null,
        pageUrl:         input.pageUrl,
        utmSource:       input.utmSource,
        utmMedium:       input.utmMedium,
        utmCampaign:     input.utmCampaign,
        realtimeChannel,
        status:          'waiting',
      },
    })

    // Notificar atendentes disponíveis
    const atendentes = await prisma.user.findMany({
      where: { role: 'atendente_varejo', isActive: true, deletedAt: null },
    })

    await prisma.notification.createMany({
      data: atendentes.map(u => ({
        userId:  u.id,
        type:    'new_message' as const,
        title:   '💬 Novo chat no site',
        body:    `${input.visitorName ?? 'Visitante'} iniciou um chat${input.pageUrl ? ` em ${new URL(input.pageUrl).pathname}` : ''}`,
        link:    `/inbox?session=${session.id}`,
      })),
    })

    return NextResponse.json({
      data: {
        sessionId:       session.id,
        sessionToken:    session.sessionToken,
        realtimeChannel: session.realtimeChannel,
        supabaseUrl:     process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}