---
execution: subagent
agent: qa-documentation
inputFile: squads/crm-techmalhas/output/test-report.md
outputFile: squads/crm-techmalhas/output/deployment-handoff.md
model_tier: powerful
---

# Step 12: Deploy no Vercel + Documentação Completa

## Context Loading

Load these files before executing:
- `squads/crm-techmalhas/output/test-report.md` — resultados do Step 11
- `squads/crm-techmalhas/output/code/db-schema.md` — schema, comandos de setup
- `squads/crm-techmalhas/output/code/backend.md` — endpoints, .env vars
- `squads/crm-techmalhas/output/code/frontend.md` — UI, scripts
- `squads/crm-techmalhas/output/architecture.md` — plano de deploy
- `squads/crm-techmalhas/output/requirements.md` — features para os guias

## Instructions

### Process

1. **Roteiro de Deploy Vercel** — passo a passo executável:
   a. Criar conta/projeto Vercel
   b. Criar projeto Supabase
   c. Configurar variáveis de ambiente
   d. Aplicar migrations + RLS policies
   e. Configurar Meta App + Phone Number ID
   f. Configurar webhook URL no Meta Dashboard
   g. Configurar cron jobs
   h. Deploy primeiro
   i. Smoke tests pós-deploy
2. **Checklist de Variáveis de Ambiente** — todas as 12+ vars necessárias com origem (onde obter) e exemplo.
3. **README.md do projeto** — overview, setup local em 10 passos, scripts disponíveis, troubleshooting comum.
4. **Guia do Usuário** (`docs/USER_GUIDE.md`) — para Vitor e Amanda:
   - Como fazer login
   - Como criar lead manualmente
   - Como usar o Kanban (drag&drop desktop, long press mobile)
   - Como responder mensagem WhatsApp
   - Como completar tarefas
   - Como ver minhas tarefas vencidas
5. **Guia do Admin** (`docs/ADMIN_GUIDE.md`) — para Renato:
   - Gerenciar usuários (criar, atribuir role)
   - Configurar pipelines e stages
   - Configurar tarefas obrigatórias por stage
   - Conectar e configurar WhatsApp Cloud API
   - Acessar dashboards e relatórios
   - Política LGPD: como atender solicitação de exclusão
6. **Manual de Operação** (`docs/OPERATIONS.md`) — para dev/operador:
   - Monitorar logs Vercel + Supabase
   - Fazer backup manual
   - Rotacionar segredos
   - Atualizar dependências
   - Escalar planos (Supabase Free → Pro)
   - Troubleshooting de webhook Meta (assinatura inválida, rate limit)
7. **Compilar Deployment Handoff** seguindo Output Format.

## Output Format

```markdown
# Deployment Handoff — CRM Techmalhas MVP

> **TL;DR:** [Status, link de produção, contatos de suporte]

## Pré-requisitos
[Listar contas necessárias]

## Roteiro de Deploy Vercel
[Passo a passo numerado]

## Variáveis de Ambiente
[Tabela completa]

## Documentação Gerada
### README.md
\`\`\`markdown
[código completo]
\`\`\`

### docs/USER_GUIDE.md
\`\`\`markdown
[código completo]
\`\`\`

### docs/ADMIN_GUIDE.md
\`\`\`markdown
[código completo]
\`\`\`

### docs/OPERATIONS.md
\`\`\`markdown
[código completo]
\`\`\`

## Smoke Tests Pós-Deploy
[Checklist]

## Handoff para Tania
[Próximos passos: como acessar, como começar a usar]
```

## Output Example

