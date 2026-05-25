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