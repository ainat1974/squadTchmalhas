# Auditoria de Produto — CRM Techmalhas
**Por:** Patrícia Produto · 2026-05-25 · v1.0
**Escopo auditado:** requirements v1 (2026-05-24) + entregas até 2026-05-25 23:30 (rotas, schema, mocks, ADRs 007–010, integração Irroba)
**Postura:** adversarial — protejo o backlog, não vendo o produto.

---

## TL;DR

- **O esqueleto está sólido, a casa está pela metade.** Pipeline Kanban, leads B2B/B2C, dashboard básico, autenticação, RBAC, schema completo (incluindo `dapic_id` reservado, LGPD, audit) e webchat embed estão **em produção**. Mas a feature **mais crítica do MVP — WhatsApp como canal vivo de atendimento — não tem UI utilizável**: o webhook recebe, o endpoint de envio existe, mas a **Amanda não tem inbox WhatsApp**. Sem isso, o CRM não é o CRM que a Tania pediu.
- **Houve scope pivot durante a obra (webchat do site Irroba) que canibalizou capacidade de fechar o MVP original.** O Webchat virou prioridade nas últimas 48h (ADR-008 + integração técnica de 32h) com Turnstile, Upstash, CORS, CSP — enquanto stories 🔴 essenciais do MVP v1 (US-010 detalhe de deal, US-011 fechar deal, US-033/034 inbox WhatsApp, US-048 config tarefas obrigatórias) **não foram entregues**.
- **A obrigatoriedade de tarefas — pedido explícito da Tania — está half-built.** O modelo `Activity.isMandatory` existe, o badge aparece no card do Kanban, mas o **hard block no backend não está implementado** (`/api/v1/deals/[id]/stage/route.ts` não valida tarefas pendentes antes de mover; nem cria automaticamente as `StageRequiredTask` ao entrar no stage). Renato vai descobrir isso no primeiro 1:1 com Vitor.
- **17 gaps P0/P1 mapeados.** Detalhe na §6. Resumo: **inbox WhatsApp (P0), detalhe+fechamento de deal (P0), hard block real (P0), config UI de tarefas obrigatórias (P0), notification center (P1), profile/troca de senha (P1), relatórios de performance/perdas (P1)**.
- **Veredicto:** **NÃO está pronto para produção real com a equipe Techmalhas** (Vitor, Amanda, Renato). Está pronto para **uso interno em demo/treinamento**. Falta 2 sprints (~2–3 semanas com 1 dev focado) para fechar o MVP que foi prometido em 24/05.

---

## 1. Escopo Entregue vs Planejado

Comparativo direto: 50 stories do `requirements.md` v1 (38 🔴 + 11 🟡 + 5 🟢) vs estado em 2026-05-25 23:30.

### 1.1 Épico A — Autenticação & Usuários

| US | Feature | Prio | Status | Evidência | Nota Patrícia |
|---|---|---|---|---|---|
| US-001 | Login e-mail/senha | 🔴 | ✅ Entregue | `app/(auth)/login/page.tsx` + Supabase Auth | OK, mas falta política de bloqueio após 3 tentativas (CA do AC) |
| US-002 | Login Google OAuth | 🔴 | ✅ Entregue | botão Google + `app/auth/callback/route.ts` | OK |
| US-003 | RBAC (admin/gestor/vendedor) | 🔴 | ⚠️ Parcial | `lib/permissions.ts` + RLS em 002_rls_policies.sql; **divergência:** schema tem 4 roles (`vendedor_atacado`, `atendente_varejo`) não 3 — mudança não-documentada nos requisitos | Decisão acertada para domínio Techmalhas, mas precisa ADR |
| US-004 | Gerenciar usuários (admin) | 🔴 | ⚠️ Parcial | `app/(dashboard)/settings/users/page.tsx` existe | Validar: cria? desativa? envia convite? |
| US-005 | Perfil e troca de senha | 🟡 | ❌ Não entregue | sem rota `/perfil` ou `/profile` | Vitor não consegue trocar senha sem admin |

### 1.2 Épico B — Pipeline & Deals

| US | Feature | Prio | Status | Evidência | Nota Patrícia |
|---|---|---|---|---|---|
| US-006 | Kanban Atacado | 🔴 | ✅ Entregue | `/pipeline?type=atacado` + `KanbanBoard.tsx` | OK |
| US-007 | Kanban Varejo | 🔴 | ✅ Entregue | `/pipeline?type=varejo` (tabs) | OK |
| US-008 | Criar novo deal | 🔴 | ⚠️ API existe, **UI não confirmada** | `POST /api/v1/deals/route.ts` existe; sem botão "+ Novo Deal" no Kanban auditado | Vitor cria como? Via SQL? |
| US-009 | Drag-and-drop entre stages | 🔴 | ⚠️ Parcial | `KanbanBoard.tsx:63-84` usa `@dnd-kit` + `PATCH /api/v1/deals/[id]/stage` | **Falta hard block real** (ver §2.3) |
| US-010 | Detalhe de deal | 🔴 | ❌ **NÃO ENTREGUE** | Glob não encontra `/deals/[id]/page.tsx` | **Crítico.** Sem detalhe de deal, Vitor não vê histórico, notas, valor editável |
| US-011 | Fechar como Ganho/Perdido | 🔴 | ❌ **NÃO ENTREGUE** | sem rota nem botão; `lostReason` no schema, sem UI | **Crítico.** Como Vitor fecha venda? Como Renato mede conversão? |
| US-012 | Filtros de pipeline | 🔴 | ❌ Não entregue | só filtro de `type` (atacado/varejo) | Renato não consegue filtrar por owner/valor/período |
| US-013 | Histórico de movimentação | 🟡 | ❌ Não entregue | sem timeline no detalhe | Inviável sem US-010 |
| US-014 | Deals fechados (histórico) | 🟡 | ❌ Não entregue | sem `/deals/fechados` | Renato cego para conversão histórica |
| US-015 | Vista de lista | 🟢 | ❌ Não entregue | só Kanban | OK adiar |

### 1.3 Épico C — Contatos & Leads

