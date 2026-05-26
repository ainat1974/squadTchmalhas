/**
 * Rate limiting — Upstash Redis em produção, fallback in-memory local.
 */
import { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const WINDOW_MS = 60 * 1000
const store = new Map<string, { count: number; resetAt: number }>()

function getUpstashRatelimit(max: number, windowSec: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  return new Ratelimit({
    redis:        Redis.fromEnv(),
    limiter:      Ratelimit.slidingWindow(max, `${windowSec} s`),
    analytics:    false,
    prefix:       'tm_crm',
  })
}

const leadsLimiter = getUpstashRatelimit(5, 60)
const webchatLimiter = getUpstashRatelimit(10, 60)

function checkInMemory(ip: string, max: number): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const current = store.get(ip)

  if (!current || now > current.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: max - 1 }
  }

  if (current.count >= max) {
    return { allowed: false, remaining: 0 }
  }

  current.count++
  return { allowed: true, remaining: max - current.count }
}

export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

/** Público: formulário de leads (5/min por IP) */
export async function checkRateLimit(req: NextRequest): Promise<{ allowed: boolean; remaining: number }> {
  const ip = getClientIp(req)
  if (leadsLimiter) {
    const { success, remaining } = await leadsLimiter.limit(`leads:${ip}`)
    return { allowed: success, remaining }
  }
  return checkInMemory(ip, 5)
}

/** Público: iniciar sessão webchat (10/min por IP) */
export async function checkWebchatRateLimit(req: NextRequest): Promise<{ allowed: boolean; remaining: number }> {
  const ip = getClientIp(req)
  if (webchatLimiter) {
    const { success, remaining } = await webchatLimiter.limit(`webchat:${ip}`)
    return { allowed: success, remaining }
  }
  return checkInMemory(`webchat:${ip}`, 10)
}
