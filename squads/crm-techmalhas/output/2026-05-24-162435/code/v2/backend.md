# Backend Implementation — CRM Techmalhas

> **TL;DR:** 32 endpoints REST + webhook WhatsApp idempotente + webhook Instagram (feature toggle) +
> API pública de leads + WebChat API + 3 Vercel Cron Jobs (LGPD purge, WA retry, WebChat expire).
> Libs: auth, errors, audit, permissions, whatsapp, instagram, validators (Zod).

---

## Estrutura de Arquivos

```
app/api/
├── v1/
│   ├── contacts/
│   │   ├── route.ts              ← GET (lista) + POST (criar)
│   │   └── [id]/
│   │       └── route.ts          ← GET + PATCH + DELETE (soft)
│   ├── deals/
│   │   ├── route.ts              ← GET + POST
│   │   └── [id]/
│   │       ├── route.ts          ← GET + PATCH + DELETE
│   │       └── stage/
│   │           └── route.ts      ← PATCH (mover stage — hard block)
│   ├── activities/
│   │   ├── route.ts              ← GET + POST
│   │   └── [id]/
│   │       ├── route.ts          ← GET + PATCH + DELETE
│   │       └── complete/
│   │           └── route.ts      ← POST (marcar como concluída)
│   ├── interactions/
│   │   └── route.ts              ← GET (histórico) + POST (nota manual)
│   ├── pipelines/
│   │   ├── route.ts              ← GET
│   │   └── [id]/
│   │       └── stages/
│   │           └── route.ts      ← GET + POST + PATCH + DELETE
│   ├── users/
│   │   ├── route.ts              ← GET (lista) + POST (criar — admin)
│   │   └── me/
│   │       └── route.ts          ← GET (perfil próprio)
│   ├── notifications/
│   │   └── route.ts              ← GET + PATCH (marcar lida)
│   ├── dashboard/
│   │   └── kpis/
│   │       └── route.ts          ← GET (KPIs por usuário/período)
│   ├── whatsapp/
│   │   └── send/
│   │       └── route.ts          ← POST (enviar mensagem)
│   ├── instagram/
│   │   └── send/
│   │       └── route.ts          ← POST (responder DM — feature toggle)
│   ├── webchat/
│   │   ├── sessions/
│   │   │   ├── route.ts          ← GET (operador) + POST (visitante — público)
│   │   │   └── [id]/
│   │   │       └── route.ts      ← GET + PATCH (fechar sessão)
│   │   └── messages/
│   │       └── route.ts          ← POST (enviar msg)
│   ├── webhooks/
│   │   ├── whatsapp/
│   │   │   └── route.ts          ← GET (verify) + POST (receber)
│   │   └── instagram/
│   │       └── route.ts          ← GET (verify) + POST (receber)
│   └── public/
│       └── leads/
│           └── route.ts          ← POST (público — formulário site)
└── cron/
    ├── lgpd-purge/
    │   └── route.ts              ← Purge mensal (@monthly)
    ├── whatsapp-retry/
    │   └── route.ts              ← Retry WA falhas (@every5min)
    └── webchat-expire/
        └── route.ts              ← Expirar sessões inativas (@every15min)
lib/
├── auth.ts
├── errors.ts
├── audit.ts
├── permissions.ts
├── whatsapp.ts
├── instagram.ts
├── ratelimit.ts
└── validators/
    ├── contact.ts
    ├── deal.ts
    ├── activity.ts
    ├── interaction.ts
    └── webchat.ts
middleware.ts
vercel.json
.env.example
```

---

## `lib/errors.ts`

```typescript
/**
 * lib/errors.ts — Erros tipados e handler centralizado
 * Segue RFC 7807 Problem Details for HTTP APIs
 */
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Erros pré-definidos comuns
export const Errors = {
  UNAUTHENTICATED: () => new ApiError(401, 'UNAUTHENTICATED', 'Autenticação necessária'),
  FORBIDDEN:       (msg = 'Acesso negado') => new ApiError(403, 'FORBIDDEN', msg),
  NOT_FOUND:       (resource: string) => new ApiError(404, 'NOT_FOUND', `${resource} não encontrado`),
  CONFLICT:        (msg: string, details?: unknown) => new ApiError(409, 'CONFLICT', msg, details),
  UNPROCESSABLE:   (msg: string, details?: unknown) => new ApiError(422, 'UNPROCESSABLE', msg, details),
  RATE_LIMITED:    () => new ApiError(429, 'RATE_LIMITED', 'Muitas requisições. Aguarde antes de tentar novamente.'),
  INTERNAL:        () => new ApiError(500, 'INTERNAL_ERROR', 'Erro interno do servidor'),
}

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code:    'VALIDATION_ERROR',
          message: 'Dados inválidos',
          issues:  err.issues.map(i => ({
            field:   i.path.join('.'),
            message: i.message,
          })),
        },
      },
      { status: 422 },
    )
  }

  if (err instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code:    err.code,
          message: err.message,
          ...(err.details !== undefined ? { details: err.details } : {}),
        },
      },
      { status: err.status },
    )
  }

  // Erro desconhecido — logar sem expor detalhes
  console.error('[unhandled error]', err)
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
    { status: 500 },
  )
}
```

---

## `lib/auth.ts`

