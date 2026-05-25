/**
 * Verifica se o Supabase está configurado corretamente para o CRM.
 * Uso: node scripts/verify-supabase.mjs
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const envPath = resolve(__dirname, '../.env.local')
  const content = readFileSync(envPath, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    let val = trimmed.slice(eq + 1)
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}

loadEnv()

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const checks = []

function ok(name, detail) {
  checks.push({ name, status: 'ok', detail })
  console.log(`  ✅ ${name}${detail ? ` — ${detail}` : ''}`)
}

function warn(name, detail) {
  checks.push({ name, status: 'warn', detail })
  console.log(`  ⚠️  ${name}${detail ? ` — ${detail}` : ''}`)
}

function fail(name, detail) {
  checks.push({ name, status: 'fail', detail })
  console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`)
}

async function main() {
  console.log('\n🔍 Verificação Supabase — CRM Techmalhas\n')

  // ─── Env vars ─────────────────────────────────────────────
  console.log('📋 Variáveis de ambiente (.env.local)')
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'DIRECT_URL',
  ]
  for (const key of required) {
    const val = process.env[key]
    if (!val || val.includes('COLE_AQUI') || val.includes('placeholder')) {
      fail(key, 'não configurada ou ainda é placeholder')
    } else {
      ok(key, 'configurada')
    }
  }

  if (process.env.PREVIEW_MODE === 'true') {
    warn('PREVIEW_MODE', 'ainda está true — mude para false antes do deploy')
  } else {
    ok('PREVIEW_MODE', 'false (modo produção local)')
  }

  // ─── Database connection ──────────────────────────────────
  console.log('\n🗄️  Banco de dados (PostgreSQL)')
  try {
    await prisma.$queryRaw`SELECT 1 as ok`
    ok('Conexão', 'banco acessível')
  } catch (e) {
    fail('Conexão', e.message)
    await prisma.$disconnect()
    process.exit(1)
  }

  // ─── Tables & seed data ───────────────────────────────────
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.contact.count(),
    prisma.deal.count({ where: { deletedAt: null } }),
    prisma.pipeline.count(),
    prisma.stage.count(),
    prisma.leadSource.count(),
    prisma.activity.count({ where: { deletedAt: null } }),
    prisma.webchatSession.count(),
  ])

  const [users, contacts, deals, pipelines, stages, leadSources, activities, webchatSessions] = counts

  ok('Tabela users', `${users} registros`)
  ok('Tabela contacts', `${contacts} registros`)
  ok('Tabela deals', `${deals} registros`)
  ok('Tabela pipelines', `${pipelines} registros (esperado: 2)`)
  ok('Tabela stages', `${stages} registros`)
  ok('Tabela lead_sources', `${leadSources} registros`)

  if (users < 4) warn('Seed usuários', `esperado ≥4, encontrado ${users}`)
  if (contacts < 5) warn('Seed contatos', `esperado ≥10, encontrado ${contacts}`)
  if (pipelines !== 2) warn('Pipelines', `esperado 2 (atacado+varejo), encontrado ${pipelines}`)

  // ─── RLS enabled ──────────────────────────────────────────
  console.log('\n🛡️  Row Level Security (RLS)')
  const rlsTables = await prisma.$queryRaw`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'contacts', 'deals', 'activities', 'pipelines', 'stages')
    ORDER BY tablename
  `
  let rlsOk = true
  for (const row of rlsTables) {
    if (!row.rowsecurity) {
      fail(`RLS em ${row.tablename}`, 'DESABILITADO — rode 002_rls_policies.sql')
      rlsOk = false
    }
  }
  if (rlsOk) ok('RLS', `habilitado em ${rlsTables.length} tabelas críticas`)

  const policyCount = await prisma.$queryRaw`
    SELECT COUNT(*)::int as count FROM pg_policies WHERE schemaname = 'public'
  `
  const policies = policyCount[0]?.count ?? 0
  if (policies < 10) {
    warn('Policies RLS', `apenas ${policies} policies — esperado ~30+`)
  } else {
    ok('Policies RLS', `${policies} policies criadas`)
  }

  // ─── Auth trigger ─────────────────────────────────────────
  console.log('\n🔐 Supabase Auth')
  const triggers = await prisma.$queryRaw`
    SELECT tgname FROM pg_trigger
    WHERE tgname IN ('on_auth_user_created', 'on_auth_user_deleted')
  `
  if (triggers.length >= 1) {
    ok('Trigger auth→users', triggers.map((t) => t.tgname).join(', '))
  } else {
    fail('Trigger auth→users', 'não encontrado — rode 003_auth_user_trigger.sql')
  }

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    fail('API Auth (service_role)', authError.message)
  } else {
    const authUsers = authData?.users ?? []
    ok('Usuários Auth', `${authUsers.length} no Supabase Auth`)
    const admin = authUsers.find((u) => u.email === 'admin@techmalhas.com.br')
    if (admin) {
      ok('Login admin', `admin@techmalhas.com.br (id: ${admin.id.slice(0, 8)}…)`)
      const dbAdmin = await prisma.user.findUnique({ where: { id: admin.id } })
      if (dbAdmin && dbAdmin.role === 'admin') {
        ok('Sync auth↔public.users', 'admin com role correto')
      } else {
        warn('Sync auth↔public.users', 'auth existe mas public.users pode estar desalinhado')
      }
    } else {
      warn('Login admin', 'admin@techmalhas.com.br não encontrado — rode: pnpm auth:seed')
    }
  }

  // ─── Migrations ───────────────────────────────────────────
  console.log('\n📦 Migrations Prisma')
  const migrations = await prisma.$queryRaw`
    SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at
  `
  for (const m of migrations) {
    ok('Migration', m.migration_name)
  }

  // ─── Summary ──────────────────────────────────────────────
  const failed = checks.filter((c) => c.status === 'fail').length
  const warnings = checks.filter((c) => c.status === 'warn').length

  console.log('\n' + '═'.repeat(55))
  if (failed === 0 && warnings === 0) {
    console.log('  ✅ Supabase PRONTO para deploy na Vercel')
  } else if (failed === 0) {
    console.log(`  ⚠️  Supabase OK com ${warnings} aviso(s) — pode fazer deploy`)
  } else {
    console.log(`  ❌ ${failed} problema(s) encontrado(s) — corrija antes do deploy`)
  }
  console.log('═'.repeat(55) + '\n')

  await prisma.$disconnect()
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('Erro fatal:', e.message)
  process.exit(1)
})
