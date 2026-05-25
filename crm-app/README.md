# CRM Techmalhas

CRM próprio da **Techmalhas** — pipeline Kanban dual (Atacado/Varejo), WhatsApp Cloud API, dashboard e tarefas obrigatórias.

## Status do Projeto

| Item | Status |
|---|---|
| Código extraído do squad | ✅ 65 arquivos |
| Prisma schema + migrations | ✅ |
| Componentes shadcn/ui | ✅ |
| Servidor local (`pnpm dev`) | ⚠️ Requer `.env.local` com Supabase |
| Deploy produção | ❌ Ver `deployment-handoff.md` |

## Setup Local

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis (copiar e preencher com Supabase)
cp .env.example .env.local

# 3. Gerar Prisma Client
npx prisma generate

# 4. Aplicar migrations (requer Supabase configurado)
pnpm prisma:deploy

# 5. Seed de desenvolvimento
pnpm prisma:seed

# 6. Rodar
pnpm dev
# → http://localhost:3000/login
```

## Re-extrair código do squad

Se o squad gerar uma nova versão:

```bash
pnpm extract
# Re-executa scripts/extract-from-squad.mjs
# ⚠️ Não sobrescreve package.json (restaurar manualmente se necessário)
```

## Documentação

- **Deploy completo:** `../squads/crm-techmalhas/output/2026-05-24-162435/deployment-handoff.md`
- **Arquitetura:** `../squads/crm-techmalhas/output/2026-05-24-162435/v4/architecture.md`
- **Guia do usuário:** dentro do `deployment-handoff.md` → `docs/USER_GUIDE.md`

## Scripts

| Comando | Descrição |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm typecheck` | Verificar TypeScript |
| `pnpm prisma:studio` | Interface visual do banco |
| `pnpm extract` | Extrair código dos .md do squad |
