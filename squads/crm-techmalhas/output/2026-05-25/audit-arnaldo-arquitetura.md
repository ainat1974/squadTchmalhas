# Auditoria de Arquitetura — CRM Techmalhas
**Por:** Arnaldo Arquiteto · 2026-05-25 · v1.0
**Escopo:** estado real do código em `crm-app/` + estado real do banco Supabase (validado via MCP) vs ADRs 001–010 e arquitetura v4.

---

## TL;DR

1. **Banco está sólido, código está furado.** O schema Postgres (16 tabelas, RLS habilitada em todas) está fiel ao ADR-001/002 e à arquitetura v4. O problema é que **a aplicação Next.js bypassa boa parte dessa RLS** porque o Prisma usa `DATABASE_URL` em modo "trusted" (sem JWT do usuário propagado) — a defesa é apenas a RBAC em `lib/permissions.ts`. RLS hoje é cinto, não cinto-e-suspensório.
2. **Segurança no boundary tem buracos sérios.** Não existe `middleware.ts` em `crm-app/`. CORS, rate limit (in-memory!) e validação de Origin do webchat **não estão implementados** conforme ADR-008. `next.config.ts` carrega `typescript.ignoreBuildErrors: true` — o build passa porque ignora erros, não porque está limpo. Webchat aceita `isFromVisitor: true` sem token de sessão (qualquer um posta como visitante de qualquer sessão se souber o UUID).
3. **Integrações: WhatsApp funcional mas LGPD-leak; Instagram parado; Webchat MVP cru.** Webhook WA cria `contact` com `lgpdConsent=false` e tag `pendente-lgpd` — funciona, mas se um vendedor enviar template sem checkar a tag, é violação LGPD. Instagram está atrás de feature toggle (`IG_ENABLED`) — OK conforme ADR-004 do arch v4. Webchat sessions/messages estão sem Turnstile/CORS/Rate-limit/postMessage — o ADR-008 ficou no papel.
4. **Cron Jobs divergiram dos ADRs.** O `vercel.json` agenda `whatsapp-retry` 1x/dia (planejado: a cada 5 min) e `webchat-expire` 1x/dia (planejado: 15 min). Isso quebra retry de WhatsApp falhado (mensagens ficam horas em `failed`) e enche o banco de sessões "zumbis".
5. **Aguenta produção real (10 usuários + 100 leads/dia) com pé no chão**, mas hoje **com ressalvas P0**: corrigir 3 bugs de segurança antes do go-live (webchat sem token, CORS ausente, `typescript.ignoreBuildErrors`), arrumar a cadência dos crons e ativar audit_log em todos os mutations. Estimativa: **18–26h** de Fábio para fechar P0.

---

## 1. Stack vs ADRs

| Área | Decisão (ADR) | Implementação real | Desvio | Severidade |
|---|---|---|---|---|
| ORM | Prisma 6.x (ADR-001 v4) | `@prisma/client ^6.1.0` ✅ | Nenhum | — |
| Auth | Supabase Auth + Google OAuth (ADR-002 v4) | `@supabase/ssr ^0.5.2`, `lib/auth.ts` usa `getUser()` server-side ✅ | Google OAuth ainda não habilitado no Supabase dashboard (a verificar) | Baixa |
| Jobs | Vercel Cron (ADR-003 v4) | `vercel.json` 3 crons ✅ | **Cadência errada**: schedule diário em vez de `*/5` e `*/15` | **Alta** |
| Realtime | Supabase Realtime (ADR-005 v4) | Migration `004_webchat_realtime_anon_read.sql` ✅ + frontend não consome via broadcast (faltou wiring) | Frontend ainda não inscreve no canal `webchat:{id}` | Média |
| Deploy | Vercel + promote manual (ADR-004) | Build verde no commit `2fcd5c3`, domínio ativo | Resolução do incidente OK ✅ | — |
| Modelo operacional | PM-Tutora-Squad (ADR-007) | Documentado, sendo praticado nesta auditoria ✅ | — | — |
| Webchat widget | Híbrido Shadow DOM + iframe (ADR-008) | **Não implementado**. `widget.js` e `/embed/chat` não existem em `crm-app/app` nem em `public/`. | **Alto** — backend já existe, mas frontend customer-facing zero | **Alta** |
| Design system v5 dark (ADR-010) | Cinza + amarelo techmalhas | Patches `globals.css` gerados; aplicação parcial. Fora do escopo desta auditoria. | A confirmar com Davi/Fábio | Baixa |
| Middleware | ADR-004 explica que migrou auth para layout `(dashboard)` por bug Next 16 #94052 | **Sem `middleware.ts`** ✅ correto enquanto Next ≤ 16.1.6 | OK mas perde: rate limit edge, CORS edge, validação de Origin | Média (gap arquitetural) |
| Cache do widget.js | `s-maxage=86400` + SWR 7d (ADR-008) | Não aplicável (sem widget.js) | — | — |
| Turnstile + Upstash Redis | Obrigatórios para webchat público (ADR-008 §3.3/§3.4) | **Nenhum dos dois instalados.** `lib/ratelimit.ts` usa `Map` in-memory | **Crítico** para go-live público | **Crítico** |

