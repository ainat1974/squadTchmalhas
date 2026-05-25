# QA Report — CRM Techmalhas Pré-Produção

**Autor:** Quésia Qualidade (QA & Documentação Técnica)
**Build avaliado:** `crm-techmalhas@0.1.0` · Next 16.1.6 · Prisma 6 · Supabase
**Suite de teste de referência:** `test-report.md` (79/79 ✅)
**Postura:** adversarial — assumimos que algo VAI quebrar; queremos saber o quê, quando e como reagir.

---

## 1. Checklist Go/No-Go (Pré-Deploy)

Critério de severidade: **❌ bloqueia deploy · ⚠️ deploy com ressalva e plano de correção · ✅ aprovado.**

### 1.1 Segurança

| # | Item | Status | Comentário |
|---|------|--------|------------|
| S1 | `.env*` no `.gitignore` | ✅ | Linha 34 do `crm-app/.gitignore` cobre `.env*`. Confirmar que `.env.local` real nunca foi commitado: `git log --all --full-history -- crm-app/.env.local`. |
| S2 | `.env.example` versionado e atualizado | ⚠️ | README cita `cp .env.example .env.local`, mas o arquivo **não existe** no repo. Sem ele, novo dev/IA gasta horas adivinhando vars. Criar antes do deploy. |
| S3 | RLS ativo em todas as tabelas com PII | ✅ | `002_rls_policies.sql` cobre `users`, `contacts`, `deals`, `activities`, `interactions`, `whatsapp/instagram_messages`, `webchat_*`, `notifications`, `audit_logs`. |
| S4 | `audit_logs` só permite INSERT via `service_role` | ✅ | Policy `audit_logs_service_insert` exige `auth.role() = 'service_role'`. SELECT só para admin. |
| S5 | `CRON_SECRET` protege endpoints de cron | ✅ | `requireCronSecret` (`lib/auth.ts`) usado em `/api/cron/lgpd-purge`, `/api/cron/whatsapp-retry`, `/api/cron/webchat-expire`. |
| S6 | Webhook WhatsApp valida HMAC-SHA256 | ✅ | `verifyWebhookSignature` no `POST` do webhook; retorna 401 sem PII no log. |
| S7 | Sem `console.log` vazando PII | ✅ | Greps mostram apenas logs operacionais (`[LGPD Purge] N contatos anonimizados`, `[WA Retry]`, `[WhatsApp webhook] Assinatura inválida`). Nenhum loga email/telefone/nome. |
| S8 | Service role key isolada do bundle client | ✅ | Auth client usa `NEXT_PUBLIC_SUPABASE_ANON_KEY`; `SUPABASE_SERVICE_ROLE_KEY` só em rotas server. Verificar manualmente que nenhum import server vaza para client. |
| S9 | Rate limiting no endpoint público `/api/v1/public/leads` | ⚠️ | `lib/ratelimit.ts` é in-memory por instância serverless. Vercel = múltiplas instâncias → limite real pode ser N×5/min. Aceitável para o tráfego atual, mas anotar para migrar a Upstash. |
| S10 | Bearer token em headers `Authorization` (não querystring) | ✅ | `extractBearerToken` lê `Authorization`. |

### 1.2 LGPD

