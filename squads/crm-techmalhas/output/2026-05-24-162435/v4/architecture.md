# Arquitetura — CRM Techmalhas

> **TL;DR:** Monolito modular em Next.js 15 + Supabase (Postgres + Auth + Realtime) + Vercel, integrando WhatsApp Cloud API e Instagram Messaging API via webhooks idempotentes, chat ao vivo via Supabase Realtime WebSocket, e LGPD por design com RLS em todas as tabelas de PII. Prisma 6.x como ORM tipado, Zod em todos os boundaries, Clerk descartado em favor de Supabase Auth.

---

## 1. ADRs (Architecture Decision Records)

### ADR-001: ORM — Prisma 6.x vs Drizzle ORM

| Campo | Detalhe |
|---|---|
| **Status** | Aceito |
| **Data** | 2026-05-24 |

**Contexto**

O projeto exige tipagem estrita com TypeScript, migrations versionadas, e integração com Supabase Postgres. A equipe não possui experiência prévia com ORMs no stack escolhido. Drizzle ganhou tração em 2024-2025 pela leveza e geração de SQL próximo ao raw. Prisma 6.x introduziu melhorias de performance (query engine em Rust, "Accelerate" opcional).

**Decisão:** Prisma 6.x

**Alternativas avaliadas:**

- **Drizzle ORM** — SQL-first, mais leve, melhor performance bruta em queries simples, mas schema em TypeScript em vez de `.prisma` (curva inicial maior para novos devs), migrations menos maduras, ecossistema menor de integrações.
- **Kysely + migrations manuais** — controle total, mas boilerplate excessivo para um time pequeno.
- **Supabase JS Client direto** — sem tipagem do schema no client-side, sem migrations versionadas.

**Consequências (+):**
- Schema único em `schema.prisma` como source of truth
- `prisma generate` entrega tipos TS completos para todas as tabelas
- `prisma migrate dev` é familiar para a maioria dos devs Node/TS
- Prisma Studio para debug visual do banco em dev
- Suporte nativo a `pgvector` e tipos PG customizados no Prisma 6.x

**Consequências (-):**
- Runtime overhead do Prisma Client vs Drizzle (~20-30ms em cold starts Vercel Edge — mitigado usando Node.js runtime, não Edge)
- `connection_limit` deve ser configurado para `?connection_limit=1` em ambiente serverless (Vercel)
- Prisma não gerencia as RLS policies — essas são mantidas em migrations SQL separadas

**Plano de Saída:** Se performance se tornar gargalo em produção (>500ms em queries complexas), migrar para Drizzle é viável mantendo o schema Postgres — as migrations SQL são portáveis. Custo estimado: 2 sprints de refactor.

---

### ADR-002: Auth — Supabase Auth vs Clerk

| Campo | Detalhe |
|---|---|
| **Status** | Aceito |
| **Data** | 2026-05-24 |

**Contexto**

Auth precisa suportar e-mail/senha e Google OAuth. Requisito de RBAC com 4 perfis (`admin`, `gestor`, `vendedor_atacado`, `atendente_varejo`). LGPD exige que dados de usuários fiquem em servidor brasileiro (ou com DPA adequado). Sistema interno — não é auth de clientes finais.

**Decisão:** Supabase Auth (embutido no plano Supabase Pro)

**Alternativas avaliadas:**

- **Clerk** — excelente DX, UI components prontos, mas custo adicional (~$25/mês para MAU do time), dados em servidores Clerk (EUA), DPA menos transparente para LGPD, e adiciona um vendor externo sem necessidade.
- **Auth.js (NextAuth)** — gratuito, self-hosted, mas exige mais configuração e não se integra nativamente com Supabase RLS via JWT.
- **Supabase Auth** — já incluso no Supabase Pro, JWT integrado com RLS policies, `auth.users` disponível no Postgres, Google OAuth nativo.

**Consequências (+):**
- JWT Supabase é validado automaticamente nas RLS policies (`auth.uid()`)
- `auth.users` sincronizado com tabela `public.users` via trigger
- Google OAuth com 1 configuração no dashboard Supabase
- Sem custo adicional
- Dados no datacenter escolhido (São Paulo — `sa-east-1`)

**Consequências (-):**
- UI de login precisa ser construída do zero (não há componentes prontos como Clerk)
- RBAC customizado precisa ser implementado via `app_metadata` no JWT + middleware Next.js
- MFA limitado no plano Pro (TOTP apenas; SMS exige plano Enterprise)

**Plano de Saída:** Migrar para Clerk ou Auth.js requer re-emissão de JWTs e atualização de RLS policies. Custo estimado: 1 sprint.

---

### ADR-003: Jobs Assíncronos — Vercel Cron vs Trigger.dev

| Campo | Detalhe |
|---|---|
| **Status** | Aceito |
| **Data** | 2026-05-24 |

**Contexto**

Jobs necessários no MVP:
1. Purge mensal de leads não convertidos (LGPD — 90 dias)
2. Retry de mensagens WhatsApp falhadas (a cada 5 minutos)
3. Sincronização futura com Dapic ERP (v2)
4. Expiração de sessões de webchat inativas (a cada 15 minutos)

**Decisão:** Vercel Cron Jobs (embutido no plano Pro)

**Alternativas avaliadas:**

- **Trigger.dev** — framework de background jobs mais poderoso, retry nativo, observabilidade, mas custo adicional ($49/mês Hobby, $99/mês Pro) e complexidade de infraestrutura adicional para MVP.
- **Inngest** — similar ao Trigger.dev, excelente para event-driven workflows, mas mesmo problema de custo/complexidade para MVP.
- **Supabase pg_cron** — jobs diretamente no Postgres, sem dependência externa, mas limitado a SQL (sem lógica de aplicação complexa).

**Consequências (+):**
- Incluso no Vercel Pro sem custo adicional
- Configuração simples em `vercel.json`
- Executa os mesmos API Routes do projeto
- Sem infra adicional para gerenciar

**Consequências (-):**
- Granularidade mínima: 1 vez por minuto (suficiente para MVP)
- Timeout máximo: 300s por execução (Vercel Pro)
- Sem retry nativo — deve ser implementado na própria lógica
- Sem dashboard de observabilidade — usar logs do Vercel + alertas customizados

**Plano de Saída:** Se jobs complexos forem necessários (orquestrações com múltiplos steps, retry com backoff exponencial), migrar para Trigger.dev. As API Routes de cron são portáveis como handlers Trigger.dev com refactor mínimo.

---

### ADR-004: Instagram Messaging API — Estratégia de Integração

| Campo | Detalhe |
|---|---|
| **Status** | Aceito (com riscos documentados) |
| **Data** | 2026-05-24 |

**Contexto**

Instagram Messaging via Meta Messenger Platform exige aprovação do app Meta com revisão manual, que pode levar semanas. A API permite receber DMs e monitorar comentários para captura de leads. Difere do WhatsApp: janela de 24h para resposta (semelhante ao WhatsApp), mas sem templates de mensagem estruturados da mesma forma.

**Decisão:** Integrar Instagram Messaging API com implementação paralela ao WhatsApp, mas com flag de feature toggle para habilitar apenas após aprovação Meta.

**Alternativas avaliadas:**

- **Terceiro (ManyChat, Kommo)** — simplificaria integração mas adiciona custo, dependency e dados de clientes em terceiros (LGPD concern).
- **Delay para v2** — risco de perder leads de Instagram no MVP.
- **Instagram Basic Display API** — não serve para messaging, apenas leitura de perfil.

**Consequências (+):**
- Captura de leads de DMs e comentários diretamente
- Unificação no inbox do CRM com WhatsApp e WebChat
- Sem custo por mensagem (Instagram não cobra diferente do WhatsApp por conversa)

**Consequências (-):**
- Processo de aprovação Meta: 2-6 semanas, pode ser rejeitado
- Requer Instagram Business Account vinculada à Meta Business Suite
- Webhook e DM API estão sob revisão da Meta para apps novos
- `instagram_message_id` necessário para idempotência (mesmo modelo do WhatsApp)

**Plano de Saída:** Se aprovação for negada, considerar integração via terceiro (ManyChat webhook → CRM). Feature toggle garante que o resto do sistema funcione sem Instagram.

---

### ADR-005: Chat ao Vivo — Supabase Realtime WebSocket vs Polling

| Campo | Detalhe |
|---|---|
| **Status** | Aceito |
| **Data** | 2026-05-24 |

**Contexto**

Chat ao vivo no site techmalhas.com.br precisa de comunicação bidirecional em tempo real entre visitante (widget JS no site) e operador (inbox no CRM). As opções são: WebSocket nativo, Supabase Realtime (abstração sobre WebSocket + Postgres CDC), ou polling HTTP.

**Decisão:** Supabase Realtime com Broadcast + Postgres Changes

**Alternativas avaliadas:**

- **WebSocket nativo (ws library)** — controle total, mas requer servidor dedicado (não compatível com Vercel serverless); exigiria Railway/Render adicional.
- **Polling HTTP (cada 2s)** — simples, funciona serverless, mas latência alta e carga desnecessária no banco.
- **Pusher / Ably** — serviços gerenciados de WebSocket, bons, mas custo adicional (~$49/mês) e vendor externo.
- **Supabase Realtime** — incluso no Supabase Pro, WebSocket gerenciado, Postgres Changes para sync, sem servidor adicional.

**Consequências (+):**
- Incluso no Supabase Pro (sem custo adicional)
- Latência <200ms para mensagens
- `Broadcast` channel para mensagens em tempo real (sem persistência) + `Postgres Changes` para sync do histórico
- Funciona com Vercel serverless (cliente WebSocket no browser e no widget JS)

**Consequências (-):**
- Limite de 500 conexões simultâneas no Supabase Pro (suficiente para MVP; escalar para Team plan se necessário)
- Widget JS precisa gerenciar reconexão automática (Supabase JS client faz isso nativamente)
- RLS em `webchat_sessions` e `webchat_messages` precisa de atenção especial (visitante anônimo vs operador autenticado)

**Plano de Saída:** Se Supabase Realtime se tornar limitante (>500 conexões), migrar para Ably ou Pusher com mudança apenas no transport layer — a lógica de negócio permanece.

---

### ADR-006: Estratégia Dapic ERP — Integração Futura

| Campo | Detalhe |
|---|---|
| **Status** | Aceito |
| **Data** | 2026-05-24 |

**Contexto**

Dapic é o ERP atual da Techmalhas. Não há documentação pública de API. A integração real depende de consulta ao suporte Dapic para entender se há API REST, webhooks, ou apenas exportação de dados. MVP precisa ser construído sem depender desta integração.

**Decisão:** Reservar campos `dapic_id` (em `contacts`) e `dapic_pedido_id` (em `deals`) no schema. Integração real na v2.

**Alternativas avaliadas:**

- **Integrar agora via scraping/CSV** — frágil, risco de quebrar com atualizações Dapic.
- **Aguardar API Dapic para iniciar MVP** — bloqueia o projeto sem necessidade.
- **Campos reservados + campo `dapic_synced_at`** — permite MVP funcional e integração limpa quando a API estiver disponível.