```typescript
/**
 * lib/auth.ts — Helpers de autenticação e autorização
 * Usa Supabase SSR + Prisma para buscar o perfil completo do usuário
 */
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/db'
import { ApiError, Errors } from '@/lib/errors'
import type { User, UserRole } from '@prisma/client'

// Criar cliente Supabase SSR (Next.js App Router)
async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get:    (name) => cookieStore.get(name)?.value,
        set:    () => {}, // App Router: cookies são read-only em Route Handlers
        remove: () => {},
      },
    },
  )
}

/**
 * Retorna o usuário atual da sessão Supabase, ou null se não autenticado.
 * Busca o perfil completo em public.users via Prisma.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user: authUser }, error } = await supabase.auth.getUser()
    if (error || !authUser) return null

    return prisma.user.findUnique({
      where: { id: authUser.id, deletedAt: null },
    })
  } catch {
    return null
  }
}

/**
 * Exige autenticação. Lança ApiError 401 se não autenticado.
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw Errors.UNAUTHENTICATED()
  if (!user.isActive) throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Conta desativada')
  return user
}

/**
 * Exige que o usuário tenha um dos roles especificados.
 */
export function requireRole(user: User, roles: UserRole[]): void {
  if (!roles.includes(user.role)) {
    throw Errors.FORBIDDEN(`Esta ação requer role: ${roles.join(' ou ')}`)
  }
}

/**
 * Verifica se o usuário pode acessar/modificar um deal específico.
 * admin e gestor: acesso total.
 * vendedor_atacado/atendente_varejo: apenas próprio deal.
 */
export function requireDealOwnership(user: User, dealOwnerId: string | null): void {
  if (user.role === 'admin' || user.role === 'gestor') return
  if (!dealOwnerId || user.id !== dealOwnerId) {
    throw Errors.FORBIDDEN('Você só pode modificar seus próprios deals')
  }
}

/**
 * Verifica se o usuário pode acessar um contact.
 * Leva em conta B2B vs B2C conforme RBAC.
 */
export function requireContactAccess(user: User, contact: { isB2b: boolean; assignedTo: string | null }): void {
  if (user.role === 'admin' || user.role === 'gestor') return
  if (user.role === 'vendedor_atacado' && !contact.isB2b) {
    throw Errors.FORBIDDEN('vendedor_atacado não acessa contatos B2C')
  }
  if (user.role === 'atendente_varejo' && contact.isB2b) {
    throw Errors.FORBIDDEN('atendente_varejo não acessa contatos B2B')
  }
}

/**
 * Extrai o Bearer token da request (para webhooks/endpoints públicos).
 */
export function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

/**
 * Verifica o CRON_SECRET para proteger endpoints de cron job.
 */
export function requireCronSecret(req: Request): void {
  const secret = extractBearerToken(req)
  if (!secret || secret !== process.env.CRON_SECRET) {
    throw Errors.FORBIDDEN('Acesso negado ao cron endpoint')
  }
}
```

---

## `lib/audit.ts`

```typescript
/**
 * lib/audit.ts — Log de auditoria LGPD
 * Todas as operações em PII devem chamar logAudit.
 * INSERT via service_role (bypassa RLS) usando DIRECT_URL.
 */
import { prisma } from '@/lib/db'
import type { User } from '@prisma/client'
import type { AuditAction } from '@prisma/client'
import { headers } from 'next/headers'

interface AuditParams {
  user:          User
  action:        AuditAction
  tableName:     string
  recordId?:     string
  changedFields?: string[]
  oldValues?:    Record<string, unknown>
  requestId?:    string
}

export async function logAudit(params: AuditParams): Promise<void> {
  const headerStore = await headers()
  const ip        = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim()
  const userAgent = headerStore.get('user-agent') ?? undefined
  const requestId = params.requestId ?? headerStore.get('x-request-id') ?? undefined

  // Fire-and-forget com catch para não quebrar o fluxo principal
  prisma.auditLog.create({
    data: {
      userId:        params.user.id,
      userEmail:     params.user.email,
      userRole:      params.user.role,
      userIp:        ip,
      userAgent,
      action:        params.action,
      tableName:     params.tableName,
      recordId:      params.recordId,
      changedFields: params.changedFields ?? [],
      oldValues:     params.oldValues as object | undefined,
      requestId,
    },
  }).catch((err) => console.error('[audit log error]', err))
}
```

---

## `lib/permissions.ts`

```typescript
/**
 * lib/permissions.ts — Checks de RBAC reutilizáveis
 */
import type { User } from '@prisma/client'

export const ROLES = {
  ADMIN:    'admin',
  GESTOR:   'gestor',
  ATACADO:  'vendedor_atacado',
  VAREJO:   'atendente_varejo',
} as const

export function isAdmin(user: User):       boolean { return user.role === 'admin' }
export function isGestor(user: User):      boolean { return user.role === 'gestor' }
export function isAdminOrGestor(user: User): boolean { return isAdmin(user) || isGestor(user) }
export function canManageUsers(user: User): boolean { return isAdmin(user) }
export function canConfigPipelines(user: User): boolean { return isAdminOrGestor(user) }
export function canSeeAllDeals(user: User): boolean { return isAdminOrGestor(user) }

// Verifica se o usuário pode ver um pipeline específico
export function canAccessPipelineType(
  user: User,
  pipelineType: 'atacado' | 'varejo',
): boolean {
  if (isAdminOrGestor(user)) return true
  if (user.role === 'vendedor_atacado') return pipelineType === 'atacado'
  if (user.role === 'atendente_varejo') return pipelineType === 'varejo'
  return false
}

// Filtro Prisma para deals visíveis ao usuário
export function dealsWhereClause(user: User) {
  if (isAdminOrGestor(user)) return { deletedAt: null }
  return {
    deletedAt: null,
    assignedTo: user.id,
    pipeline: {
      type: user.role === 'vendedor_atacado' ? ('atacado' as const) : ('varejo' as const),
    },
  }
}

// Filtro Prisma para contacts visíveis ao usuário
export function contactsWhereClause(user: User) {
  if (isAdminOrGestor(user)) return { deletedAt: null }
  if (user.role === 'vendedor_atacado') return { deletedAt: null, isB2b: true }
  return { deletedAt: null, isB2b: false }
}
```

