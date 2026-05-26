/**
 * E2E test — Realtime webchat: visitor message round-trip.
 *
 * Fluxo:
 *   1. POST /api/v1/webchat/sessions  → sessionId, sessionToken, realtimeChannel
 *   2. createClient(supabaseUrl, anonKey)
 *   3. supabase.channel(realtimeChannel).on('postgres_changes', {INSERT, webchat_messages, session_id=eq.X}).subscribe()
 *   4. Aguarda SUBSCRIBED, posta uma mensagem (visitor) com X-Session-Token
 *   5. Promise.race(evento, timeout 10s)
 *   6. Log PASS <ms> / FAIL <motivo> e cleanup
 *
 * Uso:
 *   node scripts/test-realtime-e2e.mjs
 *
 * Variáveis opcionais (override dos defaults de produção):
 *   - WEBCHAT_BASE_URL          (default: https://squad-tchmalhas.vercel.app)
 *   - NEXT_PUBLIC_SUPABASE_URL  (default: https://ipmznhtviwxjvbjjuvxf.supabase.co)
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY (default: sb_publishable_GKkOJwEVn23rDOuYIm4jpA_fMhoP5Q0)
 */
import { createClient } from '@supabase/supabase-js'

const BASE_URL =
  process.env.WEBCHAT_BASE_URL ?? 'https://squad-tchmalhas.vercel.app'
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ipmznhtviwxjvbjjuvxf.supabase.co'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'sb_publishable_GKkOJwEVn23rDOuYIm4jpA_fMhoP5Q0'

const TIMEOUT_MS = 10_000
const SUBSCRIBE_TIMEOUT_MS = 8_000

function log(line) {
  process.stdout.write(`${line}\n`)
}

function failAndExit(reason, extra) {
  log(`FAIL ${reason}`)
  if (extra) log(`      ${extra}`)
  process.exit(1)
}

async function createSession() {
  const res = await fetch(`${BASE_URL}/api/v1/webchat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitorName: 'E2E Realtime Bot',
      visitorEmail: 'e2e-realtime@techmalhas.dev',
      pageUrl: `${BASE_URL}/e2e/realtime-probe`,
      lgpdConsent: true,
      utmSource: 'e2e-script',
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `POST /sessions devolveu ${res.status} — ${body.slice(0, 200)}`,
    )
  }
  const { data } = await res.json()
  if (!data?.sessionId || !data?.sessionToken || !data?.realtimeChannel) {
    throw new Error(
      `POST /sessions sem campos esperados (recebeu: ${JSON.stringify(data).slice(0, 200)})`,
    )
  }
  return data
}

async function postVisitorMessage(sessionId, sessionToken, content) {
  const res = await fetch(`${BASE_URL}/api/v1/webchat/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': sessionToken,
    },
    body: JSON.stringify({ sessionId, content, isFromVisitor: true }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `POST /messages devolveu ${res.status} — ${body.slice(0, 200)}`,
    )
  }
  return res.json()
}

async function main() {
  log('▶ Realtime e2e — webchat')
  log(`  base:     ${BASE_URL}`)
  log(`  supabase: ${SUPABASE_URL}`)
  log('')

  log('1) Criando sessão webchat…')
  const session = await createSession()
  log(`   sessionId       = ${session.sessionId}`)
  log(`   realtimeChannel = ${session.realtimeChannel}`)
  log('')

  log('2) Conectando no Supabase Realtime…')
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 10 } },
  })

  let resolveSubscribed
  const subscribedPromise = new Promise((res) => {
    resolveSubscribed = res
  })

  let resolveEvent
  let received = null
  const eventPromise = new Promise((res) => {
    resolveEvent = res
  })

  const channel = supabase
    .channel(session.realtimeChannel)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'webchat_messages',
        filter: `session_id=eq.${session.sessionId}`,
      },
      (payload) => {
        if (!received) {
          received = payload
          resolveEvent({ ok: true, payload })
        }
      },
    )
    .subscribe((status, err) => {
      log(`   status: ${status}${err ? ` (err=${err.message ?? err})` : ''}`)
      if (status === 'SUBSCRIBED') resolveSubscribed({ ok: true })
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        resolveSubscribed({ ok: false, reason: status })
      }
    })

  const subResult = await Promise.race([
    subscribedPromise,
    new Promise((r) =>
      setTimeout(
        () => r({ ok: false, reason: `subscribe-timeout-${SUBSCRIBE_TIMEOUT_MS}ms` }),
        SUBSCRIBE_TIMEOUT_MS,
      ),
    ),
  ])
  if (!subResult.ok) {
    await supabase.removeChannel(channel)
    failAndExit(`Realtime subscribe não confirmou`, subResult.reason)
  }
  log('   ✓ SUBSCRIBED')
  log('')

  log('3) Aguardando 2s para garantir replicação Realtime ativa…')
  await new Promise((r) => setTimeout(r, 2_000))

  log('4) Postando mensagem visitor via API…')
  const startedAt = Date.now()
  await postVisitorMessage(
    session.sessionId,
    session.sessionToken,
    `[e2e-realtime] ${new Date().toISOString()}`,
  )
  log('   ✓ POST /messages 201')
  log('')

  log(`5) Esperando evento Realtime (timeout ${TIMEOUT_MS}ms)…`)
  const winner = await Promise.race([
    eventPromise,
    new Promise((r) =>
      setTimeout(() => r({ ok: false, reason: 'realtime-event-timeout' }), TIMEOUT_MS),
    ),
  ])

  await supabase.removeChannel(channel)

  if (!winner.ok) {
    failAndExit(winner.reason, `sessionId=${session.sessionId}`)
  }

  const elapsed = Date.now() - startedAt
  const row = winner.payload?.new ?? {}
  log('')
  log(`PASS ${elapsed}ms`)
  log(`     message_id   = ${row.id}`)
  log(`     content      = ${row.content}`)
  log(`     is_from_visitor = ${row.is_from_visitor}`)
  process.exit(0)
}

main().catch((err) => {
  failAndExit('exception', err?.message ?? String(err))
})
