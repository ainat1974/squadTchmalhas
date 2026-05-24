---
execution: subagent
agent: qa-documentation
inputFile: squads/crm-techmalhas/output/code/frontend.md
outputFile: squads/crm-techmalhas/output/test-report.md
model_tier: powerful
---

# Step 11: Testes End-to-End e Suite de Qualidade

## Context Loading

Load these files before executing:
- `squads/crm-techmalhas/output/code/db-schema.md` — schema
- `squads/crm-techmalhas/output/code/backend.md` — endpoints
- `squads/crm-techmalhas/output/code/frontend.md` — páginas e fluxos
- `squads/crm-techmalhas/output/requirements.md` — fluxos críticos
- `squads/crm-techmalhas/pipeline/data/quality-criteria.md` — critérios

## Instructions

### Process

1. **Setup de testes:**
   - `vitest.config.ts` para unit + integration
   - `playwright.config.ts` para E2E
   - `tests/setup.ts` com cleanup de DB entre testes
   - `tests/helpers/` com utilities (loginAs, seedFixtures, mockMetaAPI)
2. **Unit tests (Vitest):**
   - `tests/unit/validators/contact.test.ts`
   - `tests/unit/validators/deal.test.ts`
   - `tests/unit/permissions.test.ts`
   - `tests/unit/whatsapp.test.ts` (verifySignature, parseWebhook)
3. **Integration tests:**
   - `tests/integration/api/contacts.test.ts`
   - `tests/integration/api/deals-move.test.ts`
   - `tests/integration/api/whatsapp-webhook.test.ts`
   - `tests/integration/api/activities-mandatory.test.ts`
4. **E2E tests (Playwright) — 5 fluxos obrigatórios:**
   - `tests/e2e/01-login.spec.ts`
   - `tests/e2e/02-create-lead.spec.ts`
   - `tests/e2e/03-move-deal.spec.ts`
   - `tests/e2e/04-whatsapp-webhook.spec.ts`
   - `tests/e2e/05-mandatory-task-blocks.spec.ts`
5. **CI/CD workflow:**
   - `.github/workflows/ci.yml` — lint, typecheck, unit, integration em cada PR
   - `.github/workflows/e2e.yml` — Playwright em preview deploy
6. **Executar suite (mentalmente / em planejamento)** — projetar resultados esperados.
7. **Produzir Test Report** seguindo Output Format, salvar em `squads/crm-techmalhas/output/test-report.md`.

## Output Format

```markdown
# Test Report — CRM Techmalhas MVP

**Data:** [YYYY-MM-DD]
**Build:** v0.1.0
**Ambiente:** Preview Vercel

## Resumo Executivo
| Categoria | Total | Pass | Fail | Skip |
|---|---|---|---|---|
| Unit | N | N | 0 | 0 |
| Integration | N | N | 0 | 0 |
| E2E | 5 | 5 | 0 | 0 |
| **Total** | **N** | **N** | **0** | **0** |

Coverage: [%]

## Setup
[Resumo do setup, ferramentas, fixtures]

## Suite de Testes

### Unit (Vitest)
[Lista de testes com descrição BDD]

### Integration
[Lista]

### E2E (Playwright) — 5 fluxos críticos
[Cada um com descrição completa]

## CI/CD
[Workflows GitHub Actions]

## Issues Encontrados
[Bugs com severidade]

## Recomendações
[O que está pronto para deploy, o que precisa atenção]

## Próximos Passos
[Quésia transfere para Step 12 — Deploy]
```

## Output Example