**Consequências (+):**
- MVP não bloqueia em Dapic
- Schema preparado para integração sem migration destrutiva
- Vendedores podem inserir `dapic_id` manualmente (ponte temporária)

**Consequências (-):**
- Rastreamento de pedidos indisponível no MVP
- Risco de divergência entre CRM e ERP enquanto integração não existe

**Plano de Saída:** Quando API Dapic estiver disponível, criar job de sync em `Vercel Cron` (ou Trigger.dev se complexidade exigir). Campos já existem no schema.

---

## 2. Diagrama de Arquitetura

```mermaid
flowchart LR
    subgraph EXTERNAL["Externos / Usuários"]
        VISITANTE["🌐 Visitante\ntechmalhas.com.br"]
        LOJISTA["🏪 Lojista B2B\nWhatsApp / Instagram"]
        CONSUMIDOR["👤 Consumidor B2C\nWhatsApp / Instagram"]
        META_API["☁️ Meta Cloud API\nWhatsApp Business\nInstagram Messaging"]
        GOOGLE_OAUTH["🔑 Google OAuth\n(Supabase Auth)"]
    end

    subgraph VERCEL["Vercel (Hosting)"]
        direction TB
        NEXTJS["⚡ Next.js 15 App\nApp Router + RSC"]
        
        subgraph API["API Routes"]
            WEBHOOK_WA["POST /api/v1/webhooks/whatsapp"]
            WEBHOOK_IG["POST /api/v1/webhooks/instagram"]
            WEBHOOK_WC["POST /api/v1/webchat/*"]
            API_CONTACTS["REST /api/v1/contacts"]
            API_DEALS["REST /api/v1/deals"]
            API_INBOX["REST /api/v1/interactions"]
            API_PUBLIC["POST /api/v1/public/leads\n(público + rate limit)"]
            API_DASH["GET /api/v1/dashboard/kpis"]
        end

        subgraph CRON["Vercel Cron Jobs"]
            CRON_PURGE["Cron: LGPD Purge\n@monthly"]
            CRON_RETRY["Cron: WA Retry\n@every5min"]
            CRON_WEBCHAT["Cron: Expire Sessions\n@every15min"]
        end

        subgraph WIDGET["Widget JS (embed)"]
            WIDGET_JS["widget.js\n(script tag no site)"]
        end
    end

    subgraph SUPABASE["Supabase (São Paulo — sa-east-1)"]
        direction TB
        SB_AUTH["🔐 Supabase Auth\ne-mail + Google OAuth\nJWT com RBAC claims"]
        SB_DB["🗄️ PostgreSQL 15\n+ Prisma 6.x\n+ RLS em todas as tabelas PII"]
        SB_REALTIME["📡 Supabase Realtime\nWebSocket (Broadcast +\nPostgres Changes)"]
        SB_STORAGE["📦 Supabase Storage\n(mídia WhatsApp/IG)"]
    end

    subgraph SITE["techmalhas.com.br\n(site externo)"]
        FORM["📋 Formulário\nde Contato / Lead"]
        CHAT_WIDGET["💬 Widget Chat\n(script embed)"]
    end

    %% Fluxos principais
    VISITANTE --> FORM
    VISITANTE --> CHAT_WIDGET
    LOJISTA --> META_API
    CONSUMIDOR --> META_API

    META_API -->|"webhook POST"| WEBHOOK_WA
    META_API -->|"webhook POST"| WEBHOOK_IG

    FORM -->|"POST /api/v1/public/leads"| API_PUBLIC
    CHAT_WIDGET <-->|"WebSocket"| SB_REALTIME

    NEXTJS <-->|"Prisma Client\n(connection pool)"| SB_DB
    NEXTJS <-->|"supabase-js"| SB_AUTH
    NEXTJS <-->|"supabase-js"| SB_REALTIME
    NEXTJS -->|"upload mídia"| SB_STORAGE

    GOOGLE_OAUTH <-->|"OAuth2"| SB_AUTH

    WEBHOOK_WA --> SB_DB
    WEBHOOK_IG --> SB_DB
    WEBHOOK_WC --> SB_REALTIME

    CRON_PURGE -->|"soft delete + purge PII"| SB_DB
    CRON_RETRY -->|"retry fila"| META_API
    CRON_WEBCHAT -->|"expire sessions"| SB_DB

    WIDGET_JS -.->|"embed no site"| CHAT_WIDGET
```

---

## 3. Modelo de Dados (ERD)

