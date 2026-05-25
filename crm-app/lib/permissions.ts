/**
 * lib/permissions.ts — Checks de RBAC reutilizáveis
 */
import type { User } from '@prisma/client'

export const ROLES = {
  ADMIN:    'admin',
  GESTOR:   'gestor',
  ATACADO:  'vendedor_atacado',
  VAREJO:   'atendente_varejo',
} as const

export function isAdmin(user: User):       boolean { return user.role === 'admin' }
export function isGestor(user: User):      boolean { return user.role === 'gestor' }
export function isAdminOrGestor(user: User): boolean { return isAdmin(user) || isGestor(user) }
export function canManageUsers(user: User): boolean { return isAdmin(user) }
export function canConfigPipelines(user: User): boolean { return isAdminOrGestor(user) }
export function canSeeAllDeals(user: User): boolean { return isAdminOrGestor(user) }

// Verifica se o usuário pode ver um pipeline específico
export function canAccessPipelineType(
  user: User,
  pipelineType: 'atacado' | 'varejo',
): boolean {
  if (isAdminOrGestor(user)) return true
  if (user.role === 'vendedor_atacado') return pipelineType === 'atacado'
  if (user.role === 'atendente_varejo') return pipelineType === 'varejo'
  return false
}

// Filtro Prisma para deals visíveis ao usuário
export function dealsWhereClause(user: User) {
  if (isAdminOrGestor(user)) return { deletedAt: null }
  return {
    deletedAt: null,
    assignedTo: user.id,
    pipeline: {
      type: user.role === 'vendedor_atacado' ? ('atacado' as const) : ('varejo' as const),
    },
  }
}

// Filtro Prisma para contacts visíveis ao usuário
export function contactsWhereClause(user: User) {
  if (isAdminOrGestor(user)) return { deletedAt: null }
  if (user.role === 'vendedor_atacado') return { deletedAt: null, isB2b: true }
  return { deletedAt: null, isB2b: false }
}