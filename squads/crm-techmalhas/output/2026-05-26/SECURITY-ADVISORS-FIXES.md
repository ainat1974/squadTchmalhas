# SECURITY-ADVISORS-FIXES — Supabase Security Advisor

**Projeto:** CRM Techmalhas
**Project ref:** `ipmznhtviwxjvbjjuvxf`
**Data:** 2026-05-26
**Responsável:** Fábio (squad CRM Techmalhas)
**Migration aplicada:** `crm-app/prisma/migrations/006_security_advisors_fixes.sql`
**Exit code do `npx supabase db query`:** `0`

---

## 1. Resumo executivo

| Métrica | Antes | Depois |
| --- | --- | --- |
| Total de findings | **9** | **3** |
| WARN | 7 | 2 |
| INFO | 1 | 1 |
| ERROR | 0 | 0 |

- **6 advisors resolvidos via SQL** (esta migration).
- **2 advisors aceitos com justificativa** (documentados abaixo).
- **1 advisor pendente de ação manual no dashboard** (Leaked Password Protection).
- Nenhum advisor novo apareceu após o deploy.

---

## 2. Tabela ANTES x DEPOIS por advisor

| # | Advisor | Nível | Alvo | Antes | Depois | Ação |
|---|---------|-------|------|-------|--------|------|
| 1 | `function_search_path_mutable` | WARN | `public.update_updated_at()` | search_path mutable | `search_path = public, pg_temp` | **Resolvido** via `ALTER FUNCTION` |
| 2 | `function_search_path_mutable` | WARN | `public.create_mandatory_activities_on_stage_change()` | search_path mutable | `search_path = public, pg_temp` | **Resolvido** via `ALTER FUNCTION` |
| 3 | `anon_security_definer_function_executable` | WARN | `public.handle_new_auth_user()` | `anon` tinha EXECUTE | `anon` sem EXECUTE | **Resolvido** via `REVOKE EXECUTE` |
| 4 | `anon_security_definer_function_executable` | WARN | `public.handle_delete_auth_user()` | `anon` tinha EXECUTE | `anon` sem EXECUTE | **Resolvido** via `REVOKE EXECUTE` |
| 5 | `authenticated_security_definer_function_executable` | WARN | `public.handle_new_auth_user()` | `authenticated` tinha EXECUTE | `authenticated` sem EXECUTE | **Resolvido** via `REVOKE EXECUTE` |
| 6 | `authenticated_security_definer_function_executable` | WARN | `public.handle_delete_auth_user()` | `authenticated` tinha EXECUTE | `authenticated` sem EXECUTE | **Resolvido** via `REVOKE EXECUTE` |
| 7 | `rls_policy_always_true` | WARN | `webchat_sessions.webchat_sessions_insert_anon` | Mantido (intencional) | Mantido (intencional) | **Aceito** — visitante anônimo precisa criar a sessão antes de ter token |
| 8 | `rls_enabled_no_policy` | INFO | `public._prisma_migrations` | Mantido | Mantido | **Aceito** — tabela interna do Prisma |
| 9 | `auth_leaked_password_protection` | WARN | Auth → Password Protection | Desabilitado | Desabilitado | **Pendente** — ação manual no dashboard |

---

## 3. SQL aplicado

Arquivo: `crm-app/prisma/migrations/006_security_advisors_fixes.sql`

```sql
-- 1) Fix search_path mutable
ALTER FUNCTION public.update_updated_at()
    SET search_path = public, pg_temp;

ALTER FUNCTION public.create_mandatory_activities_on_stage_change()
    SET search_path = public, pg_temp;

-- 2) Revogar EXECUTE em SECURITY DEFINER expostas via PostgREST
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user()
    FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_delete_auth_user()
    FROM PUBLIC, anon, authenticated;
```

### Comando de execução

```powershell
Set-Location "c:\PROJETOS_CURSOR\squadTchmalhas\crm-app"
npx supabase db query -f "prisma/migrations/006_security_advisors_fixes.sql" --linked
# EXIT_CODE=0
```

