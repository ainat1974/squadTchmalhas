# Output Examples — CRM Techmalhas

> Exemplos completos do que cada tipo de entregável deve produzir.
> Use como referência de qualidade, NÃO como template rígido.

---

## Exemplo 1 — User Story (do Step 02 Requirements)

```markdown
### US-007 — Vendedor recebe lead novo do WhatsApp

**Como** vendedor de atacado (Vitor),
**quero** que leads que entram no WhatsApp sejam criados automaticamente no CRM e atribuídos a mim,
**para** que eu não perca a oportunidade por demora na resposta.

**Prioridade:** 🔴 Essencial
**Esforço:** M
**Depende de:** US-001 (cadastro de contatos), US-005 (integração WhatsApp Cloud API)

**Critérios de Aceitação:**

GIVEN que um número de telefone NÃO existe ainda em `contacts`
WHEN uma mensagem chega no webhook `/api/v1/webhooks/whatsapp`
THEN o sistema cria um novo `contact` com `name = "Lead WhatsApp"`, `phone = <numero>`, `source = "whatsapp"`
AND cria uma `interaction` (channel=whatsapp, direction=in) com o conteúdo da mensagem
AND cria um `deal` no pipeline "Atacado", stage "Novo Lead", atribuído ao vendedor de plantão (round-robin)
AND cria uma `activity` obrigatória "Responder primeira mensagem" com due_at = +30min
AND notifica o vendedor por e-mail e in-app

GIVEN que o telefone JÁ existe em `contacts`
WHEN uma mensagem chega no webhook
THEN o sistema apenas adiciona a `interaction` ao contato existente
AND notifica o `owner` do contato
AND NÃO cria novo deal/activity (a menos que não exista deal aberto no contato)

**Observações técnicas:**
- Round-robin: campo `users.last_assigned_at` é atualizado a cada atribuição
- Mensagens fora do horário comercial (18h-08h) ainda são processadas; notificação fica para abrir do dia seguinte
- Política LGPD: telefone capturado por WhatsApp tem consentimento implícito (Meta exige opt-in)
```

---

## Exemplo 2 — Wireframe Textual (do Step 04 Wireframes)

```
═══════════════════════════════════════════════════════════════════════
TELA: Pipeline Kanban (Desktop 1280px)
ID: screen-pipeline-kanban
URL: /pipeline?type=atacado
═══════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────┐
│ [Techmalhas Logo]   Pipeline ▼   Leads   Chat   Tasks   Reports   👤│
├─────────────────────────────────────────────────────────────────────┤
│ [Atacado ▼]  [Filtro: Meus 🔻]  [+ Novo Deal]      🔍 Buscar...     │
├─────────┬─────────┬─────────┬─────────┬─────────┬───────────────────┤
│ NOVO    │ CONTATO │ PROPOSTA│ NEGOC.  │ FECHADO │ GANHO/PERDIDO     │
│ LEAD    │ INICIAL │ ENVIADA │         │         │                   │
│  (12)   │  (8)    │  (5)    │  (3)    │  (2)    │  (15/4)           │
├─────────┼─────────┼─────────┼─────────┼─────────┼───────────────────┤
│ ┌─────┐ │ ┌─────┐ │ ┌─────┐ │ ┌─────┐ │ ┌─────┐ │                   │
│ │Loja │ │ │Mod. │ │ │Maga.│ │ │Boutq│ │ │SP M.│ │                   │
│ │Sul  │ │ │Mile │ │ │Anjo │ │ │Glow │ │ │Atac │ │                   │
│ │R$2k │ │ │R$5k │ │ │R$12k│ │ │R$8k │ │ │R$45k│ │                   │
│ │🕐 2d│ │ │📞hj │ │ │⚠️ot │ │ │✅ok │ │ │💰   │ │                   │
│ └─────┘ │ └─────┘ │ └─────┘ │ └─────┘ │ └─────┘ │                   │
│         │         │         │         │         │                   │
│ [+ 11]  │ [+ 7]   │ [+ 4]   │ [+ 2]   │ [+ 1]   │                   │
└─────────┴─────────┴─────────┴─────────┴─────────┴───────────────────┘

ESTADOS:
- Loading: skeleton cards (3 por coluna)
- Vazio: ilustração + "Nenhum deal nesta etapa" + botão "Criar primeiro"
- Erro: toast vermelho + retry

INTERAÇÕES:
- Drag & drop entre colunas → PATCH /api/v1/deals/:id { stage_id }
- Click no card → abre drawer lateral com detalhes
- Click em "[+ Novo Deal]" → modal de criação
- ⚠️ ícone = atividade vencida (mandatory=true, due_at < now)

ACESSIBILIDADE:
- Keyboard: Tab navega entre cards, Enter abre detalhe, Espaço pega o card
- ARIA: role="list" nas colunas, role="listitem" nos cards
- Contraste: cores das colunas com texto branco/preto conforme luminosidade
```