```markdown
# Deployment Handoff — CRM Techmalhas MVP

> **TL;DR:** CRM v0.1.0 pronto para deploy. Roteiro de 9 etapas leva ao primeiro
> deploy em ~2h. Após smoke tests, Tania pode começar a usar.

## Pré-requisitos

- [ ] Conta Vercel (https://vercel.com/signup) — plano Hobby grátis serve para MVP
- [ ] Conta Supabase (https://supabase.com/dashboard/sign-in) — Free tier serve, Pro recomendado em produção
- [ ] Conta Meta Business (https://business.facebook.com/) — para WhatsApp Cloud API
- [ ] Domínio (opcional, ex: crm.techmalhas.com.br)
- [ ] Acesso ao repositório GitHub com o código

## Roteiro de Deploy

### 1. Criar Projeto Supabase
1. Login no dashboard Supabase
2. "New project" → Nome: `crm-techmalhas-prod`, Região: São Paulo (sa-east-1)
3. Anotar: `Project URL`, `anon key`, `service_role key`, `Database URL` (Pooler + Direct)

### 2. Aplicar Schema do Banco
\`\`\`bash
git clone <repo>
cd crm-techmalhas
cp .env.example .env
# Edite .env com DATABASE_URL do Supabase

pnpm install
pnpm prisma migrate deploy
psql $DIRECT_URL -f prisma/migrations/002_rls_policies.sql
psql $DIRECT_URL -f prisma/migrations/003_auth_user_trigger.sql
pnpm tsx prisma/seed.ts
\`\`\`

### 3. Configurar Meta WhatsApp Cloud API
1. https://developers.facebook.com → Meu Apps → Criar App → Business
2. Adicionar produto "WhatsApp"
3. Em "Configuração da API":
   - Anotar `Phone number ID`, `WhatsApp Business Account ID`
   - Adicionar número de teste (até 5 nesta fase)
4. Gerar `Permanent System User Access Token`:
   - Business Manager → Configurações → Usuários do sistema → Criar
   - Anotar token (NÃO compartilhar)
5. Anotar `App Secret` (para validar assinatura webhook)

### 4. Criar Projeto Vercel
1. Login Vercel → "Add New" → "Project" → Import do GitHub
2. Selecionar repositório
3. Framework: Next.js (detectado automaticamente)
4. **NÃO clicar Deploy ainda** — configurar env vars primeiro

### 5. Configurar Variáveis de Ambiente no Vercel
Em Project Settings → Environment Variables, adicionar todas as vars da tabela abaixo.

### 6. Primeiro Deploy
1. Clicar "Deploy"
2. Aguardar build (~3 min)
3. Acessar URL gerada (ex: crm-techmalhas-abc.vercel.app)
4. Tentar login com usuário do seed (admin@techmalhas.com / senha do seed)

### 7. Configurar Webhook Meta
1. Voltar para Meta Developers → WhatsApp → Configuração
2. Em "Webhook":
   - Callback URL: `https://<vercel-url>/api/v1/webhooks/whatsapp`
   - Verify Token: valor de `META_WEBHOOK_VERIFY_TOKEN`
   - Inscrever-se em `messages`
3. Meta faz GET de verificação → app responde com challenge → ✅ conectado

### 8. Configurar Domínio Custom (opcional)
1. Vercel → Settings → Domains → Add `crm.techmalhas.com.br`
2. Configurar CNAME no provedor DNS conforme instrução do Vercel
3. Aguardar propagação (até 24h)

### 9. Smoke Tests Pós-Deploy
[Ver seção Smoke Tests abaixo]

## Variáveis de Ambiente

| Variável | Onde Obter | Exemplo (não usar) | Obrigatória |
|---|---|---|---|
| DATABASE_URL | Supabase → Project Settings → Database → Connection String (Pooler) | `postgresql://postgres:xxx@aws-0-sa-east-1.pooler.supabase.com:6543/postgres` | ✅ |
| DIRECT_URL | Supabase → Direct connection | `postgresql://...:5432/postgres` | ✅ |
| NEXT_PUBLIC_SUPABASE_URL | Supabase → API → URL | `https://abc.supabase.co` | ✅ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase → API → anon public | `eyJhbGc...` | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | Supabase → API → service_role | `eyJhbGc...` | ✅ |
| META_WHATSAPP_TOKEN | Meta Business → System Users | `EAA...` | ✅ |
| META_PHONE_NUMBER_ID | Meta WhatsApp → Configuração da API | `123456789012345` | ✅ |
| META_WHATSAPP_BUSINESS_ACCOUNT_ID | Meta WhatsApp Manager | `987654321098765` | ✅ |
| META_WEBHOOK_VERIFY_TOKEN | Você define (string aleatória) | `abc123xyz789` | ✅ |
| META_APP_SECRET | Meta App → Configurações → Básico | `1a2b3c...` | ✅ |
| NEXT_PUBLIC_APP_URL | URL final do app | `https://crm.techmalhas.com.br` | ✅ |
| CRON_SECRET | Você define (proteger /api/cron/) | `xpto1234` | ✅ |

## Documentação Gerada

### `README.md` (resumo)