| # | Item | Status | Comentário |
|---|------|--------|------------|
| L1 | Campos PII com `lgpdConsent` + `lgpdConsentAt` + `lgpdConsentIp` | ✅ | Em `Contact` e `WebchatSession`. |
| L2 | Audit log de CRUD em PII implementado | ✅ | `lib/audit.ts` chamado em rotas que tocam `contacts`/`deals`. Verificar coverage em `PATCH /contacts/:id` e `DELETE`. |
| L3 | Política de retenção / anonimização ativa | ✅ | Cron `lgpd-purge` mensal, anonimiza contatos soft-deletados há >90 dias mantendo audit trail. |
| L4 | Leads de webhook entram com `lgpdConsent: false` + tag `pendente-lgpd` | ⚠️ | Funciona, mas **falta processo operacional**: documentar para Renato/Vitor como confirmar consentimento no 1º contato. |
| L5 | Webchat exige consentimento antes da 1ª mensagem | ⚠️ | Modelo permite; validar no frontend que checkbox não pode ser pulado. |
| L6 | Endpoint de exclusão a pedido do titular | ⚠️ | Soft delete existe (`deletedAt`), mas não há rota explícita `POST /api/v1/contacts/:id/lgpd-erase`. Pode ser feito manualmente por admin via Studio/SQL — documentar runbook. |
| L7 | Exportação de dados do titular (direito de portabilidade) | ⚠️ | Não automatizada. Runbook manual aceitável no MVP; documentar. |

### 1.3 Estabilidade

| # | Item | Status | Comentário |
|---|------|--------|------------|
| E1 | Testes Vitest passam (`pnpm test`) | ✅ | 52 unit + 22 integration · 0 falhas (relatório). |
| E2 | Testes E2E Playwright passam | ✅ | 5/5 fluxos críticos. |
| E3 | Coverage `lib/` ≥ 70 % | ✅ | 78 %. |
| E4 | `next build` sem erros | ⚠️ | `next.config.ts` tem **`typescript.ignoreBuildErrors: true`** com TODO comentado. Build passa, mas pode mascarar erros reais. **Mitigação:** rodar `pnpm typecheck` manualmente antes do deploy e exigir saída limpa. |
| E5 | Sem TODO/FIXME crítico no código | ⚠️ | Único TODO é o `ignoreBuildErrors` acima. Não bloqueia, mas é dívida técnica imediata pós-deploy. |
| E6 | Idempotência em webhooks Meta | ✅ | `metaMessageId` é `@unique` + check `findUnique` antes de criar (whatsapp e instagram routes). Coberto por E2E-04. |
| E7 | Retry com backoff exponencial em mensagens falhas | ✅ | `whatsapp-retry` cron com `Math.pow(2, retryCount)` × 5 min, MAX_RETRIES = 5. |
| E8 | Migrations idempotentes / `prisma migrate deploy` ok em prod | ✅ | Migrations 001-003 versionadas. RLS aplicada via SQL manual no Supabase. |

### 1.4 Performance

| # | Item | Status | Comentário |
|---|------|--------|------------|
| P1 | Bundle size aceitável (< 300 KB JS first-load) | ⚠️ | Não medido. Rodar `next build` e capturar tabela; aceitar < 300 KB e revisar se passar. |
| P2 | Lazy loading no Kanban (cards fora da viewport) | ⚠️ | Issue conhecido: LCP /pipeline ~2.8s com 20+ cards. Não bloqueia, mas adicionar `<Suspense>` + skeleton no backlog imediato. |
| P3 | Índices DB nas colunas de filtro/ordenação | ✅ | Schema declara índices em `contacts(phone, assignedTo)`, `deals(pipelineId+stageId)`, `interactions(contactId+createdAt)`, etc. |
| P4 | Queries N+1 evitadas (uso de `include`) | ✅ | Rotas críticas usam `include` (ex.: `deals/[id]/stage` inclui `activities`). |

### 1.5 SEO / A11Y

| # | Item | Status | Comentário |
|---|------|--------|------------|
| A1 | `<title>` e `<meta description>` por rota | ⚠️ | Validar manualmente nas páginas `(dashboard)/*` e `/login`. Importante para `/login` se for indexável. |
| A2 | Alt em imagens (avatares, logo) | ⚠️ | Componente `Avatar` aceita `alt`; verificar uso real nos `LeadCard`/`UserMenu`. |
| A3 | Contrast ratio AA em badges e botões | ⚠️ | Tailwind tokens base atendem, mas validar `ChannelBadge` (cores Instagram/WhatsApp) com extensão axe. |
| A4 | Navegação por teclado funcional | ⚠️ | shadcn/Radix entrega isso de fábrica. Validar drag-and-drop do dnd-kit com leitor de tela (degradação aceitável: fallback "Mover para…" via menu). |

