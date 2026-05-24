# Deployment Handoff — CRM Techmalhas MVP

> **TL;DR:** CRM v0.1.0 aprovado na suite de testes (79/79 ✅). Roteiro de 9 etapas leva ao
> primeiro deploy funcional em ~2h. Após smoke tests, a equipe Techmalhas pode começar a usar.
> Custo mensal estimado: R$ 296–R$ 504/mês.

---

## Pré-requisitos

| Conta/Recurso | Link | Plano | Custo |
|---|---|---|---|
| ✅ Vercel | https://vercel.com/signup | Pro (para Cron Jobs) | ~R$ 104/mês |
| ✅ Supabase | https://supabase.com | Pro (para produção) | ~R$ 130/mês |
| ✅ Meta Business Manager | https://business.facebook.com | Gratuito | — |
| ✅ Conta WhatsApp Business | Meta API | Pay-as-you-go | R$ 52–260/mês |
| ✅ GitHub | https://github.com | Free | — |
| ✅ Domínio (opcional) | ex: crm.techmalhas.com.br | — | ~R$ 10/mês |

---

## Roteiro de Deploy Vercel (9 etapas)

### Etapa 1 — Criar Projeto Supabase (10 min)

```
1. Acesse https://supabase.com/dashboard
2. Clique "New project"
3. Preencha:
   - Nome: crm-techmalhas-prod
   - Senha do banco: [gere uma senha forte e ANOTE]
   - Região: South America (São Paulo) — sa-east-1
4. Aguarde ~2 minutos para o projeto ser criado
5. Anote (serão usados nas etapas seguintes):
   - Project URL: https://XXXX.supabase.co
   - anon public key: eyJ... (Settings > API > Project API keys)
   - service_role key: eyJ... (Settings > API > Project API keys) ⚠️ NUNCA expor
   - Database URL (Pooler): postgresql://...supabase.com:6543/postgres (Settings > Database > Connection String > Transaction)
   - Database URL (Direct): postgresql://...supabase.co:5432/postgres (Settings > Database > Connection String > Direct)
```

---

### Etapa 2 — Aplicar Schema no Banco (15 min)

```bash
# Em um terminal, na raiz do projeto:
git clone <url-do-repositorio>
cd crm-techmalhas

# Instalar dependências
pnpm install

# Copiar .env de exemplo e preencher
cp .env.example .env

# ── Editar .env com os valores da Etapa 1 ──────────────────
# DATABASE_URL = URL do Pooler (porta 6543) + ?connection_limit=1&pool_timeout=0
# DIRECT_URL   = URL Direct (porta 5432)
# NEXT_PUBLIC_SUPABASE_URL = Project URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY = anon key
# SUPABASE_SERVICE_ROLE_KEY = service_role key

# Aplicar migrations
pnpm prisma migrate deploy

# Aplicar RLS e trigger (via psql ou Supabase SQL Editor)
# Opção A — psql (se tiver instalado):
psql "$DIRECT_URL" -f prisma/migrations/002_rls_policies.sql
psql "$DIRECT_URL" -f prisma/migrations/003_auth_user_trigger.sql

# Opção B — Supabase SQL Editor (mais fácil):
# 1. Vá em https://supabase.com/dashboard > seu projeto > SQL Editor
# 2. Cole o conteúdo de prisma/migrations/002_rls_policies.sql → Run
# 3. Cole o conteúdo de prisma/migrations/003_auth_user_trigger.sql → Run
```

---

### Etapa 3 — Configurar Meta WhatsApp Cloud API (30 min)

```
1. Acesse https://developers.facebook.com
2. "Meus Apps" → "Criar App" → selecione "Business"
3. Nome: "CRM Techmalhas" | E-mail: tmrodriguestechmalhas@gmail.com
4. No painel do app, clique "Adicionar produto" → "WhatsApp" → "Configurar"

5. Em "Introdução à API":
   - Anote: Phone number ID (ex: 123456789012345)
   - Anote: WhatsApp Business Account ID (ex: 987654321098765)
   - Teste enviando mensagem para número de teste

6. Criar System User Token (token permanente — não expira):
   a. Meta Business Suite > Configurações > Usuários do sistema
   b. "Adicionar" → Nome: "CRM Bot" → Tipo: Admin
   c. Após criar: "Gerar novo token"
   d. Selecionar: WhatsApp Business Messaging > permissões whatsapp_business_messaging
   e. Copiar e GUARDAR O TOKEN (só aparece uma vez!)

7. Anotar App Secret:
   a. No painel do App → Configurações → Básico
   b. Mostrar "Chave Secreta do App" → copiar

8. Definir WEBHOOK VERIFY TOKEN (você escolhe):
   Ex: "techmalhas-webhook-2026-secure"
   ⚠️ Guarde este valor — será usado no Meta Dashboard e no .env
```

