# Widget Irroba — Snippet de instalação

Substitua `https://crm.techmalhas.com.br` pelo domínio de produção do CRM.

## Painel Irroba (HTML customizado / rodapé)

```html
<script
  src="https://crm.techmalhas.com.br/widget.js"
  data-base="https://crm.techmalhas.com.br"
  data-position="right"
  defer
></script>
```

## Variáveis de ambiente (Vercel)

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `UPSTASH_REDIS_REST_URL` | Recomendado | Rate limit webchat/leads |
| `UPSTASH_REDIS_REST_TOKEN` | Recomendado | Token Upstash |
| `TURNSTILE_SECRET_KEY` | Recomendado | Secret Cloudflare Turnstile |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Recomendado | Site key (widget embed) |
| `WEBCHAT_ALLOWED_ORIGINS` | Produção | Origins permitidas, separadas por vírgula (ex: `https://loja.irroba.com.br`) |

## Migrations SQL pendentes (Supabase Studio)

1. `prisma/migrations/004_webchat_realtime_anon_read.sql` (se ainda não aplicada)
2. `prisma/migrations/005_contact_phone_unique_session_token.sql`

## Smoke test

Ver `SMOKE-TEST-RECOVERY.md` na mesma pasta.