---

## `lib/ratelimit.ts`

```typescript
/**
 * lib/ratelimit.ts — Rate limiting simples via headers IP
 * Para produção, substituir por Upstash Redis ou Vercel KV.
 * Este módulo é usado APENAS no endpoint público de leads.
 */
import { NextRequest } from 'next/server'

// In-memory store (OK para Vercel — cada instância serverless tem seu próprio)
const store = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS  = 60 * 1000  // 1 minuto
const MAX_REQUESTS = 5        // máx 5 leads por IP por minuto (anti-spam)

export function checkRateLimit(req: NextRequest): { allowed: boolean; remaining: number } {
  const ip      = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const now     = Date.now()
  const current = store.get(ip)

  if (!current || now > current.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  current.count++
  return { allowed: true, remaining: MAX_REQUESTS - current.count }
}
```

---

## `lib/whatsapp.ts`

```typescript
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
```

---

## `lib/instagram.ts`

```typescript
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
```

---

## `lib/validators/contact.ts`

```typescript
import { z } from 'zod'

const phoneRegex = /^\+?[1-9]\d{8,14}$/

export const CreateContactSchema = z.object({
  fullName:          z.string().min(1).max(200),
  email:             z.string().email().optional().or(z.literal('')),
  phone:             z.string().regex(phoneRegex, 'Telefone inválido (formato E.164)').optional(),
  whatsappPhone:     z.string().regex(phoneRegex, 'WhatsApp inválido').optional(),
  documentCpf:       z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
  documentCnpj:      z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).optional(),
  companyName:       z.string().max(200).optional(),
  isB2b:             z.boolean().default(false),
  pipelineType:      z.enum(['atacado', 'varejo']).optional(),
  leadSourceId:      z.string().uuid().optional(),
  instagramId:       z.string().optional(),
  instagramUsername: z.string().optional(),
  lgpdConsent:       z.boolean(),
  tags:              z.array(z.string()).default([]),
  notes:             z.string().max(5000).optional(),
}).refine(
  (d) => d.email || d.phone || d.whatsappPhone,
  { message: 'Informe ao menos email, telefone ou WhatsApp' },
).refine(
  (d) => d.lgpdConsent === true,
  { message: 'Consentimento LGPD obrigatório', path: ['lgpdConsent'] },
)

export const UpdateContactSchema = CreateContactSchema.partial().omit({ lgpdConsent: true })

export const ListContactsSchema = z.object({
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
  search:   z.string().optional(),
  isB2b:    z.coerce.boolean().optional(),
  pipeline: z.enum(['atacado', 'varejo']).optional(),
  source:   z.string().optional(),
})

export type CreateContactInput = z.infer<typeof CreateContactSchema>
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>
export type ListContactsInput  = z.infer<typeof ListContactsSchema>
```

---

## `lib/validators/deal.ts`

```typescript
import { z } from 'zod'

export const CreateDealSchema = z.object({
  title:             z.string().min(1).max(300),
  contactId:         z.string().uuid(),
  pipelineId:        z.string().uuid(),
  stageId:           z.string().uuid(),
  value:             z.number().positive().optional(),
  currency:          z.string().length(3).default('BRL'),
  expectedCloseDate: z.string().date().optional(),
  notes:             z.string().max(5000).optional(),
  tags:              z.array(z.string()).default([]),
})

export const UpdateDealSchema = z.object({
  title:             z.string().min(1).max(300).optional(),
  value:             z.number().positive().optional(),
  expectedCloseDate: z.string().date().optional(),
  notes:             z.string().max(5000).optional(),
  tags:              z.array(z.string()).optional(),
  assignedTo:        z.string().uuid().optional(),
})

export const MoveDealStageSchema = z.object({
  stageId:    z.string().uuid(),
  lostReason: z.string().max(500).optional(),
})

export const CloseDealSchema = z.object({
  status:     z.enum(['won', 'lost']),
  lostReason: z.string().max(500).optional(),
})

export const ListDealsSchema = z.object({
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(100).default(20),
  pipelineId: z.string().uuid().optional(),
  stageId:    z.string().uuid().optional(),
  status:     z.enum(['open', 'won', 'lost', 'archived']).optional(),
  assignedTo: z.string().uuid().optional(),
  search:     z.string().optional(),
})

export type CreateDealInput   = z.infer<typeof CreateDealSchema>
export type UpdateDealInput   = z.infer<typeof UpdateDealSchema>
export type MoveDealStageInput = z.infer<typeof MoveDealStageSchema>
export type ListDealsInput    = z.infer<typeof ListDealsSchema>
```

---

## `lib/validators/activity.ts`

```typescript
import { z } from 'zod'

export const CreateActivitySchema = z.object({
  dealId:      z.string().uuid().optional(),
  contactId:   z.string().uuid().optional(),
  type:        z.enum(['task', 'call', 'meeting', 'email', 'note', 'whatsapp', 'instagram']),
  title:       z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  dueDate:     z.string().datetime().optional(),
  assignedTo:  z.string().uuid().optional(),
}).refine(
  (d) => d.dealId || d.contactId,
  { message: 'Informe dealId ou contactId' },
)

export const UpdateActivitySchema = CreateActivitySchema.partial()

export const ListActivitiesSchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(20),
  dealId:    z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  isDone:    z.coerce.boolean().optional(),
  type:      z.enum(['task','call','meeting','email','note','whatsapp','instagram']).optional(),
})

export type CreateActivityInput = z.infer<typeof CreateActivitySchema>
export type ListActivitiesInput = z.infer<typeof ListActivitiesSchema>
```

