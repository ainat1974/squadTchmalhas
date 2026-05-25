/**
 * POST /api/v1/public/leads — Endpoint público para formulário do site
 * Sem autenticação. Rate limiting por IP. LGPD obrigatório.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { handleApiError, Errors } from '@/lib/errors'
import { checkRateLimit } from '@/lib/ratelimit'

const PublicLeadSchema = z.object({
  fullName:    z.string().min(1).max(200),
  email:       z.string().email().optional(),
  phone:       z.string().optional(),
  message:     z.string().max(2000).optional(),
  lgpdConsent: z.boolean().refine((v) => v === true, 'Consentimento LGPD obrigatório'),
  utmSource:   z.string().optional(),
  utmMedium:   z.string().optional(),
  utmCampaign: z.string().optional(),
  pageUrl:     z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting por IP
    const { allowed, remaining } = checkRateLimit(req)
    if (!allowed) throw Errors.RATE_LIMITED()

    const input = PublicLeadSchema.parse(await req.json())

    // Buscar lead source "Formulário Site"
    const leadSource = await prisma.leadSource.findFirst({
      where: { type: 'site_form' },
    })

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()

    const contact = await prisma.contact.create({
      data: {
        fullName:      input.fullName,
        email:         input.email,
        phone:         input.phone,
        isB2b:         false,
        pipelineType:  'varejo',
        lgpdConsent:   true,
        lgpdConsentAt: new Date(),
        lgpdConsentIp: ip,
        leadSourceId:  leadSource?.id,
        tags:          ['site', 'formulario', ...(input.utmSource ? [`utm:${input.utmSource}`] : [])],
        notes:         input.message,
      },
    })

    // Notificar atendentes via notificação
    const atendentes = await prisma.user.findMany({
      where: { role: 'atendente_varejo', isActive: true, deletedAt: null },
    })

    await prisma.notification.createMany({
      data: atendentes.map(u => ({
        userId:    u.id,
        type:      'new_lead' as const,
        title:     '🌐 Novo lead do site',
        body:      `${input.fullName} enviou um formulário${input.message ? ': ' + input.message.slice(0, 80) : ''}`,
        contactId: contact.id,
        link:      `/contacts/${contact.id}`,
      })),
    })

    return NextResponse.json(
      { data: { id: contact.id, message: 'Lead recebido com sucesso!' } },
      {
        status: 201,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      },
    )
  } catch (err) {
    return handleApiError(err)
  }
}