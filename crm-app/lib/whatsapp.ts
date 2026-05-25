/**
 * lib/whatsapp.ts — Client Meta WhatsApp Cloud API
 * Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
import crypto from 'node:crypto'

const META_API_BASE   = 'https://graph.facebook.com/v20.0'
const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID!
const WA_TOKEN        = process.env.META_WHATSAPP_TOKEN!
const APP_SECRET      = process.env.META_APP_SECRET!
const VERIFY_TOKEN    = process.env.META_WEBHOOK_VERIFY_TOKEN!

// ─── Verificação de webhook ──────────────────────────────────
export function verifyWhatsAppWebhook(url: string): string | null {
  const params   = new URL(url).searchParams
  const mode     = params.get('hub.mode')
  const token    = params.get('hub.verify_token')
  const challenge = params.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) return challenge
  return null
}

// ─── Verificação de assinatura HMAC ─────────────────────────
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader?.startsWith('sha256=')) return false
  const expected = 'sha256=' + crypto
    .createHmac('sha256', APP_SECRET)
    .update(rawBody, 'utf8')
    .digest('hex')
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(signatureHeader, 'utf8'),
    )
  } catch {
    return false
  }
}

// ─── Parsing do payload do webhook ──────────────────────────
export interface WhatsAppIncomingMessage {
  id:         string              // wamid.xxx — usado para idempotência
  from:       string              // número E.164 sem +
  timestamp:  string
  type:       'text' | 'image' | 'audio' | 'document' | 'video' | 'sticker' | 'reaction'
  text?:      { body: string }
  image?:     { id: string; mime_type: string; caption?: string }
  audio?:     { id: string; mime_type: string }
  document?:  { id: string; mime_type: string; filename?: string }
}

export interface WhatsAppStatusUpdate {
  id:         string
  status:     'sent' | 'delivered' | 'read' | 'failed'
  timestamp:  string
  errors?:    Array<{ code: number; title: string }>
}

export interface WhatsAppWebhookPayload {
  messages?: WhatsAppIncomingMessage[]
  statuses?: WhatsAppStatusUpdate[]
  metadata: {
    display_phone_number: string
    phone_number_id:      string
  }
}

export function parseWhatsAppWebhook(body: unknown): WhatsAppWebhookPayload | null {
  try {
    const b = body as { entry?: Array<{ changes?: Array<{ value?: WhatsAppWebhookPayload }> }> }
    return b.entry?.[0]?.changes?.[0]?.value ?? null
  } catch {
    return null
  }
}

// ─── Envio de mensagens ──────────────────────────────────────
interface MetaResponse {
  messages?: Array<{ id: string }>
  error?:    { message: string; code: number }
}

async function callMetaAPI(path: string, body: unknown): Promise<MetaResponse> {
  const res = await fetch(`${META_API_BASE}/${PHONE_NUMBER_ID}/${path}`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${WA_TOKEN}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json() as MetaResponse
  if (!res.ok) {
    throw new Error(`Meta API error ${res.status}: ${data.error?.message ?? JSON.stringify(data)}`)
  }
  return data
}

export async function sendWhatsAppText(to: string, text: string): Promise<string> {
  const data = await callMetaAPI('messages', {
    messaging_product: 'whatsapp',
    recipient_type:    'individual',
    to,
    type: 'text',
    text: { preview_url: false, body: text },
  })
  return data.messages?.[0]?.id ?? ''
}

export async function sendWhatsAppTemplate(
  to:           string,
  templateName: string,
  langCode =    'pt_BR',
  components?:  unknown[],
): Promise<string> {
  const data = await callMetaAPI('messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name:       templateName,
      language:   { code: langCode },
      components: components ?? [],
    },
  })
  return data.messages?.[0]?.id ?? ''
}

export async function markWhatsAppRead(messageId: string): Promise<void> {
  await callMetaAPI('messages', {
    messaging_product: 'whatsapp',
    status:            'read',
    message_id:        messageId,
  })
}

// Download de mídia (retorna URL temporária)
export async function getWhatsAppMediaUrl(mediaId: string): Promise<string> {
  const res = await fetch(`${META_API_BASE}/${mediaId}`, {
    headers: { 'Authorization': `Bearer ${WA_TOKEN}` },
  })
  const data = await res.json() as { url: string }
  return data.url
}