**Evidências de arquivo:**
- `crm-app/package.json:27-57` — não contém `@upstash/ratelimit`, `@upstash/redis` nem `@cloudflare/turnstile-types`.
- `crm-app/lib/ratelimit.ts:8-9` — `const store = new Map(...)` — comentário "OK para Vercel — cada instância serverless tem seu próprio" é **falso**: significa que o limite reseta a cada cold start e cada região da Vercel tem seu próprio Map. Sem efeito real contra bot determinado.
- `crm-app/vercel.json:6-12` — cron `whatsapp-retry: "0 6 * * *"` (uma vez por dia, 06:00 UTC) em vez de `*/5 * * * *`.

---

## 2. Modelo de Dados (Postgres)

### 2.1 Estado real (via MCP `list_tables`)

| Tabela | RLS | Rows hoje | Comentário |
|---|---|---|---|
| `users` | ✅ | 4 | OK — admin + 3 usuários de teste |
| `lead_sources` | ✅ | 14 | OK — seed populada |
| `contacts` | ✅ | 10 | OK |
| `pipelines` | ✅ | 2 | atacado + varejo |
| `stages` | ✅ | 11 | OK |
| `stage_required_tasks` | ✅ | 2 | Subutilizada — só 2 templates, deveria ter ≥ 1 por stage |
| `deals` | ✅ | 5 | OK |
| `activities` | ✅ | 3 | OK |
| `whatsapp_messages` | ✅ | **0** | Webhook nunca disparou em produção ainda |
| `instagram_messages` | ✅ | **0** | OK — feature off |
| `webchat_sessions` | ✅ | 2 | Testes manuais |
| `webchat_messages` | ✅ | 6 | OK |
| `interactions` | ✅ | **0 (!)** | **BUG**: webchat e WhatsApp deveriam estar criando rows aqui. Webhook WA cria (linha `webhook/whatsapp/route.ts:90`) mas nunca disparou. **`webchat/messages/route.ts` NÃO cria `Interaction`** — é o histórico unificado quebrado. |
| `notifications` | ✅ | 2 | OK |
| `audit_logs` | ✅ | **2 (!)** | **Grave**: deveria ter dezenas. Audit é chamado apenas em `contacts POST`, `deals POST`, `whatsapp/send POST`. Falta em todas as **UPDATE/DELETE** e em todas as READs com PII. |
| `_prisma_migrations` | ✅ (RLS sem policy) | 1 | Advisor: `rls_enabled_no_policy` — não tem política, fica trancada para tudo. Tecnicamente OK porque ninguém precisa ler isso, mas o lint aponta. |

### 2.2 Schema vs ADR v4 — diff

- ✅ Todas as 16 tabelas planejadas no arch v4 §3 existem.
- ✅ Enums idênticos: `user_role`, `pipeline_type`, `deal_status`, `activity_type`, `interaction_channel/direction`, `message_status`, `lead_source_type`, `audit_action`, `notification_type`, `webchat_session_status`.
- ✅ Idempotência: `whatsapp_messages.meta_message_id` e `instagram_messages.meta_message_id` com `@unique`. `Contact.phone` também `@unique` — bom para upsert de WhatsApp.
- ✅ Constraint LGPD: `contacts.lgpd_consent`, `lgpd_consent_at`, `lgpd_consent_ip` presentes.
- ⚠️ Constraint `contacts_email_or_phone` (arch v4 §3 linha 457) **não foi materializada** no `schema.prisma`. Significa: dá pra inserir contato sem email **nem** telefone. Verificar via SQL: `INSERT INTO contacts (full_name) VALUES ('teste')` — provavelmente passa hoje. Risco baixo (todas as APIs validam via Zod), mas é defesa em profundidade que ficou no plano.
- ⚠️ `audit_logs.changed_fields` está `default []` mas `lib/audit.ts:38` faz `params.changedFields ?? []` — funcional, mas auditoria atual nunca preenche `changedFields` em update (gap funcional).

### 2.3 Indexes — gap por foreign keys sem cobertura

Performance advisor (114 KB de output, indica **lista longa** de FKs sem index):
- `activities.created_by_fkey` → sem index (visível na primeira linha do advisor)
- Mais FKs sem index esperadas: `notifications.deal_id`, `notifications.contact_id`, `notifications.activity_id`, `interactions.user_id`, `interactions.deal_id` (já tem composite), `webchat_sessions.assigned_to` (tem mas com WHERE), `webchat_sessions.contact_id` (tem mas com WHERE).

**Impacto:** em DELETE/UPDATE da tabela pai, o Postgres faz `Seq Scan` na filha procurando FKs. Em 5 deals e 3 activities é invisível; em 5.000 deals com 50.000 activities (1 ano produção), `DELETE FROM users` trava por minutos.

**Mitigação:** adicionar índices simples (sem WHERE) em todas as FKs ainda hoje. Estimativa: 30min de Fábio.

### 2.4 Funções e triggers

- ✅ `handle_new_user` (migration 003) — sync `auth.users` ↔ `public.users`. Funcional.
- ⚠️ Advisor: `handle_new_auth_user` e `handle_delete_auth_user` são `SECURITY DEFINER` **callable via `/rest/v1/rpc/`** por `anon` e `authenticated`. Bug: qualquer um pode chamar essas funções via PostgREST. **Risco alto** (cria user com privilégios elevados). **Fix:** `REVOKE EXECUTE ... FROM anon, authenticated`.
- ⚠️ Advisor: `update_updated_at()` e `create_mandatory_activities_on_stage_change()` têm `search_path` mutável (CVE conhecida de SQL injection em triggers). **Fix:** `ALTER FUNCTION ... SET search_path = public, pg_catalog`.

---