```sql
-- ============================================================
-- EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE user_role AS ENUM ('admin', 'gestor', 'vendedor_atacado', 'atendente_varejo');
CREATE TYPE pipeline_type AS ENUM ('atacado', 'varejo');
CREATE TYPE deal_status AS ENUM ('open', 'won', 'lost', 'archived');
CREATE TYPE activity_type AS ENUM ('task', 'call', 'meeting', 'email', 'note', 'whatsapp', 'instagram');
CREATE TYPE interaction_channel AS ENUM ('whatsapp', 'instagram', 'webchat', 'email', 'note', 'call', 'manual');
CREATE TYPE interaction_direction AS ENUM ('inbound', 'outbound', 'internal');
CREATE TYPE message_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE lead_source_type AS ENUM ('whatsapp', 'instagram', 'site_form', 'site_chat', 'manual', 'referral');
CREATE TYPE audit_action AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'CONSENT');
CREATE TYPE notification_type AS ENUM ('new_lead', 'new_message', 'task_due', 'deal_updated', 'mention', 'system');
CREATE TYPE webchat_session_status AS ENUM ('waiting', 'active', 'closed', 'abandoned');

-- ============================================================
-- TABELA: users
-- Sincronizada com auth.users do Supabase via trigger
-- ============================================================
CREATE TABLE public.users (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           TEXT NOT NULL UNIQUE,
    full_name       TEXT NOT NULL,
    avatar_url      TEXT,
    role            user_role NOT NULL DEFAULT 'atendente_varejo',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    phone           TEXT,
    -- Metadados
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ, -- soft delete
    -- LGPD: último acesso registrado para auditoria
    last_login_at   TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_active ON public.users(is_active) WHERE deleted_at IS NULL;

-- Trigger: sync com auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_or_admin" ON public.users
    FOR SELECT USING (
        auth.uid() = id
        OR EXISTS (
            SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'gestor')
        )
    );

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

CREATE POLICY "users_admin_all" ON public.users
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
    );

-- ============================================================
-- TABELA: lead_sources
-- Origens de leads (lookup table)
-- ============================================================
CREATE TABLE public.lead_sources (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    type        lead_source_type NOT NULL,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.lead_sources (name, type) VALUES
    ('WhatsApp Direto', 'whatsapp'),
    ('Instagram DM', 'instagram'),
    ('Instagram Comentário', 'instagram'),
    ('Formulário Site', 'site_form'),
    ('Chat ao Vivo Site', 'site_chat'),
    ('Manual (Vendedor)', 'manual'),
    ('Indicação', 'referral');

ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_sources_read_authenticated" ON public.lead_sources
    FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- TABELA: contacts
-- Unifica lead + cliente. dapic_id reservado para integração futura.
-- ============================================================
CREATE TABLE public.contacts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Identificação
    full_name           TEXT NOT NULL,
    email               TEXT,
    phone               TEXT,             -- E.164 format: +5516999999999
    document_cpf        TEXT,             -- CPF mascarado: 000.000.000-00
    document_cnpj       TEXT,             -- CNPJ: 00.000.000/0000-00
    company_name        TEXT,
    -- Classificação
    is_b2b              BOOLEAN NOT NULL DEFAULT FALSE,
    lead_source_id      UUID REFERENCES public.lead_sources(id),
    pipeline_type       pipeline_type,    -- NULL = ambos
    -- Integração Dapic (reservado — v2)
    dapic_id            TEXT,             -- ID do cliente no Dapic ERP
    dapic_synced_at     TIMESTAMPTZ,      -- Última sync com Dapic
    -- Canais de contato
    whatsapp_phone      TEXT,             -- Pode diferir do phone principal
    instagram_id        TEXT,             -- Instagram user ID
    instagram_username  TEXT,
    -- LGPD
    lgpd_consent        BOOLEAN NOT NULL DEFAULT FALSE,
    lgpd_consent_at     TIMESTAMPTZ,
    lgpd_consent_ip     INET,
    -- Responsável
    assigned_to         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    -- Metadados
    tags                TEXT[] DEFAULT '{}',
    notes               TEXT,
    avatar_url          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,      -- soft delete (LGPD)
    -- Constraints
    CONSTRAINT contacts_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX idx_contacts_email ON public.contacts(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_phone ON public.contacts(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_whatsapp ON public.contacts(whatsapp_phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_instagram ON public.contacts(instagram_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_assigned ON public.contacts(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_dapic ON public.contacts(dapic_id) WHERE dapic_id IS NOT NULL;
CREATE INDEX idx_contacts_created ON public.contacts(created_at DESC);
CREATE INDEX idx_contacts_tags ON public.contacts USING GIN(tags);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- admin e gestor veem tudo
CREATE POLICY "contacts_admin_gestor_all" ON public.contacts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'gestor'))
    );

-- vendedor_atacado vê apenas B2B
CREATE POLICY "contacts_vendedor_atacado" ON public.contacts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'vendedor_atacado')
        AND is_b2b = TRUE
        AND deleted_at IS NULL
    );

-- atendente_varejo vê apenas B2C ou não-classificados
CREATE POLICY "contacts_atendente_varejo" ON public.contacts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'atendente_varejo')
        AND (is_b2b = FALSE OR pipeline_type = 'varejo')
        AND deleted_at IS NULL
    );

-- ============================================================
-- TABELA: pipelines
-- Configuração dos pipelines Atacado e Varejo
-- ============================================================
CREATE TABLE public.pipelines (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    type        pipeline_type NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_by  UUID REFERENCES public.users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.pipelines (name, type, description) VALUES
    ('Pipeline Atacado', 'atacado', 'Oportunidades B2B com lojistas'),
    ('Pipeline Varejo', 'varejo', 'Oportunidades B2C com consumidores finais');

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pipelines_read_all_authenticated" ON public.pipelines
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "pipelines_write_admin_gestor" ON public.pipelines
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'gestor'))
    );

-- ============================================================
-- TABELA: stages
-- Etapas configuráveis por pipeline
-- ============================================================
CREATE TABLE public.stages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id     UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    position        INTEGER NOT NULL DEFAULT 0,
    color           TEXT DEFAULT '#6366f1',     -- hex color para UI
    is_won_stage    BOOLEAN NOT NULL DEFAULT FALSE,
    is_lost_stage   BOOLEAN NOT NULL DEFAULT FALSE,
    probability     SMALLINT DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT stages_unique_position_per_pipeline UNIQUE (pipeline_id, position),
    CONSTRAINT stages_won_or_lost CHECK (NOT (is_won_stage AND is_lost_stage))
);

CREATE INDEX idx_stages_pipeline ON public.stages(pipeline_id, position);

ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stages_read_authenticated" ON public.stages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "stages_write_admin_gestor" ON public.stages
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'gestor'))
    );

-- ============================================================
-- TABELA: stage_required_tasks
-- Templates de tarefas obrigatórias por stage
-- ============================================================
CREATE TABLE public.stage_required_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id        UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    activity_type   activity_type NOT NULL DEFAULT 'task',
    due_days_offset INTEGER DEFAULT 1,     -- dias após entrar no stage
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stage_required_tasks_stage ON public.stage_required_tasks(stage_id);

ALTER TABLE public.stage_required_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stage_required_tasks_read_authenticated" ON public.stage_required_tasks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "stage_required_tasks_write_admin_gestor" ON public.stage_required_tasks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'gestor'))
    );

-- ============================================================
-- TABELA: deals
-- Oportunidades (negócios). dapic_pedido_id reservado.
-- ============================================================
CREATE TABLE public.deals (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title               TEXT NOT NULL,
    contact_id          UUID NOT NULL REFERENCES public.contacts(id) ON DELETE RESTRICT,
    pipeline_id         UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE RESTRICT,
    stage_id            UUID NOT NULL REFERENCES public.stages(id) ON DELETE RESTRICT,
    assigned_to         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    -- Financeiro
    value               NUMERIC(12,2),
    currency            CHAR(3) NOT NULL DEFAULT 'BRL',
    -- Status
    status              deal_status NOT NULL DEFAULT 'open',
    closed_at           TIMESTAMPTZ,
    lost_reason         TEXT,
    -- Dapic (reservado — v2)
    dapic_pedido_id     TEXT,
    -- Metadados
    expected_close_date DATE,
    notes               TEXT,
    tags                TEXT[] DEFAULT '{}',
    created_by          UUID REFERENCES public.users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_deals_contact ON public.deals(contact_id);
CREATE INDEX idx_deals_pipeline_stage ON public.deals(pipeline_id, stage_id);
CREATE INDEX idx_deals_assigned ON public.deals(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_status ON public.deals(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_created ON public.deals(created_at DESC);
CREATE INDEX idx_deals_dapic ON public.deals(dapic_pedido_id) WHERE dapic_pedido_id IS NOT NULL;

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_admin_gestor_all" ON public.deals
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'gestor'))
        AND deleted_at IS NULL
    );

CREATE POLICY "deals_vendedor_atacado_own_pipeline" ON public.deals
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'vendedor_atacado')
        AND pipeline_id IN (SELECT id FROM public.pipelines WHERE type = 'atacado')
        AND deleted_at IS NULL
    );

CREATE POLICY "deals_atendente_varejo_own_pipeline" ON public.deals
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'atendente_varejo')
        AND pipeline_id IN (SELECT id FROM public.pipelines WHERE type = 'varejo')
        AND deleted_at IS NULL
    );

-- ============================================================
-- TABELA: activities
-- Tarefas, ligações, reuniões, notas por deal ou contact
-- ============================================================
CREATE TABLE public.activities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id         UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    contact_id      UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    assigned_to     UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_by      UUID REFERENCES public.users(id),
    -- Dados da atividade
    type            activity_type NOT NULL DEFAULT 'task',
    title           TEXT NOT NULL,
    description     TEXT,
    is_mandatory    BOOLEAN NOT NULL DEFAULT FALSE,
    is_done         BOOLEAN NOT NULL DEFAULT FALSE,
    done_at         TIMESTAMPTZ,
    due_date        TIMESTAMPTZ,
    -- Se gerada por template
    from_template_id UUID REFERENCES public.stage_required_tasks(id),
    -- Metadados
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT activities_deal_or_contact CHECK (deal_id IS NOT NULL OR contact_id IS NOT NULL)
);

CREATE INDEX idx_activities_deal ON public.activities(deal_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_contact ON public.activities(contact_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_assigned ON public.activities(assigned_to, is_done) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_due ON public.activities(due_date) WHERE is_done = FALSE AND deleted_at IS NULL;

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_own_or_admin_gestor" ON public.activities
    FOR ALL USING (
        auth.uid() = assigned_to
        OR auth.uid() = created_by
        OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'gestor'))
    );

-- ============================================================
-- TABELA: interactions
-- Histórico unificado de todas as comunicações
-- ============================================================
CREATE TABLE public.interactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id      UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    deal_id         UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    -- Canal e direção
    channel         interaction_channel NOT NULL,
    direction       interaction_direction NOT NULL DEFAULT 'inbound',
    -- Conteúdo
    content         TEXT,                   -- texto da mensagem / nota
    content_type    TEXT DEFAULT 'text',    -- text, image, audio, document, video
    media_url       TEXT,                   -- URL no Supabase Storage
    media_mime      TEXT,
    -- Referências externas (para deduplicação)
    whatsapp_message_id     UUID REFERENCES public.whatsapp_messages(id),
    instagram_message_id    UUID REFERENCES public.instagram_messages(id),
    webchat_message_id      UUID REFERENCES public.webchat_messages(id),
    -- Metadados
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interactions_contact ON public.interactions(contact_id, created_at DESC);
CREATE INDEX idx_interactions_deal ON public.interactions(deal_id, created_at DESC);
CREATE INDEX idx_interactions_channel ON public.interactions(channel, created_at DESC);
CREATE INDEX idx_interactions_created ON public.interactions(created_at DESC);

ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interactions_contact_scope" ON public.interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.contacts c
            WHERE c.id = contact_id
            AND (
                -- admin e gestor veem tudo
                EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'gestor'))
                -- vendedor_atacado: apenas B2B
                OR (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'vendedor_atacado') AND c.is_b2b = TRUE)
                -- atendente_varejo: apenas B2C
                OR (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'atendente_varejo') AND c.is_b2b = FALSE)
            )
        )
    );

CREATE POLICY "interactions_insert_authenticated" ON public.interactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- TABELA: whatsapp_messages
-- Rastreia mensagens Meta WhatsApp. meta_message_id = idempotência.
-- ============================================================
CREATE TABLE public.whatsapp_messages (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id          UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    -- Identificadores Meta (idempotência)
    meta_message_id     TEXT NOT NULL UNIQUE,   -- wamid.xxx
    meta_phone_number_id TEXT NOT NULL,         -- phone number ID do sender
    -- Direção e status
    direction           interaction_direction NOT NULL,
    status              message_status NOT NULL DEFAULT 'pending',
    -- Conteúdo
    content_type        TEXT NOT NULL DEFAULT 'text',  -- text, image, audio, document, video, template, reaction
    content_text        TEXT,
    content_caption     TEXT,
    media_url           TEXT,
    media_mime          TEXT,
    media_sha256        TEXT,
    template_name       TEXT,
    template_vars       JSONB,
    -- Metadados Meta
    meta_timestamp      TIMESTAMPTZ,
    meta_raw_payload    JSONB NOT NULL,         -- payload completo para debug
    -- Controle de retry
    retry_count         SMALLINT NOT NULL DEFAULT 0,
    retry_next_at       TIMESTAMPTZ,
    error_code          TEXT,
    error_message       TEXT,
    -- Metadados
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wa_messages_contact ON public.whatsapp_messages(contact_id, created_at DESC);
CREATE INDEX idx_wa_messages_meta_id ON public.whatsapp_messages(meta_message_id);
CREATE INDEX idx_wa_messages_status ON public.whatsapp_messages(status) WHERE status IN ('pending', 'failed');
CREATE INDEX idx_wa_messages_retry ON public.whatsapp_messages(retry_next_at) WHERE retry_count > 0 AND status = 'failed';

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whatsapp_messages_authenticated" ON public.whatsapp_messages
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- TABELA: instagram_messages
-- Similar ao whatsapp_messages mas para Instagram Messaging API
-- ============================================================
CREATE TABLE public.instagram_messages (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id              UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    -- Identificadores Meta (idempotência)
    meta_message_id         TEXT NOT NULL UNIQUE,   -- mid.xxx
    meta_ig_account_id      TEXT NOT NULL,           -- Instagram Business Account ID
    meta_sender_ig_id       TEXT,                    -- Instagram user ID do remetente
    -- Tipo de entrada (DM ou comentário)
    is_comment_lead         BOOLEAN NOT NULL DEFAULT FALSE,
    source_post_id          TEXT,                    -- Post ID se veio de comentário
    -- Direção e status
    direction               interaction_direction NOT NULL,
    status                  message_status NOT NULL DEFAULT 'pending',
    -- Conteúdo
    content_type            TEXT NOT NULL DEFAULT 'text',
    content_text            TEXT,
    media_url               TEXT,
    media_mime              TEXT,
    -- Metadados Meta
    meta_timestamp          TIMESTAMPTZ,
    meta_raw_payload        JSONB NOT NULL,
    -- Retry
    retry_count             SMALLINT NOT NULL DEFAULT 0,
    retry_next_at           TIMESTAMPTZ,
    error_code              TEXT,
    error_message           TEXT,
    -- Metadados
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ig_messages_contact ON public.instagram_messages(contact_id, created_at DESC);
CREATE INDEX idx_ig_messages_meta_id ON public.instagram_messages(meta_message_id);
CREATE INDEX idx_ig_messages_status ON public.instagram_messages(status) WHERE status IN ('pending', 'failed');
CREATE INDEX idx_ig_messages_comment ON public.instagram_messages(is_comment_lead, source_post_id) WHERE is_comment_lead = TRUE;

ALTER TABLE public.instagram_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instagram_messages_authenticated" ON public.instagram_messages
    FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- TABELA: webchat_sessions
-- Sessões do chat ao vivo do site
-- ============================================================
CREATE TABLE public.webchat_sessions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id          UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    assigned_to         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    -- Status da sessão
    status              webchat_session_status NOT NULL DEFAULT 'waiting',
    -- Dados do visitante (anônimo ou identificado)
    visitor_name        TEXT,
    visitor_email       TEXT,
    visitor_phone       TEXT,
    visitor_ip          INET,
    visitor_user_agent  TEXT,
    -- LGPD
    lgpd_consent        BOOLEAN NOT NULL DEFAULT FALSE,
    lgpd_consent_at     TIMESTAMPTZ,
    -- Metadados da sessão
    page_url            TEXT,               -- URL da página onde o chat foi iniciado
    referrer            TEXT,
    utm_source          TEXT,
    utm_medium          TEXT,
    utm_campaign        TEXT,
    -- Canal Supabase Realtime
    realtime_channel    TEXT UNIQUE,        -- nome do canal: webchat:{id}
    -- Controle
    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at            TIMESTAMPTZ,
    last_activity_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webchat_sessions_status ON public.webchat_sessions(status, last_activity_at DESC);
CREATE INDEX idx_webchat_sessions_assigned ON public.webchat_sessions(assigned_to) WHERE status IN ('waiting', 'active');
CREATE INDEX idx_webchat_sessions_contact ON public.webchat_sessions(contact_id);
CREATE INDEX idx_webchat_sessions_idle ON public.webchat_sessions(last_activity_at) WHERE status = 'active';

ALTER TABLE public.webchat_sessions ENABLE ROW LEVEL SECURITY;

-- Visitantes anônimos podem inserir sua própria sessão
CREATE POLICY "webchat_sessions_insert_anon" ON public.webchat_sessions
    FOR INSERT WITH CHECK (TRUE);

-- Operadores autenticados veem todas as sessões ativas
CREATE POLICY "webchat_sessions_operators_select" ON public.webchat_sessions
    FOR SELECT USING (
        auth.role() = 'authenticated'
        OR id::text = current_setting('request.jwt.claims', TRUE)::json->>'webchat_session_id'
    );

CREATE POLICY "webchat_sessions_operators_update" ON public.webchat_sessions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- TABELA: webchat_messages
-- Mensagens do chat ao vivo
-- ============================================================
CREATE TABLE public.webchat_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES public.webchat_sessions(id) ON DELETE CASCADE,
    -- Autor
    is_from_visitor BOOLEAN NOT NULL DEFAULT TRUE,
    user_id         UUID REFERENCES public.users(id),   -- NULL se visitante
    visitor_name    TEXT,
    -- Conteúdo
    content         TEXT NOT NULL,
    content_type    TEXT NOT NULL DEFAULT 'text',
    media_url       TEXT,
    -- Metadados
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at         TIMESTAMPTZ
);

CREATE INDEX idx_webchat_messages_session ON public.webchat_messages(session_id, created_at ASC);
CREATE INDEX idx_webchat_messages_unread ON public.webchat_messages(session_id, read_at) WHERE read_at IS NULL;

ALTER TABLE public.webchat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webchat_messages_session_access" ON public.webchat_messages
    FOR ALL USING (
        auth.role() = 'authenticated'
        OR session_id::text IN (
            SELECT id::text FROM public.webchat_sessions
            WHERE realtime_channel = current_setting('request.headers', TRUE)::json->>'x-webchat-channel'
        )
    );

-- ============================================================
-- TABELA: notifications
-- Notificações em tempo real para usuários do CRM
-- ============================================================
CREATE TABLE public.notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type            notification_type NOT NULL,
    title           TEXT NOT NULL,
    body            TEXT,
    -- Referências opcionais
    deal_id         UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    contact_id      UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    activity_id     UUID REFERENCES public.activities(id) ON DELETE CASCADE,
    -- Controle
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    link            TEXT,                   -- path interno: /leads/abc
    -- Metadados
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own_user" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABELA: audit_logs
-- LGPD: registro de todo CRUD em dados de PII
-- ============================================================
CREATE TABLE public.audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    -- Executor
    user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_email      TEXT NOT NULL,
    user_role       user_role,
    user_ip         INET,
    user_agent      TEXT,
    -- Ação e alvo
    action          audit_action NOT NULL,
    table_name      TEXT NOT NULL,
    record_id       UUID,
    -- Dados alterados (não armazenar PII bruto no log — apenas campos alterados)
    changed_fields  TEXT[],
    old_values      JSONB,                  -- valores ANTERIORES (sem dados sensíveis completos)
    -- Contexto
    request_id      TEXT,                   -- para correlacionar com logs Vercel
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Particionamento mensal para performance (opcional em MVP, recomendado em produção)
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admin pode ler logs de auditoria
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
    );

-- INSERT permitido apenas para service role (via API Routes autenticadas)
CREATE POLICY "audit_logs_service_insert" ON public.audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- FUNÇÃO: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_pipelines_updated_at BEFORE UPDATE ON public.pipelines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_stages_updated_at BEFORE UPDATE ON public.stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_wa_messages_updated_at BEFORE UPDATE ON public.whatsapp_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_ig_messages_updated_at BEFORE UPDATE ON public.instagram_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- FUNÇÃO: criar atividades obrigatórias ao mover deal de stage
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_mandatory_activities_on_stage_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
        INSERT INTO public.activities (deal_id, contact_id, assigned_to, created_by, type, title, description, is_mandatory, due_date, from_template_id)
        SELECT
            NEW.id,
            NEW.contact_id,
            NEW.assigned_to,
            NEW.assigned_to,
            srt.activity_type,
            srt.title,
            srt.description,
            TRUE,
            NOW() + (srt.due_days_offset || ' days')::INTERVAL,
            srt.id
        FROM public.stage_required_tasks srt
        WHERE srt.stage_id = NEW.stage_id AND srt.is_active = TRUE;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_deals_stage_change
    AFTER UPDATE ON public.deals
    FOR EACH ROW EXECUTE FUNCTION public.create_mandatory_activities_on_stage_change();
```

