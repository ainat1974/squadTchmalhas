-- Migration 004: habilita Supabase Realtime no webchat + permite visitor anônimo ler
-- Aplicar via Supabase Studio → SQL Editor → cole tudo abaixo → Run
-- Autor: tutora @ 2026-05-25
-- Motivo: webchat embed visitor não conseguia ler mensagens (RLS exigia JWT)
--         e Realtime não estava ativo em nenhuma tabela.

-- 1) Ativar Realtime nas tabelas do webchat
ALTER PUBLICATION supabase_realtime ADD TABLE public.webchat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.webchat_sessions;
ALTER TABLE public.webchat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.webchat_sessions REPLICA IDENTITY FULL;

-- 2) Permitir visitor anônimo ler mensagens da própria sessão
-- Segurança: UUID v4 da sessão é imprevisível (10^36 combinações).
-- Visitor só lê mensagens de sessões ativas/aguardando — sessão fechada some.
DROP POLICY IF EXISTS webchat_messages_anon_select ON public.webchat_messages;
CREATE POLICY webchat_messages_anon_select ON public.webchat_messages
  FOR SELECT
  TO anon
  USING (
    session_id IN (
      SELECT id FROM public.webchat_sessions
      WHERE status IN ('waiting', 'active')
    )
  );

-- 3) Permitir visitor anônimo ler própria sessão (reconectar / reload página)
DROP POLICY IF EXISTS webchat_sessions_anon_select ON public.webchat_sessions;
CREATE POLICY webchat_sessions_anon_select ON public.webchat_sessions
  FOR SELECT
  TO anon
  USING (status IN ('waiting', 'active'));