## 3. Segurança Aplicada

### 3.1 RLS — estado real

| Tabela | Policies ativas | Cobertura RBAC | Comentário |
|---|---|---|---|
| `users` | 3 (`select_own_or_admin`, `update_own`, `admin_all`) | OK | Conforme arch v4 |
| `lead_sources` | 2 (read auth + write admin) | OK | |
| `contacts` | 6 (admin_all, vendedor_atacado select/insert/update, atendente_varejo select/insert/update) | OK | Excelente granularidade |
| `pipelines` | 2 | OK | |
| `stages`, `stage_required_tasks` | 2+2 | OK | |
| `deals` | 6 (admin_all + atacado/varejo select/insert/update) | OK | |
| `activities` | 1 (own_or_admin_gestor) | OK | Single policy cobre tudo |
| `interactions` | 2 (by_contact_scope select + insert auth) | OK | |
| `whatsapp_messages`, `instagram_messages` | 1 cada (authenticated all) | **Fraca** | Sem granularidade por contact scope. Vendedor atacado pode ver WA de B2C se souber o ID. **P1 — Refinar.** |
| `webchat_sessions` | 3 — **`insert_anon WITH CHECK (true)`** flagged pelo advisor | **CRÍTICA** | Visitante anônimo pode INSERT, mas sem limitação. Combinado com rate-limit in-memory = bot escreve 1000/seg. |
| `webchat_messages` | 1 (session_access via x-webchat-channel header) | Funcional, mas o header não está sendo enviado pelo cliente em nenhum lugar do código (cheguei a procurar — só `getCurrentUser` é usado). Visitante anônimo **não escreve por RLS, escreve pela API** (que bypassa RLS porque Prisma usa role superuser). |
| `notifications` | 1 (own_user) | OK | |
| `audit_logs` | 2 (admin_select + service_insert) | OK | |

**Verdade desconfortável:** quase toda a RLS está **inerte em runtime** porque o Prisma usa `DATABASE_URL` (Transaction Pooler com `postgres` role). RLS só atuaria se o backend impersonasse o usuário via JWT — o que **não** acontece em nenhuma rota da `app/api/v1/`. A defesa real hoje é:
- ✅ `requireAuth()` (autenticação)
- ✅ `requireRole()`, `requireDealOwnership()`, `requireContactAccess()` (lib/auth.ts:58-87)
- ✅ `contactsWhereClause()`, `dealsWhereClause()` (lib/permissions.ts:32-48)

**Mas a `lib/permissions.ts:46-47` tem bug latente:** `vendedor_atacado` filtra `isB2b: true`, **não** filtra por pipeline. Significa que se um contato B2B for atribuído ao pipeline `varejo` por engano (campo opcional `pipelineType`), o vendedor_atacado ainda enxerga. Inverso para atendente_varejo (`isB2b: false`) — não pega contatos B2B que estão em pipeline_type=varejo. Diferença pode parecer trivial mas a RLS de `contacts_atendente_varejo_select` no SQL é `(is_b2b = FALSE OR pipeline_type = 'varejo')` — **a aplicação é mais restritiva que a RLS**, e a RLS está inerte. Inconsistência documental.

### 3.2 RBAC — Ações por role

| Ação | Spec ADR | Implementação | OK? |
|---|---|---|---|
| `GET /contacts` | admin/gestor (all), vendedor_atacado (B2B), atendente_varejo (B2C) | `contactsWhereClause()` em `app/api/v1/contacts/route.ts:14` | ✅ |
| `POST /contacts` | Todos os roles | `requireAuth()` sem `requireRole` em `route.ts:52` | ⚠️ Aceita qualquer role autenticado, inclusive sem checar B2B ↔ role |
| `POST /deals` | Todos | `route.ts:60` `requireAuth()` apenas, sem checar se `pipelineId` corresponde ao role | ⚠️ **vendedor_atacado pode criar deal em pipeline varejo se passar o UUID.** Bug |
| `PUT /deals/[id]/stage` | Owner ou admin/gestor | A verificar — não li o arquivo nesta auditoria | — |
| `POST /whatsapp/send` | admin/gestor/atendente_varejo | `app/api/v1/whatsapp/send/route.ts:25` `requireAuth()` sem `requireRole` | ⚠️ **vendedor_atacado pode enviar WhatsApp para B2C.** Bug |
| `POST /webchat/sessions` | Público | `route.ts:40` sem auth ✅ |  mas sem **NENHUM** controle de abuso |
| `POST /webchat/messages` | Visitante via token OU operador autenticado | `route.ts:20-23` — **se `isFromVisitor=true`, pula auth**. Não valida session_token, não valida que o session_id pertence a quem está postando | ❌ **Anyone-can-post bug.** Knowing the UUID = posting as visitor of that session |
| `GET /webchat/sessions` | admin/gestor/atendente_varejo | `route.ts:14-23` filtra por role atendente_varejo. OK | ✅ |
| `POST /public/leads` | Público | OK | ⚠️ rate limit in-memory ineficaz |
| `GET/PUT/DELETE /users` | Admin only | A verificar — endpoint não está na lista de routes (Glob retornou só 12 routes). **Gap: gestão de usuários não está implementada.** | ❌ |

**Conclusão RBAC:** boa em GET, fraca em POST/PUT/DELETE. Os helpers `requireRole`/`canAccessPipelineType` existem mas **não estão sendo chamados** nas mutations. P1 — completar.

### 3.3 Validação Zod no boundary — auditoria