---

## 4. Especificação da API REST

> Convenções: Base URL = `/api/v1`. Autenticação via `Authorization: Bearer <supabase_jwt>`. Todos os endpoints (exceto `/public/*` e webhooks) exigem JWT válido. Erros seguem RFC 7807 Problem Details.

### 4.1 Contacts / Leads

#### GET /api/v1/contacts

```
RBAC: admin, gestor, vendedor_atacado, atendente_varejo
Query params:
  ?search=string        — full text em nome, email, telefone
  ?pipeline_type=atacado|varejo
  ?is_b2b=boolean
  ?assigned_to=uuid
  ?page=number (default 1)
  ?limit=number (default 25, max 100)
  ?sort=created_at|updated_at|full_name (default: created_at)
  ?order=asc|desc (default: desc)
  ?tags=string          — filtro por tag (virgula separada)

Response 200:
{
  "data": Contact[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}

Response 403: JWT inválido / sem permissão
```

#### POST /api/v1/contacts

```
RBAC: admin, gestor, vendedor_atacado, atendente_varejo

Zod body schema:
const CreateContactSchema = z.object({
  full_name: z.string().min(2).max(200),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+55\d{10,11}$/).optional(),
  document_cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
  document_cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/).optional(),
  company_name: z.string().max(200).optional(),
  is_b2b: z.boolean().default(false),
  lead_source_id: z.string().uuid().optional(),
  pipeline_type: z.enum(['atacado', 'varejo']).optional(),
  whatsapp_phone: z.string().regex(/^\+55\d{10,11}$/).optional(),
  instagram_username: z.string().max(50).optional(),
  lgpd_consent: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).max(20).optional(),
  assigned_to: z.string().uuid().optional(),
}).refine(data => data.email || data.phone, {
  message: "Informe pelo menos email ou telefone"
});

Response 201: { "data": Contact }
Response 422: { "errors": ZodValidationErrors }
Response 409: { "message": "Contato já existe com este email/telefone" }

Side effects:
  - Cria audit_log(action: CREATE, table_name: contacts)
  - Se assigned_to for diferente do usuário atual: cria notification(type: new_lead) para o usuário atribuído
```

#### GET /api/v1/contacts/:id

```
RBAC: todos os papéis autenticados (RLS filtra automaticamente)

Response 200: { "data": Contact & { deals: Deal[], recent_interactions: Interaction[] } }
Response 404: { "message": "Contato não encontrado" }
Side effects: audit_log(action: READ) se contact tem dados sensíveis (CPF/CNPJ)
```

#### PUT /api/v1/contacts/:id

```
RBAC: admin, gestor, vendedor_atacado (próprios contatos B2B), atendente_varejo (próprios B2C)

Zod: UpdateContactSchema (todos os campos opcionais, exceto validações se presentes)

Response 200: { "data": Contact }
Response 403: sem permissão no contato
Response 422: erros de validação
Side effects: audit_log(action: UPDATE, changed_fields: [...])
```

#### DELETE /api/v1/contacts/:id

```
RBAC: admin apenas (soft delete — seta deleted_at)

Response 200: { "message": "Contato desativado" }
Response 403: não é admin
Side effects:
  - Soft delete (deleted_at = NOW())
  - audit_log(action: DELETE)
  - NÃO deleta interactions, whatsapp_messages, instagram_messages (retenção LGPD)
```

---

### 4.2 Deals

#### GET /api/v1/deals

```
RBAC: todos
Query: ?pipeline_id, ?stage_id, ?status, ?assigned_to, ?contact_id, ?page, ?limit

Response 200: { "data": Deal[], "pagination": {...} }
```

#### POST /api/v1/deals

```
RBAC: todos

const CreateDealSchema = z.object({
  title: z.string().min(2).max(300),
  contact_id: z.string().uuid(),
  pipeline_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  assigned_to: z.string().uuid().optional(),
  value: z.number().positive().max(9999999.99).optional(),
  expected_close_date: z.string().date().optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).max(20).optional(),
});

Response 201: { "data": Deal }
Response 422: erros
Side effects:
  - Cria activities obrigatórias do stage inicial (trigger DB)
  - audit_log(action: CREATE)
  - notification(new_lead) para assigned_to
```

#### PUT /api/v1/deals/:id

```
RBAC: admin, gestor (todos); vendedor_atacado (pipeline atacado); atendente_varejo (pipeline varejo)

const UpdateDealSchema = z.object({
  stage_id: z.string().uuid().optional(),
  title: z.string().min(2).max(300).optional(),
  value: z.number().positive().optional(),
  status: z.enum(['open', 'won', 'lost', 'archived']).optional(),
  lost_reason: z.string().max(500).optional(),
  assigned_to: z.string().uuid().optional(),
  expected_close_date: z.string().date().optional(),
  notes: z.string().max(2000).optional(),
});

Response 200: { "data": Deal }
Side effects:
  - Se stage_id mudou: trigger cria activities obrigatórias do novo stage
  - Se status = 'won' ou 'lost': seta closed_at
  - audit_log(action: UPDATE)
```

#### DELETE /api/v1/deals/:id

```
RBAC: admin, gestor
Response 200: soft delete
Side effects: audit_log(action: DELETE)
```

---

### 4.3 Pipeline & Stages

#### GET /api/v1/pipelines

```
RBAC: todos
Response 200: { "data": Pipeline[] & { stages: Stage[] } }
```

#### PUT /api/v1/pipelines/:id

```
RBAC: admin, gestor

const UpdatePipelineSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  is_active: z.boolean().optional(),
});

Response 200: { "data": Pipeline }
```

#### POST /api/v1/pipelines/:id/stages

```
RBAC: admin, gestor

const CreateStageSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  position: z.number().int().min(0),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
  is_won_stage: z.boolean().default(false),
  is_lost_stage: z.boolean().default(false),
  probability: z.number().int().min(0).max(100).default(0),
});

Response 201: { "data": Stage }
```

#### PUT /api/v1/pipelines/:id/stages/reorder

```
RBAC: admin, gestor

Body: { stage_ids: string[] }  — array de UUIDs na nova ordem

Response 200: { "data": Stage[] }
```

---

### 4.4 Activities

#### GET /api/v1/activities

```
RBAC: todos
Query: ?deal_id, ?contact_id, ?assigned_to=me|uuid, ?is_done, ?type, ?due_before, ?due_after, ?page, ?limit

Response 200: { "data": Activity[], "pagination": {...} }
```

