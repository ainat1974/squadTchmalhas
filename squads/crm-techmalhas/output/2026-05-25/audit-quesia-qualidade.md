# Auditoria de Qualidade — CRM Techmalhas
**Por:** Quésia Qualidade · 2026-05-25 · v1.0

---

## TL;DR

- **Cobertura real de testes: ~0%** — Vitest e Playwright estão no `package.json`, mas **não existe nenhum arquivo de teste** no repositório (`tests/`, `__tests__/`, `*.test.*`, `*.spec.*` = zero). O `test-report.md` de 24/05 que declara 79 testes passando é **documentação aspiracional**, não evidência executável.
- **Fluxos críticos sem teste automatizado:** login, criar contato, mover deal, tarefa obrigatória bloqueia movimentação, webchat embed, enviar mensagem, tema dark/light, drawer mobile — **nenhum tem E2E real**.
- **Bugs em produção (Vercel, últimas 24h):** MCP `get_runtime_logs` retornou **zero logs** (error/fatal) — indica ausência de tráfego real ou deploy inativo; não substitui validação manual.
- **Documentação:** README cobre setup básico, mas **não existe guia do usuário (Vitor/Amanda), guia do admin, nem política de privacidade publicada** — link no webchat aponta para `/politica-de-privacidade` que **não existe**.
- **Veredicto:** **Não** para cliente real esta semana sem smoke test manual de 15 min + correções P0 (política LGPD, proteção de rotas, testes mínimos).

---

## 1. Cobertura de Testes (Estado)

### Ferramentas configuradas

| Ferramenta | No `package.json` | Config no repo | Arquivos de teste |
|---|---|---|---|
| Vitest `^2.1.5` | ✅ `pnpm test` | ❌ sem `vitest.config.ts` | **0** |
| Playwright `^1.49.0` | ✅ `pnpm test:e2e` | ❌ sem `playwright.config.ts` | **0** |
| MSW `^2.6.6` | ✅ devDep | — | **0** |
| happy-dom | ✅ devDep | — | — |
| CI GitHub Actions | Descrito em `test-report.md` | ❌ `.github/workflows/` ausente | — |

### Testes existentes

| Tipo | Esperado (test-report 24/05) | Real no repo |
|---|---|---|
| Unit (Vitest) | 52 | **0** |
| Integration (Vitest) | 22 | **0** |
| E2E (Playwright) | 5 | **0** |
| **Total** | **79** | **0** |

> **Achado crítico:** O relatório `squads/crm-techmalhas/output/2026-05-24-162435/test-report.md` descreve suites completas (`tests/unit/`, `tests/integration/`, `tests/e2e/`) que **nunca foram commitadas** no `crm-app/`. Rodar `pnpm test` hoje falha ou não encontra testes.

### Cobertura estimada por área

| Área | Cobertura estimada | Observação |
|---|---|---|
| `lib/` (validators, permissions, auth, whatsapp) | **0%** | Lógica crítica sem unit test |
| `app/api/v1/` (16 rotas) | **0%** | Nenhum integration test |
| `app/(dashboard)/` (9 telas) | **0%** | UI sem E2E |
| `app/embed/chat/` (webchat) | **0%** | Feature nova, zero cobertura |
| `app/(auth)/login` | **0%** | Fluxo #1 sem teste |

**Cobertura global estimada: < 5%** (apenas revisão manual de código; nenhum teste executável).

---

## 2. Fluxos Críticos NÃO Testados

Prioridade **P0** (bloqueiam go-live) → **P2** (pós-MVP).

| # | Fluxo | Prioridade | Risco se quebrar |
|---|---|---|---|
| 1 | Login e-mail/senha + redirect `/pipeline` | **P0** | Ninguém entra no CRM |
| 2 | Login Google OAuth | **P0** | Metade do time pode não logar |
| 3 | Criar contato/lead manual (`/leads`) | **P0** | Vitor/Amanda não cadastram |
| 4 | Mover deal no Kanban (drag-and-drop) | **P0** | Pipeline inútil |
| 5 | Tarefa obrigatória bloqueia movimentação (409) | **P0** | Regra de negócio core |
| 6 | Completar atividade e liberar movimentação | **P0** | Fluxo 5 incompleto |
| 7 | Webchat embed: iniciar sessão + 1ª mensagem | **P0** | Site Irroba sem atendimento |
| 8 | Operador responde no `/chat` (dashboard) | **P0** | Conversa unilateral |
| 9 | Webhook WhatsApp cria contato (idempotente) | **P1** | Leads WhatsApp perdidos |
| 10 | Formulário público `/api/v1/public/leads` | **P1** | Leads do site não entram |
| 11 | RBAC: vendedor não vê B2C / atendente não vê B2B | **P1** | Vazamento de dados (LGPD) |
| 12 | Tema dark/light (`next-themes`) | **P2** | UX, não bloqueia |
| 13 | Drawer/sidebar mobile | **P2** | Amanda no celular |
| 14 | Dashboard KPIs | **P2** | Gestão sem métricas |
| 15 | Settings: usuários e pipelines | **P2** | Admin Renato |

