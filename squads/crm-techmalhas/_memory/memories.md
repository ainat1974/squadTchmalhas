# Squad Memory: CRM Techmalhas

## Estilo de Escrita

- **Documentação:** Português (Brasil), objetiva, com exemplos práticos
- **Código:** Em inglês (variáveis, funções, comentários técnicos)
- **Comentários no código:** Em inglês, apenas onde a intenção não está óbvia
- **Mensagens de UI/UX:** Português (Brasil), tom próximo e direto
- **Commits e PRs:** Conventional Commits em inglês (`feat:`, `fix:`, `chore:`)

## Design Visual

- **Cores primárias:** A serem definidas no Step 05 (Design System) — base nas cores da identidade Techmalhas
- **Tipografia:** Inter ou Geist (sistema), legibilidade primeiro
- **Componentes:** shadcn/ui como biblioteca base, customizada com tokens Techmalhas
- **Tema:** Light mode primeiro; dark mode em fase posterior

## Estrutura de Conteúdo

- **Documentos:** sempre com TL;DR no topo, depois detalhes
- **User Stories:** formato `Como [persona], quero [ação] para [benefício]`
- **APIs:** REST + JSON, versionamento via `/api/v1/`
- **Database:** snake_case para tabelas/colunas, plural para tabelas (`leads`, `deals`)

## Proibições Explícitas

- ❌ NÃO usar JavaScript puro — sempre TypeScript com tipagem estrita
- ❌ NÃO commitar segredos (`.env*` no `.gitignore` desde o início)
- ❌ NÃO ignorar LGPD: campos pessoais devem ter consentimento + audit log
- ❌ NÃO criar features fora do MVP aprovado no Checkpoint 1
- ❌ NÃO usar bibliotecas pagas/sob licença sem aprovação da Tania
- ❌ NÃO clonar o Clint pixel-a-pixel — adaptar ao contexto Techmalhas

## Técnico (específico do squad)

- **Padrão de pasta de saída:** `output/<run_id>/v<N>/`
- **Estrutura do código gerado:** monorepo com pastas `app/`, `components/`, `lib/`, `prisma/`, `tests/`
- **ORM:** Prisma 6.x ou Drizzle (decisão do Arquiteto no Step 06)
- **Validação:** Zod em todas as rotas de API
- **WhatsApp:** Meta Cloud API com webhook em `/api/webhooks/whatsapp`
- **Integração Dapic:** webhook ou polling (decisão depende do que o Dapic expõe)
- **Auth:** Supabase Auth (e-mail + Google OAuth no MVP)
- **Roles:** admin, gestor, vendedor (RBAC simples)
- **Multitenancy:** não no MVP (uma instância para Techmalhas)

## Modelo Operacional (ADR-007 — desde 2026-05-25)

- **Fluxo:** Tania (PO) → Tutora (orquestradora) → Squad (5 especialistas + MCPs)
- **Tania nunca fala direto com agentes** — tutora é único ponto de contato
- **Tutora decide** quando executar direto (operações < 30min) vs quando delegar (decisões > 1h, implementações > 4h, validações antes de deploy)
- **Agentes especializados:**
  - 👩‍💼 `product-strategist` (Patrícia) — produto, requisitos, ROI
  - 🎨 `ux-designer` (Davi) — wireframes, design system, UX
  - 🏛️ `system-architect` (Arnaldo) — arquitetura, ADRs, decisões técnicas grandes
  - 💻 `fullstack-developer` (Fábio) — implementação (DB, API, frontend)
  - 🔬 `qa-documentation` (Quésia) — testes, QA, docs, segurança/LGPD
- **MCPs operados pela tutora:** Vercel, Supabase, n8n, Playwright/Chrome DevTools
- **Aprovações grandes:** qualquer decisão > 4h de dev ou que mexa em produção precisa de OK explícito da Tania antes da execução
- **Memória:** toda decisão importante vira `.md` em `output/YYYY-MM-DD/` ou `_memory/`
