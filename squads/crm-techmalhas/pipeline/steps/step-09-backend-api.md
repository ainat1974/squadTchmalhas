---
execution: subagent
agent: fullstack-developer
inputFile: squads/crm-techmalhas/output/code/db-schema.md
outputFile: squads/crm-techmalhas/output/code/backend.md
model_tier: powerful
---

# Step 09: API REST + Integração WhatsApp Cloud API

## Context Loading

Load these files before executing:
- `squads/crm-techmalhas/output/code/db-schema.md` — schema Prisma do Step 08
- `squads/crm-techmalhas/output/architecture.md` — spec da API completa
- `squads/crm-techmalhas/output/requirements.md` — user stories
- `squads/crm-techmalhas/pipeline/data/domain-framework.md` — padrões de API REST

## Instructions

### Process

1. **Implementar cada endpoint da spec do Arnaldo** — para cada user story, criar route handler em `app/api/v1/{resource}/route.ts` ou `app/api/v1/{resource}/[id]/route.ts`. Cada handler: Zod validator, autenticação, RBAC, lógica, response, error handling, audit log.
2. **Implementar libs auxiliares:**
   - `lib/auth.ts` — `requireAuth(req)`, `requireRole(user, roles)`, `requireDealAccess(user, deal)`, etc.
   - `lib/errors.ts` — `ApiError` class, `handleApiError(err)` middleware
   - `lib/audit.ts` — `logAudit(user, action, resourceType, resourceId, metadata?)`
   - `lib/permissions.ts` — checks de RBAC reutilizáveis
   - `lib/whatsapp.ts` — client Meta Cloud API (sendTemplate, sendText, verifyWebhookSignature, parseWebhookPayload)
   - `lib/validators/` — schemas Zod por recurso (lead.ts, deal.ts, activity.ts, etc.)
3. **Implementar webhook WhatsApp** — `app/api/v1/webhooks/whatsapp/route.ts` com GET (verificação) e POST (recebimento idempotente).
4. **Implementar Cron jobs** — `app/api/cron/overdue-activities/route.ts` chamado diariamente pelo Vercel Cron.
5. **Configurar `vercel.json`** — declarando os cron jobs.
6. **Atualizar `package.json`** com deps necessárias (`zod`, `@supabase/supabase-js`, etc.) e scripts.
7. **Produzir documento** seguindo Output Format, salvando em `squads/crm-techmalhas/output/code/backend.md`. O documento DEVE conter todos os arquivos gerados com seus caminhos.

## Output Format

```markdown
# Backend Implementation — CRM Techmalhas

> **TL;DR:** [N] endpoints REST + webhook WhatsApp + [N] cron jobs.

## Estrutura de Arquivos
\`\`\`
app/api/
├── v1/
│   ├── contacts/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── deals/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── [id]/move/route.ts
│   ├── activities/
│   │   ├── route.ts
│   │   └── [id]/complete/route.ts
│   ├── pipelines/route.ts
│   ├── users/route.ts
│   ├── dashboard/route.ts
│   ├── whatsapp/send/route.ts
│   └── webhooks/whatsapp/route.ts
└── cron/
    └── overdue-activities/route.ts
lib/
├── auth.ts
├── errors.ts
├── audit.ts
├── permissions.ts
├── whatsapp.ts
└── validators/
    ├── contact.ts
    ├── deal.ts
    └── activity.ts
vercel.json
package.json
\`\`\`

## Arquivos

### `lib/auth.ts`
\`\`\`typescript
[código completo]
\`\`\`

### `lib/errors.ts`
\`\`\`typescript
[código completo]
\`\`\`

[seguem TODOS os arquivos com código completo]

## Comandos
[Como rodar localmente, testar endpoints com curl]

## Variáveis de Ambiente Adicionais
[Novas variáveis vs Step 08]
```

## Output Example

```markdown
# Backend Implementation — CRM Techmalhas

> **TL;DR:** 18 endpoints REST + webhook WhatsApp idempotente + 1 cron de overdue.

## `lib/errors.ts`

\`\`\`typescript
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public message: string,
    public details?: unknown,
  ) { super(message); }
}

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', issues: err.issues } },
      { status: 422 },
    );
  }
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) } },
      { status: err.status },
    );
  }
  console.error('[unhandled]', err);
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } },
    { status: 500 },
  );
}
\`\`\`

## `lib/auth.ts`

\`\`\`typescript
import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ApiError } from './errors';
import { prisma } from './db';
import type { User, UserRole } from '@prisma/client';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({ where: { id: user.id } });
}

export async function requireAuth(_req: NextRequest): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, 'UNAUTHENTICATED', 'Autenticação necessária');
  return user;
}

export function requireRole(user: User, roles: UserRole[]): void {
  if (!roles.includes(user.role)) {
    throw new ApiError(403, 'FORBIDDEN', `Requer role: ${roles.join(' ou ')}`);
  }
}

export async function requireDealAccess(user: User, dealOwnerId: string): Promise<void> {
  if (user.role === 'admin' || user.role === 'gestor') return;
  if (user.id !== dealOwnerId) {
    throw new ApiError(403, 'FORBIDDEN', 'Acesso negado a este deal');
  }
}
\`\`\`

## `lib/whatsapp.ts`

\`\`\`typescript
import crypto from 'node:crypto';

const META_API = 'https://graph.facebook.com/v20.0';
const TOKEN = process.env.META_WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID!;
const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN!;

export function verifyWebhook(req: { url: string }) {
  const params = new URL(req.url).searchParams;
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');
  if (mode === 'subscribe' && token === VERIFY_TOKEN) return challenge;
  return null;
}

export function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = 'sha256=' + crypto
    .createHmac('sha256', process.env.META_APP_SECRET!)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function sendTextMessage(to: string, body: string) {
  const res = await fetch(`${META_API}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(`WhatsApp send failed: ${JSON.stringify(error)}`);
  }
  return res.json();
}