### Verificação pós-migration (via MCP `execute_sql`)

| Função | `search_path` | `anon` EXECUTE | `authenticated` EXECUTE | `service_role` EXECUTE | `postgres` EXECUTE |
|---|---|---|---|---|---|
| `update_updated_at` | `public, pg_temp` | true | true | true | true |
| `create_mandatory_activities_on_stage_change` | `public, pg_temp` | true | true | true | true |
| `handle_new_auth_user` | `public` (já tinha) | **false** | **false** | true | true |
| `handle_delete_auth_user` | `public` (já tinha) | **false** | **false** | true | true |

> Os triggers `on_auth_user_created` / `on_auth_user_deleted` em `auth.users` continuam funcionando: PostgreSQL invoca trigger functions pelo owner registrado, sem checar `EXECUTE` do role que disparou o evento.

---

## 4. Itens aceitos (com justificativa)

### 4.1 `rls_policy_always_true` em `webchat_sessions_insert_anon`

- **Advisor:** WARN — política RLS de INSERT com `WITH CHECK (true)`.
- **Decisão:** **Aceito como design intencional.**
- **Justificativa:**
  - O webchat é o ponto de entrada de leads anônimos. O visitante chega sem credenciais e precisa **criar a própria sessão** para começar a conversar.
  - O `session_token` gerado no INSERT funciona como capability token: as policies de `SELECT`/`UPDATE` em `webchat_sessions` (e nas tabelas relacionadas como `webchat_messages`) **filtram por `session_token`**, garantindo isolamento entre visitantes.
  - Sem essa policy `WITH CHECK (true)` o widget não consegue iniciar conversa — quebra o funil inteiro.
- **Mitigação adicional:** rate limiting no edge (Vercel) e validação de payload no lado do servidor.

### 4.2 `rls_enabled_no_policy` em `public._prisma_migrations`

- **Advisor:** INFO — tabela com RLS ON mas sem policies.
- **Decisão:** **Aceito.**
- **Justificativa:**
  - Tabela interna do Prisma. Manipulada apenas por `postgres`/`service_role` durante migrations.
  - RLS ON sem policies = nega tudo para `anon`/`authenticated` (comportamento desejado).
  - Não contém dados sensíveis (apenas metadata de migrations: hash, nome, timestamps).

---

## 5. Itens pendentes para o admin (dashboard)

### 5.1 Habilitar Leaked Password Protection (HIBP)

- **Advisor:** WARN — `auth_leaked_password_protection`.
- **Por que não está nesta migration:** configuração de Auth, não de banco. Não é exposta via SQL.
- **Ação:** habilitar no dashboard.
  - **Link direto:** https://supabase.com/dashboard/project/ipmznhtviwxjvbjjuvxf/settings/auth
  - **Caminho na UI:** Authentication → Settings → "Password Protection" → ativar **"Enable leaked password protection (HIBP)"**.
- **Impacto esperado:** novas senhas serão verificadas contra a base do HaveIBeenPwned via k-anonymity (apenas o hash parcial sai do Supabase). Usuários com senhas vazadas serão bloqueados no signup e ao trocar senha. Não afeta logins existentes.
- **Documentação:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

## 6. Findings restantes após o deploy (output do `get_advisors`)

```
INFO  rls_enabled_no_policy                          public._prisma_migrations         [aceito]
WARN  rls_policy_always_true                         webchat_sessions_insert_anon       [aceito]
WARN  auth_leaked_password_protection                Auth                               [pendente dashboard]
```

Nenhum warning novo foi introduzido pela migration 006.

---

## 7. Restrições do briefing respeitadas

- ✅ Sem `DROP FUNCTION` — usados apenas `ALTER ... SET search_path` e `REVOKE EXECUTE`.
- ✅ Sem alterações em RLS policies existentes.
- ✅ Sem alterações no schema `auth.*`.
