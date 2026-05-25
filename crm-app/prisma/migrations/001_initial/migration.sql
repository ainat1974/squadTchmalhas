-- ============================================================
-- Migration 001 — Schema inicial CRM Techmalhas
-- Gerada por: prisma migrate dev --name initial
-- Data: 2026-05-24
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE "user_role" AS ENUM ('admin', 'gestor', 'vendedor_atacado', 'atendente_varejo');
CREATE TYPE "pipeline_type" AS ENUM ('atacado', 'varejo');
CREATE TYPE "deal_status" AS ENUM ('open', 'won', 'lost', 'archived');
CREATE TYPE "activity_type" AS ENUM ('task', 'call', 'meeting', 'email', 'note', 'whatsapp', 'instagram');
CREATE TYPE "interaction_channel" AS ENUM ('whatsapp', 'instagram', 'webchat', 'email', 'note', 'call', 'manual');
CREATE TYPE "interaction_direction" AS ENUM ('inbound', 'outbound', 'internal');
CREATE TYPE "message_status" AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE "lead_source_type" AS ENUM ('whatsapp', 'instagram', 'site_form', 'site_chat', 'manual', 'referral');
CREATE TYPE "audit_action" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'CONSENT');
CREATE TYPE "notification_type" AS ENUM ('new_lead', 'new_message', 'task_due', 'deal_updated', 'mention', 'system');
CREATE TYPE "webchat_session_status" AS ENUM ('waiting', 'active', 'closed', 'abandoned');

-- ============================================================
-- TABELA: users
-- Sincronizada com auth.users via trigger (ver migration 003)
-- ============================================================
CREATE TABLE "users" (
    "id"            UUID PRIMARY KEY,  -- referencia auth.users.id
    "email"         TEXT NOT NULL UNIQUE,
    "full_name"     TEXT NOT NULL,
    "avatar_url"    TEXT,
    "role"          "user_role" NOT NULL DEFAULT 'atendente_varejo',
    "is_active"     BOOLEAN NOT NULL DEFAULT TRUE,
    "phone"         TEXT,
    "last_login_at" TIMESTAMPTZ,
    "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deleted_at"    TIMESTAMPTZ
);

CREATE INDEX "idx_users_email"  ON "users"("email");
CREATE INDEX "idx_users_role"   ON "users"("role");
CREATE INDEX "idx_users_active" ON "users"("is_active") WHERE "deleted_at" IS NULL;

