---
execution: subagent
agent: fullstack-developer
inputFile: squads/crm-techmalhas/output/architecture.md
outputFile: squads/crm-techmalhas/output/code/db-schema.md
model_tier: powerful
---

# Step 08: Schema PostgreSQL com Prisma

## Context Loading

Load these files before executing:
- `squads/crm-techmalhas/output/architecture.md` — ERD aprovado pelo Arnaldo
- `squads/crm-techmalhas/output/architecture-decision.md` — ajustes do Checkpoint 2
- `squads/crm-techmalhas/output/requirements.md` — referência das stories
- `squads/crm-techmalhas/pipeline/data/domain-framework.md` — convenções (snake_case, plural)
- `squads/crm-techmalhas/pipeline/data/quality-criteria.md` — critérios de código

## Instructions

### Process

1. **Gerar `prisma/schema.prisma` completo** — todos os models do ERD com relations, enums, índices, mappings de coluna (`@map`), mappings de tabela (`@@map`). Manter compatibilidade com Supabase (auth.users como source of truth para users).
2. **Gerar migration inicial** — SQL completo da migration `001_initial`.
3. **Gerar RLS policies em SQL** — em arquivo separado `prisma/migrations/002_rls_policies.sql` para ser aplicado após o schema.
4. **Gerar trigger de sincronização** Supabase Auth → tabela `users` em SQL.
5. **Criar `prisma/seed.ts`** — dados iniciais para desenvolvimento: 1 admin, 2 vendedores, 2 pipelines (atacado + varejo) com stages padrão, 10 contatos fake, 5 deals fake.
6. **Criar `lib/db.ts`** — singleton do PrismaClient com proteção para hot-reload em dev.
7. **Documentar comandos de setup** — `pnpm prisma migrate dev`, `pnpm prisma db push`, `pnpm prisma:seed`, conexão com Supabase local vs Pro.
8. **Produzir documento** seguindo Output Format, salvando em `squads/crm-techmalhas/output/code/db-schema.md`.

## Output Format

```markdown
# Database Schema — CRM Techmalhas

> **TL;DR:** Schema Prisma 6.x com [N] models, [N] enums, [N] migrations + RLS.

## Estrutura de Arquivos
\`\`\`
prisma/
├── schema.prisma
├── seed.ts
├── migrations/
│   ├── 001_initial/
│   │   └── migration.sql
│   ├── 002_rls_policies.sql
│   └── 003_auth_user_trigger.sql
lib/
└── db.ts
\`\`\`

## Arquivos Gerados

### `prisma/schema.prisma`
\`\`\`prisma
[código completo]
\`\`\`

### `prisma/migrations/001_initial/migration.sql`
\`\`\`sql
[código completo]
\`\`\`

### `prisma/migrations/002_rls_policies.sql`
\`\`\`sql
[código completo]
\`\`\`

### `prisma/migrations/003_auth_user_trigger.sql`
\`\`\`sql
[código completo — trigger no auth.users]
\`\`\`

### `prisma/seed.ts`
\`\`\`typescript
[código completo]
\`\`\`

### `lib/db.ts`
\`\`\`typescript
[código completo]
\`\`\`

## Comandos de Setup
[Sequência exata para um dev iniciante rodar do zero]

## Notas Técnicas
[Decisões não óbvias, gotchas, etc.]
```

## Output Example