**Nenhum dos 15 fluxos acima possui teste automatizado no repositório atual.**

---

## 3. Edge Cases e Ataques Éticos

### Login (`/login`)

| Caso "feio" | Comportamento esperado | Risco observado no código |
|---|---|---|
| Senha errada 100× | Rate limit / lockout | ❌ Sem rate limit no client; depende só do Supabase |
| E-mail com `<script>alert(1)</script>` | Rejeitado ou escapado | Input `type="email"` — parcial |
| Cookies desabilitados | Mensagem clara | Supabase Auth **falha silenciosamente**; toast genérico |
| Sessão expirada no meio do Kanban | Redirect login | ❌ **Sem `middleware.ts`** — rotas dashboard podem renderizar vazio |

**Test case sugerido:** `deve redirecionar para /login quando sessão Supabase expirar em rota protegida`

### Criar contato / leads

| Caso | Risco |
|---|---|
| `fullName: "<img src=x onerror=alert(1)>"` | XSS refletido na listagem se não sanitizar |
| `lgpdConsent: false` via API direta | Deve retornar 422 — validator existe, **não testado** |
| CNPJ/CPF inválido | Validator Zod — **não testado** |

**Test case:** `deve rejeitar POST /contacts com lgpdConsent false retornando 422`

### Mover deal / tarefa obrigatória

| Caso | Risco |
|---|---|
| PATCH stage com tarefa mandatory pendente | 409 + lista de tarefas — **código OK, sem teste** |
| Dois usuários movem mesmo deal simultaneamente | Last-write-wins; sem lock otimista |
| Vendedor A move deal de Vendedor B | `requireDealOwnership` — **código OK, sem teste** |

**Test case:** `deve bloquear deal-stage move quando há tarefa obrigatória pendente`

### Webchat embed (`/embed/chat`)

| Caso | Risco |
|---|---|
| `postMessage` com `targetOrigin: '*'` | Qualquer site pai pode receber eventos — **risco de vazamento** |
| Enviar mensagem em `sessionId` de outro visitante | POST público sem validação de posse da sessão |
| `localStorage` desabilitado | Código trata com `catch` — OK, mas sessão não persiste |
| `pageUrl` malicioso no POST sessions | `new URL(input.pageUrl)` pode **lançar 500** se URL inválida (linha 77 sessions route) |
| Política de privacidade | Link `/politica-de-privacidade` — **página não existe** |

**Test case:** `deve rejeitar mensagem em sessionId inexistente com 404`
**Test case:** `deve validar pageUrl antes de notificar atendentes sem crash 500`

### LGPD / acesso cruzado

| Caso | Artigo LGPD | Risco |
|---|---|---|
| Vendedor atacado lista `GET /contacts` de outro pipeline | Art. 46 (segurança) | Filtro em `contactsWhereClause` — **sem teste** |
| IDOR: `GET /contacts/{uuid-outro}` | Art. 18 (acesso) | Depende de check na rota — **auditar implementação** |
| Lead WhatsApp sem consentimento | Art. 7, II (consentimento) | `lgpdConsent: false` + tag `pendente-lgpd` — processo manual |
| Exportar dados do titular | Art. 18, V | **Não implementado** |
| Excluir dados (direito ao esquecimento) | Art. 18, VI | Soft delete existe; cron `lgpd-purge` — **não validado** |

### Infra / rede

| Caso | Risco |
|---|---|
| Offline durante drag Kanban | Optimistic UI pode reverter sem feedback claro |
| Rate limit `/public/leads` | In-memory por instância Vercel — **bypass com múltiplas instâncias** |
| Webhook WhatsApp sem `META_APP_SECRET` | 401 em todas as mensagens — config deploy |