#### POST /api/v1/activities

```
RBAC: todos

const CreateActivitySchema = z.object({
  deal_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  type: z.enum(['task', 'call', 'meeting', 'email', 'note', 'whatsapp', 'instagram']),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  is_mandatory: z.boolean().default(false),
  due_date: z.string().datetime().optional(),
}).refine(data => data.deal_id || data.contact_id, {
  message: "Informe deal_id ou contact_id"
});

Response 201: { "data": Activity }
Side effects: notification(task_due) para assigned_to com due_date < 24h
```

#### PUT /api/v1/activities/:id

```
RBAC: criador ou assigned_to ou admin/gestor

Body: { is_done?: boolean, title?, description?, due_date?, assigned_to? }

Response 200: { "data": Activity }
Side effects: Se is_done = true: seta done_at
```

---

### 4.5 Interactions

#### GET /api/v1/contacts/:contactId/interactions

```
RBAC: todos (RLS filtra por contact)
Query: ?channel, ?direction, ?page, ?limit

Response 200: { "data": Interaction[], "pagination": {...} }
```

#### POST /api/v1/contacts/:contactId/interactions

```
RBAC: todos (cria nota manual ou registra ligação)

const CreateInteractionSchema = z.object({
  channel: z.enum(['email', 'note', 'call', 'manual']),
  direction: z.enum(['inbound', 'outbound', 'internal']),
  content: z.string().min(1).max(10000),
  deal_id: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

Response 201: { "data": Interaction }
Side effects: audit_log se channel = 'note' com PII
```

---

### 4.6 WhatsApp

#### GET /api/v1/webhooks/whatsapp (verificação Meta)

```
RBAC: público
Query: ?hub.mode, ?hub.challenge, ?hub.verify_token

Responde com hub.challenge se verify_token válido
Response 200: number (challenge)
Response 403: token inválido
```

#### POST /api/v1/webhooks/whatsapp

```
RBAC: público (validado por X-Hub-Signature-256)
Headers: X-Hub-Signature-256: sha256=<hmac>

Body: Meta WhatsApp webhook payload

Processamento:
1. Validar HMAC (rejeitar com 401 se inválido)
2. Para cada mensagem: verificar meta_message_id na tabela whatsapp_messages (idempotência)
3. Se não existe: inserir whatsapp_messages + criar/atualizar contact + criar interaction
4. Retornar 200 imediatamente (processamento assíncrono via queue ou inline rápido)

Response 200: { "status": "ok" }
Response 401: HMAC inválido

Side effects:
  - Upsert contact via whatsapp_phone
  - Criar interaction(channel: whatsapp)
  - notification(new_message) para operador do pipeline varejo
  - Download mídia para Supabase Storage se content_type != text
```

#### POST /api/v1/whatsapp/send

```
RBAC: admin, gestor, atendente_varejo

const SendWhatsAppSchema = z.object({
  contact_id: z.string().uuid(),
  type: z.enum(['text', 'template', 'image', 'document', 'audio']),
  text: z.string().max(4096).optional(),
  template_name: z.string().optional(),
  template_language: z.string().default('pt_BR').optional(),
  template_components: z.array(z.unknown()).optional(),
  media_url: z.string().url().optional(),
  caption: z.string().max(1024).optional(),
}).refine(data => {
  if (data.type === 'text') return !!data.text;
  if (data.type === 'template') return !!data.template_name;
  return !!data.media_url;
}, { message: "Conteúdo inválido para o tipo de mensagem" });

Response 200: { "data": { "message_id": string, "status": "sent" } }
Response 422: erros de validação
Response 503: Meta API indisponível (inclui retry_at)

Side effects:
  - Cria whatsapp_messages(direction: outbound)
  - Cria interaction(channel: whatsapp, direction: outbound)
  - audit_log(action: CREATE)
```

#### GET /api/v1/whatsapp/templates

```
RBAC: admin, gestor, atendente_varejo
Response 200: { "data": Template[] } — busca templates aprovados na Meta API
```

---

### 4.7 Instagram

#### GET /api/v1/webhooks/instagram (verificação Meta)

```
RBAC: público
Query: ?hub.mode, ?hub.challenge, ?hub.verify_token

Response 200: challenge
Response 403: token inválido
```

#### POST /api/v1/webhooks/instagram

```
RBAC: público (validado por X-Hub-Signature-256)

Processamento:
1. Validar HMAC
2. Identificar tipo de evento: messaging (DM) ou comments (lead de comentário)
3. Verificar meta_message_id em instagram_messages (idempotência)
4. Inserir instagram_messages + upsert contact + criar interaction

Response 200: { "status": "ok" }
Response 401: HMAC inválido

Side effects:
  - Se is_comment_lead: criar contact + deal no pipeline varejo
  - notification(new_message ou new_lead)
```

#### POST /api/v1/instagram/send

```
RBAC: admin, gestor, atendente_varejo

const SendInstagramSchema = z.object({
  contact_id: z.string().uuid(),
  text: z.string().min(1).max(1000),
});

Response 200: { "data": { "message_id": string } }
Response 422: erros
Response 503: Meta API indisponível
Side effects: cria instagram_messages + interaction
```

---

### 4.8 Web Chat

#### POST /api/v1/webchat/sessions

```
RBAC: público (anônimo)

const CreateSessionSchema = z.object({
  visitor_name: z.string().min(1).max(100).optional(),
  visitor_email: z.string().email().optional(),
  visitor_phone: z.string().optional(),
  lgpd_consent: z.boolean().refine(val => val === true, { message: "Consentimento LGPD obrigatório" }),
  page_url: z.string().url().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

Response 201: {
  "data": {
    "session_id": string,
    "realtime_channel": string,  // "webchat:{session_id}"
    "supabase_anon_key": string  // para o widget se conectar ao Realtime
  }
}

Side effects:
  - Cria webchat_sessions
  - Notifica operadores disponíveis via Supabase Realtime (broadcast no channel 'webchat:operators')
```

#### GET /api/v1/webchat/sessions

```
RBAC: admin, gestor, atendente_varejo
Query: ?status, ?assigned_to, ?page, ?limit

Response 200: { "data": WebchatSession[], "pagination": {...} }
```

#### PUT /api/v1/webchat/sessions/:id

```
RBAC: atendente_varejo, admin, gestor

Body: { status?, assigned_to? }

Response 200: { "data": WebchatSession }
Side effects:
  - Se status = 'active' e assigned_to definido: cria contact a partir dos dados do visitante
  - Se status = 'closed': seta ended_at, cria interaction summary
```

#### POST /api/v1/webchat/sessions/:id/messages

```
RBAC: público (visitante via session token) ou autenticado (operador)

const SendWebchatMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  content_type: z.enum(['text']).default('text'),
  session_token: z.string().optional(),  // para visitante anônimo
});

Response 201: { "data": WebchatMessage }
Side effects:
  - Insere webchat_messages
  - Publica via Supabase Realtime Broadcast no channel 'webchat:{session_id}'
  - Atualiza last_activity_at na sessão
  - Se from_visitor e operador está ausente: notification(new_message) para operadores disponíveis
```

#### GET /api/v1/webchat/sessions/:id/messages

```
RBAC: operador autenticado ou visitante com session_token
Response 200: { "data": WebchatMessage[] }
```

---

### 4.9 Dashboard

#### GET /api/v1/dashboard/kpis

```
RBAC: admin, gestor
Query: ?pipeline_type=atacado|varejo, ?period=7d|30d|90d (default: 30d), ?assigned_to=uuid

Response 200:
{
  "data": {
    "total_leads": number,
    "leads_this_period": number,
    "leads_growth_pct": number,
    "total_deals_open": number,
    "deals_won": number,
    "deals_lost": number,
    "conversion_rate": number,
    "pipeline_value": number,
    "avg_deal_value": number,
    "messages_today": number,
    "pending_tasks": number,
    "webchat_sessions_open": number,
    "leads_by_source": { source: string, count: number }[],
    "deals_by_stage": { stage: string, count: number, value: number }[],
    "messages_by_channel": { channel: string, count: number }[]
  }
}
```

#### GET /api/v1/dashboard/funnel

```
RBAC: admin, gestor
Query: ?pipeline_id, ?period

Response 200: { "data": { stage_id, stage_name, count, value, avg_days_in_stage }[] }
```

---

### 4.10 Users & Auth

#### GET /api/v1/users

```
RBAC: admin, gestor
Response 200: { "data": User[] }
```

#### POST /api/v1/users

```
RBAC: admin apenas

const CreateUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(200),
  role: z.enum(['gestor', 'vendedor_atacado', 'atendente_varejo']),
  phone: z.string().optional(),
});

Response 201: { "data": User }
Side effects:
  - Cria usuário via Supabase Admin API (envia email de convite)
  - audit_log(action: CREATE)
```

#### PUT /api/v1/users/:id

```
RBAC: admin (para role e is_active), próprio usuário (para full_name, phone, avatar_url)

const UpdateUserSchema = z.object({
  full_name: z.string().min(2).max(200).optional(),
  phone: z.string().optional(),
  role: z.enum(['gestor', 'vendedor_atacado', 'atendente_varejo']).optional(),
  is_active: z.boolean().optional(),
});

Response 200: { "data": User }
Side effects: audit_log(action: UPDATE)
```

#### DELETE /api/v1/users/:id

```
RBAC: admin apenas

Response 200: { "message": "Usuário desativado" }
Side effects:
  - Soft delete (deleted_at)
  - Desabilita via Supabase Admin API
  - audit_log(action: DELETE)
```

---

### 4.11 Notifications

#### GET /api/v1/notifications

```
RBAC: próprio usuário
Query: ?is_read=boolean, ?type, ?limit=25

Response 200: { "data": Notification[], "unread_count": number }
```

#### PUT /api/v1/notifications/read-all

```
RBAC: próprio usuário
Response 200: { "message": "Notificações marcadas como lidas" }
```

#### PUT /api/v1/notifications/:id/read

```
RBAC: próprio usuário
Response 200: { "data": Notification }
```

---

### 4.12 Endpoint Público — Formulário Site

#### POST /api/v1/public/leads

```
RBAC: público — sem autenticação

Rate limiting:
  - 5 requests por IP por hora (via Vercel Edge Middleware + Upstash Redis)
  - 3 requests por email por dia

const PublicLeadSchema = z.object({
  full_name: z.string().min(2).max(200),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?55\d{10,11}$/).optional(),
  company_name: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  is_b2b: z.boolean().default(false),
  // LGPD: campo obrigatório
  lgpd_consent: z.boolean().refine(val => val === true, {
    message: "O consentimento LGPD é obrigatório para enviar o formulário"
  }),
  // Contexto
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
  page_url: z.string().url().optional(),
}).refine(data => data.email || data.phone, {
  message: "Informe email ou telefone"
});

Response 201: { "message": "Obrigado! Entraremos em contato em breve." }
Response 422: { "errors": ZodValidationErrors }
Response 429: { "message": "Muitas tentativas. Aguarde antes de tentar novamente.", "retry_after": number }

Side effects:
  - Cria contact com lgpd_consent=true, lgpd_consent_ip=ip
  - Cria deal no pipeline correspondente (atacado se is_b2b, varejo se não)
  - Cria lead_source(type: site_form)
  - Cria interaction(channel: manual, direction: inbound, content: message)
  - notification(new_lead) para gestor/vendedor do pipeline
  - audit_log(action: CREATE, table: contacts) com IP
```