-- ============================================================
-- TABELA: lead_sources
-- ============================================================
CREATE TABLE "lead_sources" (
    "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name"        TEXT NOT NULL,
    "type"        "lead_source_type" NOT NULL,
    "description" TEXT,
    "is_active"   BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dados iniciais
INSERT INTO "lead_sources" ("name", "type") VALUES
    ('WhatsApp Direto',       'whatsapp'),
    ('Instagram DM',          'instagram'),
    ('Instagram Comentário',  'instagram'),
    ('Formulário Site',       'site_form'),
    ('Chat ao Vivo Site',     'site_chat'),
    ('Manual (Vendedor)',     'manual'),
    ('Indicação',             'referral');

-- ============================================================
-- TABELA: contacts
-- ============================================================
CREATE TABLE "contacts" (
    "id"                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "full_name"           TEXT NOT NULL,
    "email"               TEXT,
    "phone"               TEXT,
    "document_cpf"        TEXT,
    "document_cnpj"       TEXT,
    "company_name"        TEXT,
    "is_b2b"              BOOLEAN NOT NULL DEFAULT FALSE,
    "lead_source_id"      UUID REFERENCES "lead_sources"("id"),
    "pipeline_type"       "pipeline_type",
    "dapic_id"            TEXT,
    "dapic_synced_at"     TIMESTAMPTZ,
    "whatsapp_phone"      TEXT,
    "instagram_id"        TEXT,
    "instagram_username"  TEXT,
    "lgpd_consent"        BOOLEAN NOT NULL DEFAULT FALSE,
    "lgpd_consent_at"     TIMESTAMPTZ,
    "lgpd_consent_ip"     INET,
    "assigned_to"         UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "tags"                TEXT[] NOT NULL DEFAULT '{}',
    "notes"               TEXT,
    "avatar_url"          TEXT,
    "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deleted_at"          TIMESTAMPTZ,
    CONSTRAINT "contacts_email_or_phone" CHECK ("email" IS NOT NULL OR "phone" IS NOT NULL)
);

CREATE INDEX "idx_contacts_email"     ON "contacts"("email") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_contacts_phone"     ON "contacts"("phone") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_contacts_whatsapp"  ON "contacts"("whatsapp_phone") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_contacts_instagram" ON "contacts"("instagram_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_contacts_assigned"  ON "contacts"("assigned_to") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_contacts_dapic"     ON "contacts"("dapic_id") WHERE "dapic_id" IS NOT NULL;
CREATE INDEX "idx_contacts_created"   ON "contacts"("created_at" DESC);
CREATE INDEX "idx_contacts_tags"      ON "contacts" USING GIN("tags");

-- ============================================================
-- TABELA: pipelines
-- ============================================================
CREATE TABLE "pipelines" (
    "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name"        TEXT NOT NULL,
    "type"        "pipeline_type" NOT NULL UNIQUE,
    "description" TEXT,
    "is_active"   BOOLEAN NOT NULL DEFAULT TRUE,
    "created_by"  UUID REFERENCES "users"("id"),
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pipelines padrão
INSERT INTO "pipelines" ("name", "type", "description") VALUES
    ('Pipeline Atacado', 'atacado', 'Oportunidades B2B com lojistas'),
    ('Pipeline Varejo',  'varejo',  'Oportunidades B2C com consumidores finais');

-- ============================================================
-- TABELA: stages
-- ============================================================
CREATE TABLE "stages" (
    "id"            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "pipeline_id"   UUID NOT NULL REFERENCES "pipelines"("id") ON DELETE CASCADE,
    "name"          TEXT NOT NULL,
    "description"   TEXT,
    "position"      INTEGER NOT NULL DEFAULT 0,
    "color"         TEXT NOT NULL DEFAULT '#6366f1',
    "is_won_stage"  BOOLEAN NOT NULL DEFAULT FALSE,
    "is_lost_stage" BOOLEAN NOT NULL DEFAULT FALSE,
    "probability"   SMALLINT DEFAULT 0 CHECK ("probability" BETWEEN 0 AND 100),
    "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "stages_unique_position_per_pipeline" UNIQUE ("pipeline_id", "position"),
    CONSTRAINT "stages_won_or_lost" CHECK (NOT ("is_won_stage" AND "is_lost_stage"))
);

CREATE INDEX "idx_stages_pipeline" ON "stages"("pipeline_id", "position");

-- ============================================================
-- TABELA: stage_required_tasks
-- ============================================================
CREATE TABLE "stage_required_tasks" (
    "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "stage_id"        UUID NOT NULL REFERENCES "stages"("id") ON DELETE CASCADE,
    "title"           TEXT NOT NULL,
    "description"     TEXT,
    "activity_type"   "activity_type" NOT NULL DEFAULT 'task',
    "due_days_offset" INTEGER DEFAULT 1,
    "is_active"       BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_stage_required_tasks_stage" ON "stage_required_tasks"("stage_id");

-- ============================================================
-- TABELA: deals
-- ============================================================
CREATE TABLE "deals" (
    "id"                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title"                TEXT NOT NULL,
    "contact_id"           UUID NOT NULL REFERENCES "contacts"("id") ON DELETE RESTRICT,
    "pipeline_id"          UUID NOT NULL REFERENCES "pipelines"("id") ON DELETE RESTRICT,
    "stage_id"             UUID NOT NULL REFERENCES "stages"("id") ON DELETE RESTRICT,
    "assigned_to"          UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "value"                NUMERIC(12,2),
    "currency"             CHAR(3) NOT NULL DEFAULT 'BRL',
    "status"               "deal_status" NOT NULL DEFAULT 'open',
    "closed_at"            TIMESTAMPTZ,
    "lost_reason"          TEXT,
    "dapic_pedido_id"      TEXT,
    "expected_close_date"  DATE,
    "notes"                TEXT,
    "tags"                 TEXT[] NOT NULL DEFAULT '{}',
    "created_by"           UUID REFERENCES "users"("id"),
    "created_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deleted_at"           TIMESTAMPTZ
);

CREATE INDEX "idx_deals_contact"        ON "deals"("contact_id");
CREATE INDEX "idx_deals_pipeline_stage" ON "deals"("pipeline_id", "stage_id");
CREATE INDEX "idx_deals_assigned"       ON "deals"("assigned_to") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_deals_status"         ON "deals"("status") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_deals_created"        ON "deals"("created_at" DESC);
CREATE INDEX "idx_deals_dapic"          ON "deals"("dapic_pedido_id") WHERE "dapic_pedido_id" IS NOT NULL;

-- ============================================================
-- TABELA: activities
-- ============================================================
CREATE TABLE "activities" (
    "id"               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "deal_id"          UUID REFERENCES "deals"("id") ON DELETE CASCADE,
    "contact_id"       UUID REFERENCES "contacts"("id") ON DELETE CASCADE,
    "assigned_to"      UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "created_by"       UUID REFERENCES "users"("id"),
    "type"             "activity_type" NOT NULL DEFAULT 'task',
    "title"            TEXT NOT NULL,
    "description"      TEXT,
    "is_mandatory"     BOOLEAN NOT NULL DEFAULT FALSE,
    "is_done"          BOOLEAN NOT NULL DEFAULT FALSE,
    "done_at"          TIMESTAMPTZ,
    "due_date"         TIMESTAMPTZ,
    "from_template_id" UUID REFERENCES "stage_required_tasks"("id"),
    "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "deleted_at"       TIMESTAMPTZ,
    CONSTRAINT "activities_deal_or_contact" CHECK ("deal_id" IS NOT NULL OR "contact_id" IS NOT NULL)
);

CREATE INDEX "idx_activities_deal"     ON "activities"("deal_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_activities_contact"  ON "activities"("contact_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_activities_assigned" ON "activities"("assigned_to", "is_done") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_activities_due"      ON "activities"("due_date") WHERE "is_done" = FALSE AND "deleted_at" IS NULL;

-- ============================================================
-- TABELAS: mensagens e chat (dependem de interactions)
-- ============================================================

-- whatsapp_messages (criada antes de interactions por FK)
CREATE TABLE "whatsapp_messages" (
    "id"                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "contact_id"            UUID REFERENCES "contacts"("id") ON DELETE SET NULL,
    "meta_message_id"       TEXT NOT NULL UNIQUE,
    "meta_phone_number_id"  TEXT NOT NULL,
    "direction"             "interaction_direction" NOT NULL,
    "status"                "message_status" NOT NULL DEFAULT 'pending',
    "content_type"          TEXT NOT NULL DEFAULT 'text',
    "content_text"          TEXT,
    "content_caption"       TEXT,
    "media_url"             TEXT,
    "media_mime"            TEXT,
    "media_sha256"          TEXT,
    "template_name"         TEXT,
    "template_vars"         JSONB,
    "meta_timestamp"        TIMESTAMPTZ,
    "meta_raw_payload"      JSONB NOT NULL,
    "retry_count"           SMALLINT NOT NULL DEFAULT 0,
    "retry_next_at"         TIMESTAMPTZ,
    "error_code"            TEXT,
    "error_message"         TEXT,
    "created_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_wa_messages_contact" ON "whatsapp_messages"("contact_id", "created_at" DESC);
CREATE INDEX "idx_wa_messages_meta_id" ON "whatsapp_messages"("meta_message_id");
CREATE INDEX "idx_wa_messages_status"  ON "whatsapp_messages"("status") WHERE "status" IN ('pending', 'failed');
CREATE INDEX "idx_wa_messages_retry"   ON "whatsapp_messages"("retry_next_at") WHERE "retry_count" > 0 AND "status" = 'failed';

-- instagram_messages
CREATE TABLE "instagram_messages" (
    "id"                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "contact_id"            UUID REFERENCES "contacts"("id") ON DELETE SET NULL,
    "meta_message_id"       TEXT NOT NULL UNIQUE,
    "meta_ig_account_id"    TEXT NOT NULL,
    "meta_sender_ig_id"     TEXT,
    "is_comment_lead"       BOOLEAN NOT NULL DEFAULT FALSE,
    "source_post_id"        TEXT,
    "direction"             "interaction_direction" NOT NULL,
    "status"                "message_status" NOT NULL DEFAULT 'pending',
    "content_type"          TEXT NOT NULL DEFAULT 'text',
    "content_text"          TEXT,
    "media_url"             TEXT,
    "media_mime"            TEXT,
    "meta_timestamp"        TIMESTAMPTZ,
    "meta_raw_payload"      JSONB NOT NULL,
    "retry_count"           SMALLINT NOT NULL DEFAULT 0,
    "retry_next_at"         TIMESTAMPTZ,
    "error_code"            TEXT,
    "error_message"         TEXT,
    "created_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_ig_messages_contact" ON "instagram_messages"("contact_id", "created_at" DESC);
CREATE INDEX "idx_ig_messages_meta_id" ON "instagram_messages"("meta_message_id");
CREATE INDEX "idx_ig_messages_status"  ON "instagram_messages"("status") WHERE "status" IN ('pending', 'failed');
CREATE INDEX "idx_ig_messages_comment" ON "instagram_messages"("is_comment_lead", "source_post_id") WHERE "is_comment_lead" = TRUE;

-- webchat_sessions
CREATE TABLE "webchat_sessions" (
    "id"                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "contact_id"          UUID REFERENCES "contacts"("id") ON DELETE SET NULL,
    "assigned_to"         UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "status"              "webchat_session_status" NOT NULL DEFAULT 'waiting',
    "visitor_name"        TEXT,
    "visitor_email"       TEXT,
    "visitor_phone"       TEXT,
    "visitor_ip"          INET,
    "visitor_user_agent"  TEXT,
    "lgpd_consent"        BOOLEAN NOT NULL DEFAULT FALSE,
    "lgpd_consent_at"     TIMESTAMPTZ,
    "page_url"            TEXT,
    "referrer"            TEXT,
    "utm_source"          TEXT,
    "utm_medium"          TEXT,
    "utm_campaign"        TEXT,
    "realtime_channel"    TEXT UNIQUE,
    "started_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ended_at"            TIMESTAMPTZ,
    "last_activity_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_webchat_sessions_status"   ON "webchat_sessions"("status", "last_activity_at" DESC);
CREATE INDEX "idx_webchat_sessions_assigned" ON "webchat_sessions"("assigned_to") WHERE "status" IN ('waiting', 'active');
CREATE INDEX "idx_webchat_sessions_contact"  ON "webchat_sessions"("contact_id");
CREATE INDEX "idx_webchat_sessions_idle"     ON "webchat_sessions"("last_activity_at") WHERE "status" = 'active';

-- webchat_messages
CREATE TABLE "webchat_messages" (
    "id"              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "session_id"      UUID NOT NULL REFERENCES "webchat_sessions"("id") ON DELETE CASCADE,
    "is_from_visitor" BOOLEAN NOT NULL DEFAULT TRUE,
    "user_id"         UUID REFERENCES "users"("id"),
    "visitor_name"    TEXT,
    "content"         TEXT NOT NULL,
    "content_type"    TEXT NOT NULL DEFAULT 'text',
    "media_url"       TEXT,
    "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "read_at"         TIMESTAMPTZ
);

CREATE INDEX "idx_webchat_messages_session" ON "webchat_messages"("session_id", "created_at" ASC);
CREATE INDEX "idx_webchat_messages_unread"  ON "webchat_messages"("session_id", "read_at") WHERE "read_at" IS NULL;

-- interactions (unificado — FK para todas as tabelas de mensagens)
CREATE TABLE "interactions" (
    "id"                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "contact_id"            UUID NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    "deal_id"               UUID REFERENCES "deals"("id") ON DELETE SET NULL,
    "user_id"               UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "channel"               "interaction_channel" NOT NULL,
    "direction"             "interaction_direction" NOT NULL DEFAULT 'inbound',
    "content"               TEXT,
    "content_type"          TEXT NOT NULL DEFAULT 'text',
    "media_url"             TEXT,
    "media_mime"            TEXT,
    "whatsapp_message_id"   UUID REFERENCES "whatsapp_messages"("id"),
    "instagram_message_id"  UUID REFERENCES "instagram_messages"("id"),
    "webchat_message_id"    UUID REFERENCES "webchat_messages"("id"),
    "metadata"              JSONB NOT NULL DEFAULT '{}',
    "created_at"            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_interactions_contact"  ON "interactions"("contact_id", "created_at" DESC);
CREATE INDEX "idx_interactions_deal"     ON "interactions"("deal_id", "created_at" DESC);
CREATE INDEX "idx_interactions_channel"  ON "interactions"("channel", "created_at" DESC);
CREATE INDEX "idx_interactions_created"  ON "interactions"("created_at" DESC);

-- notifications
CREATE TABLE "notifications" (
    "id"          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id"     UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type"        "notification_type" NOT NULL,
    "title"       TEXT NOT NULL,
    "body"        TEXT,
    "deal_id"     UUID REFERENCES "deals"("id") ON DELETE CASCADE,
    "contact_id"  UUID REFERENCES "contacts"("id") ON DELETE CASCADE,
    "activity_id" UUID REFERENCES "activities"("id") ON DELETE CASCADE,
    "is_read"     BOOLEAN NOT NULL DEFAULT FALSE,
    "read_at"     TIMESTAMPTZ,
    "link"        TEXT,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_notifications_user_unread" ON "notifications"("user_id", "created_at" DESC) WHERE "is_read" = FALSE;
CREATE INDEX "idx_notifications_user"        ON "notifications"("user_id", "created_at" DESC);

-- audit_logs
CREATE TABLE "audit_logs" (
    "id"             BIGSERIAL PRIMARY KEY,
    "user_id"        UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "user_email"     TEXT NOT NULL,
    "user_role"      "user_role",
    "user_ip"        INET,
    "user_agent"     TEXT,
    "action"         "audit_action" NOT NULL,
    "table_name"     TEXT NOT NULL,
    "record_id"      UUID,
    "changed_fields" TEXT[] NOT NULL DEFAULT '{}',
    "old_values"     JSONB,
    "request_id"     TEXT,
    "created_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "idx_audit_logs_user"         ON "audit_logs"("user_id", "created_at" DESC);
CREATE INDEX "idx_audit_logs_table_record" ON "audit_logs"("table_name", "record_id");
CREATE INDEX "idx_audit_logs_created"      ON "audit_logs"("created_at" DESC);
CREATE INDEX "idx_audit_logs_action"       ON "audit_logs"("action", "created_at" DESC);

-- ============================================================
-- FUNÇÃO: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER "trg_users_updated_at"      BEFORE UPDATE ON "users"              FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER "trg_contacts_updated_at"   BEFORE UPDATE ON "contacts"           FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER "trg_pipelines_updated_at"  BEFORE UPDATE ON "pipelines"          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER "trg_stages_updated_at"     BEFORE UPDATE ON "stages"             FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER "trg_deals_updated_at"      BEFORE UPDATE ON "deals"              FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER "trg_activities_updated_at" BEFORE UPDATE ON "activities"         FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER "trg_wa_updated_at"         BEFORE UPDATE ON "whatsapp_messages"  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER "trg_ig_updated_at"         BEFORE UPDATE ON "instagram_messages" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- FUNÇÃO: criar atividades obrigatórias ao mover deal de stage
-- (hard block no backend — ver API)
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_mandatory_activities_on_stage_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
        INSERT INTO "activities" (
            "deal_id", "contact_id", "assigned_to", "created_by",
            "type", "title", "description", "is_mandatory", "due_date", "from_template_id"
        )
        SELECT
            NEW.id,
            NEW.contact_id,
            NEW.assigned_to,
            NEW.assigned_to,
            srt."activity_type",
            srt."title",
            srt."description",
            TRUE,
            NOW() + (srt."due_days_offset" || ' days')::INTERVAL,
            srt."id"
        FROM "stage_required_tasks" srt
        WHERE srt."stage_id" = NEW.stage_id AND srt."is_active" = TRUE;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "trg_deals_stage_change"
    AFTER UPDATE ON "deals"
    FOR EACH ROW EXECUTE FUNCTION public.create_mandatory_activities_on_stage_change();