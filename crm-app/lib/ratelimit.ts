/**
 * lib/ratelimit.ts — Rate limiting simples via headers IP
 * Para produção, substituir por Upstash Redis ou Vercel KV.
 * Este módulo é usado APENAS no endpoint público de leads.
 */
import { NextRequest } from 'next/server'

// In-memory store (OK para Vercel — cada instância serverless tem seu próprio)
const store = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS  = 60 * 1000  // 1 minuto
const MAX_REQUESTS = 5        // máx 5 leads por IP por minuto (anti-spam)

export function checkRateLimit(req: NextRequest): { allowed: boolean; remaining: number } {
  const ip      = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const now     = Date.now()
  const current = store.get(ip)

  if (!current || now > current.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1 }
  }

  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  current.count++
  return { allowed: true, remaining: MAX_REQUESTS - current.count }
}