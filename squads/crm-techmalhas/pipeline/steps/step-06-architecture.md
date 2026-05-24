---
execution: subagent
agent: system-architect
inputFile: squads/crm-techmalhas/output/requirements.md
outputFile: squads/crm-techmalhas/output/architecture.md
model_tier: powerful
---

# Step 06: Arquitetura de Sistemas e Modelo de Dados

## Context Loading

Load these files before executing:
- `squads/crm-techmalhas/output/requirements.md` — user stories
- `squads/crm-techmalhas/output/wireframes.md` — telas e componentes
- `squads/crm-techmalhas/output/design-system.md` — tokens e tailwind config
- `squads/crm-techmalhas/output/scope-decision.md` — ajustes do Checkpoint 1 (especialmente sobre Dapic)
- `squads/crm-techmalhas/pipeline/data/domain-framework.md` — padrões SaaS, ERD base
- `squads/crm-techmalhas/pipeline/data/anti-patterns.md` — evitar over-engineering

## Instructions

### Process

1. **Confirmar stack final com ADRs** — Prisma vs Drizzle (ADR-001), Supabase Auth vs Clerk (ADR-002), Vercel Cron vs Trigger.dev (ADR-003), Estratégia Dapic (ADR-004 conforme Checkpoint 1).
2. **Desenhar diagrama de arquitetura** em Mermaid (componentes: Next.js app, API routes, Supabase Postgres + Auth, Meta Cloud API, Vercel Cron, Webhook Meta).
3. **Modelar ERD completo** — todas as tabelas (users, contacts, deals, pipelines, stages, activities, interactions, whatsapp_messages, audit_logs, stage_required_tasks, notifications). Para cada: colunas com tipos PG corretos, índices, constraints, FK, RLS policies sugeridas.
4. **Especificar API REST** — para cada user story, listar endpoints (método, path, params, body Zod, response, status codes, RBAC). Cobertura: leads, contacts, deals, pipelines, stages, activities, interactions, whatsapp, users, dashboard.
5. **Projetar integração WhatsApp Cloud API** — fluxo de auth (System User Access Token), verificação de webhook, recebimento de mensagens (text, image, audio, document), envio (template + free-form), idempotência via `meta_message_id`, retry strategy, tratamento de erros.
6. **Plano LGPD** — inventário de PII por tabela, base legal (legítimo interesse, consentimento), retenção (5 anos para clientes ativos, 90 dias para leads não convertidos), exclusão (soft delete + cron mensal de purge), audit_log obrigatório em CRUD de PII.
7. **Plano de Deploy** — estrutura `.env.example`, scripts em `package.json` (`dev`, `build`, `start`, `lint`, `typecheck`, `test`, `prisma:migrate`, `prisma:seed`), GitHub Actions (lint + test + typecheck), Vercel config (build command, env vars, cron jobs).
8. **Estimar custos mensais** — Vercel Pro (US$20), Supabase Pro (US$25), Meta WhatsApp (free até 1000/mês, depois ~US$0.05/conversa), domínio (~R$40/ano), total mensal estimado.
9. **Produzir documento** seguindo Output Format.

## Output Format

```markdown
# Arquitetura — CRM Techmalhas

> **TL;DR:** [stack + decisões-chave em 2-3 frases]

## 1. ADRs (Architecture Decision Records)

### ADR-001: ORM
### ADR-002: Auth
### ADR-003: Jobs
### ADR-004: Estratégia Dapic
[cada ADR com Status, Contexto, Decisão, Alternativas, Consequências]

## 2. Diagrama de Arquitetura
\`\`\`mermaid
[diagrama dos componentes]
\`\`\`

## 3. Modelo de Dados (ERD)
\`\`\`sql
[CREATE TABLE para cada tabela com índices, RLS]
\`\`\`

## 4. Especificação da API
### Endpoints por Recurso
#### POST /api/v1/leads
[método, request, response, status, RBAC]
[repete para todos os endpoints]

## 5. Integração WhatsApp Cloud API
### Auth
### Webhook
### Envio
### Idempotência
### Retry

## 6. Plano LGPD
### Inventário PII
### Base Legal por Dado
### Retenção
### Exclusão
### Audit

## 7. Plano de Deploy
### .env.example
\`\`\`
[todas variáveis]
\`\`\`
### package.json scripts
### GitHub Actions
### Vercel Config

## 8. Custo Estimado Mensal
[Tabela]

## 9. Riscos Técnicos e Mitigações
[Lista]
```

## Output Example

