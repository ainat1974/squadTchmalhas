/**
 * Vercel Cron: LGPD Purge — @monthly (1º de cada mês às 02:00)
 * Remove PII de contatos soft-deletados há mais de 90 dias
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireCronSecret } from '@/lib/auth'

export const runtime = 'nodejs'
export const maxDuration = 300  // 5 minutos

export async function GET(req: NextRequest) {
  try {
    requireCronSecret(req)

    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    // Buscar contatos para anonimização
    const contacts = await prisma.contact.findMany({
      where: {
        deletedAt: { not: null, lt: cutoffDate },
        lgpdConsent: true,
      },
      select: { id: true, fullName: true },
      take:   500,  // processar em lotes
    })

    let purged = 0
    for (const contact of contacts) {
      await prisma.contact.update({
        where: { id: contact.id },
        data:  {
          // Anonimizar PII (não deletar fisicamente — manter registro para audit)
          fullName:         `ANONIMIZADO_${contact.id.slice(0, 8)}`,
          email:            null,
          phone:            null,
          whatsappPhone:    null,
          instagramId:      null,
          instagramUsername: null,
          documentCpf:      null,
          documentCnpj:     null,
          companyName:      null,
          notes:            null,
          tags:             ['anonimizado'],
        },
      })
      purged++
    }

    console.log(`[LGPD Purge] ${purged} contatos anonimizados`)
    return NextResponse.json({ purged, cutoffDate })
  } catch (err) {
    console.error('[LGPD Purge] Erro:', err)
    return NextResponse.json({ error: 'Purge falhou' }, { status: 500 })
  }
}