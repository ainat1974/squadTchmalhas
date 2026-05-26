/**
 * Verificação Cloudflare Turnstile (opcional — ativa com TURNSTILE_SECRET_KEY)
 */
export async function verifyTurnstileToken(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false

  const body = new URLSearchParams({
    secret,
    response: token,
    ...(ip ? { remoteip: ip } : {}),
  })

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })

  const data = await res.json() as { success?: boolean }
  return data.success === true
}