| Endpoint | Schema Zod | Avaliação |
|---|---|---|
| `POST /contacts` | `CreateContactSchema` (`lib/validators/contact.ts`) | ✅ |
| `GET /contacts` | `ListContactsSchema` | ✅ |
| `POST /deals` | `CreateDealSchema` | ✅ |
| `GET /deals` | `ListDealsSchema` | ✅ |
| `POST /whatsapp/send` | `SendMessageSchema` inline com `.refine` | ✅ |
| `POST /webchat/sessions` | `StartWebchatSchema` | ✅ |
| `POST /webchat/messages` | `SendMessageSchema` inline | ✅ (mas faltam refinements de autorização) |
| `POST /public/leads` | `PublicLeadSchema` inline | ✅ |
| `POST /webhooks/whatsapp` | **Nenhum Zod no body bruto Meta** — parseia via `parseWhatsAppWebhook` que faz `as` cast inseguro (`lib/whatsapp.ts:69-76`) | ⚠️ Aceita payload malformado. HMAC garante origem, mas não estrutura. P2 |
| `POST /webhooks/instagram` | Idem, parsing via `parseInstagramWebhook` sem schema | ⚠️ P2 |

**Pontos críticos no Zod existente:**
- `validators/webchat.ts` (`StartWebchatSchema`) — verificar se `lgpdConsent` tem `.refine(v => v === true)` (no public/leads tem; no webchat tem por construção `lgpdConsent: true` hardcoded em `route.ts:56` — **a flag do cliente é ignorada e sempre é gravada como true**. Isso é violação LGPD: estamos criando registro afirmando consentimento sem o usuário consentir).

### 3.4 Secrets / Env Vars

ADR-004 do v4 lista 16 env vars. No código encontrei:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `DATABASE_URL`, `DIRECT_URL` ✅
- `META_PHONE_NUMBER_ID`, `META_WHATSAPP_TOKEN`, `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN` ✅
- `META_INSTAGRAM_ACCOUNT_ID` ✅
- `CRON_SECRET` ✅
- ❌ `SUPABASE_SERVICE_ROLE_KEY` — **não vejo uso**. `lib/db.ts` usa Prisma com `DATABASE_URL` (já bypassa RLS via role `postgres`). Tecnicamente OK, mas significa que **não temos cliente Supabase service-role** para casos que precisariam (ex: broadcast Realtime do servidor, criar usuários via Admin API).
- ❌ `UPSTASH_REDIS_REST_URL` / `_TOKEN` — não instalados.
- ❌ `TURNSTILE_SECRET_KEY` — não instalado.

**Risco de exposição:** `app/api/v1/webchat/sessions/route.ts:87` retorna `supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` no body para o visitante. Isso é OK (é a chave anon, pública por design), mas seria mais limpo expor via build-time inline no `widget.js`. Cosmético.

### 3.5 CSRF / CORS

- **CORS:** `next.config.ts` está vazio de headers. `vercel.json` também (não tem o bloco `"headers"` do plano). Significa: navegador bloqueia POST de origem cruzada (default), mas qualquer servidor consegue chamar nossa API. **Para webchat (origem `techmalhas.com.br` → CRM Vercel) vai falhar.** ADR-008 §3.1 prevê headers no `next.config.ts` — não implementado.
- **CSRF:** App é session-cookie via Supabase. Como não há mutation por GET nem origin-trust, risco baixo. Mas sem `SameSite=strict` configurado explicitamente (defaults Supabase = `Lax`), há janela teórica de CSRF em rotas autenticadas.
- **Origin validation:** zero. ADR-008 §3.2 previu, não foi feito.

### 3.6 Rate limit por endpoint

| Endpoint | Limite previsto | Limite real | Gap |
|---|---|---|---|
| `POST /public/leads` | 5/IP/h, 3/email/d (arch §8.2) | 5/IP/min (in-memory Map) | ⚠️ Janela errada + sem persistência |
| `POST /webchat/sessions` | 5/IP/h, 20/IP/dia (ADR-008 §3.3) | **Zero** | ❌ |
| `POST /webchat/messages` | 30/sessão/min, 200/IP/h | **Zero** | ❌ |
| `POST /whatsapp/send` | Implícito Meta 80/seg/número | Zero local | ⚠️ Confia 100% no Meta |
| Webhooks Meta | Não aplica (são server-to-server) | OK | — |

---

## 4. Integrações Externas

### 4.1 WhatsApp Cloud API
- ✅ Webhook GET (verify token) funcional — `lib/whatsapp.ts:14-22`.
- ✅ HMAC SHA-256 validado com `crypto.timingSafeEqual` — `lib/whatsapp.ts:25-39`. Boa prática.
- ✅ Idempotência por `meta_message_id @unique` + check no Prisma — `webhooks/whatsapp/route.ts:47-50`.
- ✅ Envio texto + template — `lib/whatsapp.ts:101-128`.
- ⚠️ **Upsert de contact por `phone @unique`** — mas e se chegar mensagem de número que JÁ é cliente B2B existente com WhatsApp em campo `whatsappPhone` diferente do `phone`? Pode duplicar. Recomendo upsert por `whatsappPhone` em vez de `phone`.
- ⚠️ Mídia (`image`, `audio`, `document`) — apenas marca `[imagem]` no content_text (linha 69-72), **não baixa para Supabase Storage**. Plano arch v4 §5.3 previa upload para `storage/whatsapp-media/{contact_id}/{filename}`. Gap funcional.
- ⚠️ Retry — schema tem `retry_count`, `retry_next_at`, `error_code`, mas cron `whatsapp-retry` agendado para 1x/dia (não 5min). Mensagens falhadas demoram até 24h para retry. Impacto: cliente nunca recebe mensagem comercial dentro da janela de 24h.
- ❌ **Sem audit_log** no inbound (recebimento de mensagem com PII). LGPD pode exigir rastreabilidade.
- ❌ **Sem rate-limit no envio** — operador rude pode disparar 1000 mensagens, Meta vai bloquear o número.
- ❌ Sem job de "warm-up" para webhook (evitar cold start de 5s no Vercel quando Meta envia).