---

## `lib/validators/webchat.ts`

```typescript
import { z } from 'zod'

export const StartWebchatSchema = z.object({
  visitorName:   z.string().min(1).max(200).optional(),
  visitorEmail:  z.string().email().optional(),
  visitorPhone:  z.string().optional(),
  pageUrl:       z.string().url().optional(),
  lgpdConsent:   z.boolean().refine((v) => v === true, 'Consentimento LGPD obrigatório'),
  utmSource:     z.string().optional(),
  utmMedium:     z.string().optional(),
  utmCampaign:   z.string().optional(),
})

export const SendWebchatMessageSchema = z.object({
  sessionId:    z.string().uuid(),
  content:      z.string().min(1).max(4000),
  contentType:  z.enum(['text', 'image']).default('text'),
  isFromVisitor: z.boolean(),
})

export type StartWebchatInput       = z.infer<typeof StartWebchatSchema>
export type SendWebchatMessageInput = z.infer<typeof SendWebchatMessageSchema>
```

---

## `app/api/v1/contacts/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { contactsWhereClause } from '@/lib/permissions'
import { handleApiError } from '@/lib/errors'
import { logAudit } from '@/lib/audit'
import { CreateContactSchema, ListContactsSchema } from '@/lib/validators/contact'

export async function GET(req: NextRequest) {
  try {
    const user   = await requireAuth()
    const params = ListContactsSchema.parse(Object.fromEntries(req.nextUrl.searchParams))

    const baseWhere = contactsWhereClause(user)
    const where = {
      ...baseWhere,
      ...(params.isB2b !== undefined && { isB2b: params.isB2b }),
      ...(params.pipeline && { pipelineType: params.pipeline }),
      ...(params.source && { leadSource: { type: params.source } }),
      ...(params.search && {
        OR: [
          { fullName:    { contains: params.search, mode: 'insensitive' as const } },
          { email:       { contains: params.search, mode: 'insensitive' as const } },
          { phone:       { contains: params.search } },
          { companyName: { contains: params.search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: { leadSource: true, owner: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take:    params.limit,
        skip:    (params.page - 1) * params.limit,
      }),
      prisma.contact.count({ where }),
    ])

    return NextResponse.json({
      data: items,
      meta: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user  = await requireAuth()
    const input = CreateContactSchema.parse(await req.json())

    const contact = await prisma.contact.create({
      data: {
        ...input,
        assignedTo:   user.id,
        lgpdConsentAt: input.lgpdConsent ? new Date() : undefined,
      },
      include: { leadSource: true },
    })

    await logAudit({ user, action: 'CREATE', tableName: 'contacts', recordId: contact.id })

    return NextResponse.json({ data: contact }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
```

---

## `app/api/v1/contacts/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireContactAccess } from '@/lib/auth'
import { handleApiError, Errors } from '@/lib/errors'
import { logAudit } from '@/lib/audit'
import { UpdateContactSchema } from '@/lib/validators/contact'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user   = await requireAuth()
    const { id } = await params

    const contact = await prisma.contact.findUnique({
      where:   { id, deletedAt: null },
      include: { leadSource: true, owner: true, deals: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } } },
    })
    if (!contact) throw Errors.NOT_FOUND('Contato')
    requireContactAccess(user, contact)

    return NextResponse.json({ data: contact })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user   = await requireAuth()
    const { id } = await params
    const input  = UpdateContactSchema.parse(await req.json())

    const existing = await prisma.contact.findUnique({ where: { id, deletedAt: null } })
    if (!existing) throw Errors.NOT_FOUND('Contato')
    requireContactAccess(user, existing)

    const updated = await prisma.contact.update({
      where: { id },
      data:  input,
    })

    await logAudit({
      user,
      action:        'UPDATE',
      tableName:     'contacts',
      recordId:      id,
      changedFields: Object.keys(input),
      oldValues:     Object.fromEntries(
        Object.keys(input).map(k => [k, (existing as Record<string, unknown>)[k]])
      ),
    })

    return NextResponse.json({ data: updated })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user   = await requireAuth()
    const { id } = await params

    const existing = await prisma.contact.findUnique({ where: { id, deletedAt: null } })
    if (!existing) throw Errors.NOT_FOUND('Contato')
    requireContactAccess(user, existing)

    // Soft delete (LGPD — dados preservados para audit)
    await prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } })
    await logAudit({ user, action: 'DELETE', tableName: 'contacts', recordId: id })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleApiError(err)
  }
}
```

---

## `app/api/v1/deals/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { dealsWhereClause } from '@/lib/permissions'
import { handleApiError } from '@/lib/errors'
import { logAudit } from '@/lib/audit'
import { CreateDealSchema, ListDealsSchema } from '@/lib/validators/deal'