```markdown
# Database Schema — CRM Techmalhas

> **TL;DR:** Schema Prisma 6.x com 11 models, 4 enums, 3 migrations.
> RLS habilitado em todas as tabelas com PII.

## Estrutura de Arquivos

\`\`\`
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
    ├── 001_initial/migration.sql
    ├── 002_rls_policies.sql
    └── 003_auth_user_trigger.sql
lib/
└── db.ts
\`\`\`

## `prisma/schema.prisma`

\`\`\`prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum UserRole { admin gestor vendedor }
enum ContactType { lead customer lost }
enum PipelineType { atacado varejo }
enum InteractionChannel { whatsapp email call note }

model User {
  id              String   @id
  email           String   @unique
  name            String
  role            UserRole @default(vendedor)
  lastAssignedAt  DateTime? @map("last_assigned_at")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  ownedContacts   Contact[] @relation("ContactOwner")
  ownedDeals      Deal[]    @relation("DealOwner")
  assignedActivities Activity[] @relation("ActivityAssignee")
  auditLogs       AuditLog[]

  @@map("users")
}

model Contact {
  id            String      @id @default(uuid())
  name          String
  phone         String      @unique
  email         String?     @unique
  companyName   String?     @map("company_name")
  type          ContactType @default(lead)
  source        String?
  ownerId       String?     @map("owner_id")
  dapicId       String?     @unique @map("dapic_id")
  consentLgpd   Boolean     @default(false) @map("consent_lgpd")
  consentAt     DateTime?   @map("consent_at")
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")
  deletedAt     DateTime?   @map("deleted_at")

  owner         User?       @relation("ContactOwner", fields: [ownerId], references: [id])
  deals         Deal[]
  interactions  Interaction[]

  @@index([phone])
  @@index([ownerId])
  @@map("contacts")
}

model Pipeline {
  id        String       @id @default(uuid())
  name      String
  type      PipelineType
  createdAt DateTime     @default(now()) @map("created_at")

  stages    Stage[]
  deals     Deal[]

  @@map("pipelines")
}

model Stage {
  id              String   @id @default(uuid())
  pipelineId      String   @map("pipeline_id")
  name            String
  orderIndex      Int      @map("order_index")
  color           String?
  winProbability  Int      @default(0) @map("win_probability")
  isFinal         Boolean  @default(false) @map("is_final")
  createdAt       DateTime @default(now()) @map("created_at")

  pipeline        Pipeline @relation(fields: [pipelineId], references: [id])
  deals           Deal[]
  requiredTasks   StageRequiredTask[]

  @@unique([pipelineId, orderIndex])
  @@map("stages")
}

model Deal {
  id              String   @id @default(uuid())
  contactId       String   @map("contact_id")
  pipelineId      String   @map("pipeline_id")
  stageId         String   @map("stage_id")
  title           String
  value           Decimal  @db.Decimal(10, 2)
  status          String   @default("open")
  expectedCloseAt DateTime? @map("expected_close_at")
  ownerId         String   @map("owner_id")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  contact         Contact  @relation(fields: [contactId], references: [id])
  pipeline        Pipeline @relation(fields: [pipelineId], references: [id])
  stage           Stage    @relation(fields: [stageId], references: [id])
  owner           User     @relation("DealOwner", fields: [ownerId], references: [id])
  activities      Activity[]

  @@index([pipelineId, stageId])
  @@index([ownerId])
  @@map("deals")
}

model StageRequiredTask {
  id              String   @id @default(uuid())
  stageId         String   @map("stage_id")
  title           String
  type            String
  defaultDueHours Int      @default(24) @map("default_due_hours")
  createdAt       DateTime @default(now()) @map("created_at")

  stage           Stage    @relation(fields: [stageId], references: [id], onDelete: Cascade)

  @@map("stage_required_tasks")
}

model Activity {
  id           String    @id @default(uuid())
  dealId       String?   @map("deal_id")
  contactId    String?   @map("contact_id")
  type         String
  title        String
  description  String?
  dueAt        DateTime  @map("due_at")
  completedAt  DateTime? @map("completed_at")
  assigneeId   String    @map("assignee_id")
  mandatory    Boolean   @default(false)
  createdAt    DateTime  @default(now()) @map("created_at")

  deal         Deal?     @relation(fields: [dealId], references: [id])
  assignee     User      @relation("ActivityAssignee", fields: [assigneeId], references: [id])

  @@index([assigneeId, completedAt])
  @@index([dueAt])
  @@map("activities")
}

model Interaction {
  id           String   @id @default(uuid())
  contactId    String   @map("contact_id")
  channel      InteractionChannel
  direction    String
  body         String
  metadataJson Json?    @map("metadata_json")
  sentAt       DateTime @default(now()) @map("sent_at")

  contact      Contact  @relation(fields: [contactId], references: [id])

  whatsappMessage WhatsappMessage?

  @@index([contactId, sentAt])
  @@map("interactions")
}

model WhatsappMessage {
  id              String   @id @default(uuid())
  interactionId   String   @unique @map("interaction_id")
  metaMessageId   String   @unique @map("meta_message_id")
  status          String
  errorCode       String?  @map("error_code")
  createdAt       DateTime @default(now()) @map("created_at")

  interaction     Interaction @relation(fields: [interactionId], references: [id])

  @@map("whatsapp_messages")
}

model AuditLog {
  id           String   @id @default(uuid())
  userId       String?  @map("user_id")
  action       String
  resourceType String   @map("resource_type")
  resourceId   String   @map("resource_id")
  ip           String?
  userAgent    String?  @map("user_agent")
  metadata     Json?
  createdAt    DateTime @default(now()) @map("created_at")

  user         User?    @relation(fields: [userId], references: [id])

  @@index([resourceType, resourceId])
  @@index([userId, createdAt])
  @@map("audit_logs")
}

model Notification {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  title     String
  body      String
  link      String?
  readAt    DateTime? @map("read_at")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId, readAt])
  @@map("notifications")
}
\`\`\`

## `prisma/migrations/002_rls_policies.sql`

\`\`\`sql
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contacts_select ON contacts FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR (SELECT role FROM users WHERE id = auth.uid()) IN ('admin','gestor')
  );
CREATE POLICY contacts_insert ON contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY contacts_update ON contacts FOR UPDATE TO authenticated
  USING (
    owner_id = auth.uid()
    OR (SELECT role FROM users WHERE id = auth.uid()) IN ('admin','gestor')
  );

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY deals_select ON deals FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR (SELECT role FROM users WHERE id = auth.uid()) IN ('admin','gestor')
  );

-- [Repete para activities, interactions, audit_logs, notifications]
\`\`\`

## `prisma/migrations/003_auth_user_trigger.sql`

\`\`\`sql
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'vendedor'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
\`\`\`

## `prisma/seed.ts`

\`\`\`typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const pipelineAtacado = await prisma.pipeline.create({
    data: {
      name: 'Pipeline Atacado',
      type: 'atacado',
      stages: {
        create: [
          { name: 'Novo Lead', orderIndex: 0, color: 'new', winProbability: 5 },
          { name: 'Contato Inicial', orderIndex: 1, color: 'contact', winProbability: 15 },
          { name: 'Proposta Enviada', orderIndex: 2, color: 'proposal', winProbability: 40 },
          { name: 'Negociação', orderIndex: 3, color: 'negotiation', winProbability: 70 },
          { name: 'Ganho', orderIndex: 4, color: 'won', winProbability: 100, isFinal: true },
          { name: 'Perdido', orderIndex: 5, color: 'lost', winProbability: 0, isFinal: true },
        ],
      },
    },
  });

  console.log('✅ Seed completo:', { pipelineAtacado: pipelineAtacado.id });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
\`\`\`

## `lib/db.ts`

\`\`\`typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
\`\`\`

## Comandos de Setup

\`\`\`bash
# 1. Instalar deps
pnpm add @prisma/client
pnpm add -D prisma tsx

# 2. Configurar .env (DATABASE_URL e DIRECT_URL do Supabase)
cp .env.example .env

# 3. Aplicar schema
pnpm prisma migrate dev --name initial

# 4. Aplicar RLS (manual no Supabase SQL Editor, ou via psql)
psql $DIRECT_URL -f prisma/migrations/002_rls_policies.sql
psql $DIRECT_URL -f prisma/migrations/003_auth_user_trigger.sql

# 5. Seed
pnpm tsx prisma/seed.ts
\`\`\`

## Notas Técnicas

- **Users com id String** (não cuid/uuid) porque referencia `auth.users.id` do Supabase
- **`directUrl`** para migrations (bypass pooling), `url` para queries (com pooling)
- **RLS policies** aplicadas manualmente porque Prisma migrations não suportam policies do Supabase
- **`onDelete: Cascade`** apenas em StageRequiredTask (filhos de Stage); demais usam soft delete
```

## Veto Conditions

Reject and redo if ANY are true:
1. Schema sem todos os models do ERD (mínimo: users, contacts, pipelines, stages, deals, activities, interactions, whatsapp_messages, audit_logs, stage_required_tasks, notifications)
2. Faltam RLS policies em tabelas com PII (contacts, deals, activities, interactions)
3. Sem trigger de sincronização auth.users → users
4. Sem comando de setup documentado
5. `lib/db.ts` sem singleton (cria novo PrismaClient em cada hot reload)

## Quality Criteria

- [ ] Schema Prisma com 11+ models, 4+ enums
- [ ] Migration inicial em SQL
- [ ] RLS policies em SQL separado
- [ ] Trigger Supabase Auth → users
- [ ] Seed com pipelines, stages, usuários de teste
- [ ] `lib/db.ts` singleton
- [ ] Comandos de setup executáveis do zero
