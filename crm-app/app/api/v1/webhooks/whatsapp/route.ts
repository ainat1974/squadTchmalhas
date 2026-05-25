/**
 * WhatsApp Cloud API Webhook
 * GET  — Verificação do webhook (Meta chama uma vez na configuração)
 * POST — Recebimento de mensagens e status updates (idempotente)
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  verifyWhatsAppWebhook,
  verifyWebhookSignature,
  parseWhatsAppWebhook,
  markWhatsAppRead,
} from '@/lib/whatsapp'

// GET — Meta verifica o webhook
export async function GET(req: NextRequest) {
  const challenge = verifyWhatsAppWebhook(req.url)
  if (challenge) return new NextResponse(challenge, { status: 200 })
  return new NextResponse('Forbidden', { status: 403 })
}

// POST — Recebe mensagens e status updates
export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const signature = req.headers.get('x-hub-signature-256')

  // Verificação de assinatura HMAC-SHA256 (segurança)
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[WhatsApp webhook] Assinatura inválida')
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  let body: unknown
  try { body = JSON.parse(rawBody) } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const payload = parseWhatsAppWebhook(body)
  if (!payload) {
    // Pode ser um evento de outra categoria (ex: account_alerts) — aceitar silenciosamente
    return NextResponse.json({ received: true })
  }

  // ── Processar mensagens recebidas ─────────────────────────
  for (const msg of payload.messages ?? []) {
    // IDEMPOTÊNCIA: pular se já processado
    const existing = await prisma.whatsappMessage.findUnique({
      where: { metaMessageId: msg.id },
    })
    if (existing) continue

    // Upsert do contato pelo número de WhatsApp
    const phoneNormalized = `+${msg.from}`
    const contact = await prisma.contact.upsert({
      where:  { phone: phoneNormalized },
      create: {
        fullName:      `Lead WhatsApp ${msg.from.slice(-4)}`,
        phone:         phoneNormalized,
        whatsappPhone: phoneNormalized,
        isB2b:         false,
        lgpdConsent:   false,    // Pendente — vendedor deve confirmar consentimento
        tags:          ['whatsapp', 'pendente-lgpd'],
        leadSource:    { connect: { id: await getOrCreateLeadSourceId('whatsapp') } },
      },
      update: { whatsappPhone: phoneNormalized },
    })

    const contentText = msg.text?.body
      ?? (msg.image    ? '[imagem]'   : undefined)
      ?? (msg.audio    ? '[áudio]'    : undefined)
      ?? (msg.document ? `[documento: ${msg.document.filename ?? ''}]` : undefined)
      ?? '[mensagem]'

    // Criar registro na tabela whatsapp_messages
    const waMsg = await prisma.whatsappMessage.create({
      data: {
        contactId:          contact.id,
        metaMessageId:      msg.id,
        metaPhoneNumberId:  payload.metadata.phone_number_id,
        direction:          'inbound',
        status:             'delivered',
        contentType:        msg.type,
        contentText,
        metaTimestamp:      new Date(Number(msg.timestamp) * 1000),
        metaRawPayload:     msg as object,
      },
    })

    // Criar interaction no histórico unificado
    await prisma.interaction.create({
      data: {
        contactId:        contact.id,
        channel:          'whatsapp',
        direction:        'inbound',
        content:          contentText,
        contentType:      msg.type,
        whatsappMessageId: waMsg.id,
      },
    })

    // Marcar como lida no Meta (opcional — confirma recebimento)
    try { await markWhatsAppRead(msg.id) } catch { /* não crítico */ }
  }

  // ── Processar status updates ──────────────────────────────
  for (const statusUpdate of payload.statuses ?? []) {
    const statusMap: Record<string, 'sent' | 'delivered' | 'read' | 'failed'> = {
      sent:      'sent',
      delivered: 'delivered',
      read:      'read',
      failed:    'failed',
    }
    const newStatus = statusMap[statusUpdate.status]
    if (!newStatus) continue

    await prisma.whatsappMessage.updateMany({
      where: { metaMessageId: statusUpdate.id },
      data:  {
        status:       newStatus,
        ...(newStatus === 'failed' && {
          errorCode:    statusUpdate.errors?.[0]?.code?.toString(),
          errorMessage: statusUpdate.errors?.[0]?.title,
          retryCount:   { increment: 1 },
          retryNextAt:  new Date(Date.now() + 5 * 60 * 1000), // retry em 5 min
        }),
      },
    })
  }

  // Meta exige resposta 200 rápida para não fazer retry
  return NextResponse.json({ received: true })
}

// Helper para obter o ID da lead source de WhatsApp
async function getOrCreateLeadSourceId(type: string): Promise<string> {
  const source = await prisma.leadSource.findFirst({ where: { type: type as 'whatsapp' } })
  return source?.id ?? ''
}