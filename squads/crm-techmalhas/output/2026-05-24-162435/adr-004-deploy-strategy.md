# ADR-004: Estratégia de Deploy do CRM Techmalhas — Resolução do Loop Vercel

**Data:** 2026-05-25
**Status:** Proposto
**Decisor:** Arnaldo Arquiteto
**Aprovador:** Tania (Techmalhas)

---

## Contexto

O CRM Techmalhas (Next.js 16.1.6 + Prisma + Supabase) está há ~6 horas em loop de tentativas de deploy na Vercel. O build local passa (`pnpm build` verde), e os últimos dois deploys da Vercel (`1237753` e `2fcd5c3`) também estão verdes nos logs — mas **o domínio `squad-tchmalhas.vercel.app` continua servindo o commit `27f32a4`**, que migrou `middleware.ts → proxy.ts` e quebrou todas as rotas com 404 (bug regressivo da Vercel: `vercel/next.js#94052` e `#93326`). A causa real **não é mais o código**: é que a Vercel ativou rollback manual no commit antigo e desligou auto-assign de domínio, então deploys novos sobem mas **não viram produção** sem promoção explícita. Estamos confundindo um problema de UI/infra com um problema de aplicação.

---

## Forças (constraints)

| # | Restrição | Implicação |
|---|-----------|-----|
| F1 | Tania não tem expertise DevOps | Solução precisa ter ≤ 5 cliques ou 1 comando, sem terminologia de plataforma |
| F2 | Equipe Techmalhas precisa do CRM operacional **hoje** | Janela: < 30 min até produção |
| F3 | Supabase já está configurado e funcional | Não tocar: schema, RLS, Auth, env vars |
| F4 | Custo precisa ficar baixo (PME) | Budget já aprovado: R$ 296–504/mês |
| F5 | Código está saudável (build local + build Vercel passam) | Problema é **operacional**, não arquitetural |
| F6 | 16 env vars + webhook Meta + Cron Jobs Vercel já configurados | Custo de migração = re-configurar tudo + atualizar webhook Meta |

---

## Alternativas Consideradas

### Opção A — Promover manualmente o deploy `2fcd5c3` na Vercel atual

- ✅ **Prós:** zero migração; preserva 16 env vars, webhook Meta, Cron Jobs e SSL; build já provadamente verde; tempo até produção = minutos; custo mensal inalterado.
- ❌ **Contras:** depende de Tania achar o botão "Promote to Production" (atualmente Deployments → menu `⋯` no deploy desejado → "Promote to Production"); rollback ativo precisa ser desfeito; auto-assign de domínio precisa ser reativado.
- ⚠️ **Risco:** baixo. Só requer 3 ações na UI da Vercel.
- ⏱️ **Tempo:** 5–10 minutos.

### Opção B — Deletar projeto Vercel e reimportar do zero

- ✅ **Prós:** estado limpo; sem ghost de rollback; força a Vercel a re-detectar o framework.
- ❌ **Contras:** **re-cadastrar 16 env vars** (incluindo secrets sensíveis — `SUPABASE_SERVICE_ROLE_KEY`, `META_APP_SECRET`, `CRON_SECRET`); URL nova quebra o webhook Meta cadastrado (`/api/v1/webhooks/whatsapp`); histórico de deploys se perde; risco real de digitação errada em variável sensível.
- ⚠️ **Risco:** **médio-alto**. Toda variável re-digitada é um ponto de falha. Webhook Meta dá fila no Business Manager pra atualizar.
- ⏱️ **Tempo:** 30–60 minutos + tempo de re-aprovação do webhook Meta (até 30 min).

### Opção C — Migrar para Railway ou Render

- ✅ **Prós:** plataformas mais simples; Railway tem Postgres add-on (irrelevante — já temos Supabase); Render tem free tier 750h/mês.
- ❌ **Contras:**
  - Vercel Cron precisa ser substituído (Railway: GitHub Actions/cron-jobs.org; Render: Cron Jobs pagos a $1/mês cada — temos 3 crons = +$3/mês).
  - Build de Next.js 16 em Render/Railway é menos otimizado (sem ISR/edge, sem Image Optimization automático).
  - Webhook Meta precisa ser reapontado.
  - Sem Preview Deployments por PR (perda de DX para o Fábio Fullstack).
  - Tania nunca viu essas plataformas → curva de aprendizado.
- 💰 **Custo:** Railway ~$5–15/mês (Hobby) + Supabase Pro R$130 = ~R$ 158–212/mês. Render Starter $7 + crons $3 + Supabase = ~R$ 180/mês. **Mais barato em ~R$ 50–100, mas com perda de features.**
- ⚠️ **Risco:** **alto**. Trocar de plataforma no meio de um incêndio = duplicar superfície de problemas.
- ⏱️ **Tempo:** 2–4 horas para migrar + validar + reapontar webhook.

### Opção D — Forçar deploy via Vercel CLI (`vercel deploy --prod --yes`)

