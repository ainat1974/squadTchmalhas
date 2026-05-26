/**
 * lib/auth.ts — Helpers de autenticação e autorização
 * Usa Supabase SSR + Prisma para buscar o perfil completo do usuário
 */
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/db'
import { ApiError, Errors } from '@/lib/errors'
import type { User, UserRole } from '@prisma/client'

// Criar cliente Supabase SSR (Next.js App Router)
async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get:    (name: string) => cookieStore.get(name)?.value,
        set:    () => {}, // App Router: cookies são read-only em Route Handlers
        remove: () => {},
      },
    },
  )
}

/**
 * Retorna o usuário atual da sessão Supabase, ou null se não autenticado.
 * Busca o perfil completo em public.users via Prisma.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user: authUser }, error } = await supabase.auth.getUser()
    if (error || !authUser) return null

    return prisma.user.findUnique({
      where: { id: authUser.id, deletedAt: null },
    })
  } catch {
    return null
  }
}

/**
 * Exige autenticação. Lança ApiError 401 se não autenticado.
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw Errors.UNAUTHENTICATED()
  if (!user.isActive) throw new ApiError(403, 'ACCOUNT_INACTIVE', 'Conta desativada')
  return user
}

/**
 * Exige que o usuário tenha um dos roles especificados.
 */
export function requireRole(user: User, roles: UserRole[]): void {
  if (!roles.includes(user.role)) {
    throw Errors.FORBIDDEN(`Esta ação requer role: ${roles.join(' ou ')}`)
  }
}

/**
 * Verifica se o usuário pode acessar/modificar um deal específico.
 * admin e gestor: acesso total.
 * vendedor_atacado/atendente_varejo: apenas próprio deal.
 */
export function requireDealOwnership(user: User, dealOwnerId: string | null): void {
  if (user.role === 'admin' || user.role === 'gestor') return
  if (!dealOwnerId || user.id !== dealOwnerId) {
    throw Errors.FORBIDDEN('Você só pode modificar seus próprios deals')
  }
}

/**
 * Verifica se o usuário pode acessar um contact.
 * Leva em conta B2B vs B2C conforme RBAC.
 */
export function requireContactAccess(user: User, contact: { isB2b: boolean; assignedTo: string | null }): void {
  if (user.role === 'admin' || user.role === 'gestor') return
  if (user.role === 'vendedor_atacado' && !contact.isB2b) {
    throw Errors.FORBIDDEN('vendedor_atacado não acessa contatos B2C')
  }
  if (user.role === 'atendente_varejo' && contact.isB2b) {
    throw Errors.FORBIDDEN('atendente_varejo não acessa contatos B2B')
  }
}

/**
 * Extrai o Bearer token da request (para webhooks/endpoints públicos).
 */
export function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}

/**
 * Verifica o CRON_SECRET para proteger endpoints de cron job.
 */
export function requireCronSecret(req: Request): void {
  const secret = extractBearerToken(req)
  if (!secret || secret !== process.env.CRON_SECRET) {
    throw Errors.FORBIDDEN('Acesso negado ao cron endpoint')
  }
}