| US | Feature | Prio | Status | Evidência | Nota Patrícia |
|---|---|---|---|---|---|
| US-016 | Listar/buscar contatos | 🔴 | ✅ Entregue | `/leads/page.tsx` com search + paginação | OK |
| US-017 | Criar contato/lead | 🔴 | ❌ **NÃO ENTREGUE** | link `/leads/new` no botão, mas **rota não existe** (`glob crm-app/app/(dashboard)/leads/new/**` = 0 arquivos) | **Crítico.** Botão "Novo Contato" leva para 404 |
| US-018 | Detalhe de contato | 🔴 | ✅ Entregue | `/leads/[id]/page.tsx` | Funciona, mas usa paleta v3 ainda (audit Davi §0) |
| US-019 | Editar dados do contato | 🔴 | ⚠️ API existe | `PATCH /api/v1/contacts/[id]/route.ts` | UI de edição inline confirmada? |
| US-020 | Direito ao esquecimento (LGPD) | 🔴 | ⚠️ Parcial | cron `/api/cron/lgpd-purge` anonimiza soft-deleted >90d; **falta endpoint sob demanda** | José pede exclusão amanhã → admin precisa SQL direto |
| US-021 | Importar CSV | 🟡 | ❌ Não entregue | — | Renato migra base como? |
| US-022 | Transferir contato/deal | 🟡 | ❌ Não entregue | — | Vitor de férias → Renato faz como? |
| US-023 | Segmentar por canal | 🟢 | ⚠️ Parcial | filtro `?pipeline=` existe na rota `/leads` | OK |

### 1.4 Épico D — Atividades & Tarefas Obrigatórias

| US | Feature | Prio | Status | Evidência | Nota Patrícia |
|---|---|---|---|---|---|
| US-024 | Criar tarefa em deal/contato | 🔴 | ⚠️ Modelo OK, UI não confirmada | `Activity` no schema, `/tasks/page.tsx` lista | Vitor cria tarefa nova como? |
| US-025 | Concluir tarefa | 🔴 | ✅ Entregue | `POST /api/v1/activities/[id]/complete` | OK |
| US-026 | **Tarefas obrigatórias com hard block** | 🔴 | ❌ **CRÍTICO — half-built** | `isMandatory` no schema; `OverduePanel` lista; **mas `PATCH /api/v1/deals/[id]/stage/route.ts` NÃO valida**; auto-criação via `StageRequiredTask` também não implementada (audit Fábio §6.4) | **Quebra promessa explícita da Tania.** Vitor move card e nada bloqueia |
| US-027 | Alertas de tarefas vencidas | 🔴 | ⚠️ Parcial | `OverduePanel` no dashboard mostra | Sem `notifications` real-time; sem badge na navbar |
| US-028 | Agenda do dia (visão pessoal) | 🔴 | ⚠️ Parcial | `/tasks` lista pendentes/concluídas | Falta agrupamento Atrasadas/Hoje/Amanhã |
| US-029 | Visão de tarefas da equipe (gestor) | 🟡 | ⚠️ Parcial | `/tasks` filtra por role gestor | OK |
| US-030 | Notas em atividades | 🟡 | ❌ Não entregue | — | Amanda registra contexto em onde? |
| US-031 | Templates por deal | 🟢 | ❌ Não entregue | — | OK adiar |

### 1.5 Épico E — WhatsApp Cloud API

| US | Feature | Prio | Status | Evidência | Nota Patrícia |
|---|---|---|---|---|---|
| US-032 | Webhook WhatsApp | 🔴 | ⚠️ Existe + bug runtime | `app/api/v1/webhooks/whatsapp/route.ts` com HMAC; **bug:** `upsert` em `phone` sem `@unique` quebra em runtime (audit Fábio §6.1, §7.2) | Mensagem entra, mas falha intermitente |
| US-033 | **Inbox WhatsApp** | 🔴 | ❌ **NÃO ENTREGUE** | Não existe `/inbox`; `/chat` é só webchat | **Bloqueador absoluto do MVP** |
| US-034 | Enviar WhatsApp pelo CRM | 🔴 | ⚠️ API existe, **sem UI** | `POST /api/v1/whatsapp/send/route.ts` | Amanda não responde de lugar nenhum |
| US-035 | Vincular conversa a deal | 🔴 | ❌ Não entregue | dependente de US-033 | — |
| US-036 | Status entrega (sent/delivered/read) | 🔴 | ⚠️ Webhook trata `statuses`, sem UI | — | Sem inbox, sem o que mostrar |
| US-037 | Notificação de nova mensagem | 🔴 | ❌ Não entregue | `Notification` no schema, sem UI | — |
| US-038 | Histórico WhatsApp no deal/contato | 🟡 | ⚠️ Parcial | `LeadTimeline` no detalhe do contato | Precisa US-033 para fechar |
| US-039 | Identificar contato por telefone | 🟡 | ⚠️ Bug | webhook tenta vincular mas falha (P0 7.2) | — |

### 1.6 Épico F — Dashboard & Relatórios

| US | Feature | Prio | Status | Evidência | Nota Patrícia |
|---|---|---|---|---|---|
| US-040 | Dashboard KPIs | 🔴 | ✅ Entregue | `/dashboard` 4 KPIs + Funil + Overdue | Falta delta numérico, sparkline, filtro de período (audit Davi §2.2) |
| US-041 | Performance por vendedor | 🔴 | ❌ Não entregue | sem `/relatorios/performance` | Renato cego para individual |
| US-042 | Funil de conversão por stage | 🔴 | ⚠️ Parcial | `FunnelChart` no dashboard mostra contagem; **falta tempo médio no stage** | Renato vê "onde tem deal", não "onde empaca" |
| US-043 | Central de notificações | 🔴 | ❌ Não entregue | sem `/notificacoes`, sem badge | — |
| US-044 | Relatório motivos de perda | 🟡 | ❌ Não entregue | depende de US-011 | — |
| US-045 | Exportar CSV | 🟢 | ❌ Não entregue | — | OK adiar |

### 1.7 Épico G — Configurações

| US | Feature | Prio | Status | Evidência | Nota Patrícia |
|---|---|---|---|---|---|
| US-046 | Gerenciar pipelines | 🔴 | ⚠️ Parcial | `/settings/pipelines/page.tsx` existe | Cria/edita/arquiva? |
| US-047 | Gerenciar stages | 🔴 | ⚠️ Não confirmado | sem `/settings/pipelines/[id]/stages` | Renato configura funil como? |
| US-048 | **Config de tarefas obrigatórias por stage** | 🔴 | ❌ **NÃO ENTREGUE** | sem UI; `StageRequiredTask` no schema sem CRUD | Sem isso, US-026 nunca tem o que disparar |
| US-049 | Config integração WhatsApp | 🔴 | ❌ Não entregue | tokens só via env vars Vercel | Admin não troca número sem dev |
| US-050 | Log de auditoria (UI) | 🟡 | ❌ Não entregue | tabela `audit_logs` existe; sem `/configuracoes/auditoria` | Admin lê via Supabase Studio |

### 1.8 Resumo numérico