export async function GET(req: NextRequest) {
  try {
    const user   = await requireAuth()
    const params = ListDealsSchema.parse(Object.fromEntries(req.nextUrl.searchParams))

    const baseWhere = dealsWhereClause(user)
    const where = {
      ...baseWhere,
      ...(params.pipelineId && { pipelineId: params.pipelineId }),
      ...(params.stageId    && { stageId: params.stageId }),
      ...(params.status     && { status: params.status }),
      ...(params.assignedTo && { assignedTo: params.assignedTo }),
      ...(params.search     && {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' as const } },
          { contact: { fullName: { contains: params.search, mode: 'insensitive' as const } } },
        ],
      }),
    }

    const [items, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          contact:  { select: { id: true, fullName: true, phone: true, companyName: true } },
          stage:    { select: { id: true, name: true, color: true, probability: true } },
          pipeline: { select: { id: true, name: true, type: true } },
          owner:    { select: { id: true, fullName: true } },
          activities: {
            where:   { isDone: false, isMandatory: true, deletedAt: null },
            select:  { id: true, title: true, dueDate: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take:    params.limit,
        skip:    (params.page - 1) * params.limit,
      }),
      prisma.deal.count({ where }),
    ])

    return NextResponse.json({
      data: items,
      meta: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user  = await requireAuth()
    const input = CreateDealSchema.parse(await req.json())

    // Verificar acesso ao pipeline
    const pipeline = await prisma.pipeline.findUnique({ where: { id: input.pipelineId } })
    if (!pipeline) throw { status: 422, code: 'INVALID_PIPELINE', message: 'Pipeline não encontrado' }

    const deal = await prisma.deal.create({
      data: {
        ...input,
        value:     input.value,
        assignedTo: user.id,
        createdBy:  user.id,
      },
      include: { stage: true, pipeline: true, contact: true },
    })

    await logAudit({ user, action: 'CREATE', tableName: 'deals', recordId: deal.id })

    return NextResponse.json({ data: deal }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
```

---

## `app/api/v1/deals/[id]/stage/route.ts`

```typescript
/**
 * PATCH /api/v1/deals/:id/stage — Mover deal para outro stage
 * HARD BLOCK: se existirem atividades obrigatórias não concluídas, retorna 409.
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireDealOwnership } from '@/lib/auth'
import { handleApiError, Errors } from '@/lib/errors'
import { logAudit } from '@/lib/audit'
import { MoveDealStageSchema } from '@/lib/validators/deal'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user   = await requireAuth()
    const { id } = await params
    const input  = MoveDealStageSchema.parse(await req.json())

    const deal = await prisma.deal.findUnique({
      where: { id, deletedAt: null },
      include: {
        activities: {
          where: { isMandatory: true, isDone: false, deletedAt: null },
        },
      },
    })
    if (!deal) throw Errors.NOT_FOUND('Deal')
    requireDealOwnership(user, deal.assignedTo)

    // ── HARD BLOCK ─────────────────────────────────────────
    if (deal.activities.length > 0) {
      throw Errors.CONFLICT(
        'Existem tarefas obrigatórias pendentes. Conclua-as antes de mover o deal.',
        {
          pendingMandatoryTasks: deal.activities.map(a => ({
            id:    a.id,
            title: a.title,
            dueDate: a.dueDate,
          })),
        },
      )
    }

    const targetStage = await prisma.stage.findUnique({ where: { id: input.stageId } })
    if (!targetStage || targetStage.pipelineId !== deal.pipelineId) {
      throw Errors.UNPROCESSABLE('Stage não pertence ao pipeline deste deal')
    }

    const updated = await prisma.deal.update({
      where: { id },
      data:  {
        stageId:    input.stageId,
        ...(targetStage.isLostStage && {
          status:     'lost',
          closedAt:   new Date(),
          lostReason: input.lostReason,
        }),
        ...(targetStage.isWonStage && {
          status:   'won',
          closedAt: new Date(),
        }),
      },
      include: { stage: true },
    })

    await logAudit({
      user,
      action:        'UPDATE',
      tableName:     'deals',
      recordId:      id,
      changedFields: ['stage_id'],
      oldValues:     { stage_id: deal.stageId },
    })

    return NextResponse.json({ data: updated })
  } catch (err) {
    return handleApiError(err)
  }
}
```

---

## `app/api/v1/activities/[id]/complete/route.ts`

```typescript
/**
 * POST /api/v1/activities/:id/complete — Marcar atividade como concluída
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { handleApiError, Errors } from '@/lib/errors'
import { logAudit } from '@/lib/audit'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user   = await requireAuth()
    const { id } = await params

    const activity = await prisma.activity.findUnique({
      where: { id, deletedAt: null },
    })
    if (!activity) throw Errors.NOT_FOUND('Atividade')
    if (activity.isDone) throw Errors.CONFLICT('Atividade já está concluída')

    // Apenas assignee ou admin/gestor pode concluir
    if (!['admin', 'gestor'].includes(user.role) && activity.assignedTo !== user.id) {
      throw Errors.FORBIDDEN('Você não é o responsável por esta atividade')
    }

    const updated = await prisma.activity.update({
      where: { id },
      data:  { isDone: true, doneAt: new Date() },
    })

    await logAudit({ user, action: 'UPDATE', tableName: 'activities', recordId: id, changedFields: ['is_done'] })

    return NextResponse.json({ data: updated })
  } catch (err) {
    return handleApiError(err)
  }
}
```

---

## `app/api/v1/dashboard/kpis/route.ts`

```typescript
/**
 * GET /api/v1/dashboard/kpis — KPIs por vendedor e período
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { z } from 'zod'

const KPIsQuerySchema = z.object({
  period:     z.enum(['7d', '30d', '90d', 'custom']).default('30d'),
  startDate:  z.string().date().optional(),
  endDate:    z.string().date().optional(),
  userId:     z.string().uuid().optional(),
  pipeline:   z.enum(['atacado', 'varejo']).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const user   = await requireAuth()
    const params = KPIsQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams))

    // Calcular intervalo de datas
    const now    = new Date()
    let startAt: Date
    if (params.period === 'custom' && params.startDate) {
      startAt = new Date(params.startDate)
    } else {
      const days = params.period === '7d' ? 7 : params.period === '90d' ? 90 : 30
      startAt = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    }
    const endAt = params.endDate ? new Date(params.endDate) : now

    // Para gestor/admin: podem ver KPIs de outro vendedor
    // Para vendedor: apenas os próprios
    const targetUserId =
      ['admin', 'gestor'].includes(user.role) && params.userId
        ? params.userId
        : user.id

    const [
      totalDeals,
      wonDeals,
      lostDeals,
      totalRevenue,
      newLeads,
      activitiesDone,
      activitiesOverdue,
      avgDealValue,
    ] = await Promise.all([
      prisma.deal.count({
        where: {
          assignedTo: targetUserId,
          createdAt:  { gte: startAt, lte: endAt },
          deletedAt:  null,
          ...(params.pipeline && { pipeline: { type: params.pipeline } }),
        },
      }),
      prisma.deal.count({
        where: {
          assignedTo: targetUserId,
          status:     'won',
          closedAt:   { gte: startAt, lte: endAt },
          ...(params.pipeline && { pipeline: { type: params.pipeline } }),
        },
      }),
      prisma.deal.count({
        where: {
          assignedTo: targetUserId,
          status:     'lost',
          closedAt:   { gte: startAt, lte: endAt },
          ...(params.pipeline && { pipeline: { type: params.pipeline } }),
        },
      }),
      prisma.deal.aggregate({
        where: {
          assignedTo: targetUserId,
          status:     'won',
          closedAt:   { gte: startAt, lte: endAt },
          ...(params.pipeline && { pipeline: { type: params.pipeline } }),
        },
        _sum: { value: true },
      }),
      prisma.contact.count({
        where: {
          assignedTo: targetUserId,
          createdAt:  { gte: startAt, lte: endAt },
          deletedAt:  null,
        },
      }),
      prisma.activity.count({
        where: {
          assignedTo: targetUserId,
          isDone:     true,
          doneAt:     { gte: startAt, lte: endAt },
        },
      }),
      prisma.activity.count({
        where: {
          assignedTo: targetUserId,
          isDone:     false,
          dueDate:    { lt: now },
          deletedAt:  null,
        },
      }),
      prisma.deal.aggregate({
        where: {
          assignedTo: targetUserId,
          status:     'won',
          closedAt:   { gte: startAt, lte: endAt },
          value:      { not: null },
          ...(params.pipeline && { pipeline: { type: params.pipeline } }),
        },
        _avg: { value: true },
      }),
    ])

    const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0

    return NextResponse.json({
      data: {
        period:           { start: startAt, end: endAt },
        totalDeals,
        wonDeals,
        lostDeals,
        openDeals:        totalDeals - wonDeals - lostDeals,
        conversionRate:   Math.round(conversionRate * 10) / 10,
        totalRevenue:     Number(totalRevenue._sum.value ?? 0),
        avgDealValue:     Number(avgDealValue._avg.value ?? 0),
        newLeads,
        activitiesDone,
        activitiesOverdue,
      },
    })
  } catch (err) {
    return handleApiError(err)
  }
}
```

---

## `app/api/v1/webhooks/whatsapp/route.ts`

```typescript
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
```

---

## `app/api/v1/webhooks/instagram/route.ts`

```typescript
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
```

---

## `app/api/v1/public/leads/route.ts`

```typescript
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
```

---

## `app/api/v1/webchat/sessions/route.ts`

```typescript
/**
 * GET  /api/v1/webchat/sessions — Lista sessões ativas (operadores)
 * POST /api/v1/webchat/sessions — Iniciar sessão de chat (visitante — público)
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { StartWebchatSchema } from '@/lib/validators/webchat'
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
    const ua     = req.headers.get('user-agent') ?? undefined

    const sessionId      = randomUUID()
    const realtimeChannel = `webchat:${sessionId}`

    const session = await prisma.webchatSession.create({
      data: {
        visitorName:     input.visitorName,
        visitorEmail:    input.visitorEmail,
        visitorPhone:    input.visitorPhone,
        visitorIp:       ip,
        visitorUserAgent: ua,
        lgpdConsent:     true,
        lgpdConsentAt:   new Date(),
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
        realtimeChannel: session.realtimeChannel,
        supabaseUrl:     process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    }, { status: 201 })
  } catch (err) {
    return handleApiError(err)
  }
}
```

---

## `app/api/v1/whatsapp/send/route.ts`

```typescript
/**
 * POST /api/v1/whatsapp/send — Enviar mensagem WhatsApp (outbound)
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { logAudit } from '@/lib/audit'
import { sendWhatsAppText, sendWhatsAppTemplate } from '@/lib/whatsapp'

const SendMessageSchema = z.object({
  contactId:    z.string().uuid(),
  type:         z.enum(['text', 'template']),
  text:         z.string().max(4096).optional(),
  templateName: z.string().optional(),
  templateLang: z.string().default('pt_BR'),
}).refine(
  (d) => (d.type === 'text' && d.text) || (d.type === 'template' && d.templateName),
  { message: 'Informe text para tipo "text" ou templateName para tipo "template"' },
)

export async function POST(req: NextRequest) {
  try {
    const user  = await requireAuth()
    const input = SendMessageSchema.parse(await req.json())

    const contact = await prisma.contact.findUnique({
      where: { id: input.contactId, deletedAt: null },
    })
    if (!contact?.whatsappPhone) {
      throw { status: 422, code: 'NO_WHATSAPP', message: 'Contato sem número WhatsApp cadastrado' }
    }
    if (!contact.lgpdConsent) {
      throw { status: 422, code: 'NO_LGPD_CONSENT', message: 'Contato sem consentimento LGPD para comunicações' }
    }

    let metaMessageId: string
    if (input.type === 'text') {
      metaMessageId = await sendWhatsAppText(contact.whatsappPhone, input.text!)
    } else {
      metaMessageId = await sendWhatsAppTemplate(contact.whatsappPhone, input.templateName!, input.templateLang)
    }

    // Registrar no banco
    const waMsg = await prisma.whatsappMessage.create({
      data: {
        contactId:         contact.id,
        metaMessageId,
        metaPhoneNumberId: process.env.META_PHONE_NUMBER_ID!,
        direction:         'outbound',
        status:            'sent',
        contentType:       input.type,
        contentText:       input.text,
        templateName:      input.templateName,
        metaRawPayload:    { sent_by: user.id, type: input.type } as object,
      },
    })

    await prisma.interaction.create({
      data: {
        contactId:         contact.id,
        userId:            user.id,
        channel:           'whatsapp',
        direction:         'outbound',
        content:           input.text ?? `[template: ${input.templateName}]`,
        whatsappMessageId: waMsg.id,
      },
    })

    await logAudit({
      user,
      action:    'CREATE',
      tableName: 'whatsapp_messages',
      recordId:  waMsg.id,
    })

    return NextResponse.json({ data: { messageId: metaMessageId } })
  } catch (err) {
    return handleApiError(err)
  }
}
```

---

## `app/api/cron/lgpd-purge/route.ts`

```typescript
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
```

---

## `app/api/cron/whatsapp-retry/route.ts`

```typescript
/**
 * Vercel Cron: WhatsApp Retry — a cada 5 minutos
 * Reprocessa mensagens com status 'failed' e retryNextAt <= now
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireCronSecret } from '@/lib/auth'
import { sendWhatsAppText } from '@/lib/whatsapp'

export const runtime    = 'nodejs'
export const maxDuration = 30

const MAX_RETRIES = 5

export async function GET(req: NextRequest) {
  try {
    requireCronSecret(req)

    const pending = await prisma.whatsappMessage.findMany({
      where: {
        status:      'failed',
        direction:   'outbound',
        retryCount:  { lt: MAX_RETRIES },
        retryNextAt: { lte: new Date() },
      },
      include: { contact: true },
      take:    20,
    })

    let retried = 0, failed = 0
    for (const msg of pending) {
      if (!msg.contact?.whatsappPhone || !msg.contentText) {
        await prisma.whatsappMessage.update({
          where: { id: msg.id },
          data:  { retryCount: MAX_RETRIES, status: 'failed' },
        })
        continue
      }

      try {
        const newMsgId = await sendWhatsAppText(msg.contact.whatsappPhone, msg.contentText)

        await prisma.whatsappMessage.update({
          where: { id: msg.id },
          data:  {
            status:       'sent',
            metaMessageId: newMsgId,
            errorCode:    null,
            errorMessage: null,
          },
        })
        retried++
      } catch (err) {
        const nextDelay = Math.pow(2, msg.retryCount) * 5 * 60 * 1000 // exponential backoff
        await prisma.whatsappMessage.update({
          where: { id: msg.id },
          data:  {
            retryCount:   { increment: 1 },
            retryNextAt:  new Date(Date.now() + nextDelay),
            errorMessage: err instanceof Error ? err.message : String(err),
          },
        })
        failed++
      }
    }

    return NextResponse.json({ retried, failed, total: pending.length })
  } catch (err) {
    console.error('[WA Retry] Erro:', err)
    return NextResponse.json({ error: 'Retry falhou' }, { status: 500 })
  }
}
```

---

## `app/api/cron/webchat-expire/route.ts`

```typescript
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
```

---

## `middleware.ts`

```typescript
/**
 * middleware.ts — Proteção de rotas Next.js
 * Rotas /app/* exigem autenticação via Supabase SSR
 * Rotas /api/v1/public/* e /api/v1/webhooks/* são públicas
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get:    (name) => req.cookies.get(name)?.value,
        set:    (name, value, opts) => { res.cookies.set(name, value, opts) },
        remove: (name, opts) => { res.cookies.delete({ name, ...opts }) },
      },
    },
  )

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Rotas públicas — sem proteção
  const isPublic =
    pathname.startsWith('/api/v1/public/') ||
    pathname.startsWith('/api/v1/webhooks/') ||
    pathname.startsWith('/api/cron/') ||
    pathname === '/login' ||
    pathname === '/auth/callback'

  if (isPublic) return res

  // Redirecionar para /login se não autenticado
  if (!session) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
```

---

## `vercel.json`

```json
{
  "crons": [
    {
      "path":     "/api/cron/lgpd-purge",
      "schedule": "0 2 1 * *"
    },
    {
      "path":     "/api/cron/whatsapp-retry",
      "schedule": "*/5 * * * *"
    },
    {
      "path":     "/api/cron/webchat-expire",
      "schedule": "*/15 * * * *"
    }
  ],
  "functions": {
    "app/api/cron/lgpd-purge/route.ts":    { "maxDuration": 300 },
    "app/api/cron/whatsapp-retry/route.ts": { "maxDuration": 30  },
    "app/api/cron/webchat-expire/route.ts": { "maxDuration": 30  }
  }
}
```

---

## `.env.example`

```bash
# ═══════════════════════════════════════════════════
# CRM Techmalhas — Variáveis de Ambiente
# Copiar para .env.local e preencher com valores reais
# ═══════════════════════════════════════════════════