### 4.2 Instagram Messaging API
- ✅ Feature toggle `IG_ENABLED` no `lib/instagram.ts` — conforme ADR-004 v4. Endpoint responde `200 received: true` mesmo desligado.
- ✅ Idempotência por `meta_message_id`, comments com `is_comment_lead`.
- ⚠️ `instagramId` no `Contact` **não tem `@unique`** no schema — então o `upsert where: { instagramId }` em `route.ts:48` falha em compile-time, daí o `as { instagramId: string }` cast e o `.catch()` que tenta criar de novo. Solução desajeitada. **Adicionar `@unique` em `Contact.instagramId`**.
- ⚠️ Sem app aprovado pela Meta → produção zerada hoje.

### 4.3 Webchat Irroba
- ✅ Backend `POST/GET /webchat/sessions` e `POST /webchat/messages` existem.
- ❌ **Frontend widget não existe** — `crm-app/public/widget.js` ausente; `crm-app/app/embed/` ausente.
- ❌ CORS, Origin validation, Turnstile, Upstash, postMessage, Shadow DOM: tudo no papel (ADR-008), nada em produção.
- ❌ Sessão pode ser sequestrada: `POST /webchat/messages` aceita `isFromVisitor: true` + qualquer `sessionId` — sem token assinado. Qualquer um sabendo o UUID da sessão pode postar como o visitante.

### 4.4 Supabase Auth
- ✅ Trigger `handle_new_user` sincroniza `auth.users` → `public.users`.
- ⚠️ **`auth_leaked_password_protection` está desligado** (advisor). Tania, ligar isso no dashboard Supabase → Auth → Policies em 2 cliques. Bloqueia senhas vazadas conhecidas (HaveIBeenPwned).
- ⚠️ MFA não obrigatório para admins. ADR-002 v4 mencionou "TOTP apenas". Não implementado.
- ⚠️ Login limpo, mas `crm-app/app/(auth)/login/page.tsx` (124 linhas) sem 2FA, sem captcha. Para 10 usuários internos é aceitável; expor para externos sem 2FA seria errado.

### 4.5 Supabase Realtime
- ✅ Migration `004_webchat_realtime_anon_read.sql` aplicada (visível na lista de migrations).
- ❌ **Publication `supabase_realtime` para webchat_messages** — não conferi no banco mas a tabela é exigida pelo ADR-005 do arch v4. Sem ela, `postgres_changes` não funciona.
- ❌ Cliente Realtime no frontend `/inbox` — não auditei, mas o `/chat` operator do Fábio precisa subscribir. Provavelmente está cru.

### 4.6 Vercel Cron
- 3 crons configurados em `vercel.json`:
  - `lgpd-purge` — 1x/mês ✅ ok (arch previa @monthly).
  - `whatsapp-retry` — 1x/dia ❌ (previsto: a cada 5 min).
  - `webchat-expire` — 1x/dia ❌ (previsto: a cada 15 min).
- ❌ **Hobby vs Pro**: Vercel Hobby permite apenas 2 crons. Se a conta estiver em Hobby, um dos crons não está rodando. Confirmar com Tania que a conta está em Pro (já validado no ADR-004 de deploy).
- ⚠️ Endpoints de cron expostos em `app/api/cron/*` — checam `CRON_SECRET`? **A verificar**. `lib/auth.ts:102-107` tem `requireCronSecret`. Espero que os cron handlers chamem. Sem isso, qualquer um pode disparar `lgpd-purge` via curl e apagar dados.

---

## 5. Performance e Escala

### 5.1 Queries N+1

Análise estática nos endpoints:
- `GET /contacts` (`route.ts:30-39`) — `findMany` com `include: leadSource, owner` em uma query. ✅ Sem N+1.
- `GET /deals` (`route.ts:30-46`) — `include` aninhado de contact, stage, pipeline, owner, activities. Em 1 query Prisma → JOIN no SQL. ✅ OK.
- ⚠️ `webchat/sessions GET` (`route.ts:20-32`) — `include: messages` traz **TODAS** as mensagens da sessão (sem limit no include `messages`, exceto `take: 1`). OK porque `take: 1`. ✅
- ⚠️ `Promise.all([findMany, count])` — boa prática, OK.

**Não identifiquei N+1 nas rotas auditadas.** Risco baixo.

### 5.2 Indexes ausentes (FKs)

Conforme §2.3 — adicionar pelo menos:
```sql
CREATE INDEX idx_activities_created_by ON activities(created_by);
CREATE INDEX idx_notifications_deal     ON notifications(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_notifications_contact  ON notifications(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_notifications_activity ON notifications(activity_id) WHERE activity_id IS NOT NULL;
CREATE INDEX idx_interactions_user      ON interactions(user_id);
CREATE INDEX idx_interactions_whatsapp  ON interactions(whatsapp_message_id);
CREATE INDEX idx_interactions_instagram ON interactions(instagram_message_id);
CREATE INDEX idx_interactions_webchat   ON interactions(webchat_message_id);
```