| Prioridade | Planejado | Entregue ✅ | Parcial ⚠️ | Não entregue ❌ | % entregue completo |
|---|---:|---:|---:|---:|---:|
| 🔴 Essencial (MVP) | **38** | 8 | 13 | 17 | **21%** |
| 🟡 Importante | 11 | 0 | 4 | 7 | 0% |
| 🟢 Nice-to-have | 5 | 0 | 1 | 4 | 0% |
| **TOTAL** | **54¹** | **8** | **18** | **28** | **15%** |

¹ Requisito original lista 50, mas o backlog detalhado vai até US-050; recontagem por épico = 54 entradas.

### 1.9 Scope creep — features adicionadas FORA do MVP original

| Feature | Origem | Status | Custo provável |
|---|---|---|---|
| **Webchat do site Irroba** (widget + embed + sessions + messages + Turnstile + CORS + Upstash) | Pedido Tania pós-deploy | Em construção (Sprint 1 segurança a fazer) | **~32h** (Arnaldo §6.1) |
| **Instagram webhook + InstagramMessage** | Schema + rota existem | Half-built, flag `INSTAGRAM_ENABLED=false` | ~10h afundadas |
| **Design System v5 (pivot dark-first)** | Ref Tania 2026-05-25 | T1–T17 do migration plan | 20h target |
| **ADR-007 modelo PM-Tutora-Squad** | Reorganização operacional | Aceito | overhead conceitual |

> **Patrícia chama atenção:** Cada item acima foi decidido **depois** do `requirements.md` v1. Sem reordenar o backlog, três features 🔴 originais (US-010, US-011, US-033) ficaram para trás. Não é "ruim por si só" — é **dívida de produto** que precisa ser visível.

---

## 2. Gaps de Produto Críticos

Lista numerada, ordenada por **dano em uso real**.

### 2.1 GAP-1 — Amanda não tem inbox WhatsApp (P0)

**Personas atingidas:** Amanda (atende varejo no WA), Vitor (atende lojistas no WA), Renato (não vê histórico).

**Evidência:** sem rota `/inbox`; `/chat` lista apenas `webchatSession`, não `WhatsappMessage`. API `POST /api/v1/whatsapp/send/route.ts` existe isolada, sem nenhuma tela que a chame.

**Dor concreta:** Amanda recebe mensagem do José no WhatsApp Business do celular. Quer responder pelo CRM para manter histórico? **Não tem onde.** Continua no WhatsApp Business, e o CRM fica vazio de interações reais. Em 2 semanas, Renato olha o dashboard e vê 0 atividade real — não porque o time não trabalha, porque o sistema não captura.

**Promessa quebrada:** o `audit-report.md` v1 disse que o **canal principal de Vitor e Amanda é WhatsApp** e classificou US-032 a US-038 como 🔴. Entregamos backend (webhook + send) sem frontend. É como ter motor sem volante.

**Solução:** US-033 (inbox) + US-034 (compose) + US-036 (status) + US-039 (identificação) — estimativa original GG+G+M+M ≈ **2 semanas de dev**.

---

### 2.2 GAP-2 — Vitor não consegue fechar venda (P0)

**Personas atingidas:** Vitor (não fecha deal), Renato (não vê conversão real).

**Evidência:** sem `/deals/[id]/page.tsx`. Sem botão "Marcar como Ganho/Perdido". `Deal.status` é `open|won|lost|archived`, mas a UI só conhece `open`. `Deal.lostReason` no schema, sem formulário.

**Dor concreta:** Vitor fechou venda com José esta manhã. Volta ao CRM, abre o card no Kanban, e não acha **botão de fechar**. O Kanban atual mostra apenas drag-and-drop entre stages — não tem stage "Ganho/Perdido" que persista o `status`. A única ação possível é arrastar para um stage genérico. Resultado: **o `dashboard.conversionRate` calcula sobre `status='won'` que nunca é setado**, sempre mostra 0% ou número artificial.

**Verificação no código (`dashboard/page.tsx:21-24`):**

```21:24:crm-app/app/(dashboard)/dashboard/page.tsx
    prisma.deal.findMany({
      where:  { ...targetFilter, status: 'won', closedAt: { gte: start30d } },
      select: { value: true },
    }),
```

Filtra por `status='won'` que **nunca é setado em produção** (sem rota para fechar). Receita 30d sempre será R$ 0.

**Solução:** US-010 (detalhe) + US-011 (fechar) — estimativa M+P ≈ **3 dias de dev**.

---

### 2.3 GAP-3 — Hard block de tarefa obrigatória é teatro (P0)

**Personas atingidas:** Renato (perde accountability), Tania (pedido explícito quebrado).

**Evidência:** `Activity.isMandatory` existe, `OverduePanel` lista, badge "Obrigatória" no `/tasks` (linhas 79-83). **Mas:**
- `PATCH /api/v1/deals/[id]/stage/route.ts` não tem validação `isMandatory && !isDone` antes de atualizar o `stageId` (audit Fábio §6.4).
- Não há criação automática de `StageRequiredTask → Activity` ao mover deal para novo stage (US-026 critério 1).
- A spec do Arnaldo previa esse trigger; auditor (Fábio) confirma "Subimplementado".

**Dor concreta:** Renato configura "Antes de avançar para Negociação, vendedor precisa enviar proposta por e-mail". Vitor arrasta o card no Kanban — **passa direto**. Sem alerta, sem block. Renato descobre 1 semana depois que 5 deals foram para Negociação sem proposta. Confiança no sistema cai para zero.

**Por que isso é grave:** Foi **o pedido mais específico e diferenciador da Tania** vs Clint/RD/Pipedrive (o `audit-report.md` v1 §6 do Patrícia anterior cita esse gap como **diferencial competitivo**). Entregamos o badge visual sem o motor por trás.

**Solução:** completar US-026 + US-048 — estimativa G+M ≈ **1 semana de dev**.

---

### 2.4 GAP-4 — Criar lead/contato/deal está quebrado (P0)

**Personas atingidas:** Vitor (não cadastra lojista da feira), Amanda (não cria lead do WA).

**Evidência:**
- Botão "+ Novo Contato" em `/leads/page.tsx:66` aponta para `/leads/new` → **rota não existe** (glob retornou 0 arquivos em `app/(dashboard)/leads/new/**`).
- Sem botão "+ Novo Deal" auditado no Kanban.
- API `POST /api/v1/contacts/route.ts` + `POST /api/v1/deals/route.ts` existem, mas isoladas.

**Dor concreta:** Vitor volta da feira da malharia em Goiânia com 12 cartões de lojistas novos. Abre o CRM, clica "+ Novo Contato"… **vai para tela 404**. Tira print, manda no grupo "tá quebrado", e cadastra todo mundo no WhatsApp mesmo. Adoção morre na primeira semana.