---

## 4. Bugs Reais em Produção (Vercel Logs)

**Consulta MCP:** `get_runtime_logs`  
**Projeto:** `prj_aCxSXDcL2TDGDqhEysAiRHZulki2`  
**Período:** últimas 24h (2026-05-25T10:15Z → 2026-05-26T10:15Z)  
**Filtro:** `level: ["error", "fatal"]`

**Resultado:** *No logs found for the specified criteria.*

### Interpretação

| Hipótese | Probabilidade | Ação |
|---|---|---|
| Deploy sem tráfego de usuários reais | Alta | Confirmar URL de produção com Tania |
| Projeto Vercel correto mas app não deployado | Média | Verificar último deployment no dashboard |
| Erros só em `warn`/`info` (não capturados) | Média | Ampliar filtro em monitoramento pós-go-live |
| App estável sem erros 5xx | Baixa sem tráfego | Não usar como evidência de qualidade |

### Bugs de código identificados na auditoria (não dependem de logs)

| ID | Severidade | Descrição | Arquivo |
|---|---|---|---|
| B-01 | 🔴 Alto | Link Política de Privacidade 404 | `ChatEmbed.tsx` → `/politica-de-privacidade` inexistente |
| B-02 | 🔴 Alto | Ausência de `middleware.ts` — rotas dashboard sem guard server-side | `crm-app/` raiz |
| B-03 | 🟠 Médio | `postMessage(..., '*')` — origem não restrita | `ChatEmbed.tsx:50` |
| B-04 | 🟠 Médio | Webchat POST mensagem sem prova de posse da sessão | `webchat/messages/route.ts` |
| B-05 | 🟠 Médio | `new URL(pageUrl)` sem try/catch na notificação | `webchat/sessions/route.ts:77` |
| B-06 | 🟡 Médio | WhatsApp cria contato com `lgpdConsent: false` | `webhooks/whatsapp/route.ts:61` |
| B-07 | 🟡 Baixo | Rate limit in-memory não compartilhado entre instâncias | `lib/ratelimit.ts` |
| B-08 | 🔵 Info | `pnpm test` / `pnpm test:e2e` não executam suite real | ausência de arquivos de teste |

---

## 5. Plano de Teste Manual Mínimo (smoke test)

**Tempo:** ~15 minutos · **Quem:** Tania (ou Quésia em call)  
**Pré-requisito:** `.env.local` ou preview Vercel com Supabase populado (`pnpm prisma:seed`)

### Checklist

- [ ] **S1 — Login** — Abrir `/login`, entrar com usuário vendedor, ver redirect para `/pipeline` sem erro no console
- [ ] **S2 — Pipeline** — Ver colunas do Kanban Atacado; pelo menos 1 card visível
- [ ] **S3 — Mover deal** — Arrastar 1 card para coluna adjacente; toast de sucesso; card permanece na nova coluna após F5
- [ ] **S4 — Bloqueio tarefa** — Tentar mover deal com tarefa obrigatória pendente; deve aparecer aviso e **não** mover
- [ ] **S5 — Concluir tarefa** — Marcar tarefa como concluída; repetir movimento; deve funcionar
- [ ] **S6 — Novo lead** — `/leads` → Novo Contato → preencher nome + telefone + LGPD → salvar → aparece na lista
- [ ] **S7 — RBAC rápido** — Login atendente varejo: não deve ver contatos B2B na lista
- [ ] **S8 — Webchat** — Abrir `/embed/chat` em aba anônima → preencher formulário → enviar 1 mensagem → sem erro 500
- [ ] **S9 — Operador chat** — Login atendente → `/chat` → ver sessão waiting → responder 1 mensagem
- [ ] **S10 — Política LGPD** — No webchat, clicar link "Política de Privacidade" → **deve abrir página real** (hoje: ❌ esperado falhar)
- [ ] **S11 — Tema** — Alternar dark/light (se toggle existir) → cores legíveis
- [ ] **S12 — Mobile** — Redimensionar para 375px ou celular → menu/drawer acessível
- [ ] **S13 — Logout/sessão** — Limpar cookies → acessar `/pipeline` direto → deve ir para login
- [ ] **S14 — Health** — `GET /api/health` → 200
- [ ] **S15 — Build** — Confirmar último deploy Vercel = success

