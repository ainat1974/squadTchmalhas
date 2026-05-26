-- Migration 005: unique phone em contacts + session_token em webchat_sessions
-- Aplicar via Supabase Studio → SQL Editor
-- Autor: Sprint Recovery · 2026-05-26

-- 1) Deduplicar telefones (manter contato mais antigo)
WITH dupes AS (
  SELECT phone, MIN(created_at) AS keep_created
  FROM public.contacts
  WHERE phone IS NOT NULL AND deleted_at IS NULL
  GROUP BY phone
  HAVING COUNT(*) > 1
),
to_null AS (
  SELECT c.id
  FROM public.contacts c
  INNER JOIN dupes d ON c.phone = d.phone AND c.created_at > d.keep_created
  WHERE c.deleted_at IS NULL
)
UPDATE public.contacts SET phone = NULL WHERE id IN (SELECT id FROM to_null);

-- 2) Unique em phone (nullable — múltiplos NULL permitidos)
ALTER TABLE public.contacts
  DROP CONSTRAINT IF EXISTS contacts_phone_key;
ALTER TABLE public.contacts
  ADD CONSTRAINT contacts_phone_key UNIQUE (phone);

-- 3) session_token em webchat_sessions (visitante autentica mensagens)
ALTER TABLE public.webchat_sessions
  ADD COLUMN IF NOT EXISTS session_token UUID NOT NULL DEFAULT gen_random_uuid();

UPDATE public.webchat_sessions
SET session_token = gen_random_uuid()
WHERE session_token IS NULL;

ALTER TABLE public.webchat_sessions
  DROP CONSTRAINT IF EXISTS webchat_sessions_session_token_key;
ALTER TABLE public.webchat_sessions
  ADD CONSTRAINT webchat_sessions_session_token_key UNIQUE (session_token);