**Solução:** criar formulários `/leads/new` e modal "Novo Deal" no Kanban — estimativa M+M ≈ **3 dias de dev**.

---

### 2.5 GAP-5 — Tania pediu "obrigatoriedade", o sistema dá "sugestão" (P0)

Subconjunto de 2.3, mas merece destaque separado: a **filosofia do produto** está em risco. O `requirements.md` posiciona obrigatoriedade como **diferencial vs Clint** (cadência opcional). Se entregarmos "badge bonito mas botão move sempre", a Tania olha o produto ao lado do Clint e pergunta "qual é a diferença?". Resposta honesta: **nenhuma ainda**.

---

### 2.6 GAP-6 — LGPD sob demanda inexistente (P1)

**Personas atingidas:** José (titular dos dados), Renato (responsável legal).

**Evidência:**
- Cron `/api/cron/lgpd-purge/route.ts` anonimiza soft-deleted há >90 dias — **bom para limpeza periódica**, péssimo para Art. 18 LGPD que exige resposta em **15 dias**.
- US-020 previa `DELETE /api/contacts/:id/lgpd` com anonimização imediata. **Não foi implementado.**
- Audit Quésia L6 confirma: "feito manualmente por admin via Studio/SQL — documentar runbook" → **runbook não existe**.

**Dor concreta:** José Lojista lê na notícia que loja vazou dados, manda e-mail "Apaguem meus dados conforme LGPD Art. 18". Renato recebe. Tem **15 dias** legais. Solução atual? Pedir ao Fábio que rode SQL no Supabase Studio. Single point of failure operacional + risco regulatório.

**Solução:** endpoint `/api/v1/contacts/:id/lgpd-erase` + botão "Direito ao esquecimento" na ficha do contato (admin only) — estimativa M ≈ **2 dias de dev**.

---

### 2.7 GAP-7 — Notification center fantasma (P1)

**Personas atingidas:** todos.

**Evidência:** tabela `Notification` no schema com `userId`, `type`, `dealId`, `contactId`, `isRead`. **Nenhuma rota lê isso.** Sem badge na navbar, sem dropdown, sem `/notificacoes`. Webhooks WhatsApp poderiam criar notificações — não criam.

**Dor concreta:** José manda mensagem WhatsApp às 16h. Amanda está em outra aba do CRM. **Como ela sabe que chegou mensagem?** Não sabe. Tem que F5 manual a cada 5min, ou voltar ao WhatsApp Business.

**Solução:** US-027, US-037, US-043 — estimativa M+M+M ≈ **3 dias de dev**.

---

### 2.8 GAP-8 — Filtros de pipeline ausentes (P1)

**Personas atingidas:** Renato.

**Evidência:** `/pipeline/page.tsx` aceita só `?type=`. Sem owner/stage/valor/período (US-012 critério: query params na URL). Renato com 80 deals no Kanban Atacado **não consegue ver "só os do Vitor que estão em Proposta há mais de 7 dias"**.

**Solução:** US-012 — M ≈ **2 dias de dev**.

---

### 2.9 GAP-9 — Relatórios = 0 (P1)

**Personas atingidas:** Renato.

**Evidência:** sem `/relatorios/performance` (US-041), sem `/relatorios/funil` detalhado (US-042 parcial — só count no dashboard), sem `/relatorios/perdas` (US-044), sem deals fechados (US-014).

**Dor concreta:** sexta 17h, Renato fecha a semana. Quer responder à diretoria Techmalhas: "Vitor fechou quanto? Amanda fechou quanto? Por que perdemos os 5 deals da semana?". Resposta atual: **abre Supabase Studio e roda SQL na mão**.

**Solução:** US-041, US-042, US-044, US-014 — estimativa G+M+M+M ≈ **2 semanas de dev**.

---

### 2.10 GAP-10 — Configuração de WhatsApp via env var (P1)

**Personas atingidas:** Renato/admin.

**Evidência:** sem `/settings/whatsapp-integration` (US-049). Tokens Meta apenas em `META_*` envs do Vercel.

**Dor concreta:** Renato troca o número WhatsApp Business da Techmalhas. Precisa abrir ticket com Fábio para editar variáveis no Vercel. Toda mudança de credencial vira deploy. Quando o time crescer, escala mal.

**Solução:** US-049 — M ≈ **2 dias de dev** (com criptografia no banco).

---

### 2.11 GAP-11 — Sem perfil/troca de senha (P1)

**Personas atingidas:** Vitor, Amanda.

**Evidência:** sem `/perfil`. US-005 não entregue.

**Dor concreta:** Amanda esquece senha. Pede reset via "Esqueci a senha" do Supabase — ok, isso funciona. Mas para **trocar proativamente** uma senha vazada/anotada num post-it, **não tem caminho dentro do app**. Tem que pedir ao admin.

**Solução:** US-005 — P ≈ **1 dia de dev**.

---

### 2.12 GAP-12 — CSV import ausente (P2 com nota)

**Personas atingidas:** Renato no go-live.

**Evidência:** US-021 não entregue.

**Dor concreta no go-live:** Renato tem **planilha com ~200 lojistas atualmente em WhatsApp/Excel**. Como migra para o CRM no dia 1? Cadastra um por um? Vai abandonar o CRM no dia 2.

**Solução:** US-021 — G ≈ **3 dias de dev**. Pode ser pós-MVP se houver script SQL de seed para o go-live; senão, é **P0 disfarçado de P2**.

---

### 2.13 GAP-13 — Sem `/deals/fechados` (P2)

Já coberto no GAP-9, listo separado porque é US-014 explícita.

---

### 2.14 GAP-14 — `dapic_id` reservado mas zero plano (P2)

**Evidência:** campos `Contact.dapicId`, `Deal.dapicPedidoId` reservados (correto — agradeça ao Patrícia anterior). **Mas sem ADR ou roadmap para v2.** Daqui a 6 meses ninguém lembra a intenção.

**Solução:** ADR-011 "Plano de integração Dapic v2" — escrita ≈ **2h** + decisão de produto.

---

### 2.15 GAP-15 — Coleções sazonais (Copa 2026, Inverno) sem hookng (P2)

**Evidência:** `Deal.tags String[]` permite tag livre. Sem entidade `Collection`, sem associação a deals/produtos. O `audit-report.md` v1 §6 (Gap 3) classificou isso como diferencial Techmalhas.

**Dor:** "Quais lojistas ainda não pediram a Copa 2026?" → impossível responder hoje.

**Solução:** v2 com entidade `Collection` — backlog datado, não MVP.

---

### 2.16 GAP-16 — Bugs de runtime no caminho crítico (P0 técnico)