**Critério de pass:** ≥ 12/15 itens OK; **S10 e S13 são bloqueantes** para go-live com cliente real.

---

## 6. Documentação Atual — Avaliação

| Documento | Existe? | Lê quem nunca viu? | Nota |
|---|---|---|---|
| `crm-app/README.md` | ✅ | Parcial (6 passos setup) | Falta troubleshooting, testes, deploy atualizado |
| `.env.example` | ✅ | Sim | Variáveis documentadas |
| `deployment-handoff.md` (squad output) | ✅ (squad) | Dev experiente | Fora do repo app; path relativo confuso |
| Guia do usuário (Vitor/Amanda) | ❌ | — | Referenciado no handoff, não no app |
| Guia do admin (Renato) | ❌ | — | Settings sem doc |
| ADRs (007, 009, 010) | ✅ (squad `output/2026-05-25/`) | Não linkados no README | Dev não acha sem saber o path |
| Onboarding dev | ❌ | — | Sem CONTRIBUTING.md |
| Política de Privacidade | ❌ | — | **Obrigatória** — link no webchat quebrado |
| `test-report.md` | ⚠️ | Enganoso | Declara 79 testes que não existem no repo |

### Comentários in-code

- Arquivos `lib/*.ts` e rotas API: comentários de cabeçalho **úteis** (propósito da rota).
- Componentes UI: poucos comentários — aceitável se nomes forem claros.
- **Ruído:** nenhum excessivo detectado.

### Veredicto documentação

**Insuficiente para handoff a usuários não-técnicos.** README tira dev do zero até `pnpm dev`, mas não cobre operação, testes nem LGPD publicada.

---

## 7. Riscos LGPD

| Fluxo | Dado pessoal | Base legal | Risco | Artigo |
|---|---|---|---|---|
| Formulário site / public leads | nome, email, phone, IP | Consentimento (checkbox) | Médio — consent ok no schema | Art. 7, I |
| Webchat embed | nome, email, IP, UA, mensagens | Consentimento | **Alto** — política 404 invalida transparência | Art. 8, 9 |
| WhatsApp webhook | telefone, conteúdo msg | Legítimo interesse / consentimento pendente | **Alto** — `lgpdConsent: false` automático | Art. 7 |
| CRM operadores | dados de clientes B2B/B2C | Execução de contrato | Médio — RBAC no código, sem teste | Art. 46 |
| Audit log | ações + userId | Legítimo interesse | Baixo — necessário para segurança | Art. 7, IX |
| Retenção / purge | todos | — | **Médio** — cron `lgpd-purge` existe, nunca validado em prod | Art. 16 |
| Direitos do titular (acesso, exclusão, portabilidade) | — | — | **Alto** — sem UI/API dedicada | Art. 18 |

### Ações LGPD mínimas antes de cliente real

1. Publicar `/politica-de-privacidade` com DPO/contato, finalidades, bases legais, prazo de retenção.
2. Fluxo para operador confirmar consentimento em leads WhatsApp (`pendente-lgpd`).
3. Procedimento documentado para exclusão de titular (usar soft delete + cron purge).
4. Validar que RLS Supabase está ativo em produção (mencionado no test-report, não verificado aqui).

---

## 8. Plano de QA Recomendado

### Stack sugerida

| Camada | Ferramenta | Meta |
|---|---|---|
| Unit | Vitest + happy-dom | Validators, permissions, whatsapp utils |
| Integration | Vitest + Prisma test DB | Rotas API com auth mock |
| E2E | Playwright | 5 fluxos P0 + 15 fluxos P1 |
| A11y | @axe-core/playwright | Login, Kanban, webchat |
| CI | GitHub Actions | lint + typecheck + test em PR |

### Top 20 testes E2E (priorizados)

1. `deve fazer login com email válido e redirecionar para /pipeline`
2. `deve exibir erro ao login com senha incorreta`
3. `deve bloquear acesso a /pipeline sem sessão ativa`
4. `deve criar contato B2C com consentimento LGPD marcado`
5. `deve rejeitar criação de contato sem consentimento LGPD`
6. `deve listar apenas contatos B2B para vendedor_atacado`
7. `deve mover deal entre colunas via drag-and-drop`
8. `deve bloquear deal-stage move quando há tarefa obrigatória pendente`
9. `deve permitir mover deal após concluir tarefa obrigatória`
10. `deve iniciar sessão webchat e enviar primeira mensagem`
11. `deve exibir sessão waiting no inbox do operador`
12. `deve operador responder mensagem no chat interno`
13. `deve abrir política de privacidade em nova aba a partir do embed`
14. `deve processar webhook WhatsApp e criar contato uma única vez (idempotência)`
15. `deve rejeitar webhook WhatsApp com assinatura HMAC inválida`
16. `deve criar lead via POST /api/v1/public/leads com rate limit após 5 req/min`
17. `deve exibir dashboard KPIs para gestor`
18. `deve alternar tema dark sem perder legibilidade do Kanban`
19. `deve abrir menu mobile e navegar para Leads`
20. `deve vendedor receber 403 ao tentar PATCH deal de outro vendedor`

