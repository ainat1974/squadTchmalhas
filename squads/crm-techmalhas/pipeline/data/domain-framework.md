# Domain Framework — Desenvolvimento de CRM SaaS

> Framework operacional que orienta todos os agentes do squad na construção
> de um CRM moderno e escalável.

---

## Princípios Fundamentais

### 1. Domain-Driven Design (DDD) Light
- Modelar primeiro o **domínio do negócio** (lead, deal, contact, activity)
- Linguagem ubíqua: usar os mesmos termos em código, UI e docs
- Bounded contexts: separar Vendas, Atendimento, Catálogo (mesmo no monolito)

### 2. API-First
- Todo recurso primeiro nasce como endpoint REST documentado
- Frontend consome a API como se fosse cliente externo
- Facilita integração futura com Dapic, mobile, etc.

### 3. Segurança por Padrão (Security by Default)
- RLS (Row-Level Security) no Supabase em todas as tabelas com dados sensíveis
- Validação de entrada com Zod em todas as rotas
- Autenticação obrigatória; público apenas explicitamente marcado
- LGPD: consentimento explícito + audit log de acessos a dados pessoais

### 4. Mobile-First Responsivo
- Tailwind breakpoints: `sm`, `md`, `lg` testados em cada tela
- Vendedores usam celular em campo — Kanban precisa funcionar no mobile
- Touch-friendly: alvos mínimos de 44x44px

### 5. Performance Real
- Server Components por padrão; Client Components apenas quando interativo
- Indexação correta no PostgreSQL (não esperar usuário reclamar)
- Pagination obrigatória em listas (>20 itens)

---

## Arquitetura de Pastas Padrão (Next.js 15 App Router)

```
crm-techmalhas/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── pipeline/page.tsx          # Kanban
│   │   ├── leads/
│   │   │   ├── page.tsx               # Lista
│   │   │   └── [id]/page.tsx          # Detalhe
│   │   ├── chat/page.tsx              # WhatsApp inbox
│   │   ├── tasks/page.tsx             # Minhas tarefas
│   │   └── reports/page.tsx           # Dashboard
│   ├── api/
│   │   ├── v1/
│   │   │   ├── leads/route.ts
│   │   │   ├── deals/route.ts
│   │   │   ├── activities/route.ts
│   │   │   └── webhooks/whatsapp/route.ts
│   │   └── auth/[...nextauth]/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                            # shadcn primitives
│   ├── kanban/                        # KanbanBoard, KanbanColumn, KanbanCard
│   ├── leads/                         # LeadCard, LeadForm, LeadTimeline
│   ├── chat/                          # ChatList, ChatThread, MessageBubble
│   └── dashboard/                     # KPICard, FunnelChart, TopPerformers
├── lib/
│   ├── db.ts                          # Prisma/Drizzle client
│   ├── auth.ts                        # Supabase auth helpers
│   ├── whatsapp.ts                    # Meta Cloud API client
│   ├── validators/                    # Zod schemas
│   └── permissions.ts                 # RBAC helpers
├── prisma/                            # ou drizzle/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── e2e/                           # Playwright
│   └── unit/                          # Vitest
├── public/
├── .env.example
├── package.json
└── README.md
```

---

## Modelo de Dados Mínimo (ERD textual)

```
users (auth)
  id, email, name, role, created_at

contacts (lead/cliente unificado)
  id, name, phone, email, company_name, type [lead|customer], source, created_at, owner_id

deals (oportunidades)
  id, contact_id, title, value, pipeline_id, stage_id, status, expected_close_at, owner_id, created_at

pipelines
  id, name, type [atacado|varejo], created_at

stages
  id, pipeline_id, name, order_index, color, win_probability

activities (tarefas obrigatórias)
  id, deal_id, contact_id, type [call|whatsapp|meeting|email|task], title, due_at, completed_at, assignee_id, mandatory, created_at

interactions (histórico de comunicação)
  id, contact_id, channel [whatsapp|email|call|note], direction [in|out], body, metadata_json, sent_at

whatsapp_messages
  id, interaction_id, meta_message_id, status, error_code, created_at

audit_logs (LGPD)
  id, user_id, action, resource_type, resource_id, ip, user_agent, created_at
```

---

## Fluxos Críticos

### Fluxo 1 — Captura de Lead via WhatsApp
1. Cliente envia mensagem para o número da Techmalhas
2. Meta Cloud API faz POST no webhook `/api/v1/webhooks/whatsapp`
3. Sistema verifica se contact existe (por telefone); se não, cria
4. Cria interaction (channel=whatsapp, direction=in)
5. Se não houver deal aberto, cria deal no pipeline padrão (stage = "Novo Lead")
6. Cria activity de follow-up obrigatória (due_at = +2h) para o owner padrão
7. Notifica o vendedor responsável (in-app + e-mail)

### Fluxo 2 — Movimentar Deal no Kanban
1. Vendedor arrasta card de "Negociação" para "Proposta Enviada"
2. UI faz PATCH `/api/v1/deals/{id}` com `stage_id` novo
3. Servidor valida transição permitida (RBAC + regras de negócio)
4. Atualiza deal e cria interaction tipo "note" registrando a mudança
5. Se nova etapa exigir tarefa obrigatória (ex: "Enviar contrato"), cria activity
6. Realtime: outros usuários veem a atualização via Supabase Realtime

### Fluxo 3 — Tarefa Obrigatória Vencida
1. Cron diário (Vercel Cron) verifica activities com `mandatory=true` e `due_at < now`
2. Cria notificação para gestor
3. Marca activity como "overdue" no dashboard
4. Bloqueia movimentação do deal (regra opcional) até a tarefa ser cumprida

---

## Padrões de API REST

```
GET    /api/v1/leads              → lista paginada (?page, ?limit, ?filter)
POST   /api/v1/leads              → cria lead (Zod valida body)
GET    /api/v1/leads/:id          → detalhe + relacionamentos
PATCH  /api/v1/leads/:id          → atualização parcial
DELETE /api/v1/leads/:id          → soft delete (deleted_at)

GET    /api/v1/deals?pipeline_id  → todos os deals do pipeline (para Kanban)
PATCH  /api/v1/deals/:id          → movimentar entre stages

POST   /api/v1/activities         → criar tarefa
PATCH  /api/v1/activities/:id/complete → marcar como concluída

POST   /api/v1/webhooks/whatsapp  → receber mensagens da Meta
POST   /api/v1/whatsapp/send      → enviar mensagem
```

**Convenções:**
- Resposta sempre `{ data, meta?, error? }`
- Status codes: 200 (ok), 201 (created), 400 (validation), 401 (auth), 403 (rbac), 404, 422, 500
- Erros: `{ error: { code, message, field? } }`

---

## Testes — Pirâmide Mínima

| Camada | Ferramenta | Cobertura mínima |
|---|---|---|
| Unit | Vitest | Lib functions, validators, permissions |
| Integration | Vitest + supertest | Rotas API com DB de teste |
| E2E | Playwright | 5 fluxos críticos (login, criar lead, mover deal, completar task, receber WhatsApp) |

---

## Deploy & Operação

- **Branch strategy:** `main` (produção) + feature branches via PR
- **Preview deploys:** Vercel cria URL por PR
- **Migrações:** Prisma `migrate deploy` no build do Vercel
- **Variáveis de ambiente:** documentadas em `.env.example`, configuradas no painel Vercel
- **Monitoring:** Vercel Analytics + Supabase Logs (suficiente para MVP)
- **Backup:** Supabase faz backup diário automático no plano Pro