# ─── Supabase ────────────────────────────────────────
# Configurações do projeto Supabase (Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Chaves server-side (nunca expor no cliente!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ─── Banco de Dados (Prisma) ────────────────────────
# Settings > Database > Connection string
DATABASE_URL="postgresql://postgres.xxxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?connection_limit=1&pool_timeout=0"
DIRECT_URL="postgresql://postgres:senha@db.xxxx.supabase.co:5432/postgres"

# ─── Meta / WhatsApp Cloud API ──────────────────────
# Meta Business > WhatsApp > Configuration
META_APP_ID=123456789
META_APP_SECRET=abc123def456...          # Segredo do App Meta — para validar assinaturas
META_WHATSAPP_TOKEN=EAAxxxxxxxxxx...     # System User Token (não expira)
META_PHONE_NUMBER_ID=1234567890         # Phone Number ID do número de negócios
META_WABA_ID=0987654321                 # WhatsApp Business Account ID
META_WEBHOOK_VERIFY_TOKEN=meu-token-secreto-para-verificar-webhook

# ─── Meta / Instagram Messaging API ────────────────
META_INSTAGRAM_TOKEN=EAAxxxxxxxxxx...   # Token do app Meta com permissão instagram_manage_messages
META_INSTAGRAM_ACCOUNT_ID=1234567890   # Instagram Business Account ID
INSTAGRAM_ENABLED=false                # true apenas após aprovação Meta (2-4 semanas)