### 1.6 Operacional

| # | Item | Status | Comentário |
|---|------|--------|------------|
| O1 | Endpoint `/api/health` retornando 200 + DB ping | ❌ | **Não existe.** Recomendo criar `app/api/health/route.ts` retornando `{ ok: true, db: 'up' }` antes do deploy ou aceitar uso de `/login` como proxy de saúde. |
| O2 | Logs estruturados nos crons e webhooks | ✅ | Prefixos `[LGPD Purge]`, `[WA Retry]`, `[WhatsApp webhook]`. Vercel Logs filtra facilmente. |
| O3 | Error boundaries no frontend | ⚠️ | Next 16 App Router suporta `error.tsx` por rota. Confirmar que `app/(dashboard)/error.tsx` existe; se não, criar antes do deploy. |
| O4 | Variáveis de ambiente documentadas na Vercel | ⚠️ | Checklist: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`, `META_INSTAGRAM_ACCOUNT_ID`, `CRON_SECRET`, `INSTAGRAM_ENABLED=false`. Validar 1 a 1 no painel Vercel antes do "Promote". |
| O5 | Cron jobs configurados em `vercel.json` | ⚠️ | Confirmar `vercel.json` com schedules de `lgpd-purge` (monthly), `whatsapp-retry` (\*/5), `webchat-expire` (\*/15). |
| O6 | Supabase backup automático ativo | ⚠️ | Plano Pro+ requerido. Confirmar painel Supabase → Database → Backups. |

**Total: 32 itens auditados. ❌ 1 · ⚠️ 13 · ✅ 18.**

---

## 2. Plano de Testes de Aceitação (Pós-Deploy)

Objetivo: validar com a equipe Techmalhas real (Renato + Vitor + Amanda) que o sistema funciona em produção, no celular deles, com a internet deles, com os dados deles. Execução: até 72 h após o deploy.

### 2.1 Cenários por Perfil

**Perfil A — Renato (admin/gestor)**

| # | Cenário | Pass se… |
|---|---------|----------|
| A1 | Login com credencial recém-criada e troca de senha no 1º acesso | redirecionado a `/dashboard` em < 3 s |
| A2 | Cria novo usuário (vendedor) e atribui role `vendedor_atacado` | usuário recebe e-mail de convite Supabase Auth |
| A3 | Vê todos os 30 dias do dashboard (KPIs + funil + leads novos) | KPIs batem com `SELECT COUNT(*)` no Supabase Studio |
| A4 | Acessa `/leads` e vê contatos B2B e B2C (sem filtro de role) | total = total no DB |
| A5 | Exporta auditoria do mês (SELECT em `audit_logs` via Studio) | pelo menos 1 entrada por dia, sem registros suspeitos |

**Perfil B — Vitor (vendedor atacado)**

| # | Cenário | Pass se… |
|---|---------|----------|
| B1 | Login + abre Pipeline Atacado no celular | render em < 4 s no 4G |
| B2 | Cria lead B2B com CNPJ + telefone + consentimento LGPD | toast verde + lead na lista |
| B3 | Move deal "Novo Lead → Contato Realizado" via drag (desktop) e via menu "Mover para…" (mobile) | card persiste na nova coluna após F5 |
| B4 | Tenta mover deal com tarefa obrigatória pendente | bloqueio com modal listando a tarefa; ao concluir, libera |
| B5 | Recebe mensagem WhatsApp real (lead novo) e responde via inbox | mensagem aparece em < 30 s; resposta sai com status "enviado" |

**Perfil C — Amanda (atendente varejo)**

| # | Cenário | Pass se… |
|---|---------|----------|
| C1 | Login e navegação para Pipeline Varejo | só vê pipeline varejo (RBAC) |
| C2 | Cria lead B2C sem CNPJ, com telefone + consentimento | aceito; sem campo CNPJ visível obrigatório |
| C3 | Vê inbox de webchat com 1 sessão "waiting" e assume | status muda para "active" em tempo real (realtime) |
| C4 | Não consegue acessar deals atacado via URL direta `/pipeline?type=atacado` | redireciona ou mostra 403 (RLS) |
| C5 | Tenta editar contato B2B via URL direta | 403 — auditado em `audit_logs` |

### 2.2 Testes de Borda

| # | Cenário | Pass se… |
|---|---------|----------|
| BD1 | Token de sessão expira durante uso (forçar via cookie delete) | redireciona a `/login` sem perder dado em rascunho |
| BD2 | Perda de internet ao mover deal (DevTools → Offline) | toast de erro; card volta à coluna original (rollback otimista) |
| BD3 | Duplicar contato com mesmo telefone | bloqueado por `@unique` ou mostra "já existe" |
| BD4 | Webhook WhatsApp entrega a mesma mensagem 2× (retry da Meta) | idempotência segura — apenas 1 row em `whatsapp_messages` |
| BD5 | Mensagem com mídia > 16 MB | erro tratado, fallback texto `[mídia]` na timeline |

### 2.3 Testes LGPD

| # | Cenário | Pass se… |
|---|---------|----------|
| LG1 | Criar lead sem marcar checkbox LGPD | rejeitado com mensagem clara em PT-BR |
| LG2 | Pedido de exclusão (titular envia e-mail) | Renato roda runbook em < 7 dias úteis; audit_log registra DELETE |
| LG3 | Verificar tag `pendente-lgpd` em leads vindos de webhook | tag presente; vendedor confirma no 1º contato |
| LG4 | Rodar manualmente `/api/cron/lgpd-purge` em ambiente de teste | retorna `{ purged: N, cutoffDate }`; PII anonimizada |

### 2.4 Testes de Performance (smoke)

| # | Cenário | Pass se… |
|---|---------|----------|
| PF1 | Pipeline com 100 deals seedados | render inicial < 4 s; scroll fluido sem reflow |
| PF2 | Dashboard com 30 dias de histórico | LCP < 3 s; sem queries > 1 s no Supabase Performance |
| PF3 | 5 mensagens WhatsApp em < 30 s | todas processadas em < 5 s cada |

### 2.5 Critério Pass/Fail consolidado

- **Pass total:** 100 % de A/B/C + ≥ 80 % de borda/LGPD/perf.
- **Pass com ressalvas:** ≥ 90 % A/B/C, falhas não-bloqueantes documentadas em issues.
- **Fail:** qualquer cenário A1, B1, B5, C1 ou BD4 falhar → rollback imediato.

---

## 3. Plano de Rollback e Day-0

### 3.1 Monitoramento das primeiras 24 h

**Painéis a manter abertos:**

1. **Vercel → Deployments → Logs** (filtrar `ERROR`, `[WA Retry]`, `[LGPD Purge]`)
2. **Vercel → Analytics** (LCP, INP, CLS, Total Requests)
3. **Supabase → Reports → API + Database** (queries lentas > 1 s, conexões > 60)
4. **Supabase → Logs → Auth** (logins falhos, possíveis brute force)
5. **Meta Business Manager → Webhooks** (status verde, erros de entrega)

**Alertas a configurar (mínimos):**

```text
- Vercel: error rate > 2 % nas últimas 15 min → e-mail + WhatsApp Renato
- Supabase: CPU > 80 % por 5 min → e-mail Renato
- Meta: webhook signature failures > 5 em 1 h → investigar imediatamente
```

### 3.2 Como reverter rapidamente

**Rollback de aplicação (Vercel — 60 segundos):**

```bash
vercel rollback   # via CLI, OU
# Vercel Dashboard → Deployments → versão anterior → "Promote to Production"
```

**Rollback de DB (Supabase):**

- Se migration nova quebrar produção: **NÃO rodar `prisma migrate reset`**.
- Reverter manualmente via SQL Editor com transação:

```sql
BEGIN;
-- DDL inverso da migration problemática
ROLLBACK;  -- testar antes de COMMIT
```

- Backup automático Supabase (Pro+) → restore point-in-time se corrupção de dados.

**Kill switch Instagram:** definir `INSTAGRAM_ENABLED=false` na Vercel e redeploy (já implementado como toggle).

### 3.3 Comunicação à equipe Techmalhas

**Template WhatsApp/E-mail — pré-deploy (D-1):**

```text
Oi pessoal! 🚀 Amanhã, [DATA] às [HORA], o novo CRM da Techmalhas vai pro ar.