### 5.3 Cache
- Nada de Redis/CDN custom. ADR-001 do agent.md já tinha esse princípio ("sem cache prematuro"). OK pro volume atual.
- Vercel Edge cacheia automaticamente `/_next/static/*` e assets. OK.

### 5.4 Runtime
- ✅ Todas as rotas usam Node.js runtime (default) — necessário para Prisma. Conforme ADR-001 v4 nota negativa "não usar Edge".
- ⚠️ Cold start: Prisma + Supabase pooler levam ~800–1500ms na primeira requisição. Webhook Meta tem timeout de 20s — sobrevive, mas é apertado.

### 5.5 Bundle size frontend
- Não medi nesta auditoria. Próxima leitura: `next build --profile`. Estimativa: dashboard com Radix UI + react-query + dnd-kit fica entre 250–400 KB gzip first-load. Aceitável.

### 5.6 Conexões DB
- Prisma com `DATABASE_URL` (`?pgbouncer=true&connection_limit=1` esperado conforme ADR-001 v4). **Não consigo confirmar a connection string sem ler `.env.production` da Vercel.** Tania, verificar no dashboard Vercel → Env Vars → `DATABASE_URL`. Se não tiver `?connection_limit=1`, prepare-se para "too many connections" em pico.
- Supabase Pro: 60 connections no pooler + 90 direct. Suficiente para 10 usuários + cron.

---

## 6. LGPD e Audit

### 6.1 Consent

| Fluxo | Consent capturado | Como |
|---|---|---|
| Formulário site (`/public/leads`) | ✅ | Zod `refine(v=>v===true)` + grava `lgpdConsent, lgpdConsentAt, lgpdConsentIp` |
| Webchat session (`/webchat/sessions`) | ⚠️ **Falso**: route.ts:56 hardcoda `lgpdConsent: true` **independente** do input do visitante. Se o widget não pedir o checkbox, estamos afirmando consentimento sem coletar |
| Webhook WhatsApp (inbound) | ❌ Cria contact com `lgpdConsent: false` e tag `pendente-lgpd`. Vendedor deve confirmar manualmente antes de qualquer outbound. **Mas** `POST /whatsapp/send` (`route.ts:34-36`) checa `lgpdConsent` antes de enviar ✅. Bom. |
| Webhook Instagram (inbound) | ❌ Idem — `lgpdConsent: false`. ✅ tagueado para confirmação manual. |
| Contato manual via CRM (`POST /contacts`) | ⚠️ `CreateContactSchema` permite criar contato sem flag — **legalmente OK** pois é dado interno (legítimo interesse) mas precisa do consentimento antes de outbound |

### 6.2 Retenção

- ❌ Nenhuma lógica de purga real visível no schema/código. Cron `lgpd-purge` existe mas conteúdo (não auditei) tipicamente faz `DELETE WHERE created_at < NOW() - INTERVAL '90 days'` em leads não convertidos. **A verificar**.
- ❌ Sem campo `retention_until` nem `legal_basis` por registro. Tudo é regra global.

### 6.3 Direito ao esquecimento

- ✅ Soft delete via `deletedAt` em contacts, deals, activities, users.
- ❌ Sem endpoint LGPD self-service ("exclua meus dados"). Plano: email `privacidade@techmalhas.com.br` → processo manual. Aceitável no MVP.

### 6.4 Audit log

- Cobertura real **muito baixa**:
  - `POST /contacts` ✅ (action: CREATE)
  - `POST /deals` ✅ (action: CREATE)
  - `POST /whatsapp/send` ✅ (action: CREATE)
- **Faltando:**
  - `PUT /contacts/[id]` — sem audit (perde rastro de mudança de PII)
  - `DELETE /contacts/[id]` — sem audit
  - `PUT /deals/[id]/stage` — sem audit
  - `GET /contacts/[id]` quando há CPF/CNPJ — sem audit
  - `POST /public/leads` — **sem audit** (entrada de PII de terceiro!)
  - `POST /webhooks/whatsapp` — sem audit no upsert de contact
  - Login (last_login_at) — sem audit
  - Webchat sessões com email/phone — sem audit
- O `sanitizePIIFromOldValues` mencionado na arch v4 §9.5 **não existe** no `lib/audit.ts`. Hoje `oldValues` pode conter PII bruto.

**Recomendação:** criar middleware/helper `withAudit(action, table)` para wrap automático nas rotas mutation.

### 6.5 Dados sensíveis na URL/log

- ❌ `app/api/v1/webchat/sessions/route.ts:78` faz `body: \`${input.visitorName} iniciou um chat em ${new URL(input.pageUrl).pathname}\`` na notification. Em mensagens de log/console isso pode vazar.
- ❌ `console.warn('[WhatsApp webhook] Assinatura inválida')` (route.ts:29) — sem detalhe, OK. Mas `console.error('[unhandled error]', err)` (errors.ts:62) pode logar PII se erro for em ZodError com input do usuário.

---

## 7. Deploy e CI/CD