\`\`\`markdown
# CRM Techmalhas

CRM próprio da Techmalhas com pipeline Kanban dual (Atacado/Varejo),
integração WhatsApp Cloud API, dashboard e tarefas obrigatórias.

## Stack
Next.js 15 + TypeScript + Prisma + PostgreSQL (Supabase) + Vercel

## Setup Local (10 passos)

1. `pnpm install`
2. `cp .env.example .env` e preencher (ver docs/OPERATIONS.md)
3. `pnpm prisma migrate deploy`
4. `psql $DIRECT_URL -f prisma/migrations/002_rls_policies.sql`
5. `pnpm tsx prisma/seed.ts`
6. `pnpm dev`
7. Acesse http://localhost:3000
8. Login: `admin@techmalhas.com` / `Admin123!` (do seed)
9. (Opcional) Use ngrok para testar webhook WhatsApp localmente
10. Comece a brincar!

## Scripts
- `pnpm dev` — dev server
- `pnpm build` — build produção
- `pnpm test` — unit + integration
- `pnpm test:e2e` — Playwright
- `pnpm lint` / `pnpm typecheck`

## Troubleshooting
- Erro "DATABASE_URL não definido" → revise `.env`
- Migration falha → verifique se `DIRECT_URL` está setado
- Webhook Meta não responde → checar `META_WEBHOOK_VERIFY_TOKEN` em ambos lados

## Documentação
- Usuário final: `docs/USER_GUIDE.md`
- Administrador: `docs/ADMIN_GUIDE.md`
- Operação: `docs/OPERATIONS.md`
\`\`\`

### `docs/USER_GUIDE.md` (trecho)

\`\`\`markdown
# Guia do Usuário — CRM Techmalhas

> Manual para vendedores (Vitor) e atendentes (Amanda).

## Sumário
1. Como fazer login
2. Como criar um lead manualmente
3. Como usar o Kanban
4. Como responder uma mensagem do WhatsApp
5. Como completar tarefas
6. Como ver minhas tarefas vencidas

## 1. Como fazer login
[Passo a passo simples]

## 3. Como usar o Kanban

### No computador
1. No menu superior, clique em "Pipeline".
2. Escolha "Atacado" ou "Varejo" no seletor à esquerda.
3. Para mover um deal: clique e arraste o card para a coluna destino.
4. Solte. O deal aparece na nova coluna.

### No celular
1. Abra o CRM no navegador.
2. Acesse "Pipeline" no menu.
3. Toque e segure o card (1 segundo).
4. Aparece menu com opção "Mover para...".
5. Escolha a etapa destino.

### Quando a movimentação é bloqueada
Se aparecer mensagem vermelha "Tarefa obrigatória pendente":
1. Toque no card do deal.
2. Role até "Tarefas obrigatórias".
3. Toque "Concluir" em cada tarefa pendente.
4. Volte e tente mover novamente.

[Seguem outras seções]
\`\`\`

[ADMIN_GUIDE.md e OPERATIONS.md com a mesma profundidade]

## Smoke Tests Pós-Deploy

- [ ] Login com usuário do seed funciona
- [ ] /pipeline renderiza Kanban com colunas e cards
- [ ] Drag&drop entre colunas funciona (desktop)
- [ ] Mover deal com mandatory task pendente é bloqueado
- [ ] Webhook Meta responde 200 ao POST de teste
- [ ] Cron de overdue executa às 06:00 (verificar próximo dia)
- [ ] Audit logs aparecem após criação de lead
- [ ] RLS impede vendedor de ver leads de outro vendedor

## Handoff para Tania

🎉 **O CRM está pronto para você usar!**

**Próximos passos:**
1. Acesse `https://crm.techmalhas.com.br` (após deploy)
2. Login com sua credencial admin (criada via Supabase Auth)
3. Convide os primeiros usuários: Renato (gestor), Vitor (vendedor)
4. Importe os primeiros contatos manualmente
5. Configure as tarefas obrigatórias por stage conforme seu processo
6. Conecte o número WhatsApp oficial
7. Comece a operar!

**Documentos para revisar:**
- `docs/USER_GUIDE.md` — passe para Vitor e Amanda
- `docs/ADMIN_GUIDE.md` — leia inteiro
- `docs/OPERATIONS.md` — guarde para emergências

**Custo mensal estimado:** US$45-60 (Vercel + Supabase + WhatsApp)
**Próxima evolução (Backlog v2):** integração Dapic, distribuição automática de leads, campanhas em massa.
```

## Veto Conditions

Reject and redo if ANY are true:
1. Variável de ambiente sem origem documentada (onde obter)
2. README sem comando de setup executável do zero em <10 passos
3. Guia do usuário com jargão técnico ("endpoint", "RLS")
4. Sem smoke tests pós-deploy
5. Sem instruções específicas para Meta Cloud API (webhook URL, verify token)

## Quality Criteria

- [ ] Roteiro Vercel passo a passo (9+ etapas)
- [ ] Tabela completa de env vars com origem
- [ ] README com setup em <10 passos
- [ ] USER_GUIDE para Vitor/Amanda em linguagem acessível
- [ ] ADMIN_GUIDE para Renato (RBAC, WhatsApp, LGPD)
- [ ] OPERATIONS para dev (logs, backup, escalar)
- [ ] Smoke tests pós-deploy
- [ ] Handoff claro para Tania
