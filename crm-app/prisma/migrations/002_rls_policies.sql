-- ============================================================
-- Migration 002 — Row Level Security (RLS) Policies
-- IMPORTANTE: Aplicar APÓS a migration 001 e o trigger 003
-- Executar como service_role no Supabase SQL Editor ou via psql
-- ============================================================

-- ============================================================
-- TABELA: users
-- ============================================================
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Usuário vê o próprio perfil; admin/gestor veem todos
CREATE POLICY "users_select_own_or_admin" ON "users"
    FOR SELECT USING (
        auth.uid() = "id"
        OR EXISTS (
            SELECT 1 FROM "users" u
            WHERE u."id" = auth.uid() AND u."role" IN ('admin', 'gestor')
        )
    );

-- Usuário edita apenas o próprio perfil (sem alterar role)
CREATE POLICY "users_update_own" ON "users"
    FOR UPDATE USING (auth.uid() = "id")
    WITH CHECK (
        auth.uid() = "id"
        AND "role" = (SELECT "role" FROM "users" WHERE "id" = auth.uid())
    );

-- Admin tem acesso total
CREATE POLICY "users_admin_all" ON "users"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'admin')
    );

-- ============================================================
-- TABELA: lead_sources (somente leitura para autenticados)
-- ============================================================
ALTER TABLE "lead_sources" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_sources_read_authenticated" ON "lead_sources"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "lead_sources_write_admin" ON "lead_sources"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'admin')
    );

-- ============================================================
-- TABELA: contacts
-- ============================================================
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;

-- admin e gestor veem todos (exceto soft-deleted)
CREATE POLICY "contacts_admin_gestor_all" ON "contacts"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" IN ('admin', 'gestor'))
        AND "deleted_at" IS NULL
    );

-- vendedor_atacado vê apenas contatos B2B
CREATE POLICY "contacts_vendedor_atacado_select" ON "contacts"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'vendedor_atacado')
        AND "is_b2b" = TRUE
        AND "deleted_at" IS NULL
    );

CREATE POLICY "contacts_vendedor_atacado_insert" ON "contacts"
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" IN ('vendedor_atacado', 'gestor', 'admin'))
    );

CREATE POLICY "contacts_vendedor_atacado_update" ON "contacts"
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'vendedor_atacado')
        AND "is_b2b" = TRUE
        AND "assigned_to" = auth.uid()
        AND "deleted_at" IS NULL
    );

-- atendente_varejo vê apenas contatos B2C / não classificados
CREATE POLICY "contacts_atendente_varejo_select" ON "contacts"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'atendente_varejo')
        AND ("is_b2b" = FALSE OR "pipeline_type" = 'varejo')
        AND "deleted_at" IS NULL
    );

CREATE POLICY "contacts_atendente_varejo_insert" ON "contacts"
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" IN ('atendente_varejo', 'gestor', 'admin'))
    );

CREATE POLICY "contacts_atendente_varejo_update" ON "contacts"
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'atendente_varejo')
        AND "is_b2b" = FALSE
        AND "assigned_to" = auth.uid()
        AND "deleted_at" IS NULL
    );

-- ============================================================
-- TABELA: pipelines
-- ============================================================
ALTER TABLE "pipelines" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pipelines_read_authenticated" ON "pipelines"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "pipelines_write_admin_gestor" ON "pipelines"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" IN ('admin', 'gestor'))
    );

-- ============================================================
-- TABELA: stages
-- ============================================================
ALTER TABLE "stages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stages_read_authenticated" ON "stages"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "stages_write_admin_gestor" ON "stages"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" IN ('admin', 'gestor'))
    );

-- ============================================================
-- TABELA: stage_required_tasks
-- ============================================================
ALTER TABLE "stage_required_tasks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "srt_read_authenticated" ON "stage_required_tasks"
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "srt_write_admin_gestor" ON "stage_required_tasks"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" IN ('admin', 'gestor'))
    );

-- ============================================================
-- TABELA: deals
-- ============================================================
ALTER TABLE "deals" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_admin_gestor_all" ON "deals"
    FOR ALL USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" IN ('admin', 'gestor'))
        AND "deleted_at" IS NULL
    );