---

## 5. Integração WhatsApp Cloud API

### 5.1 Auth — System User Access Token

```
Configuração no Meta Business Suite:
1. Meta Business Manager > Configurações > Usuários do Sistema
2. Criar System User com função "Admin"
3. Adicionar ativo: WhatsApp Business Account
4. Gerar token permanente (não expira):
   - Product: WhatsApp
   - Permissions: whatsapp_business_messaging, whatsapp_business_management
5. Salvar token em WHATSAPP_SYSTEM_USER_TOKEN (env var Vercel)

Variáveis necessárias:
  WHATSAPP_SYSTEM_USER_TOKEN=<token permanente>
  WHATSAPP_PHONE_NUMBER_ID=<phone_number_id do número da Techmalhas>
  WHATSAPP_BUSINESS_ACCOUNT_ID=<waba_id>
  WHATSAPP_WEBHOOK_VERIFY_TOKEN=<string aleatória segura para verificação>
  WHATSAPP_APP_SECRET=<app secret para validar HMAC>
```

### 5.2 Webhook — Configuração e Verificação

```
Configuração no Meta for Developers:
1. App > WhatsApp > Configuration > Webhook
2. Callback URL: https://crm.techmalhas.com.br/api/v1/webhooks/whatsapp
3. Verify Token: valor de WHATSAPP_WEBHOOK_VERIFY_TOKEN
4. Subscribir eventos: messages, message_status_updates

Verificação (GET /api/v1/webhooks/whatsapp):
// src/app/api/v1/webhooks/whatsapp/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}
```

### 5.3 Recebimento de Mensagens — Fluxo

```
POST /api/v1/webhooks/whatsapp

Payload Meta (exemplo mensagem de texto):
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WABA_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": { "phone_number_id": "PHONE_ID" },
        "contacts": [{ "profile": { "name": "João" }, "wa_id": "5516999999999" }],
        "messages": [{
          "from": "5516999999999",
          "id": "wamid.xxx",    ← meta_message_id
          "timestamp": "1234567890",
          "type": "text",
          "text": { "body": "Olá, quero um orçamento" }
        }]
      }
    }]
  }]
}

Fluxo de processamento:
1. Validar HMAC-SHA256 (X-Hub-Signature-256)
2. Parsear entry[].changes[].value.messages[]
3. Para cada mensagem:
   a. CHECK idempotência: SELECT 1 FROM whatsapp_messages WHERE meta_message_id = $1
   b. Se existe → return 200 (já processado)
   c. Se não existe → BEGIN TRANSACTION:
      - INSERT whatsapp_messages
      - UPSERT contacts ON CONFLICT(whatsapp_phone) DO UPDATE
      - INSERT interactions
      - COMMIT
4. Para status updates (entry[].changes[].value.statuses[]):
   - UPDATE whatsapp_messages SET status = $1 WHERE meta_message_id = $2

Tipos de mensagem suportados:
  text, image, audio, document, video, sticker, location, contacts, reaction
  
Para mídia (image, audio, document, video):
  - Baixar URL temporária Meta: GET /{media-id} com token
  - Upload para Supabase Storage: storage/whatsapp-media/{contact_id}/{filename}
  - Salvar URL permanente em whatsapp_messages.media_url
```

### 5.4 Envio de Mensagens

```typescript
// src/lib/whatsapp/send.ts
const META_API_BASE = 'https://graph.facebook.com/v19.0';

interface SendMessageResult {
  messages: [{ id: string }];
}

export async function sendWhatsAppMessage(
  to: string,  // número E.164 sem +
  message: WhatsAppMessagePayload
): Promise<SendMessageResult> {
  const response = await fetch(
    `${META_API_BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_SYSTEM_USER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        ...message
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new WhatsAppApiError(error.error.code, error.error.message);
  }
  
  return response.json();
}
```

### 5.5 Idempotência

```
Estratégia de idempotência para o webhook:

Tabela whatsapp_messages tem:
  meta_message_id TEXT NOT NULL UNIQUE

Fluxo de idempotência:
  1. Webhook recebe mensagem com meta_message_id = "wamid.HBgNNTUxNjk..."
  2. Tenta INSERT whatsapp_messages (..., meta_message_id, ...)
  3. ON CONFLICT (meta_message_id) DO NOTHING
  4. Se inseriu (RETURNING id IS NOT NULL): processar
  5. Se não inseriu: já processado → retornar 200 imediatamente

Para mensagens de status (delivered, read, failed):
  1. UPDATE whatsapp_messages SET status = $1, updated_at = NOW()
     WHERE meta_message_id = $2
  2. Sempre retornar 200 (idempotente — mesmo status aplicado N vezes = ok)
  
Garantia: Meta pode reenviar webhooks. O UNIQUE em meta_message_id + ON CONFLICT
garante que nunca criamos duplicate contacts ou interactions.
```

### 5.6 Retry Strategy

```
Mensagens com status = 'failed' são reprocessadas pelo Cron Job de retry:

Vercel Cron: */5 * * * * → POST /api/v1/cron/whatsapp-retry

Estratégia de backoff exponencial:
  retry_count = 1 → retry em 5 minutos
  retry_count = 2 → retry em 15 minutos
  retry_count = 3 → retry em 1 hora
  retry_count >= 4 → marcar como 'permanently_failed', notificar admin

Lógica:
  SELECT * FROM whatsapp_messages
  WHERE status = 'failed'
    AND retry_count < 4
    AND retry_next_at <= NOW()
  LIMIT 50;
  
  Para cada mensagem:
    - Tentar reenvio via Meta API
    - Se sucesso: UPDATE status = 'sent', retry_count = retry_count
    - Se falha: UPDATE retry_count++, retry_next_at = NOW() + backoff_interval
```

---

## 6. Integração Instagram Messaging API

### 6.1 Diferenças vs WhatsApp

| Aspecto | WhatsApp Cloud API | Instagram Messaging API |
|---|---|---|
| Identificador de mensagem | `wamid.xxx` | `mid.xxx` |
| Templates | Sim (pré-aprovados pela Meta) | Não (apenas free-form text/mídia) |
| Janela de resposta | 24h (Customer Initiated) | 24h (Customer Initiated) |
| Taxa por mensagem | Sim (por conversa) | Não (gratuito) |
| Tipo de conta | WhatsApp Business Account | Instagram Business/Creator |
| Aprovação Meta | App Review para non-test users | App Review obrigatório |
| Lead de comentário | Não aplicável | Sim, via Graph API comments |
| Leitura de DMs | Via webhook | Via webhook |
| Identificador do usuário | Número de telefone | Instagram User ID (IGSID) |

### 6.2 Checklist de Aprovação Meta

```
PRÉ-REQUISITOS (antes de solicitar aprovação):
[ ] Instagram Business Account ou Creator Account ativa
[ ] Conta conectada a um Meta Business Manager verificado
[ ] CNPJ da Techmalhas verificado no Business Manager
[ ] App criado no Meta for Developers (tipo: Business)
[ ] Domínio verificado: techmalhas.com.br
[ ] Política de Privacidade publicada com link no app
[ ] Termos de Serviço publicados com link no app
[ ] URL do app válida (landing page da Techmalhas)

PERMISSÕES A SOLICITAR:
[ ] instagram_basic — leitura de perfil
[ ] instagram_manage_messages — envio/recebimento de DMs
[ ] pages_show_list — listar páginas do Business
[ ] pages_manage_metadata — gerenciar webhook da página
[ ] pages_read_engagement — ler comentários (para lead capture)

PROCESSO DE REVISÃO:
[ ] Gravar screencast mostrando o fluxo de uso das permissões no CRM
[ ] Explicar caso de uso em texto (pt-BR aceito): "CRM para gestão de leads de lojistas e consumidores"
[ ] Aguardar revisão Meta: ~2-6 semanas
[ ] Responder possíveis pedidos de informação adicional

PÓS-APROVAÇÃO:
[ ] Configurar webhook no App > Instagram > Webhooks
[ ] URL: https://crm.techmalhas.com.br/api/v1/webhooks/instagram
[ ] Subscribir: messages, messaging_postbacks, comments
[ ] Testar com conta de teste antes de ativar produção
```

### 6.3 Webhook DMs

```
POST /api/v1/webhooks/instagram

Payload Meta (DM recebida):
{
  "object": "instagram",
  "entry": [{
    "id": "IG_ACCOUNT_ID",
    "time": 1234567890,
    "changes": [{
      "field": "messages",
      "value": {
        "sender": { "id": "IGSID_DO_VISITANTE" },
        "recipient": { "id": "IG_ACCOUNT_ID" },
        "timestamp": 1234567890,
        "message": {
          "mid": "mid.xxx",     ← meta_message_id para idempotência
          "text": "Olá, vi vocês no Instagram..."
        }
      }
    }]
  }]
}

Processamento:
1. Validar HMAC-SHA256 (X-Hub-Signature-256)
2. Para cada DM:
   a. Verificar mid em instagram_messages (idempotência)
   b. Buscar/criar contact via instagram_id (IGSID)
   c. Enriquecer contact: GET /{sender_id}?fields=name,username,profile_pic via Graph API
   d. INSERT instagram_messages
   e. INSERT interactions(channel: instagram)
   f. Notificar operador
```

### 6.4 Captura de Leads de Comentários

```
Webhook para comentários em posts:

Payload (novo comentário):
{
  "object": "instagram",
  "entry": [{
    "changes": [{
      "field": "comments",
      "value": {
        "id": "COMMENT_ID",
        "text": "Quanto custa essa blusa? Tenho interesse!",
        "from": { "id": "IGSID", "username": "usuario_interessado" },
        "media": { "id": "POST_ID" }
      }
    }]
  }]
}

Critérios para criar lead a partir de comentário:
- Palavras-chave: "quanto", "preço", "valor", "comprar", "interesse", "atacado", "lote"
- Ou qualquer comentário em posts marcados como "campanha" (configurável)

Fluxo:
1. Receber webhook de comentário
2. Analisar texto com função isLeadComment(text: string): boolean
3. Se lead: criar contact + deal(pipeline: varejo, stage: inicial)
4. Marcar instagram_messages.is_comment_lead = true
5. Enviar DM automática: "Olá! Vi que você comentou em nosso post. Posso te ajudar?"
   (via POST /{ig_account_id}/messages — template de resposta a comentário)