export async function sendTemplateMessage(to: string, templateName: string, langCode = 'pt_BR') {
  const res = await fetch(`${META_API}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: { name: templateName, language: { code: langCode } },
    }),
  });
  if (!res.ok) throw new Error('Template send failed');
  return res.json();
}
\`\`\`

## `app/api/v1/webhooks/whatsapp/route.ts`

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWebhook, verifySignature } from '@/lib/whatsapp';

export async function GET(req: NextRequest) {
  const challenge = verifyWebhook(req);
  return challenge
    ? new NextResponse(challenge, { status: 200 })
    : new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const messages = body.entry?.[0]?.changes?.[0]?.value?.messages ?? [];

  for (const msg of messages) {
    const existing = await prisma.whatsappMessage.findUnique({
      where: { metaMessageId: msg.id },
    });
    if (existing) continue;

    const contact = await prisma.contact.upsert({
      where: { phone: msg.from },
      create: {
        name: `Lead WhatsApp ${msg.from.slice(-4)}`,
        phone: msg.from,
        type: 'lead',
        source: 'whatsapp',
      },
      update: {},
    });

    const interaction = await prisma.interaction.create({
      data: {
        contactId: contact.id,
        channel: 'whatsapp',
        direction: 'in',
        body: msg.text?.body ?? `[${msg.type}]`,
        metadataJson: msg,
      },
    });

    await prisma.whatsappMessage.create({
      data: {
        interactionId: interaction.id,
        metaMessageId: msg.id,
        status: 'received',
      },
    });
  }

  return NextResponse.json({ received: messages.length });
}
\`\`\`

## `app/api/v1/contacts/route.ts`

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { handleApiError } from '@/lib/errors';
import { logAudit } from '@/lib/audit';

const ListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['lead', 'customer', 'lost']).optional(),
});

const CreateContact = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().regex(/^\+?[1-9]\d{10,14}$/),
  email: z.string().email().optional(),
  company_name: z.string().max(200).optional(),
  type: z.enum(['lead', 'customer']).default('lead'),
  source: z.string().optional(),
  consent_lgpd: z.boolean(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const params = ListQuery.parse(Object.fromEntries(req.nextUrl.searchParams));

    const where = {
      deletedAt: null,
      ...(params.type && { type: params.type }),
      ...(user.role === 'vendedor' && { ownerId: user.id }),
    };

    const [items, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        take: params.limit,
        skip: (params.page - 1) * params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({ data: items, meta: { ...params, total } });
  } catch (err) { return handleApiError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = CreateContact.parse(await req.json());
    const contact = await prisma.contact.create({
      data: {
        ...body,
        companyName: body.company_name,
        ownerId: user.id,
        consentLgpd: body.consent_lgpd,
        consentAt: body.consent_lgpd ? new Date() : null,
      },
    });
    await logAudit(user, 'contact.create', 'contact', contact.id);
    return NextResponse.json({ data: contact }, { status: 201 });
  } catch (err) { return handleApiError(err); }
}
\`\`\`

## `vercel.json`

\`\`\`json
{
  "crons": [
    { "path": "/api/cron/overdue-activities", "schedule": "0 6 * * *" }
  ]
}
\`\`\`

[seguem outros endpoints: /deals, /deals/[id]/move, /activities, /activities/[id]/complete, /dashboard, etc.]

## Comandos

\`\`\`bash
# Rodar local
pnpm dev

# Testar endpoint (requer login antes)
curl -X POST http://localhost:3000/api/v1/contacts \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"name":"João","phone":"+5511999999999","type":"lead","consent_lgpd":true}'
\`\`\`

## Variáveis de Ambiente Adicionais
- `META_APP_SECRET` (para validar assinatura do webhook)
```

## Veto Conditions

Reject and redo if ANY are true:
1. Algum endpoint sem validação Zod
2. Algum endpoint sem RBAC (mesmo que apenas `requireAuth`)
3. Webhook WhatsApp sem idempotência (dedup por `meta_message_id`)
4. Webhook WhatsApp sem verificação de assinatura
5. Cron job sem `vercel.json` declarando schedule
6. Operação de PII sem `audit_log`

## Quality Criteria

- [ ] 15+ endpoints REST cobrindo todas as user stories essenciais
- [ ] Webhook WhatsApp com verificação + idempotência
- [ ] Cron de overdue-activities configurado
- [ ] Libs auxiliares completas (auth, errors, audit, permissions, whatsapp, validators)
- [ ] Toda operação de PII gera audit_log
- [ ] `vercel.json` com cron jobs
- [ ] Comandos de teste documentados
