/**
 * lib/instagram.ts — Client Meta Instagram Messaging API
 * Feature toggle: ativado apenas quando INSTAGRAM_ENABLED=true
 * Aprovação Meta: 2-4 semanas; módulo desenvolvido mas inativo até aprovação.
 */
import crypto from 'node:crypto'

const META_API_BASE    = 'https://graph.facebook.com/v20.0'
const IG_TOKEN         = process.env.META_INSTAGRAM_TOKEN!
const APP_SECRET       = process.env.META_APP_SECRET!
const VERIFY_TOKEN     = process.env.META_WEBHOOK_VERIFY_TOKEN!
export const IG_ENABLED = process.env.INSTAGRAM_ENABLED === 'true'

export function verifyInstagramWebhook(url: string): string | null {
  const params    = new URL(url).searchParams
  const mode      = params.get('hub.mode')
  const token     = params.get('hub.verify_token')
  const challenge = params.get('hub.challenge')
  if (mode === 'subscribe' && token === VERIFY_TOKEN) return challenge
  return null
}

export function verifyInstagramSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader?.startsWith('sha256=')) return false
  const expected = 'sha256=' + crypto
    .createHmac('sha256', APP_SECRET)
    .update(rawBody, 'utf8')
    .digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader))
  } catch { return false }
}

export interface InstagramDM {
  mid:       string          // message ID — idempotência
  from:      { id: string; username?: string }
  text?:     string
  attachments?: Array<{ type: string; payload: { url: string } }>
  timestamp: number
}

export interface InstagramComment {
  id:        string
  post_id:   string
  from:      { id: string; username?: string }
  text:      string
  timestamp: number
}

export function parseInstagramWebhook(body: unknown): {
  dms:      InstagramDM[]
  comments: InstagramComment[]
} {
  const result = { dms: [] as InstagramDM[], comments: [] as InstagramComment[] }
  try {
    const b = body as {
      entry?: Array<{
        messaging?: Array<{ message: InstagramDM & { mid: string }; sender: { id: string; username?: string }; timestamp: number }>
        changes?:   Array<{ field: string; value: InstagramComment }>
      }>
    }
    for (const entry of b.entry ?? []) {
      // Direct Messages
      for (const msg of entry.messaging ?? []) {
        result.dms.push({
          mid:       msg.message.mid,
          from:      msg.sender,
          text:      (msg.message as unknown as { text?: string }).text,
          timestamp: msg.timestamp,
        })
      }
      // Comentários
      for (const change of entry.changes ?? []) {
        if (change.field === 'comments') {
          result.comments.push(change.value)
        }
      }
    }
  } catch { /* silently fail */ }
  return result
}

export async function sendInstagramDM(recipientId: string, text: string): Promise<string> {
  const res = await fetch(`${META_API_BASE}/me/messages`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${IG_TOKEN}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      recipient:       { id: recipientId },
      message:         { text },
      messaging_type:  'RESPONSE',
    }),
  })
  const data = await res.json() as { message_id?: string }
  return data.message_id ?? ''
}