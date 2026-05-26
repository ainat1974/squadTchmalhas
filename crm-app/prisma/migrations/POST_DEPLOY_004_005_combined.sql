-- Pós-deploy Sprint Recovery — executar UMA VEZ no Supabase SQL Editor
-- Projeto: https://supabase.com/dashboard/project/ipmznhtviwxjvbjjuvxf/sql/new

-- ========== 004: Realtime webchat + RLS anon ==========
ALTER PUBLICATION supabase_realtime ADD TABLE public.webchat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.webchat_sessions;
ALTER TABLE public.webchat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.webchat_sessions REPLICA IDENTITY FULL;

DROP POLICY IF EXISTS webchat_messages_anon_select ON public.webchat_messages;
CREATE POLICY webchat_messages_anon_select ON public.webchat_messages
  FOR SELECT TO anon
  USING (
    session_id IN (
      SELECT id FROM public.webchat_sessions
      WHERE status IN ('waiting', 'active')
    )
  );

DROP POLICY IF EXISTS webchat_sessions_anon_select ON public.webchat_sessions;
CREATE POLICY webchat_sessions_anon_select ON public.webchat_sessions
  FOR SELECT TO anon
  USING (status IN ('waiting', 'active'));

-- ========== 005: phone unique + session_token ==========
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

ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_phone_key;
ALTER TABLE public.contacts ADD CONSTRAINT contacts_phone_key UNIQUE (phone);

ALTER TABLE public.webchat_sessions
  ADD COLUMN IF NOT EXISTS session_token UUID NOT NULL DEFAULT gen_random_uuid();

UPDATE public.webchat_sessions
SET session_token = gen_random_uuid()
WHERE session_token IS NULL;

ALTER TABLE public.webchat_sessions
  DROP CONSTRAINT IF EXISTS webchat_sessions_session_token_key;
ALTER TABLE public.webchat_sessions
  ADD CONSTRAINT webchat_sessions_session_token_key UNIQUE (session_token);
