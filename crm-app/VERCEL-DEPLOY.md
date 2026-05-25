# Deploy Vercel — CRM Techmalhas

Repositório: `https://github.com/ainat1974/squadTchmalhas`  
Pasta do app: **`crm-app`** (obrigatório configurar na Vercel)

---

## Passo 1 — Importar projeto na Vercel

1. Acesse [https://vercel.com/new](https://vercel.com/new)
2. Conecte com **GitHub** (se ainda não conectou)
3. Importe o repositório **`ainat1974/squadTchmalhas`**
4. Em **Root Directory** → clique **Edit** → selecione **`crm-app`**
5. Framework: **Next.js** (detectado automaticamente)
6. **NÃO clique Deploy ainda** → vá para Environment Variables

---

## Passo 2 — Variáveis de ambiente

Em **Environment Variables**, adicione cada linha abaixo.  
Marque: **Production**, **Preview** e **Development**.

Copie os valores do seu arquivo `crm-app/.env.local` (já configurado).

| Variável | Onde copiar |
|---|---|
| `DATABASE_URL` | `.env.local` |
| `DIRECT_URL` | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` |
| `META_APP_ID` | `.env.local` (placeholder ok por enquanto) |
| `META_APP_SECRET` | `.env.local` |
| `META_WHATSAPP_TOKEN` | `.env.local` |
| `META_PHONE_NUMBER_ID` | `.env.local` |
| `META_WABA_ID` | `.env.local` |
| `META_WEBHOOK_VERIFY_TOKEN` | `.env.local` |
| `META_INSTAGRAM_TOKEN` | `.env.local` |
| `META_INSTAGRAM_ACCOUNT_ID` | `.env.local` |
| `INSTAGRAM_ENABLED` | `false` |
| `CRON_SECRET` | `.env.local` |
| `PREVIEW_MODE` | `false` |
| `NODE_ENV` | `production` |

### `NEXT_PUBLIC_APP_URL` (importante!)

**Na primeira vez**, use a URL provisória da Vercel (você atualiza depois do primeiro deploy):

```
https://SEU-PROJETO.vercel.app
```

Depois do deploy, volte em Settings → Environment Variables e atualize com a URL real gerada.

---

## Passo 3 — Deploy

1. Clique **Deploy**
2. Aguarde 2–4 minutos
3. Quando terminar, copie a URL (ex: `https://squad-tchmalhas-xxx.vercel.app`)

---

## Passo 4 — Supabase: URLs de redirect

1. [Supabase Dashboard](https://supabase.com/dashboard/project/ipmznhtviwxjvbjjuvxf/auth/url-configuration)
2. **Site URL:** `https://SUA-URL.vercel.app`
3. **Redirect URLs** — adicione:
   - `https://SUA-URL.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (manter dev local)

Salve.

---

## Passo 5 — Atualizar `NEXT_PUBLIC_APP_URL` na Vercel

1. Vercel → projeto → **Settings** → **Environment Variables**
2. Edite `NEXT_PUBLIC_APP_URL` → cole a URL final da Vercel
3. **Deployments** → último deploy → **⋯** → **Redeploy**

---

## Passo 6 — Testar

1. Acesse `https://SUA-URL.vercel.app/login`
2. Login:
   - E-mail: `admin@techmalhas.com.br`
   - Senha: `Techmalhas2026!`
3. Deve abrir o **Pipeline** com dados reais

---

## Cron jobs (opcional — plano Pro)

O `vercel.json` define 3 crons (LGPD, WhatsApp retry, webchat).  
Funcionam apenas no **plano Pro** da Vercel (~R$ 104/mês). No Free, o app funciona; só os crons não rodam.

---

## Troubleshooting

| Erro | Solução |
|---|---|
| Build falha em `prisma generate` | Confirme `DATABASE_URL` e `DIRECT_URL` nas env vars |
| `500 MIDDLEWARE_INVOCATION_FAILED` | Confirme env vars Supabase na Vercel; o app usa `proxy.ts` (Next.js 16), não `middleware.ts` |
| Login não funciona | Atualize Redirect URLs no Supabase |
| 404 em rotas | Root Directory deve ser `crm-app` |
| Página em branco | Verifique `NEXT_PUBLIC_SUPABASE_URL` e anon key |

---

## Checklist final

- [ ] Root Directory = `crm-app`
- [ ] Todas as env vars copiadas
- [ ] `PREVIEW_MODE=false`
- [ ] Deploy concluído com sucesso
- [ ] Supabase redirect URLs atualizadas
- [ ] Login testado na URL da Vercel