---

### Etapa 4 — Criar Projeto no Vercel (5 min)

```
1. Acesse https://vercel.com
2. "Add New" → "Project"
3. Conecte com GitHub se ainda não conectou
4. "Import" no repositório "crm-techmalhas"
5. Framework Preset: Next.js (detectado automaticamente)
6. ⚠️ NÃO clique "Deploy" ainda — configure as env vars primeiro (Etapa 5)
```

---

### Etapa 5 — Configurar Variáveis de Ambiente no Vercel (10 min)

```
1. No projeto Vercel → "Settings" → "Environment Variables"
2. Adicione TODAS as variáveis abaixo:
   (Use "Add" para cada uma, Environment: Production + Preview + Development)
```

#### Tabela Completa de Variáveis de Ambiente

| Variável | Onde Obter | Obrigatória |
|---|---|---|
| `DATABASE_URL` | Supabase > Settings > Database > Pooler (porta 6543). Adicionar `?connection_limit=1&pool_timeout=0` | ✅ |
| `DIRECT_URL` | Supabase > Settings > Database > Direct (porta 5432) | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Settings > API > Project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Settings > API > anon public | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API > service_role ⚠️ | ✅ |
| `META_APP_ID` | Meta App > Configurações > Básico > App ID | ✅ |
| `META_APP_SECRET` | Meta App > Configurações > Básico > Chave Secreta | ✅ |
| `META_WHATSAPP_TOKEN` | System User Token criado na Etapa 3 | ✅ |
| `META_PHONE_NUMBER_ID` | Meta WhatsApp > Configuração da API > Phone number ID | ✅ |
| `META_WABA_ID` | Meta WhatsApp > WhatsApp Business Account ID | ✅ |
| `META_WEBHOOK_VERIFY_TOKEN` | Você define (string aleatória segura) | ✅ |
| `META_INSTAGRAM_TOKEN` | Meta App > Instagram > Configuração (quando habilitado) | ⚠️ Quando IG ativo |
| `META_INSTAGRAM_ACCOUNT_ID` | Instagram Business Account ID | ⚠️ Quando IG ativo |
| `INSTAGRAM_ENABLED` | `false` (mudar para `true` após aprovação Meta) | ✅ |
| `CRON_SECRET` | Você define (string aleatória longa — mín 32 chars) | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL final do app (ex: https://crm.techmalhas.com.br) | ✅ |

---

### Etapa 6 — Primeiro Deploy (5 min)

```
1. No Vercel, clique "Deploy"
2. Aguardar build (~2-3 min — indicador de progresso no dashboard)
3. Após build: URL gerada ex: crm-techmalhas-abc.vercel.app
4. Acesse a URL — deve aparecer a tela de login
5. Se aparecer erro de build: verifique logs no Vercel > Deployments > clicar no deploy > "Build Logs"
```

---

### Etapa 7 — Configurar Webhook Meta no Dashboard (10 min)

```
1. No Meta Developers → seu App → WhatsApp → Configuração
2. Em "Webhooks":
   a. "Editar" → cole a Callback URL:
      https://<sua-url-vercel>/api/v1/webhooks/whatsapp
   b. Cole o Verify Token (o mesmo que definiu em META_WEBHOOK_VERIFY_TOKEN)
   c. Clique "Verificar e salvar"
   d. ✅ Se aparecer "Verificado": o webhook está funcionando!
   e. Ative as assinaturas: ✅ messages

3. Em "Números de telefone":
   a. Adicione o número WhatsApp oficial da Techmalhas
   b. Siga o processo de verificação (receber código via WhatsApp no número)
   c. Após verificar: o número está pronto para receber/enviar mensagens

⚠️ Limite gratuito: 1.000 conversas/mês no plano Free da Meta
   (Cada conversa dura 24h da primeira mensagem)
```

---

### Etapa 8 — Criar Usuário Admin e Configurar RBAC (10 min)

```
1. Acesse https://supabase.com/dashboard > seu projeto > Authentication > Users
2. Clique "Invite user" (ou "Add user"):
   Email: tmrodriguestechmalhas@gmail.com (ou o email desejado)
   Senha temporária: [defina uma senha forte]
3. O trigger 003 criará automaticamente o registro em public.users
4. Para definir o role como admin:
   a. Acesse SQL Editor no Supabase
   b. Execute:
      UPDATE public.users
      SET role = 'admin'
      WHERE email = 'tmrodriguestechmalhas@gmail.com';
5. Crie os demais usuários da equipe:
   - renato@techmalhas.com.br → role: gestor
   - vitor@techmalhas.com.br  → role: vendedor_atacado
   - amanda@techmalhas.com.br → role: atendente_varejo
```

---

### Etapa 9 — Domínio Custom (Opcional, 15 min + propagação DNS)

```
1. Vercel → Settings → Domains → "Add"
2. Digite: crm.techmalhas.com.br
3. Vercel mostrará os registros DNS para configurar
4. No painel do seu provedor de domínio (Registro.br, GoDaddy, etc.):
   - Adicione o registro CNAME conforme instrução do Vercel
5. Aguardar propagação DNS: até 48h (geralmente 1-2h)
6. Vercel ativa SSL/TLS automaticamente via Let's Encrypt
```

---

## Smoke Tests Pós-Deploy

Execute estes testes manualmente após cada deploy:

```
AUTENTICAÇÃO
[ ] Login com email/senha funciona → redireciona para /pipeline
[ ] Login com Google OAuth funciona (se configurado no Supabase)
[ ] Logout funciona → redireciona para /login
[ ] Rota protegida sem sessão → redireciona para /login

PIPELINE / KANBAN
[ ] /pipeline renderiza pipeline Atacado com colunas e cards
[ ] Seletor Atacado/Varejo funciona (admin/gestor)
[ ] Drag & drop de card entre colunas funciona (desktop Chrome)
[ ] Card com tarefa obrigatória pendente mostra badge ⚠️

LEADS
[ ] /leads lista contatos com paginação
[ ] Criar novo contato via formulário com LGPD: ✅
[ ] Lead aparece na lista após criar
[ ] Busca por nome funciona

WEBHOOK WHATSAPP
[ ] POST /api/v1/webhooks/whatsapp (com assinatura válida) → 200
[ ] GET /api/v1/webhooks/whatsapp (com verify token) → challenge correto
[ ] POST com assinatura inválida → 401

ENDPOINT PÚBLICO
[ ] POST /api/v1/public/leads (sem autenticação) → 201
[ ] POST sem lgpdConsent → 422
[ ] 6+ POSTs no mesmo IP em 1 min → 429 (rate limit)

CRONS
[ ] GET /api/cron/webchat-expire + Authorization: Bearer <CRON_SECRET> → 200
[ ] GET /api/cron/whatsapp-retry + Authorization: Bearer <CRON_SECRET> → 200
[ ] GET /api/cron/lgpd-purge sem Authorization → 403

DASHBOARD
[ ] /dashboard renderiza KPIs (pode ser zerado no início)
[ ] Funil de vendas renderiza com stages corretos
```

---

## Documentação Gerada

### `README.md`

```markdown
# CRM Techmalhas

Sistema de CRM próprio da Techmalhas com pipeline Kanban dual (Atacado/Varejo),
integração WhatsApp Cloud API, chat ao vivo no site, Instagram (em breve)
e dashboard de indicadores.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 + React 19 + TypeScript + TailwindCSS + shadcn/ui |
| Backend | Next.js API Routes + Zod + Prisma 6.x |
| Banco | PostgreSQL (Supabase) + RLS + Realtime |
| Auth | Supabase Auth (e-mail + Google OAuth) |
| Deploy | Vercel (Pro) + Vercel Cron |
| Integrações | Meta WhatsApp Cloud API · Instagram Messaging API (toggle) |

## Setup Local (10 passos)

```bash
# 1. Clonar repositório
git clone <url> && cd crm-techmalhas

# 2. Instalar dependências
pnpm install

# 3. Copiar e preencher variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com os dados do Supabase (veja docs/OPERATIONS.md)

# 4. Gerar Prisma Client
pnpm prisma generate

# 5. Aplicar migrations
pnpm prisma migrate deploy

# 6. Aplicar RLS policies (no Supabase SQL Editor ou via psql)
psql "$DIRECT_URL" -f prisma/migrations/002_rls_policies.sql
psql "$DIRECT_URL" -f prisma/migrations/003_auth_user_trigger.sql

# 7. Seed de desenvolvimento
pnpm tsx prisma/seed.ts

# 8. Iniciar servidor de desenvolvimento
pnpm dev

# 9. Acesse http://localhost:3000
# Login com usuário criado no Supabase Auth Dashboard

# 10. (Opcional) Abrir Prisma Studio para ver o banco
pnpm prisma studio
```

## Scripts

| Script | Descrição |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento (hot reload) |
| `pnpm build` | Build de produção |
| `pnpm start` | Servidor de produção local |
| `pnpm lint` | ESLint |
| `pnpm type-check` | TypeScript sem compilar |
| `pnpm test` | Unit + Integration (Vitest) |
| `pnpm test:e2e` | E2E (Playwright) |
| `pnpm prisma studio` | Interface visual do banco |
| `pnpm tsx prisma/seed.ts` | Re-executar seed |

## Troubleshooting

| Erro | Causa | Solução |
|---|---|---|
| "DATABASE_URL não definido" | .env.local não criado | `cp .env.example .env.local` |
| "Migration falhou" | DIRECT_URL faltando | Verifique DIRECT_URL no .env |
| Webhook 401 | Assinatura HMAC inválida | Conferir META_APP_SECRET e META_WEBHOOK_VERIFY_TOKEN |
| "P1001: Can't reach database" | URL do Supabase incorreta | Verificar DATABASE_URL no Supabase > Settings > Database |
| Login não funciona | Supabase Auth não configurado | Verificar NEXT_PUBLIC_SUPABASE_URL e ANON_KEY |

## Documentação

- Usuário final (Vitor, Amanda): `docs/USER_GUIDE.md`
- Administrador (Renato, Tania): `docs/ADMIN_GUIDE.md`
- Operação e infraestrutura: `docs/OPERATIONS.md`
- Decisões de arquitetura: `output/.../architecture.md`
```

---

### `docs/USER_GUIDE.md`

```markdown
# Guia do Usuário — CRM Techmalhas

> Para: Vitor (Vendedor Atacado) e Amanda (Atendente Varejo)
> Versão: 1.0 · Data: Maio 2026

---

## Como Fazer Login

1. Acesse **crm.techmalhas.com.br** no navegador
2. Digite seu e-mail e senha
3. Ou clique **"Google"** para entrar com sua conta Google da Techmalhas
4. Você será levado direto para o Pipeline

💡 *Esqueceu a senha? Clique "Esqueci minha senha" na tela de login.*

---

## Entendendo as Telas

| Tela | O que é | Quem usa |
|---|---|---|
| **Pipeline** | Kanban com todos os seus negócios | Todos |
| **Leads** | Lista de contatos (clientes e prospects) | Todos |
| **Chat** | Mensagens do WhatsApp, Instagram e chat do site | Amanda |
| **Tarefas** | Suas atividades do dia | Todos |
| **Dashboard** | Seus números e metas | Todos |

---

## Como Criar um Lead Manualmente

1. Clique em **"Leads"** no menu lateral
2. Clique no botão **"Novo Contato"** (canto superior direito)
3. Preencha os dados:
   - **Nome completo** ← obrigatório
   - **Telefone ou e-mail** ← precisa de pelo menos um
   - **WhatsApp** (pode ser diferente do telefone)
   - **Empresa** (para clientes B2B)
   - ✅ **Autorizo contato** ← marque sempre que o cliente concordou (LGPD)
4. Clique **"Salvar"**
5. O lead aparece na sua lista e pode ser adicionado ao Pipeline

---

## Como Usar o Kanban (Pipeline)

O Kanban é um quadro visual com colunas representando cada etapa de venda.

### No computador:
1. Acesse **"Pipeline"** no menu
2. Veja seus deals organizados por coluna
3. Para mover um deal: **clique e arraste** o card para a coluna desejada
4. Solte quando estiver na coluna certa

### No celular:
1. Toque em **"Pipeline"**
2. Para mover: **toque e segure** o card por 1 segundo
3. Aparece um menu com "Mover para..."
4. Escolha a etapa destino

### ⚠️ Quando uma tarefa bloqueia a movimentação:
Se aparecer uma janela vermelha dizendo **"Tarefas Obrigatórias Pendentes"**:
1. A etapa seguinte exige que você conclua certas atividades primeiro
2. Clique no card do deal para abrir os detalhes
3. Vá na aba **"Tarefas"**
4. Conclua cada tarefa marcando ✓
5. Volte e tente mover o deal novamente — agora vai!

---

## Como Responder uma Mensagem do WhatsApp

1. Clique em **"Chat"** no menu lateral
2. Você verá as conversas abertas — WhatsApp (verde), Instagram (rosa), Chat (azul)
3. Clique na conversa que quer responder
4. A conversa abre à direita
5. Digite sua resposta no campo de texto abaixo
6. Pressione **Enter** ou clique no botão **Enviar →**

💡 *Mensagens marcadas com ⚠️ amarelo são de leads sem consentimento LGPD.
   Peça autorização ao cliente antes de responder com ofertas.*

---

## Como Criar e Completar Tarefas

### Criar uma tarefa:
1. Abra qualquer lead em **"Leads"**
2. Na aba **"Tarefas"**, clique **"+ Nova tarefa"**
3. Preencha: título, tipo (ligação, reunião, etc.), data de vencimento
4. Clique **"Salvar"**

### Completar uma tarefa:
1. Na tarefa, clique no **círculo ○** ao lado do título
2. O círculo vira ✓ verde e a tarefa some da lista de pendentes
3. Ou vá em **"Tarefas"** no menu para ver todas de uma vez

---

## Como Ver Minhas Tarefas Vencidas

1. Clique em **"Tarefas"** no menu
2. Na aba **"Atrasadas"** você vê tudo que passou do prazo
3. Tarefas com crachá **"Obrigatória"** em vermelho precisam de atenção urgente — bloqueiam avanço no pipeline
4. No **"Dashboard"** você também vê um painel de "Atividades Atrasadas"

---

## Dicas Rápidas

| Ação | Atalho |
|---|---|
| Buscar lead | Campo de busca em "Leads" |
| Ver meus deals | Pipeline → seus cards |
| Verificar tarefas do dia | Menu "Tarefas" → aba "Hoje" |
| Ver desempenho do mês | Menu "Dashboard" |

---

## Problemas Comuns

**"Não consigo mover o deal"**
→ Verifique se há tarefas obrigatórias pendentes (badge ⚠️ no card).

**"Não vejo mensagens do WhatsApp"**
→ Apenas atendentes (Amanda) têm acesso ao Chat. Fale com o gestor.

**"Minha senha não funciona"**
→ Use "Esqueci minha senha" na tela de login, ou peça ao administrador (Renato/Tania).
```

---

### `docs/ADMIN_GUIDE.md`

```markdown
# Guia do Administrador — CRM Techmalhas

> Para: Renato (Gestor) e Tania (Admin)
> Versão: 1.0 · Data: Maio 2026

---

## Gerenciar Usuários

### Criar novo usuário:
1. Acesse **crm.techmalhas.com.br**
2. Menu → **Configurações** → **Usuários**
3. Clique **"Convidar Usuário"**
4. Preencha: nome, e-mail, perfil (role)
5. O usuário receberá e-mail de convite da Supabase

### Perfis disponíveis:

| Perfil | O que pode fazer |
|---|---|
| **Admin** (Tania) | Tudo: usuários, configurações, todos os dados |
| **Gestor** (Renato) | Ver equipe toda, configurar pipeline e tarefas, sem gestão de usuários |
| **Vendedor Atacado** (Vitor) | Pipeline Atacado, leads B2B, não vê Varejo |
| **Atendente Varejo** (Amanda) | Pipeline Varejo, chat WhatsApp/Instagram, não vê Atacado |

### Desativar usuário:
1. Configurações → Usuários
2. Localizar usuário → "Desativar conta"
3. O usuário perde acesso imediatamente; dados são preservados

---

## Configurar Pipelines e Stages

### Ver/editar stages:
1. Menu → **Configurações** → **Pipeline**
2. Selecione "Atacado" ou "Varejo"
3. Veja as colunas do Kanban com suas probabilidades
4. Para **adicionar stage**: "+ Adicionar etapa" → preencha nome e probabilidade
5. Para **reordenar**: arraste os stages
6. Para **editar**: clique no nome do stage

### Configurar Tarefas Obrigatórias por Stage:
1. Em Configurações → Pipeline, clique em um stage
2. Aba **"Tarefas Obrigatórias"**
3. "+ Nova tarefa obrigatória":
   - Título: ex. "Enviar proposta por WhatsApp"
   - Tipo: Tarefa, Ligação, Reunião, WhatsApp...
   - Prazo: dias após o deal entrar no stage (ex: 2 dias)
4. Salvar
5. Da próxima vez que um deal entrar neste stage, a tarefa é criada automaticamente

---

## Conectar WhatsApp Cloud API

### Verificar se está conectado:
1. Configurações → WhatsApp
2. Status deve mostrar "🟢 Conectado"
3. Número ativo visível

### Configurar novo número:
1. Acesse https://developers.facebook.com → seu App
2. WhatsApp → Gerenciamento de números de telefone
3. "Adicionar número" → siga o processo de verificação
4. Após verificar, o número aparece disponível no Meta
5. Atualize `META_PHONE_NUMBER_ID` nas variáveis de ambiente do Vercel
6. Re-deploy necessário para ativar novo número

### Criar template de mensagem:
Templates são necessários para enviar mensagens fora da janela de 24h.
1. Meta Business Manager → WhatsApp Manager → Modelos de mensagem
2. "Criar modelo" → categoria (Marketing, Utilidade, Autenticação)
3. Aguardar aprovação Meta (24-48h)
4. Após aprovação: disponível no CRM para envio

---

## Ativar Instagram (quando Meta aprovar)

1. Certifique-se que @techmalhas está conectado à Página do Facebook no Meta Business Manager
2. Quando a Meta aprovar o app para Instagram Messaging:
   a. Acesse Vercel → Settings → Environment Variables
   b. Altere `INSTAGRAM_ENABLED` de `false` para `true`
   c. Clique "Save" → Vercel re-deploy automaticamente (< 2 min)
3. Configure webhook Instagram no Meta Dashboard:
   - Callback URL: https://crm.techmalhas.com.br/api/v1/webhooks/instagram
   - Verify Token: mesmo valor de META_WEBHOOK_VERIFY_TOKEN
4. Mensagens do Instagram começarão a aparecer no Chat do CRM

---

## Acessar Dashboard e Relatórios

1. Menu → **Dashboard**
2. Selecione período (7 dias, 30 dias, 90 dias)
3. Para ver dados de outro vendedor (apenas gestores):
   - Filtro "Vendedor" no topo
4. KPIs disponíveis:
   - Receita total de deals ganhos
   - Taxa de conversão
   - Novos leads no período
   - Atividades concluídas vs. atrasadas
5. Funil de vendas mostra contagem por stage

---

## Política LGPD: Atender Solicitação de Exclusão

Se um cliente solicitar exclusão de seus dados (Art. 18 da LGPD):

**Processo no CRM:**
1. Pesquise o contato em "Leads"
2. Abra o perfil do contato
3. Vá em ações → "Solicitar exclusão LGPD"
4. O sistema marca `deleted_at` e, no cron mensal (1º do mês), anonimiza os dados pessoais automaticamente

**Prazo legal:** 15 dias para responder à solicitação.

**O que é anonimizado:** nome, e-mail, telefone, CPF/CNPJ, WhatsApp, Instagram.
**O que é preservado (para fins de auditoria):** histórico de interações (sem PII), deals, audit_logs.

**Para exclusão imediata (antes do cron mensal):**
Entre em contato com o desenvolvedor ou execute via Supabase SQL Editor:
```sql
UPDATE contacts SET
  full_name = 'ANONIMIZADO',
  email = NULL, phone = NULL,
  whatsapp_phone = NULL, instagram_id = NULL,
  document_cpf = NULL, document_cnpj = NULL
WHERE id = '<uuid-do-contato>';
```

---

## Solucionar Problemas Comuns (Admin)

**"Usuário não consegue fazer login"**
→ Verifique no Supabase: Authentication > Users > o e-mail está ativo?
→ Reset de senha: Authentication > Users > "Send recovery email"

**"Deals não aparecem para o vendedor"**
→ Verifique o role do usuário: deve ser vendedor_atacado ou atendente_varejo
→ Verifique se o deal tem `assigned_to` = ID do vendedor

**"WhatsApp não recebe mensagens"**
→ Verifique no Meta Developers: webhook está configurado e verificado (ícone verde)?
→ Verifique nos logs Vercel se o webhook está chegando
→ Verifique META_APP_SECRET e META_PHONE_NUMBER_ID nas env vars
```

---

### `docs/OPERATIONS.md`

```markdown
# Manual de Operação — CRM Techmalhas

> Para: Desenvolvedor / Suporte técnico
> Versão: 1.0 · Data: Maio 2026

---

## Monitoramento

### Logs Vercel
1. https://vercel.com/dashboard → seu projeto → "Logs"
2. Filtrar por função (ex: `/api/v1/webhooks/whatsapp`) e período
3. Erros 500 aparecem em vermelho
4. Para alertas automáticos: configure Vercel Integrations → Datadog ou Sentry

### Logs Supabase
1. https://supabase.com/dashboard → projeto → "Logs"
2. "Edge Functions" → para logs de Auth
3. "Postgres" → para queries lentas (slow query log)

### Métricas de uso
- Vercel: Analytics > Web Vitals (LCP, FID, CLS)
- Supabase: Reports > Database size, connections, bandwidth
- Meta: Business Manager → WhatsApp Manager → Analytics

---

## Backup

### Backup automático
- Supabase Pro inclui backups diários automáticos por 7 dias
- Acesse: Supabase Dashboard → Settings → Database → Backups

### Backup manual
```bash
# Export completo do banco (requer pg_dump)
pg_dump "$DIRECT_URL" \
  --no-acl --no-owner \
  -f backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar (CUIDADO: sobrescreve dados)
psql "$DIRECT_URL" < backup_YYYYMMDD_HHMMSS.sql
```

### O que está coberto
✅ Dados do banco (PostgreSQL)
✅ Arquivos de mídia (Supabase Storage)
❌ Variáveis de ambiente (guardar em gerenciador de senhas)
❌ Código (está no GitHub)

---

## Rotação de Segredos

### Quando rotacionar:
- Saída de membro da equipe técnica
- Suspeita de vazamento
- A cada 6 meses (boa prática)

### Procedimento:
```
1. Gerar novos valores:
   - CRON_SECRET: openssl rand -hex 32
   - META_WEBHOOK_VERIFY_TOKEN: openssl rand -hex 16

2. Atualizar no Vercel:
   Dashboard → Settings → Environment Variables → editar cada uma

3. Se rotacionar META_WEBHOOK_VERIFY_TOKEN:
   - Atualizar também no Meta Developers → WhatsApp → Configuração → Webhook
   - Meta fará nova verificação automática

4. Após atualizar todas: Vercel → Deployments → "Redeploy" no último deploy
```

---

## Escalar os Planos

### Sinais de que precisa escalar:
| Sinal | Ação |
|---|---|
| Supabase: >500 conexões simultâneas | Upgrade para Team plan ($25/mês) |
| Build timeout > 5 min no Vercel | Upgrade para Enterprise ou otimizar |
| WhatsApp: > 1.000 conversas/mês gratuitas | Começa a cobrar (R$0,28/conversa por tabela Meta) |
| Response time API > 500ms P95 | Adicionar cache ou Prisma Accelerate |

### Supabase Free → Pro:
1. Dashboard → Settings → Billing → "Upgrade to Pro"
2. Benefícios: backups diários, sem pausar idle, 8GB de storage
3. Configurar São Paulo como região

---

## Troubleshooting de Webhook Meta

### "Webhook não recebe mensagens"
```bash
# 1. Verificar se o endpoint responde
curl https://crm.techmalhas.com.br/api/v1/webhooks/whatsapp \
  "?hub.mode=subscribe&hub.verify_token=SEU_VERIFY_TOKEN&hub.challenge=teste123"
# Deve retornar: teste123

# 2. No Meta Developers → WhatsApp → Configuração → Webhook
# Deve mostrar ícone verde "Assinado"

# 3. Se mostrar erro: verificar META_WEBHOOK_VERIFY_TOKEN nas env vars do Vercel
```

### "Assinatura inválida (401)"
```bash
# Causa: META_APP_SECRET incorreto ou payload modificado em trânsito
# Verificar:
# 1. META_APP_SECRET no Vercel === App Secret no Meta Developers → Configurações → Básico
# 2. Nenhum proxy/CDN está modificando o body da request
```

### "Rate limit Meta (429)"
```bash
# WhatsApp permite 80 mensagens/segundo por número
# Se ultrapassar:
# 1. Implementar queue (Upstash QStash ou Trigger.dev)
# 2. Por ora: o cron de retry (a cada 5 min) já trata falhas automaticamente
```

---

## Atualizações de Dependências

```bash
# Verificar desatualizadas
pnpm outdated

# Atualizar dependencies menores (patch + minor)
pnpm update --recursive --latest

# ⚠️ Testar após cada update:
pnpm type-check
pnpm test
pnpm build

# Para updates de Prisma especificamente:
pnpm add @prisma/client@latest
pnpm add -D prisma@latest
pnpm prisma generate  # Regenerar client após update
```

---

## Colocar em Manutenção

```bash
# 1. Criar arquivo public/maintenance.html
# 2. Em vercel.json, adicionar:
{
  "redirects": [
    {
      "source": "/((?!maintenance).*)",
      "destination": "/maintenance.html",
      "permanent": false
    }
  ]
}
# 3. Deploy
# 4. Para remover: excluir os redirects e fazer novo deploy
```
```

---

## Handoff para Tania 🎉

### O CRM Techmalhas está pronto!

**Próximos passos para você (Tania):**

1. **Deploy:** siga o roteiro de 9 etapas acima (~2h com a primeira vez)
2. **Primeiro login:** use sua conta admin
3. **Convidar a equipe:**
   - Renato: role **Gestor**
   - Vitor: role **Vendedor Atacado**
   - Amanda: role **Atendente Varejo**
4. **Configurar tarefas obrigatórias** por stage conforme o seu processo de vendas
5. **Conectar o WhatsApp** do número oficial da Techmalhas
6. **Verificar a Página do Facebook** conectada ao @techmalhas (para Instagram)
7. **Importar primeiros contatos** via formulário ou manualmente

**Documentos para distribuir para a equipe:**
- Vitor e Amanda: `docs/USER_GUIDE.md`
- Renato: `docs/ADMIN_GUIDE.md`
- Suporte técnico: `docs/OPERATIONS.md`

**Ações pendentes (fora do CRM):**
| Ação | Responsável | Prazo |
|---|---|---|
| Verificar @techmalhas conectado à Página do Facebook no Meta Business Manager | Tania | Imediato |
| Solicitar aprovação Meta para Instagram Messaging | Tania + Dev | 2-4 semanas |
| Contatar suporte Dapic para documentação da API | Tania | Antes do v2 |
| Verificar plataforma do site techmalhas.com.br para embed do widget de chat | Dev | Antes do v2 |

**Evolução planejada:**

| Versão | Funcionalidade | Estimativa |
|---|---|---|
| v1.1 | Ativar Instagram (após aprovação Meta) | 1-2 dias de config |
| v2 | Integração Dapic ERP + rastreamento de pedidos | 4-6 semanas dev |
| v2 | App mobile (PWA ou React Native) | 8-12 semanas |
| v2 | Distribuição automática de leads | 2-3 semanas |
| v3 | Campanhas em massa (WhatsApp + e-mail) | 6-8 semanas |
| v3 | IA para respostas automáticas Instagram | 4-6 semanas |

**Custo mensal em produção:**
| Serviço | Custo |
|---|---|
| Vercel Pro | ~R$ 104/mês |
| Supabase Pro | ~R$ 130/mês |
| Meta WhatsApp | R$ 52–260/mês (volume de conversas) |
| Domínio | ~R$ 10/mês |
| **Total** | **R$ 296–504/mês** |
| *Comparativo: Clint Growth* | *R$ 800/mês* |

---

*Gerado pelo Squad Tchmalhas — Opensquad v1.0*
*Agentes: Patrícia Produto, Davi Designer, Arnaldo Arquiteto, Fábio Fullstack, Quésia Qualidade*
