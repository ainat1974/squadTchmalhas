# Setup Supabase — CRM Techmalhas

Guia passo-a-passo para criar o projeto Supabase e configurar o CRM.

⏱️ **Tempo estimado:** 15 minutos

---

## Passo 1 — Criar o Projeto Supabase (5 min)

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard) e faça login
2. Clique no botão **"New project"** (canto superior direito)
3. Preencha o formulário:

   | Campo | Valor |
   |---|---|
   | **Project name** | `crm-techmalhas` |
   | **Database Password** | 🔐 Gere uma senha forte e **anote em local seguro** |
   | **Region** | `South America (São Paulo)` — `sa-east-1` |
   | **Pricing Plan** | Free (você pode migrar pra Pro depois) |

4. Clique em **"Create new project"** e aguarde ~2 minutos
5. Quando o status mudar para "Project is ready", você verá o dashboard

---

## Passo 2 — Coletar as 5 Credenciais (3 min)

Você vai copiar 5 valores diferentes. Mantenha esta página aberta enquanto edita o `.env.local`.

### 2.1 — Project URL e Chaves de API

Vá em **⚙️ Project Settings ► API** (menu lateral esquerdo, ícone de engrenagem)

Você verá uma página com 3 valores que precisamos:

| O que copiar | Onde está | Para qual variável |
|---|---|---|
| 1️⃣ **Project URL** | Seção "Project URL" — começa com `https://` | `NEXT_PUBLIC_SUPABASE_URL` |
| 2️⃣ **anon public** | Seção "Project API keys" — chave longa começando com `eyJ...` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| 3️⃣ **service_role** | Seção "Project API keys" — chave longa começando com `eyJ...` (clique "Reveal") | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ **A `service_role` é SECRETA.** Nunca commit, nunca expõe no front. Ela bypassa toda a segurança do banco.

### 2.2 — Connection Strings do Banco

Vá em **⚙️ Project Settings ► Database** ► role até **"Connection string"**

Há 3 abas: **URI**, **PSQL**, **.NET**. Escolha **URI**.

Há 2 modos que precisamos:

| O que copiar | Onde está | Para qual variável |
|---|---|---|
| 4️⃣ **Transaction** (porta 6543) | Aba "Transaction mode" — começa com `postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-...pooler.supabase.com:6543/postgres` | `DATABASE_URL` |
| 5️⃣ **Session** (porta 5432) | Aba "Session mode" — começa com `postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-...pooler.supabase.com:5432/postgres` | `DIRECT_URL` |

> 💡 **Importante:** Substitua `[YOUR-PASSWORD]` pela senha que você criou no Passo 1. Mantenha as aspas duplas no `.env.local`.

---

## Passo 3 — Colar no `.env.local` (2 min)

1. Abra o arquivo `crm-app/.env.local`
2. Substitua cada `<<COLE_AQUI_*>>` pelos valores correspondentes
3. **Salve o arquivo**

Antes:
```
NEXT_PUBLIC_SUPABASE_URL=<<COLE_AQUI_PROJECT_URL>>
```

Depois:
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
```

⚠️ Lembre-se de mudar `PREVIEW_MODE=true` para `PREVIEW_MODE=false`.

---

## Passo 4 — Aplicar Schema, RLS e Seed (5 min)

### 4.1 — Rodar o script de setup

No PowerShell, dentro de `crm-app/`:

```powershell
.\scripts\setup-supabase.ps1
```

O script vai:
- ✅ Validar que você preencheu o `.env.local`
- ✅ Gerar o Prisma Client
- ✅ Criar todas as tabelas (migration 001)
- ⏸️ Pedir para você aplicar 2 SQLs manualmente no Supabase
- ✅ Rodar o seed (dados de exemplo)

### 4.2 — Aplicar os 2 SQLs no Supabase

Quando o script pausar:

1. Abra [https://supabase.com/dashboard](https://supabase.com/dashboard) → seu projeto
2. Clique em **SQL Editor** (ícone `</>` no menu lateral)
3. Clique **"+ New query"**
4. Cole o conteúdo de `prisma/migrations/002_rls_policies.sql` → clique **Run** (ou Ctrl+Enter)
5. Crie outra query e cole `prisma/migrations/003_auth_user_trigger.sql` → **Run**
6. Volte ao terminal e digite `s` para continuar

### 4.3 — Anotar o usuário admin

O seed vai criar 4 usuários. Olhe a saída do terminal — terá algo como:

```
Admin criado:
  E-mail: admin@techmalhas.com.br
  Senha temporária: <senha-gerada>
```

**Anote essas credenciais** para fazer login.

---

## Passo 5 — Testar Login Real (1 min)

1. Reinicie o servidor: `pnpm dev`
2. Acesse [http://localhost:3000/login](http://localhost:3000/login)
3. Use as credenciais do admin do seed
4. Você será redirecionada para o Pipeline (Kanban) com dados reais!

---

## Troubleshooting

### "P1001: Can't reach database server"
- Verifique se a senha no `DATABASE_URL` está correta (sem `[YOUR-PASSWORD]`)
- Verifique se a região do projeto é `sa-east-1`

### "permission denied for table users"
- As policies RLS não foram aplicadas. Rode o `002_rls_policies.sql` no SQL Editor.

### "relation X does not exist"
- O `prisma migrate deploy` falhou. Verifique `DIRECT_URL`.

### Login funciona mas redireciona infinitamente
- O trigger `003_auth_user_trigger.sql` não foi aplicado. Aplique-o.

---

## Próximos Passos (depois deste guia)

1. ✅ Supabase configurado e funcionando localmente
2. ⏳ Configurar WhatsApp Cloud API (Meta Business Manager)
3. ⏳ Deploy na Vercel
4. ⏳ Configurar domínio (ex: `crm.techmalhas.com.br`)

Veja o roteiro completo em `../squads/crm-techmalhas/output/2026-05-24-162435/deployment-handoff.md`.
