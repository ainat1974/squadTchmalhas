/**
 * Vercel Cron: WebChat Expire — a cada 15 minutos
 * Fecha sessões de chat sem atividade por mais de 30 minutos
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireCronSecret } from '@/lib/auth'

export const runtime    = 'nodejs'
export const maxDuration = 30

export async function GET(req: NextRequest) {
  try {
    requireCronSecret(req)

    const idleThreshold = new Date(Date.now() - 30 * 60 * 1000)

    const result = await prisma.webchatSession.updateMany({
      where: {
        status:        'active',
        lastActivityAt: { lt: idleThreshold },
      },
      data: {
        status:  'abandoned',
        endedAt: new Date(),
      },
    })

    console.log(`[WebChat Expire] ${result.count} sessões expiradas`)
    return NextResponse.json({ expired: result.count })
  } catch (err) {
    console.error('[WebChat Expire] Erro:', err)
    return NextResponse.json({ error: 'Expire falhou' }, { status: 500 })
  }
}