### Estimativa de horas

| Entrega | Horas |
|---|---|
| Config vitest + playwright + 1º teste smoke | 4h |
| 52 unit (validators, permissions, utils) | 12h |
| 22 integration (API) | 16h |
| 20 E2E (lista acima) | 24h |
| CI + test DB Supabase | 6h |
| Docs: guia usuário + política privacidade | 8h |
| **Total** | **~70h** (~2 sprints) |

### Definição de pronto (DoD) — próximas features

- [ ] ≥ 1 teste unit para toda regra em `lib/validators/`
- [ ] ≥ 1 teste integration para toda rota nova em `app/api/`
- [ ] E2E obrigatório se tocar fluxo P0 (tabela seção 2)
- [ ] README ou guia atualizado se mudar UX para Vitor/Amanda
- [ ] Link LGPD funcional se coletar dado pessoal
- [ ] Sem `console.error` novo em logs Vercel 24h pós-deploy

---

## 9. Recomendações Priorizadas

| # | Prioridade | Ação | Esforço |
|---|---|---|---|
| 1 | **P0** | Criar página `/politica-de-privacidade` e corrigir link no webchat | 4h |
| 2 | **P0** | Adicionar `middleware.ts` protegendo `/(dashboard)/*` com Supabase session | 3h |
| 3 | **P0** | Executar smoke test seção 5 e registrar resultados | 15min |
| 4 | **P0** | Commitar suite mínima: 5 E2E P0 + vitest.config + playwright.config | 16h |
| 5 | **P1** | Restringir `postMessage` a origens permitidas (`techmalhas.com.br`) | 1h |
| 6 | **P1** | Validar posse de sessão no POST webchat/messages (token ou fingerprint) | 4h |
| 7 | **P1** | try/catch em `new URL(pageUrl)` na criação de sessão | 30min |
| 8 | **P1** | Escrever guia do usuário (Kanban, leads, tarefas, chat) em `docs/USER_GUIDE.md` | 6h |
| 9 | **P1** | Corrigir README: status deploy, como rodar testes, link ADRs | 1h |
| 10 | **P2** | Migrar rate limit para Upstash/Vercel KV | 4h |

---

## 10. Veredicto Final

### Esse CRM pode ir ao ar com cliente real esta semana?

## **Não** — com ressalvas

| Condição | Status |
|---|---|
| Código core (API, validators, RBAC) | ✅ Estrutura sólida em revisão estática |
| Testes automatizados | ❌ Inexistentes no repo |
| LGPD (política + transparência) | ❌ Link quebrado |
| Proteção de rotas server-side | ❌ Sem middleware |
| Logs produção sem erros | ⚠️ Sem tráfego — não comprova estabilidade |
| Documentação usuário final | ❌ Ausente |

### Caminho para **"Sim com checklist"** (48–72h)

1. ✅ Publicar política de privacidade (P0-1)  
2. ✅ Middleware de auth (P0-2)  
3. ✅ Smoke test 15 itens — mínimo 12/15 pass (P0-3)  
4. ✅ Corrigir B-03, B-04, B-05 (webchat)  
5. ⚠️ Commitar pelo menos E2E 1–5 da lista (login, lead, move, block, webchat)  

Após isso: **Sim com checklist** — cliente piloto limitado (1–2 operadores), monitoramento Vercel diário, sem campanha de tráfego massivo no webchat até E2E completos.

---

*Relatório gerado por Quésia Qualidade · Squad CRM Techmalhas · Opensquad*  
*Evidências: inspeção estática `crm-app/` em 2026-05-25/26, MCP Vercel runtime logs (24h, zero erros), `test-report.md` 2026-05-24 comparado com ausência de arquivos de teste.*