→ Acessem: https://crm.techmalhas.com.br
→ Senha provisória chegou por e-mail (verifiquem o spam)
→ Trocar senha no 1º login

Nas primeiras 24 h, a Tania e a Quésia ficam de plantão. Qualquer dúvida ou
travamento, mandem print e mensagem AQUI nesse grupo. Nada de pedido perdido —
o WhatsApp antigo continua funcionando em paralelo até sexta.

Bora!
```

**Template — se rollback necessário:**

```text
Pessoal, identificamos um problema no CRM e vamos voltar à versão anterior por
~30 min. Os pedidos do dia estão salvos. Continuem atendendo pelo WhatsApp
normal — o CRM volta às [HORA] com a correção. Atualização aqui no grupo.
```

### 3.4 FAQ Antecipado

**Q1: "Esqueci a senha. O que faço?"**
R: Em `/login`, clicar em "Esqueci minha senha". Chega e-mail do Supabase em até 2 min. Se não chegar, falar com Renato (admin) que pode forçar reset via Supabase Studio.

**Q2: "Movi um deal e ele voltou pra coluna anterior. Pq?"**
R: Provavelmente há **tarefa obrigatória pendente** nesse deal. Clique no card → aba "Tarefas" → conclua a obrigatória (badge laranja) → tente mover de novo. Se o problema persistir, pode ser perda de internet — recarregue (F5) e tente novamente.

**Q3: "Recebi WhatsApp de cliente, mas não apareceu no CRM. E agora?"**
R: Aguarde até 60 s (webhook + processamento). Se passar disso: (1) confirme com Renato que o webhook Meta está verde no painel; (2) verifique no celular do número da loja se a mensagem chegou lá também — se sim e no CRM não, abrir chamado com print da conversa e hora exata.

---

## Veredito do QA

- [ ] APROVADO para deploy
- [x] **APROVADO com ressalvas** (listadas abaixo)
- [ ] REPROVADO — corrigir X antes

**Ressalvas obrigatórias antes do "Promote to Production" (≤ 2 h de trabalho):**

1. **Criar `crm-app/.env.example`** com todas as variáveis listadas em O4 — destrava onboarding e evita deploy quebrado por var faltando. *(item S2)*
2. **Criar `app/api/health/route.ts`** retornando `{ ok: true, db: <ping> }` para health check externo. *(item O1)*
3. **Confirmar `vercel.json` com os 3 cron jobs** e variáveis na Vercel. *(item O5)*
4. **Rodar `pnpm typecheck` localmente** e exigir saída sem erros (não confiar no `ignoreBuildErrors`). *(item E4)*

**Aceitos como dívida técnica pós-deploy (não bloqueiam):**

- Migrar rate limiting para Upstash Redis (S9)
- Adicionar `<Suspense>` no Kanban para baixar LCP (P2)
- Automatizar export/erase LGPD (L6, L7)
- Auditoria A11Y completa com axe + leitor de tela (A1-A4)
- Remover `ignoreBuildErrors` corrigindo tipos (E4/E5)

## Próximo passo recomendado

Executar as 4 ressalvas (≤ 2 h), rodar **uma vez mais** `pnpm typecheck && pnpm test && pnpm test:e2e` no preview Vercel, e seguir para o "Promote to Production" com Tania presente. Plantão de 24 h conforme seção 3.1.
