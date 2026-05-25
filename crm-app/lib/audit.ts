/**
 * lib/audit.ts — Log de auditoria LGPD
 * Todas as operações em PII devem chamar logAudit.
 * INSERT via service_role (bypassa RLS) usando DIRECT_URL.
 */
import { prisma } from '@/lib/db'
import type { User } from '@prisma/client'
import type { AuditAction } from '@prisma/client'
import { headers } from 'next/headers'

interface AuditParams {
  user:          User
  action:        AuditAction
  tableName:     string
  recordId?:     string
  changedFields?: string[]
  oldValues?:    Record<string, unknown>
  requestId?:    string
}

export async function logAudit(params: AuditParams): Promise<void> {
  const headerStore = await headers()
  const ip        = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim()
  const userAgent = headerStore.get('user-agent') ?? undefined
  const requestId = params.requestId ?? headerStore.get('x-request-id') ?? undefined

  // Fire-and-forget com catch para não quebrar o fluxo principal
  prisma.auditLog.create({
    data: {
      userId:        params.user.id,
      userEmail:     params.user.email,
      userRole:      params.user.role,
      userIp:        ip,
      userAgent,
      action:        params.action,
      tableName:     params.tableName,
      recordId:      params.recordId,
      changedFields: params.changedFields ?? [],
      oldValues:     params.oldValues as object | undefined,
      requestId,
    },
  }).catch((err) => console.error('[audit log error]', err))
}