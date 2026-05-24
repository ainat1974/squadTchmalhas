# Database Schema — CRM Techmalhas

> **TL;DR:** Schema Prisma 6.x com 14 models, 10 enums, 3 migrations SQL (initial + RLS + auth trigger).
> RLS habilitado em todas as tabelas com PII. Seed com pipelines Atacado + Varejo, stages padrão,
> usuários de teste (admin, gestor, vendedor_atacado, atendente_varejo) e 10 contatos / 5 deals fake.

---

## Estrutura de Arquivos

```
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
    ├── 001_initial/
    │   └── migration.sql
    ├── 002_rls_policies.sql
    └── 003_auth_user_trigger.sql
lib/
└── db.ts
```

---

## `prisma/schema.prisma`

```prisma
// =============================================================
// CRM Techmalhas — Prisma Schema
// Stack: Prisma 6.x + Supabase (PostgreSQL 15) + Vercel
// IMPORTANTE: 
//   - DATABASE_URL  → Supabase Transaction Pooler (porta 6543) — para queries
//   - DIRECT_URL    → Supabase Direct Connection (porta 5432)  — para migrations
// =============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================================
// ENUMS
// ============================================================

enum UserRole {
  admin
  gestor
  vendedor_atacado
  atendente_varejo

  @@map("user_role")
}

enum PipelineType {
  atacado
  varejo

  @@map("pipeline_type")
}

enum DealStatus {
  open
  won
  lost
  archived

  @@map("deal_status")
}

enum ActivityType {
  task
  call
  meeting
  email
  note
  whatsapp
  instagram

  @@map("activity_type")
}

enum InteractionChannel {
  whatsapp
  instagram
  webchat
  email
  note
  call
  manual

  @@map("interaction_channel")
}

enum InteractionDirection {
  inbound
  outbound
  internal

  @@map("interaction_direction")
}

enum MessageStatus {
  pending
  sent
  delivered
  read
  failed

  @@map("message_status")
}

enum LeadSourceType {
  whatsapp
  instagram
  site_form
  site_chat
  manual
  referral

  @@map("lead_source_type")
}

enum AuditAction {
  CREATE
  READ
  UPDATE
  DELETE
  EXPORT
  LOGIN
  CONSENT

  @@map("audit_action")
}

enum NotificationType {
  new_lead
  new_message
  task_due
  deal_updated
  mention
  system

  @@map("notification_type")
}

enum WebchatSessionStatus {
  waiting
  active
  closed
  abandoned

  @@map("webchat_session_status")
}

// ============================================================
// MODEL: User
// Sincronizado com auth.users do Supabase via trigger SQL
// ============================================================
model User {
  id          String    @id @db.Uuid
  email       String    @unique @db.Text
  fullName    String    @map("full_name") @db.Text
  avatarUrl   String?   @map("avatar_url") @db.Text
  role        UserRole  @default(atendente_varejo)
  isActive    Boolean   @default(true) @map("is_active")
  phone       String?   @db.Text
  lastLoginAt DateTime? @map("last_login_at") @db.Timestamptz
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime  @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt   DateTime? @map("deleted_at") @db.Timestamptz

  // Relations
  contacts              Contact[]      @relation("ContactOwner")
  dealsOwned            Deal[]         @relation("DealOwner")
  dealsCreated          Deal[]         @relation("DealCreatedBy")
  activitiesAssigned    Activity[]     @relation("ActivityAssignee")
  activitiesCreated     Activity[]     @relation("ActivityCreatedBy")
  interactions          Interaction[]
  pipelinesCreated      Pipeline[]
  notifications         Notification[]
  webchatSessions       WebchatSession[]
  auditLogs             AuditLog[]

  @@index([email])
  @@index([role])
  @@index([isActive])
  @@map("users")
}

// ============================================================
// MODEL: LeadSource
// Tabela lookup — origens de leads
// ============================================================
model LeadSource {
  id          String         @id @default(uuid()) @db.Uuid
  name        String         @db.Text
  type        LeadSourceType
  description String?        @db.Text
  isActive    Boolean        @default(true) @map("is_active")
  createdAt   DateTime       @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  contacts Contact[]

  @@map("lead_sources")
}

// ============================================================
// MODEL: Contact
// Unifica lead + cliente. dapic_id reservado para integração futura.
// ============================================================
model Contact {
  id              String        @id @default(uuid()) @db.Uuid
  fullName        String        @map("full_name") @db.Text
  email           String?       @db.Text
  phone           String?       @db.Text
  documentCpf     String?       @map("document_cpf") @db.Text
  documentCnpj    String?       @map("document_cnpj") @db.Text
  companyName     String?       @map("company_name") @db.Text
  isB2b           Boolean       @default(false) @map("is_b2b")
  leadSourceId    String?       @map("lead_source_id") @db.Uuid
  pipelineType    PipelineType? @map("pipeline_type")
  // Dapic — reservado para v2
  dapicId         String?       @map("dapic_id") @db.Text
  dapicSyncedAt   DateTime?     @map("dapic_synced_at") @db.Timestamptz
  // Canais de contato
  whatsappPhone   String?       @map("whatsapp_phone") @db.Text
  instagramId     String?       @map("instagram_id") @db.Text
  instagramUsername String?     @map("instagram_username") @db.Text
  // LGPD
  lgpdConsent     Boolean       @default(false) @map("lgpd_consent")
  lgpdConsentAt   DateTime?     @map("lgpd_consent_at") @db.Timestamptz
  lgpdConsentIp   String?       @map("lgpd_consent_ip") @db.Inet
  // Responsável
  assignedTo      String?       @map("assigned_to") @db.Uuid
  // Metadados
  tags            String[]      @default([]) @db.Text
  notes           String?       @db.Text
  avatarUrl       String?       @map("avatar_url") @db.Text
  createdAt       DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime      @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime?     @map("deleted_at") @db.Timestamptz

  // Relations
  owner             User?              @relation("ContactOwner", fields: [assignedTo], references: [id])
  leadSource        LeadSource?        @relation(fields: [leadSourceId], references: [id])
  deals             Deal[]
  activities        Activity[]
  interactions      Interaction[]
  whatsappMessages  WhatsappMessage[]
  instagramMessages InstagramMessage[]
  notifications     Notification[]

  @@index([email])
  @@index([phone])
  @@index([whatsappPhone], map: "idx_contacts_whatsapp")
  @@index([instagramId], map: "idx_contacts_instagram")
  @@index([assignedTo], map: "idx_contacts_assigned")
  @@index([dapicId], map: "idx_contacts_dapic")
  @@index([createdAt(sort: Desc)], map: "idx_contacts_created")
  @@map("contacts")
}

// ============================================================
// MODEL: Pipeline
// Pipeline Atacado (B2B) ou Varejo (B2C)
// ============================================================
model Pipeline {
  id          String       @id @default(uuid()) @db.Uuid
  name        String       @db.Text
  type        PipelineType @unique
  description String?      @db.Text
  isActive    Boolean      @default(true) @map("is_active")
  createdBy   String?      @map("created_by") @db.Uuid
  createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime     @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  creator User?    @relation(fields: [createdBy], references: [id])
  stages  Stage[]
  deals   Deal[]

  @@map("pipelines")
}

// ============================================================
// MODEL: Stage
// Etapas configuráveis por pipeline
// ============================================================
model Stage {
  id            String   @id @default(uuid()) @db.Uuid
  pipelineId    String   @map("pipeline_id") @db.Uuid
  name          String   @db.Text
  description   String?  @db.Text
  position      Int      @default(0)
  color         String   @default("#6366f1") @db.Text
  isWonStage    Boolean  @default(false) @map("is_won_stage")
  isLostStage   Boolean  @default(false) @map("is_lost_stage")
  probability   Int      @default(0)
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  pipeline       Pipeline            @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  deals          Deal[]
  requiredTasks  StageRequiredTask[]

  @@unique([pipelineId, position], map: "stages_unique_position_per_pipeline")
  @@index([pipelineId, position], map: "idx_stages_pipeline")
  @@map("stages")
}

// ============================================================
// MODEL: StageRequiredTask
// Templates de tarefas obrigatórias geradas ao mover para o stage
// ============================================================
model StageRequiredTask {
  id            String       @id @default(uuid()) @db.Uuid
  stageId       String       @map("stage_id") @db.Uuid
  title         String       @db.Text
  description   String?      @db.Text
  activityType  ActivityType @default(task) @map("activity_type")
  dueDaysOffset Int          @default(1) @map("due_days_offset")
  isActive      Boolean      @default(true) @map("is_active")
  createdAt     DateTime     @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  stage      Stage      @relation(fields: [stageId], references: [id], onDelete: Cascade)
  activities Activity[]

  @@index([stageId], map: "idx_stage_required_tasks_stage")
  @@map("stage_required_tasks")
}

// ============================================================
// MODEL: Deal
// Oportunidades. dapic_pedido_id reservado para v2.
// ============================================================
model Deal {
  id                String     @id @default(uuid()) @db.Uuid
  title             String     @db.Text
  contactId         String     @map("contact_id") @db.Uuid
  pipelineId        String     @map("pipeline_id") @db.Uuid
  stageId           String     @map("stage_id") @db.Uuid
  assignedTo        String?    @map("assigned_to") @db.Uuid
  // Financeiro
  value             Decimal?   @db.Decimal(12, 2)
  currency          String     @default("BRL") @db.Char(3)
  // Status
  status            DealStatus @default(open)
  closedAt          DateTime?  @map("closed_at") @db.Timestamptz
  lostReason        String?    @map("lost_reason") @db.Text
  // Dapic — reservado para v2
  dapicPedidoId     String?    @map("dapic_pedido_id") @db.Text
  // Metadados
  expectedCloseDate DateTime?  @map("expected_close_date") @db.Date
  notes             String?    @db.Text
  tags              String[]   @default([]) @db.Text
  createdBy         String?    @map("created_by") @db.Uuid
  createdAt         DateTime   @default(now()) @map("created_at") @db.Timestamptz
  updatedAt         DateTime   @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt         DateTime?  @map("deleted_at") @db.Timestamptz

  // Relations
  contact       Contact       @relation(fields: [contactId], references: [id])
  pipeline      Pipeline      @relation(fields: [pipelineId], references: [id])
  stage         Stage         @relation(fields: [stageId], references: [id])
  owner         User?         @relation("DealOwner", fields: [assignedTo], references: [id])
  creator       User?         @relation("DealCreatedBy", fields: [createdBy], references: [id])
  activities    Activity[]
  interactions  Interaction[]
  notifications Notification[]

  @@index([contactId], map: "idx_deals_contact")
  @@index([pipelineId, stageId], map: "idx_deals_pipeline_stage")
  @@index([assignedTo], map: "idx_deals_assigned")
  @@index([status], map: "idx_deals_status")
  @@index([createdAt(sort: Desc)], map: "idx_deals_created")
  @@index([dapicPedidoId], map: "idx_deals_dapic")
  @@map("deals")
}

// ============================================================
// MODEL: Activity
// Tarefas, ligações, reuniões, notas por deal ou contact
// ============================================================
model Activity {
  id              String       @id @default(uuid()) @db.Uuid
  dealId          String?      @map("deal_id") @db.Uuid
  contactId       String?      @map("contact_id") @db.Uuid
  assignedTo      String?      @map("assigned_to") @db.Uuid
  createdBy       String?      @map("created_by") @db.Uuid
  type            ActivityType @default(task)
  title           String       @db.Text
  description     String?      @db.Text
  isMandatory     Boolean      @default(false) @map("is_mandatory")
  isDone          Boolean      @default(false) @map("is_done")
  doneAt          DateTime?    @map("done_at") @db.Timestamptz
  dueDate         DateTime?    @map("due_date") @db.Timestamptz
  fromTemplateId  String?      @map("from_template_id") @db.Uuid
  createdAt       DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime     @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime?    @map("deleted_at") @db.Timestamptz

  // Relations
  deal         Deal?              @relation(fields: [dealId], references: [id], onDelete: Cascade)
  contact      Contact?           @relation(fields: [contactId], references: [id], onDelete: Cascade)
  assignee     User?              @relation("ActivityAssignee", fields: [assignedTo], references: [id], onDelete: SetNull)
  creator      User?              @relation("ActivityCreatedBy", fields: [createdBy], references: [id])
  fromTemplate StageRequiredTask? @relation(fields: [fromTemplateId], references: [id])
  notifications Notification[]

  @@index([dealId], map: "idx_activities_deal")
  @@index([contactId], map: "idx_activities_contact")
  @@index([assignedTo, isDone], map: "idx_activities_assigned")
  @@index([dueDate], map: "idx_activities_due")
  @@map("activities")
}

// ============================================================
// MODEL: Interaction
// Histórico unificado de todas as comunicações
// ============================================================
model Interaction {
  id                    String               @id @default(uuid()) @db.Uuid
  contactId             String               @map("contact_id") @db.Uuid
  dealId                String?              @map("deal_id") @db.Uuid
  userId                String?              @map("user_id") @db.Uuid
  channel               InteractionChannel
  direction             InteractionDirection @default(inbound)
  content               String?              @db.Text
  contentType           String               @default("text") @map("content_type") @db.Text
  mediaUrl              String?              @map("media_url") @db.Text
  mediaMime             String?              @map("media_mime") @db.Text
  whatsappMessageId     String?              @map("whatsapp_message_id") @db.Uuid
  instagramMessageId    String?              @map("instagram_message_id") @db.Uuid
  webchatMessageId      String?              @map("webchat_message_id") @db.Uuid
  metadata              Json                 @default("{}") @db.JsonB
  createdAt             DateTime             @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  contact           Contact           @relation(fields: [contactId], references: [id], onDelete: Cascade)
  deal              Deal?             @relation(fields: [dealId], references: [id], onDelete: SetNull)
  user              User?             @relation(fields: [userId], references: [id], onDelete: SetNull)
  whatsappMessage   WhatsappMessage?  @relation(fields: [whatsappMessageId], references: [id])
  instagramMessage  InstagramMessage? @relation(fields: [instagramMessageId], references: [id])
  webchatMessage    WebchatMessage?   @relation(fields: [webchatMessageId], references: [id])

  @@index([contactId, createdAt(sort: Desc)], map: "idx_interactions_contact")
  @@index([dealId, createdAt(sort: Desc)], map: "idx_interactions_deal")
  @@index([channel, createdAt(sort: Desc)], map: "idx_interactions_channel")
  @@index([createdAt(sort: Desc)], map: "idx_interactions_created")
  @@map("interactions")
}

// ============================================================
// MODEL: WhatsappMessage
// Rastreia mensagens Meta WhatsApp. meta_message_id = idempotência.
// ============================================================
model WhatsappMessage {
  id                  String               @id @default(uuid()) @db.Uuid
  contactId           String?              @map("contact_id") @db.Uuid
  metaMessageId       String               @unique @map("meta_message_id") @db.Text
  metaPhoneNumberId   String               @map("meta_phone_number_id") @db.Text
  direction           InteractionDirection
  status              MessageStatus        @default(pending)
  contentType         String               @default("text") @map("content_type") @db.Text
  contentText         String?              @map("content_text") @db.Text
  contentCaption      String?              @map("content_caption") @db.Text
  mediaUrl            String?              @map("media_url") @db.Text
  mediaMime           String?              @map("media_mime") @db.Text
  mediaSha256         String?              @map("media_sha256") @db.Text
  templateName        String?              @map("template_name") @db.Text
  templateVars        Json?                @map("template_vars") @db.JsonB
  metaTimestamp       DateTime?            @map("meta_timestamp") @db.Timestamptz
  metaRawPayload      Json                 @map("meta_raw_payload") @db.JsonB
  retryCount          Int                  @default(0) @map("retry_count") @db.SmallInt
  retryNextAt         DateTime?            @map("retry_next_at") @db.Timestamptz
  errorCode           String?              @map("error_code") @db.Text
  errorMessage        String?              @map("error_message") @db.Text
  createdAt           DateTime             @default(now()) @map("created_at") @db.Timestamptz
  updatedAt           DateTime             @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  contact      Contact?      @relation(fields: [contactId], references: [id], onDelete: SetNull)
  interactions Interaction[]

  @@index([contactId, createdAt(sort: Desc)], map: "idx_wa_messages_contact")
  @@index([metaMessageId], map: "idx_wa_messages_meta_id")
  @@index([status], map: "idx_wa_messages_status")
  @@index([retryNextAt], map: "idx_wa_messages_retry")
  @@map("whatsapp_messages")
}

// ============================================================
// MODEL: InstagramMessage
// Similar ao WhatsappMessage para Instagram Messaging API
// ============================================================
model InstagramMessage {
  id                    String               @id @default(uuid()) @db.Uuid
  contactId             String?              @map("contact_id") @db.Uuid
  metaMessageId         String               @unique @map("meta_message_id") @db.Text
  metaIgAccountId       String               @map("meta_ig_account_id") @db.Text
  metaSenderIgId        String?              @map("meta_sender_ig_id") @db.Text
  isCommentLead         Boolean              @default(false) @map("is_comment_lead")
  sourcePostId          String?              @map("source_post_id") @db.Text
  direction             InteractionDirection
  status                MessageStatus        @default(pending)
  contentType           String               @default("text") @map("content_type") @db.Text
  contentText           String?              @map("content_text") @db.Text
  mediaUrl              String?              @map("media_url") @db.Text
  mediaMime             String?              @map("media_mime") @db.Text
  metaTimestamp         DateTime?            @map("meta_timestamp") @db.Timestamptz
  metaRawPayload        Json                 @map("meta_raw_payload") @db.JsonB
  retryCount            Int                  @default(0) @map("retry_count") @db.SmallInt
  retryNextAt           DateTime?            @map("retry_next_at") @db.Timestamptz
  errorCode             String?              @map("error_code") @db.Text
  errorMessage          String?              @map("error_message") @db.Text
  createdAt             DateTime             @default(now()) @map("created_at") @db.Timestamptz
  updatedAt             DateTime             @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  contact      Contact?      @relation(fields: [contactId], references: [id], onDelete: SetNull)
  interactions Interaction[]

  @@index([contactId, createdAt(sort: Desc)], map: "idx_ig_messages_contact")
  @@index([metaMessageId], map: "idx_ig_messages_meta_id")
  @@index([status], map: "idx_ig_messages_status")
  @@index([isCommentLead, sourcePostId], map: "idx_ig_messages_comment")
  @@map("instagram_messages")
}

// ============================================================
// MODEL: WebchatSession
// Sessões do chat ao vivo do site techmalhas.com.br
// ============================================================
model WebchatSession {
  id                String               @id @default(uuid()) @db.Uuid
  contactId         String?              @map("contact_id") @db.Uuid
  assignedTo        String?              @map("assigned_to") @db.Uuid
  status            WebchatSessionStatus @default(waiting)
  visitorName       String?              @map("visitor_name") @db.Text
  visitorEmail      String?              @map("visitor_email") @db.Text
  visitorPhone      String?              @map("visitor_phone") @db.Text
  visitorIp         String?              @map("visitor_ip") @db.Inet
  visitorUserAgent  String?              @map("visitor_user_agent") @db.Text
  lgpdConsent       Boolean              @default(false) @map("lgpd_consent")
  lgpdConsentAt     DateTime?            @map("lgpd_consent_at") @db.Timestamptz
  pageUrl           String?              @map("page_url") @db.Text
  referrer          String?              @db.Text
  utmSource         String?              @map("utm_source") @db.Text
  utmMedium         String?              @map("utm_medium") @db.Text
  utmCampaign       String?              @map("utm_campaign") @db.Text
  realtimeChannel   String?              @unique @map("realtime_channel") @db.Text
  startedAt         DateTime             @default(now()) @map("started_at") @db.Timestamptz
  endedAt           DateTime?            @map("ended_at") @db.Timestamptz
  lastActivityAt    DateTime             @default(now()) @map("last_activity_at") @db.Timestamptz
  createdAt         DateTime             @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  contact   Contact?        @relation(fields: [contactId], references: [id], onDelete: SetNull)
  operator  User?           @relation(fields: [assignedTo], references: [id], onDelete: SetNull)
  messages  WebchatMessage[]

  @@index([status, lastActivityAt(sort: Desc)], map: "idx_webchat_sessions_status")
  @@index([assignedTo], map: "idx_webchat_sessions_assigned")
  @@index([contactId], map: "idx_webchat_sessions_contact")
  @@index([lastActivityAt], map: "idx_webchat_sessions_idle")
  @@map("webchat_sessions")
}

// ============================================================
// MODEL: WebchatMessage
// Mensagens do chat ao vivo
// ============================================================
model WebchatMessage {
  id            String         @id @default(uuid()) @db.Uuid
  sessionId     String         @map("session_id") @db.Uuid
  isFromVisitor Boolean        @default(true) @map("is_from_visitor")
  userId        String?        @map("user_id") @db.Uuid
  visitorName   String?        @map("visitor_name") @db.Text
  content       String         @db.Text
  contentType   String         @default("text") @map("content_type") @db.Text
  mediaUrl      String?        @map("media_url") @db.Text
  createdAt     DateTime       @default(now()) @map("created_at") @db.Timestamptz
  readAt        DateTime?      @map("read_at") @db.Timestamptz

  // Relations
  session      WebchatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  interactions Interaction[]

  @@index([sessionId, createdAt(sort: Asc)], map: "idx_webchat_messages_session")
  @@index([sessionId, readAt], map: "idx_webchat_messages_unread")
  @@map("webchat_messages")
}

// ============================================================
// MODEL: Notification
// Notificações em tempo real para usuários do CRM
// ============================================================
model Notification {
  id         String           @id @default(uuid()) @db.Uuid
  userId     String           @map("user_id") @db.Uuid
  type       NotificationType
  title      String           @db.Text
  body       String?          @db.Text
  dealId     String?          @map("deal_id") @db.Uuid
  contactId  String?          @map("contact_id") @db.Uuid
  activityId String?          @map("activity_id") @db.Uuid
  isRead     Boolean          @default(false) @map("is_read")
  readAt     DateTime?        @map("read_at") @db.Timestamptz
  link       String?          @db.Text
  createdAt  DateTime         @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  deal     Deal?     @relation(fields: [dealId], references: [id], onDelete: Cascade)
  contact  Contact?  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  activity Activity? @relation(fields: [activityId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt(sort: Desc)], map: "idx_notifications_user_unread")
  @@index([userId, createdAt(sort: Desc)], map: "idx_notifications_user")
  @@map("notifications")
}

// ============================================================
// MODEL: AuditLog
// LGPD: registro de todo CRUD em dados de PII
// ============================================================
model AuditLog {
  id            BigInt      @id @default(autoincrement())
  userId        String?     @map("user_id") @db.Uuid
  userEmail     String      @map("user_email") @db.Text
  userRole      UserRole?   @map("user_role")
  userIp        String?     @map("user_ip") @db.Inet
  userAgent     String?     @map("user_agent") @db.Text
  action        AuditAction
  tableName     String      @map("table_name") @db.Text
  recordId      String?     @map("record_id") @db.Uuid
  changedFields String[]    @default([]) @map("changed_fields") @db.Text
  oldValues     Json?       @map("old_values") @db.JsonB
  requestId     String?     @map("request_id") @db.Text
  createdAt     DateTime    @default(now()) @map("created_at") @db.Timestamptz

  // Relations
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt(sort: Desc)], map: "idx_audit_logs_user")
  @@index([tableName, recordId], map: "idx_audit_logs_table_record")
  @@index([createdAt(sort: Desc)], map: "idx_audit_logs_created")
  @@index([action, createdAt(sort: Desc)], map: "idx_audit_logs_action")
  @@map("audit_logs")
}
```