```markdown
# Arquitetura — CRM Techmalhas

> **TL;DR:** Next.js 15 + TypeScript estrito + Prisma 6.x + Postgres (Supabase) + Vercel.
> Auth via Supabase. Jobs via Vercel Cron. WhatsApp via Meta Cloud API com webhook
> idempotente. LGPD por design com RLS + audit_log. Custo estimado: US$45/mês no MVP.

## 1. ADRs

### ADR-001: Prisma 6.x como ORM
**Status:** Aprovado
**Contexto:** Precisamos de ORM TypeScript-first para Next.js + Postgres.
**Decisão:** Adotar Prisma 6.x.
**Alternativas:** Drizzle (mais performático mas menos exemplos), Kysely (sem migrations).
**Consequências (+):** Schema declarativo, migrations auto-geradas, ecossistema rico.
**Consequências (-):** Bundle maior, ligeiramente menos performático em queries pesadas.

[ADR-002, ADR-003, ADR-004 seguem o mesmo padrão]

## 2. Diagrama de Arquitetura

\`\`\`mermaid
flowchart LR
  User[Vitor/Amanda/Renato] -->|Browser| NextApp[Next.js 15 App]
  WhatsApp[Cliente WhatsApp] -->|Mensagem| MetaAPI[Meta Cloud API]
  MetaAPI -->|Webhook POST| NextApp
  NextApp -->|SQL via Prisma| Postgres[(Supabase Postgres)]
  NextApp -->|Auth| SupaAuth[Supabase Auth]
  NextApp -->|Realtime| SupaRealtime[Supabase Realtime]
  NextApp -->|Send| MetaAPI
  VercelCron[Vercel Cron] -->|Daily 06:00| NextApp
  NextApp -.->|Futuro| Dapic[ERP Dapic]
\`\`\`

## 3. Modelo de Dados (ERD)

\`\`\`sql
-- Users (sincronizado com auth.users do Supabase via trigger)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'gestor', 'vendedor')) DEFAULT 'vendedor',
  last_assigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_select ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY users_update_self ON users FOR UPDATE USING (auth.uid() = id);

-- Contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  company_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('lead', 'customer', 'lost')) DEFAULT 'lead',
  source TEXT,
  owner_id UUID REFERENCES users(id),
  dapic_id TEXT UNIQUE,  -- reservado para integração futura
  consent_lgpd BOOLEAN DEFAULT FALSE,
  consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_contacts_phone ON contacts(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_owner ON contacts(owner_id) WHERE deleted_at IS NULL;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contacts_select ON contacts FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) IN ('admin','gestor'));

-- [seguem todas as outras tabelas: pipelines, stages, deals, activities, stage_required_tasks, interactions, whatsapp_messages, audit_logs, notifications]
\`\`\`

## 4. Especificação da API

### Endpoints de Leads/Contacts

#### GET /api/v1/contacts
**RBAC:** authenticated
**Query:** page, limit, type, source, owner_id (apenas admin/gestor)
**Response 200:** `{ data: Contact[], meta: { page, limit, total } }`

#### POST /api/v1/contacts
**RBAC:** authenticated
**Body (Zod):**
\`\`\`typescript
{
  name: z.string().min(1).max(200),
  phone: z.string().regex(E164_REGEX),
  email: z.string().email().optional(),
  type: z.enum(['lead', 'customer']),
  source: z.string().optional(),
  consent_lgpd: z.boolean(),
}
\`\`\`
**Response 201:** `{ data: Contact }`
**Errors:** 422 (validação), 409 (telefone duplicado)

[seguem todos os endpoints]

## 5. Integração WhatsApp Cloud API

### Auth
Permanent System User Access Token gerado no Meta Business Manager,
guardado em `META_WHATSAPP_TOKEN` (Vercel env). Phone Number ID em `META_PHONE_NUMBER_ID`.

### Webhook
- URL pública: `https://crm.techmalhas.com.br/api/v1/webhooks/whatsapp`
- Verify token: `META_WEBHOOK_VERIFY_TOKEN`
- Verificação inicial: GET com `hub.mode=subscribe` retorna `hub.challenge`
- Recebimento: POST validado por assinatura X-Hub-Signature-256

### Envio
- Template messages (fora da janela 24h): chamada para `/messages` com `template`
- Free-form (dentro da janela 24h): chamada para `/messages` com `text`

### Idempotência
- Cada mensagem da Meta tem `messages[].id`
- Antes de processar, verifica se `whatsapp_messages.meta_message_id` já existe
- Se existe → 200 OK sem processar (Meta retransmite até 30x)

### Retry
- Envio falha (não 200) → enfileira em `failed_messages` table, retry exponencial (1min, 5min, 30min)
- Após 3 falhas → notifica admin