Já mapeados pelo Fábio (audit §7); listo aqui porque **bloqueiam o uso real**:

| # | Bug | Severidade Produto |
|---|---|---|
| 7.1 | Cookies SSR no-op → sessão expira sem aviso após ~1h | **P0** — Amanda perde trabalho no meio de uma resposta |
| 7.2 | `upsert` em `phone` sem `@unique` → webhook WhatsApp quebra runtime | **P0** — Inbox de WhatsApp (se existir) vai mostrar erros aleatórios |
| 7.3 | `logAudit` sem `await` → LGPD audit incompleto | **P0 regulatório** |
| 7.4 | `throw { object }` retorna 500 genérico | **P1** — Vitor vê "Erro interno" em vez de "Sem consentimento LGPD" |
| 7.5 | N+1 no inbox chat → 50 sessões = 51 queries | **P1 performance** |

---

### 2.17 GAP-17 — `_count` de stage com filtro de role no Dashboard (P2)

**Evidência (`dashboard/page.tsx:30-42`):**

```30:42:crm-app/app/(dashboard)/dashboard/page.tsx
    prisma.stage.findMany({
      where:   {
        pipeline: {
          type: user.role === 'atendente_varejo' ? 'varejo' : 'atacado',
        },
      },
      include: {
        _count: {
          select: { deals: { where: { ...targetFilter, status: 'open', deletedAt: null } } },
        },
      },
      orderBy: { position: 'asc' },
    }),
```

**Problema:** se `user.role === 'admin'` ou `'gestor'`, vê **apenas o pipeline Atacado** no dashboard. **Renato é gestor — deveria ver os dois pipelines no funil** (US-042 critério). Hoje vê apenas Atacado por defeito. Vendedora varejo vê só Varejo (correto). Vendedor atacado vê só Atacado (correto). **Gestor está mal modelado.**

**Solução:** dashboard com tab Atacado/Varejo, ou dois funnels lado-a-lado para gestor.

---

## 3. Riscos de Adoção pelos Usuários Reais

Tratamento por persona. Esta é a seção que dirá se o sistema **vai ser usado** ou **vai virar mais uma ferramenta abandonada**.

### 3.1 Vitor — vendedor de Atacado, 6-8h/dia no celular

**Fluxo do dia (cenário real):**

1. **08h, na rua a caminho da feira de São Paulo.** Vitor abre o app no celular. ✅ Login funciona, Kanban Atacado carrega.
2. **09h, primeiro lojista interessado.** Vitor quer cadastrar o José Novo na hora. Clica "+ Novo Contato" → **404 (GAP-4).** Solução: digita no WhatsApp Business, perde 5min, frustra.
3. **10h, José manda mensagem WhatsApp** confirmando pedido. Vitor olha no celular: notificação do WhatsApp normal, não do CRM. **No CRM, não tem inbox (GAP-1).** Vitor responde no WA Business e o CRM nem fica sabendo.
4. **12h, deal antigo precisa avançar para "Proposta".** Vitor abre o CRM, arrasta o card. **Passa sem bloqueio mesmo havendo tarefa obrigatória pendente (GAP-3).** Funcionou? Sim. Renato fica feliz? Não, porque o controle foi furado.
5. **15h, sessão expira (GAP-2.16 / bug 7.1)** silenciosamente. Vitor digita uma nota grande no detalhe… ah, espera, **não tem detalhe de deal (GAP-2)**. Volta ao Kanban.
6. **16h, fechou venda com José.** Quer marcar "Ganho". **Não tem botão (GAP-2).** Vai no WhatsApp Business marcar emoji ✅ e mandar mensagem pro Renato.
7. **17h, fim do dia.** Quantos minutos Vitor usou o CRM hoje? ~10. Quantos no WhatsApp Business? ~6h.

**Veredicto adoção Vitor:** **alto risco de churn na semana 1.** O CRM resolve menos dores do que cria.

**Fricções concretas (ordenadas por gravidade):**

1. **Botão "+ Novo Contato" leva para 404** — GAP-4. Primeira impressão é "tá quebrado".
2. **WhatsApp paralelo** — GAP-1. O canal principal de Vitor está fora do sistema.
3. **Sem fechar venda** — GAP-2. O "ganho" não persiste.
4. **Tarefa obrigatória não bloqueia** — GAP-3. Conflita com promessa do Renato.
5. **Sem detalhe de deal** — GAP-2. Vitor não anota nada.
6. **Sessão expira sem aviso** — bug 7.1. Perde trabalho.

---

### 3.2 Amanda — atendente de Varejo, computador no escritório, 8h/dia no chat

**Fluxo do dia:**

1. **08h.** ✅ Login, abre `/chat`. Vê `webchatSession` se houver visitante no site Irroba. **Mas o site Irroba ainda não tem o widget instalado** (depende do acesso Irroba — ADR-008 §7) — então `/chat` está **vazio na maioria dos dias**.
2. **09h.** WhatsApp pessoal toca: cliente perguntando sobre Polo Piquet. Amanda abre… o WhatsApp Business normal. **CRM não recebe a mensagem em UI (GAP-1).**
3. **10h.** Cliente do varejo manda DM no Instagram. **Webhook Instagram existe (`INSTAGRAM_ENABLED=false`) mas inbox não existe** (já era v2 no MVP — OK adiar, mas o gancho está half-built).
4. **14h.** Quer ver histórico de um cliente recorrente para responder com contexto. **Clica no contato em `/leads/[id]` → carrega — mas a aba de interações depende do `LeadTimeline` que só vê o que está em `interactions` table — e nada está sendo gravado** (sem inbox WhatsApp, sem mensagens externas vinculadas).
5. **17h.** Amanda fechou 0 deals via CRM hoje. Não porque não trabalhou; porque o sistema não captura o que ela faz.

**Veredicto adoção Amanda:** **uso 30% do potencial.** Webchat embed (quando rodar) vai ajudar em ~10% dos atendimentos (varejo digital), mas WhatsApp continua dominante. Sem GAP-1 resolvido, o CRM dela é um "registro manual" — exatamente o que prometemos eliminar.

**Fricções concretas:**

1. **WhatsApp segue paralelo** — GAP-1. Mata 90% do uso.
2. **Sem notificação real-time de nova conversa** — GAP-7. F5 manual a cada X minutos.
3. **`/chat` pode ficar vazio dias seguidos** — depende do widget no Irroba ser instalado.
4. **Sem notas em atividade** — GAP-2 (US-030). Amanda não registra contexto.

---

### 3.3 Renato — gestor, precisa de visibilidade

**Fluxo da semana:**