---

## `prisma/migrations/001_initial/migration.sql`

```sql
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
```

---

## `prisma/migrations/002_rls_policies.sql`

```sql
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
```

---

## `prisma/migrations/003_auth_user_trigger.sql`

```sql
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
```

---

## `prisma/seed.ts`

```typescript
/**
 * prisma/seed.ts — Seed de desenvolvimento CRM Techmalhas
 * 
 * Cria:
 * - 4 usuários (admin, gestor, vendedor_atacado, atendente_varejo)
 * - 2 pipelines com stages padrão e tarefas obrigatórias
 * - 7 lead sources
 * - 10 contatos (5 B2B + 5 B2C)
 * - 5 deals (3 atacado + 2 varejo)
 * - Activities de teste
 *
 * ATENÇÃO: Este seed manipula diretamente via Prisma (bypassa RLS).
 * Em produção, usuários são criados via Supabase Auth.
 *
 * Executar: pnpm tsx prisma/seed.ts
 */

import { PrismaClient, UserRole, PipelineType, ActivityType } from '@prisma/client'

const prisma = new PrismaClient()

// UUIDs fixos para referências entre entidades no seed
const SEED_IDS = {
  users: {
    admin:            'a0000000-0000-0000-0000-000000000001',
    gestor:           'a0000000-0000-0000-0000-000000000002',
    vendedorAtacado:  'a0000000-0000-0000-0000-000000000003',
    atendenteVarejo:  'a0000000-0000-0000-0000-000000000004',
  },
  leadSources: {
    whatsapp:         'b0000000-0000-0000-0000-000000000001',
    instagramDm:      'b0000000-0000-0000-0000-000000000002',
    instagramComent:  'b0000000-0000-0000-0000-000000000003',
    formularioSite:   'b0000000-0000-0000-0000-000000000004',
    chatSite:         'b0000000-0000-0000-0000-000000000005',
    manual:           'b0000000-0000-0000-0000-000000000006',
    indicacao:        'b0000000-0000-0000-0000-000000000007',
  },
  pipelines: {
    atacado:  'c0000000-0000-0000-0000-000000000001',
    varejo:   'c0000000-0000-0000-0000-000000000002',
  },
}

async function seedUsers() {
  console.log('🌱 Criando usuários...')
  
  const users = [
    {
      id:       SEED_IDS.users.admin,
      email:    'admin@techmalhas.com.br',
      fullName: 'Admin Techmalhas',
      role:     UserRole.admin,
    },
    {
      id:       SEED_IDS.users.gestor,
      email:    'renato@techmalhas.com.br',
      fullName: 'Renato Gestor',
      role:     UserRole.gestor,
    },
    {
      id:       SEED_IDS.users.vendedorAtacado,
      email:    'vitor@techmalhas.com.br',
      fullName: 'Vitor Vendedor',
      role:     UserRole.vendedor_atacado,
    },
    {
      id:       SEED_IDS.users.atendenteVarejo,
      email:    'amanda@techmalhas.com.br',
      fullName: 'Amanda Atendente',
      role:     UserRole.atendente_varejo,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where:  { id: user.id },
      update: {},
      create: user,
    })
  }
  console.log(`  ✅ ${users.length} usuários criados`)
}

async function seedLeadSources() {
  console.log('🌱 Criando lead sources...')

  const sources = [
    { id: SEED_IDS.leadSources.whatsapp,       name: 'WhatsApp Direto',      type: 'whatsapp'   as const },
    { id: SEED_IDS.leadSources.instagramDm,    name: 'Instagram DM',         type: 'instagram'  as const },
    { id: SEED_IDS.leadSources.instagramComent,name: 'Instagram Comentário', type: 'instagram'  as const },
    { id: SEED_IDS.leadSources.formularioSite, name: 'Formulário Site',      type: 'site_form'  as const },
    { id: SEED_IDS.leadSources.chatSite,       name: 'Chat ao Vivo Site',    type: 'site_chat'  as const },
    { id: SEED_IDS.leadSources.manual,         name: 'Manual (Vendedor)',    type: 'manual'     as const },
    { id: SEED_IDS.leadSources.indicacao,      name: 'Indicação',            type: 'referral'   as const },
  ]

  for (const source of sources) {
    await prisma.leadSource.upsert({
      where:  { id: source.id },
      update: {},
      create: source,
    })
  }
  console.log(`  ✅ ${sources.length} lead sources criados`)
}

async function seedPipelines() {
  console.log('🌱 Criando pipelines e stages...')

  // ─── Pipeline Atacado (B2B — Lojistas) ───────────────────
  const atacado = await prisma.pipeline.upsert({
    where:  { type: PipelineType.atacado },
    update: {},
    create: {
      id:          SEED_IDS.pipelines.atacado,
      name:        'Pipeline Atacado',
      type:        PipelineType.atacado,
      description: 'Oportunidades B2B com lojistas',
    },
  })

  const stagesAtacado = [
    { name: 'Novo Lead',         position: 0, color: '#6366f1', probability: 5  },
    { name: 'Contato Realizado', position: 1, color: '#3b82f6', probability: 15 },
    { name: 'Proposta Enviada',  position: 2, color: '#f59e0b', probability: 40 },
    { name: 'Negociação',        position: 3, color: '#f97316', probability: 70 },
    { name: 'Pedido Fechado',    position: 4, color: '#22c55e', probability: 100, isWonStage: true  },
    { name: 'Perdido',           position: 5, color: '#ef4444', probability: 0,   isLostStage: true },
  ]

  const createdStagesAtacado: Array<{ id: string; position: number; name: string }> = []
  for (const stage of stagesAtacado) {
    const created = await prisma.stage.upsert({
      where:  { stages_unique_position_per_pipeline: { pipelineId: atacado.id, position: stage.position } },
      update: {},
      create: { ...stage, pipelineId: atacado.id },
    })
    createdStagesAtacado.push(created)
  }

  // Tarefas obrigatórias no stage "Proposta Enviada" (posição 2)
  const stagePropostaAtacado = createdStagesAtacado.find(s => s.position === 2)!
  await prisma.stageRequiredTask.createMany({
    skipDuplicates: true,
    data: [
      {
        stageId:        stagePropostaAtacado.id,
        title:          'Enviar tabela de preços atualizada',
        activityType:   ActivityType.task,
        dueDaysOffset:  1,
      },
      {
        stageId:        stagePropostaAtacado.id,
        title:          'Confirmar recebimento da proposta por WhatsApp',
        activityType:   ActivityType.whatsapp,
        dueDaysOffset:  2,
      },
    ],
  })

  // ─── Pipeline Varejo (B2C — Consumidores) ────────────────
  const varejo = await prisma.pipeline.upsert({
    where:  { type: PipelineType.varejo },
    update: {},
    create: {
      id:          SEED_IDS.pipelines.varejo,
      name:        'Pipeline Varejo',
      type:        PipelineType.varejo,
      description: 'Oportunidades B2C com consumidores finais',
    },
  })

  const stagesVarejo = [
    { name: 'Novo Lead',          position: 0, color: '#6366f1', probability: 5  },
    { name: 'Atendimento Ativo',  position: 1, color: '#3b82f6', probability: 20 },
    { name: 'Carrinho / Orçado',  position: 2, color: '#f59e0b', probability: 50 },
    { name: 'Compra Confirmada',  position: 3, color: '#22c55e', probability: 100, isWonStage: true  },
    { name: 'Desistiu',           position: 4, color: '#ef4444', probability: 0,   isLostStage: true },
  ]

  for (const stage of stagesVarejo) {
    await prisma.stage.upsert({
      where:  { stages_unique_position_per_pipeline: { pipelineId: varejo.id, position: stage.position } },
      update: {},
      create: { ...stage, pipelineId: varejo.id },
    })
  }

  console.log('  ✅ 2 pipelines com stages criados (atacado: 6 stages, varejo: 5 stages)')
  return { atacadoId: atacado.id, varejoId: varejo.id, stagesAtacado: createdStagesAtacado }
}

async function seedContacts() {
  console.log('🌱 Criando contatos...')

  const contacts = [
    // B2B — Lojistas (atacado)
    {
      fullName: 'José Moreira',      email: 'jose@modajoao.com.br',     phone: '+5511999991001',
      companyName: 'Moda João LTDA', isB2b: true, pipelineType: PipelineType.atacado,
      leadSourceId: SEED_IDS.leadSources.whatsapp,    assignedTo: SEED_IDS.users.vendedorAtacado,
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-01'),
      tags: ['lojista', 'atacado', 'sp'],
    },
    {
      fullName: 'Fernanda Lima',     email: 'fernanda@boutiquefem.com', phone: '+5511999991002',
      companyName: 'Boutique Fem',   isB2b: true, pipelineType: PipelineType.atacado,
      leadSourceId: SEED_IDS.leadSources.instagramDm, assignedTo: SEED_IDS.users.vendedorAtacado,
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-05'),
      tags: ['lojista', 'atacado', 'mg'],
    },
    {
      fullName: 'Roberto Alves',     email: 'roberto@altamoda.com',    phone: '+5521999991003',
      companyName: 'Alta Moda RJ',   isB2b: true, pipelineType: PipelineType.atacado,
      leadSourceId: SEED_IDS.leadSources.formularioSite, assignedTo: SEED_IDS.users.vendedorAtacado,
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-10'),
      tags: ['lojista', 'atacado', 'rj'],
    },
    {
      fullName: 'Patricia Souza',    email: 'patricia@styles.com.br',  phone: '+5531999991004',
      companyName: 'Styles MG',      isB2b: true, pipelineType: PipelineType.atacado,
      leadSourceId: SEED_IDS.leadSources.indicacao,   assignedTo: SEED_IDS.users.vendedorAtacado,
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-12'),
      tags: ['lojista', 'atacado', 'novo'],
    },
    {
      fullName: 'Carlos Mendes',     email: 'carlos@fashionbr.com',    phone: '+5511999991005',
      companyName: 'Fashion BR',     isB2b: true, pipelineType: PipelineType.atacado,
      leadSourceId: SEED_IDS.leadSources.manual,      assignedTo: SEED_IDS.users.vendedorAtacado,
      lgpdConsent: false,
      tags: ['lojista', 'atacado', 'lgpd-pendente'],
    },
    // B2C — Consumidores (varejo)
    {
      fullName: 'Ana Beatriz Costa', email: 'ana.beatriz@gmail.com',   phone: '+5511988881001',
      isB2b: false, pipelineType: PipelineType.varejo,
      leadSourceId: SEED_IDS.leadSources.instagramDm, assignedTo: SEED_IDS.users.atendenteVarejo,
      instagramId: '123456789', instagramUsername: 'ana.bea',
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-15'),
      tags: ['varejo', 'instagram', 'feminino'],
    },
    {
      fullName: 'Lucas Ferreira',    email: 'lucas.f@hotmail.com',     phone: '+5511988881002',
      isB2b: false, pipelineType: PipelineType.varejo,
      leadSourceId: SEED_IDS.leadSources.chatSite,    assignedTo: SEED_IDS.users.atendenteVarejo,
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-16'),
      tags: ['varejo', 'chat', 'masculino'],
    },
    {
      fullName: 'Mariana Oliveira',  email: 'mari.oliveira@gmail.com', phone: '+5521988881003',
      isB2b: false, pipelineType: PipelineType.varejo,
      leadSourceId: SEED_IDS.leadSources.whatsapp,    assignedTo: SEED_IDS.users.atendenteVarejo,
      whatsappPhone: '+5521988881003',
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-17'),
      tags: ['varejo', 'whatsapp'],
    },
    {
      fullName: 'Joana Ribeiro',     email: null,                      phone: '+5531988881004',
      isB2b: false, pipelineType: PipelineType.varejo,
      leadSourceId: SEED_IDS.leadSources.instagramComent, assignedTo: SEED_IDS.users.atendenteVarejo,
      instagramId: '987654321', instagramUsername: 'joana_r',
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-18'),
      tags: ['varejo', 'instagram', 'comentario'],
    },
    {
      fullName: 'Pedro Nunes',       email: 'pedro.nunes@outlook.com', phone: '+5511988881005',
      isB2b: false, pipelineType: PipelineType.varejo,
      leadSourceId: SEED_IDS.leadSources.formularioSite, assignedTo: SEED_IDS.users.atendenteVarejo,
      lgpdConsent: true, lgpdConsentAt: new Date('2026-05-20'),
      tags: ['varejo', 'formulario'],
    },
  ]

  const created = []
  for (const contact of contacts) {
    const c = await prisma.contact.create({ data: contact })
    created.push(c)
  }

  console.log(`  ✅ ${created.length} contatos criados (5 B2B + 5 B2C)`)
  return created
}

async function seedDeals(
  contacts: Awaited<ReturnType<typeof seedContacts>>,
  stagesAtacado: Array<{ id: string; position: number; name: string }>,
) {
  console.log('🌱 Criando deals...')

  const pipelineAtacado = await prisma.pipeline.findUnique({ where: { type: 'atacado' } })
  const pipelineVarejo  = await prisma.pipeline.findUnique({ where: { type: 'varejo'  } })
  const stagesVarejo    = await prisma.stage.findMany({ where: { pipelineId: pipelineVarejo!.id }, orderBy: { position: 'asc' } })

  const b2bContacts  = contacts.filter(c => c.isB2b)
  const b2cContacts  = contacts.filter(c => !c.isB2b)

  const deals = [
    // Atacado
    {
      title:      `Pedido inicial — ${b2bContacts[0].companyName}`,
      contactId:  b2bContacts[0].id,
      pipelineId: pipelineAtacado!.id,
      stageId:    stagesAtacado.find(s => s.position === 2)!.id, // Proposta Enviada
      assignedTo: SEED_IDS.users.vendedorAtacado,
      createdBy:  SEED_IDS.users.vendedorAtacado,
      value:      8500.00,
      currency:   'BRL',
    },
    {
      title:      `Negociação coleção inverno — ${b2bContacts[1].companyName}`,
      contactId:  b2bContacts[1].id,
      pipelineId: pipelineAtacado!.id,
      stageId:    stagesAtacado.find(s => s.position === 3)!.id, // Negociação
      assignedTo: SEED_IDS.users.vendedorAtacado,
      createdBy:  SEED_IDS.users.vendedorAtacado,
      value:      15000.00,
      currency:   'BRL',
    },
    {
      title:      `Primeiro contato — ${b2bContacts[2].companyName}`,
      contactId:  b2bContacts[2].id,
      pipelineId: pipelineAtacado!.id,
      stageId:    stagesAtacado.find(s => s.position === 1)!.id, // Contato Realizado
      assignedTo: SEED_IDS.users.vendedorAtacado,
      createdBy:  SEED_IDS.users.vendedorAtacado,
      value:      null,
      currency:   'BRL',
    },
    // Varejo
    {
      title:      `Compra vestido floral — ${b2cContacts[0].fullName}`,
      contactId:  b2cContacts[0].id,
      pipelineId: pipelineVarejo!.id,
      stageId:    stagesVarejo.find(s => s.position === 2)!.id, // Carrinho / Orçado
      assignedTo: SEED_IDS.users.atendenteVarejo,
      createdBy:  SEED_IDS.users.atendenteVarejo,
      value:      349.90,
      currency:   'BRL',
    },
    {
      title:      `Atendimento WhatsApp — ${b2cContacts[2].fullName}`,
      contactId:  b2cContacts[2].id,
      pipelineId: pipelineVarejo!.id,
      stageId:    stagesVarejo.find(s => s.position === 1)!.id, // Atendimento Ativo
      assignedTo: SEED_IDS.users.atendenteVarejo,
      createdBy:  SEED_IDS.users.atendenteVarejo,
      value:      null,
      currency:   'BRL',
    },
  ]

  const created = []
  for (const deal of deals) {
    const d = await prisma.deal.create({ data: deal })
    created.push(d)
  }

  console.log(`  ✅ ${created.length} deals criados (3 atacado + 2 varejo)`)

  // Criar atividades de follow-up para o primeiro deal
  await prisma.activity.create({
    data: {
      dealId:     created[0].id,
      contactId:  b2bContacts[0].id,
      assignedTo: SEED_IDS.users.vendedorAtacado,
      createdBy:  SEED_IDS.users.vendedorAtacado,
      type:       ActivityType.call,
      title:      'Ligar para confirmar recebimento da proposta',
      isMandatory: false,
      isDone:     false,
      dueDate:    new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
    },
  })

  console.log('  ✅ 1 activity de follow-up criada')
}

async function main() {
  console.log('\n🚀 Iniciando seed do CRM Techmalhas...\n')

  await seedUsers()
  await seedLeadSources()
  const { stagesAtacado } = await seedPipelines()
  const contacts = await seedContacts()
  await seedDeals(contacts, stagesAtacado)

  console.log('\n✅ Seed completo!')
  console.log('\n📋 Credenciais de teste (criar via Supabase Auth Dashboard):')
  console.log('   admin@techmalhas.com.br    → role: admin')
  console.log('   renato@techmalhas.com.br   → role: gestor')
  console.log('   vitor@techmalhas.com.br    → role: vendedor_atacado')
  console.log('   amanda@techmalhas.com.br   → role: atendente_varejo')
  console.log('\n⚠️  IMPORTANTE: Os usuários acima precisam ser criados manualmente')
  console.log('   no Supabase Auth Dashboard com os mesmos emails.')
  console.log('   O trigger 003 sincronizará automaticamente para public.users.')
  console.log('   Depois use o Prisma Studio para ajustar os roles conforme necessário.\n')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## `lib/db.ts`

```typescript
/**
 * lib/db.ts — Singleton do PrismaClient para Next.js / Vercel
 *
 * Problema: Em desenvolvimento com hot-reload (Next.js), cada save de arquivo
 * criaria uma nova instância do PrismaClient, esgotando o pool de conexões.
 *
 * Solução: Armazenar a instância em `globalThis` para que sobreviva
 * ao hot-reload. Em produção, cada instância do serverless function
 * cria sua própria instância (correto).
 *
 * Configurações importantes para Supabase + Vercel:
 *   - connection_limit=1 no DATABASE_URL (Supabase Pooler / pgBouncer)
 *   - pool_timeout=0 para evitar timeout em ambientes com tráfego baixo
 *   - Nunca use Edge Runtime com Prisma — use sempre Node.js runtime
 */

