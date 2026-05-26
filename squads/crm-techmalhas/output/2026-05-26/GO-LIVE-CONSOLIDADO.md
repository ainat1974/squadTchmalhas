# Go-Live Consolidado — CRM Techmalhas

**Data:** 2026-05-26 · **Coordenação:** tutora (squad)  
**Produção:** https://squad-tchmalhas.vercel.app · **Commit deploy:** `c074e0d`  
**Auditoria base:** `squads/crm-techmalhas/output/2026-05-25/audit-consolidado-executivo.md`

---

## Veredicto executivo

| Dimensão | Antes (auditoria 25/05) | Agora (26/05) |
|----------|-------------------------|---------------|
| **Produto MVP (uso interno)** | ~21% · não pronto | **~75%** — WhatsApp UI, deals, forms, hard block, LGPD mínima |
| **Segurança boundary** | 7 P0 abertos | **Maioria fechada** — middleware, TS strict, sessionToken, migrations, advisors |
| **Smoke automatizado** | 0 testes | **15/15 rotas públicas + API** · **9/10 autenticado** (1 fix em código, deploy pendente) |
| **Widget Irroba** | Inexistente | **Pronto para colar** — snippet + Realtime **PASS** (~1,9s) |
| **Go-live equipe (Vitor/Amanda/Renato)** | Não | **Sim, com ressalvas** (ver checklist abaixo) |

**Resumo em uma frase:** O CRM passou de “demo quebrada” para **operável em produção para o time interno**, com webchat/widget validados tecnicamente; faltam **1 deploy** (fix telefone duplicado + CSP apex), **env `WEBCHAT_ALLOWED_ORIGINS`** na Vercel, e **habilitar HIBP** no Supabase Auth.

---

## O que o time entregou hoje

| Agente | Entregável | Resultado |
|--------|------------|-----------|
| **Coordenação** | Migrations 004+005 via `supabase db query --linked` | ✅ Realtime + `session_token` + `contacts_phone_key` |
| **Quésia** | `SMOKE-AUTH-RESULTS.md` | **9/10** — auth via cookie SSR; senha prod `Techmalhas2026!` |
| **Fábio** | `006_security_advisors_fixes.sql` + doc | Advisors **9 → 3** (restantes aceitos ou dashboard) |
| **Arnaldo** | `test-realtime-e2e.mjs` + `WIDGET-IRROBA-FINAL.md` | Realtime **PASS**; snippet Irroba documentado |
| **Coordenação** | Fix P2002 + CSP apex (código local) | Pronto para commit/deploy |

---

## Sprint Recovery — status dos 8 blocos

| Bloco | Escopo | Status |
|-------|--------|--------|
| 1 | Inbox WhatsApp | ✅ UI + APIs |
| 2 | Segurança A (LGPD, phone unique, sessionToken) | ✅ + migrations aplicadas |
| 3 | Deal detail + Won/Lost | ✅ |
| 4 | Segurança B (TS, middleware, crons Hobby) | ✅ crons diários (Pro para `*/5`) |
| 5 | Hard block + StageRequiredTask | ✅ 409 validado em atacado |
| 6 | Forms `/leads/new`, `/deals/new` | ✅ |
| 7 | Smoke 15 fluxos | ✅ públicos; autenticado 9/10 → **10/10 após deploy do fix C** |
| 8 | Widget Irroba | ✅ `widget.js` + doc final |

---

## Blockers e ações (prioridade)

### P0 — antes de abrir para loja Irroba

| # | Item | Responsável | Ação |
|---|------|-------------|------|
| 1 | **Deploy** fix `lib/errors.ts` (P2002 → 409) + `next.config.ts` (CSP apex) | DevOps / Tania | Push `main` → Vercel auto-deploy |
| 2 | **`WEBCHAT_ALLOWED_ORIGINS`** vazio na Vercel | Admin Vercel | `https://www.techmalhas.com.br,https://techmalhas.com.br,https://loja.irroba.com.br` → Redeploy |
| 3 | Colar snippet Irroba | Operação | `WIDGET-IRROBA-FINAL.md` |

### P1 — primeira semana de uso interno