Graph API para buscar comentários de post (proativo, via cron):
GET /{post_id}/comments?fields=id,text,from,timestamp
```

### 6.5 Idempotência

```
Mesmo modelo do WhatsApp:
  instagram_messages.meta_message_id TEXT NOT NULL UNIQUE

INSERT ... ON CONFLICT (meta_message_id) DO NOTHING
RETURNING id → se NULL: já processado, retornar 200

Para comentários: usar COMMENT_ID como identificador único
  (campo source_post_id + meta_message_id = COMMENT_ID garante unicidade)
```

---

## 7. Chat ao Vivo (Widget)

### 7.1 Arquitetura

```
Decisão: Supabase Realtime — Broadcast + Postgres Changes

Componentes:
  [Widget JS no site] ←WebSocket→ [Supabase Realtime] ←→ [CRM Next.js]

  - Supabase Realtime usa Phoenix Channels sobre WebSocket
  - Channel por sessão: "webchat:{session_id}"
  - Widget se conecta com supabase_anon_key (sem auth) ao channel específico
  - Operador se conecta com JWT ao mesmo channel
  - Mensagens publicadas via Broadcast chegam em <200ms para ambos

Modelo de mensagens:
  Visitante → INSERT webchat_messages → Supabase Postgres Changes → Broadcast → Operador
  Operador  → INSERT webchat_messages → Supabase Postgres Changes → Broadcast → Visitante
  
  Ambos também recebem via Broadcast direto (mais rápido que Postgres Changes):
  Visitante publica: supabase.channel('webchat:123').send({ type: 'broadcast', event: 'message', payload: {...} })
```

### 7.2 Fluxo de Sessão

```
1. VISITANTE abre widget no site (clica no ícone de chat)

2. Widget coleta (opcional): nome, email, telefone
   - Formulário opcional antes de iniciar
   - LGPD: checkbox obrigatório "Li e aceito a Política de Privacidade"

3. Widget → POST /api/v1/webchat/sessions
   - Retorna: { session_id, realtime_channel: "webchat:{uuid}", supabase_anon_key }

4. Widget conecta ao Supabase Realtime:
   const supabase = createClient(SUPABASE_URL, supabase_anon_key)
   const channel = supabase.channel('webchat:{session_id}')
   channel
     .on('broadcast', { event: 'message' }, ({ payload }) => renderMessage(payload))
     .on('broadcast', { event: 'operator_joined' }, () => showOperatorStatus())
     .subscribe()

5. OPERADOR no CRM recebe notificação (toast + badge no inbox):
   - Supabase Realtime channel 'webchat:operators' recebe broadcast de nova sessão
   - Operador clica na notificação → abre janela de chat no inbox

6. Operador → PUT /api/v1/webchat/sessions/{id} { assigned_to: user_id, status: 'active' }
   - Broadcast no channel da sessão: { event: 'operator_joined', payload: { name: 'Ana' } }

7. CONVERSA:
   - Visitante: POST /api/v1/webchat/sessions/{id}/messages (sem auth, com session_token)
   - Operador: POST /api/v1/webchat/sessions/{id}/messages (com JWT)
   - Ambos recebem via Broadcast em <200ms

8. FIM DA SESSÃO:
   - Visitante clica "Encerrar" → broadcast { event: 'session_closed' }
   - Ou timeout (15 min sem atividade → cron job fecha sessão)
   - PUT /api/v1/webchat/sessions/{id} { status: 'closed' }
   - Histórico salvo em webchat_messages + summary em interactions
```

### 7.3 Código do Widget (embed snippet)

```html
<!-- Adicionar ao <head> ou antes do </body> do site techmalhas.com.br -->
<script>
  window.TechmalhasChat = {
    url: 'https://crm.techmalhas.com.br',
    primaryColor: '#6366f1',
    welcomeMessage: 'Olá! Como podemos ajudar?',
    placeholder: 'Digite sua mensagem...',
    lgpdText: 'Aceito a <a href="/politica-de-privacidade" target="_blank">Política de Privacidade</a>'
  };
</script>
<script
  src="https://crm.techmalhas.com.br/widget.js"
  async
  defer
></script>
```

O `widget.js` é um bundle JS vanilla (sem framework) servido estaticamente pelo Vercel. Ele:
- Injeta o botão flutuante no DOM
- Gerencia a UI do chat (CSS-in-JS isolado com shadow DOM para evitar conflitos)
- Usa `@supabase/supabase-js` para Realtime
- Persiste session_id no `localStorage` (30 min TTL) para não criar nova sessão se o usuário navega entre páginas

### 7.4 Realtime via Supabase

```typescript
// src/lib/webchat/realtime.ts (no CRM — lado do operador)
import { createClient } from '@supabase/supabase-js';

export function subscribeToWebchatSession(
  sessionId: string,
  onMessage: (msg: WebchatMessage) => void,
  onOperatorJoin: (operator: { name: string }) => void
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const channel = supabase
    .channel(`webchat:${sessionId}`)
    .on('broadcast', { event: 'message' }, ({ payload }) => onMessage(payload))
    .on('broadcast', { event: 'operator_joined' }, ({ payload }) => onOperatorJoin(payload))
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'webchat_messages', filter: `session_id=eq.${sessionId}` },
      (payload) => onMessage(payload.new as WebchatMessage)
    )
    .subscribe();
    
  return () => supabase.removeChannel(channel); // cleanup
}

// Broadcast de nova sessão para operadores
export async function broadcastNewSession(session: WebchatSession) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  await supabase.channel('webchat:operators').send({
    type: 'broadcast',
    event: 'new_session',
    payload: { session_id: session.id, visitor_name: session.visitor_name, page_url: session.page_url }
  });
}
```

---

## 8. Formulário do Site → Lead

### 8.1 Endpoint

`POST /api/v1/public/leads` — documentado na seção 4.12.

### 8.2 Rate Limiting

```
Implementação via Vercel Edge Middleware + Upstash Redis:

// src/middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 h'),  // 5 req/hora por IP
  analytics: true,
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/v1/public/leads') {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success, remaining, reset } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { message: 'Muitas tentativas. Aguarde antes de tentar novamente.', retry_after: reset },
        { status: 429, headers: { 'Retry-After': String(Math.floor((reset - Date.now()) / 1000)) } }
      );
    }
  }
  return NextResponse.next();
}

Variáveis necessárias:
  UPSTASH_REDIS_REST_URL=<url>
  UPSTASH_REDIS_REST_TOKEN=<token>
  
Custo Upstash: plano gratuito (10.000 req/dia) suficiente para MVP.
```

### 8.3 LGPD no Formulário

```
Obrigações no formulário do site:

1. CAMPO lgpd_consent obrigatório:
   <input type="checkbox" required />
   <label>
     Li e aceito a <a href="/politica-de-privacidade">Política de Privacidade</a>
     e consinto com o uso dos meus dados para contato comercial.
   </label>

2. Dados capturados pelo endpoint:
   - lgpd_consent: true (validado no Zod — refine)
   - lgpd_consent_at: timestamp do servidor
   - lgpd_consent_ip: IP do cliente (X-Forwarded-For)
   
3. Estes dados são armazenados em contacts.lgpd_consent, lgpd_consent_at, lgpd_consent_ip

4. Finalidade e base legal:
   - B2C: Consentimento (Art. 7º, I LGPD)
   - B2B: Legítimo interesse (Art. 7º, IX LGPD) — mas coletamos consentimento de qualquer forma

5. Dados mínimos: apenas nome + contato + mensagem. Não coletar dados desnecessários.

6. Opt-out: link "Solicitar exclusão dos meus dados" no rodapé do site:
   mailto:privacidade@techmalhas.com.br com assunto padrão
```

---

## 9. Plano LGPD

### 9.1 Inventário de PII por Tabela

| Tabela | Dados Pessoais | Dados Sensíveis | Anonimizável |
|---|---|---|---|
| `users` | email, full_name, phone, last_login_at | — | Sim (exclusão de conta) |
| `contacts` | full_name, email, phone, document_cpf, document_cnpj, company_name, instagram_username, lgpd_consent_ip | CPF (dado sensível se combinado) | Sim (purge após retenção) |
| `deals` | — (referência a contacts) | — | N/A |
| `interactions` | content (mensagem pode conter PII), media_url | — | Sim (anonimizar content) |
| `whatsapp_messages` | content_text, meta_phone_number_id, meta_raw_payload | — | Sim |
| `instagram_messages` | content_text, meta_sender_ig_id, meta_raw_payload | — | Sim |
| `webchat_sessions` | visitor_name, visitor_email, visitor_phone, visitor_ip, visitor_user_agent | — | Sim |
| `webchat_messages` | content (mensagem) | — | Sim |
| `audit_logs` | user_email, user_ip, user_agent, old_values | — | Não (retenção legal) |
| `notifications` | — | — | N/A |

### 9.2 Base Legal por Dado

| Contexto | Base Legal LGPD | Artigo |
|---|---|---|
| Leads B2C (consumidores) — formulário site | Consentimento | Art. 7º, I |
| Leads B2C — WhatsApp/Instagram (iniciou contato) | Legítimo interesse | Art. 7º, IX |
| Clientes B2B (lojistas) — dados de empresa | Execução de contrato | Art. 7º, V |
| Clientes B2B — dados pessoais do representante | Legítimo interesse | Art. 7º, IX |
| Usuários do CRM (funcionários Techmalhas) | Relação de emprego/contrato | Art. 7º, V |
| Audit logs | Obrigação legal / compliance | Art. 7º, II |
| WhatsApp: histórico de mensagens | Legítimo interesse | Art. 7º, IX |
| Webchat: sessões e mensagens | Consentimento (coletado na abertura do chat) | Art. 7º, I |

### 9.3 Retenção de Dados

| Tipo de dado | Retenção | Ação ao expirar |
|---|---|---|
| Leads não convertidos (sem deal) | 90 dias após criação | Soft delete → purge completo no cron mensal |
| Clientes com deal ativo | Indefinido (enquanto relação comercial) | Manter |
| Clientes com deal fechado (won/lost) | 5 anos (prazo fiscal/contratual) | Purge após 5 anos |
| Histórico de interações (clientes ativos) | 5 anos | — |
| Histórico de interações (leads não convertidos) | 90 dias | Purge com o contato |
| Mensagens WhatsApp/Instagram | 5 anos para clientes, 90 dias para leads | Purge conforme contato |
| Webchat sessions (anônimas sem conversão) | 30 dias | Purge |
| Audit logs | 5 anos | Arquivamento (não exclusão — obrigação legal) |
| Dados de usuários CRM (ex-funcionários) | 2 anos após desligamento | Anonimizar email + nome |

### 9.4 Exclusão — Direito ao Esquecimento

```
Fluxo de exclusão de contato (LGPD Art. 18):

1. Solicitação via email: privacidade@techmalhas.com.br
   (MVP: processo manual; v2: portal self-service)

2. Verificação de identidade: email + telefone cadastrado