import { PrismaClient } from '@prisma/client'

// Declaração de tipo para globalThis (TypeScript strict)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    // errorFormat: 'pretty' apenas em dev (verbose, não vaza info em prod)
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  })
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient()

// Manter singleton no globalThis em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Helper: verificar conexão (útil em /api/health)
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}
```

---

## Comandos de Setup

```bash
# ─── 0. Pré-requisitos ──────────────────────────────────────
# Ter Node.js 20+, pnpm 9+, e um projeto Supabase criado em
# https://supabase.com (plano Free funciona para dev)

# ─── 1. Instalar dependências ───────────────────────────────
pnpm add @prisma/client
pnpm add -D prisma tsx

# ─── 2. Configurar variáveis de ambiente ────────────────────
cp .env.example .env.local
# Edite .env.local com os valores do seu projeto Supabase:
# DATABASE_URL  → Settings > Database > Connection string > Transaction (porta 6543)
#               Adicionar ao final: ?connection_limit=1&pool_timeout=0
# DIRECT_URL    → Settings > Database > Connection string > Direct (porta 5432)
#
# Exemplo:
# DATABASE_URL="postgresql://postgres.xxxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?connection_limit=1&pool_timeout=0"
# DIRECT_URL="postgresql://postgres:senha@db.xxxx.supabase.co:5432/postgres"