## 6. Plano LGPD

### Inventário PII
| Tabela | Coluna | Categoria | Base Legal |
|---|---|---|---|
| contacts | name | PII básico | Legítimo interesse |
| contacts | phone | PII básico | Legítimo interesse (B2B) / Consentimento (B2C) |
| contacts | email | PII básico | Legítimo interesse |
| interactions | body | Conteúdo de comunicação | Legítimo interesse |
| audit_logs | ip | PII técnico | Obrigação legal (LGPD art. 16) |

### Retenção
- Leads não convertidos: 90 dias após última interação → soft delete
- Clientes ativos: 5 anos após última compra → soft delete
- Soft delete: `deleted_at` setado, dados retidos por 30 dias para recuperação
- Hard delete após 30 dias: cron mensal anonimiza nome/email/telefone

### Exclusão (Direito ao Esquecimento)
- Usuário titular pode solicitar via formulário público
- Admin processa em até 15 dias (LGPD art. 19)

### Audit
- Toda leitura/escrita de PII gera `audit_log` (action, resource_type, resource_id, user_id, ip)

## 7. Plano de Deploy

### .env.example
\`\`\`
# Database
DATABASE_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Auth
NEXTAUTH_SECRET=...

# Meta WhatsApp
META_WHATSAPP_TOKEN=...
META_PHONE_NUMBER_ID=...
META_WEBHOOK_VERIFY_TOKEN=...
META_WHATSAPP_BUSINESS_ACCOUNT_ID=...

# App
NEXT_PUBLIC_APP_URL=https://crm.techmalhas.com.br
\`\`\`

### package.json scripts
\`\`\`json
{
  "dev": "next dev --turbo",
  "build": "prisma generate && prisma migrate deploy && next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "test:e2e": "playwright test",
  "prisma:migrate": "prisma migrate dev",
  "prisma:seed": "tsx prisma/seed.ts"
}
\`\`\`

### GitHub Actions
Workflow: `.github/workflows/ci.yml` roda `pnpm install && pnpm lint && pnpm typecheck && pnpm test` em cada PR.

### Vercel Config
- Build command: `pnpm build`
- Output directory: `.next`
- Environment variables: setadas no painel
- Cron jobs: 1 daily 06:00 para overdue check, 1 monthly day=1 para purge LGPD

## 8. Custo Estimado Mensal

| Serviço | Custo USD/mês | Notas |
|---|---|---|
| Vercel Pro | 20 | 1 projeto, builds ilimitados |
| Supabase Pro | 25 | DB + Auth + Realtime |
| Meta WhatsApp Cloud API | 0-15 | Free até 1k conversas, depois ~US$0.05 cada |
| Domínio (.com.br) | ~R$3 (US$0.60) | Anual prorrateado |
| **Total estimado** | **~US$45-60** | Vs Clint Growth (R$800/mês = US$160) |

## 9. Riscos Técnicos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Meta bloqueia número WhatsApp | Baixa | Alto | Usar templates aprovados, respeitar janela 24h |
| Dapic API indisponível ou indocumentada | Média | Médio | Integração ficou fora do MVP; preparar campos `dapic_id` |
| Supabase free tier limita usuários | Baixa | Médio | Plano Pro até 100k MAU |
| Vendedor não usa o CRM em campo | Média | Alto | Mobile-first; treinamento; gestor cobra uso |
```

## Veto Conditions

Reject and redo if ANY are true:
1. Stack divergente da definida (Next.js + Supabase + Vercel) sem ADR justificando mudança
2. ERD sem alguma tabela essencial (contacts, deals, pipelines, stages, activities, interactions, audit_logs)
3. Faltam RLS policies para tabelas com PII
4. Webhook WhatsApp sem estratégia explícita de idempotência
5. Plano LGPD ausente ou incompleto (sem inventário PII OU sem retenção)
6. Variáveis sem `.env.example`

## Quality Criteria

- [ ] ADRs para Prisma, Auth, Cron, Dapic
- [ ] Diagrama Mermaid de arquitetura
- [ ] ERD completo com tipos PG, índices, FK, RLS
- [ ] API spec com todos os endpoints, Zod, RBAC, status codes
- [ ] Integração WhatsApp Cloud API documentada (auth, webhook, envio, idempotência, retry)
- [ ] Plano LGPD: inventário PII, base legal, retenção, exclusão, audit
- [ ] Plano de deploy: .env.example, scripts, CI, Vercel config
- [ ] Estimativa de custo mensal
- [ ] Riscos técnicos com mitigação