- ✅ **Prós:** bypassa a UI confusa da Vercel; comando único; idempotente; o flag `--prod` força promoção mesmo com auto-assign desligado.
- ❌ **Contras:** Tania precisa instalar Node + Vercel CLI (`npm i -g vercel`), autenticar (`vercel login`), linkar o projeto (`vercel link`) — 3 passos antes do deploy. Não resolve o **estado** do rollback ativo na Vercel (apenas sobrescreve com novo deploy).
- ⚠️ **Risco:** baixo, mas tem instalação prévia.
- ⏱️ **Tempo:** 15–20 minutos (incluindo install + login).

---

## Decisão

**Adotar Opção A — promover manualmente o deploy `2fcd5c3` na Vercel**, com **Opção D como fallback documentado** caso a UI continue intransponível.

**Justificativa técnica:**

1. **O problema é operacional, não arquitetural.** O código no commit `2fcd5c3` é o estado correto: sem `middleware.ts` (auth migrou para o layout do `(dashboard)`), `next.config.ts` com `outputFileTracingRoot` e `turbopack.root` apontando corretamente para `crm-app`, lockfiles duplicados removidos, Next 16.1.6 (versão estável, sem os bugs `#93852` e `#94052` da 16.2.6), `@swc/helpers` pinado em `0.5.15`. Qualquer alternativa que mexa em código adiciona risco sem benefício.
2. **Custo de migração > custo de aprender 3 cliques na Vercel.** Re-configurar 16 env vars (B) ou migrar de plataforma (C) introduz novos pontos de falha exatamente quando precisamos de estabilidade.
3. **Opção D resolve o mesmo problema com pior UX** para uma usuária sem DevOps. Fica como cinto-de-segurança, não como plano A.

---

## Consequências

**Positivas**
- Produção em < 15 minutos sem tocar em código.
- Mantém Vercel Cron, Preview Deployments, Edge Network, Image Optimization, SSL automático.
- Webhook Meta continua válido (URL não muda).
- Custo mensal preservado em R$ 296–504.

**Negativas / dívida técnica**
- Continuamos amarrados ao bug `#94052` da Vercel — qualquer upgrade futuro para Next 16.2.x exige re-teste de middleware/proxy. **Mitigação:** pinar `next` exatamente em `16.1.6` no `package.json` (já está) e adicionar a Next 16.2 no radar de regressão.
- Auth no layout do `(dashboard)` é menos performático que middleware (server component re-renderiza). **Mitigação:** voltar a `middleware.ts` quando Next 16.3+ corrigir o bug.

**O que perdemos ao escolher A**
- A "limpeza mental" de Opção B (mas é cosmética).
- A economia de Opção C (~R$ 50–100/mês — não justifica reescrever pipeline de deploy).

---

## Plano de Execução

### Passo a passo (Tania, na UI da Vercel)

1. Acessar https://vercel.com/dashboard → projeto **squad-tchmalhas**.
2. Aba **Deployments**.
3. Localizar o deploy do commit **`2fcd5c3`** (descrição: "fix(vercel): remover lockfiles duplicados…"). Status deve estar **"Ready"** em verde.
4. Clicar no menu **`⋯`** (três pontinhos) à direita desse deploy.
5. Clicar em **"Promote to Production"** → confirmar.
6. Aba **Settings → Domains** → reativar **"Auto-assign Domains to Production"** (toggle ON).
7. Aba **Settings → Git** → garantir que branch `main` está como **Production Branch**.

### Critérios de sucesso

```bash
# 1. Domínio deve responder 200 (não 404)
curl -I https://squad-tchmalhas.vercel.app
# Esperado: HTTP/2 200 ou 307 (redirect para /login)

# 2. Tela de login deve carregar
curl -sL https://squad-tchmalhas.vercel.app/login | grep -i "entrar\|login"
# Esperado: HTML com formulário de login

# 3. Webhook Meta deve verificar
curl "https://squad-tchmalhas.vercel.app/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=<TOKEN>&hub.challenge=teste123"
# Esperado: teste123
```

### Plano B — se a UI travar (Opção D)

```bash
cd c:\PROJETOS_CURSOR\squadTchmalhas\crm-app
npm i -g vercel
vercel login    # autenticar com mesma conta da Vercel
vercel link     # responder: existing project → squad-tchmalhas
vercel deploy --prod --yes
```

### Plano C — se ambos falharem

Escalar para Opção B (deletar + reimportar), tendo em mãos:
- Lista completa de env vars (exportar de `Settings → Environment Variables` antes de deletar).
- Verify Token Meta para reapontar o webhook.

---

## Métricas

| Métrica | Alvo |
|---|---|
| Tempo até produção (Plano A) | **≤ 15 minutos** |
| Tempo até produção (Plano B / CLI) | ≤ 30 minutos |
| Custo mensal | **R$ 296–504** (inalterado) |
| Downtime restante | 0 (deploy já está pronto, só falta promover) |

---

## Próximos ADRs Sugeridos

- **ADR-005:** Estratégia de monitoramento e alertas (Sentry vs Vercel Analytics vs Better Stack).
- **ADR-006:** Custom domain (`crm.techmalhas.com.br`) + política de DNS/SSL.
- **ADR-007:** Política de upgrade de Next.js — quando voltar a `middleware.ts` e como validar antes de promover.
- **ADR-008:** Pipeline CI/CD com GitHub Actions (lint + typecheck + test) bloqueando merge sem build verde.