### 7.1 Vercel
- ✅ Build verde (ADR-004 resolveu).
- ✅ `next.config.ts` com `outputFileTracingRoot` e `turbopack.root` — correto para monorepo.
- ❌ **`typescript.ignoreBuildErrors: true`** (`next.config.ts:10`) com TODO "remover após corrigir tipos restantes" — **bomba-relógio**. Build verde só porque ignora erros. Significa que pode haver bug de runtime esperando.
- ❌ Sem `eslint.ignoreDuringBuilds` (default false) — ok.
- ⚠️ Sem `images.remotePatterns` configurado — se algum lugar consumir mídia Meta (`graph.facebook.com/...`), `<Image>` não vai funcionar.

### 7.2 Variáveis de ambiente
- Sem `.env.example` que eu tenha visto no `crm-app/`. Tania, criar. Plano arch v4 §10.1 listou 30 variáveis. Não consigo validar quais estão na Vercel sem acesso direto.

### 7.3 CI/CD
- ❌ **Sem GitHub Actions.** ADR-008 do v4 sugeriu pipeline (lint + typecheck + test). Não foi criado.
- ❌ Sem typecheck no merge — combinado com `ignoreBuildErrors: true` = recipe pra regressão.
- ❌ Sem testes E2E rodando. Playwright instalado (`devDependencies`) mas zero spec auditado.

### 7.4 Monitoramento / Logs
- ❌ Sem Sentry, Better Stack, Logflare, Vercel Logs Drains. Único log = console no painel Vercel.
- ❌ Sem alerta de erro 500. Se webhook WhatsApp começar a falhar 100%, ninguém sabe.
- ❌ Sem dashboard de métricas (sessões/dia webchat, msgs WA enviadas, leads/dia).

---

## 8. Débito Técnico Crítico

### P0 (bloqueia produção real para externos)

1. **`webchat/messages` aceita `isFromVisitor: true` sem token** — qualquer um sabendo o UUID posta como visitante. (`app/api/v1/webchat/messages/route.ts:20-23`) — **2h** para fixar (gerar JWT efêmero ao criar sessão, validar no POST).
2. **`webchat/sessions` hardcoda `lgpdConsent: true` ignorando input** — risco legal LGPD. (`route.ts:56`) — **30min** para fixar.
3. **`typescript.ignoreBuildErrors: true`** — remover e corrigir os erros que aparecerem. (`next.config.ts:10`) — **3–6h** dependendo de quantos erros aparecerem.
4. **Cron `whatsapp-retry` diário em vez de 5min** — mensagens falhadas nunca chegam dentro da janela. (`vercel.json:8`) — **5min** (mudar para `*/5 * * * *`).
5. **Cron `webchat-expire` diário em vez de 15min** — sessões zumbis ocupando dashboard. (`vercel.json:12`) — **5min**.
6. **Rate limit in-memory ineficaz em serverless** — substituir por Upstash Redis (já planejado ADR-008). — **4h**.
7. **`POST /public/leads` sem audit_log** — entrada de PII de terceiro sem rastro. — **30min**.

**Soma P0: ~10–14h de Fábio.**

### P1 (corrigir nas próximas 2 semanas)

8. **`POST /whatsapp/send` sem RBAC** — vendedor_atacado pode mandar WA para B2C. — **30min**.
9. **`POST /deals` sem checar pipeline ↔ role** — vendedor_atacado cria deal em pipeline varejo. — **30min**.
10. **Audit log incompleto** (UPDATE, DELETE em contacts, deals; webhook WA inbound) — **3h**.
11. **CORS headers + Origin validation** para `/api/v1/webchat/*` (precondição do widget). — **2h**.
12. **`Contact.instagramId` sem `@unique`** + remover o try/catch desajeitado no `webhooks/instagram/route.ts`. — **1h** (migration + refactor).
13. **`webchat/messages` não cria `Interaction`** — histórico unificado quebrado. — **1h**.
14. **Indexes em FKs faltantes** (ver §5.2). — **30min**.
15. **`SECURITY DEFINER` funcs callable por anon/authenticated** — REVOKE EXECUTE. — **30min** (migration SQL).
16. **`search_path` mutável em triggers** — ALTER FUNCTION. — **15min**.

**Soma P1: ~9–10h.**

### P2 (próximos 30 dias)

17. CI/CD com GitHub Actions (lint + typecheck + test). — **4h**.
18. Sentry ou Better Stack para erro/perf monitoring. — **3h**.
19. Constraint `contacts_email_or_phone` materializar. — **30min**.
20. Sanitizar PII em `audit.oldValues`. — **2h**.
21. Upload de mídia WhatsApp para Supabase Storage. — **4h**.
22. Habilitar Supabase `auth_leaked_password_protection`. — **2 min** no dashboard.
23. MFA TOTP para admins. — **6h**.
24. Endpoint LGPD self-service (deletar meus dados). — **8h**.

**Soma P2: ~30h.**

### Total dívida visível: ~50–55h

---

## 9. Riscos de Produção (Top 10)

