-- ============================================================
-- Migration 003 — Trigger Supabase Auth → public.users
-- Sincroniza automaticamente novos usuários criados via
-- Supabase Auth (email/senha ou Google OAuth) para a tabela
-- public.users com role padrão 'atendente_varejo'.
--
-- O admin deve depois alterar o role manualmente via painel
-- ou API com role = service_role.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        full_name,
        avatar_url,
        role
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url',
        'atendente_varejo'  -- role padrão; admin altera depois
    )
    ON CONFLICT (id) DO UPDATE SET
        email       = EXCLUDED.email,
        full_name   = COALESCE(EXCLUDED.full_name, public.users.full_name),
        avatar_url  = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
        updated_at  = NOW();

    RETURN NEW;
END;
$$;

-- Remover trigger se já existir (idempotente)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================
-- Trigger para deletar public.users quando auth.users é deletado
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_delete_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Soft delete (preserva dados para LGPD audit)
    UPDATE public.users
    SET deleted_at = NOW(), is_active = FALSE
    WHERE id = OLD.id;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_delete_auth_user();