/**
 * Instagram Messaging API Webhook
 * ⚠️ FEATURE TOGGLE: apenas ativo quando INSTAGRAM_ENABLED=true
 * Status: aguardando aprovação Meta (2-4 semanas)
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  IG_ENABLED,
  verifyInstagramWebhook,
  verifyInstagramSignature,
  parseInstagramWebhook,
} from '@/lib/instagram'

export async function GET(req: NextRequest) {
  if (!IG_ENABLED) return NextResponse.json({ message: 'Instagram não habilitado' }, { status: 200 })

  const challenge = verifyInstagramWebhook(req.url)
  if (challenge) return new NextResponse(challenge, { status: 200 })
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
  if (!IG_ENABLED) {
    // Aceitar silenciosamente para não gerar erros no Meta Dashboard
    return NextResponse.json({ received: true })
  }

  const rawBody   = await req.text()
  const signature = req.headers.get('x-hub-signature-256')

  if (!verifyInstagramSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  let body: unknown
  try { body = JSON.parse(rawBody) } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { dms, comments } = parseInstagramWebhook(body)

  // ── Processar DMs ─────────────────────────────────────────
  for (const dm of dms) {
    const existing = await prisma.instagramMessage.findUnique({ where: { metaMessageId: dm.mid } })
    if (existing) continue

    const contact = await prisma.contact.upsert({
      where:  { instagramId: dm.from.id } as { instagramId: string },
      create: {
        fullName:          dm.from.username ? `@${dm.from.username}` : `Instagram ${dm.from.id.slice(-6)}`,
        instagramId:       dm.from.id,
        instagramUsername: dm.from.username,
        isB2b:             false,
        lgpdConsent:       false,
        tags:              ['instagram', 'dm'],
      },
      update: { instagramUsername: dm.from.username },
    }).catch(() => prisma.contact.create({
      data: {
        fullName:          dm.from.username ? `@${dm.from.username}` : `Instagram ${dm.from.id.slice(-6)}`,
        instagramId:       dm.from.id,
        instagramUsername: dm.from.username,
        isB2b:             false,
        lgpdConsent:       false,
        tags:              ['instagram', 'dm'],
        phone:             undefined,
        email:             undefined,
      },
    }))

    const igMsg = await prisma.instagramMessage.create({
      data: {
        contactId:       contact.id,
        metaMessageId:   dm.mid,
        metaIgAccountId: process.env.META_INSTAGRAM_ACCOUNT_ID!,
        metaSenderIgId:  dm.from.id,
        direction:       'inbound',
        status:          'delivered',
        contentType:     dm.attachments ? 'image' : 'text',
        contentText:     dm.text,
        metaTimestamp:   new Date(dm.timestamp),
        metaRawPayload:  dm as object,
      },
    })

    await prisma.interaction.create({
      data: {
        contactId:          contact.id,
        channel:            'instagram',
        direction:          'inbound',
        content:            dm.text ?? '[mídia]',
        instagramMessageId: igMsg.id,
      },
    })
  }

  // ── Processar comentários → captura de lead ───────────────
  for (const comment of comments) {
    const existing = await prisma.instagramMessage.findUnique({ where: { metaMessageId: comment.id } })
    if (existing) continue

    const contact = await prisma.contact.upsert({
      where:  { instagramId: comment.from.id } as { instagramId: string },
      create: {
        fullName:          comment.from.username ? `@${comment.from.username}` : `IG ${comment.from.id.slice(-6)}`,
        instagramId:       comment.from.id,
        instagramUsername: comment.from.username,
        isB2b:             false,
        lgpdConsent:       false,
        tags:              ['instagram', 'comentario', 'lead'],
        phone:             undefined,
        email:             undefined,
      },
      update: {},
    }).catch(() => prisma.contact.create({
      data: {
        fullName:          comment.from.username ? `@${comment.from.username}` : `IG ${comment.from.id.slice(-6)}`,
        instagramId:       comment.from.id,
        instagramUsername: comment.from.username,
        isB2b:             false,
        lgpdConsent:       false,
        tags:              ['instagram', 'comentario', 'lead'],
        phone:             undefined,
        email:             undefined,
      },
    }))

    await prisma.instagramMessage.create({
      data: {
        contactId:       contact.id,
        metaMessageId:   comment.id,
        metaIgAccountId: process.env.META_INSTAGRAM_ACCOUNT_ID!,
        metaSenderIgId:  comment.from.id,
        isCommentLead:   true,
        sourcePostId:    comment.post_id,
        direction:       'inbound',
        status:          'delivered',
        contentType:     'text',
        contentText:     comment.text,
        metaTimestamp:   new Date(comment.timestamp),
        metaRawPayload:  comment as object,
      },
    })
  }

  return NextResponse.json({ received: true })
}