-- ============================================================
-- Migration 006 — Hardening Supabase Security Advisors
-- 2026-05-26 · Fábio (squad CRM Techmalhas)
--
-- Objetivo: zerar os findings WARN do Security Advisor que são
-- corrigíveis via SQL, sem alterar comportamento funcional.
--
-- Assinaturas confirmadas via pg_proc (todas sem args):
--   public.update_updated_at()                          [SECURITY INVOKER]
--   public.create_mandatory_activities_on_stage_change()[SECURITY INVOKER]
--   public.handle_new_auth_user()                       [SECURITY DEFINER]
--   public.handle_delete_auth_user()                    [SECURITY DEFINER]
--
-- Restrições aplicadas (do briefing):
--   * Não usamos DROP FUNCTION.
--   * Não modificamos RLS policies existentes.
--   * Não tocamos no schema auth.* diretamente.
-- ============================================================

-- ------------------------------------------------------------
-- 1) function_search_path_mutable
--    Fixa search_path em funções não-SECURITY DEFINER que
--    estavam com search_path mutable (role-dependent).
--    pg_temp incluído ao final por boas práticas (último na
--    busca, evitando hijack via schema temporário).
-- ------------------------------------------------------------
ALTER FUNCTION public.update_updated_at()
    SET search_path = public, pg_temp;

ALTER FUNCTION public.create_mandatory_activities_on_stage_change()
    SET search_path = public, pg_temp;

-- ------------------------------------------------------------
-- 2) anon/authenticated_security_definer_function_executable
--    Revogar EXECUTE das funções SECURITY DEFINER usadas
--    APENAS como triggers em auth.users. Triggers continuam
--    funcionando: o PostgreSQL invoca o trigger pelo owner da
--    função, não pelo role do chamador da operação.
--
--    Mantemos EXECUTE para roles administrativos (postgres,
--    service_role, supabase_auth_admin) por segurança —
--    eles seguem aptos a executar manualmente em caso de
--    backfill/manutenção.
-- ------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user()
    FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_delete_auth_user()
    FROM PUBLIC, anon, authenticated;

-- ------------------------------------------------------------
-- Notas (NÃO aplicadas aqui — documentadas em
-- squads/crm-techmalhas/output/2026-05-26/SECURITY-ADVISORS-FIXES.md):
--
-- * rls_policy_always_true em webchat_sessions_insert_anon:
--     Aceito. Visitante anônimo precisa criar a sessão antes
--     de ter qualquer token. O session_token gerado controla
--     o acesso subsequente (policies de SELECT/UPDATE filtram
--     por token).
--
-- * rls_enabled_no_policy em _prisma_migrations:
--     Aceito. Tabela interna do Prisma, gerenciada apenas pelo
--     role do migration (postgres / service_role). RLS ON sem
--     policy nega tudo para anon/authenticated — comportamento
--     desejado.
--
-- * auth_leaked_password_protection:
--     Pendente — exige ação manual do admin no dashboard:
--     Auth → Settings → "Leaked password protection (HIBP)".
-- ============================================================