3. Avaliação:
   - Se contato sem deal ativo: exclusão imediata (soft delete + purge)
   - Se contato com deal ativo: informar impossibilidade (execução de contrato)
   - Se contato com deal fechado: exclusão após prazo fiscal (5 anos)

4. Execução técnica:
   a. Soft delete: contacts.deleted_at = NOW()
   b. Anonimizar PII diretamente:
      UPDATE contacts SET
        full_name = 'USUÁRIO REMOVIDO',
        email = NULL,
        phone = NULL,
        document_cpf = NULL,
        document_cnpj = NULL,
        whatsapp_phone = NULL,
        instagram_id = NULL
      WHERE id = $1;
   c. Anonimizar interactions.content com PII identificável
   d. NÃO deletar audit_logs (obrigação legal)
   e. Manter deals com dados anonimizados (histórico financeiro)

5. Registro: audit_log(action: DELETE, table: contacts) com nota de solicitação LGPD

6. Resposta ao solicitante em até 15 dias (prazo LGPD)
```

### 9.5 Audit Log — Eventos Obrigatórios

```
Eventos que DEVEM gerar audit_log:

CREATE:
  - contacts (sempre)
  - deals (sempre)
  - users (sempre)
  - public/leads (sempre, com IP)

READ:
  - contacts com CPF/CNPJ
  - export de dados (bulk)

UPDATE:
  - contacts (campos com PII)
  - users.role (troca de papel)
  - deals.status (won/lost)

DELETE:
  - contacts (soft delete)
  - users (desativação)

EXPORT:
  - qualquer bulk export de contacts

LOGIN:
  - login bem-sucedido (users.last_login_at)
  - tentativa de login falhada (no middleware)

CONSENT:
  - captura de lgpd_consent em qualquer tabela

Implementação:
// src/lib/audit.ts
export async function logAuditEvent(prisma: PrismaClient, event: {
  user_id: string | null;
  user_email: string;
  user_role: string | null;
  user_ip: string | null;
  action: AuditAction;
  table_name: string;
  record_id?: string;
  changed_fields?: string[];
  old_values?: Record<string, unknown>;
  request_id?: string;
}) {
  // Remover PII sensível de old_values antes de logar
  const sanitized = sanitizePIIFromOldValues(event.old_values);
  await prisma.audit_logs.create({ data: { ...event, old_values: sanitized } });
}
```

---

## 10. Plano de Deploy

### 10.1 `.env.example`

```bash
# ============================================================
# SUPABASE
# ============================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NUNCA expor no cliente — apenas server-side
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=seu-jwt-secret-do-supabase

# ============================================================
# DATABASE (Prisma — connection string Supabase)
# ============================================================
DATABASE_URL="postgresql://postgres:[senha]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[senha]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"
# DIRECT_URL é necessário para prisma migrate (sem pgbouncer)

# ============================================================
# WHATSAPP CLOUD API (Meta)
# ============================================================
WHATSAPP_SYSTEM_USER_TOKEN=EAAxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_BUSINESS_ACCOUNT_ID=1234567890
WHATSAPP_WEBHOOK_VERIFY_TOKEN=meu-token-seguro-aleatorio-32chars
WHATSAPP_APP_SECRET=xxxxxxxxxxxxx  # para validar HMAC dos webhooks

# ============================================================
# INSTAGRAM MESSAGING API (Meta)
# ============================================================
INSTAGRAM_APP_ID=xxxxxxxxxxxxx
INSTAGRAM_APP_SECRET=xxxxxxxxxxxxx
INSTAGRAM_BUSINESS_ACCOUNT_ID=xxxxxxxxxxxxx
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=meu-token-ig-seguro-32chars
INSTAGRAM_ACCESS_TOKEN=EAAxxxxxxxxxxxxx  # Page Access Token permanente

# ============================================================
# UPSTASH REDIS (Rate Limiting)
# ============================================================
UPSTASH_REDIS_REST_URL=https://xxxxxxxxxxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxxxxxxxxxx

# ============================================================
# VERCEL CRON (segurança dos endpoints de cron)
# ============================================================
CRON_SECRET=meu-secret-para-autenticar-cron-jobs

# ============================================================
# APP
# ============================================================
NEXT_PUBLIC_APP_URL=https://crm.techmalhas.com.br
NEXT_PUBLIC_WIDGET_URL=https://crm.techmalhas.com.br/widget.js
NODE_ENV=production

# ============================================================
# LGPD
# ============================================================
LGPD_PRIVACY_EMAIL=privacidade@techmalhas.com.br
```

### 10.2 `package.json` scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint && tsc --noEmit",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "db:generate": "prisma generate",
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:migrate:reset": "prisma migrate reset --force",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:push": "prisma db push",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint:fix": "next lint --fix"
  }
}
```

### 10.3 GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-typecheck:
    name: Lint & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate Prisma Client
        run: npx prisma generate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_CI }}
          
      - name: Typecheck
        run: npm run typecheck
        
      - name: Lint
        run: npm run lint
        
      - name: Format check
        run: npm run format:check

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint-typecheck
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate Prisma Client
        run: npx prisma generate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_CI }}
          
      - name: Run tests
        run: npm run test:coverage
        env:
          # CI usa banco de teste separado
          DATABASE_URL: ${{ secrets.DATABASE_URL_CI }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL_CI }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_CI }}

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_CI }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL_CI }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_CI }}
          NEXT_PUBLIC_APP_URL: https://crm.techmalhas.com.br
```

### 10.4 Vercel Config

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "crons": [
    {
      "path": "/api/v1/cron/lgpd-purge",
      "schedule": "0 3 1 * *"
    },
    {
      "path": "/api/v1/cron/whatsapp-retry",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/v1/cron/expire-webchat-sessions",
      "schedule": "*/15 * * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    },
    {
      "source": "/widget.js",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://techmalhas.com.br" },
        { "key": "Cache-Control", "value": "public, max-age=3600, stale-while-revalidate=86400" }
      ]
    }
  ]
}
```

```
Configuração de domínio no Vercel:
  Domínio customizado: crm.techmalhas.com.br
  SSL: automático (Let's Encrypt via Vercel)
  
Variáveis de ambiente no Vercel Dashboard:
  - Adicionar todas as variáveis do .env.example
  - Separar por ambiente: Production / Preview / Development
  - Variáveis prefixadas NEXT_PUBLIC_: disponíveis no browser
  - Demais: apenas server-side
  
Preview deployments:
  - Cada PR gera um preview em crm-techmalhas-git-{branch}.vercel.app
  - Usar banco Supabase de staging (separado do produção)
```

---

## 11. Estimativa de Custos Mensais

| Serviço | Plano | Custo/mês (USD) | Custo/mês (BRL ~5,20) | Observações |
|---|---|---|---|---|
| **Vercel** | Pro | $20 | ~R$104 | Inclui Cron Jobs, 1TB bandwidth, preview deployments |
| **Supabase** | Pro | $25 | ~R$130 | Inclui 8GB DB, 100GB storage, 500 Realtime connections, 50k MAU Auth |
| **Meta WhatsApp** | Pay-as-you-go | $10–$50 | ~R$52–R$260 | ~R$0,08–0,16 por conversa (24h window). Estimativa: 300-600 conversas/mês |
| **Meta Instagram** | Gratuito | $0 | R$0 | Instagram Messaging API não cobra por mensagem |
| **Upstash Redis** | Free Tier | $0 | R$0 | 10k req/dia — suficiente para rate limiting de formulário |
| **Domínio** | crm.techmalhas.com.br | ~$2 | ~R$10 | Subdomínio do domínio existente — custo desprezível |
| **GitHub Actions** | Free (2000 min/mês) | $0 | R$0 | Suficiente para CI |
| | | | | |
| **TOTAL MVP** | | **$57–$97/mês** | **~R$296–R$504/mês** | |

**Notas:**
- WhatsApp: custo varia por região e volume. Conversa = janela de 24h. Primeiras 1.000 conversas/mês com usuários são gratuitas (Business Initiated). Estimativa conservadora para início.
- Supabase: se DB ultrapassar 8GB ou MAU Auth ultrapassar 50k → upgrade para Team ($599/mês) — improvável no MVP.
- Vercel: se bandwidth ultrapassar 1TB → cobrança por GB adicional — improvável no MVP.
- Upstash: se rate limiting crescer muito → Free tier suficiente para até 10k req/dia.

---

## 12. Riscos Técnicos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| **Aprovação Meta para Instagram API negada ou atrasada (4-8 semanas)** | Alta | Médio | Feature toggle — MVP funciona sem Instagram. Usar conta de teste durante desenvolvimento. Iniciar processo de aprovação imediatamente. |
| **Limite de conexões Supabase Realtime (500 simultâneas Pro)** | Baixa | Alto | Monitorar métricas. Plano Team tem 1000 conexões. Widget JS fecha conexão quando chat encerrado ou aba não ativa. |
| **API Dapic sem documentação / incompatível** | Alta | Baixo (v2) | Campos reservados no schema. MVP não depende. Contato com suporte Dapic antes de v2. |
| **Cold start Vercel + Prisma em webhook WhatsApp** | Média | Médio | Usar Node.js runtime (não Edge). `connection_limit=1` no DATABASE_URL. Manter função aquecida com health check a cada 5 min (Vercel Cron). |
| **Meta muda API WhatsApp (versão deprecation)** | Média | Médio | Pinned versão `v19.0` no código. Inscrever no Meta Changelog. Migração de versão é 1-2 dias de trabalho. |
| **LGPD: vazamento de dados PII** | Baixa | Crítico | RLS em todas as tabelas de PII. Service role key apenas em server-side. Audit log completo. Nenhum dado PII em query params ou URLs. |
| **Rate limit Meta WhatsApp (1.000 msg/s por número)** | Baixa | Médio | Queue de envio com throttling (50 msg/s para margem). Monitorar rate limit headers da API Meta. |
| **Supabase Realtime instabilidade (downtimes históricos)** | Média | Médio | Fallback para polling HTTP a cada 3s no widget se WebSocket falhar. `supabase-js` tem reconexão automática. |
| **Custos WhatsApp acima do previsto** | Média | Médio | Alert de custo no Meta Business Manager. Limite de gastos configurado. Analisar conversas desnecessárias (bots vs humanos). |
| **Prisma connection pooling esgotado (serverless)** | Média | Alto | `connection_limit=1` no pgbouncer URL. Supabase Pro inclui PgBouncer. Monitorar `pg_stat_activity`. Considerar Prisma Accelerate se problema persistir. |
| **Tokens Meta expirados** | Baixa | Alto | System User Token é permanente (não expira). Monitorar via cron semanal: GET /me?access_token={token} com alerta se falhar. |
| **Next.js 15 / React 19 breaking changes** | Baixa | Médio | Pinned versões exatas no package.json. Lock file commitado. Testar upgrades em branch separado. |

---

*Documento gerado em 2026-05-24 — Arnaldo Arquiteto, Squad CRM Techmalhas.*
*Revisão necessária após: aprovação Meta Instagram, consulta API Dapic, primeiro deploy em produção.*