1. **Segunda 08h.** ✅ Dashboard carrega. 4 KPIs. **Mas "Receita 30d" = R$ 0** porque ninguém fecha deal (GAP-2). KPI mente.
2. **"Taxa de Conversão" cálculo:**

```46:46:crm-app/app/(dashboard)/dashboard/page.tsx
  const conversionRate  = totalDeals > 0 ? (wonDeals.length / (totalDeals + wonDeals.length)) * 100 : 0
```

   `wonDeals.length` é sempre 0 (GAP-2). Conversão sempre 0%. KPI mente de novo.

3. **Quer ver performance do Vitor vs Amanda.** → sem `/relatorios/performance` (GAP-9). Abre Supabase Studio.
4. **Quer fechar a semana e ver tarefas vencidas da equipe.** → `/tasks` mostra para gestor (✅), mas sem filtros por vendedor (limit 100). Em equipe pequena tá OK; cresceu? não.
5. **1:1 com Vitor.** "Vitor, vi que 5 deals seus passaram para Negociação sem proposta enviada." Vitor: "Ah, eu pulei a tarefa." Renato: "Mas era obrigatória." Vitor: "Eu sei, mas o sistema deixou." (GAP-3). Discussão.
6. **Pedido LGPD do José.** Renato sabe o que fazer? Não tem runbook (GAP-6). Bate na porta do Fábio.
7. **Dashboard só mostra um pipeline.** GAP-17. Renato é gestor, deveria ver Atacado + Varejo simultaneamente.

**Veredicto adoção Renato:** **gestor descobre que o CRM "não conta a verdade".** KPIs mentem por falta de US-011. Sem relatórios, segue dependente de planilha. Sem hard block, accountability quebrou.

**Fricções concretas:**

1. **KPIs zerados artificialmente** (Receita 30d, Conversão) — GAP-2.
2. **Sem performance por vendedor** — GAP-9.
3. **Hard block furado** — GAP-3.
4. **Dashboard de um pipeline só** — GAP-17.
5. **Sem visão de motivos de perda** — GAP-9 (US-044).

---

### 3.4 José — cliente lojista, persona externa

**Fluxo do mês:**

1. José compra mensalmente. Liga no WhatsApp Business da Techmalhas. **Amanda atende no WhatsApp Business** (não no CRM — GAP-1). Histórico continua dividido entre celular dela e CRM.
2. José abre o site `techmalhas.com.br`. Quer um chat. **Widget Webchat ainda não está instalado no Irroba** (depende de acesso Tania — ADR-008 §7).
3. José pede pelo direito de exclusão LGPD. **Renato não tem botão** (GAP-6). Resposta demora dias.

**Veredicto José:** o CRM **ainda não melhorou a experiência do José**. Continua sendo tratado como cliente novo cada vez. RFM simplificado (badge "Cliente Recorrente" no `audit-report.md` v1 §6 Gap 6) **não foi implementado** — busquei e não há lógica de count de deals fechados na ficha. Diferencial vs Clint/RD evaporou.

---

## 4. Débito de Produto (não-técnico)

Decisões adiadas, features stub, configurações pendentes que vão pesar daqui a 30-60 dias.

### 4.1 Decisões adiadas que viraram código

| # | Decisão pendente | Onde está stub | Custo de adiar mais |
|---|---|---|---|
| D1 | Schema tem 4 roles (`vendedor_atacado`/`atendente_varejo`) mas docs ainda dizem 3. **Sem ADR.** | `prisma/schema.prisma:23-30` | Novo dev/IA fica confuso; checkpoints futuros sem contexto |
| D2 | `Pipeline.type` é `@unique` — significa **só 1 pipeline atacado e 1 varejo possíveis**. Se Renato quiser "Atacado Premium" + "Atacado Tradicional", precisa migration. | `schema.prisma:250` | Mudança requer remover `@unique` + migration |
| D3 | `dapic_id` reservado sem ADR de integração v2 | schema multiple lugares | 6 meses depois, ninguém lembra a intenção |
| D4 | Decisão "default theme dark" tomada via ADR-010 sem teste em campo com Vitor/Amanda | `next-themes` config | Pode ter de reverter; Davi monitora 3 dias |
| D5 | Webchat lgpdConsent é boolean simples; sem capture de **versão da política** aceita | `WebchatSession.lgpdConsent` | Futuro auditor jurídico pergunta "qual versão da política o José aceitou em 2026-05?" — sem resposta |
| D6 | Rate limit (`lib/ratelimit.ts`) é **in-memory por instância serverless** (QA Quésia S9). Múltiplas instâncias Vercel = limite real Nx5/min. | `lib/ratelimit.ts` | Não bloqueia hoje; explode quando volume escalar |
| D7 | Cron `lgpd-purge` é mensal (Vercel Hobby plan). Pedido LGPD entra; titular espera até 30 dias para purge automático rodar. | `vercel.json` + `api/cron/lgpd-purge` | Inadequado para Art. 18 (15 dias) — depende de GAP-6 |
| D8 | Mock de preview (`/preview/*`) coabita com prod sem flag/protection | `app/preview/*` | Tania ou cliente pode abrir por engano `/preview/dashboard` e ver dados fake |
| D9 | Vercel Hobby tem limite 1 cron/dia — atualmente 3 crons configurados; **plano Pro precisa ser confirmado** (QA Quésia O5) | `vercel.json` | Crons silenciosamente não rodam |

### 4.2 Features stub (existem no schema, sem uso)

| # | Stub | Localização |
|---|---|---|
| F1 | `Notification` table sem nenhum CRUD ou trigger | `schema.prisma:580-603` |
| F2 | `LeadSource` table sem CRUD; só seed (audit Fábio §6.2: `getOrCreateLeadSourceId` é só Get) | `schema.prisma:172-184` |
| F3 | `Deal.expectedCloseDate` no schema, sem UI de captura | `schema.prisma:336` |
| F4 | `Contact.tags` String[] livre, sem governance | `schema.prisma:215` |
| F5 | `WhatsappMessage.templateName` + `templateVars` no schema, sem fluxo de templates aprovados Meta | `schema.prisma:452-453` |
| F6 | `Stage.probability` no schema, não usado em nenhum cálculo de pipeline value | `schema.prisma:278` |
| F7 | `WebchatSession.utmSource/Medium/Campaign` no schema, sem captura no widget (ainda) | `schema.prisma:530-532` |
| F8 | `InteractionDirection.internal` no enum — quando se usa? Não documentado | `schema.prisma:75` |

### 4.3 Configurações pendentes (operacionais)