---

## Exemplo 3 — Diagrama ERD (do Step 06 Architecture)

```sql
-- ============================================================
-- TABELA: contacts
-- Descrição: Pessoas (leads, clientes lojistas e finais)
-- ============================================================
CREATE TABLE contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  phone           TEXT UNIQUE NOT NULL,
  email           TEXT UNIQUE,
  company_name    TEXT,
  type            TEXT NOT NULL CHECK (type IN ('lead', 'customer', 'lost')),
  source          TEXT,  -- whatsapp, instagram, site, indicacao, manual
  owner_id        UUID REFERENCES users(id),
  consent_lgpd    BOOLEAN DEFAULT FALSE,
  consent_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_contacts_phone ON contacts(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_owner ON contacts(owner_id) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contacts_select ON contacts FOR SELECT
  USING (auth.uid() = owner_id OR auth.jwt()->>'role' IN ('admin', 'gestor'));
```

---

## Exemplo 4 — Endpoint API (do Step 09 Backend)

```typescript
// app/api/v1/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createLead, listLeads } from '@/lib/leads';
import { requireAuth } from '@/lib/auth';
import { ApiError, handleApiError } from '@/lib/errors';

const ListLeadsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  source: z.enum(['whatsapp', 'instagram', 'site', 'indicacao', 'manual']).optional(),
});

const CreateLeadBody = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().regex(/^\+?[1-9]\d{10,14}$/, 'Telefone inválido (formato E.164)'),
  email: z.string().email().optional(),
  company_name: z.string().max(200).optional(),
  source: z.enum(['whatsapp', 'instagram', 'site', 'indicacao', 'manual']),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const params = ListLeadsQuery.parse(Object.fromEntries(req.nextUrl.searchParams));
    const { items, total } = await listLeads({ ...params, requesterId: user.id });

    return NextResponse.json({
      data: items,
      meta: { page: params.page, limit: params.limit, total },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = CreateLeadBody.parse(await req.json());
    const lead = await createLead({ ...body, owner_id: user.id });

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
```

---

## Exemplo 5 — Relatório de Teste E2E (do Step 11)

```markdown
# Test Report — CRM Techmalhas MVP

**Data:** 2026-05-24
**Build:** v0.1.0
**Ambiente:** Preview Vercel (PR #42)

## Resumo Executivo

| Categoria | Total | Pass | Fail | Skip |
|---|---|---|---|---|
| Unit (Vitest) | 84 | 82 | 0 | 2 |
| Integration | 23 | 23 | 0 | 0 |
| E2E (Playwright) | 5 | 5 | 0 | 0 |
| **Total** | **112** | **110** | **0** | **2** |

Coverage: 78% (lib/), 65% (app/api/), 41% (app/(dashboard)/)

## Fluxos E2E Validados

### ✅ E2E-01: Login + Listagem de Leads
- Login com `vendedor@techmalhas.com` / senha
- Redirect para `/pipeline`
- Switch para `/leads` mostra 10 leads paginados
- Tempo total: 1.2s

### ✅ E2E-02: Criar Lead Manualmente
- Click em "+ Novo Lead"
- Preenche nome, telefone, fonte
- Submete → redirect para `/leads/<novo-id>`
- Card aparece no Kanban em "Novo Lead"

### ✅ E2E-03: Mover Deal entre Stages
- Drag de deal "Loja Sul" de "Novo Lead" para "Contato Inicial"
- Toast de sucesso aparece
- Refresh → deal permanece em "Contato Inicial"
- Activity "Primeiro Contato" é criada automaticamente

### ✅ E2E-04: Receber Mensagem WhatsApp (simulada)
- POST mock no webhook `/api/v1/webhooks/whatsapp`
- Sistema cria contact + interaction + deal + activity
- Vendedor de plantão (round-robin) recebe notificação
- Mensagem aparece em `/chat` em tempo real

### ✅ E2E-05: Tarefa Obrigatória Bloqueia Movimentação
- Deal com activity mandatory pendente em "Negociação"
- Tentativa de mover para "Fechado" → bloqueado com mensagem
- Após completar a activity → movimentação permitida

## Issues Encontrados (não-bloqueantes)

1. **Skip Unit 1** — teste de Drizzle migration: ambiente CI sem PG; rodar local
2. **Skip Unit 2** — flaky test de timezone na conversão de `due_at`
3. **Warning Lighthouse:** LCP em `/pipeline` é 3.1s (target <2.5s) — otimizar fetch inicial
```