# ─── 3. Gerar o Prisma Client ───────────────────────────────
pnpm prisma generate

# ─── 4. Aplicar schema (primeira vez) ──────────────────────
pnpm prisma migrate dev --name initial
# Isso cria o arquivo prisma/migrations/001_initial/migration.sql
# e executa as tabelas no banco via DIRECT_URL

# ─── 5. Aplicar RLS e trigger (via Supabase SQL Editor) ─────
# Opção A — Supabase Dashboard (recomendado):
#   1. Vá em https://supabase.com/dashboard > seu projeto > SQL Editor
#   2. Cole e execute o conteúdo de: prisma/migrations/002_rls_policies.sql
#   3. Cole e execute o conteúdo de: prisma/migrations/003_auth_user_trigger.sql
#
# Opção B — via psql (requer DIRECT_URL):
psql "$DIRECT_URL" -f prisma/migrations/002_rls_policies.sql
psql "$DIRECT_URL" -f prisma/migrations/003_auth_user_trigger.sql

# ─── 6. Executar seed de desenvolvimento ───────────────────
pnpm tsx prisma/seed.ts

# ─── 7. (Opcional) Abrir Prisma Studio ─────────────────────
pnpm prisma studio
# Abre em http://localhost:5555 — interface visual do banco

# ─── Comandos úteis no dia a dia ──────────────────────────
pnpm prisma migrate dev --name <nome>   # Nova migration
pnpm prisma db push                     # Sync schema sem migration (cuidado em prod!)
pnpm prisma migrate deploy              # Aplicar migrations em produção (CI/CD)
pnpm prisma generate                    # Regenerar Prisma Client após editar schema
pnpm prisma studio                      # Interface visual
```

---

## Notas Técnicas

### 1. Ordem de criação das tabelas
A migration 001 respeita a dependência de FKs:
`users → lead_sources → contacts → pipelines → stages → stage_required_tasks → deals → activities → whatsapp_messages → instagram_messages → webchat_sessions → webchat_messages → interactions → notifications → audit_logs`

A tabela `interactions` é criada **depois** de `whatsapp_messages`, `instagram_messages` e `webchat_messages` porque referencia as três.

### 2. Users sem UUID gerado — referência ao auth.users
O model `User` usa `@id` sem `@default(uuid())` porque o ID é **fornecido pelo Supabase Auth**. O trigger `003` insere com `NEW.id` (que vem de `auth.users`). Nunca gere um UUID manual para `users`.

### 3. DATABASE_URL vs DIRECT_URL
- **DATABASE_URL** (Transaction Pooler, porta 6543): usado por queries do Prisma Client em runtime. Adicionar `?connection_limit=1&pool_timeout=0` no Supabase.
- **DIRECT_URL** (Direct Connection, porta 5432): usado apenas para `prisma migrate`. Nunca use esta URL em código de aplicação.

### 4. RLS não gerenciado pelo Prisma
O Prisma 6.x não gerencia Row Level Security policies. As policies em `002_rls_policies.sql` devem ser aplicadas manualmente **após** cada migration inicial. Em produção, inclua no CI/CD:
```bash
psql "$DIRECT_URL" -f prisma/migrations/002_rls_policies.sql
```

### 5. Hard block de tarefas obrigatórias
O trigger `trg_deals_stage_change` **cria** as atividades obrigatórias quando um deal muda de stage, mas **não bloqueia** o movimento. O hard block (HTTP 409) é responsabilidade do endpoint `PATCH /api/v1/deals/:id/stage` — que verifica atividades com `is_mandatory=true AND is_done=false` **antes** de atualizar o `stage_id`.

### 6. Seed vs Supabase Auth
O seed insere diretamente em `public.users` (bypassando RLS via Prisma Client server-side). Em produção, usuários são criados via Supabase Auth Dashboard ou API — o trigger `003` sincroniza automaticamente. Após criar os usuários no Auth, o seed de contatos e deals já estará funcional.

### 7. LGPD — campos de consentimento
Campos `lgpd_consent`, `lgpd_consent_at`, `lgpd_consent_ip` em `contacts` e `lgpd_consent`/`lgpd_consent_at` em `webchat_sessions` devem ser preenchidos **obrigatoriamente** antes de qualquer comunicação outbound (WhatsApp, e-mail). O endpoint público `POST /api/v1/public/leads` valida `lgpd_consent = true` e retorna 422 se ausente.

### 8. Particularidades dos índices no Prisma 6.x
Prisma 6.x com PostgreSQL suporta índices parciais via `@@index` com cláusula `where` apenas via raw SQL. Os índices com `WHERE deleted_at IS NULL` foram adicionados diretamente no `migration.sql` — o schema Prisma declara apenas os índices simples (para manter compatibilidade com `prisma generate`).