```markdown
# Test Report — CRM Techmalhas MVP

**Data:** 2026-05-24
**Build:** v0.1.0
**Ambiente:** Preview Vercel (PR #1)

## Resumo Executivo

| Categoria | Total | Pass | Fail | Skip |
|---|---|---|---|---|
| Unit (Vitest) | 47 | 47 | 0 | 0 |
| Integration | 18 | 18 | 0 | 0 |
| E2E (Playwright) | 5 | 5 | 0 | 0 |
| **Total** | **70** | **70** | **0** | **0** |

**Coverage:** 76% (lib/), 68% (app/api/v1/), 42% (app/(dashboard)/)
**Build time:** 1m 24s | **CI time:** 3m 12s

## Setup

- **Vitest 1.6** para unit + integration (jsdom para component, node para api)
- **Playwright 1.45** para E2E (Chromium headless)
- **MSW 2.0** para mock da Meta Cloud API
- **Test DB:** schema `test` no mesmo Supabase, limpo via `truncate` antes de cada suite
- **Fixtures:** seed minimal (1 admin, 2 vendedores, 2 pipelines com stages, 5 contatos, 3 deals)

## E2E — 5 Fluxos Críticos

### ✅ E2E-01: Login + Listagem de Leads (`tests/e2e/01-login.spec.ts`)

\`\`\`
TEST: 'usuário vendedor consegue logar e ver seus leads'

PASSOS:
1. goto /login
2. fill email vendedor@techmalhas.com
3. fill password ********
4. click "Entrar"
5. expect URL === /pipeline
6. expect header text === "Pipeline atacado"
7. click sidebar "Leads"
8. expect 10 itens na lista
9. expect cada item ter owner_id === userId atual

RESULTADO: ✅ Pass | 1.2s
\`\`\`

### ✅ E2E-02: Criar Lead Manualmente
[descrição completa]

### ✅ E2E-03: Mover Deal entre Stages com Optimistic Update
[descrição completa]

### ✅ E2E-04: Receber Mensagem WhatsApp (webhook simulado)

\`\`\`
TEST: 'webhook do Meta cria contact + interaction + whatsapp_message idempotentemente'

PASSOS:
1. POST /api/v1/webhooks/whatsapp (payload Meta com mensagem nova)
   - assinatura HMAC válida
   - body: { entry: [{ changes: [{ value: { messages: [{ from: '+5511988887777', text: { body: 'Oi' }, id: 'wamid.123' }] } }] }] }
2. expect 200
3. SELECT * FROM contacts WHERE phone = '+5511988887777' → 1 row
4. SELECT * FROM interactions WHERE contact_id = X → 1 row, channel=whatsapp, direction=in, body='Oi'
5. SELECT * FROM whatsapp_messages WHERE meta_message_id = 'wamid.123' → 1 row
6. POST mesma mensagem novamente (retransmissão Meta)
7. expect 200
8. SELECT COUNT(*) FROM whatsapp_messages WHERE meta_message_id = 'wamid.123' → 1 (não duplicou)

RESULTADO: ✅ Pass | 0.8s
\`\`\`

### ✅ E2E-05: Tarefa Obrigatória Bloqueia Movimentação

\`\`\`
TEST: 'vendedor não consegue mover deal com tarefa mandatória pendente'

PASSOS:
1. seedDealWithMandatoryTask({ stageFrom: 'Negociação', taskTitle: 'Enviar contrato' })
2. loginAs vendedor
3. goto /pipeline
4. drag card-{dealId} to column-fechado
5. expect alert "1 tarefa obrigatória pendente"
6. expect text "Enviar contrato" visible
7. expect card AINDA na coluna Negociação
8. open drawer do deal
9. click "Concluir tarefa Enviar contrato"
10. expect toast "Tarefa concluída"
11. drag novamente card to column-fechado
12. expect card AGORA em Ganho/Perdido

RESULTADO: ✅ Pass | 4.7s
\`\`\`

## Integration

### `tests/integration/api/contacts.test.ts` (12 testes)
- ✅ POST /contacts cria com Zod validando todos campos
- ✅ POST /contacts retorna 422 se phone fora do formato E.164
- ✅ POST /contacts retorna 409 se phone duplicado
- ✅ GET /contacts retorna paginado com meta correto
- ✅ GET /contacts filtra por type=lead
- ✅ GET /contacts respeita RBAC (vendedor só vê seus, gestor vê todos)
- ✅ PATCH /contacts/:id sem owner → 403
- ✅ DELETE /contacts/:id é soft delete (deleted_at setado, registro permanece)
- ✅ Audit_log criado em cada CRUD
[...]

### `tests/integration/api/deals-move.test.ts` (6 testes)
- ✅ POST /deals/:id/move move entre stages do mesmo pipeline
- ✅ Move bloqueado se stage destino é de outro pipeline → 422
- ✅ Move bloqueado se há mandatory activity pendente → 409 com lista
- ✅ Move cria activities mandatórias da nova stage automaticamente
- ✅ Move cria interaction tipo "note" registrando a mudança
- ✅ Audit_log criado

## Unit (resumo)
- Validators: 12 testes (Zod schemas para contact, deal, activity)
- Permissions: 8 testes (admin pode tudo, gestor vê equipe, vendedor só seus)
- WhatsApp lib: 6 testes (verifySignature válida/inválida, parseWebhook, retry)
- Audit lib: 4 testes (logAudit com/sem user)
- Utils: 17 testes (formatters, date helpers, etc.)

## CI/CD

### `.github/workflows/ci.yml`
\`\`\`yaml
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
        env:
          DATABASE_URL: \${{ secrets.TEST_DATABASE_URL }}
\`\`\`

### `.github/workflows/e2e.yml`
Roda Playwright contra URL de preview gerada pelo Vercel.

## Issues Encontrados

| # | Severidade | Descrição | Status |
|---|---|---|---|
| 1 | 🟡 Médio | LCP em /pipeline é 2.8s (target <2.5s) | Otimizar com Suspense |
| 2 | 🟢 Baixo | Toast de sucesso some rápido demais em mobile | UX polish |

## Recomendações

✅ **Pronto para Deploy:**
- Todos os 5 fluxos críticos passam
- Coverage suficiente em lib/ e api/
- Sem bugs bloqueantes

⚠️ **Atenção pós-deploy:**
- Monitorar LCP em produção
- Considerar adicionar testes para cron de overdue

## Próximos Passos

Quésia segue para Step 12 — Deploy no Vercel + Documentação Completa.
```

## Veto Conditions

Reject and redo if ANY are true:
1. Algum dos 5 fluxos E2E obrigatórios falta ou falha
2. Coverage de `lib/` < 60%
3. Sem workflow CI configurado
4. Webhook WhatsApp sem teste de idempotência
5. Mandatory tasks sem teste de bloqueio

## Quality Criteria

- [ ] 5 E2E críticos passando
- [ ] Coverage >60% em `lib/`
- [ ] CI workflow para lint + typecheck + test
- [ ] Mock da Meta API com MSW
- [ ] Cleanup de DB entre testes
- [ ] Relatório com bugs e severidade
- [ ] Recomendação clara (Pronto / Atenção / Bloqueado)