| # | Item | Bloqueador |
|---|---|---|
| C1 | Acesso ao painel Irroba para instalar widget (ADR-008 §9) | Tania precisa recuperar credenciais |
| C2 | Número WhatsApp Business verificado na Meta (`requirements.md` §6 risco 1) | Confirmação Tania |
| C3 | Templates Meta pré-aprovados para janela > 24h (`requirements.md` §6 risco 2) | Quem submete? |
| C4 | Plano Supabase (Free vs Pro) confirmado (QA Quésia O6) | Tania |
| C5 | Plano Vercel (Hobby vs Pro) confirmado (cron > 1/dia) | Tania |
| C6 | Cloudflare Turnstile keys provisionadas | Fábio Sprint 1 |
| C7 | Upstash Redis provisionado (rate limit) | Fábio Sprint 1 |
| C8 | Página `/politica-de-privacidade` no site Techmalhas para widget linkar (ADR-008 §9) | Tania + jurídico |
| C9 | Lista de emails autorizados Google OAuth (não só `@techmalhas.com.br` — `requirements.md` §6 risco 7) | Tania |
| C10 | `.env.example` versionado (QA Quésia S2) | Fábio — bloqueia onboarding novo dev |

---

## 5. Métricas Faltando

O que NÃO está sendo medido e deveria. Sem isso, **não temos como saber se o produto está sendo usado direito**.

### 5.1 KPIs de produto (uso real do sistema)

| # | Métrica | Por que importa | Como medir | Status |
|---|---|---|---|---|
| M1 | **DAU/WAU** (usuários ativos) | Saber se Vitor/Amanda logam | `users.lastLoginAt` agregado | ❌ Campo existe, sem dashboard |
| M2 | **Tempo médio de sessão** | Vitor "passa" no CRM ou usa? | Telemetria server-side | ❌ Não medido |
| M3 | **Deals movidos / dia** | Atividade real do funil | `audit_logs` filtrado por `action=UPDATE`, `tableName='deals'`, `changedFields=['stageId']` | ❌ Audit log existe, sem agregação |
| M4 | **% de deals com tarefa obrigatória completada** | Aderência ao processo | Query sobre `Activity.isMandatory=true` + `isDone` | ❌ Não medido |
| M5 | **Mensagens WhatsApp respondidas / dia** | Adesão ao canal | `interactions.direction=outbound, channel=whatsapp` | ❌ Sem inbox, métrica vazia |
| M6 | **Tempo até primeira resposta** (lead → primeira interação out) | SLA de atendimento | timestamps em `interactions` | ❌ Não medido |
| M7 | **% leads cadastrados via web vs CRM vs manual** | Eficácia do widget Webchat | `LeadSource.type` | ⚠️ Modelo existe, sem dashboard |

### 5.2 KPIs de negócio (resultado)

| # | Métrica | Status |
|---|---|---|
| M8 | Receita gerada por canal (Atacado/Varejo) | ❌ Sem GAP-2 (fechar deal), zerado |
| M9 | **Taxa de conversão real** (won / (won+lost)) | ❌ Mesmo motivo |
| M10 | **Tempo médio no stage** (gargalo) | ❌ US-042 critério 2 não implementado |
| M11 | **Ticket médio por vendedor** | ❌ Sem US-041 |
| M12 | **Motivos de perda top 5** | ❌ Sem US-044 |
| M13 | **% leads novos que viram deal aberto** (lead-to-deal) | ❌ Não medido |
| M14 | **Cohort RFM** (recência/frequência/valor) do José | ❌ Diferencial Techmalhas não implementado |

### 5.3 KPIs de qualidade (LGPD + observabilidade)

| # | Métrica | Status |
|---|---|---|
| M15 | **% contatos com `lgpdConsent=true`** | ❌ Sem dashboard |
| M16 | **Pedidos LGPD pendentes** (>15 dias) | ❌ Sem UI |
| M17 | **Webhook WhatsApp success rate** | ❌ Sem dashboard |
| M18 | **Sessões Webchat com resposta < 60s** | ❌ Métrica de SLA prometida ADR-008 §10 |
| M19 | **Erros 5xx por rota** | ❌ Sem Sentry/Datadog confirmado |

### 5.4 Recomendação de instrumentação mínima

Implementar **dashboard "Saúde do Produto"** (`/admin/health` ou `/admin/metrics`) com pelo menos M1, M3, M4, M5, M15. Custo M ≈ **2 dias de dev**. Sem isso, **navegamos no escuro pós-deploy**.

---

## 6. Recomendações Priorizadas

Top ações para fechar o MVP **de verdade**. Ordem por valor/esforço.

### Sprint Recovery (próximas 2-3 semanas, 1 dev focado ou paralelo Sprint Webchat)

| # | Ação | Prio | Stories cobertas | Esforço | Por que agora |
|---|---|---|---|---|---|
| **R1** | **Inbox WhatsApp completo** (lista conversas + chat + envio + status + notificação) | **P0** | US-033, US-034, US-036, US-037, US-039 | **G+G ≈ 1.5–2 semanas** | Quebra absoluta da promessa do MVP. Vitor e Amanda dependem 100% disto |
| **R2** | **Detalhe de deal + fechar Ganho/Perdido** | **P0** | US-010, US-011 | **M+P ≈ 3 dias** | Destrava todas as métricas do dashboard (que hoje retornam 0) |
| **R3** | **Hard block real + auto-criação de tarefas obrigatórias por stage** | **P0** | US-026, US-048 (UI) | **G+M ≈ 1 semana** | Diferencial #1 da Techmalhas vs Clint/RD |
| **R4** | **Formulário "Novo Contato" + "Novo Deal"** (corrigir 404) | **P0** | US-008 (UI), US-017 (UI) | **M+M ≈ 3 dias** | Bug visível em 5 segundos de uso |
| **R5** | **Fix bugs P0 do audit Fábio §7** (cookies SSR, upsert phone, logAudit await, throw object) | **P0** | técnico | **M ≈ 2 dias** | Sem isso, R1 e o webhook não funcionam |
| **R6** | **LGPD sob demanda** (endpoint + botão admin) | **P1** | US-020 | **M ≈ 2 dias** | Regulatório, 15 dias de SLA legal |
| **R7** | **Notification center** (badge navbar + dropdown + `/notificacoes`) | **P1** | US-027, US-037, US-043 | **M+M ≈ 3 dias** | Sem isso, R1 fica meia-boca |
| **R8** | **Filtros de pipeline** (owner/stage/valor/período) | **P1** | US-012 | **M ≈ 2 dias** | Renato precisa para 1:1 |
| **R9** | **Relatórios mínimos** (performance por vendedor + funnel com tempo no stage + deals fechados + motivos de perda) | **P1** | US-041, US-042 (completar), US-014, US-044 | **G+M+M+M ≈ 2 semanas** | Sem isso, Renato segue na planilha |
| **R10** | **Config integração WhatsApp (UI)** | **P1** | US-049 | **M ≈ 2 dias** | Auto-atendimento operacional |
| **R11** | **Perfil + troca de senha** | **P1** | US-005 | **P ≈ 1 dia** | UX básica esperada de qualquer SaaS |
| **R12** | **ADR-011 — Roles + Pipeline.@unique + dapic_id roadmap** | **P1** | doc | **2h escrita** | Trava decisões adiadas (D1, D2, D3) |
| **R13** | **CSV import** (ou script de seed go-live documentado) | **P2/P0** | US-021 | **G ≈ 3 dias** ou **runbook 2h** | Bloqueia migração inicial dos 200 lojistas |
| **R14** | **Dashboard "Saúde do Produto"** (M1, M3, M4, M5, M15) | **P2** | metrics | **M ≈ 2 dias** | Pós-deploy, navegar com dados |
| **R15** | **Cleanup débito técnico** (`.env.example`, error boundaries, remover `ignoreBuildErrors`, deletar aliases v3) | **P2** | técnico | **M ≈ 2 dias** | Sustentação |

