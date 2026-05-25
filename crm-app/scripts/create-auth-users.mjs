/**
 * Cria usuários no Supabase Auth com os mesmos IDs do seed.
 * Uso: node scripts/create-auth-users.mjs
 * Requer: dotenv-cli ou variáveis já carregadas
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')

function loadEnv() {
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const DEV_PASSWORD = 'Techmalhas2026!'

const USERS = [
  { id: 'a0000000-0000-0000-0000-000000000001', email: 'admin@techmalhas.com.br', fullName: 'Admin Techmalhas', role: 'admin' },
  { id: 'a0000000-0000-0000-0000-000000000002', email: 'renato@techmalhas.com.br', fullName: 'Renato Gestor', role: 'gestor' },
  { id: 'a0000000-0000-0000-0000-000000000003', email: 'vitor@techmalhas.com.br', fullName: 'Vitor Vendedor', role: 'vendedor_atacado' },
  { id: 'a0000000-0000-0000-0000-000000000004', email: 'amanda@techmalhas.com.br', fullName: 'Amanda Atendente', role: 'atendente_varejo' },
]

async function main() {
  console.log('\n🔐 Criando usuários no Supabase Auth...\n')

  for (const user of USERS) {
    const { data: existing } = await supabase.auth.admin.listUsers()
    const found = existing?.users?.find((u) => u.email === user.email)

    if (found) {
      const { error } = await supabase.auth.admin.updateUserById(found.id, {
        password: DEV_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: user.fullName, role: user.role },
      })
      if (error) {
        console.error(`  ❌ ${user.email}: ${error.message}`)
      } else {
        console.log(`  ✅ ${user.email} — senha atualizada`)
      }
      continue
    }

    const { data, error } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: DEV_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: user.fullName, role: user.role },
    })

    if (error) {
      console.error(`  ❌ ${user.email}: ${error.message}`)
    } else {
      console.log(`  ✅ ${user.email} — criado (id: ${data.user?.id})`)
    }
  }

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  Login de desenvolvimento')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  URL:      http://localhost:3000/login`)
  console.log(`  E-mail:   admin@techmalhas.com.br`)
  console.log(`  Senha:    ${DEV_PASSWORD}`)
  console.log('═══════════════════════════════════════════════════════\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