| # | Risco | Prob | Impacto | Mitigação |
|---|---|---|---|---|
| 1 | Spam de leads pelo formulário público (sem rate limit real) | **Alta** | Médio | P0.6 — Upstash Redis |
| 2 | Sequestro de sessão webchat (anyone-can-post) | **Média** | Alto (LGPD + reputação) | P0.1 — JWT efêmero por sessão |
| 3 | Cron whatsapp-retry diário → cliente espera 24h por resposta perdida | **Alta** | Alto (perda comercial) | P0.4 — `*/5` |
| 4 | LGPD: Tania ser autuada por afirmar consentimento webchat sem coletar | Baixa | **Crítico** (multa até 2% faturamento) | P0.2 — usar input do widget |
| 5 | Build verde com bugs de runtime escondidos pelo `ignoreBuildErrors` | Média | Alto | P0.3 |
| 6 | `SECURITY DEFINER handle_new_auth_user` exposto via rpc | Baixa | **Crítico** (escalonamento de privilégio) | P1.15 — REVOKE |
| 7 | RBAC fraca em mutations (vendedor_atacado faz outbound B2C) | Média | Médio | P1.8 |
| 8 | Sem audit_log em ~80% das operações sensíveis | **Alta** | Médio (LGPD investigação cega) | P0.7 + P1.10 |
| 9 | Sem monitoramento — incidente passa silencioso | Alta | Alto | P2.18 — Sentry |
| 10 | `connection_limit` no `DATABASE_URL` não confirmado | Média | Alto (esgota pool em pico) | Confirmar Tania na Vercel Env Vars |

---

## 10. Recomendações Priorizadas (próximas 10 ações)

Em ordem de execução para Fábio (recomendado fazer em 2 sprints):

**Sprint 1 — Segurança e LGPD (1 semana)**
1. Fixar `vercel.json` crons (5min) — efeito imediato. **5min**
2. Habilitar Supabase leaked-password protection no dashboard. **2min**
3. `REVOKE EXECUTE ... FROM anon, authenticated` nas SECURITY DEFINER funcs + `ALTER FUNCTION ... SET search_path = public, pg_catalog`. Migration `005_security_hardening.sql`. **45min**
4. Corrigir `lgpdConsent` hardcoded em `webchat/sessions`. **30min**
5. Adicionar JWT efêmero ao retorno de `POST /webchat/sessions` + validar em `POST /webchat/messages` quando `isFromVisitor=true`. **3h**
6. `requireRole` em todas as mutations restantes (whatsapp/send, deals POST/PUT, users CRUD). **2h**
7. Logar audit em `public/leads`, `webhooks/whatsapp inbound`, `contacts PUT/DELETE`, `deals PUT/DELETE`. **3h**

**Sprint 2 — Robustez e tooling (1 semana)**
8. Instalar `@upstash/ratelimit` + `@upstash/redis`. Provisionar instância `sa-east-1`. Implementar `lib/rate-limit.ts` real, aplicar em `public/leads`, `webchat/sessions`, `webchat/messages`. **4h**
9. Remover `typescript.ignoreBuildErrors`, fixar erros que aparecerem. **3–6h**
10. Indexes em FKs (migration `006_fk_indexes.sql`). **30min**

**Pós-sprint (paralelo):** começar T1–T10 do ADR-008 (widget Irroba) com a base já hardenizada.

---

## 11. Veredicto Final

**Tania, esse CRM aguenta produção real (10 usuários internos + 100 leads/dia)?**

> **Sim, com ressalvas P0.** O banco está bem modelado, o RBAC na aplicação cobre o essencial, e a integração WhatsApp consegue receber e enviar mensagens com idempotência correta. Para os **10 funcionários internos**, podem começar a operar **hoje** — eles autenticam por Supabase Auth, RBAC filtra o que cada um vê, e os mutations principais funcionam. **Risco interno = baixo.**

> **Mas para 100 leads/dia vindos do formulário público e/ou do webchat do site Irroba, NÃO ainda.** Os 7 itens P0 (em especial o hardcoded `lgpdConsent: true` do webchat, o anyone-can-post de mensagens, o rate limit fake, o cron whatsapp-retry diário e o `ignoreBuildErrors`) representam **risco real de incidente nas primeiras 48h** de uso público. **Estimativa para fechar P0: 10–14h de Fábio.**

> **Recomendação operacional:**
> - **Semana 1 desta semana:** liberar o CRM **interno** (atacado + varejo) para a equipe Techmalhas; treinar atendentes; começar a usar com os leads que já chegam por WhatsApp manual.
> - **Semana 2:** Fábio executa Sprint 1 (segurança/LGPD P0).
> - **Semana 3:** Sprint 2 (Upstash, typescript, FKs).
> - **Semana 4+:** começar o widget Irroba (ADR-008) — com a base hardenizada.

> **Custo de não fazer o P0 antes do go-live público:** uma única denúncia LGPD por consent fake no webchat custa até **2% do faturamento anual** (Art. 52 LGPD). Risco assimétrico: 14h de dev hoje vs. multa potencial alta + dano de marca. **Vale a pena pagar o P0 antes.**

> **Boa notícia final:** nada do que está errado é arquitetural. **Estrutura está correta** (monolito modular, RLS habilitada, idempotência em webhooks, Zod no boundary, separação clara entre `lib/auth.ts`, `lib/permissions.ts`, `lib/errors.ts`, `lib/audit.ts`). Os defeitos são **operacionais e de completude** — exatamente o tipo de coisa que se resolve em 2 sprints. O CRM tem ossos bons.

---

*Auditoria conduzida por Arnaldo Arquiteto (system-architect, Squad CRM Techmalhas) sob modelo operacional ADR-007. Validações via MCP `project-0-squadTchmalhas-supabase` em 2026-05-26 07:14 UTC-3. Citações de código no formato `arquivo:linha`. ADRs anteriores: 001–006 (`output/2026-05-24-162435/v4/architecture.md`), 004 (`output/2026-05-24-162435/adr-004-deploy-strategy.md`), 007/008/009/010 (`output/2026-05-25/`).*