# ─── Vercel Cron (segurança) ────────────────────────
CRON_SECRET=um-segredo-aleatorio-longo-para-proteger-crons

# ─── App ────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://crm.techmalhas.com.br
NODE_ENV=production                     # development | production
```

---

## `package.json` (dependências relevantes)

```json
{
  "name": "crm-techmalhas",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev":         "next dev --turbopack",
    "build":       "next build",
    "start":       "next start",
    "lint":        "next lint",
    "type-check":  "tsc --noEmit",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "next":                   "^15.0.0",
    "react":                  "^19.0.0",
    "react-dom":              "^19.0.0",
    "@prisma/client":         "^6.0.0",
    "@supabase/supabase-js":  "^2.45.0",
    "@supabase/ssr":          "^0.5.0",
    "zod":                    "^3.23.0",
    "tailwindcss":            "^3.4.0",
    "@radix-ui/react-*":      "latest"
  },
  "devDependencies": {
    "prisma":              "^6.0.0",
    "tsx":                 "^4.0.0",
    "typescript":          "^5.6.0",
    "@types/node":         "^20.0.0",
    "@types/react":        "^19.0.0",
    "@types/react-dom":    "^19.0.0",
    "eslint":              "^9.0.0",
    "eslint-config-next":  "^15.0.0"
  }
}
```

---

## Comandos Úteis

```bash
# ─── Desenvolvimento ────────────────────────────────
pnpm dev          # Next.js em localhost:3000 (hot reload)
pnpm type-check   # TypeScript sem compilar
pnpm lint         # ESLint

