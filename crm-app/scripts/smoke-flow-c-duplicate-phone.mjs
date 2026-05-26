/**
 * Smoke: fluxo C — telefone duplicado deve retornar 409 (não 500)
 * Uso: node scripts/smoke-flow-c-duplicate-phone.mjs
 */
import { createServerClient } from '@supabase/ssr'

const BASE = 'https://squad-tchmalhas.vercel.app'
const SUPABASE_URL = 'https://ipmznhtviwxjvbjjuvxf.supabase.co'
const ANON_KEY = 'sb_publishable_GKkOJwEVn23rDOuYIm4jpA_fMhoP5Q0'
const EMAIL = 'admin@techmalhas.com.br'
const PASSWORD = 'Techmalhas2026!'

let cookieHeader = ''

const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
  cookies: {
    getAll() {
      if (!cookieHeader) return []
      return cookieHeader.split('; ').map((pair) => {
        const i = pair.indexOf('=')
        return { name: pair.slice(0, i), value: pair.slice(i + 1) }
      })
    },
    setAll(cookies) {
      cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ')
    },
  },
})

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  return { status: res.status, json }
}

async function main() {
  const { error } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  if (error) {
    console.error('FAIL login', error.message)
    process.exit(1)
  }

  const phone = `+5511999${String(Date.now()).slice(-7)}`
  const payload = {
    fullName: 'Smoke Dup Phone',
    phone,
    lgpdConsent: true,
    isB2b: false,
    pipelineType: 'varejo',
  }

  const first = await api('POST', '/api/v1/contacts', payload)
  if (first.status !== 201) {
    console.error('FAIL first POST', first.status, first.json)
    process.exit(1)
  }
  const id = first.json?.data?.id

  const second = await api('POST', '/api/v1/contacts', payload)
  if (second.status === 409 && second.json?.error?.code === 'CONFLICT') {
    console.log('PASS flow C — duplicate phone → 409 CONFLICT')
  } else {
    console.error('FAIL flow C — expected 409 CONFLICT, got', second.status, second.json)
    process.exit(1)
  }

  if (id) {
    const del = await api('DELETE', `/api/v1/contacts/${id}`)
    if (del.status === 204) console.log('cleanup contact OK')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