### Estimativa total Sprint Recovery

| Bloco | Total |
|---|---|
| P0 (R1–R5) | **~3 semanas** com 1 dev |
| P1 (R6–R12) | **~3 semanas** com 1 dev (pode paralelizar com P0 em equipe 2 devs) |
| P2 (R13–R15) | **~1.5 semanas** |
| **MVP "honesto" fechado** | **~7-8 semanas** com 1 dev focado, ou **3-4 semanas com 2 devs em paralelo** |

> Para comparar: a estimativa original em `requirements.md` foi **4 meses MVP** (R$ 56.000) — estávamos no caminho. O que aconteceu é **scope creep** (Webchat + DS v5 + ADR-007) puxando 50-70h de capacidade, mas **outros 30%** ficaram para trás.

### Decisão necessária (Tania)

⚠️ **Checkpoint Patrícia precisa para seguir:**

1. **Webchat + Sprint Recovery — sequencial ou paralelo?**
   - Sequencial: termina Webchat primeiro (32h Arnaldo). Depois Sprint Recovery (7-8 semanas).
   - Paralelo (2 devs): Webchat com 1 dev (Fábio), Sprint Recovery com outro dev. Custo +1 contratação ou alocação.

2. **Manter ADR-007 (PM-Tutora-Squad)?**
   - O modelo está produzindo entregas profundas (este audit, audit Davi, audit Fábio, audit Quésia, ADRs). Pro: visibilidade. Contra: throughput de código não acompanha. Manter por mais 30 dias e medir como ADR-007 §"Métricas de sucesso" propõe.

3. **Adiar Instagram para v2 formalmente?**
   - Schema + webhook existem half-built. Hora de **flag `INSTAGRAM_ENABLED=false` permanente** ou completar a tela? Sugiro **desabilitar definitivamente** e remover do MVP para reduzir surface area.

4. **Confirmar `Pipeline.type @unique` (D2)?**
   - Se Renato quiser "Atacado Premium" no futuro, removeremos `@unique` agora ou depois? Sugiro remover agora — barato hoje, caro depois.

---

## 7. Veredicto Final

### Está pronto para usar em produção real?

**NÃO.**

### Por quê?

O CRM tem **fundação sólida** (auth, RBAC, schema, RLS, audit, observabilidade básica, design system v5) e **dois pilares quebrados** que impedem uso real:

1. **WhatsApp como canal de atendimento** (Épico E) — entregamos backend (webhook, send, schema completo `WhatsappMessage`) **sem nenhuma UI utilizável**. Amanda e Vitor — as duas personas mais ativas do MVP — **não conseguem usar o sistema para o que mais fazem o dia inteiro**.
2. **Fechamento de venda e accountability** (US-010, US-011, US-026) — sem detalhe de deal, sem botão "Ganho/Perdido", sem hard block real. **O Renato pediu controle. O sistema entrega badge.**

Some-se a isso o botão "+ Novo Contato" que leva para 404 e os 5 bugs P0 técnicos pendentes (audit Fábio), e o resultado é: **a primeira hora de uso real pelo time Techmalhas vai ser cheia de "isso aqui tá quebrado"**. Adoção morre na semana 1.

### Está pronto para o quê?

| Cenário | Veredicto |
|---|---|
| **Demo para investidor / diretoria Techmalhas** | ⚠️ Sim, com guia do que mostrar/não mostrar. Use `/preview/*` que está mais bonito. |
| **Treinamento interno (Vitor/Amanda/Renato)** | ✅ Sim. Identifica os gaps em uso real antes do hard launch. |
| **Piloto com tráfego real (1 vendedor, 1 atendente, 1 gestor)** | ❌ Não — vai gerar mais frustração do que aprendizado. Espere Sprint Recovery R1-R5. |
| **Go-live produção plena** | ❌ Não. Faltam ~3-4 semanas (2 devs paralelo) ou ~7-8 semanas (1 dev). |

### Recomendação executiva à Tania

> **Pausar o pivot Webchat até R1-R5 estarem entregues, OU contratar/alocar 2º dev para paralelo.**
>
> Webchat é feature **importante** (o Davi e o Arnaldo fizeram trabalho excelente), mas **NÃO é o que a Tania pediu primeiro** (`requirements.md` §1 lista explicitamente "WhatsApp Oficial" — o webchat **não está no MVP original**). Voltar ao backlog priorizado, fechar o MVP que foi prometido, **depois** entregar o widget do site.
>
> Se a Tania confirmar que webchat virou prioridade #1, então **explicitamente adiar Sprint Recovery R1-R5 com ADR escrita**, para que daqui a 30 dias ninguém pergunte "cadê o WhatsApp?" e a resposta seja documentada.

### Honestidade final

O squad fez **muito trabalho de boa qualidade nas últimas 48h** (auditorias técnicas, design v5, integração Irroba). Mas trabalho ≠ entrega de produto. **Volume de markdown produzido não é proxy de funcionalidade entregue ao Vitor.** Reorganizar para fechar o que foi prometido **antes** de adicionar novidades é, na minha leitura, o caminho menos arriscado.

Quem quiser desafiar essa leitura, traga dados (uso real do Vitor com versão atual em campo), não argumento. **A produção é o juiz.**

---

*Documento produzido por Patrícia Produto — Estrategista de Produto, Squad CRM Techmalhas*
*Versão 1.0 — 2026-05-25 23:30 BRT*
*Próximo passo: Checkpoint Tania para decisão sobre §6 (sequencial vs paralelo) + ADR-011 sobre roles/pipeline/dapic.*