CREATE POLICY "deals_vendedor_atacado_pipeline" ON "deals"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'vendedor_atacado')
        AND "pipeline_id" IN (SELECT "id" FROM "pipelines" WHERE "type" = 'atacado')
        AND "deleted_at" IS NULL
    );

CREATE POLICY "deals_vendedor_atacado_insert" ON "deals"
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" IN ('vendedor_atacado', 'gestor', 'admin'))
    );

CREATE POLICY "deals_vendedor_atacado_update" ON "deals"
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'vendedor_atacado')
        AND "assigned_to" = auth.uid()
        AND "pipeline_id" IN (SELECT "id" FROM "pipelines" WHERE "type" = 'atacado')
        AND "deleted_at" IS NULL
    );

CREATE POLICY "deals_atendente_varejo_pipeline" ON "deals"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'atendente_varejo')
        AND "pipeline_id" IN (SELECT "id" FROM "pipelines" WHERE "type" = 'varejo')
        AND "deleted_at" IS NULL
    );

CREATE POLICY "deals_atendente_varejo_insert" ON "deals"
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" IN ('atendente_varejo', 'gestor', 'admin'))
    );

CREATE POLICY "deals_atendente_varejo_update" ON "deals"
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'atendente_varejo')
        AND "assigned_to" = auth.uid()
        AND "pipeline_id" IN (SELECT "id" FROM "pipelines" WHERE "type" = 'varejo')
        AND "deleted_at" IS NULL
    );

-- ============================================================
-- TABELA: activities
-- ============================================================
ALTER TABLE "activities" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_own_or_admin_gestor" ON "activities"
    FOR ALL USING (
        auth.uid() = "assigned_to"
        OR auth.uid() = "created_by"
        OR EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" IN ('admin', 'gestor'))
    );

-- ============================================================
-- TABELA: interactions
-- ============================================================
ALTER TABLE "interactions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interactions_by_contact_scope" ON "interactions"
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM "contacts" c
            WHERE c."id" = "contact_id"
            AND (
                EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" IN ('admin', 'gestor'))
                OR (EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'vendedor_atacado') AND c."is_b2b" = TRUE)
                OR (EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'atendente_varejo') AND c."is_b2b" = FALSE)
            )
        )
    );

CREATE POLICY "interactions_insert_authenticated" ON "interactions"
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- TABELAS: whatsapp_messages / instagram_messages
-- (apenas autenticados — sem granularidade por perfil pois
--  já filtrado via interactions + contacts)
-- ============================================================
ALTER TABLE "whatsapp_messages"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "instagram_messages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wa_messages_authenticated"  ON "whatsapp_messages"  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "ig_messages_authenticated"  ON "instagram_messages" FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- TABELA: webchat_sessions
-- Visitantes anônimos podem criar sessão; autenticados veem todas
-- ============================================================
ALTER TABLE "webchat_sessions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webchat_sessions_insert_anon" ON "webchat_sessions"
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "webchat_sessions_operators_select" ON "webchat_sessions"
    FOR SELECT USING (
        auth.role() = 'authenticated'
        OR "id"::text = current_setting('request.jwt.claims', TRUE)::json->>'webchat_session_id'
    );

CREATE POLICY "webchat_sessions_operators_update" ON "webchat_sessions"
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- TABELA: webchat_messages
-- ============================================================
ALTER TABLE "webchat_messages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webchat_messages_session_access" ON "webchat_messages"
    FOR ALL USING (
        auth.role() = 'authenticated'
        OR "session_id"::text IN (
            SELECT "id"::text FROM "webchat_sessions"
            WHERE "realtime_channel" = current_setting('request.headers', TRUE)::json->>'x-webchat-channel'
        )
    );

-- ============================================================
-- TABELA: notifications
-- ============================================================
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own_user" ON "notifications"
    FOR ALL USING (auth.uid() = "user_id");

-- ============================================================
-- TABELA: audit_logs
-- ============================================================
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Apenas admin pode ler logs de auditoria
CREATE POLICY "audit_logs_admin_select" ON "audit_logs"
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM "users" u WHERE u."id" = auth.uid() AND u."role" = 'admin')
    );

-- INSERT apenas via service_role (API Routes server-side)
CREATE POLICY "audit_logs_service_insert" ON "audit_logs"
    FOR INSERT WITH CHECK (auth.role() = 'service_role');