# ─── Testar endpoints (exemplos com curl) ──────────

# 1. Listar contatos (requer cookie de sessão Supabase)
curl -X GET "http://localhost:3000/api/v1/contacts?page=1&limit=10" \
  -H "Cookie: sb-access-token=..."

# 2. Criar lead público (formulário do site — sem auth)
curl -X POST "http://localhost:3000/api/v1/public/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Maria Teste",
    "email": "maria@exemplo.com",
    "phone": "+5511999999999",
    "message": "Gostaria de saber mais sobre seus produtos",
    "lgpdConsent": true,
    "pageUrl": "https://techmalhas.com.br/contato"
  }'

# 3. Mover deal de stage (hard block se houver tarefas pendentes)
curl -X PATCH "http://localhost:3000/api/v1/deals/{dealId}/stage" \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"stageId": "uuid-do-stage-alvo"}'
# → 409 se houver atividades obrigatórias pendentes

# 4. Simular webhook WhatsApp (dev)
curl -X GET "http://localhost:3000/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=meu-token&hub.challenge=abc123"
# → Deve retornar: abc123

# 5. Testar cron manualmente (requer CRON_SECRET no header)
curl -X GET "http://localhost:3000/api/cron/webchat-expire" \
  -H "Authorization: Bearer ${CRON_SECRET}"

# ─── Deploy (Vercel) ────────────────────────────────
vercel --prod   # Deploy manual (normalmente via GitHub Actions)
```

---

## Notas Técnicas

### 1. Idempotência do webhook WhatsApp
O campo `meta_message_id` (UNIQUE) garante que uma mensagem nunca seja processada duas vezes, mesmo que a Meta faça retry. O `findUnique` antes do `create` é O(1) por índice.

### 2. Hard block de tarefas obrigatórias
`PATCH /api/v1/deals/:id/stage` retorna **HTTP 409** com a lista de tarefas pendentes. O frontend deve mostrar a UI bloqueada (componente `ObligatoryTaskBlocker` do design system). O banco de dados **também** faz a verificação via trigger para dupla proteção.

### 3. Webhook Instagram — Feature Toggle
O módulo Instagram está 100% implementado mas inativo (`INSTAGRAM_ENABLED=false`). Quando a Meta aprovar o app, basta mudar para `true` na variável de ambiente — zero deploy necessário.

### 4. Segurança dos Cron Jobs
Crons são protegidos por `CRON_SECRET` no header `Authorization`. Vercel injeta automaticamente quando configurado no dashboard — externo não consegue acionar.

### 5. Audit Log — Fire and Forget
`logAudit()` usa `.catch()` para não interromper o fluxo principal se o log falhar. Em produção, adicionar Sentry ou Datadog para alertar sobre falhas de audit.

### 6. LGPD no endpoint público
`POST /api/v1/public/leads` valida `lgpdConsent: true` via Zod. Se `false`, retorna 422 antes de qualquer persistência de dados.

### 7. Rate limiting em memória
O rate limiting atual é in-memory por instância Vercel. Para produção com tráfego alto, substituir por Upstash Redis (compatível com Vercel Edge, ~$5/mês).