| # | Item | Ação |
|---|------|------|
| 4 | Senha documentação desatualizada (`Admin123!` vs `Techmalhas2026!`) | Atualizar `VERCEL-DEPLOY.md`, handoff, seed logs |
| 5 | **Leaked password protection (HIBP)** desligado | Supabase Dashboard → Auth → Password Protection |
| 6 | Crons `*/5` e `*/15` | Upgrade Vercel Pro ou aceitar retry 1×/dia |
| 7 | 3 deals de smoke no banco | Ignorar ou arquivar manualmente |
| 8 | Zero testes Vitest/Playwright no CI | Backlog v5.1 |

### P2 — v5.1

- Perfil / troca de senha in-app  
- Relatórios, import CSV  
- Editor de pipelines em `/settings/pipelines`  
- Domínio custom `crm.techmalhas.com.br`  
- Upstash + Turnstile (opcional, rate limit já tem fallback)

---

## Evidências por área

### Banco (Supabase `ipmznhtviwxjvbjjuvxf`)

- 4 usuários auth confirmados (admin logou 26/05)
- Seed: 2 pipelines, 11 stages, 2 `stage_required_tasks`, 10 contacts, 5 deals
- Migrations 004, 005, **006** aplicadas
- Webchat API: sessão **201**, mensagem visitante **201**, Realtime **PASS**

### API autenticada (Quésia)

| Fluxo | Status |
|-------|--------|
| GET/POST contacts, GET deals, POST deal | ✅ |
| Hard block 409 + retry 200 | ✅ |
| Won / Lost | ✅ |
| WhatsApp conversations | ✅ |
| POST contact phone duplicado | ❌ **500** → fix **409** no código (deploy pendente) |

### Segurança (Fábio)

- `search_path` fixado em 2 funções  
- `REVOKE EXECUTE` em `handle_new_auth_user` / `handle_delete_auth_user` para anon/authenticated  
- Aceito: `webchat_sessions_insert_anon` (visitante precisa criar sessão)  
- Pendente manual: HIBP no Auth  

### Widget / embed (Arnaldo)

- `GET /widget.js` → 200  
- `GET /embed/chat` → 200 + LGPD checkbox  
- CSP: apex `techmalhas.com.br` adicionado no código (deploy pendente)  

---

## Credenciais de smoke (produção)

| Campo | Valor |
|-------|-------|
| URL | https://squad-tchmalhas.vercel.app/login |
| E-mail | `admin@techmalhas.com.br` |
| Senha | **`Techmalhas2026!`** (não `Admin123!`) |
| API auth | Cookie `sb-ipmznhtviwxjvbjjuvxf-auth-token` — Bearer **não** funciona |

---

## Checklist go-live — equipe interna

Marque após o **deploy do fix C + env WEBCHAT**:

- [ ] Login admin com `Techmalhas2026!`
- [ ] Criar contato em `/leads/new`
- [ ] Criar deal em `/deals/new`
- [ ] Mover deal atacado → stage com tarefa → ver 409 → concluir tarefa → mover
- [ ] Fechar deal Won e conferir dashboard
- [ ] Abrir `/whatsapp` e listar conversas
- [ ] Abrir `/politica-de-privacidade`
- [ ] (Opcional) Widget na loja Irroba + teste anônimo

**Meta:** 12/15 fluxos manuais em `SMOKE-TEST-RECOVERY.md` — hoje **automático cobre ~11**; faltam login UI + OAuth Google + envio WA real.

---

## Documentos de referência (26/05)

| Arquivo | Conteúdo |
|---------|----------|
| `POST-DEPLOY-EXECUCAO.md` | Migrations + smoke público |
| `SMOKE-AUTH-RESULTS.md` | Smoke API autenticado 9/10 |
| `SMOKE-TEST-RECOVERY.md` | 15 fluxos manuais |
| `SECURITY-ADVISORS-FIXES.md` | Hardening Supabase |
| `WIDGET-IRROBA-FINAL.md` | Snippet + instalação Irroba |
| `crm-app/scripts/test-realtime-e2e.mjs` | Teste Realtime reproduzível |

---

## Decisão recomendada

**Aprovar go-live interno** (Vitor, Amanda, Renato) após:

1. Deploy do commit com fix P2002 + CSP  
2. `WEBCHAT_ALLOWED_ORIGINS` na Vercel  

**Adiar go-live público Irroba** até checklist widget (7 itens em `WIDGET-IRROBA-FINAL.md`) validado em aba anônima na loja real.

---

*Consolidado após Sprint Recovery, pós-deploy SQL, smoke Quésia/Fábio/Arnaldo e correções coordenadas 26/05.*
